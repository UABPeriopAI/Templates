# Documentation Style

## Docstrings
- Required for every public module, class, method, and function.
- Use **Google** or **NumPy** style with examples and raised exceptions.

## MkDocs Build
- `mkdocs serve` must be clean (no warnings).
- `mkdocstrings[python]` autogenerates API reference from docstrings.

## Minimum Files
- `README.md` – high-level usage
- `CHANGELOG.md` – Keep-a-Changelog format
- `CONTRIBUTING.md` – how to run tests & docs
- Diagrams (`.wsd` or `.puml`) live in `docs/uml/` and are rendered in docs.
