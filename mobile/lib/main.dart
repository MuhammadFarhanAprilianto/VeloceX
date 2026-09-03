import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/websocket/websocket_service.dart';
import 'features/auth/auth_provider.dart';
import 'features/portfolio/portfolio_screen.dart';
import 'features/trade/trade_screen.dart';
import 'features/orders/orders_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const VeloceXMobileApp());
}

class VeloceXMobileApp extends StatefulWidget {
  const VeloceXMobileApp({super.key});

  @override
  State<VeloceXMobileApp> createState() => _VeloceXMobileAppState();
}

class _VeloceXMobileAppState extends State<VeloceXMobileApp> {
  late final WebSocketService _wsService;

  @override
  void initState() {
    super.initState();
    _wsService = WebSocketService();
  }

  @override
  void dispose() {
    _wsService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()..checkAuthStatus()),
      ],
      child: MaterialApp(
        title: 'VeloceX Mobile',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          brightness: Brightness.dark,
          scaffoldBackgroundColor: const Color(0xFF070A12),
          primaryColor: const Color(0xFF10B981),
          colorScheme: const ColorScheme.dark(
            primary: Color(0xFF10B981),
            secondary: Color(0xFF06B6D4),
            surface: Color(0xFF101624),
          ),
          fontFamily: 'Roboto',
        ),
        home: MainNavigation(wsService: _wsService),
      ),
    );
  }
}

class MainNavigation extends StatefulWidget {
  final WebSocketService wsService;

  const MainNavigation({super.key, required this.wsService});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final screens = [
      PortfolioScreen(onNavigateToTrade: () => setState(() => _currentIndex = 1)),
      TradeScreen(wsService: widget.wsService),
      const OrdersScreen(),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Color(0xFF0B0F19),
          border: Border(top: BorderSide(color: Color(0xFF161F33))),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (idx) => setState(() => _currentIndex = idx),
          backgroundColor: const Color(0xFF0B0F19),
          selectedItemColor: const Color(0xFF10B981),
          unselectedItemColor: Colors.white38,
          selectedFontSize: 12,
          unselectedFontSize: 11,
          type: BottomNavigationBarType.fixed,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.pie_chart_outline),
              activeIcon: Icon(Icons.pie_chart),
              label: 'Portfolio',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.candlestick_chart_outlined),
              activeIcon: Icon(Icons.candlestick_chart),
              label: 'Trade',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.receipt_long_outlined),
              activeIcon: Icon(Icons.receipt_long),
              label: 'Orders',
            ),
          ],
        ),
      ),
    );
  }
}
