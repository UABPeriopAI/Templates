# Naming Conventions

| Item                    | Convention                | Example                |
|-------------------------|---------------------------|------------------------|
| Package / module        | snake_case               | `data_loader.py`       |
| Variable / function     | snake_case               | `load_data()`          |
| Async function          | snake_case ends with `_async` | `fetch_data_async()` |
| Class                   | PascalCase               | `PatientRecord`        |
| Constant / enum member  | UPPER_SNAKE_CASE         | `MAX_RETRIES`          |
| Test modules            | test_*.py                | `test_utils.py`        |
| Private attr / method   | _single_leading_underscore | `_connect()`           |