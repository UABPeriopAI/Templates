from pathlib import Path

import pandas as pd
from aiweb_common.fastapi.schemas import MSExcelResponse
from aiweb_common.file_operations.file_config import CSV_EXPECTED_TYPE
from aiweb_common.file_operations.upload_manager import FastAPIUploadManager
from fastapi import APIRouter, BackgroundTasks, HTTPException

from app.fastapi_config import SINGLE_META
from app.v01.single.schemas import RequestCategorization

# TODO add tags
router = APIRouter(tags=[""])


def get_task_response(
    request: RequestCategorization, file_encoded: str, background_tasks: BackgroundTasks
) -> MSExcelResponse:
    # TODO Update code here to do call the specific task
    # handler = FastAPICategorizeHandler(azure_key=Config.AZURE_DOCAI_KEY)
    # zs_prompty = Path(Config.ZS_PROMPTY)
    # fs_prompty = Path(Config.FS_PROMPTY)

    # try:
    #     upload_manager = FastAPIUploadManager(background_tasks=background_tasks)
    #     data = upload_manager.read_and_validate_file(file_encoded, request.extension)
    #     if not isinstance(data, pd.DataFrame):
    #         raise ValueError("Uploaded file did not result in a valid DataFrame.")
    # except Exception as e:
    #     raise HTTPException(status_code=400, detail=f"Error processing file: {e}")

    # try:
    #     categorized_df = handler.fastapi_categorize(data, request, zs_prompty, fs_prompty)
    # except Exception as e:
    #     raise HTTPException(status_code=500, detail=f"Error categorizing data: {e}")

    # csv_data = categorized_df.to_csv(index=False).encode("utf-8")
    csv_data = pd.DataFrame()
    return MSExcelResponse(
        encoded_xlsx=csv_data,
        filename="AI_Generated_Categorization.csv",
        media_type=CSV_EXPECTED_TYPE,
    )


@router.post("/cv/v01/labels/single", **SINGLE_META)
async def process_categorize(
    background_tasks: BackgroundTasks, request: RequestCategorization
) -> MSExcelResponse:
    # This example task returns a MS Excel document.
    response = get_task_response(request, request.file_encoded, background_tasks)

    return response
