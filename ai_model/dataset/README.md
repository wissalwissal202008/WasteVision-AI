# Dataset for WasteVision AI

Place your training images in **subfolders named after the category**.  
The folder name = class label used by `train_model.py`.

## Expected structure

```
dataset/
├── plastic/
│   ├── img001.jpg
│   └── ...
├── paper_cardboard/
├── glass/
├── metal/
├── organic/
└── non_recyclable/
```

Categories must match the backend: `plastic`, `paper_cardboard`, `glass`, `metal`, `organic`, `non_recyclable`.

## Tips

- Use at least a few dozen images per class; more is better.
- Prefer clear, well-lit photos of single objects.
- You can reuse verified corrections from the app: export via `GET /history/export/verified` and save images into the right category folders.
