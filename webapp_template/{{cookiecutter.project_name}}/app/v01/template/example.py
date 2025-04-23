from fastapi import APIRouter,HTTPException

from app.fastapi_config import EXAMPLE_META
from app.v01.template.schemas import ExampleRequest

#add tags
router = APIRouter(tags=["Example"])


def get_task_response(request: ExampleRequest):
    if not request.name:
        raise HTTPException(status_code=400, detail="Name parameter is missing.")

    return request.name


@router.post("/cv/v01/example", **EXAMPLE_META)
async def process_example_request(request: ExampleRequest):
    """
    This endpoint processes a request based on the ExampleRequest schema.
    """
    response = get_task_response(request)

    return response