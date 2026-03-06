import 'package:flutter/material.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tableau de bord'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Objets triés',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: Colors.grey,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '0',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const Text('Scans effectués (à brancher sur l’API)'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Impact environnemental',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: Colors.grey,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '—',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const Text('Équivalent CO₂ évité, déchets recyclés (à calculer)'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Badges',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: Colors.grey,
                        ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      _BadgeChip(icon: Icons.star, label: 'Premier scan', locked: false),
                      const SizedBox(width: 8),
                      _BadgeChip(icon: Icons.eco, label: '10 scans', locked: true),
                      const SizedBox(width: 8),
                      _BadgeChip(icon: Icons.verified, label: 'Correcteur', locked: true),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Débloquez des badges en triant et en corrigeant l’IA.',
                    style: TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home), label: 'Accueil'),
          NavigationDestination(icon: Icon(Icons.bar_chart), label: 'Tableau de bord'),
        ],
        selectedIndex: 1,
        onDestinationSelected: (index) {
          if (index == 0) Navigator.pop(context);
        },
      ),
    );
  }
}

class _BadgeChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool locked;

  const _BadgeChip({required this.icon, required this.label, this.locked = false});

  @override
  Widget build(BuildContext context) {
    return Chip(
      avatar: Icon(locked ? Icons.lock : icon, size: 18, color: Colors.grey),
      label: Text(label, style: const TextStyle(fontSize: 12)),
    );
  }
}
