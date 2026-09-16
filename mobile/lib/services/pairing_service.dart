import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';

import '../utils/env_config.dart';

class PairingService {
  PairingService({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;

  static PairQrPayload? parseQr(String raw) {
    final trimmed = raw.trim();
    if (trimmed.isEmpty) return null;

    final fromUrl = _parseUrl(trimmed);
    if (fromUrl != null) return fromUrl;

    try {
      final map = jsonDecode(trimmed) as Map<String, dynamic>;
      if (map['v'] != 1) return null;
      final code = map['code']?.toString().trim();
      final api = map['api']?.toString().trim();
      if (code == null || code.isEmpty || api == null || api.isEmpty) {
        return null;
      }
      return PairQrPayload(code: code.toUpperCase(), apiBase: api);
    } catch (_) {
      return null;
    }
  }

  static PairQrPayload? _parseUrl(String raw) {
    final uri = Uri.tryParse(raw);
    if (uri == null) return null;

    final code = uri.queryParameters['c']?.trim();
    if (code == null || code.isEmpty) return null;

    return PairQrPayload(code: code.toUpperCase());
  }

  Future<void> exchangeAndSignIn(PairQrPayload payload) async {
    final supabaseUrl = EnvConfig.supabaseUrl.replaceAll(RegExp(r'/+$'), '');
    final anon = EnvConfig.supabaseAnonKey;
    if (supabaseUrl.isEmpty || anon.isEmpty) {
      throw Exception('Missing Supabase config sa app.');
    }

    final uri = Uri.parse('$supabaseUrl/functions/v1/mobile-pair-exchange');
    final response = await _client.post(
      uri,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $anon',
        'apikey': anon,
      },
      body: jsonEncode({'code': payload.code}),
    );

    if (response.statusCode != 200) {
      throw Exception(_errorMessage(response));
    }

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    final email = data['email'] as String?;
    final token = data['token'] as String?;
    if (email == null || token == null) {
      throw Exception('Invalid pairing response');
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
    return 'Pairing failed (${response.statusCode})';
  }
}

class PairQrPayload {
  PairQrPayload({required this.code, this.apiBase});

  final String code;
  final String? apiBase;
}
