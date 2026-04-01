"""
Compatibility entry-point.

The strict structure uses `backend/app/main.py` as the unique entrypoint.
We keep `backend/main.py` so existing commands like:
  python -m uvicorn main:app --host 0.0.0.0 --port 8001
still work.
"""

from app.main import app  # re-export for uvicorn
