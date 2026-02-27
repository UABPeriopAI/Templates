# Gradio App Style Guide

This guide defines how we build Gradio apps in this repo. It reflects our current
decision to keep base64 file exchange and to prefer reuse of `aiweb_common` helpers,
even if they are named for FastAPI.

## Goals
- Keep backends stateless and deterministic.
- Expose stable APIs via Gradio `api_name` for the TypeScript frontend.
- Keep UI and business logic modular and testable.

## Project Structure
Use a split between UI layout and pure handlers:
- `app/app.py`: Gradio entrypoint, composes UI modules.
- `app/v01/gradio_ui.py`: UI composition (Blocks/Tabs/Accordions).
- `app/v01/gradio_handlers.py`: pure functions with minimal side effects.
- `app/v01/schemas.py`: Pydantic request/response validation.
- `app/v01/validators.py`: MIME validators via `aiweb_common`.
- `app/v01/file_processing.py`: shared helpers (e.g., base64 decode/encode).

## Handlers (Business Logic)
- Keep handlers pure and idempotent when possible.
- Validate inputs with Pydantic models (`schemas.py`) before processing.
- Use `aiweb_common` helpers if they exist, even if named for FastAPI:
  - `FastAPIUploadManager` for base64 decode + file parsing.
  - `FastAPIDocxCreator` for docx generation.
  - `aiweb_common.fastapi.schemas` for response shapes (e.g., `MSWordResponse`).
- Avoid long-lived state; use in-memory variables only within a request.
- Raise `gr.Error` for user-facing errors.

## UI Composition
- Keep UI layout in `gradio_ui.py` with minimal logic.
- Use `api_name` on event bindings for stable API routes.
- Prefer components with explicit types (e.g., `gr.File(type="filepath")`).
- Keep the primary app layout in `app/app.py` and import UI modules.

## Base64 File Strategy (Current Standard)
- Accept base64 inputs for file payloads.
- Validate MIME types using `aiweb_common.file_operations.file_handling`.
- Use base64 responses for file downloads unless and until we switch.
- Document expected file extensions in the Pydantic schema.

## Statelessness Rules
- Do not rely on server-local persistence between requests.
- If you write temp files, delete them in the same request.
- Do not cache user data or store files on disk beyond request scope.

## API Naming
- Use stable, versioned `api_name` values (e.g., `v01_tab1_process_csv`).
- Do not change existing names without a deprecation plan.

## When to Propose Changes
- If a helper is missing and would help multiple apps, propose adding it to
  `llm_utils` instead of duplicating it locally.

## Cross-Project Rules
- Follow `.kilocode/rules` for security, formatting, naming, and testing standards.
