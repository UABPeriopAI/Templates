# Plan: Qt Desktop App Copier Template + Common Extraction

## Goal

Create a `qt_desktop_app/` copier template in the [Templates](../../Public/Templates/) repo that follows the same Jinja2/copier patterns as `gradio_app/`, `fastapi_app/`, and `mlops_app/`. Also move shared Qt infrastructure into `common/` to keep things DRY across the two existing Qt apps (qualitative_data_tagging and NCVV/PULSE) and any future ones.

---

## Context: Existing Template System

### Repo Structure
```
Templates/
├── common/          ← shared pyproject.toml, Makefile, .gitignore, .agents rules, Docker
│   ├── copier.yml   ← 8 base variables (project_name, author_name, etc.) with when:false
│   └── template/    ← files every project gets
├── gradio_app/      ← Gradio web UI template
│   ├── copier.yml   ← asks questions, then _tasks pulls in common/
│   └── template/{{project_name}}/
├── fastapi_app/     ← FastAPI + Streamlit template
├── mlops_app/       ← Typer CLI + MLflow pipeline template
└── scripts/         ← bootstrap_template_sources.sh, post_gen_project.sh.jinja
```

### How It Works
1. User runs `copier copy Templates/gradio_app /dest`
2. Copier asks questions (project_name, author_name, etc.)
3. Jinja2 renders `{{project_name}}` throughout all `.jinja` files
4. `_tasks[0]` ("pull-in-common") runs `copier copy common/ {{project_name}}` to inject shared files
5. `_tasks[1]` ("run-hook") runs `post_gen_init.sh` for git init + llm_utils submodule

### Shared Variables (common/copier.yml)
`project_name`, `author_name`, `description`, `author_email`, `repository_url`, `data_dir`, `data_directory_name`, `mlflow_tracking_uri`

### What common/ Provides
- `pyproject.toml.jinja` (black, isort, autopep8, uv.sources)
- `Makefile`, `.gitignore`, `.flake8`, `.vscode/settings.json`
- `AGENTS.md.jinja` (coding rules for AI agents)
- `.agents/rules/` (7 markdown files: coding standards, formatting, docs, naming, restricted files, security, llm_utils guide)
- `.devcontainer/` (Dockerfile, noop.txt)
- `Docker/startup.sh.jinja`
- `hooks/post_gen_init.sh.jinja`
- Data directory structure (`{{data_directory_name}}/raw/`, `intermediate/`, `results/`)

---

## Two Existing Qt Apps to Extract From

### 1. qualitative_data_tagging (`../qualitative_data_tagging/app/qt/`)
- Full MVC: 6 pages (Codebook, Documents, Calibration, Analysis, Themes, Spectral)
- LLM-driven workflows (code extraction, theme clustering)
- MLflow experiment tracking
- SQLite project persistence
- Correction service (learns from user edits)
- ~45 files

### 2. NCVV/PULSE (`app/qt/`)
- 4 pages (Setup, Processing, Features, Results)
- Signal processing pipeline (ECG, ABP, ICP)
- QC threshold config editing (JSON-backed)
- SQLite project persistence
- Beat detection + feature extraction + clinical features
- ~35 files

---

## Side-by-Side: What's Shared vs What's Not

### Files That Are IDENTICAL (→ move to common/)

| File | Notes |
|---|---|
| `workers/pipeline_worker.py` | `PipelineWorker(QRunnable)` + `WorkerSignals` — generic async pattern, no app logic |
| `models/config_base.py` | `ConfigBase(QObject)` + `FieldDef` — generic QSettings persistence. PULSE version extends with `float`/`qc_threshold` types; merge into one with all types. |
| `views/shared/progress_overlay.py` | Spinner overlay — pure UI utility |

### Files That Are PARAMETERIZABLE (→ Jinja2 templates)

| File | What Varies |
|---|---|
| `main.py` | `app.setApplicationName("{{app_name}}")`, `app.setOrganizationName("{{org_name}}")`, sys.path entries |
| `main_window.py` | Window title, page list, controller types, model types, menu items, cross-page signals |
| `config_model.py` | Field definitions (QDT: api_key, domain_context; PULSE: data_folder, mlflow_uri), `_settings_group` |
| `views/sidebar.py` | Page labels list, width |
| `state_machines/*_sm.py` | Phase enum names+values, transition graph, is_running conditions |
| `controllers/base_controller.py` | 95% identical; QDT has correction service hooks, PULSE doesn't. Template with optional correction support. |
| `resources/styles.qss` | Color palette values, padding, font sizes (structure identical) |
| `db/schema.sql` | Table names and columns (projects/patients/sessions/runs is domain-specific) |
| `db/data_store.py` | CRUD methods match schema — templatize table structure |

### Files That Are APP-SPECIFIC (→ not in template, generated as stubs)

| Category | QDT Examples | PULSE Examples |
|---|---|---|
| Pages (views) | codebook_page, documents_page, calibration_page, analysis_page | setup_page, processing_page, features_page, results_page |
| Controllers | codebook_ctrl, documents_ctrl, calibration_ctrl, analysis_ctrl | pipeline_ctrl, project_ctrl, export_ctrl |
| Domain models | project_model (documents, metadata, codes) | pipeline_model (signals, features, QC masks), qc_config_model |
| Shared widgets | file_upload_widget, review_buttons, HTML view | signal_plot_widget, qc_threshold_editor, file_browser |

---

## Proposed Template Structure

### New: `qt_desktop_app/`
```
qt_desktop_app/
├── copier.yml
└── template/
    └── {{project_name}}/
        ├── .copier-answers.qt_desktop.yml.jinja
        ├── README.md.jinja
        ├── mkdocs.yml.jinja
        ├── .devcontainer/devcontainer.json.jinja
        ├── requirements.txt
        ├── app/
        │   └── qt/
        │       ├── __init__.py
        │       ├── __main__.py.jinja
        │       ├── main.py.jinja
        │       ├── main_window.py.jinja
        │       ├── models/
        │       │   ├── __init__.py
        │       │   └── config_model.py.jinja
        │       ├── views/
        │       │   ├── __init__.py
        │       │   ├── sidebar.py.jinja
        │       │   ├── example_page.py.jinja
        │       │   └── shared/
        │       │       └── __init__.py
        │       ├── controllers/
        │       │   └── __init__.py
        │       ├── state_machines/
        │       │   ├── __init__.py
        │       │   └── app_sm.py.jinja
        │       ├── db/
        │       │   ├── __init__.py
        │       │   ├── schema.sql.jinja
        │       │   └── data_store.py.jinja
        │       └── resources/
        │           ├── styles.qss.jinja
        │           └── styles_dark.qss.jinja
        ├── {{project_name}}/
        │   ├── __init__.py
        │   ├── config/
        │   │   └── config.py.jinja
        │   └── sample_handler.py.jinja
        ├── tests/
        │   ├── conftest.py
        │   └── test_main_window.py.jinja
        └── docs/
            ├── index.md.jinja
            └── {{project_name}}/
                └── main_window.md.jinja
```

### copier.yml Questions (extends common)

```yaml
# Standard questions (same as other templates)
project_name, author_name, description, author_email, repository_url,
data_dir, data_directory_name, common_template_src, mlflow_tracking_uri

# Qt-specific questions
app_display_name:
  type: str
  help: "Display name for the application window title"
  default: "{{project_name}}"

app_subtitle:
  type: str
  help: "Subtitle shown after the app name"
  default: ""

org_name:
  type: str
  help: "Organization name for QSettings"
  default: "UABPeriopAI"

sidebar_pages:
  type: str
  help: "Comma-separated page names for sidebar navigation"
  default: "Home,Settings"

initial_phase_names:
  type: str
  help: "Comma-separated phase names for the state machine"
  default: "IDLE,RUNNING,COMPLETE,ERROR"

db_tables:
  type: str
  help: "Comma-separated DB table names"
  default: "projects,runs"

include_pyside6:
  type: bool
  default: true
  help: "Include PySide6 in dependencies"
```

### _tasks (same pattern as other templates)

```yaml
_tasks:
  - label: pull-in-common
    command: copier copy "{{common_template_src}}" {{project_name}} --overwrite --defaults ...
  - label: run-hook
    command: bash "{{project_name}}/hooks/post_gen_init.sh"
```

---

## Proposed: Move to common/

### New files in `common/template/`

These files would be injected into EVERY project (gradio, fastapi, mlops, qt) since they're universally useful:

```
common/template/
  app/
    qt/
      workers/
        pipeline_worker.py          ← generic, no Jinja needed
      models/
        config_base.py              ← FieldDef + ConfigBase (merged from both apps)
      views/
        shared/
          progress_overlay.py       ← generic spinner widget
```

**Wait — this is wrong.** Not every project needs Qt files. Only `qt_desktop_app/` projects do.

### Better approach: Keep Qt common files IN the qt_desktop_app template

The `common/` template should only contain things ALL templates use. Qt-specific shared code stays in `qt_desktop_app/template/`. The two existing apps (QDT and PULSE) would then both be updated to pull `config_base.py`, `pipeline_worker.py`, and `progress_overlay.py` from a shared location — either:

**Option A**: Both apps import from `llm_utils` (add these to `aiweb_common` or a new `qt_common` package in the submodule)

**Option B**: The qt_desktop_app template provides these files, and existing apps are regenerated from the template

**Option C**: Accept the duplication for now. Both apps have their own copies. The template provides the canonical version for new projects.

**Recommendation: Option A** for `config_base.py` and `pipeline_worker.py` (they're genuinely reusable infrastructure). The template generates thin wrappers that import from `aiweb_common` or `qt_common`.

---

## What Actually Goes into common/ (Non-Qt)

Configuration management is the one thing that should be shared across ALL template types. Currently each template generates its own `config.py.jinja` with the same logging setup and path structure. This should be in common/:

```
common/template/
  {{project_name}}/
    config/
      config.py.jinja    ← MOVE HERE from each template
```

This is already partially there — all four templates generate nearly identical `config.py.jinja` files with:
- `{{project_name}}Config` class
- `BASE_DIR`, `CONFIG_DIR`, `LOGS_DIR`, `DATA_DIR`, `RAW_DATA`, `INTERMEDIATE_DIR`, `RESULTS_DIR`
- `logging_config` with RichHandler + rotating file handlers

**Currently duplicated in**: `gradio_app/`, `fastapi_app/`, `mlops_app/`. The Qt template would be a 4th copy.

**Action**: Move `config.py.jinja` to `common/template/{{project_name}}/config/config.py.jinja` and remove from individual templates.

---

## Summary: Implementation Steps

### Phase 1: DRY the common/ template
1. Move `config.py.jinja` from gradio_app, fastapi_app, mlops_app into common/
2. Remove the per-template copies
3. Verify all three templates still generate correctly

### Phase 2: Create qt_desktop_app/ template
1. Create `qt_desktop_app/copier.yml` with standard + Qt-specific questions
2. Create Jinja2 templates for: main.py, main_window.py, sidebar.py, config_model.py, app_sm.py, schema.sql, data_store.py, styles.qss
3. Include static files: pipeline_worker.py, config_base.py, progress_overlay.py, __init__.py files
4. Create example page and example controller as starting points
5. Add `requirements.txt` with PySide6 dependency

### Phase 3: Verify with new project
1. `copier copy qt_desktop_app/ /tmp/TestQtApp`
2. Verify generated project structure
3. `uv sync && uv run python -m app.qt` launches empty app with sidebar

### Phase 4: Consider aiweb_common extraction
1. Evaluate adding `config_base.py` and `pipeline_worker.py` to llm_utils for import-based reuse
2. Update both QDT and PULSE to import from shared location
3. Template generates thin import wrappers instead of full copies

---

## Key Files to Reference

| What | Where |
|---|---|
| Template system | `/home/rgodwin/repos/Public/Templates/` |
| Common copier.yml | `Templates/common/copier.yml` |
| Gradio copier.yml (reference) | `Templates/gradio_app/copier.yml` |
| Gradio template dir (reference) | `Templates/gradio_app/template/{{project_name}}/` |
| QDT Qt app (reference impl) | `/home/rgodwin/repos/Private/qualitative_data_tagging/app/qt/` |
| PULSE Qt app (reference impl) | `/home/rgodwin/repos/Private/NCVV/app/qt/` |
| QDT config_base.py | `qualitative_data_tagging/app/qt/models/config_base.py` |
| PULSE config_base.py | `NCVV/app/qt/models/config_base.py` |
| QDT settings_dialog.py | `qualitative_data_tagging/app/qt/views/settings_dialog.py` |
| PULSE settings_dialog.py | `NCVV/app/qt/views/settings_dialog.py` |
| QDT base_controller.py | `qualitative_data_tagging/app/qt/controllers/base_controller.py` |
| PULSE base_controller.py | `NCVV/app/qt/controllers/base_controller.py` |
| Bootstrap script | `Templates/scripts/bootstrap_template_sources.sh` |

---

## Architecture Decisions Made

1. **PULSE = app brand, NCVV = Python package** — the Qt app is a frontend; the signal processing library keeps its name
2. **No Orchestrator ABC** — standalone classes (SignalPipeline, BeatDetectionService, etc.) without forced inheritance
3. **Typed entities end-to-end** — PipelineContext stores dataclasses, not raw dicts
4. **6-stage pipeline** — preprocess → signal QC → feature extract → feature QC → clinical extract → clinical QC
5. **JSON-backed config models** for QC/FE thresholds alongside QSettings-backed app preferences
6. **Mandatory orchestrators** in state handlers — no optional fallback path
7. **QThreadPool + PipelineWorker** for all blocking operations — UI stays responsive
8. **SQLite DataStore** for project persistence — projects → patients → sessions → runs → stage results
