from pydantic import BaseModel

class ExampleRequest(BaseModel):
    name: str
