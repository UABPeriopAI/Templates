#!/bin/bash
pip install aider-chat

# Read the key from the file
KEY=$(cat secrets/gpt4_api_key.txt)

# Export the key as an environment variable
export AZURE_API_KEY=$KEY

# You can add commands that use this environment variable below this line
export AZURE_API_VERSION="2024-02-01"
export AZURE_API_BASE="https://nlp-ai-svc.openai.azure.com/"

aider --browser --model azure/gpt4o