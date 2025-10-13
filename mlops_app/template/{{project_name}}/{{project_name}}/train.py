import pandas as pd
from sklearn.linear_model import LinearRegression
import joblib
from config.config import logger

def train_model(data_path: str, model_path: str) -> float:
    """Train linear regression and save model. Returns R2 score."""
    df = pd.read_csv(data_path)
    X = df[["x"]]
    y = df["y"]
    model = LinearRegression()
    model.fit(X, y)
    score = model.score(X, y)
    joblib.dump(model, model_path)
    logger.info(f"Trained LinearRegression, R2 score: {score:.3f}")
    logger.info(f"Saved model to {model_path}")
    return score