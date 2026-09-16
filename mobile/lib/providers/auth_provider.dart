import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../services/account_login_service.dart';
import '../services/monitor_repository.dart';

class AuthProvider extends ChangeNotifier {
  AuthProvider(this._repo, {AccountLoginService? accountLogin})
      : _accountLogin = accountLogin ?? AccountLoginService();

  final MonitorRepository _repo;
  final AccountLoginService _accountLogin;

  StoreContext? _store;
  bool _loading = false;
  bool _bootstrapping = true;
  String? _error;

  StoreContext? get store => _store;
  bool get loading => _loading;
  bool get bootstrapping => _bootstrapping;
  String? get error => _error;
  bool get isLoggedIn => Supabase.instance.client.auth.currentSession != null;

  Future<void> bootstrap() async {
    _bootstrapping = true;
    notifyListeners();
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) {
        _store = null;
        return;
      }
      await _loadStore(user.id);
    } finally {
      _bootstrapping = false;
      notifyListeners();
    }
  }

  Future<String?> signInWithAccountNumber(String accountNumber) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      await _accountLogin.signInWithAccountNumber(accountNumber);
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) return 'Login failed';
      await _loadStore(user.id);
      return null;
    } on AuthException catch (e) {
      _error = e.message;
      return e.message;
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
      return _error;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> signOut() async {
    await Supabase.instance.client.auth.signOut();
    _store = null;
    notifyListeners();
  }

  Future<void> _loadStore(String userId) async {
    _store = await _repo.fetchStoreContext(userId);
    notifyListeners();
  }
}
