"""Explainability: SHAP values, feature importance, and per-prediction
explanations.

The output-shaping helpers (`mean_abs`, `rank_features`) are pure stdlib so they
are unit-testable; the SHAP computation lazily imports shap/numpy so the module
loads even where those are unavailable.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional, Sequence


def mean_abs(rows: Sequence[Sequence[float]]) -> List[float]:
    """Mean absolute value per column across rows (global SHAP importance)."""
    if not rows:
        return []
    n_cols = len(rows[0])
    sums = [0.0] * n_cols
    for row in rows:
        for j in range(n_cols):
            sums[j] += abs(row[j])
    return [s / len(rows) for s in sums]


def rank_features(
    importances: Sequence[float],
    feature_names: Optional[Sequence[str]] = None,
) -> List[Dict[str, Any]]:
    """Return features sorted by importance descending."""
    names = (
        list(feature_names)
        if feature_names is not None
        else [f"f{i}" for i in range(len(importances))]
    )
    items = [
        {"feature": names[i], "importance": round(float(importances[i]), 6)}
        for i in range(len(importances))
    ]
    items.sort(key=lambda x: x["importance"], reverse=True)
    return items


def explain(
    entry: Any,
    features: List[List[float]],
    sample_index: Optional[int] = None,
    feature_names: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """Compute SHAP-based global importance and an optional per-sample
    explanation for a trained model entry."""
    import numpy as np  # lazy
    import shap  # lazy

    model = entry.model
    X = np.asarray(features, dtype=float)

    explainer = shap.Explainer(model, X)
    shap_exp = explainer(X)
    values = np.asarray(shap_exp.values, dtype=float)

    # For multiclass, shap returns 3D values; collapse the class axis by mean.
    if values.ndim == 3:
        values = values.mean(axis=2)

    importance = mean_abs(values.tolist())
    ranked = rank_features(importance, feature_names)

    base_values = getattr(shap_exp, "base_values", None)
    base_value = (
        float(np.asarray(base_values).flatten()[0]) if base_values is not None else None
    )

    result: Dict[str, Any] = {
        "model_id": entry.id,
        "feature_importance": ranked,
        "base_value": base_value,
    }

    if sample_index is not None and 0 <= sample_index < len(values):
        names = feature_names or [f"f{i}" for i in range(len(values[sample_index]))]
        contributions = [
            {"feature": names[i], "contribution": round(float(values[sample_index][i]), 6)}
            for i in range(len(values[sample_index]))
        ]
        contributions.sort(key=lambda x: abs(x["contribution"]), reverse=True)
        result["sample_explanation"] = {
            "sample_index": sample_index,
            "contributions": contributions,
        }

    return result
