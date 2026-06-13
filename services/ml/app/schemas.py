"""Request/response models for the ML service API."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

Task = str  # "regression" | "classification" | "clustering" | "forecasting" | "anomaly"


class TrainRequest(BaseModel):
    task: Task = Field(..., description="One of: regression, classification, clustering, forecasting, anomaly")
    algorithm: Optional[str] = Field(None, description="Algorithm name; task default if omitted")
    features: List[List[float]] = Field(..., description="2D feature matrix (rows = samples)")
    target: Optional[List[float]] = Field(None, description="Target vector (required for supervised tasks)")
    params: Dict[str, Any] = Field(default_factory=dict)


class TrainResponse(BaseModel):
    model_id: str
    task: Task
    algorithm: str
    metrics: Dict[str, float]
    feature_count: int


class PredictRequest(BaseModel):
    model_id: str
    features: List[List[float]]


class PredictResponse(BaseModel):
    model_id: str
    predictions: List[Any]


class ModelInfo(BaseModel):
    id: str
    task: Task
    algorithm: str
    metrics: Dict[str, float]
    feature_count: int
    created_at: float
