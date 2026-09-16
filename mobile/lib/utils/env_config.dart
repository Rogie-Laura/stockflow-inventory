import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class EnvConfig {
  static String get supabaseUrl =>
      dotenv.maybeGet('SUPABASE_URL')?.trim() ?? '';

  static String get supabaseAnonKey =>
      dotenv.maybeGet('SUPABASE_ANON_KEY')?.trim() ?? '';

  static bool get hasSupabase =>
      supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty;

  static String get unityAndroidGameId =>
      dotenv.maybeGet('UNITY_ANDROID_GAME_ID')?.trim() ?? '';

  static String get unityIosGameId =>
      dotenv.maybeGet('UNITY_IOS_GAME_ID')?.trim() ?? '';

  static String get unityInterstitialPlacementId {
    final override =
        dotenv.maybeGet('UNITY_INTERSTITIAL_PLACEMENT_ID')?.trim();
    if (override != null && override.isNotEmpty) return override;
    if (defaultTargetPlatform == TargetPlatform.iOS) {
      return 'Interstitial_iOS';
    }
    return 'Interstitial_Android';
  }

  static bool get unityTestMode {
    final raw = dotenv.maybeGet('UNITY_TEST_MODE')?.trim().toLowerCase();
    if (raw == null || raw.isEmpty) return true;
    return raw == '1' || raw == 'true' || raw == 'yes';
  }

  static bool get hasUnityAdsConfig {
    if (kIsWeb) return false;
    if (defaultTargetPlatform == TargetPlatform.android) {
      return unityAndroidGameId.isNotEmpty;
    }
    if (defaultTargetPlatform == TargetPlatform.iOS) {
      return unityIosGameId.isNotEmpty;
    }
    return unityAndroidGameId.isNotEmpty || unityIosGameId.isNotEmpty;
  }

  static String get unityGameId {
    if (defaultTargetPlatform == TargetPlatform.iOS) {
      return unityIosGameId;
    }
    return unityAndroidGameId;
  }

  static String get affiliateUrl =>
      dotenv.maybeGet('AFFILIATE_URL')?.trim() ?? '';

  static String get affiliateHeadline =>
      dotenv.maybeGet('AFFILIATE_HEADLINE')?.trim() ??
      'Partner offer';
}
