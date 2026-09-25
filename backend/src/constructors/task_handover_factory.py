def create_task_handover_dto(**overrides):
    row = {
        "id": 1,
        "task_id": 1,
        "from_inspector_id": 1,
        "to_inspector_id": 2,
        "note": "",
        "expected_arrival_at": "2026-09-25T09:00:00Z",
        "status": "PENDING",
        "created_at": "2026-09-25T07:30:00Z",
        "confirmed_at": "",
        "withdrawn_at": "",
        "items": [],
        "events": [],
    }
    row.update(overrides)
    return row


def create_handover_item_dto(**overrides):
    row = {"id": 1, "handover_id": 1, "device_id": 1, "item_code": "PRESSURE_CHECK", "result_id": 1}
    row.update(overrides)
    return row


def create_handover_event_dto(**overrides):
    row = {
        "id": 1,
        "handover_id": 1,
        "action": "CREATED",
        "operator_id": 1,
        "from_owner_id": 1,
        "to_owner_id": 2,
        "created_at": "2026-09-25T07:30:00Z",
        "remark": "",
    }
    row.update(overrides)
    return row
