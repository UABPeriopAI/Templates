# llm_utils & aiweb_common Guide  

## Purpose
Centralize reusable code for building LLM-based applications.
Minimize duplication by sharing helpers, utilities, and abstractions.
Import components from aiweb_common across multiple projects.

## Folder Structure
- `aiweb_common/`: The core subpackage containing reusable classes, functions, and modules organized by functionality.
- `aiweb_common/ObjectFactory.py`: Implements a generic factory pattern for creating objects by key, facilitating flexible object creation.
- `aiweb_common/WorkflowHandler.py`: Defines an abstract base class for managing workflows, including database connection, logging, and prompt loading utilities.
- `aiweb_common/configurables/`: Configuration helpers and utilities.
- `aiweb_common/fastapi/`: Helpers, schemas, and validators for FastAPI applications.
- `aiweb_common/file_operations/`: Utilities for file handling, document creation, text formatting, and upload management.
- `aiweb_common/generate/`: Components related to generating responses, prompts, and interfacing with LLMs.
- `aiweb_common/report_builder/`: Tools for building reports.
- `aiweb_common/resource/`: Interfaces for external resources such as NIH RePORTER and PubMed.
- `aiweb_common/streamlit/`: Helpers for Streamlit applications, including authentication and UI rendering.

## Key Components

### ObjectFactory
Class: Flexible registry for builder functions by key.
Usage: Decouple/extend object creation logic.

### WorkflowHandler
Abstract class: Manage LLM workflows (calls, DB, logging, prompts).
Usage: Subclass to implement specific pipeline logic.

### manage_sensitive
Lookup secrets from deployment files, dev files, or env vars.
Raises KeyError if not found.
Secure secret retrieval across environments.


## Usage Guidelines
- Always search `llm_utils` for existing functionality before writing new code.
- Import and reuse classes and functions from `aiweb_common` to maintain consistency.
- Follow the coding standards and documentation style outlined in `.kilocode/rules`.
- Propose additions to `llm_utils` if you identify reusable functionality that benefits multiple projects.
- Avoid modifying existing code in `llm_utils` directly; instead, extend or propose changes via proper channels.