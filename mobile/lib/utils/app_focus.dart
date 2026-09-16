import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

class AppFocus {
  AppFocus._();

  static const _channel = MethodChannel('ph.pinoystock.pinoystock_monitor/app');

  static Future<void> bringToFront() async {
    if (kIsWeb || defaultTargetPlatform != TargetPlatform.android) return;

    try {
      await _channel.invokeMethod<void>('bringToFront');
    } catch (_) {}
  }
}
