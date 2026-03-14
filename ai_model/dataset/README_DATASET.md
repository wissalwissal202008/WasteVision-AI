# Waste dataset for WasteVision-AI

The CNN expects **6 classes** in subfolders:

- `plastic/`
- `paper_cardboard/`
- `glass/`
- `metal/`
- `organic/`
- `non_recyclable/` (or `other/`)

## Option 1: Kaggle – Waste Classification

1. Install Kaggle CLI: `pip install kaggle`
2. Get API key from https://www.kaggle.com/settings → Create New Token, place `kaggle.json` in `~/.kaggle/` (or `%USERPROFILE%\.kaggle\` on Windows).
3. Run the download script from the project root:

```bash
cd ai_model
python download_dataset.py
```

This downloads a public waste dataset and organizes it into the 6 class folders above.

## Option 2: Manual folder structure

Create the following structure under `ai_model/dataset/`:

```
dataset/
├── plastic/       # .jpg, .jpeg, .png images of plastic waste
├── paper_cardboard/
├── glass/
├── metal/
├── organic/
└── non_recyclable/
```

Then train with:

```bash
python train_model.py
```

## Suggested public datasets

- **Kaggle – Waste Classification** (e.g. `phenomsg/waste-classification` or similar): often has classes like O, R (organic, recyclable) or material-based; map them to our 6 classes in `download_dataset.py`.
- **TrashNet** (GitHub): paper/plastic/glass/metal etc.
- **Garbage Classification** (Kaggle): multiple waste categories.

After preparing `dataset/`, run `train_model.py` from the `ai_model/` directory.
