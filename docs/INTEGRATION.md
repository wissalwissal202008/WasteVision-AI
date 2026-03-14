# WasteVision AI – Integration & Production Guide

This document covers optional and production-oriented integrations: on-device detection (TensorFlow Lite) and offline support. **The Recycling Map feature is not included**; no map or geolocation is used in the app.

---

## 1. Optional: TensorFlow Lite (on-device detection)

Currently, WasteVision uses the **backend `/predict` API** for classification. You can add **TensorFlow Lite (TFLite)** in the React Native app for:

- **Faster feedback** in live camera mode (no round-trip to the server).
- **Offline classification** when the device has no network.
- **Reduced server load**; the backend can remain the source of truth for history and corrections.

### How it fits

| Mode | Current | With TFLite |
|------|--------|-------------|
| Live scan | Camera → capture frame → POST to `/predict` → overlay | Camera → run TFLite on frame → overlay (optional: still send to backend for history) |
| Single photo | Photo → POST to `/predict` → result | Same, or run TFLite first and only call backend for storage/corrections |

### Steps to add TFLite

1. **Export the backend model to TFLite**  
   From your training script (e.g. Keras), export to `.tflite`:
   ```python
   converter = tf.lite.TFLiteConverter.from_keras_model(model)
   tflite_model = converter.convert()
   with open("wastevision.tflite", "wb") as f:
       f.write(tflite_model)
   ```
2. **Use a React Native TFLite bridge**  
   For example: `react-native-tensorflow-lite` or a custom native module that loads the `.tflite` file and runs inference on image buffers.
3. **Preprocess frames like the backend**  
   Resize to the model input size (e.g. 224×224) and use the same normalization (e.g. ImageNet-style) so labels match.
4. **Reuse labels**  
   Use the same category keys (`plastic`, `paper_cardboard`, `glass`, `metal`, `organic`, `non_recyclable`) and `getCategoryColor` / `getWasteTypeLabel` for the overlay.
5. **Optional: still call backend**  
   When the user taps "Use this result", you can POST the image to the backend to save history and support corrections/retraining.

See [TensorFlow Lite for React Native](https://www.tensorflow.org/lite/guide) and your chosen bridge's docs for build and deployment.

---

## 2. Offline support

| Feature | Current | Offline options |
|--------|--------|------------------|
| **Classification** | Needs backend | Add TFLite (see §1) so classification works offline. |
| **History** | Loaded from API | Cache last N scans in AsyncStorage or SQLite; show cached list when offline; sync when back online. |
| **Eco score / badges** | In AsyncStorage | Already local; no change. |
| **Corrections** | PATCH to backend | Queue corrections locally (e.g. AsyncStorage or SQLite) and send when online (e.g. with NetInfo). |

### Suggested order

1. Use **NetInfo** (e.g. `@react-native-community/netinfo`) to detect offline.
2. **History:** On load, try API; on failure, read from local cache and show a small "Offline" banner.
3. **Corrections:** If offline, save correction to a "pending corrections" queue and retry PATCH when online.

This keeps the app usable without breaking existing architecture.

---

## 3. Performance tips (live camera & on-device inference)

Apply these to keep the live camera smooth and, if you add TFLite, to get the best on-device performance.

### Input resolution

- **Classification (current backend & optional TFLite):** Keep input at **224×224** to balance accuracy and speed. The backend already uses this (`config.MODEL_INPUT_SIZE = (224, 224)`; `ml/preprocess.py` resizes to it).
- **Detection (e.g. YOLO):** If you add an object detector, use a moderate input size such as **320×320** so framerate stays smooth; larger sizes (416, 640) increase latency.

### GPU delegate / NNAPI (Android, for TFLite)

When using TensorFlow Lite on the device:

- **Android:** Use the **GPU delegate** or **NNAPI delegate** so inference runs on GPU/NPU instead of CPU. Example (Java/Kotlin): `GpuDelegate()` or `NnApiDelegate()` when building the Interpreter options.
- **iOS:** Use the **Core ML delegate** if you convert the TFLite model to Core ML for better performance.

This significantly reduces inference time and helps maintain a smooth framerate.

### Don't block the main / UI thread

- **Backend (current):** Inference already runs on the server; the app just waits on the network request.
- **React Native (live camera):** `LiveScanScreen` runs capture and `predict()` in **async** code (no synchronous inference on the JS thread). The interval only starts the next capture when the previous one has finished (or skips if still `analyzing`), so the UI stays responsive.
- **If you add TFLite:** Run inference in a **native background thread** or a **worker** (e.g. `react-native-worklets` or a native module that invokes the Interpreter off the main thread). Never run `interpreter.run()` on the JavaScript thread; queue frames and run inference asynchronously, then post results back to the UI.

---

## 4. References

- **Dataset & retraining:** `backend/docs/DATASET_STRUCTURE.md`
- **Backend predict:** `backend/app/api/predict.py`
- **Live scan:** `frontend/screens/LiveScanScreen.js`
