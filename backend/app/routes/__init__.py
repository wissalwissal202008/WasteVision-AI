from app.api import classify, correction, detect, feedback, history, predict, retrain, stats


def register_routes(app):
    """
    Register all API routers.
    Backend strict structure expects /predict, /detect, /history; we also keep
    correction/feedback/classify for backward compatibility with the frontend.
    """

    app.include_router(predict.router)
    app.include_router(detect.router)
    app.include_router(stats.router)
    app.include_router(history.router)

    # Backward-compatible routes (used by correction + feedback flows)
    app.include_router(classify.router)
    app.include_router(correction.router)
    app.include_router(feedback.router)
    app.include_router(retrain.router)

