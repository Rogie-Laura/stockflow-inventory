import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../providers/monitor_provider.dart';
import '../services/monitor_repository.dart';
import '../services/unity_ads_service.dart';
import '../theme/app_theme.dart';
import '../utils/currency.dart';
import '../widgets/monitor_stat_card.dart';

class MonitorScreen extends StatefulWidget {
  const MonitorScreen({super.key});

  @override
  State<MonitorScreen> createState() => _MonitorScreenState();
}

class _MonitorScreenState extends State<MonitorScreen>
    with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MonitorProvider>().startPolling();
      UnityAdsService.instance.showOnActiveIfReady();
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      UnityAdsService.instance.showOnActiveIfReady();
      context.read<MonitorProvider>().refresh();
    }
  }

  @override
  Widget build(BuildContext context) {
    final store = context.watch<AuthProvider>().store!;
    final monitor = context.watch<MonitorProvider>();
    final snap = monitor.snapshot;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Monitoring Center', style: TextStyle(fontSize: 18)),
            Text(
              store.storeName,
              style: TextStyle(
                fontSize: 12,
                color: Colors.white.withValues(alpha: 0.5),
                fontWeight: FontWeight.normal,
              ),
            ),
          ],
        ),
        actions: [
          _LiveBadge(),
          IconButton(
            onPressed: () => context.read<AuthProvider>().signOut(),
            icon: const Icon(Icons.logout),
            tooltip: 'Sign out',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => context.read<MonitorProvider>().refresh(),
        child: monitor.loading && snap == null
            ? const Center(child: CircularProgressIndicator())
            : ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  if (monitor.error != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Text(
                        monitor.error!,
                        style: const TextStyle(color: Colors.redAccent),
                      ),
                    ),
                  if (snap != null) ...[
                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      mainAxisSpacing: 12,
                      crossAxisSpacing: 12,
                      childAspectRatio: 1.35,
                      children: [
                        MonitorStatCard(
                          title: "Today's Sales",
                          value: formatPeso(snap.metrics.todaySales),
                          icon: Icons.payments_outlined,
                          gradient: const [
                            Color(0xFF10B981),
                            Color(0xFF14B8A6),
                          ],
                        ),
                        MonitorStatCard(
                          title: 'Transactions',
                          value: '${snap.metrics.todayTransactions}',
                          icon: Icons.receipt_long,
                          gradient: const [
                            AppTheme.indigo,
                            Color(0xFF4F46E5),
                          ],
                        ),
                        MonitorStatCard(
                          title: 'Avg Order Value',
                          value: formatPeso(snap.metrics.avgOrderValue),
                          icon: Icons.trending_up,
                          gradient: const [
                            Color(0xFF8B5CF6),
                            Color(0xFFA855F7),
                          ],
                        ),
                        MonitorStatCard(
                          title: 'Items Sold',
                          value: '${snap.metrics.itemsSoldToday}',
                          icon: Icons.shopping_bag_outlined,
                          gradient: const [
                            Color(0xFF06B6D4),
                            Color(0xFF3B82F6),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    _SectionTitle('Recent sales today'),
                    ...snap.recentSales.take(12).map(_saleTile),
                    const SizedBox(height: 20),
                    _SectionTitle('Stock alerts'),
                    if (snap.stockAlerts.isEmpty)
                      const Text('All products well stocked',
                          style: TextStyle(color: AppTheme.emerald))
                    else
                      ...snap.stockAlerts.take(10).map(_alertTile),
                    const SizedBox(height: 20),
                    _SectionTitle('Activity'),
                    ...snap.activities.map(_activityTile),
                    const SizedBox(height: 24),
                    Text(
                      'Sponsored messages play on open via Unity Ads.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.white.withValues(alpha: 0.35),
                      ),
                    ),
                  ],
                ],
              ),
      ),
    );
  }

  Widget _saleTile(SaleRow sale) {
    final time = DateFormat.jm().format(sale.createdAt.toLocal());
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        title: Text(sale.receiptNo),
        subtitle: Text('$time · ${sale.paymentMethod} · ${sale.itemCount} items'),
        trailing: Text(
          formatPeso(sale.total),
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
    );
  }

  Widget _alertTile(StockAlert alert) {
    final color = alert.status == 'out_of_stock'
        ? Colors.redAccent
        : Colors.amber;
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Text(alert.image, style: const TextStyle(fontSize: 24)),
        title: Text(alert.name),
        subtitle: Text('${alert.quantity} units left'),
        trailing: Icon(Icons.warning_amber_rounded, color: color, size: 20),
      ),
    );
  }

  Widget _activityTile(ActivityRow activity) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        '${activity.message}\n${DateFormat.yMMMd().add_jm().format(activity.timestamp.toLocal())}',
        style: TextStyle(
          fontSize: 13,
          color: Colors.white.withValues(alpha: 0.75),
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Text(
        text,
        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
      ),
    );
  }
}

class _LiveBadge extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: AppTheme.emerald.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(999),
            border: Border.all(color: AppTheme.emerald.withValues(alpha: 0.35)),
          ),
          child: const Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.circle, size: 8, color: AppTheme.emerald),
              SizedBox(width: 6),
              Text('LIVE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ),
    );
  }
}
