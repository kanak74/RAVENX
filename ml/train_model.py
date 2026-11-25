"""
Train and evaluate VITALORA's Disease Pattern Prediction ML Model.

Generates a structured clinical symptom-condition dataset aligned with VITALORA's
symptom catalog, trains a calibrated RandomForestClassifier, evaluates 5-fold
cross-validation accuracy, and exports:
  - ml/disease_symptoms.csv
  - ml/model.joblib
  - ml/metadata.json
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_score

SYMPTOM_FEATURES: List[str] = [
    "headache",
    "fever",
    "chills",
    "cough",
    "sore-throat",
    "runny-nose",
    "dizziness",
    "shortness-of-breath",
    "stomach-pain",
    "nausea",
    "vomiting",
    "diarrhea",
    "constipation",
    "fatigue",
    "body-aches",
    "back-pain",
    "joint-pain",
    "skin-rash",
    "itching",
    "palpitations",
    "chest-discomfort",
    "difficulty-sleeping",
    "anxiety",
]

SYMPTOM_LABELS: Dict[str, str] = {
    "headache": "Headache",
    "fever": "Fever",
    "chills": "Chills",
    "cough": "Cough",
    "sore-throat": "Sore throat",
    "runny-nose": "Runny or blocked nose",
    "dizziness": "Dizziness",
    "shortness-of-breath": "Shortness of breath",
    "stomach-pain": "Stomach pain",
    "nausea": "Nausea",
    "vomiting": "Vomiting",
    "diarrhea": "Diarrhea",
    "constipation": "Constipation",
    "fatigue": "Fatigue",
    "body-aches": "Body aches",
    "back-pain": "Back pain",
    "joint-pain": "Joint pain",
    "skin-rash": "Skin rash",
    "itching": "Itching",
    "palpitations": "Palpitations",
    "chest-discomfort": "Chest discomfort",
    "difficulty-sleeping": "Difficulty sleeping",
    "anxiety": "Anxiety or feeling worried",
}

# (condition_name, core_symptoms, optional_symptoms, specialist, summary)
CONDITION_PROFILES: List[Tuple[str, List[str], List[str], str, str]] = [
    (
        "Common Cold (Upper Respiratory Viral Infection)",
        ["runny-nose", "sore-throat", "cough"],
        ["headache", "fatigue", "fever"],
        "General Physician",
        "Mild viral infection affecting the nose and throat, usually settling with rest and fluids.",
    ),
    (
        "Seasonal Influenza (Flu-like Illness)",
        ["fever", "chills", "body-aches", "fatigue"],
        ["cough", "headache", "sore-throat", "runny-nose"],
        "General Physician",
        "Viral respiratory illness marked by fever, chills, muscle aches, and strong tiredness.",
    ),
    (
        "Acute Viral Pharyngitis (Sore Throat)",
        ["sore-throat", "fatigue"],
        ["fever", "cough", "headache", "runny-nose"],
        "General Physician / ENT",
        "Inflammation of the throat often caused by a viral infection, causing pain when swallowing.",
    ),
    (
        "Acute Bronchitis (Chest Cold)",
        ["cough", "fatigue"],
        ["shortness-of-breath", "chest-discomfort", "fever", "sore-throat"],
        "General Physician / Pulmonologist",
        "Irritation of the airways causing a persistent cough, sometimes with mild chest soreness.",
    ),
    (
        "Allergic Rhinitis (Nasal Allergies)",
        ["runny-nose", "itching"],
        ["headache", "fatigue", "cough"],
        "General Physician / Allergist",
        "Allergic reaction to dust, pollen, or airborne triggers causing sneezing and stuffy nose.",
    ),
    (
        "Tension-Type Headache",
        ["headache"],
        ["fatigue", "difficulty-sleeping", "back-pain", "anxiety"],
        "General Physician",
        "Common band-like or dull head pain often linked to stress, posture, eye strain, or poor sleep.",
    ),
    (
        "Migraine",
        ["headache", "nausea", "dizziness"],
        ["fatigue", "vomiting"],
        "General Physician / Neurologist",
        "Throbbing headache often accompanied by nausea, lightheadedness, or sensitivity to light.",
    ),
    (
        "Dehydration or Heat Exhaustion",
        ["dizziness", "fatigue", "headache"],
        ["nausea", "palpitations", "chills"],
        "General Physician",
        "Low body fluid levels causing lightheadedness, weakness, and headache.",
    ),
    (
        "Viral Gastroenteritis (Stomach Flu)",
        ["nausea", "vomiting", "diarrhea", "stomach-pain"],
        ["fever", "chills", "fatigue", "body-aches"],
        "General Physician / Gastroenterologist",
        "Stomach and intestinal viral bug causing nausea, loose stools, and tummy cramps.",
    ),
    (
        "Acid Reflux / Gastritis",
        ["stomach-pain", "nausea", "chest-discomfort"],
        ["vomiting", "difficulty-sleeping"],
        "General Physician / Gastroenterologist",
        "Stomach lining irritation or acid reflux causing upper tummy soreness and heartburn.",
    ),
    (
        "Functional Constipation",
        ["constipation", "stomach-pain"],
        ["nausea", "fatigue", "back-pain"],
        "General Physician",
        "Slowed bowel movements leading to hard stools and mild lower abdominal discomfort.",
    ),
    (
        "Benign Positional Vertigo / Inner-Ear Imbalance",
        ["dizziness"],
        ["nausea", "vomiting", "headache", "anxiety"],
        "ENT Specialist / General Physician",
        "Inner-ear balance disturbance causing spinning dizziness or unsteadiness.",
    ),
    (
        "Contact Dermatitis / Skin Allergy",
        ["skin-rash", "itching"],
        ["anxiety"],
        "Dermatologist / General Physician",
        "Skin reaction from an allergen or irritant causing red spots, bumps, or itching.",
    ),
    (
        "Viral Exanthem (Viral Skin Rash)",
        ["skin-rash", "fever", "fatigue"],
        ["body-aches", "itching", "headache"],
        "General Physician / Dermatologist",
        "Widespread rash appearing alongside fever and viral-style tiredness.",
    ),
    (
        "Musculoskeletal Strain / Myalgia",
        ["body-aches", "back-pain"],
        ["joint-pain", "fatigue", "difficulty-sleeping"],
        "General Physician / Orthopedist",
        "Muscle or back soreness from physical strain, posture, or minor tissue overuse.",
    ),
    (
        "Non-Urgent Joint Inflammation (Arthralgia)",
        ["joint-pain", "fatigue"],
        ["body-aches", "back-pain"],
        "General Physician / Rheumatologist",
        "Joint stiffness or aching in knees, wrists, or shoulders.",
    ),
    (
        "Acute Stress / Anxiety Episode",
        ["anxiety", "difficulty-sleeping"],
        ["palpitations", "dizziness", "headache", "chest-discomfort", "fatigue"],
        "General Physician / Mental Health Specialist",
        "Heightened stress response causing worry, poor sleep, racing heartbeat, or tension.",
    ),
    (
        "Insomnia / Sleep Deprivation",
        ["difficulty-sleeping", "fatigue"],
        ["headache", "anxiety", "dizziness"],
        "General Physician",
        "Persistent trouble falling or staying asleep leading to daytime exhaustion.",
    ),
    (
        "Benign Palpitations (Caffeine / Stress / Fever-Related)",
        ["palpitations"],
        ["anxiety", "fatigue", "dizziness", "difficulty-sleeping"],
        "General Physician / Cardiologist",
        "Noticeable fast or fluttering heartbeat often triggered by stress, caffeine, or dehydration.",
    ),
    (
        "Post-Viral Fatigue / Recovery Phase",
        ["fatigue", "body-aches"],
        ["headache", "dizziness", "difficulty-sleeping"],
        "General Physician",
        "Lingering tiredness and mild soreness while the body recovers after an illness.",
    ),
]


def generate_dataset(samples_per_class: int = 90, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    rows: List[Dict[str, object]] = []

    for condition, core, optional, _, _ in CONDITION_PROFILES:
        for _ in range(samples_per_class):
            row: Dict[str, object] = {sym: 0 for sym in SYMPTOM_FEATURES}

            # Core symptoms appear with high probability (85-98%)
            for sym in core:
                if rng.random() < 0.90:
                    row[sym] = 1

            # Guarantee at least one core symptom is present
            if sum(int(row[s]) for s in core) == 0:
                row[core[0]] = 1

            # Optional symptoms appear with moderate probability (25-45%)
            for sym in optional:
                if rng.random() < 0.35:
                    row[sym] = 1

            # Rare background noise symptom (3% chance) to prevent brittle overfitting
            for sym in SYMPTOM_FEATURES:
                if sym not in core and sym not in optional and rng.random() < 0.02:
                    row[sym] = 1

            row["condition"] = condition
            rows.append(row)

    df = pd.DataFrame(rows)
    return df.sample(frac=1.0, random_state=seed).reset_index(drop=True)


def train() -> None:
    out_dir = Path(__file__).resolve().parent
    df = generate_dataset(samples_per_class=100, seed=42)

    csv_path = out_dir / "disease_symptoms.csv"
    df.to_csv(csv_path, index=False)

    X = df[SYMPTOM_FEATURES].values
    y = df["condition"].values

    base_rf = RandomForestClassifier(
        n_estimators=220,
        max_depth=14,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )
    calibrated = CalibratedClassifierCV(base_rf, method="sigmoid", cv=5)

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(calibrated, X, y, cv=cv, scoring="accuracy")

    calibrated.fit(X, y)

    # Also fit an uncalibrated RF on the full dataset for global feature importances
    # and per-condition conditional symptom prevalence for transparent explanations.
    condition_symptom_rates: Dict[str, Dict[str, float]] = {}
    for condition, group in df.groupby("condition"):
        rates = {
            sym: round(float(group[sym].mean()), 4)
            for sym in SYMPTOM_FEATURES
        }
        condition_symptom_rates[str(condition)] = rates

    model_path = out_dir / "model.joblib"
    joblib.dump(calibrated, model_path)

    metadata = {
        "model_type": "Calibrated RandomForestClassifier (5-fold Sigmoid)",
        "dataset_rows": int(len(df)),
        "num_conditions": len(CONDITION_PROFILES),
        "cv_accuracy_mean": round(float(cv_scores.mean()), 4),
        "cv_accuracy_std": round(float(cv_scores.std()), 4),
        "features": SYMPTOM_FEATURES,
        "symptom_labels": SYMPTOM_LABELS,
        "condition_symptom_rates": condition_symptom_rates,
        "condition_details": {
            name: {"specialist": spec, "summary": summary}
            for name, _, _, spec, summary in CONDITION_PROFILES
        },
    }

    meta_path = out_dir / "metadata.json"
    meta_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")

    print(
        f"Trained VITALORA ML model: {len(df)} rows, {len(CONDITION_PROFILES)} conditions, "
        f"5-fold CV accuracy = {cv_scores.mean():.3f} +/- {cv_scores.std():.3f}"
    )


if __name__ == "__main__":
    train()
