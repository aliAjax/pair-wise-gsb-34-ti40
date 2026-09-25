from pydantic import BaseModel


class TaskHandover(BaseModel):
    id: int
    task_id: int
    from_inspector_id: int
    to_inspector_id: int
    note: str
    expected_arrival_at: str
    status: str
    created_at: str
    confirmed_at: str
    withdrawn_at: str
