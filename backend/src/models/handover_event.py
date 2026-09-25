from pydantic import BaseModel


class HandoverEvent(BaseModel):
    id: int
    handover_id: int
    action: str
    operator_id: int
    from_owner_id: int
    to_owner_id: int
    created_at: str
    remark: str
