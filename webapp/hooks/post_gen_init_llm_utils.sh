#!/bin/bash

git submodule add https://github.com/UABPeriopAI/llm_utils.git
git submodule update --init --recursive
cd llm_utils
git checkout main
cd ..
git add .
git commit -m 'updating llm_utils'
git push -u origin HEAD
