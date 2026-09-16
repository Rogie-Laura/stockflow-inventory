import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../services/monitor_repository.dart';

class AuthProvider extends ChangeNotifier {
  AuthProvider(this._repo);

  final MonitorRepository _repo;

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

  Future<String?> signInWithAccountNumber(
    String accountNumber,
    String password,
  ) async {
    final trimmed = accountNumber.trim();
    if (trimmed.isEmpty) {
      return 'Ilagay ang account number mula sa web (avatar menu).';
    }

    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final email = await Supabase.instance.client.rpc(
        'inv_lookup_monitor_login',
        params: {'p_account_number': trimmed},
      );
      if (email == null || (email is String && email.isEmpty)) {
        return 'Hindi valid ang account number o walang Monitor access.';
      }
      await Supabase.instance.client.auth.signInWithPassword(
        email: email as String,
        password: password,
      );
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) return 'Login failed';
      await _loadStore(user.id);
      return null;
    } on AuthException catch (e) {
      _error = e.message;
      return e.message;
    } catch (e) {
      _error = e.toString();
      return _error;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<String?> signIn(String email, String password) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      await Supabase.instance.client.auth.signInWithPassword(
        email: email.trim(),
        password: password,
      );
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) return 'Login failed';
      await _loadStore(user.id);
      return null;
    } on AuthException catch (e) {
      _error = e.message;
      return e.message;
    } catch (e) {
      _error = e.toString();
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
