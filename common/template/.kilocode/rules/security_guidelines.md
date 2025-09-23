
# Security Guidelines

- Never log, echo, or commit secrets, API keys, or PHI.
- Use environment variables or vault solutions for all credentials.
- Validate & sanitize **all** external input (incl. LLM output) before use.
- For database access use parameterized queries only.
- Prefer HTTPS/TLS for all external calls.
- Limit subprocess/`shell=True`; avoid `eval`, `exec` on dynamic text.
- Follow least-privilege: minimal IAM roles, scoped tokens.
- All encryption keys rotate at least every 90 days.