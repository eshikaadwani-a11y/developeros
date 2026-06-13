# DeveloperOS ML Service

A Python FastAPI microservice providing the ML workspace: regression,
classification, clustering, forecasting, and anomaly detection — plus SHAP
explainability (see Milestone 9).

## Run

```bash
cd services/ml
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Endpoints

| Method | Path        | Description                                  |
| ------ | ----------- | -------------------------------------------- |
| GET    | `/health`   | Service status and supported tasks           |
| POST   | `/train`    | Train a model; returns `model_id` + metrics  |
| POST   | `/predict`  | Predict with a trained model                 |
| GET    | `/models`   | List trained models                          |

### Train request

```json
{
  "task": "regression",
  "algorithm": "random_forest",
  "features": [[1], [2], [3], [4]],
  "target": [2, 4, 6, 8],
  "params": {}
}
```

### Tasks & algorithms

| Task           | Algorithms                                   |
| -------------- | -------------------------------------------- |
| regression     | linear, random_forest, xgboost, lightgbm     |
| classification | logistic, random_forest, xgboost, lightgbm   |
| clustering     | kmeans, dbscan                               |
| forecasting    | linear_ar (autoregressive lag features)      |
| anomaly        | isolation_forest                             |

## Tests

The dependency-free core (metrics, registry) is covered by stdlib tests:

```bash
python -m unittest discover -s tests
```
