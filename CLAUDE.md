# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NCVV (Neurocritical Care Vitals Variability) is an MLOps-oriented signal processing pipeline for high-resolution physiological waveform analysis (ECG, ABP, ICP). It provides a CLI (Typer) for batch processing, a Streamlit web UI, and a Gradio web UI for interactive use. The pipeline extracts per-beat features, applies quality control, and computes windowed variability metrics (HRV, BPV, ICPV), with experiment tracking via MLflow.

## Commands

```bash
# Setup (creates venv, installs deps including git submodule)
make venv

# Run the Qt desktop app (PySide6, primary)
make qt
# or: uv run --extra qt python -m app.qt

# Run the Streamlit UI (secondary)
uv run streamlit run NCVV/new_ui.py

# Run the Gradio UI (secondary)
uv run python NCVV/gradio_state_machine.py

# CLI — preprocess raw waveforms
uv run python NCVV/main.py preprocess-data --test-run True

# CLI — QC only (on preprocessed signals)
uv run python NCVV/main.py qc-only --test-run True

# CLI — full processing (extract + QC + visualization)
uv run python NCVV/main.py process-data --test-run True

# Run the full pipeline programmatically
uv run python NCVV/run_pipeline.py

# Run all tests
uv run pytest tests/ -v

# Run a specific test file
uv run pytest tests/test_preprocess_state.py -v

# Format & lint
black .
python3 -m isort .
autopep8 --recursive --aggressive --aggressive .
flake8

# Style check (non-destructive)
black --check . && isort --check-only .

# Docs
mkdocs serve
```

## Architecture

### Workspace Structure (uv monorepo)

Two packages managed by `uv workspace`:
- **Root project** (`NCVV`) — main package + Streamlit/Gradio web apps + Typer CLI
- **`llm_utils/`** — published as `aiweb_common` + `highres_common`, shared LLM and signal processing infrastructure (git submodule). **Never edit directly** — propose additions if needed.

### Pipeline State Machine

The core orchestration uses a state machine pattern (`NCVV/state_machine/`) with 6 processing stages:

```
ConfigLoading → Ready → Preprocess → SignalQC → FeatureExtract → FeatureQC
                                → ClinicalFeatureExtract → ClinicalFeatureQC → Ready
                                          ↘ Error (from any state)
```

Each state has load/execute/save substates. `PipelineContext` carries typed entity objects (not raw dicts) between states.

### Signal Factory Pattern

Signal-specific logic is organized into factories under `NCVV/signal_factories/`:

```
signal_factories/
  Preprocess/          — per-signal preprocessors (ECG, ABP, ICP) via preprocess_factory
  SignalQC/            — per-signal quality checkers via signal_quality_factory
  FeatureExtraction/   — windowed feature extractors (HRV, BPV, ICPV) via feature_factory
  FeatureExtractionQC/ — per-beat feature extractors via feature_factory
```

Each factory exposes a `services.get(signal_type, **kwargs)` registry pattern.

### Orchestrator Layer (`NCVV/orchestrator/`)

No abstract base classes — each component stands alone:

```
SignalPipeline         — 6-stage pipeline: preprocess → signal QC → feature extract
                         → feature QC → clinical extract → clinical QC
SignalPipelineFactory  — creates pipeline instances with factory singletons injected
BeatDetectionService   — ECG R-peaks (neurokit2), ABP/ICP onsets (SSF)
ProjectLevelQualityChecker — cross-signal QC aggregation
```

Typed entities (`orchestrator/entities.py`): `PreprocessedSignal`, `AlignedSignals`, `QualityMask`, `BeatDetectionResult`, `FeatureSet`, `ClinicalFeatureSet`.

State handlers receive a `SignalPipeline` instance and call the relevant stage method. `PipelineContext` stores typed entities directly.

### Data Flow (batch pipeline)

```
Raw PKLs (per patient/session/signal)
  → build_multi_channel_pickle()     — align + inner-join signals into one DataFrame
  → preprocess per signal            — cleaning, filtering, interpolation
  → per-beat feature extraction      — ECG R-peaks, ABP onsets, ICP onsets
  → QC masks                         — abnormality checkers flag bad beats
  → windowed variability features    — HRV, BPV, ICPV time-domain metrics
  → CSV output + MLflow logging
```

### UI Layer

Three interfaces over the pipeline:
- **Qt Desktop App** (`app/qt/`) — PySide6 MVC with sidebar navigation, project persistence (SQLite), QThreadPool workers. Primary interface.
- **Gradio** (`NCVV/gradio_state_machine.py`) — web UI using `PipelineController` from `NCVV/ui/controller.py`
- **Streamlit** (`NCVV/new_ui.py`) — lightweight web UI using `PipelineStateMachine` directly

### Qt Desktop App (PySide6) — MVC Architecture

```
app/qt/
  main.py              — QApplication entry point
  main_window.py       — QMainWindow with sidebar + QStackedWidget (4 pages)
  models/              — QObject models (ProjectModel, PipelineModel, ConfigModel, PandasTableModel)
  views/               — Pages (Setup, Processing, Features, Results) + shared widgets
  controllers/         — BaseController with _run_async(), PipelineController, ProjectController
  state_machines/      — PipelinePhase enum-based transitions
  workers/             — PipelineWorker(QRunnable) for background tasks
  db/                  — SQLite DataStore (projects, patients, sessions, runs)
  resources/           — QSS stylesheets (light + dark)
```

### Module Layout

- `NCVV/` — core business logic (main.py CLI, data.py, train.py, predict.py, evaluate.py)
- `NCVV/config/config.py` — `NCVVConfig` class with all paths and constants
- `NCVV/orchestrator/` — pipeline composition + typed entity dataclasses
- `NCVV/state_machine/` — pipeline state machine for web UIs (states, context, transitions)
- `NCVV/signal_factories/` — factory-pattern modules for preprocess, QC, feature extraction
- `NCVV/ui/` — controller + signal preview components for Gradio
- `app/qt/` — PySide6 desktop app (primary interface, MVC architecture)
- `NCVV/clinical_feature_extractors/` — domain-specific extractors (PAT, time-domain variability)
- `NCVV/hrv_meg/` — HRV/MEG comparison utilities
- `NCVV/utils/` — file helpers, plotting, signal QC checkers
- `NCVV/explorations/` — Jupyter notebooks and proof-of-concept scripts
- `tests/` — unit tests (state machine, QC, preprocessing)
- `config/` — JSON config files for QC thresholds and feature extraction
- `docs/` — MkDocs documentation

## Code Conventions (from .agents/rules/)

### Style
- **Line length**: 100 (black, isort, autopep8 all configured to 100)
- **Imports**: isort with `profile=black`, trailing commas on multiline
- Python >= 3.11, always annotate types
- Google-style docstrings on all public modules, classes, methods, functions

### Naming
| Item | Convention | Example |
|------|-----------|---------|
| Module | snake_case | `data_loader.py` |
| Function | snake_case | `load_data()` |
| Async function | snake_case `_async` suffix | `fetch_data_async()` |
| Class | PascalCase | `PatientRecord` |
| Constant | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| Private | `_leading_underscore` | `_connect()` |

### Key Rules
- **Reuse before writing**: search `llm_utils/aiweb_common/` and `llm_utils/highres_common/` first; import existing functionality
- Use `aiweb_common` classes for LLM calls, `highres_common` for signal processing utilities
- Keep functions small, pure, idempotent
- Add/adjust tests with every behavioral change

### Branch Protection
- **NEVER commit or push directly to `release/*`, `main`, `master`, or `develop` branches.** Always work on feature branches. A human must initiate merges/pushes to protected branches.

### Restricted Files — MUST NOT read, write, or commit
`.env`, `.env.*`, `.venv`, `supersecrets.txt`, `credentials.json`, `*.pem`, `*.key`, `id_rsa*`, any `data/` file containing PHI/PII

### Security
- Never log or commit secrets, API keys, or PHI
- Use `WorkflowHandler.manage_sensitive()` for secret retrieval
- Validate all external input including LLM output before use
- Parameterized queries only for database access

## Known Gotchas

- **Legacy pickle compatibility**: Old waveform PKLs may reference `numpy._core.*` module paths. `run_pipeline.py` installs shims via `_install_numpy_underscore_shims()` and handles gzipped pickles.
- **Import chain discipline**: `highres_common` utilities like `determine_fs` and `TableOneCreator` are imported from the `llm_utils` submodule. Ensure the submodule is checked out before running.
- **Sampling rate fallback**: If `determine_fs()` returns None or <= 5 Hz, the pipeline infers from repeated timestamps or falls back to 250 Hz.
- **Signal column aliases**: Signal columns are looked up via `_get_col()` which tries multiple names (e.g., `["ecg", "ECG", "lead_ii", "leadii", "Lead II"]`) with a case-insensitive fallback.
