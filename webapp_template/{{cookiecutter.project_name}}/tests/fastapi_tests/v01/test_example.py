def test_example(
    client, perform_post_request
):
    """
    Test a successful request to /cv/v01/example with a valid name.
    """
    # The endpoint to test
    url = "/cv/v01/example"

    # The payload including all necessary fields from ExampleRequest
    payload = {
        "name" : "Test"
    }

    # Make the POST request
    response = perform_post_request(client, url, payload)
    
    assert response.status_code == 200
    assert response.json() == "Test"