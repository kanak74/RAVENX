"""
VITALORA Python ML Inference & Validation Module.

Loads the trained scikit-learn model (ml/model.joblib) and metadata
(ml/metadata.json), validates incoming symptom & vital-sign payloads,
runs deterministic safety checks before ML inference, and returns
top pattern-matched conditions with per-symptom influence scores.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional

import numpy as np
from pydantic import BaseModel, Field, field_validator

ML_DIR = Path(__file__).resolve().parent
WEIGHTS_PATH = ML_DIR / "model_weights.json"
META_PATH = ML_DIR / "metadata.json"

_weights_cache: Optional[Dict[str, Any]] = None
_meta_cache: Optional[Dict[str, Any]] = None


def _load_artifacts():
    global _weights_cache, _meta_cache
    if _weights_cache is None:
        raw = json.loads(WEIGHTS_PATH.read_text(encoding="utf-8"))
        _weights_cache = {
            "classes": raw["classes"],
            "coef": np.array(raw["coef"], dtype=np.float64),
            "intercept": np.array(raw["intercept"], dtype=np.float64),
        }
    if _meta_cache is None:
        _meta_cache = json.loads(META_PATH.read_text(encoding="utf-8"))
    return _weights_cache, _meta_cache


def _predict_proba(weights: Dict[str, Any], vec: np.ndarray) -> np.ndarray:
    logits = vec @ weights["coef"].T + weights["intercept"]
    logits = logits - np.max(logits, axis=1, keepdims=True)
    exp_logits = np.exp(logits)
    return (exp_logits / np.sum(exp_logits, axis=1, keepdims=True))[0]


class PredictRequest(BaseModel):
    symptoms: List[str] = Field(default_factory=list)
    duration: Optional[str] = None
    severity: Optional[str] = None
    progression: Optional[str] = None
    temperatureCelsius: Optional[float] = None
    spo2: Optional[float] = None
    heartRate: Optional[float] = None

    @field_validator("symptoms")
    @classmethod
    def clean_symptoms(cls, v: List[str]) -> List[str]:
        cleaned: List[str] = []
        for item in v:
            if not isinstance(item, str):
                raise ValueError("Symptom IDs must be strings.")
            s = item.strip().lower()
            if s and s not in cleaned:
                cleaned.append(s)
        return cleaned

    @field_validator("temperatureCelsius")
    @classmethod
    def check_temp(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and (v < 30.0 or v > 44.0):
            raise ValueError("Temperature must be between 30.0°C and 44.0°C.")
        return v

    @field_validator("spo2")
    @classmethod
    def check_spo2(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and (v < 50.0 or v > 100.0):
            raise ValueError("SpO2 must be between 50% and 100%.")
        return v

    @field_validator("heartRate")
    @classmethod
    def check_hr(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and (v < 25.0 or v > 240.0):
            raise ValueError("Heart rate must be between 25 and 240 bpm.")
        return v


EMERGENCY_SYMPTOMS = {
    "severe-chest-pain",
    "difficulty-breathing",
    "fainting",
    "sudden-weakness",
    "confusion",
    "severe-allergic-reaction",
}


def run_prediction(payload: PredictRequest) -> Dict[str, Any]:
    model, meta = _load_artifacts()
    features: List[str] = meta["features"]
    symptom_labels: Dict[str, str] = meta["symptom_labels"]
    rates: Dict[str, Dict[str, float]] = meta["condition_symptom_rates"]
    details: Dict[str, Dict[str, str]] = meta["condition_details"]

    # Deterministic emergency pre-check
    emergency_hits = [s for s in payload.symptoms if s in EMERGENCY_SYMPTOMS]
    if payload.spo2 is not None and payload.spo2 < 90:
        emergency_hits.append(f"Critically low SpO2 ({payload.spo2}%)")
    if payload.temperatureCelsius is not None and payload.temperatureCelsius >= 40.0:
        emergency_hits.append(f"Very high fever ({payload.temperatureCelsius:.1f}°C)")

    if emergency_hits:
        return {
            "status": "emergency",
            "insufficientData": False,
            "emergencyTriggers": emergency_hits,
            "predictions": [],
            "modelInfo": {
                "modelType": meta["model_type"],
                "cvAccuracy": meta["cv_accuracy_mean"],
                "datasetRows": meta["dataset_rows"],
            },
            "disclaimer": (
                "Emergency warning signs detected. Seek immediate medical help (call 112). "
                "ML pattern matching is paused."
            ),
        }

    # Build binary feature vector aligned with trained model
    active_features = [s for s in payload.symptoms if s in features]
    if not active_features:
        return {
            "status": "insufficient_data",
            "insufficientData": True,
            "emergencyTriggers": [],
            "predictions": [],
            "modelInfo": {
                "modelType": meta["model_type"],
                "cvAccuracy": meta["cv_accuracy_mean"],
                "datasetRows": meta["dataset_rows"],
            },
            "disclaimer": (
                "Select at least one recognized symptom to run pattern analysis. "
                "Model scores are informational pattern matches, not medical diagnoses."
            ),
        }

    vec = np.array([[1 if feat in active_features else 0 for feat in features]], dtype=np.float64)
    probs = _predict_proba(model, vec)
    classes = list(model["classes"])

    ranked_indices = np.argsort(probs)[::-1][:4]
    predictions: List[Dict[str, Any]] = []

    for idx in ranked_indices:
        cond_name = str(classes[idx])
        raw_prob = float(probs[idx])
        # Never show 100% certainty; cap display at 92% and omit negligible (<4%) noise
        pct = min(92, round(raw_prob * 100))
        if pct < 4 and len(predictions) >= 1:
            continue

        cond_rates = rates.get(cond_name, {})
        influences = []
        for sym_id in active_features:
            weight = float(cond_rates.get(sym_id, 0.05))
            influences.append(
                {
                    "id": sym_id,
                    "label": symptom_labels.get(sym_id, sym_id),
                    "weight": round(weight, 2),
                }
            )
        influences.sort(key=lambda x: x["weight"], reverse=True)

        cond_meta = details.get(cond_name, {})
        predictions.append(
            {
                "condition": cond_name,
                "confidencePercent": pct,
                "confidenceLabel": "Model pattern match (not a medical probability)",
                "summary": cond_meta.get("summary", ""),
                "recommendedSpecialist": cond_meta.get(
                    "specialist", "General Physician"
                ),
                "influencingSymptoms": influences[:5],
            }
        )

    return {
        "status": "ok",
        "insufficientData": False,
        "emergencyTriggers": [],
        "predictions": predictions,
        "activeSymptomCount": len(active_features),
        "modelInfo": {
            "modelType": meta["model_type"],
            "cvAccuracy": meta["cv_accuracy_mean"],
            "datasetRows": meta["dataset_rows"],
        },
        "disclaimer": (
            "These results come from a statistical machine-learning model trained on "
            "symptom patterns. Confidence scores reflect pattern similarity, not a "
            "confirmed medical probability or diagnosis."
        ),
    }


def get_model_health() -> Dict[str, Any]:
    _, meta = _load_artifacts()
    return {
        "status": "ready",
        "modelType": meta["model_type"],
        "cvAccuracy": meta["cv_accuracy_mean"],
        "numConditions": meta["num_conditions"],
        "datasetRows": meta["dataset_rows"],
    }
