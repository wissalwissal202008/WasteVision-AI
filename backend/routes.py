"""
API routes for WasteVision backend.
Register all routes (including /predict for image upload and waste type + confidence).
main.py calls register_routes(app).
"""
from app.api import classify, correction, detect, feedback, history, predict, stats


def register_routes(app):
    """Register all API routes. POST /predict (classify), POST /detect (multi-object detection)."""
    app.include_router(predict.router)
    app.include_router(detect.router)
    app.include_router(stats.router)
    app.include_router(classify.router)
    app.include_router(correction.router)
    app.include_router(history.router)
    app.include_router(feedback.router)
