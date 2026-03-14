# WasteVision Mobile (Flutter – Android)

Flutter Android app: **camera capture** → send image to backend **POST /predict** → show **waste type** and **recycling advice**.

## Requirements

- Flutter SDK (open source)
- Backend running at `http://10.0.2.2:8001` (emulator) or `http://YOUR_PC_IP:8001` (device)

## Setup

```bash
cd mobile_app
flutter pub get
# If android/ folder is missing:
flutter create . --platforms=android
```

On a physical device, set the backend URL in `lib/services/api_service.dart`: `ApiService(baseUrl: 'http://YOUR_PC_IP:8001')`.

## Build Android APK

```bash
cd mobile_app
flutter pub get
flutter build apk --release
```

APK output: `build/app/outputs/flutter-apk/app-release.apk`

## Run locally

1. Start backend: `cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8001`
2. Run app: `cd mobile_app && flutter run` (emulator or connected device)

Camera permission is requested at runtime.
