import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';

import '../utils/env_config.dart';

class AccountLoginService {
  AccountLoginService({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;

  static String? normalizeAccountNumber(String raw) {
    final normalized =
        raw.trim().toUpperCase().replaceAll(RegExp(r'[^A-Z0-9]'), '');
    if (normalized.length != 10) return null;
    return normalized;
  }

  /// Account QR, plain 10-char code, or web URL with ?n=
  static String? parseAccountFromQr(String raw) {
    final trimmed = raw.trim();
    if (trimmed.isEmpty) return null;

    final uri = Uri.tryParse(trimmed);
    if (uri != null) {
      if (uri.scheme == 'pinoystockmonitor' && uri.host == 'login') {
        return normalizeAccountNumber(uri.queryParameters['n'] ?? '');
      }
      final fromQuery = uri.queryParameters['n'];
      if (fromQuery != null && fromQuery.isNotEmpty) {
        return normalizeAccountNumber(fromQuery);
      }
    }

    return normalizeAccountNumber(trimmed);
  }

  Future<void> signInWithAccountNumber(String accountNumber) async {
    final normalized = normalizeAccountNumber(accountNumber);
    if (normalized == null) {
      throw Exception('Account number: 10 letters at numbers.');
    }

    final supabaseUrl = EnvConfig.supabaseUrl.replaceAll(RegExp(r'/+$'), '');
    final anon = EnvConfig.supabaseAnonKey;
    if (supabaseUrl.isEmpty || anon.isEmpty) {
      throw Exception('Missing Supabase config sa app.');
    }

    final uri = Uri.parse('$supabaseUrl/functions/v1/mobile-account-login');
    final response = await _client.post(
      uri,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $anon',
        'apikey': anon,
      },
      body: jsonEncode({'accountNumber': normalized}),
    );

    if (response.statusCode != 200) {
      throw Exception(_errorMessage(response));
    }

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    final email = data['email'] as String?;
    final token = data['token'] as String?;
    if (email == null || token == null) {
      throw Exception('Invalid login response');
    }

    await Supabase.instance.client.auth.verifyOTP(
      email: email,
      token: token,
      type: OtpType.magiclink,
    );
  }

  String _errorMessage(http.Response response) {
    try {
      final map = jsonDecode(response.body) as Map<String, dynamic>;
      final err = map['error']?.toString();
      if (err != null && err.isNotEmpty) return err;
    } catch (_) {}
    return 'Login failed (${response.statusCode})';
  }
}
