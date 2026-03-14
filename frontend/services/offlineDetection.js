/**
 * On-device detection for WasteVision AI.
 *
 * Supports:
 * 1) TensorFlow Lite (MobileNet SSD) via react-native-fast-tflite when available
 *    (requires Expo dev build / native). Model: SSD MobileNet V1 COCO.
 * 2) Fallback: backend prediction when offline detection is disabled or unavailable.
 *
 * COCO SSD classes are mapped to waste categories: plastic, glass, metal,
 * paper_cardboard, organic, non_recyclable. See COCO_TO_WASTE below.
 */

/** COCO-SSD / MobileNet SSD class names (80 classes, index 0–79). */
const COCO_CLASSES = [
  "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat",
  "traffic light", "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat", "dog", "horse", "sheep", "cow",
  "elephant", "bear", "zebra", "giraffe", "backpack", "umbrella", "handbag", "tie", "suitcase", "frisbee",
  "skis", "snowboard", "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket",
  "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl",
  "banana", "apple", "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake",
  "chair", "couch", "potted plant", "bed", "dining table", "toilet", "tv", "laptop", "mouse", "remote", "keyboard", "cell phone",
  "microwave", "oven", "toaster", "sink", "refrigerator", "book", "clock", "vase", "scissors", "teddy bear", "hair drier", "toothbrush",
];

/** Map COCO class name → waste_category. Covers bottle, cup, glass, can-like, paper, organic. */
const COCO_TO_WASTE = {
  bottle: "plastic",
  "wine glass": "glass",
  cup: "plastic",
  bowl: "glass",
  fork: "metal",
  knife: "metal",
  spoon: "metal",
  book: "paper_cardboard",
  banana: "organic",
  apple: "organic",
  sandwich: "organic",
  orange: "organic",
  broccoli: "organic",
  carrot: "organic",
  "hot dog": "organic",
  pizza: "organic",
  donut: "organic",
  cake: "organic",
  vase: "glass",
  "cell phone": "non_recyclable",
  "potted plant": "organic",
  "dining table": "non_recyclable",
  chair: "non_recyclable",
  couch: "non_recyclable",
  bed: "non_recyclable",
  tv: "non_recyclable",
  laptop: "non_recyclable",
  microwave: "non_recyclable",
  oven: "non_recyclable",
  refrigerator: "non_recyclable",
  clock: "non_recyclable",
  scissors: "metal",
  toothbrush: "plastic",
};

/** Bin labels by waste_category (short, for recommended_bin). */
const BIN_BY_CATEGORY = {
  plastic: "Yellow bin (recycling)",
  paper_cardboard: "Blue bin (paper)",
  glass: "Green/white glass bin",
  metal: "Yellow or metal bin",
  organic: "Brown/green bin (organic)",
  non_recyclable: "General waste bin",
};

/**
 * Map a COCO class index or name to waste category and bin.
 * @param {number|string} classIndexOrName - COCO class index (0–79) or class name
 * @returns {{ waste_category: string, recommended_bin: string, object_name: string }}
 */
export function mapCocoToWaste(classIndexOrName) {
  const name = typeof classIndexOrName === "number"
    ? (COCO_CLASSES[classIndexOrName] || "unknown")
    : String(classIndexOrName).toLowerCase();
  const waste_category = COCO_TO_WASTE[name] || "non_recyclable";
  const object_name = name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, " ");
  return {
    waste_category,
    recommended_bin: BIN_BY_CATEGORY[waste_category] || BIN_BY_CATEGORY.non_recyclable,
    object_name,
  };
}

/**
 * Build a prediction result object compatible with the app (same shape as backend /predict).
 * @param {{ waste_category: string, recommended_bin: string, object_name: string }} mapped
 * @param {number} confidence - 0..1
 * @returns {import("../api/client").PredictResult}
 */
export function buildOfflineResult(mapped, confidence) {
  return {
    object_name: mapped.object_name,
    waste_category: mapped.waste_category,
    recommended_bin: mapped.recommended_bin,
    confidence: Math.round(confidence * 10000) / 10000,
    product_type: mapped.object_name,
    // No scan_id when offline; history can be stored locally if needed
  };
}

/** Check if TFLite is available (react-native-fast-tflite loaded). */
let tfliteAvailable = null;
export async function isTFLiteAvailable() {
  if (tfliteAvailable !== null) return tfliteAvailable;
  try {
    const TFLite = require("react-native-fast-tflite");
    const hasLoad = typeof TFLite?.loadTensorflowModel === "function";
    tfliteAvailable = !!hasLoad;
    return tfliteAvailable;
  } catch {
    tfliteAvailable = false;
    return false;
  }
}

/**
 * Run on-device detection with TFLite (MobileNet SSD).
 * Model expects tensor input (e.g. 300x300x3 RGB); output: detection_boxes, detection_classes, detection_scores.
 * When the library is present, you can pass preprocessed input; see docs/TFLITE_SETUP.md.
 *
 * @param {object} tflite - react-native-fast-tflite module
 * @param {object} model - loaded TFLite model
 * @param {string|Float32Array|Uint8Array} imageUriOrTensor - file URI or preprocessed input tensor
 * @returns {Promise<import("../api/client").PredictResult|null>} Result or null if inference fails
 */
export async function detectWithTFLite(tflite, model, imageUriOrTensor) {
  if (!tflite || !model) return null;
  try {
    const result = await model.run(imageUriOrTensor);
    if (result == null) return null;
    // SSD output: often [boxes, classes, scores, num_detections] or similar
    const scores = result[2] ?? result.scores ?? result.detection_scores;
    const classes = result[1] ?? result.classes ?? result.detection_classes;
    if (scores == null || classes == null) {
      const single = Array.isArray(result) ? result[0] : result;
      const classIdx = single?.class ?? single?.[1] ?? 0;
      const score = single?.score ?? single?.[2] ?? 0.5;
      const mapped = mapCocoToWaste(classIdx);
      return buildOfflineResult(mapped, score);
    }
    const num = Math.min(Number(result[3]?.[0] ?? result.num_detections?.[0] ?? 1), scores.length);
    let bestIdx = 0;
    let bestScore = 0;
    for (let i = 0; i < num; i++) {
      const s = Array.isArray(scores) ? scores[i] : scores[i / 4];
      if (s > bestScore) {
        bestScore = s;
        bestIdx = Array.isArray(classes) ? (classes[i] ?? 0) : (classes[Math.floor(i / 4)] ?? 0);
      }
    }
    const mapped = mapCocoToWaste(bestIdx);
    return buildOfflineResult(mapped, bestScore);
  } catch (e) {
    console.warn("TFLite inference failed:", e?.message);
    return null;
  }
}

/**
 * Load MobileNet SSD TFLite model from URL or local asset.
 * Use this when react-native-fast-tflite is available (Expo dev build).
 *
 * Recommended: bundle the .tflite in assets (see docs/TFLITE_SETUP.md).
 * Example: loadTensorflowModel(require('../assets/ssd_mobilenet_v1.tflite'))
 *
 * @param {string|number} [modelSource] - URL (string), or require() asset (number)
 * @returns {Promise<{ model: object, tflite: object }|null>}
 */
export async function loadTFLiteModel(modelSource) {
  try {
    const TFLite = require("react-native-fast-tflite");
    if (typeof TFLite.loadTensorflowModel !== "function") return null;
    const source = modelSource ?? "https://storage.googleapis.com/download.tensorflow.org/models/tflite/coco_ssd_mobilenet_v1_1.0_quant_2018_06_29.tflite";
    const model = typeof source === "number"
      ? await TFLite.loadTensorflowModel(source)
      : await TFLite.loadTensorflowModel({ url: source });
    return model ? { model, tflite: TFLite } : null;
  } catch (e) {
    console.warn("TFLite model load failed:", e?.message);
    return null;
  }
}
