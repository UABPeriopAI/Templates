# Test Style Guide (FastAPI + Gradio)

This guide covers shared testing rules for endpoints that trigger LLM workflows.
It applies to both FastAPI and Gradio apps; framework-specific notes are included
where needed.

## Credential Requirements (Mandatory)
Every test that touches LLM workflows must:
- Include `openai_compatible_endpoint` in the JSON payload.
- Include `openai_compatible_model` in the JSON payload.
- Include `Authorization: Bearer <api_key>` in the request headers.

If any of these are missing, tests must assert a client error response.

## What to Mock (and Why)
- The object that performs LLM calls (e.g., Chat/LLM class) to avoid network calls.
- The prompt handling helper (e.g., `PromptyHandler.generate_response`) for deterministic output.
- The RAG handler or retrieval layer (`RAGResponseHandler` or `aug_service.retrieve_data`).
- `tiktoken.encoding_for_model` if referenced.

## Mock Shapes
- `PromptyHandler.generate_response` returns `(result_object, result_meta)`.
  - `result_object.content` is a string.
  - `result_meta` includes any fields your code reads (e.g., `.total_cost`).

## Patch Locations
Patch symbols where they are imported by the module under test.
Example: if `meeting_notes.workflows` imports `PromptyHandler`, patch
`meeting_notes.workflows.PromptyHandler.generate_response`.

## Assertions
- Success path returns 200 and the expected shape (e.g., `{"content": "<string>"}`).
- Missing endpoint/model or Authorization header returns a 4xx client error.
- Downstream LLM errors (simulated via mocks) raise a 5xx error.

## Framework-Specific Notes

### Gradio
- Use `gradio_client.Client` against the running app.
- Pass headers at client initialization.
- If your client helper cannot pass headers, use `requests.post` against
  `/api/<api_name>` and include `Authorization`.

Example:
```python
from unittest.mock import Mock, patch
from gradio_client import Client

def test_idea_endpoint_happy_path():
    payload = {
        "query": "test query",
        "source": "mpog",
        "openai_compatible_endpoint": "https://example-openai-compatible-host/",
        "openai_compatible_model": "gpt-4-azure",
    }
    headers = {"Authorization": "Bearer test-api-key-123"}

    with patch("meeting_notes.workflows.PromptyHandler.generate_response") as mock_generate:
        result_object = Mock()
        result_object.content = "mocked content"
        result_meta = Mock()
        result_meta.total_cost = 0.0
        mock_generate.return_value = (result_object, result_meta)

        client = Client("http://localhost:7860", headers=headers)
        response = client.predict(payload, api_name="/idea_v01")
        assert response["content"] == "mocked content"
```

### FastAPI
- Use `fastapi.testclient.TestClient` against the app object.
- Pass headers with each request.

Example:
```python
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from app.server import app

client = TestClient(app)

def test_idea_endpoint_happy_path():
    payload = {
        "query": "test query",
        "source": "mpog",
        "openai_compatible_endpoint": "https://example-openai-compatible-host/",
        "openai_compatible_model": "gpt-4-azure",
    }
    headers = {"Authorization": "Bearer test-api-key-123"}

    with patch("meeting_notes.workflows.PromptyHandler.generate_response") as mock_generate:
        result_object = Mock()
        result_object.content = "mocked content"
        result_meta = Mock()
        result_meta.total_cost = 0.0
        mock_generate.return_value = (result_object, result_meta)

        response = client.post("/idea/v01/", json=payload, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["content"] == "mocked content"
```
