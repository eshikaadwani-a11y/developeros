"""Classification task: logistic regression, random forest, gradient boosting."""

from __future__ import annotations

from typing import Any, List, Optional, Tuple

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression

from ..metrics import classification_metrics

DEFAULT = "logistic"


def _build(algorithm: str, params: dict):
    if algorithm == "logistic":
        return LogisticRegression(**{"max_iter": 1000, **params})
    if algorithm == "random_forest":
        return RandomForestClassifier(**{"n_estimators": 200, "random_state": 0, **params})
    if algorithm == "xgboost":
        from xgboost import XGBClassifier

        return XGBClassifier(**{"n_estimators": 300, "random_state": 0, **params})
    if algorithm == "lightgbm":
        from lightgbm import LGBMClassifier

        return LGBMClassifier(**{"n_estimators": 300, "random_state": 0, **params})
    raise ValueError(f"Unknown classification algorithm: {algorithm}")


def train(
    features: List[List[float]],
    target: Optional[List[float]],
    algorithm: Optional[str],
    params: dict,
) -> Tuple[Any, str, dict]:
    if target is None:
        raise ValueError("classification requires a target vector")
    algo = algorithm or DEFAULT
    X = np.asarray(features, dtype=float)
    y = np.asarray(target)
    model = _build(algo, params)
    model.fit(X, y)
    preds = model.predict(X)
    metrics = classification_metrics(list(y), list(preds))
    return model, algo, metrics


def predict(model: Any, features: List[List[float]]) -> List[Any]:
    X = np.asarray(features, dtype=float)
    return [p.item() if hasattr(p, "item") else p for p in model.predict(X)]
