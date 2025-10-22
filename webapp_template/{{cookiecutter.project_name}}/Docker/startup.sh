#!/bin/sh

python3 -m pip install pip setuptools wheel
python3 -m pip install -e ".[dev]"
python3 -m pip install -U -e ./llm_utils

# Append PYTHONPATH to .bashrc to ensure it's set in all bash sessions
echo 'export PYTHONPATH="/workspaces/LabeLMaker/llm_utils:${PYTHONPATH}"' >> ~/.bashrc
echo 'export PYTHONPATH="/workspaces/LabeLMaker/llm_utils:${PYTHONPATH}"' >> ~/.zshrc

pip install "black[jupyter]"
pip install "mkdocstrings[python]"
pip install "mkdocs-monorepo-plugin"


