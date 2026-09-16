import 'package:supabase_flutter/supabase_flutter.dart';

class StoreContext {
  StoreContext({
    required this.storeId,
    required this.storeName,
    required this.role,
  });

  final String storeId;
  final String storeName;
  final String role;

  bool get canUseMonitor =>
      role == 'store_admin' || role == 'supervisor';
}

class MonitorMetrics {
  MonitorMetrics({
    required this.todaySales,
    required this.todayTransactions,
    required this.avgOrderValue,
    required this.itemsSoldToday,
  });

  final double todaySales;
  final int todayTransactions;
  final double avgOrderValue;
  final int itemsSoldToday;
}

class SaleRow {
  SaleRow({
    required this.id,
    required this.receiptNo,
    required this.total,
    required this.createdAt,
    required this.paymentMethod,
    required this.itemCount,
  });

  final String id;
  final String receiptNo;
  final double total;
  final DateTime createdAt;
  final String paymentMethod;
  final int itemCount;
}

class StockAlert {
  StockAlert({
    required this.name,
    required this.quantity,
    required this.status,
    required this.image,
  });

  final String name;
  final int quantity;
  final String status;
  final String image;
}

class ActivityRow {
  ActivityRow({
    required this.message,
    required this.timestamp,
  });

  final String message;
  final DateTime timestamp;
}

class MonitorRepository {
  MonitorRepository(this._client);

  final SupabaseClient _client;

  static const _member = 'inv_store_member';
  static const _store = 'inv_store';
  static const _sale = 'inv_sale';
  static const _saleItem = 'inv_sale_item';
  static const _item = 'inv_item';
  static const _activity = 'inv_activity';

  Future<StoreContext?> fetchStoreContext(String userId) async {
    final membership = await _client
        .from(_member)
        .select('store_id, role')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

    if (membership == null) return null;

    final storeId = membership['store_id'] as String;
    final role = membership['role'] as String;

    final store = await _client
        .from(_store)
        .select('name')
        .eq('id', storeId)
        .maybeSingle();

    return StoreContext(
      storeId: storeId,
      storeName: (store?['name'] as String?) ?? 'Store',
      role: role,
    );
  }

  Future<MonitorSnapshot> fetchSnapshot(String storeId) async {
    final today = DateTime.now();
    final start =
        DateTime(today.year, today.month, today.day).toUtc().toIso8601String();

    final salesRes = await _client
        .from(_sale)
        .select('id, receipt_no, total, created_at, payment_method, $_saleItem(quantity)')
        .eq('store_id', storeId)
        .gte('created_at', start)
        .order('created_at', ascending: false)
        .limit(40);

    final productsRes = await _client
        .from(_item)
        .select('name, quantity, min_stock, image')
        .eq('store_id', storeId);

    final activitiesRes = await _client
        .from(_activity)
        .select('message, created_at')
        .eq('store_id', storeId)
        .order('created_at', ascending: false)
        .limit(8);

    final sales = (salesRes as List<dynamic>? ?? []);
    double todayTotal = 0;
    var itemsSold = 0;
    final recentSales = <SaleRow>[];

    for (final raw in sales) {
      final s = raw as Map<String, dynamic>;
      final total = (s['total'] as num?)?.toDouble() ?? 0;
      todayTotal += total;

      final lines = (s[_saleItem] as List<dynamic>?) ?? [];
      var lineQty = 0;
      for (final line in lines) {
        lineQty += (line['quantity'] as num?)?.toInt() ?? 0;
      }
      itemsSold += lineQty;

      recentSales.add(
        SaleRow(
          id: s['id'] as String,
          receiptNo: s['receipt_no'] as String? ?? '—',
          total: total,
          createdAt: DateTime.parse(s['created_at'] as String),
          paymentMethod: s['payment_method'] as String? ?? 'cash',
          itemCount: lineQty,
        ),
      );
    }

    final txCount = sales.length;
    final metrics = MonitorMetrics(
      todaySales: todayTotal,
      todayTransactions: txCount,
      avgOrderValue: txCount > 0 ? todayTotal / txCount : 0,
      itemsSoldToday: itemsSold,
    );

    final alerts = <StockAlert>[];
    for (final raw in (productsRes as List<dynamic>? ?? [])) {
      final p = raw as Map<String, dynamic>;
      final qty = (p['quantity'] as num?)?.toInt() ?? 0;
      final minStock = (p['min_stock'] as num?)?.toInt() ?? 0;
      String status;
      if (qty == 0) {
        status = 'out_of_stock';
      } else if (qty <= minStock) {
        status = 'low_stock';
      } else {
        continue;
      }
      alerts.add(
        StockAlert(
          name: p['name'] as String? ?? '—',
          quantity: qty,
          status: status,
          image: p['image'] as String? ?? '📦',
        ),
      );
    }

    final activities = <ActivityRow>[];
    for (final raw in (activitiesRes as List<dynamic>? ?? [])) {
      final a = raw as Map<String, dynamic>;
      activities.add(
        ActivityRow(
          message: a['message'] as String? ?? '',
          timestamp: DateTime.parse(a['created_at'] as String),
        ),
      );
    }

    return MonitorSnapshot(
      metrics: metrics,
      recentSales: recentSales,
      stockAlerts: alerts,
      activities: activities,
    );
  }
}

class MonitorSnapshot {
  MonitorSnapshot({
    required this.metrics,
    required this.recentSales,
    required this.stockAlerts,
    required this.activities,
  });

  final MonitorMetrics metrics;
  final List<SaleRow> recentSales;
  final List<StockAlert> stockAlerts;
  final List<ActivityRow> activities;
}
