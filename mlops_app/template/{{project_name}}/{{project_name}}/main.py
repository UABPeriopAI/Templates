import warnings
import typer
import mlflow
from pathlib import Path
import pandas as pd
import joblib

from {{project_name}}.config.config import {{project_name}}Config
from config.config import logger
from {{project_name}} import data, train, plotter

app = typer.Typer()
warnings.filterwarnings("ignore")

DATA_PATH = "simple_data.csv"
MODEL_PATH = "{{project_name}}/config/model.pkl"

@app.command()
def preprocess(
    data_path: str = DATA_PATH,
    test_run: bool = True,
):
    clean_path = data.preprocess_data(data_path)
    if not test_run:
        mlflow.log_artifact(clean_path)
        df_clean = pd.read_csv(clean_path)
        mlflow.log_param("rows_cleaned", df_clean.shape[0])

@app.command()
def train_cmd(
    data_path: str = DATA_PATH.replace(".csv", "_clean.csv"),
    model_path: str = MODEL_PATH,
    test_run: bool = False,
):
    score = train.train_model(data_path, model_path)
    if not test_run:
        mlflow.log_artifact(model_path)
        mlflow.log_metric("r2_score", score)

@app.command()
def process(
    data_path: str = DATA_PATH.replace(".csv", "_clean.csv"),
    model_path: str = MODEL_PATH,
    test_run: bool = False,
):
    model = joblib.load(model_path)
    df = pd.read_csv(data_path)
    X = df[["x"]]
    preds = model.predict(X)
    df["pred"] = preds
    pred_path = data_path.replace("_clean.csv", "_pred.csv")
    df.to_csv(pred_path, index=False)
    logger.info(f"Saved predictions to {pred_path}")
    if not test_run:
        mlflow.log_artifact(pred_path)
        mlflow.log_metric("mean_pred", preds.mean())

@app.command()
def evaluate(
    data_path: str = DATA_PATH.replace(".csv", "_pred.csv"),
    test_run: bool = False,
):
    df = pd.read_csv(data_path)
    y_true = df["y"]
    y_pred = df["pred"]
    mse = ((y_true - y_pred) ** 2).mean()
    logger.info(f"Evaluation MSE: {mse:.3f}")
    try:
        plotter.plot_regression(y_true, y_pred, out_path="eval_plot.png")
        logger.info("Saved plot eval_plot.png")
        if not test_run:
            mlflow.log_artifact("eval_plot.png")
    except Exception as e:
        logger.info(f"Plotting failed: {e}")
    if not test_run:
        mlflow.log_metric("mse", mse)

if __name__ == "__main__":
    app()
