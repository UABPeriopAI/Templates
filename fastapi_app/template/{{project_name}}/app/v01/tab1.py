import pandas as pd
from aiweb_common.file_operations.file_config import CSV_EXPECTED_TYPE
from aiweb_common.file_operations.upload_manager import FastAPIUploadManager
from fastapi import APIRouter, BackgroundTasks, HTTPException

from app.fastapi_config import FIRST_META
from app.v01.schemas import FileInRequest, DataFrameResponse

#TODO add tags
router = APIRouter(tags=["Tab1"])


def dataframe_to_csv_base64(df: pd.DataFrame) -> str:
    csv_buffer = StringIO()
    df.to_csv(csv_buffer, index=False)
    csv_bytes = csv_buffer.getvalue().encode('utf-8')
    b64_bytes = base64.b64encode(csv_bytes)
    return b64_bytes.decode('utf-8')


def get_task_response(
    request: RequestCategorization, background_tasks: BackgroundTasks
) -> DataframeResponse:

    try:
        upload_manager = FastAPIUploadManager(background_tasks=background_tasks)
        data = upload_manager.read_and_validate_file(request.file_encoded, request.extension)
        if not isinstance(data, pd.DataFrame):
            raise ValueError("Uploaded file did not result in a valid DataFrame.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {e}")

    response = DataFrameResponse(
                name="Data",
                data=dataframe_to_csv_base64(display_df)
            )
    return response


@router.post("/app/v01/tab1", **TAB1_META)
async def process_file(
    background_tasks: BackgroundTasks, request: FileInRequest
) -> DataFrameResponse:
    #This example task returns a MS Excel document.
    response = get_task_response(request, background_tasks)

    return response