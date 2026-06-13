"""FastAPI entrypoint for the DeveloperOS ML microservice."""

from __future__ import annotations

from fastapi import FastAPI, HTTPException

from . import __version__, service
from .registry import registry
from .schemas import (
    ExplainRequest,
    ExplainResponse,
    ModelInfo,
    PredictRequest,
    PredictResponse,
    TrainRequest,
    TrainResponse,
)

app = FastAPI(title="DeveloperOS ML Service", version=__version__)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "version": __version__, "tasks": service.supported_tasks()}


@app.post("/train", response_model=TrainResponse)
def train(req: TrainRequest) -> TrainResponse:
    try:
        result = service.train(
            task=req.task,
            features=req.features,
            target=req.target,
            algorithm=req.algorithm,
            params=req.params,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return TrainResponse(**result)


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest) -> PredictResponse:
    if not registry.has(req.model_id):
        raise HTTPException(status_code=404, detail="Unknown model id")
    result = service.predict(req.model_id, req.features)
    return PredictResponse(**result)


@app.get("/models", response_model=list[ModelInfo])
def list_models() -> list[ModelInfo]:
    return [ModelInfo(**m) for m in registry.list()]


@app.post("/explain", response_model=ExplainResponse)
def explain(req: ExplainRequest) -> ExplainResponse:
    if not registry.has(req.model_id):
        raise HTTPException(status_code=404, detail="Unknown model id")
    try:
        result = service.explain(
            req.model_id, req.features, req.sample_index, req.feature_names
        )
    except Exception as exc:  # SHAP/runtime errors -> 400
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return ExplainResponse(**result)
