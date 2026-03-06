import 'package:flutter/material.dart';
import 'correction_screen.dart';

class ResultScreen extends StatelessWidget {
  final Map<String, dynamic> result;

  const ResultScreen({super.key, required this.result});

  @override
  Widget build(BuildContext context) {
    final objectName = result['object_name'] as String? ?? 'Objet';
    final material = result['material'] as String? ?? result['category'] ?? '';
    final category = result['category'] as String? ?? material;
    final recommendedBin = result['recommended_bin'] as String? ?? '';
    final recyclingTips = result['recycling_tips'] as String? ?? result['eco_tip'] ?? '';
    final environmentalImpact = result['environmental_impact'] as String? ?? '';
    final confidence = (result['confidence'] as num?)?.toDouble() ?? 0.0;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Résultat'),
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
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      objectName,
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 8),
                    _RowLabel(label: 'Matériau / Catégorie', value: material),
                    _RowLabel(label: 'Bac conseillé', value: recommendedBin),
                    if (environmentalImpact.isNotEmpty)
                      _RowLabel(label: 'Impact environnemental', value: environmentalImpact),
                    if (confidence > 0)
                      Text(
                        'Confiance: ${(confidence * 100).toStringAsFixed(0)} %',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            if (recyclingTips.isNotEmpty)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Conseils recyclage',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 8),
                      Text(recyclingTips),
                    ],
                  ),
                ),
              ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => CorrectionScreen(
                      correctionData: {
                        'object_name': objectName,
                        'predicted_category': category,
                        'scan_id': result['scan_id'],
                      },
                    ),
                  ),
                );
              },
              icon: const Icon(Icons.edit),
              label: const Text("Corriger l'IA"),
              style: FilledButton.styleFrom(
                minimumSize: const Size(double.infinity, 48),
                backgroundColor: Colors.orange,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RowLabel extends StatelessWidget {
  final String label;
  final String value;

  const _RowLabel({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.grey)),
          Text(value, style: Theme.of(context).textTheme.bodyLarge),
        ],
      ),
    );
  }
}
