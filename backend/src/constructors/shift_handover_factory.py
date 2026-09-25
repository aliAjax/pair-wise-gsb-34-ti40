from datetime import datetime


def now_text() -> str:
    return datetime.now().strftime("%Y-%m-%dT%H:%M:%S")


def build_handover_code(seq: int) -> str:
    return f"HJ-{datetime.now().strftime('%Y%m%d')}-{seq:03d}"


def build_handover_event(**overrides):
    """构造一条交接操作留痕：动作、操作人、前后负责人、时间、备注。"""
    row = {
        "id": 0,
        "type": "CREATE",
        "actor_id": 0,
        "actor_name": "",
        "from_owner_id": 0,
        "to_owner_id": 0,
        "created_at": now_text(),
        "remark": "",
    }
    row.update(overrides)
    return row


def build_handover_item(**overrides):
    """构造交接检查项快照，把测到一半的数值和照片冻结在交接单里。"""
    row = {
        "id": 0,
        "device_id": 0,
        "device_code": "",
        "device_name": "",
        "item_code": "",
        "item_name": "",
        "result_id": 0,
        "measured_value": "",
        "photo_url": "",
        "note": "",
    }
    row.update(overrides)
    return row


def build_handover(**overrides):
    """构造一张空白交接单默认结构。"""
    row = {
        "id": 0,
        "code": "",
        "task_id": 0,
        "building_id": 0,
        "handover_from": 0,
        "handover_to": 0,
        "status": "PENDING",
        "site_note": "",
        "estimated_arrival_at": "",
        "created_at": now_text(),
        "confirmed_at": "",
        "revoked_at": "",
        "items": [],
        "events": [],
    }
    row.update(overrides)
    return row
