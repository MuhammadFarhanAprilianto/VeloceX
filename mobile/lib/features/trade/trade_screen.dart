import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/websocket/websocket_service.dart';

class TradeScreen extends StatefulWidget {
  final WebSocketService wsService;

  const TradeScreen({super.key, required this.wsService});

  @override
  State<TradeScreen> createState() => _TradeScreenState();
}

class _TradeScreenState extends State<TradeScreen> {
  String _symbol = 'BTCUSDT';
  String _side = 'BUY'; // 'BUY' or 'SELL'
  String _orderType = 'LIMIT';

  double _currentPrice = 67450.0;
  double _priceChange = 2.45;
  List<dynamic> _asks = [];
  List<dynamic> _bids = [];

  final TextEditingController _priceController = TextEditingController();
  final TextEditingController _amountController = TextEditingController();
  int _selectedPercent = 0;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _priceController.text = _currentPrice.toStringAsFixed(2);

    // Subscribe to WebSocket updates
    widget.wsService.addTickerListener(_onTickerUpdate);
    widget.wsService.addOrderBookListener(_onOrderBookUpdate);
    widget.wsService.subscribeToSymbol(_symbol);
  }

  void _onTickerUpdate(Map<String, dynamic> ticker) {
    if (ticker['symbol'] == _symbol && mounted) {
      setState(() {
        _currentPrice = (ticker['price'] as num?)?.toDouble() ?? _currentPrice;
        _priceChange = (ticker['change_percent'] as num?)?.toDouble() ?? _priceChange;
      });
    }
  }

  void _onOrderBookUpdate(Map<String, dynamic> depth) {
    if (depth['symbol'] == _symbol && mounted) {
      setState(() {
        _asks = (depth['asks'] as List?) ?? [];
        _bids = (depth['bids'] as List?) ?? [];
      });
    }
  }

  @override
  void dispose() {
    widget.wsService.removeTickerListener(_onTickerUpdate);
    widget.wsService.removeOrderBookListener(_onOrderBookUpdate);
    _priceController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  void _handlePercentSelected(int pct) {
    setState(() {
      _selectedPercent = pct;
      final totalBudget = _side == 'BUY' ? 50000.0 : 1.5;
      final execPrice = double.tryParse(_priceController.text) ?? _currentPrice;
      if (_side == 'BUY') {
        final amount = (totalBudget * (pct / 100)) / execPrice;
        _amountController.text = amount.toStringAsFixed(4);
      } else {
        final amount = totalBudget * (pct / 100);
        _amountController.text = amount.toStringAsFixed(4);
      }
    });
  }

  Future<void> _submitOrder() async {
    final amount = double.tryParse(_amountController.text);
    if (amount == null || amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter valid amount')),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    final api = ApiClient();

    try {
      final price = _orderType == 'LIMIT'
          ? (double.tryParse(_priceController.text) ?? _currentPrice)
          : _currentPrice;

      await api.post('/orders', body: {
        'symbol': _symbol,
        'side': _side,
        'type': _orderType,
        'price': price,
        'amount': amount,
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFF10B981),
            content: Text('$_side Order Placed: $amount ${_symbol.replaceAll("USDT", "")}'),
          ),
        );
        _amountController.clear();
        setState(() => _selectedPercent = 0);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFFF43F5E),
            content: Text(e.toString().replaceAll('Exception: ', '')),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isUp = _priceChange >= 0;
    final baseAsset = _symbol.replaceAll('USDT', '');

    return Scaffold(
      backgroundColor: const Color(0xFF070A12),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0B0F19),
        elevation: 0,
        title: DropdownButtonHideUnderline(
          child: DropdownButton<String>(
            value: _symbol,
            dropdownColor: const Color(0xFF101624),
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white),
            items: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'].map((s) {
              return DropdownMenuItem(value: s, child: Text(s));
            }).toList(),
            onChanged: (val) {
              if (val != null) {
                setState(() => _symbol = val);
                widget.wsService.subscribeToSymbol(val);
              }
            },
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '\$${_currentPrice.toStringAsFixed(2)}',
                  style: TextStyle(
                    color: isUp ? const Color(0xFF10B981) : const Color(0xFFF43F5E),
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                    fontSize: 15,
                  ),
                ),
                Text(
                  '${isUp ? '+' : ''}${_priceChange.toStringAsFixed(2)}%',
                  style: TextStyle(
                    color: isUp ? const Color(0xFF10B981) : const Color(0xFFF43F5E),
                    fontSize: 11,
                    fontFamily: 'monospace',
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Left: Order Action Form (Buy/Sell, Amount, Slider Chips)
          Expanded(
            flex: 6,
            child: ListView(
              padding: const EdgeInsets.all(14),
              children: [
                // Buy / Sell Selector
                Container(
                  padding: const EdgeInsets.all(3),
                  decoration: BoxDecoration(
                    color: const Color(0xFF101624),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => _side = 'BUY'),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            decoration: BoxDecoration(
                              color: _side == 'BUY' ? const Color(0xFF10B981) : Colors.transparent,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Center(
                              child: Text(
                                'Buy $baseAsset',
                                style: TextStyle(
                                  color: _side == 'BUY' ? Colors.black : Colors.white60,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => _side = 'SELL'),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            decoration: BoxDecoration(
                              color: _side == 'SELL' ? const Color(0xFFF43F5E) : Colors.transparent,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Center(
                              child: Text(
                                'Sell $baseAsset',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 12),

                // Order Type Selector
                Row(
                  children: [
                    ChoiceChip(
                      label: const Text('Limit'),
                      selected: _orderType == 'LIMIT',
                      selectedColor: const Color(0xFF1A233A),
                      backgroundColor: const Color(0xFF0F1523),
                      labelStyle: TextStyle(
                        color: _orderType == 'LIMIT' ? Colors.white : Colors.white54,
                        fontSize: 12,
                      ),
                      onSelected: (_) => setState(() => _orderType = 'LIMIT'),
                    ),
                    const SizedBox(width: 8),
                    ChoiceChip(
                      label: const Text('Market'),
                      selected: _orderType == 'MARKET',
                      selectedColor: const Color(0xFF1A233A),
                      backgroundColor: const Color(0xFF0F1523),
                      labelStyle: TextStyle(
                        color: _orderType == 'MARKET' ? Colors.white : Colors.white54,
                        fontSize: 12,
                      ),
                      onSelected: (_) => setState(() => _orderType = 'MARKET'),
                    ),
                  ],
                ),

                const SizedBox(height: 12),

                // Price Input (if Limit)
                if (_orderType == 'LIMIT') ...[
                  const Text('Price (USDT)', style: TextStyle(color: Colors.white54, fontSize: 11)),
                  const SizedBox(height: 4),
                  TextField(
                    controller: _priceController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    style: const TextStyle(color: Colors.white, fontFamily: 'monospace', fontSize: 14),
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: const Color(0xFF101624),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                ],

                // Amount Input
                Text('Amount ($baseAsset)', style: const TextStyle(color: Colors.white54, fontSize: 11)),
                const SizedBox(height: 4),
                TextField(
                  controller: _amountController,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  style: const TextStyle(color: Colors.white, fontFamily: 'monospace', fontSize: 14),
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: const Color(0xFF101624),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
                    ),
                  ),
                ),

                const SizedBox(height: 14),

                // Percentage Quick Chips
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [25, 50, 75, 100].map((pct) {
                    final isSelected = _selectedPercent == pct;
                    return InkWell(
                      onTap: () => _handlePercentSelected(pct),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? (_side == 'BUY'
                                  ? const Color(0xFF10B981).withOpacity(0.2)
                                  : const Color(0xFFF43F5E).withOpacity(0.2))
                              : const Color(0xFF101624),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: isSelected
                                ? (_side == 'BUY' ? const Color(0xFF10B981) : const Color(0xFFF43F5E))
                                : Colors.white.withOpacity(0.06),
                          ),
                        ),
                        child: Text(
                          '$pct%',
                          style: TextStyle(
                            color: isSelected
                                ? (_side == 'BUY' ? const Color(0xFF10B981) : const Color(0xFFF43F5E))
                                : Colors.white60,
                            fontWeight: FontWeight.bold,
                            fontSize: 11,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),

                const SizedBox(height: 24),

                // Submit CTA Button
                ElevatedButton(
                  onPressed: _isSubmitting ? null : _submitOrder,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _side == 'BUY' ? const Color(0xFF10B981) : const Color(0xFFF43F5E),
                    foregroundColor: _side == 'BUY' ? Colors.black : Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: Text(
                    _isSubmitting
                      ? 'Executing...'
                      : '$_side $baseAsset',
                    style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
                  ),
                ),
              ],
            ),
          ),

          // Right: Live Order Book (Asks red, Bids green)
          Container(
            width: 145,
            decoration: const BoxDecoration(
              border: Border(left: BorderSide(color: Color(0xFF1A233A))),
              color: Color(0xFF0A0E18),
            ),
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 8),
              children: [
                const Center(
                  child: Text(
                    'ORDER BOOK',
                    style: TextStyle(
                      color: Colors.white38,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1,
                    ),
                  ),
                ),
                const SizedBox(height: 6),

                // Asks (Red)
                ..._asks.take(7).map((a) {
                  final p = (a['price'] as num?)?.toDouble() ?? 0.0;
                  final amt = (a['amount'] as num?)?.toDouble() ?? 0.0;
                  return InkWell(
                    onTap: () {
                      _priceController.text = p.toStringAsFixed(2);
                    },
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2.5),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            p.toStringAsFixed(1),
                            style: const TextStyle(
                              color: Color(0xFFF43F5E),
                              fontSize: 11,
                              fontFamily: 'monospace',
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          Text(
                            amt.toStringAsFixed(3),
                            style: const TextStyle(
                              color: Colors.white54,
                              fontSize: 10,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }),

                // Mid Spread Line
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
                  child: Text(
                    '\$${_currentPrice.toStringAsFixed(1)}',
                    style: TextStyle(
                      color: isUp ? const Color(0xFF10B981) : const Color(0xFFF43F5E),
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                      fontSize: 13,
                    ),
                  ),
                ),

                // Bids (Green)
                ..._bids.take(7).map((b) {
                  final p = (b['price'] as num?)?.toDouble() ?? 0.0;
                  final amt = (b['amount'] as num?)?.toDouble() ?? 0.0;
                  return InkWell(
                    onTap: () {
                      _priceController.text = p.toStringAsFixed(2);
                    },
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2.5),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            p.toStringAsFixed(1),
                            style: const TextStyle(
                              color: Color(0xFF10B981),
                              fontSize: 11,
                              fontFamily: 'monospace',
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          Text(
                            amt.toStringAsFixed(3),
                            style: const TextStyle(
                              color: Colors.white54,
                              fontSize: 10,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
