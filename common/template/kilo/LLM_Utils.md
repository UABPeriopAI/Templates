# LLM_Utils.md

Before writing any functions, search ./llm_utils (a common submodule where our group keeps code building blocks that can be reused across many different projects) for the desired functionality and integrate code from there whenever possible.

## Guidelines

- use classes and methods in aiweb_common for applications that involve large language models
- whenever possible, consider if code is more general and recommend when you've created something that should be added to llm_utils
- never directly edit llm_utils.
