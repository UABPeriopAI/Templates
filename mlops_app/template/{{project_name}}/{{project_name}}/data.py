import pandas as pd
from config.config import logger

def preprocess_data(data_path: str, clean_path: str = None) -> str:
    """Load CSV, drop NA, save cleaned CSV, return path."""
    df = pd.read_csv(data_path)
    logger.info(f"Loaded data shape: {df.shape}")
    df_clean = df.dropna()
    logger.info(f"After dropna: {df_clean.shape}")
    if clean_path is None:
        clean_path = data_path.replace(".csv", "_clean.csv")
    df_clean.to_csv(clean_path, index=False)
    logger.info(f"Saved cleaned data to {clean_path}")
    return clean_path