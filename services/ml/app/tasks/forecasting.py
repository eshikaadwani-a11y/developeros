"""Forecasting task: lag-feature regression over a univariate series.

The `features` matrix is treated as a single column time series (one value per
row). We build autoregressive lag features and fit a linear model, then forecast
`horizon` steps ahead recursively.
"""

from __future__ import annotations

from typing import Any, List, Optional, Tuple

import numpy as np
from sklearn.linear_model import LinearRegression

DEFAULT = "linear_ar"


class ARForecaster:
    """Minimal autoregressive forecaster with a fixed lag window."""

    def __init__(self, lags: int = 3):
        self.lags = lags
        self.model = LinearRegression()
        self.history: List[float] = []

    def fit(self, series: List[float]) -> None:
        self.history = list(series)
        X, y = [], []
        for i in range(self.lags, len(series)):
            X.append(series[i - self.lags : i])
            y.append(series[i])
        if not X:
            raise ValueError("series too short for the configured lag window")
        self.model.fit(np.asarray(X, dtype=float), np.asarray(y, dtype=float))

    def forecast(self, horizon: int) -> List[float]:
        window = list(self.history[-self.lags :])
        out: List[float] = []
        for _ in range(horizon):
            pred = float(self.model.predict(np.asarray([window], dtype=float))[0])
            out.append(pred)
            window = window[1:] + [pred]
        return out


def train(
    features: List[List[float]],
    target: Optional[List[float]],
    algorithm: Optional[str],
    params: dict,
) -> Tuple[Any, str, dict]:
    algo = algorithm or DEFAULT
    series = target if target is not None else [row[0] for row in features]
    lags = int(params.get("lags", 3))
    model = ARForecaster(lags=lags)
    model.fit([float(v) for v in series])

    # In-sample fit quality.
    from ..metrics import regression_metrics

    fitted = []
    for i in range(lags, len(series)):
        fitted.append(
            float(model.model.predict(np.asarray([series[i - lags : i]], dtype=float))[0])
        )
    metrics = regression_metrics([float(v) for v in series[lags:]], fitted)
    metrics["lags"] = lags
    return model, algo, metrics


def predict(model: Any, features: List[List[float]]) -> List[float]:
    # For forecasting, `features` carries the horizon as [[horizon]].
    horizon = int(features[0][0]) if features and features[0] else 1
    return model.forecast(horizon)
