# WasteVision AI – Goal & Technical Stack

This document aligns the app with the product goal and technical stack.

---

## Goal

Build a mobile application that:

- **Uses the phone camera to scan waste** – Done: take a photo or pick from gallery (`frontend/screens/CameraScreen.js`); optional live camera (`LiveScanScreen.js`).
- **Detects the type of waste using AI** – Done: backend CNN classifies the image (`backend/app/services/predictor.py`, `backend/ml/model_loader.py`).
- **Displays the waste category** – Done: result screen shows category and recommended bin (`frontend/screens/ResultScreen.js`).
- **Gives recycling instructions** – Done: API returns `recycling_instructions` and the app shows them on the result screen; see `backend/app/services/responses.py` and `ResultScreen.js`.

---

## Waste categories

The AI detects exactly **6 categories** (must match `backend/config.py` and `ai_model/train_model.py`):

| # | Category        | Internal key       | Display / bin info in `responses.CATEGORY_INFO` |
|---|-----------------|--------------------|--------------------------------------------------|
| 0 | **Plastic**     | `plastic`          | Yellow bin, instructions                         |
| 1 | **Paper**       | `paper_cardboard`  | Blue bin                                         |
| 2 | **Glass**       | `glass`            | Green/white glass bin                            |
| 3 | **Metal**       | `metal`            | Yellow or metal bin                              |
| 4 | **Organic waste** | `organic`        | Brown/green organic bin                          |
| 5 | **Other**       | `non_recyclable`   | General waste bin                                |

---

## Technical stack

### AI model

- **Python** – Backend and training are Python.
- **TensorFlow** (Keras) – CNN image classification; see `backend/ml/model_loader.py`, `ai_model/train_model.py`. (PyTorch is not used; the stack is TensorFlow.)
- **CNN** – MobileNetV2-based classifier, 6 classes, input 224×224.
- **Train with a public waste dataset** – Use `ai_model/download_dataset.py` (e.g. Kaggle) and `ai_model/train_model.py`. Dataset layout: `ai_model/dataset/<class>/` with folders `plastic`, `paper_cardboard`, `glass`, `metal`, `organic`, `non_recyclable`. See `ai_model/dataset/README_DATASET.md`.

### Computer vision

- **OpenCV** is used:
  - **To capture images from a camera** – Desktop demo: `python -m scripts.camera_demo` (backend) uses `cv2.VideoCapture(0)` and captures a frame on SPACE; then preprocesses and runs the CNN.
  - **To preprocess images before inference** – In the backend, `backend/ml/preprocess.py` uses OpenCV to decode the uploaded image (`cv2.imdecode`), convert BGR→RGB, resize to 224×224, and normalize. Same preprocessing is used in `camera_demo` via `_preprocess_array(rgb)`.

On the **mobile app**, the device camera is used via **Expo (ImagePicker / Camera)**; the image is sent to the backend, which uses OpenCV for decode and preprocessing.

---

## Where to find things

| What                    | Where |
|-------------------------|--------|
| 6 categories config     | `backend/config.py` → `CATEGORY_NAMES` |
| Category labels + recycling instructions | `backend/app/services/responses.py` → `CATEGORY_INFO` |
| Image preprocessing (OpenCV) | `backend/ml/preprocess.py` |
| CNN predict             | `backend/ml/model_loader.py`, `backend/app/services/predictor.py` |
| Camera demo (OpenCV capture) | `backend/scripts/camera_demo.py` |
| Training script         | `ai_model/train_model.py` |
| Dataset download        | `ai_model/download_dataset.py` |
| Mobile camera + result  | `frontend/screens/CameraScreen.js`, `ResultScreen.js` |
| API predict             | `POST /predict` in `backend/app/api/predict.py` |

All of the above are already implemented in the repo.
