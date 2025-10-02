# llm_utils & aiweb_common Guide  

## Purpose
Centralize reusable code for building LLM-based applications.
Minimize duplication by sharing helpers, utilities, and abstractions.
Import components from aiweb_common across multiple projects.

## Folder Structure
aiweb_common/ — Core reusable code, organized by feature.
ObjectFactory.py — Generic factory pattern by key; enables extensible object creation.
WorkflowHandler.py — Abstract base for workflows: DB, logging, prompt loading.
configurables/ — App configuration helpers.
fastapi/ — FastAPI schemas and validators.
file_operations/ — File/document/text handling and uploads.
generate/ — LLM prompt/response generation, API interfaces.
report_builder/ — Structured report creation.
resource/ — External data sources (NIH RePORTER, PubMed).
streamlit/ — Streamlit utilities (auth, UI).

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
Search llm_utils before writing any new utility.
Import/reuse from aiweb_common for consistency.
Follow code and documentation conventions in .kilocode/rules.
Suggest additions via repository process; do not modify core code directly.
Keep this guide updated as features evolve.