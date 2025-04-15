import warnings
from pathlib import Path
from typing import Dict
import mlflow
import typer

from config import config
from config.config import logger

# Initialize Typer CLI app
app = typer.Typer()
warnings.filterwarnings("ignore")

@app.command()
def preprocess(
    experiment_name: str = 'Preprocessing',
    args_pre: str = "config/args_preprocess.json",
    test_run: bool = True,
):
    #Preprocessing code goes here:

    #Log preproccesing
    logger.info("✅ sucessfully preprocessed data")
    if not test_run:     
        mlflow.set_experiment(experiment_name)
        with mlflow.start_run() as run:
            run_id = mlflow.active_run().info.run_id
            mlflow.log_params(args_pre)
            mlflow.log_param("run_id", run_id)
            mlflow.log_param("output_filepath", config.EXAMPLE_OUTPUT)

@app.command()
def train(
    args_tr: str = "config/args_train.json",
    experiment_name: str = "training",
    test_run: bool = False,
) -> None:
    if not test_run:
        mlflow.set_experiment(experiment_name)
        with mlflow.start_run():
            run_id = mlflow.active_run().info.run_id
            mlflow.log_params(args_tr)

@app.command()
def process(
    args_pro: str = "config/args_process.json",
    experiment_name: str = "process",
    run_name: str = "process",
    test_run: bool = False,
) -> None:
    #processing code goes here (e.g., model inference):

    #Log
    logger.info("✅ sucessfully processed data")
    mlflow.set_experiment(experiment_name)
    #Example MLFlow call
    if not test_run:
        with mlflow.start_run(run_name=run_name) as run:
            run_id = mlflow.active_run().info.run_id
            mlflow.log_params(args_pro)

@app.command()
def evaluate(
    experiment_name: str = "evaluation",
    test_run: bool = False,
):
    raise(NotImplementedError)


if __name__ == "__main__":
    app()  # pragma: no cover, live app
