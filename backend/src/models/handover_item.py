from pydantic import BaseModel


class HandoverItem(BaseModel):
    id: int
    handover_id: int
    device_id: int
    item_code: str
    result_id: int
