import logging
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import init_db
from routes import register_routes
import config

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("uvicorn.error")


def _preload_model():
    """Load AI model(s) at startup: classifier for /predict, optional YOLOv8 for /detect."""
    try:
        from ml.model_loader import get_model
        m = get_model()
        if m is not None:
            print("[Backend] AI model (classifier) loaded at startup.")
        else:
            print("[Backend] No classifier loaded; /predict will use fallback or fail.")
    except Exception as e:
        print("[Backend] Classifier preload failed:", e)
    try:
        from ml.yolo_detector import get_yolo_model
        if get_yolo_model() is not None:
            print("[Backend] YOLOv8 detector loaded at startup.")
    except Exception as e:
        print("[Backend] YOLO preload skipped:", e)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    _preload_model()
    yield


app = FastAPI(
    title="WasteVision AI API",
    description="Classify waste from images and get bin + eco tips",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_routes(app)

uploads_path = Path(config.UPLOADS_DIR)
uploads_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

# Web app: phone camera + waste detection + recycling instructions
static_path = Path(__file__).resolve().parent / "static"
if static_path.is_dir():
    app.mount("/app", StaticFiles(directory=str(static_path), html=True), name="app")


@app.get("/")
async def root():
    return {"message": "WasteVision AI API", "docs": "/docs", "web_app": "/app/"}
