
from pydantic import BaseModel
import app.fastapi_config as form_api_config

# --- File Upload Info ---
class FileInRequest(BaseModel):
    file_encoded: str = Field(..., description="Base64-encoded CSV content")
    extension: str = Field(..., description="File extension: either 'csv'")

    @field_validator("file_encoded")
    @classmethod
    def check_mime_type(cls, v, values, **kwargs):
        return validate_input_bytes(cls, v, values)


# --- Response Schemas ---
class DataFrameResponse(BaseModel):
    name: str = Field(..., description="Identifier for the DataFrame")
    data: str = Field(..., description="Serialized DataFrame (CSV/JSON)")
