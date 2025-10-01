import json
import os

import pytest
from fastapi.testclient import TestClient


# def load_secrets(secrets_dir="secrets/"):
#     """
#     Load each file in the specified directory as an environment variable.
#     The name of the environment variable is derived from the filename.
#     """
#     for filename in os.listdir(secrets_dir):
#         file_path = os.path.join(secrets_dir, filename)
#         with open(file_path, "r") as secret_file:
#             # Assuming the filename is the name of the environment variable
#             env_var_name = filename.replace(".txt", "")
#             env_var_value = secret_file.read().strip()
#             os.environ[env_var_name] = env_var_value


# @pytest.fixture(scope="session", autouse=True)
# def set_env_vars():
#     """
#     A fixture that automatically loads all secrets into environment variables.
#     This fixture runs once per session and automatically before any tests are run.
#     """
#     load_secrets()


@pytest.fixture
def client():
    """
    The function `client()` sets up a test client for interacting with a Flask application.
    """
    # import here. secret loading will screw this up otherwise
    from app.server import app

    with TestClient(app) as client:
        yield client


@pytest.fixture
def validate_encoded_response():
    def validate(resp, expected_content_type, key):
        assert resp.status_code == 200
        assert expected_content_type in resp.headers["content-type"]
        assert key in resp.json()
        assert len(resp.json()[key]) > 0

    return validate


# TODO: API Utils?
@pytest.fixture
def perform_post_request():
    def do_post(client, url, data):
        headers = {"accept": "application/json", "Content-Type": "application/json"}
        return client.post(url, content=json.dumps(data).encode("utf-8"), headers=headers)

    return do_post


@pytest.fixture
def encoded_data():
    # Path to the encoded file content
    path_to_encoded_file = "tests/fastapi_tests/assets/csv_file_bytes.txt"
    with open(path_to_encoded_file, "r") as file:
        return file.read().strip()
