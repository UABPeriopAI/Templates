import base64
import os
import tempfile

from fastapi import APIRouter, BackgroundTasks, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel


class DecodeRequest(BaseModel):
    encoded_data: str
    file_extension: str


# TODO are the other classes with just type definitions to move here?

router = APIRouter(tags=["private"])


@router.post("/internal/convert-to-base64/", include_in_schema=True)
async def convert_file_to_base64(file: UploadFile = File(...)):
    """
    Internal API endpoint to convert files to base64-encoded strings.
    This endpoint is intended for use by API developers for testing.
    """
    try:
        # Convert the uploaded file to base64
        content = await file.read()
        encoded_string = base64.b64encode(content).decode("utf-8")
        return {"base64": encoded_string}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# TODO does this need to be async?
@router.post("/internal/decode-to-file/", include_in_schema=True)
async def decode_to_file(request: DecodeRequest, background_tasks: BackgroundTasks):
    """
    Internal API endpoint to convert a base64-encoded string to a downloadable file.
    This endpoint is intended for use by API developers for testing.
    """
    try:
        # Decode the base64 string
        file_bytes = base64.b64decode(request.encoded_data)

        # Write the decoded bytes to a temporary file
        with tempfile.NamedTemporaryFile(
            delete=False, suffix=f".{request.file_extension}"
        ) as tmp_file:
            tmp_file.write(file_bytes)
            tmp_file_path = tmp_file.name
        response = FileResponse(
            tmp_file_path,
            filename=f"decoded_file.{request.file_extension}",
            media_type="application/octet-stream",
        )

        # Return a FileResponse that allows the file to be downloaded
        background_tasks.add_task(os.unlink, tmp_file_path)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to decode and generate file: {str(e)}"
        )
