"""Regression task: linear, random forest, gradient boosting (XGBoost/LightGBM)."""

from __future__ import annotations

from typing import Any, List, Optional, Tuple

import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression

from ..metrics import regression_metrics

DEFAULT = "linear"


def _build(algorithm: str, params: dict):
    if algorithm == "linear":
        return LinearRegression(**params)
    if algorithm == "random_forest":
        return RandomForestRegressor(**{"n_estimators": 200, "random_state": 0, **params})
    if algorithm == "xgboost":
        from xgboost import XGBRegressor  # optional dependency

        return XGBRegressor(**{"n_estimators": 300, "random_state": 0, **params})
    if algorithm == "lightgbm":
        from lightgbm import LGBMRegressor  # optional dependency

        return LGBMRegressor(**{"n_estimators": 300, "random_state": 0, **params})
    raise ValueError(f"Unknown regression algorithm: {algorithm}")


def train(
    features: List[List[float]],
    target: Optional[List[float]],
    algorithm: Optional[str],
    params: dict,
) -> Tuple[Any, str, dict]:
    if target is None:
        raise ValueError("regression requires a target vector")
    algo = algorithm or DEFAULT
    X = np.asarray(features, dtype=float)
    y = np.asarray(target, dtype=float)
    model = _build(algo, params)
    model.fit(X, y)
    preds = model.predict(X)
    metrics = regression_metrics(y.tolist(), [float(p) for p in preds])
    return model, algo, metrics


def predict(model: Any, features: List[List[float]]) -> List[float]:
    X = np.asarray(features, dtype=float)
    return [float(p) for p in model.predict(X)]
