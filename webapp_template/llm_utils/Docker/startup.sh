#!/bin/sh

#to test the package as you go
python3 -m pip install pip setuptools wheel
python3 -m pip install -U -e .

# Append PYTHONPATH to .bashrc to ensure it's set in all bash sessions
echo 'export PYTHONPATH="/workspaces/llm_utils:${PYTHONPATH}"' >> ~/.bashrc
echo 'export PYTHONPATH="/workspaces/llm_utils:${PYTHONPATH}"' >> ~/.zshrc

