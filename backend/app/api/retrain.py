"""
Trigger retraining from verified user corrections (human-in-the-loop).
POST /retrain runs retrain.py in a background thread so the API stays responsive.
Free, open-source: no paid service.
"""
import asyncio
import subprocess
import sys
from pathlib import Path
from fastapi import APIRouter

router = APIRouter(prefix="/retrain", tags=["retrain"])
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
RETRAIN_SCRIPT = BACKEND_DIR / "retrain.py"

_running = False


def _run_retrain_sync():
    global _running
    _running = True
    try:
        subprocess.run(
            [sys.executable, str(RETRAIN_SCRIPT)],
            cwd=str(BACKEND_DIR),
            timeout=600,
            capture_output=True,
            text=True,
        )
    except Exception:
        pass
    finally:
        _running = False


@router.post("")
async def trigger_retrain():
    """
    Run retrain.py in the background. Corrections stored in SQLite are used to
    incrementally improve the MobileNetV2 model. Model is saved to backend/data/weights/;
    restart the backend to load the new weights.
    """
    global _running
    if _running:
        return {"ok": False, "message": "Retrain already in progress."}
    if not RETRAIN_SCRIPT.exists():
        return {"ok": False, "message": "retrain.py not found."}
    loop = asyncio.get_event_loop()
    loop.run_in_executor(None, _run_retrain_sync)
    return {"ok": True, "message": "Retrain started in background. Restart backend after it finishes to load the new model."}
