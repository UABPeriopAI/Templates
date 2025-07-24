# Makefile
SHELL = /bin/bash
# help
.PHONY: help
help:
    @echo "Commands:"
    @echo "venv    : creates a virtual environment."
    @echo "style   : executes style formatting."
    @echo "clean   : cleans all unnecessary files."
    @echo "docs    : builds documentation with mkdocs."
    @echo "docs-serve: serves the documentation locally."
# Styling
.PHONY: style
style:
    black .
    flake8
    python3 -m isort .
# Environment
.ONESHELL:
venv:
    python3 -m venv venv
    source venv/bin/activate && \
    python3 -m pip install pip setuptools wheel && \
    python3 -m pip install -e .
# Docs
.PHONY: docs docs-serve
docs:
    mkdocs build
docs-serve:
    mkdocs serve
# Cleaning
.PHONY: clean
clean: style
    find . -type f -name "*.DS_Store" -ls -delete
    find . | grep -E "(__pycache__|\.pyc|\.pyo)" | xargs rm -rf
    find . | grep -E ".pytest_cache" | xargs rm -rf
    find . | grep -E ".ipynb_checkpoints" | xargs rm -rf
    rm -f .coverage
    rm -rf site