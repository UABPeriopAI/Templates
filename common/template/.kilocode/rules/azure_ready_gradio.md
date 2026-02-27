
# LLM Credentials: Client-Supplied Only (Gradio / OpenAI-compatible endpoints)

This document is a precise, prescriptive reference for implementers and test-writers. It clarifies the new, strict policy: clients must supply LLM credentials on every request. There is no fallback to configuration, environment variables, Docker secrets, or any global/static object — with one narrow exception for non-LLM sensitive values managed via aiweb_common helpers (see "Non-LLM sensitive values" below).

Use this document as: Requirements → Rationale → Examples → Testing / Mocks → Notes.

---

## Requirements (must-read, top of file)

- Every request that may trigger an LLM call MUST include these JSON fields in the request body:
  - `openai_compatible_endpoint` — the full URL (string) of the OpenAI-compatible endpoint to call.
  - `openai_compatible_model` — the model name (string) to use at that endpoint.

- Every request MUST include the API key in the HTTP `Authorization` header using the Bearer scheme:
  - Example header:
    ```
    Authorization: Bearer <api_key>
    ```

- There is absolutely NO fallback for LLM credentials. Under no circumstances will the server:
  - Read an LLM API key from configuration files, environment variables, Docker secrets, or any global/static object.
  - Use any server-side default model or endpoint when client-provided values are missing.
  - Accept a missing header or missing JSON endpoint/model and substitute values from the application config.

- Endpoints that perform LLM calls MUST validate for these credentials and return a client error when the required fields are missing. For Gradio handlers, raise `gr.Error` and let the API layer translate to a 4xx response.

---

## Rationale

- Multi-tenant and custom-hosting scenarios require the client to control which LLM endpoint and model are used per request.
- Explicit credentials per-request avoid accidental credential leakage across tenants and remove ambiguity from tests and deploys.
- Tests and implementers must be explicit: provide endpoint + model in JSON, and API key in Authorization header.

---

## Where this applies

- Any Gradio endpoint (`api_name`) that triggers an LLM call must follow this policy. For example, the workflow code referenced in [`meeting_notes/workflows.py`](meeting_notes/workflows.py:1) and the request models defined under [`app/v01/schemas.py`](app/v01/schemas.py:1) should reflect and validate these fields.
- Update request schemas and Gradio handlers so that the JSON body contains `openai_compatible_endpoint` and `openai_compatible_model`, and so the code reads the API key from `Authorization` header for each request.

---

## Example: Required request shape (JSON body)

Example JSON body that MUST be included with the POST:

```json
{
  "query": "How many patients match X?",
  "source": "mpog",
  "openai_compatible_endpoint": "https://example-openai-compatible-host/",
  "openai_compatible_model": "gpt-4-azure"
}
```

Required header example (exact form):

```
Authorization: Bearer test-api-key-123
```

Put another way: JSON includes endpoint+model; header includes the API key.

---

## Non-LLM sensitive values

- The above strict "no fallback" rule applies only to LLM credentials (endpoint, model, API key). It does NOT prevent using configured secrets for non-LLM integrations (for example, external APIs, databases, or other service keys).
- For non-LLM sensitive values you may continue to use the repository's secret management helpers. Example pattern used elsewhere:

```python
from aiweb_common.WorkflowHandler import manage_sensitive

NAME = "lit"

# Non-LLM sensitive secrets (managed via aiweb_common helpers)
LIBKEY_API_KEY = manage_sensitive("libkey_api_key")
NCBI_API_KEY = manage_sensitive("ncbi_api_key")
```

- Do NOT use manage_sensitive (or any config-secret helper) to supply LLM API keys or default LLM endpoints/models. LLM credentials must always come from the client per-request.

---

## Implementation guidance (for implementers)

1. Request validation
   - Ensure your request model (e.g., pydantic model in [`app/v01/schemas.py`](app/v01/schemas.py:1)) lists `openai_compatible_endpoint` and `openai_compatible_model` as required fields.
   - Ensure you check/parse the `Authorization` header via `gr.Request` and reject requests without a Bearer token.

2. Avoid global/static Chat objects
   - Do not instantiate `ChatOpenAI` or equivalent LLM client as a global singleton with credentials from config. Instead, instantiate per-request using the provided endpoint, model, and API key.
   - If code currently reads credentials from `meeting_notes_config/config.py` or similar, change it to accept per-request parameters at the call site. (If you see code inconsistencies, see the "Notes" section at the end.)
   - Rather, use the method aiweb_common.WorkflowHandler provides to anything that superclasses it:
   ```python
   class WorkflowHandler(ABC):
    def __init__(self):
        self.total_cost = 0.0

    def _init_openai(self, *, openai_compatible_endpoint, openai_compatible_key, openai_compatible_model, name):
        self.llm_interface = ChatOpenAI(
            base_url=openai_compatible_endpoint,
            api_key=openai_compatible_key,
            model=openai_compatible_model,
            user=name
        )
    ```
    
    As an example from another project:

    ```python
    class TranscriptWorkflow(WorkflowHandler):
    def __init__(self, txt_content, openai_compatible_endpoint, openai_compatible_key, openai_compatible_model):
        super().__init__()
        self.txt_content = txt_content
        # Initialize a per-instance LLM interface using WorkflowHandler helper.
        self._init_openai(
            openai_compatible_endpoint=openai_compatible_endpoint,
            openai_compatible_key=openai_compatible_key,
            openai_compatible_model=openai_compatible_model,
            name=config.APP_NAME if hasattr(config, "APP_NAME") else "TranscriptWorkflow"
        )

    def process(self):
        """
        The function processes a transcript document by extracting relevant text, assembling a prompt, generating a
        response using a search response handler, and updating the total cost.

        Returns:
          The `process` method returns the `generated_response` after processing the search response,
        extracting relevant text from the transcript document, assembling a prompt, and generating a response based
        on the assembled prompt.
        """
        print("initiating single response handler")
        # Use the per-instance LLM interface initialized via self._init_openai instead of the global config
        single_response = SingleResponseHandler(self.llm_interface)

        assembled_prompt = self._assemble_prompt(single_response)

        generated_response, response_meta = single_response.generate_response(assembled_prompt)
        self._update_total_cost(response_meta)

        final_text = generated_response.content
        print("output text - ", final_text)
        return final_text
    ```
    
3. Logging and error handling
   - Log only metadata (e.g., endpoint hostname, model) — do not log API keys.
   - For downstream LLM errors (e.g., unauthorized), propagate as 500 so tests can assert behavior.

4. Examples of where to read values in code
   - Read `openai_compatible_endpoint` and `openai_compatible_model` from the request payload passed to your Gradio handler.
   - Read API key from `gr.Request.headers["authorization"]` (e.g., `Authorization: Bearer <api_key>`).

---

## Testing

Testing guidance has moved to `docs/test_style_guide.md` to keep it shared
across Gradio and FastAPI apps. Follow that guide for mocks, patching, and
client setup.

---

## Notes (observations about this repository — do not change code here)

- The original `azurify.md` referenced `DataFeasibility/*` modules (e.g., [`DataFeasibility/workflows.py`](DataFeasibility/workflows.py:1)). In this repository the main workflow code is located at elsewhere but similarly patterned. Update references in developer knowledge or tests to point at appropriate import paths when patching.
- Some examples in the original document referenced `app/v01/idea.py` and `app/v01/schemas.py` but included parameter names like `llm_api_key` and `llm_model_name` that differ from the canonical names required here (`openai_compatible_endpoint`, `openai_compatible_model`, and API key in the `Authorization` header). Ensure any code or tests you update use the JSON fields (`openai_compatible_*`) and the Authorization header, not additional body fields for keys.
- A few earlier examples suggested patch targets under `DataFeasibility.workflows` (e.g., `DataFeasibility.workflows.config.ChatOpenAI`). In this repo, similar patch targets are elsewhere — verify actual import lines in the module before patching.
- Ensure any converted tests in this repo follow the header+body requirement described above.

---

This file updates and centralizes the policy: clients must always supply `openai_compatible_endpoint`, `openai_compatible_model` in the request body and an API key in `Authorization: Bearer <api_key>`. No fallbacks are allowed.
