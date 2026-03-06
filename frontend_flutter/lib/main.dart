import 'package:flutter/material.dart';
import 'screens/home_screen.dart';
import 'screens/result_screen.dart';
import 'screens/correction_screen.dart';
import 'screens/dashboard_screen.dart';
import 'services/api_service.dart';

void main() {
  runApp(const WasteVisionApp());
}

class WasteVisionApp extends StatelessWidget {
  const WasteVisionApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'WasteVision AI',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.green),
        useMaterial3: true,
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const HomeScreen(),
        '/dashboard': (context) => const DashboardScreen(),
      },
      onGenerateRoute: (settings) {
        if (settings.name == '/result' && settings.arguments != null) {
          return MaterialPageRoute(
            builder: (context) => ResultScreen(result: settings.arguments! as Map<String, dynamic>),
          );
        }
        if (settings.name == '/correction' && settings.arguments != null) {
          return MaterialPageRoute(
            builder: (context) => CorrectionScreen(
              correctionData: settings.arguments! as Map<String, dynamic>,
            ),
          );
        }
        return null;
      },
    );
  }
}
