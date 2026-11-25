"""Vercel Python Serverless Function for /api/predict."""

from __future__ import annotations

import json
import sys
from http.server import BaseHTTPRequestHandler
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from pydantic import ValidationError
from ml.predictor import PredictRequest, get_model_health, run_prediction


class handler(BaseHTTPRequestHandler):
    def _send_json(self, status_code: int, payload: dict) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        try:
            self._send_json(200, get_model_health())
        except Exception as exc:
            self._send_json(500, {"error": f"Model load error: {exc}"})

    def do_POST(self) -> None:
        try:
            length = int(self.headers.get("Content-Length", "0"))
            raw = self.rfile.read(length) if length > 0 else b"{}"
            data = json.loads(raw.decode("utf-8"))
            req = PredictRequest(**data)
            result = run_prediction(req)
            self._send_json(200, result)
        except ValidationError as exc:
            self._send_json(400, {"error": "Invalid input", "details": exc.errors()})
        except json.JSONDecodeError:
            self._send_json(400, {"error": "Malformed JSON body"})
        except Exception as exc:
            self._send_json(500, {"error": f"Prediction failed: {exc}"})
