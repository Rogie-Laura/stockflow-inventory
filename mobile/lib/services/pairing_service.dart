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

    var apiBase = uri.queryParameters['api']?.trim();
    if (apiBase == null || apiBase.isEmpty) {
      if (uri.scheme == 'pinoystockmonitor') {
        apiBase = EnvConfig.pairApiBase;
      } else if (uri.scheme == 'http' || uri.scheme == 'https') {
        apiBase = uri.origin;
      }
    }

    if (apiBase == null || apiBase.isEmpty) return null;

    return PairQrPayload(code: code.toUpperCase(), apiBase: apiBase);
  }

  Future<void> exchangeAndSignIn(PairQrPayload payload) async {
    final uri = Uri.parse('${payload.apiBase}/api/mobile/pair/exchange');
    final response = await _client.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'code': payload.code}),
    );

    if (response.statusCode != 200) {
      final body = response.body;
      throw Exception(
        'Pairing failed (${response.statusCode}): $body',
      );
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
}

class PairQrPayload {
  PairQrPayload({required this.code, required this.apiBase});

  final String code;
  final String apiBase;
}
