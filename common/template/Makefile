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
	autopep8 --recursive --aggressive --aggressive .
# Environment
.ONESHELL:
venv:
	uv venv .venv --clear
	uv pip install -U pip setuptools wheel && \
	uv pip install -e ".[dev]"
	uv pip install -U -e ./llm_utils
	uv pip install -U -r requirements.txt
	uv pip install -U -r ./llm_utils/requirements.txt
	uv pip install "black[jupyter]"
	uv pip install "mkdocstrings[python]"
	uv pip install "mkdocs-monorepo-plugin"
	source .venv/bin/activate
# Docs
.PHONY: docs
docs:
	mkdocs build
	mkdocs serve
	
# Cleaning
.PHONY: clean
clean: style
	find . -path ./venv -prune -o -type f -name "*.DS_Store" -ls -delete
	find . -path ./venv -prune -o -type d \( -name "__pycache__" -o -name "*.pytest_cache" -o -name ".ipynb_checkpoints" \) -exec rm -rf {} +
	find . -path ./venv -prune -o -type f \( -name "*.pyc" -o -name "*.pyo" \) -exec rm -f {} +
	rm -f .coverage