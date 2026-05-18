# Formatting

## Single Source of Truth
- `black` – line length 100 (matches `pyproject.toml`).
- `isort` – `profile=black`, `line_length=100`, trailing comma on multiline.
- `autopep8` – `aggressive=2`, respect same line length.

## Enforcement
- Linting available through the @Makefile via `make style`. 
- Can additionally use pre-commit or CI step `black --check && isort --check-only && autopep8 --diff`.