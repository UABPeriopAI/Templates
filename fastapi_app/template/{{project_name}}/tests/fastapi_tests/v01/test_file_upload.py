import base64
import json
import pandas as pd

def test_file_upload(client, encoded_data):
    """
    Tests the POST method for drafting a introduction to ensure it handles the input correctly and returns the expected response.
    """
    # URL for the POST request
    url = "/app/v01/tab1"

    # The payload containing the base64-encoded DOCX file
    # Ensure areas_of_excellence is a list of enum values
    payload = {
        "file_encoded": encoded_data,
        "extension": "csv"
    }

    # Headers
    headers = {"accept": "application/json", "Content-Type": "application/json"}

    # Make the POST request
    response = client.post(url, content=json.dumps(payload).encode("utf-8"), headers=headers)

    # Assertions to verify the response status and content
    assert response.status_code == 200, "Should return a 200 OK status code"
    assert (
        "application/json" in response.headers["content-type"]
    ), "Response content type should be application/json"

    data = response.json()
    # Check required for top-level keys
    assert "name" in data, "'name' key must be in response"
    assert data["name"] == "Data", "Name key should be 'Data'"