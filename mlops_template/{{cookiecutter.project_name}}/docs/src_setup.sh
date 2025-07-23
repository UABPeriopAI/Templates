#!/bin/bash

cd /workspaces/{{cookiecutter.project_name}}/src
pip install --upgrade pip setuptools wheel\
	    && pip install -e ".[dev]"
