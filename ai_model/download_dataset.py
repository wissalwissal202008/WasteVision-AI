"""
Download and prepare a public waste dataset into ai_model/dataset/ with 6 classes:
plastic, paper_cardboard, glass, metal, organic, non_recyclable.

Uses Kaggle API if available; otherwise prints instructions for manual download.
Maps common dataset class names to our categories.
"""
from pathlib import Path
import shutil
import subprocess
import sys

DATA_DIR = Path(__file__).resolve().parent / "dataset"
CLASSES = ["plastic", "paper_cardboard", "glass", "metal", "organic", "non_recyclable"]

# Map common external labels to our class folder names
LABEL_MAP = {
    "plastic": "plastic",
    "plastics": "plastic",
    "paper": "paper_cardboard",
    "paper_cardboard": "paper_cardboard",
    "cardboard": "paper_cardboard",
    "paper and cardboard": "paper_cardboard",
    "glass": "glass",
    "metal": "metal",
    "metals": "metal",
    "organic": "organic",
    "food": "organic",
    "organic waste": "organic",
    "non_recyclable": "non_recyclable",
    "non_recyclable waste": "non_recyclable",
    "other": "non_recyclable",
    "trash": "non_recyclable",
    "garbage": "non_recyclable",
    "o": "organic",  # TrashNet / some datasets use O/R
    "r": "plastic",  # recyclable -> map to plastic for simplicity if no subclass
}


def ensure_dirs():
    for c in CLASSES:
        (DATA_DIR / c).mkdir(parents=True, exist_ok=True)


def try_kaggle_download():
    """Try to download a waste dataset from Kaggle and organize into CLASSES."""
    try:
        import kaggle
    except ImportError:
        print("Kaggle API not installed. Run: pip install kaggle")
        return False

    # Dataset: Waste Classification (example – adjust dataset slug if using another)
    # If the dataset has different structure, adapt the loop below.
    dataset_slug = "phenomsg/waste-classification"
    raw_dir = Path(__file__).resolve().parent / "raw_data"
    raw_dir.mkdir(exist_ok=True)

    print(f"Downloading from Kaggle: {dataset_slug} ...")
    try:
        kaggle.api.dataset_download_files(dataset_slug, path=str(raw_dir), unzip=True)
    except Exception as e:
        print(f"Kaggle download failed: {e}")
        print("You can manually download from https://www.kaggle.com/datasets/phenomsg/waste-classification")
        print("Extract into ai_model/raw_data/ and run this script again to organize into dataset/")
        return False

    # Common structure: raw_data/ with train/ or class-named folders
    organize_from_raw(raw_dir)
    return True


def organize_from_raw(raw_dir: Path):
    """Copy or move images from raw_data into dataset/<class>/ using LABEL_MAP."""
    ensure_dirs()
    raw_dir = Path(raw_dir)
    if not raw_dir.is_dir():
        print(f"Raw dir not found: {raw_dir}")
        return

    count = {c: 0 for c in CLASSES}
    for sub in raw_dir.rglob("*"):
        if not sub.is_file():
            continue
        suf = sub.suffix.lower()
        if suf not in (".jpg", ".jpeg", ".png", ".bmp"):
            continue
        # Infer class from parent folder name (e.g. train/plastic, or O/, R/)
        parent_name = sub.parent.name.lower().replace(" ", "_")
        target_class = LABEL_MAP.get(parent_name)
        if target_class is None:
            target_class = LABEL_MAP.get(sub.stem.split("_")[0].lower(), "non_recyclable")
        dest_dir = DATA_DIR / target_class
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest = dest_dir / f"{sub.parent.name}_{sub.name}"
        if not dest.exists() or sub.stat().st_mtime > dest.stat().st_mtime:
            shutil.copy2(sub, dest)
        count[target_class] += 1

    for c in CLASSES:
        print(f"  {c}: {count[c]} images")


def create_sample_structure():
    """Create empty class folders and a README so training doesn't fail before dataset is ready."""
    ensure_dirs()
    readme = DATA_DIR / "README.txt"
    readme.write_text(
        "Add images per class: plastic, paper_cardboard, glass, metal, organic, non_recyclable.\n"
        "See README_DATASET.md for download instructions.\n"
    )
    print(f"Created {DATA_DIR} with class folders. Add images or run download_dataset.py with Kaggle.")


def main():
    ensure_dirs()
    if try_kaggle_download():
        print("Dataset ready in", DATA_DIR)
        return
    # Check for existing raw_data from manual download
    raw = Path(__file__).resolve().parent / "raw_data"
    if raw.is_dir():
        organize_from_raw(raw)
        print("Dataset ready in", DATA_DIR)
        return
    create_sample_structure()
    print("No dataset downloaded. Add images to ai_model/dataset/<class>/ or download from Kaggle.")
    print("See ai_model/dataset/README_DATASET.md for links.")


if __name__ == "__main__":
    main()
