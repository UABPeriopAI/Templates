import uvicorn
from aiweb_common.fastapi.helper_apis import router as utils_router
from fastapi import FastAPI

from app.fastapi_config import FORM_API_META
from app.v01.tab1 import router as v01_tab1_router
from app.v01.tab2 import router as v01_tab2_router


app = FastAPI(**FORM_API_META)
app.include(utils_router)
app.include_router(v01_tab1_router)
app.include_rotuer(v01_tab2_router)

# TODO: standardize in something like aiweb commmon and include from there.
@app.get("/health")
def health_check():
    return {"status": "healthy"}


# once the server is launched with `python3 app/server.py`,
# API documentation will be at http://localhost:8000/docs

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
