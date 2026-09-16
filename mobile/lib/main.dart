import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'providers/auth_provider.dart';
import 'providers/monitor_provider.dart';
import 'screens/access_denied_screen.dart';
import 'screens/login_screen.dart';
import 'screens/monitor_screen.dart';
import 'services/monitor_repository.dart';
import 'services/unity_ads_service.dart';
import 'theme/app_theme.dart';
import 'utils/env_config.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const BootstrapApp());
}

class BootstrapApp extends StatefulWidget {
  const BootstrapApp({super.key});

  @override
  State<BootstrapApp> createState() => _BootstrapAppState();
}

class _BootstrapAppState extends State<BootstrapApp> {
  bool _ready = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _boot();
  }

  Future<void> _boot() async {
    try {
      try {
        await dotenv.load(fileName: '.env');
      } catch (_) {
        try {
          await dotenv.load(fileName: '.env.example');
        } catch (_) {}
      }

      if (!EnvConfig.hasSupabase) {
        setState(() {
          _error =
              'Missing SUPABASE_URL / SUPABASE_ANON_KEY in mobile/.env';
        });
        return;
      }

      await Supabase.initialize(
        url: EnvConfig.supabaseUrl,
        publishableKey: EnvConfig.supabaseAnonKey,
        authOptions: const FlutterAuthClientOptions(
          authFlowType: AuthFlowType.pkce,
        ),
      );

      WidgetsBinding.instance.addPostFrameCallback((_) {
        UnityAdsService.instance.initialize();
      });

      setState(() => _ready = true);
    } catch (e) {
      setState(() => _error = e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_error != null) {
      return MaterialApp(
        theme: AppTheme.dark,
        home: Scaffold(
          body: Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Text(_error!, textAlign: TextAlign.center),
            ),
          ),
        ),
      );
    }

    if (!_ready) {
      return MaterialApp(
        theme: AppTheme.dark,
        home: const Scaffold(
          body: Center(child: CircularProgressIndicator()),
        ),
      );
    }

    final repo = MonitorRepository(Supabase.instance.client);

    return ChangeNotifierProvider(
      create: (_) => AuthProvider(repo)..bootstrap(),
      child: MaterialApp(
        title: 'PinoyStock Monitor',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.dark,
        home: const RootGate(),
      ),
    );
  }
}

class RootGate extends StatelessWidget {
  const RootGate({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, auth, _) {
        if (auth.bootstrapping || auth.loading) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        if (!auth.isLoggedIn || auth.store == null) {
          return const LoginScreen();
        }

        if (!auth.store!.canUseMonitor) {
          return const AccessDeniedScreen();
        }

        return ChangeNotifierProvider(
          create: (_) => MonitorProvider(
            MonitorRepository(Supabase.instance.client),
            auth.store!.storeId,
          ),
          child: const MonitorScreen(),
        );
      },
    );
  }
}
