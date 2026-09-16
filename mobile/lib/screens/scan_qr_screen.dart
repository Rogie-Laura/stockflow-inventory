import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../services/account_login_service.dart';
import '../services/pairing_service.dart';
import '../theme/app_theme.dart';

class ScanQrScreen extends StatefulWidget {
  const ScanQrScreen({super.key});

  @override
  State<ScanQrScreen> createState() => _ScanQrScreenState();
}

class _ScanQrScreenState extends State<ScanQrScreen> {
  final _pairing = PairingService();
  bool _busy = false;
  String? _message;
  final _controller = MobileScannerController(
    detectionSpeed: DetectionSpeed.normal,
    facing: CameraFacing.back,
  );

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _onDetect(BarcodeCapture capture) async {
    if (_busy) return;
    final raw = capture.barcodes.firstOrNull?.rawValue;
    if (raw == null || raw.isEmpty) return;

    setState(() {
      _busy = true;
      _message = 'Naglo-login…';
    });

    try {
      final account = AccountLoginService.parseAccountFromQr(raw);
      if (account != null) {
        final err =
            await context.read<AuthProvider>().signInWithAccountNumber(account);
        if (!mounted) return;
        if (err != null) {
          setState(() {
            _busy = false;
            _message = err;
          });
          return;
        }
        Navigator.of(context).pop(true);
        return;
      }

      final payload = PairingService.parseQr(raw);
      if (payload == null) {
        setState(() {
          _busy = false;
          _message = 'Hindi valid na QR. Account o Login QR sa web Monitor.';
        });
        return;
      }

      await _pairing.exchangeAndSignIn(payload);
      if (!mounted) return;
      await context.read<AuthProvider>().bootstrap();
      if (!mounted) return;
      Navigator.of(context).pop(true);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _busy = false;
        _message = e.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan QR'),
      ),
      body: Column(
        children: [
          Expanded(
            child: Stack(
              fit: StackFit.expand,
              children: [
                MobileScanner(
                  controller: _controller,
                  onDetect: _onDetect,
                ),
                if (_busy)
                  Container(
                    color: Colors.black54,
                    child: const Center(
                      child: CircularProgressIndicator(color: AppTheme.indigo),
                    ),
                  ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Text(
              _message ??
                  'I-scan ang Account QR o Login QR sa web Monitor — walang password.',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: _message != null && _message!.contains('valid')
                    ? Colors.redAccent
                    : Colors.white70,
                fontSize: 13,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
