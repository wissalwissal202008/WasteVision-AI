import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

/// Backend base URL. Use 10.0.2.2:8001 for Android emulator; YOUR_PC_IP:8001 for physical device (same Wi‑Fi).
class ApiService {
  final String baseUrl;

  ApiService({this.baseUrl = 'http://10.0.2.2:8001'});

  /// POST /predict — send image, get waste type and recycling instructions.
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
      throw Exception(detail.toString());
    }
    return jsonDecode(response.body) as Map<String, dynamic>;
  }
}
