from pydantic import BaseModel


class HandoverItem(BaseModel):
    id: int | float
    device_id: int | float
    device_code: str
    device_name: str
    item_code: str
    item_name: str
    result_id: int | float
    measured_value: str
    photo_url: str
    note: str


class HandoverEvent(BaseModel):
    id: int | float
    type: str
    actor_id: int | float
    actor_name: str
    from_owner_id: int | float
    to_owner_id: int | float
    created_at: str
    remark: str


class ShiftHandover(BaseModel):
    id: int | float
    code: str
    task_id: int | float
    building_id: int | float
    handover_from: int | float
    handover_to: int | float
    status: str
    site_note: str
    estimated_arrival_at: str
    created_at: str
    confirmed_at: str
    revoked_at: str
    items: list[HandoverItem]
    events: list[HandoverEvent]
