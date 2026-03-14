import 'package:flutter/material.dart';

class ResultScreen extends StatelessWidget {
  final Map<String, dynamic> result;

  const ResultScreen({super.key, required this.result});

  @override
  Widget build(BuildContext context) {
    final objectName = result['object_name'] as String? ?? 'Waste';
    final category = result['waste_category'] as String? ?? 'other';
    final recommendedBin = result['recommended_bin'] as String? ?? '';
    final recyclingInstructions = result['recycling_instructions'] as String? ?? result['eco_tip'] as String? ?? '';
    final confidence = (result['confidence'] as num?)?.toDouble() ?? 0.0;
    final impact = result['environmental_impact'] as String? ?? '';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Result'),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => Navigator.pop(context)),
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
                    Text(objectName, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    _row(context, 'Waste category', category.replaceAll('_', ' ')),
                    _row(context, 'Recommended bin', recommendedBin),
                    if (confidence > 0) Text('Confidence: ${(confidence * 100).toStringAsFixed(0)}%', style: Theme.of(context).textTheme.bodySmall),
                  ],
                ),
              ),
            ),
            if (recyclingInstructions.isNotEmpty) ...[
              const SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Recycling instructions', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Text(recyclingInstructions),
                    ],
                  ),
                ),
              ),
            ],
            if (impact.isNotEmpty) ...[
              const SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Environmental impact', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Text(impact),
                    ],
                  ),
                ),
              ),
            ],
            const SizedBox(height: 24),
            FilledButton(
              onPressed: () => Navigator.pop(context),
              style: FilledButton.styleFrom(minimumSize: const Size(double.infinity, 48)),
              child: const Text('Scan another'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _row(BuildContext context, String label, String value) {
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
