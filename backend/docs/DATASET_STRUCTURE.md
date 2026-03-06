# AI Learning from Users – Dataset Structure

When a user corrects the AI, the image and correction are saved. This data is used to **retrain and improve** the model. The dataset structure is kept clean for training.

---

## 1. Where corrections are stored

| Storage | Content |
|--------|---------|
| **SQLite: `scan_history`** | Each scan: `image_name`, `predicted_category`, `corrected_category`, `is_verified`. When the user corrects, `corrected_category` is set and `is_verified = 1`. |
| **Filesystem** | Images are stored under `backend/data/uploads/` with the name stored in `image_name` (e.g. `scan_abc123.jpg`). |

No duplicate tables: the same row holds both the model prediction and the user correction.

---

## 2. Clean dataset for training

**Export verified data (image path + correct label):**

```http
GET /history/export/verified?limit=500
```

**Response:** JSON array of objects suitable for training:

```json
[
  { "id": 1, "image_name": "scan_abc.jpg", "corrected_category": "plastic", "predicted_category": "paper_cardboard" },
  ...
]
```

- **image_name** → path: `backend/data/uploads/<image_name>`
- **corrected_category** → label for training (ground truth)
- **predicted_category** → optional, for analysis (what the model predicted)

**Categories (6 classes):** `plastic`, `paper_cardboard`, `glass`, `metal`, `organic`, `non_recyclable`.

---

## 3. Folder structure for training scripts

For a standalone training pipeline (e.g. `ai_model/train_model.py`), you can build a folder layout:

```
dataset/
  plastic/      ← images with corrected_category = plastic
  paper_cardboard/
  glass/
  metal/
  organic/
  non_recyclable/
```

**Script idea:** Read `GET /history/export/verified`, download or copy each image into `dataset/<corrected_category>/<image_name>`, then run your trainer (e.g. Keras `flow_from_directory`).

---

## 4. Retraining the in-app model

The backend’s own model is updated with:

```bash
cd backend
python retrain.py
```

`retrain.py` (or equivalent) should:

1. Read verified rows (and their image paths).
2. Load images, preprocess like the main pipeline (e.g. 224×224, same normalization).
3. Fine-tune or retrain the model (e.g. MobileNetV2) on these samples.
4. Save updated weights to `backend/data/weights/` (or path used by the API).

After that, restart the backend so the new model is loaded.

---

## 5. Summary

| Step | Action |
|------|--------|
| User corrects | `PATCH /history/:id/correct` → `corrected_category` + `is_verified = 1` |
| Export | `GET /history/export/verified` → list of { image_name, corrected_category } |
| Images | On disk under `data/uploads/<image_name>` |
| Training | Use export + images to build dataset and run `retrain.py` (or external script) |
| Deploy | Save new weights, restart API |

This keeps a **clean, collaborative dataset** and a clear path from user corrections to an improved model.
