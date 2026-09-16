import 'dart:async';

import 'package:flutter/foundation.dart';

import '../services/monitor_repository.dart';

class MonitorProvider extends ChangeNotifier {
  MonitorProvider(this._repo, this._storeId);

  final MonitorRepository _repo;
  final String _storeId;

  MonitorSnapshot? _snapshot;
  bool _loading = true;
  String? _error;
  Timer? _poll;

  MonitorSnapshot? get snapshot => _snapshot;
  bool get loading => _loading;
  String? get error => _error;

  void startPolling() {
    refresh();
    _poll?.cancel();
    _poll = Timer.periodic(const Duration(seconds: 15), (_) => refresh());
  }

  @override
  void dispose() {
    _poll?.cancel();
    super.dispose();
  }

  Future<void> refresh() async {
    try {
      _snapshot = await _repo.fetchSnapshot(_storeId);
      _error = null;
    } catch (e) {
      _error = e.toString();
    } finally {
      _loading = false;
      notifyListeners();
    }
  }
}
