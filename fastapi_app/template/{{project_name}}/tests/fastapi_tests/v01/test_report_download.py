from fastapi.testclient import TestClient

from app.server import app

from fastapi.testclient import TestClient

from app.server import app


def test_report_download():
    """
    Tests the POST method for the IRB Assistant with a full request body
    """
    # Create a test client using the FastAPI application
    client = TestClient(app)
    # URL for the POST request
    url = "/app/v01/tab2"

    # Headers
    headers = {"accept": "application/json", "Content-Type": "application/json"}
    # Make the POST request using the json= keyword
    response = client.post(url, headers=headers)
    print("response - ", response)
    # Assertions to verify the response status and content
    assert response.status_code == 200, "Should return a 200 OK status code"
    assert (
        "application/json" in response.headers["content-type"]
    ), "Response content type should be application/json"
    # Assert response data contains expected keys
    response_data = response.json()
    print("response_data - ", response_data)
    assert "encoded_docx" in response_data, "Response should contain the 'encoded_docx' key"
    assert len(response_data["encoded_docx"]) > 0, "The 'encoded_docx' content should not be empty"
