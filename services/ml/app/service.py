"""Task dispatch: routes train/predict requests to the right task module and
manages the model registry."""

from __future__ import annotations

from typing import Any, List, Optional

from .registry import registry
from .tasks import anomaly, classification, clustering, forecasting, regression

TASKS = {
    "regression": regression,
    "classification": classification,
    "clustering": clustering,
    "forecasting": forecasting,
    "anomaly": anomaly,
}

SUPERVISED = {"regression", "classification"}


def supported_tasks() -> List[str]:
    return list(TASKS.keys())


def train(
    task: str,
    features: List[List[float]],
    target: Optional[List[float]],
    algorithm: Optional[str],
    params: dict,
) -> dict:
    if task not in TASKS:
        raise ValueError(f"Unknown task: {task}. Supported: {supported_tasks()}")
    if not features:
        raise ValueError("features must be a non-empty 2D array")

    module = TASKS[task]
    model, algo, metrics = module.train(features, target, algorithm, params)

    feature_count = len(features[0]) if features and features[0] else 0
    model_id = registry.put(
        task=task,
        algorithm=algo,
        model=model,
        metrics=metrics,
        feature_count=feature_count,
    )
    return {
        "model_id": model_id,
        "task": task,
        "algorithm": algo,
        "metrics": metrics,
        "feature_count": feature_count,
    }


def predict(model_id: str, features: List[List[float]]) -> dict:
    entry = registry.get(model_id)
    module = TASKS[entry.task]
    predictions = module.predict(entry.model, features)
    return {"model_id": model_id, "predictions": predictions}
