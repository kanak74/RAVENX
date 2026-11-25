import unittest
from pydantic import ValidationError

from ml.predictor import PredictRequest, get_model_health, run_prediction


class TestVitaloraMlPredictor(unittest.TestCase):
    def test_model_health(self):
        health = get_model_health()
        self.assertEqual(health["status"], "ready")
        self.assertGreaterEqual(health["cvAccuracy"], 0.75)
        self.assertEqual(health["numConditions"], 20)

    def test_flu_pattern_prediction_with_influences(self):
        req = PredictRequest(symptoms=["fever", "chills", "body-aches", "fatigue"])
        res = run_prediction(req)
        self.assertEqual(res["status"], "ok")
        self.assertFalse(res["insufficientData"])
        self.assertGreater(len(res["predictions"]), 0)
        top = res["predictions"][0]
        self.assertIn("Influenza", top["condition"])
        self.assertLessEqual(top["confidencePercent"], 92)
        self.assertGreater(len(top["influencingSymptoms"]), 0)

    def test_emergency_precheck_pauses_ml(self):
        req = PredictRequest(symptoms=["severe-chest-pain", "difficulty-breathing"])
        res = run_prediction(req)
        self.assertEqual(res["status"], "emergency")
        self.assertEqual(res["predictions"], [])
        self.assertGreaterEqual(len(res["emergencyTriggers"]), 2)

    def test_insufficient_data_returns_empty_predictions(self):
        req = PredictRequest(symptoms=[])
        res = run_prediction(req)
        self.assertEqual(res["status"], "insufficient_data")
        self.assertTrue(res["insufficientData"])
        self.assertEqual(res["predictions"], [])

    def test_invalid_vitals_rejected(self):
        with self.assertRaises(ValidationError):
            PredictRequest(symptoms=["fever"], temperatureCelsius=55.0)
        with self.assertRaises(ValidationError):
            PredictRequest(symptoms=["cough"], spo2=120.0)


if __name__ == "__main__":
    unittest.main()
