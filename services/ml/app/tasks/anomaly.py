"""Anomaly detection task: IsolationForest. Returns -1 for anomalies, 1 for inliers."""

from __future__ import annotations

from typing import Any, List, Optional, Tuple

import numpy as np
from sklearn.ensemble import IsolationForest

DEFAULT = "isolation_forest"


def _build(algorithm: str, params: dict):
    if algorithm == "isolation_forest":
        return IsolationForest(**{"random_state": 0, "contamination": "auto", **params})
    raise ValueError(f"Unknown anomaly algorithm: {algorithm}")


def train(
    features: List[List[float]],
    target: Optional[List[float]],
    algorithm: Optional[str],
    params: dict,
) -> Tuple[Any, str, dict]:
    algo = algorithm or DEFAULT
    X = np.asarray(features, dtype=float)
    model = _build(algo, params)
    model.fit(X)
    labels = model.predict(X)
    anomalies = int(sum(1 for l in labels if l == -1))
    metrics = {
        "n_samples": int(len(X)),
        "anomalies": anomalies,
        "anomaly_rate": round(anomalies / len(X), 6) if len(X) else 0.0,
    }
    return model, algo, metrics


def predict(model: Any, features: List[List[float]]) -> List[int]:
    X = np.asarray(features, dtype=float)
    return [int(l) for l in model.predict(X)]
