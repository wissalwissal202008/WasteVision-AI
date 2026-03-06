import 'package:flutter/material.dart';
import '../services/api_service.dart';

/// Categories accepted by the backend (must match backend config.CATEGORY_NAMES).
const List<String> kCategories = [
  'plastic',
  'paper_cardboard',
  'glass',
  'metal',
  'organic',
  'non_recyclable',
];

const Map<String, String> kCategoryLabels = {
  'plastic': 'Plastique',
  'paper_cardboard': 'Papier / Carton',
  'glass': 'Verre',
  'metal': 'Métal',
  'organic': 'Organique',
  'non_recyclable': 'Non recyclable',
};

class CorrectionScreen extends StatefulWidget {
  final Map<String, dynamic> correctionData;

  const CorrectionScreen({super.key, required this.correctionData});

  @override
  State<CorrectionScreen> createState() => _CorrectionScreenState();
}

class _CorrectionScreenState extends State<CorrectionScreen> {
  final ApiService _api = ApiService();
  late String _objectName;
  String _selectedCategory = kCategories.first;
  bool _sending = false;
  String? _error;
  static const String _userId = 'flutter_user';

  @override
  void initState() {
    super.initState();
    _objectName = widget.correctionData['object_name'] as String? ?? 'Objet';
  }

  Future<void> _sendCorrection() async {
    setState(() {
      _sending = true;
      _error = null;
    });
    try {
      await _api.sendCorrection({
        'object_name': _objectName,
        'correct_label': _selectedCategory,
        'user_id': _userId,
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Correction envoyée. Merci !')),
      );
      Navigator.popUntil(context, (route) => route.isFirst);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Corriger l\'IA'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Objet détecté: $_objectName',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            const Text(
              'Sélectionnez la bonne catégorie de tri :',
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 16),
            ...kCategories.map((cat) => RadioListTile<String>(
                  title: Text(kCategoryLabels[cat] ?? cat),
                  value: cat,
                  groupValue: _selectedCategory,
                  onChanged: (v) => setState(() => _selectedCategory = v!),
                )),
            if (_error != null) ...[
              const SizedBox(height: 16),
              Text(
                _error!,
                style: TextStyle(color: Theme.of(context).colorScheme.error, fontSize: 12),
              ),
            ],
            const SizedBox(height: 24),
            FilledButton(
              onPressed: _sending ? null : _sendCorrection,
              style: FilledButton.styleFrom(minimumSize: const Size(double.infinity, 48)),
              child: _sending
                  ? const SizedBox(
                      height: 24,
                      width: 24,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Envoyer la correction'),
            ),
          ],
        ),
      ),
    );
  }
}
