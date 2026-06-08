import pandas as pd


# Add any project-specific utility functions here.
def upload_example(file_path: str) -> pd.DataFrame:
    """
    Task A example: read an uploaded CSV and return a short preview.
    """
    return pd.read_csv(file_path).head()


def download_example(handler) -> str:
    """
    Task B example: generate a dummy report and return the output file path.
    """
    return handler.generate_dummy_report_file()
