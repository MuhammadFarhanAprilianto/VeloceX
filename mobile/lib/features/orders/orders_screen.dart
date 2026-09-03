import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  List<dynamic> _orders = [];
  String _selectedFilter = 'ALL'; // 'ALL', 'OPEN', 'FILLED', 'CANCELLED'
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchOrders();
  }

  Future<void> _fetchOrders() async {
    setState(() => _isLoading = true);
    final api = ApiClient();
    try {
      final res = await api.get('/orders?limit=40');
      if (mounted) {
        setState(() {
          _orders = (res['orders'] as List?) ?? [];
        });
      }
    } catch (_) {
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _cancelOrder(String orderId) async {
    final api = ApiClient();
    try {
      await api.delete('/orders/$orderId');
      _fetchOrders();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: Color(0xFF10B981),
            content: Text('Order cancelled successfully'),
          ),
        );
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
    }
  }

  List<dynamic> get _filteredOrders {
    if (_selectedFilter == 'ALL') return _orders;
    return _orders.where((o) => o['status'] == _selectedFilter).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF070A12),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0B0F19),
        elevation: 0,
        title: const Text(
          'Orders & History',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white70),
            onPressed: _fetchOrders,
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Chips Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: const Color(0xFF0B0F19),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: ['ALL', 'OPEN', 'FILLED', 'CANCELLED'].map((f) {
                  final isSelected = _selectedFilter == f;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text(f),
                      selected: isSelected,
                      selectedColor: const Color(0xFF10B981).withOpacity(0.2),
                      backgroundColor: const Color(0xFF101624),
                      labelStyle: TextStyle(
                        color: isSelected ? const Color(0xFF10B981) : Colors.white60,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        fontSize: 11,
                      ),
                      side: BorderSide(
                        color: isSelected ? const Color(0xFF10B981) : Colors.white.withOpacity(0.08),
                      ),
                      onSelected: (_) => setState(() => _selectedFilter = f),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          // Orders List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF10B981)))
                : _filteredOrders.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: const [
                            Icon(Icons.receipt_long, size: 48, color: Colors.white24),
                            SizedBox(height: 12),
                            Text('No orders found', style: TextStyle(color: Colors.white54)),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(14),
                        itemCount: _filteredOrders.length,
                        itemBuilder: (context, idx) {
                          final o = _filteredOrders[idx];
                          final id = o['id'] ?? '';
                          final sym = o['symbol'] ?? '';
                          final side = o['side'] ?? 'BUY';
                          final isBuy = side == 'BUY';
                          final type = o['type'] ?? 'LIMIT';
                          final status = o['status'] ?? 'OPEN';
                          final price = (o['price'] as num?)?.toDouble() ?? 0.0;
                          final amount = (o['amount'] as num?)?.toDouble() ?? 0.0;
                          final filled = (o['filled_amount'] as num?)?.toDouble() ?? 0.0;
                          final isOpen = status == 'OPEN' || status == 'PARTIALLY_FILLED';

                          return Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: const Color(0xFF101624),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: Colors.white.withOpacity(0.05)),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: isBuy
                                            ? const Color(0xFF10B981).withOpacity(0.15)
                                            : const Color(0xFFF43F5E).withOpacity(0.15),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        side,
                                        style: TextStyle(
                                          color: isBuy ? const Color(0xFF10B981) : const Color(0xFFF43F5E),
                                          fontWeight: FontWeight.bold,
                                          fontSize: 11,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      sym,
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 14,
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      type,
                                      style: const TextStyle(color: Colors.white38, fontSize: 11),
                                    ),
                                    const Spacer(),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: Colors.white.withOpacity(0.06),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        status,
                                        style: TextStyle(
                                          color: status == 'FILLED'
                                              ? const Color(0xFF10B981)
                                              : status == 'CANCELLED'
                                                  ? Colors.white38
                                                  : Colors.amber,
                                          fontSize: 10,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Text('Price (USDT)', style: TextStyle(color: Colors.white38, fontSize: 10)),
                                        const SizedBox(height: 2),
                                        Text(
                                          '\$${price.toStringAsFixed(2)}',
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontFamily: 'monospace',
                                            fontWeight: FontWeight.w600,
                                            fontSize: 13,
                                          ),
                                        ),
                                      ],
                                    ),
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Text('Amount', style: TextStyle(color: Colors.white38, fontSize: 10)),
                                        const SizedBox(height: 2),
                                        Text(
                                          amount.toStringAsFixed(4),
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontFamily: 'monospace',
                                            fontWeight: FontWeight.w600,
                                            fontSize: 13,
                                          ),
                                        ),
                                      ],
                                    ),
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.end,
                                      children: [
                                        const Text('Filled', style: TextStyle(color: Colors.white38, fontSize: 10)),
                                        const SizedBox(height: 2),
                                        Text(
                                          filled.toStringAsFixed(4),
                                          style: const TextStyle(
                                            color: Colors.white70,
                                            fontFamily: 'monospace',
                                            fontWeight: FontWeight.w600,
                                            fontSize: 13,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                if (isOpen) ...[
                                  const SizedBox(height: 12),
                                  Align(
                                    alignment: Alignment.centerRight,
                                    child: OutlinedButton(
                                      onPressed: () => _cancelOrder(id),
                                      style: OutlinedButton.styleFrom(
                                        foregroundColor: const Color(0xFFF43F5E),
                                        side: BorderSide(color: const Color(0xFFF43F5E).withOpacity(0.5)),
                                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                      ),
                                      child: const Text('Cancel Order', style: TextStyle(fontSize: 11)),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
