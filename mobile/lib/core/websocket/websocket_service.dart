import 'dart:async';
import 'dart:convert';
import 'package:flutter/widgets.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import '../storage/secure_storage_service.dart';

typedef TickerCallback = void Function(Map<String, dynamic> ticker);
typedef OrderBookCallback = void Function(Map<String, dynamic> orderBook);
typedef OrderExecutionCallback = void Function(Map<String, dynamic> execution);

class WebSocketService with WidgetsBindingObserver {
  final String wsUrl;
  final SecureStorageService storage;

  WebSocketChannel? _channel;
  StreamSubscription? _subscription;
  bool _isDisposed = false;
  String _currentSymbol = 'BTCUSDT';

  // Listeners
  final List<TickerCallback> _tickerListeners = [];
  final List<OrderBookCallback> _orderBookListeners = [];
  final List<OrderExecutionCallback> _executionListeners = [];

  WebSocketService({
    this.wsUrl = 'ws://10.0.2.2:8080/ws',
    SecureStorageService? storage,
  }) : storage = storage ?? SecureStorageService() {
    WidgetsBinding.instance.addObserver(this);
    connect();
  }

  void addTickerListener(TickerCallback listener) => _tickerListeners.add(listener);
  void removeTickerListener(TickerCallback listener) => _tickerListeners.remove(listener);

  void addOrderBookListener(OrderBookCallback listener) => _orderBookListeners.add(listener);
  void removeOrderBookListener(OrderBookCallback listener) => _orderBookListeners.remove(listener);

  void addExecutionListener(OrderExecutionCallback listener) => _executionListeners.add(listener);
  void removeExecutionListener(OrderExecutionCallback listener) => _executionListeners.remove(listener);

  Future<void> connect() async {
    if (_isDisposed) return;
    disconnect();

    try {
      final token = await storage.getAccessToken();
      final uri = token != null ? Uri.parse('$wsUrl?token=$token') : Uri.parse(wsUrl);

      _channel = WebSocketChannel.connect(uri);

      _subscription = _channel!.stream.listen(
        (message) {
          _handleMessage(message);
        },
        onError: (err) {
          _reconnectLater();
        },
        onDone: () {
          _reconnectLater();
        },
      );

      // Subscribe to default symbol
      subscribeToSymbol(_currentSymbol);
    } catch (_) {
      _reconnectLater();
    }
  }

  void subscribeToSymbol(String symbol) {
    _currentSymbol = symbol;
    if (_channel != null) {
      _channel!.sink.add(jsonEncode({
        'action': 'subscribe',
        'topic': 'ticker:$symbol',
      }));
      _channel!.sink.add(jsonEncode({
        'action': 'subscribe',
        'topic': 'orderbook:$symbol',
      }));
    }
  }

  void _handleMessage(dynamic rawMessage) {
    try {
      final envelope = jsonDecode(rawMessage.toString());
      if (envelope is! Map) return;

      final topic = envelope['topic'] as String?;
      final payload = envelope['payload'];

      if (topic == null || payload == null) return;

      if (topic.startsWith('ticker:')) {
        for (var listener in _tickerListeners) {
          listener(Map<String, dynamic>.from(payload));
        }
      } else if (topic.startsWith('orderbook:')) {
        for (var listener in _orderBookListeners) {
          listener(Map<String, dynamic>.from(payload));
        }
      } else if (topic.startsWith('user:order_executed')) {
        for (var listener in _executionListeners) {
          listener(Map<String, dynamic>.from(payload));
        }
      }
    } catch (_) {}
  }

  void disconnect() {
    _subscription?.cancel();
    _subscription = null;
    _channel?.sink.close();
    _channel = null;
  }

  void _reconnectLater() {
    if (_isDisposed) return;
    Future.delayed(const Duration(seconds: 3), () {
      if (!_isDisposed) connect();
    });
  }

  // App Lifecycle handler:
  // Disconnect on background to conserve battery/network, auto-reconnect on foreground!
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    switch (state) {
      case AppLifecycleState.paused:
      case AppLifecycleState.inactive:
      case AppLifecycleState.detached:
        // App went to background
        disconnect();
        break;
      case AppLifecycleState.resumed:
        // App resumed to foreground
        connect();
        break;
      default:
        break;
    }
  }

  void dispose() {
    _isDisposed = true;
    WidgetsBinding.instance.removeObserver(this);
    disconnect();
  }
}
