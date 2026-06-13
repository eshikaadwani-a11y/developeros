"""In-memory model registry. Pure stdlib so it is unit-testable.

In production this would be backed by object storage + a metadata collection;
the interface stays the same.
"""

from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Dict, List


@dataclass
class ModelEntry:
    id: str
    task: str
    algorithm: str
    model: Any
    metrics: Dict[str, float]
    feature_count: int
    created_at: float = field(default_factory=time.time)


class ModelRegistry:
    def __init__(self) -> None:
        self._entries: Dict[str, ModelEntry] = {}

    def put(
        self,
        *,
        task: str,
        algorithm: str,
        model: Any,
        metrics: Dict[str, float],
        feature_count: int,
    ) -> str:
        model_id = uuid.uuid4().hex
        self._entries[model_id] = ModelEntry(
            id=model_id,
            task=task,
            algorithm=algorithm,
            model=model,
            metrics=metrics,
            feature_count=feature_count,
        )
        return model_id

    def get(self, model_id: str) -> ModelEntry:
        if model_id not in self._entries:
            raise KeyError(f"Unknown model id: {model_id}")
        return self._entries[model_id]

    def has(self, model_id: str) -> bool:
        return model_id in self._entries

    def list(self) -> List[dict]:
        return [
            {
                "id": e.id,
                "task": e.task,
                "algorithm": e.algorithm,
                "metrics": e.metrics,
                "feature_count": e.feature_count,
                "created_at": e.created_at,
            }
            for e in sorted(self._entries.values(), key=lambda x: x.created_at, reverse=True)
        ]


# Process-wide registry instance.
registry = ModelRegistry()
