"""Clustering task: KMeans or DBSCAN. Unsupervised (no target)."""

from __future__ import annotations

from typing import Any, List, Optional, Tuple

import numpy as np
from sklearn.cluster import DBSCAN, KMeans
from sklearn.metrics import silhouette_score

DEFAULT = "kmeans"


def _build(algorithm: str, params: dict):
    if algorithm == "kmeans":
        return KMeans(**{"n_clusters": 3, "n_init": 10, "random_state": 0, **params})
    if algorithm == "dbscan":
        return DBSCAN(**{"eps": 0.5, "min_samples": 5, **params})
    raise ValueError(f"Unknown clustering algorithm: {algorithm}")


def train(
    features: List[List[float]],
    target: Optional[List[float]],
    algorithm: Optional[str],
    params: dict,
) -> Tuple[Any, str, dict]:
    algo = algorithm or DEFAULT
    X = np.asarray(features, dtype=float)
    model = _build(algo, params)
    labels = model.fit_predict(X)

    metrics: dict = {"n_clusters": int(len(set(int(l) for l in labels if l != -1)))}
    # Silhouette needs at least 2 clusters and fewer clusters than samples.
    unique = set(int(l) for l in labels)
    if len(unique) > 1 and len(unique) < len(X):
        try:
            metrics["silhouette"] = round(float(silhouette_score(X, labels)), 6)
        except Exception:
            metrics["silhouette"] = 0.0
    return model, algo, metrics


def predict(model: Any, features: List[List[float]]) -> List[int]:
    X = np.asarray(features, dtype=float)
    if hasattr(model, "predict"):
        return [int(l) for l in model.predict(X)]
    # DBSCAN has no predict; re-fit to assign labels.
    return [int(l) for l in model.fit_predict(X)]
