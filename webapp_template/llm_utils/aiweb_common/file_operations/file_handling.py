import base64
import tempfile
from datetime import datetime

import magic
from docx import Document
from fastapi import File, HTTPException, Query, UploadFile

from aiweb_common.file_operations.text_format import convert_markdown_docx


def file_to_base64(filepath):
    """Converts a file to a base64-encoded string."""
    with open(filepath, "rb") as file:
        return base64.b64encode(file.read()).decode("utf-8")


def markdown_to_docx_temporary_file(content, template_location=None):
    """
    The function `prepare_docx_response` converts Markdown content to a DOCX file and returns the
    temporary file path.

    :param content: The `content` parameter in the `prepare_docx_response` function is the text or data
    that you want to convert to a DOCX file. This content will be processed and converted into a DOCX
    file using the `convert_markdown_docx` function
    :param template_location: The `prepare_docx_response` function takes two parameters:
    :return: The function `prepare_docx_response` returns the file path of the temporary .docx file that
    is created after converting the provided content (in markdown format) to a .docx file using the
    specified template location.
    """
    docx_data = convert_markdown_docx(content, template_location)
    # Using tempfile to save the output file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as temp_file:
        temp_file.write(docx_data)
        temp_file_path = temp_file.name
    return temp_file_path


async def ingest_docx(file):
    """
    The function `ingest_docx` reads the content of a DOCX file as bytes, writes it to a temporary file,
    and then loads the document from the temporary file.

    :param file: The `file` parameter in the `ingest_docx` function seems to be a file-like object that
    supports asynchronous reading operations. When `await file.read()` is called, it reads the content
    of the file as bytes. This content is then written to a temporary file with a `.docx
    :return: The function `ingest_docx` returns a tuple containing two values:
    1. The name of the temporary file where the DOCX content was written.
    2. An instance of the `Document` class representing the loaded document from the temporary file.
    """
    with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as temp_doc:
        content = await file.read()  # Read file content as bytes
        # have to do this because of async context, otherwise calling function moves on
        temp_doc.write(content)
        temp_doc.flush()  # Ensure all content is written to disk

        # Load the document from the temporary file
        return temp_doc.name, Document(temp_doc.name)  # Load the document here


def ingest_docx_bytes(content):
    """
    The function `ingest_docx_bytes` reads the content of a DOCX file from bytes, saves it to a
    temporary file, and then loads the document using the `Document` class.

    :param content: The `ingest_docx_bytes` function you provided seems to be designed to ingest the
    content of a DOCX file as bytes and load it using the `python-docx` library. However, it looks like
    the content parameter is missing in your message. Could you please provide the content parameter so
    :return: The `ingest_docx_bytes` function returns a tuple containing two values:
    1. The name of the temporary file where the content was written (temp_doc.name)
    2. The Document object representing the content loaded from the temporary file
    """
    with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as temp_doc:

        temp_doc.write(content)
        temp_doc.flush()  # Ensure all content is written to disk

        # Load the document from the temporary file
        return temp_doc.name, Document(temp_doc.name)  # Load the document here


def create_file_validator(*allowed_mime_types):
    """
    Creates a dependency function that validates the MIME type of an uploaded file.

    Args:
        allowed_mime_types (tuple): A tuple of strings representing the allowed MIME types.

    Returns:
        Callable[[UploadFile], UploadFile]: A function that checks if the uploaded file's MIME type
        is in the allowed MIME types.

    Examples:
    validate_docx_file = create_file_validator("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    validate_pdf_file = create_file_validator("application/pdf", "application/x-pdf")
    """

    def validate_file(file: UploadFile = File(...)):
        """
        Validate the MIME type of the uploaded file.
        Raises HTTPException if the MIME type is not what is expected.
        """
        if file.content_type not in allowed_mime_types:
            allowed_types_formatted = ", ".join(allowed_mime_types)
            raise HTTPException(
                status_code=415,
                detail="Incorrect file type. Required type: " + allowed_types_formatted,
            )
        return file

    return validate_file


def create_base64_file_validator(*allowed_mime_types):
    """
    Creates a function that validates the MIME type of a base64-encoded file.

    Args:
        allowed_mime_types (tuple): A tuple of strings representing the allowed MIME types.

    Returns:
        Callable[[str, ValidationInfo], str]: A function to validate base64-encoded files.
    """

    def validate_base64_encoded_file(cls, v, info):
        """
        Validate the MIME type of a base64-encoded file.
        Raises ValueError if the MIME type is not what is expected.
        """
        try:
            file_bytes = base64.b64decode(v, validate=True)
        except ValueError:
            raise ValueError("Invalid base64 encoding")

        # Use python-magic to check MIME type
        mime = magic.Magic(mime=True)
        mime_type = mime.from_buffer(file_bytes)

        if mime_type not in allowed_mime_types:
            allowed_types_formatted = ", ".join(allowed_mime_types)
            raise ValueError(
                f"Incorrect file type. Required types: {allowed_types_formatted}"
            )

        return v

    return validate_base64_encoded_file


def validate_date(
    date_str: str = Query(..., description="The start date in YYYY-MM-DD format")
) -> datetime:
    """
    Custom dependency that validates and parses a date string.

    Args:
    date_str (str): A date string in the YYYY-MM-DD format.

    Returns:
    datetime: The parsed datetime object.

    Raises:
    HTTPException: If the date string is not in the correct format.
    """
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError as exc:
        raise HTTPException(
            status_code=400, detail="start_date must be in YYYY-MM-DD format"
        ) from exc
