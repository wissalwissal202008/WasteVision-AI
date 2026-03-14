import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../services/api_service.dart';
import 'result_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ApiService _api = ApiService();
  final ImagePicker _picker = ImagePicker();
  bool _loading = false;
  String? _error;

  Future<void> _capture(ImageSource source) async {
    setState(() { _loading = true; _error = null; });
    try {
      final XFile? file = await _picker.pickImage(source: source, imageQuality: 85);
      if (file == null || !mounted) return;
      final result = await _api.predict(File(file.path));
      if (!mounted) return;
      Navigator.push(context, MaterialPageRoute(
        builder: (context) => ResultScreen(result: result),
      ));
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('WasteVision AI'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.recycling, size: 80, color: Theme.of(context).colorScheme.primary),
              const SizedBox(height: 16),
              const Text('Scan waste', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
              const SizedBox(height: 8),
              const Text('Use camera or gallery. We\'ll detect the type and show recycling advice.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey)),
              const SizedBox(height: 32),
              if (_loading)
                const CircularProgressIndicator()
              else ...[
                FilledButton.icon(
                  onPressed: () => _capture(ImageSource.camera),
                  icon: const Icon(Icons.camera_alt),
                  label: const Text('Camera'),
                  style: FilledButton.styleFrom(minimumSize: const Size(double.infinity, 48), padding: const EdgeInsets.symmetric(vertical: 12)),
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: () => _capture(ImageSource.gallery),
                  icon: const Icon(Icons.photo_library),
                  label: const Text('Gallery'),
                  style: OutlinedButton.styleFrom(minimumSize: const Size(double.infinity, 48), padding: const EdgeInsets.symmetric(vertical: 12)),
                ),
              ],
              if (_error != null) ...[
                const SizedBox(height: 24),
                Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error, fontSize: 12), textAlign: TextAlign.center),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
