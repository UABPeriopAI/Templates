import warnings
import typer
import mlflow
from pathlib import Path
import pandas as pd
import joblib

from {{project_name}}.config.config import {{project_name}}Config
from config.config import logger
from {{project_name}} import data, train, plotter, report

app = typer.Typer()
warnings.filterwarnings("ignore")

DATA_PATH = "simple_data.csv"
# MODEL_PATH removed as it is not used directly


@app.command()
def run_pipeline(
    data_path: str = DATA_PATH,
    report_path: str = "report.zip",
    fig_path: str = "eval_plot.png",
    test_run: bool = False,
):
    # Step 1: Preprocess
    clean_path = data.preprocess_data(data_path)
    if not test_run:
        mlflow.log_artifact(clean_path)
        df_clean = pd.read_csv(clean_path)
        mlflow.log_param("rows_cleaned", df_clean.shape[0])

    # Step 2: Train
    # Step 2: Train
    model_path = clean_path.replace("_clean.csv", "_model.pkl")
    score = train.train_model(clean_path, model_path)
    if not test_run:
        mlflow.log_artifact(model_path)
        mlflow.log_metric("r2_score", score)

    # Step 3: Predict
    model = joblib.load(model_path)
    df = pd.read_csv(clean_path)
    X = df[["x"]]
    preds = model.predict(X)
    df["pred"] = preds
    pred_path = clean_path.replace("_clean.csv", "_pred.csv")
    df.to_csv(pred_path, index=False)
    logger.info(f"Saved predictions to {pred_path}")
    if not test_run:
        mlflow.log_artifact(pred_path)
        mlflow.log_metric("mean_pred", preds.mean())

    # Step 4: Evaluate
    y_true = df["y"]
    y_pred = df["pred"]
    mse = ((y_true - y_pred) ** 2).mean()
    logger.info(f"Evaluation MSE: {mse:.3f}")
    try:
        plotter.plot_regression(y_true, y_pred, out_path=fig_path)
        logger.info(f"Saved plot {fig_path}")
        if not test_run:
            mlflow.log_artifact(fig_path)
    except Exception as e:
        logger.info(f"Plotting failed: {e}")
    if not test_run:
        mlflow.log_metric("mse", mse)

    # Step 5: Build report
    zip_bytes = report.build_report(pred_path, fig_path)
    with open(report_path, "wb") as f:
        f.write(zip_bytes.read())
    logger.info(f"Report saved to {report_path}")

if __name__ == "__main__":
    app()
