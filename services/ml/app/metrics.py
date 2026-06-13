"""Dependency-free metric implementations.

Kept pure (stdlib only) so they are unit-testable without numpy/sklearn and so
the task modules report consistent metrics regardless of the estimator used.
"""

from __future__ import annotations

import math
from typing import Sequence


def rmse(y_true: Sequence[float], y_pred: Sequence[float]) -> float:
    n = len(y_true)
    if n == 0:
        return 0.0
    se = sum((a - b) ** 2 for a, b in zip(y_true, y_pred))
    return math.sqrt(se / n)


def mae(y_true: Sequence[float], y_pred: Sequence[float]) -> float:
    n = len(y_true)
    if n == 0:
        return 0.0
    return sum(abs(a - b) for a, b in zip(y_true, y_pred)) / n


def r2_score(y_true: Sequence[float], y_pred: Sequence[float]) -> float:
    n = len(y_true)
    if n == 0:
        return 0.0
    mean = sum(y_true) / n
    ss_tot = sum((a - mean) ** 2 for a in y_true)
    ss_res = sum((a - b) ** 2 for a, b in zip(y_true, y_pred))
    if ss_tot == 0:
        return 0.0
    return 1.0 - ss_res / ss_tot


def accuracy(y_true: Sequence, y_pred: Sequence) -> float:
    n = len(y_true)
    if n == 0:
        return 0.0
    correct = sum(1 for a, b in zip(y_true, y_pred) if a == b)
    return correct / n


def f1_macro(y_true: Sequence, y_pred: Sequence) -> float:
    """Macro-averaged F1 across all observed labels."""
    labels = sorted(set(y_true) | set(y_pred))
    if not labels:
        return 0.0
    f1s = []
    for label in labels:
        tp = sum(1 for a, b in zip(y_true, y_pred) if a == label and b == label)
        fp = sum(1 for a, b in zip(y_true, y_pred) if a != label and b == label)
        fn = sum(1 for a, b in zip(y_true, y_pred) if a == label and b != label)
        precision = tp / (tp + fp) if (tp + fp) else 0.0
        recall = tp / (tp + fn) if (tp + fn) else 0.0
        f1 = (
            2 * precision * recall / (precision + recall)
            if (precision + recall)
            else 0.0
        )
        f1s.append(f1)
    return sum(f1s) / len(f1s)


def regression_metrics(y_true: Sequence[float], y_pred: Sequence[float]) -> dict:
    return {
        "rmse": round(rmse(y_true, y_pred), 6),
        "mae": round(mae(y_true, y_pred), 6),
        "r2": round(r2_score(y_true, y_pred), 6),
    }


def classification_metrics(y_true: Sequence, y_pred: Sequence) -> dict:
    return {
        "accuracy": round(accuracy(y_true, y_pred), 6),
        "f1_macro": round(f1_macro(y_true, y_pred), 6),
    }
