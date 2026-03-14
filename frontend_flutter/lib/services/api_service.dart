import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

/// Base URL of the WasteVision backend. Change for device/emulator.
/// - Android emulator: http://10.0.2.2:8001
/// - iOS simulator: http://127.0.0.1:8001
/// - Physical device (same Wi‑Fi): http://YOUR_PC_IP:8001
class ApiService {
  final String baseUrl;

  ApiService({this.baseUrl = 'http://10.0.2.2:8001'});

  /// Send image to backend POST /predict, get waste_type, confidence, recycling_advice.
  Future<Map<String, dynamic>> predict(File image) async {
    final uri = Uri.parse('$baseUrl/predict');
    final request = http.MultipartRequest('POST', uri);
    request.files.add(await http.MultipartFile.fromPath('file', image.path, filename: 'image.jpg'));
    final streamed = await request.send();
    final response = await http.Response.fromStream(streamed);
    if (response.statusCode != 200) {
      final body = response.body;
      final decoded = jsonDecode(body) as Map<String, dynamic>?;
      final detail = decoded?['detail'] ?? body;
      throw Exception(detail);
    }
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  /// Alias for predict (backward compatibility).
  Future<Map<String, dynamic>> classifyObject(File image) async => predict(image);

  /// Send user correction to backend for model retraining.
  Future<void> sendCorrection(Map<String, dynamic> correction) async {
    final uri = Uri.parse('$baseUrl/history/${correction['scan_id']}/correct');
    final response = await http.patch(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'corrected_category': correction['corrected_category']}),
    );
    if (response.statusCode != 200) {
      final body = response.body;
      final decoded = jsonDecode(body) as Map<String, dynamic>?;
      final detail = decoded?['detail'] ?? body;
      throw Exception(detail);
    }
  }
}
