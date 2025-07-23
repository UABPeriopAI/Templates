from aiweb_common.file_operations.file_config import (
    DOCX_EXPECTED_TYPE,
    XLSX_EXPECTED_TYPE,
)
from aiweb_common.file_operations.file_handling import (
    create_base64_file_validator,
)

validate_docx_bytes = create_base64_file_validator(DOCX_EXPECTED_TYPE)

validate_xlsx_bytes = create_base64_file_validator(XLSX_EXPECTED_TYPE)
