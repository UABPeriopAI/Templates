#!/bin/sh

python3 -m pip install pip setuptools wheel
python3 -m pip install -e ".[dev]"

#startup the MLFlow server
mlflow server --backend-store-uri sqlite:////data/DATASCI/lab_notebook/mlflow.db --default-artifact-root /data/DATASCI/lab_notebook/mlruns
