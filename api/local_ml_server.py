"""Local FastAPI dev server for Python ML /api/predict during local development."""

from __future__ import annotations

import sys
from pathlib import Path

from fastapi import FastAPI, HTTPException
from pydantic import ValidationError

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from ml.predictor import PredictRequest, get_model_health, run_prediction

app = FastAPI(title="VITALORA ML Service")


@app.get("/api/predict")
def health():
    return get_model_health()


@app.post("/api/predict")
def predict(body: dict):
    try:
        req = PredictRequest(**body)
        return run_prediction(req)
    except ValidationError as exc:
        raise HTTPException(status_code=400, detail=exc.errors())
