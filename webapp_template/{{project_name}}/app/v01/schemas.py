from typing import Any, List, Optional

from pydantic import BaseModel

class ExampleRequest(BaseModel):
    unique_ids: Optional[List[str]] = None
    text_to_label: List[str]
