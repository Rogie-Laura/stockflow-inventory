import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:unity_ads_plugin/unity_ads_plugin.dart';

import '../utils/app_focus.dart';
import '../utils/env_config.dart';

/// Interstitial on app open / resume — same SDK as Scalper (`unity_ads_plugin`).
class UnityAdsService {
  UnityAdsService._();

  static final UnityAdsService instance = UnityAdsService._();

  bool _initialized = false;
  bool _initFailed = false;
  bool _isLoading = false;
  bool _isAdLoaded = false;
  DateTime? _lastShownAt;

  static const _minInterval = Duration(seconds: 45);

  bool get isConfigured => EnvConfig.hasUnityAdsConfig;

  bool get supportsPlatform {
    if (kIsWeb) return false;
    return defaultTargetPlatform == TargetPlatform.android ||
        defaultTargetPlatform == TargetPlatform.iOS;
  }

  bool get canUseUnityAds => isConfigured && supportsPlatform && !_initFailed;

  Future<void> initialize() async {
    if (_initialized || _initFailed || !canUseUnityAds) return;

    final gameId = EnvConfig.unityGameId;
    if (gameId.isEmpty) {
      _initFailed = true;
      return;
    }

    final completer = Completer<void>();
    UnityAds.init(
      gameId: gameId,
      testMode: EnvConfig.unityTestMode,
      onComplete: () {
        _initialized = true;
        if (!completer.isCompleted) completer.complete();
        preloadInterstitial();
      },
      onFailed: (error, message) {
        _initFailed = true;
        debugPrint('Unity Ads init failed: $error $message');
        if (!completer.isCompleted) completer.complete();
      },
    );

    await completer.future.timeout(
      const Duration(seconds: 8),
      onTimeout: () {
        _initFailed = true;
      },
    );
  }

  Future<void> preloadInterstitial() async {
    if (!canUseUnityAds || !_initialized || _isLoading || _isAdLoaded) return;

    final placementId = EnvConfig.unityAdPlacementId;
    if (placementId.isEmpty) return;

    _isLoading = true;
    final completer = Completer<void>();

    UnityAds.load(
      placementId: placementId,
      onComplete: (_) {
        _isAdLoaded = true;
        _isLoading = false;
        if (!completer.isCompleted) completer.complete();
      },
      onFailed: (_, error, message) {
        _isLoading = false;
        debugPrint('Unity interstitial load failed: $error $message');
        if (!completer.isCompleted) completer.complete();
      },
    );

    await completer.future.timeout(
      const Duration(seconds: 12),
      onTimeout: () {
        _isLoading = false;
      },
    );
  }

  /// Call on first dashboard paint and when app returns to foreground.
  Future<void> showOnActiveIfReady() async {
    if (!canUseUnityAds) return;

    if (!_initialized) {
      await initialize();
    }
    if (!_initialized) return;

    final now = DateTime.now();
    if (_lastShownAt != null &&
        now.difference(_lastShownAt!) < _minInterval) {
      return;
    }

    if (!_isAdLoaded) {
      await preloadInterstitial();
    }
    if (!_isAdLoaded) return;

    final watched = await _showInterstitial(EnvConfig.unityAdPlacementId);
    if (watched) {
      _lastShownAt = DateTime.now();
    }
  }

  Future<bool> _showInterstitial(String placementId) async {
    final resultCompleter = Completer<bool>();
    var adStarted = false;

    UnityAds.showVideoAd(
      placementId: placementId,
      onStart: (_) {
        adStarted = true;
      },
      onClick: (_) {},
      onSkipped: (_) async {
        _isAdLoaded = false;
        preloadInterstitial();
        await AppFocus.bringToFront();
        if (!resultCompleter.isCompleted) resultCompleter.complete(false);
      },
      onComplete: (_) async {
        _isAdLoaded = false;
        preloadInterstitial();
        await AppFocus.bringToFront();
        if (!resultCompleter.isCompleted) resultCompleter.complete(true);
      },
      onFailed: (_, error, message) async {
        _isAdLoaded = false;
        debugPrint('Unity interstitial show failed: $error $message');
        preloadInterstitial();
        await AppFocus.bringToFront();
        if (!resultCompleter.isCompleted) resultCompleter.complete(false);
      },
    );

    for (var i = 0; i < 50; i++) {
      await Future.delayed(const Duration(milliseconds: 100));
      if (adStarted || resultCompleter.isCompleted) break;
    }

    if (!adStarted && !resultCompleter.isCompleted) {
      _isAdLoaded = false;
      preloadInterstitial();
      return false;
    }

    if (resultCompleter.isCompleted) {
      return resultCompleter.future;
    }

    return resultCompleter.future.timeout(
      const Duration(minutes: 2),
      onTimeout: () => false,
    );
  }
}
