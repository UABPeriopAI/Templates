from pydantic import BaseModel, Field


# TODO are there other common schemas that could move here?
class MSWordResponse(BaseModel):
    """
    This class represents a response object containing a base64-encoded DOCX file that can be decoded to
    obtain the DOCX file.
    """

    encoded_docx: str = Field(
        ..., description="Base64-encoded DOCX file. Decode to obtain the DOCX file."
    )
