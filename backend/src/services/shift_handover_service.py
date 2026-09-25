from src.repositories.shift_handover_repository import ShiftHandoverRepository
from src.repositories.inspection_task_repository import InspectionTaskRepository
from src.repositories.inspection_result_repository import InspectionResultRepository
from src.repositories.fire_device_repository import FireDeviceRepository
from src.repositories.inspector_repository import InspectorRepository
from src.constructors.shift_handover_factory import (
    build_handover,
    build_handover_item,
    build_handover_code,
    now_text,
)
from src.services.handover_errors import ensure
from src.constants import handover_status as hs

# 设备类型 -> 中文设备名，用于交接检查项快照
DEVICE_NAME = {
    "EXTINGUISHER": "手提式灭火器",
    "HYDRANT": "室内消火栓",
    "SMOKE_DETECTOR": "点型感烟探测器",
    "SPRINKLER": "闭式喷淋头",
    "EXIT_LIGHT": "应急疏散指示灯",
}

# 未完成、允许交接的任务状态
OPEN_TASK_STATUS = {"PLANNED", "IN_PROGRESS", "OVERDUE"}


class ShiftHandoverService:
    def __init__(self):
        self.repo = ShiftHandoverRepository()
        self.task_repo = InspectionTaskRepository()
        self.result_repo = InspectionResultRepository()
        self.device_repo = FireDeviceRepository()
        self.inspector_repo = InspectorRepository()

    # ---------- 查询 ----------

    def list(self, scope: str = "all", user_id: int | None = None):
        rows = self.repo.find_all()
        newest_first = sorted(rows, key=lambda row: row["created_at"], reverse=True)
        if scope == "from_me" and user_id is not None:
            return [row for row in newest_first if row["handover_from"] == user_id]
        if scope == "to_me" and user_id is not None:
            return [row for row in newest_first if row["handover_to"] == user_id]
        return newest_first

    def detail(self, handover_id: int):
        handover = self.repo.find_by_id(handover_id)
        ensure(handover is not None, "HANDOVER_NOT_FOUND")
        return handover

    def list_receivers(self, user_id: int):
        """接班人候选：除本人外的全部巡检员。"""
        return [row for row in self.inspector_repo.find_all() if row["id"] != user_id]

    def handover_sources(self, user_id: int):
        """发起交接页数据源：本人未完成任务，按设备聚合检查项（含测到一半的结果与照片）。"""
        tasks = [
            row for row in self.task_repo.find_all()
            if row["inspector_id"] == user_id and row["status"] in OPEN_TASK_STATUS
        ]
        devices = {row["id"]: row for row in self.device_repo.find_all()}
        result = []
        for task in tasks:
            groups = {}
            for item in self.result_repo.list_by_task(task["id"]):
                device = devices.get(item["device_id"], {})
                group = groups.setdefault(item["device_id"], {
                    "device_id": item["device_id"],
                    "device_code": device.get("device_code", ""),
                    "device_name": DEVICE_NAME.get(device.get("device_type", ""), device.get("device_type", "")),
                    "floor": device.get("floor", ""),
                    "location_desc": device.get("location_desc", ""),
                    "items": [],
                })
                group["items"].append({
                    "result_id": item["id"],
                    "item_code": item["item_code"],
                    "item_name": item["item_name"],
                    "result_status": item["result_status"],
                    "measured_value": item["measured_value"],
                    "photo_url": item["photo_url"],
                    "note": item["note"],
                })
            result.append({
                "task_id": task["id"],
                "building_id": task["building_id"],
                "task_type": task["task_type"],
                "plan_date": task["plan_date"],
                "status": task["status"],
                "devices": list(groups.values()),
            })
        return result

    def related_for_device(self, device_id: int, user_id: int):
        """设备页发起交接：该设备在本人未完成任务下的检查项。"""
        sources = self.handover_sources(user_id)
        for source in sources:
            for group in source["devices"]:
                if group["device_id"] == device_id:
                    return {
                        "task_id": source["task_id"],
                        "building_id": source["building_id"],
                        "task_type": source["task_type"],
                        "plan_date": source["plan_date"],
                        "status": source["status"],
                        "device": group,
                    }
        return None

    # ---------- 写操作 ----------

    def create(self, payload: dict, actor: dict):
        actor_id = actor["id"]
        task_id = payload.get("task_id")
        receiver_id = payload.get("handover_to")
        site_note = (payload.get("site_note") or "").strip()
        estimated_arrival_at = (payload.get("estimated_arrival_at") or "").strip()
        selected = payload.get("items") or []

        ensure(task_id is not None, "VALIDATION_FAILED")
        ensure(receiver_id, "HANDOVER_RECEIVER_REQUIRED")
        ensure(site_note, "HANDOVER_SITE_NOTE_REQUIRED")
        ensure(estimated_arrival_at, "HANDOVER_ETA_REQUIRED")
        ensure(len(selected) > 0, "HANDOVER_EMPTY_ITEMS")

        task = self.task_repo.find_by_id(task_id)
        ensure(task is not None, "HANDOVER_TASK_NOT_OWNED")
        ensure(task["inspector_id"] == actor_id, "HANDOVER_TASK_NOT_OWNED")
        ensure(task["status"] in OPEN_TASK_STATUS, "HANDOVER_TASK_NOT_OPEN")

        receiver = self.inspector_repo.find_by_id(receiver_id)
        ensure(receiver is not None, "HANDOVER_RECEIVER_REQUIRED")
        ensure(receiver_id != actor_id, "HANDOVER_RECEIVER_REQUIRED")

        allowed = {row["id"]: row for row in self.result_repo.list_by_task(task_id)}
        devices = {row["id"]: row for row in self.device_repo.find_all()}
        items = []
        for picked in selected:
            result_id = picked.get("result_id")
            result = allowed.get(result_id)
            ensure(result is not None, "HANDOVER_ITEM_RESULT_MISMATCH")
            device = devices.get(result["device_id"], {})
            items.append(build_handover_item(
                id=self.repo.next_item_id(),
                device_id=result["device_id"],
                device_code=device.get("device_code", ""),
                device_name=DEVICE_NAME.get(device.get("device_type", ""), device.get("device_type", "")),
                item_code=result["item_code"],
                item_name=result["item_name"],
                result_id=result["id"],
                measured_value=result["measured_value"],
                photo_url=result["photo_url"],
                note=result["note"],
            ))

        handover = build_handover(
            id=self.repo.next_id(),
            code=build_handover_code(len(self.repo.find_all()) + 1),
            task_id=task_id,
            building_id=task["building_id"],
            handover_from=actor_id,
            handover_to=receiver_id,
            site_note=site_note,
            estimated_arrival_at=estimated_arrival_at,
        )
        handover["items"] = items
        self.repo.add_event(
            handover, "CREATE", actor, actor_id, receiver_id,
            f"发起交接，勾选 {len(items)} 个检查项，等待 {receiver['name']} 确认",
        )
        return self.repo.create(handover)

    def accept(self, handover_id: int, actor: dict):
        handover = self._get_pending(handover_id)
        ensure(handover["handover_to"] == actor["id"], "HANDOVER_NOT_TO_OWNER")

        from_owner = handover["handover_from"]
        handover["status"] = hs.HANDOVER_STATUS[1]  # ACCEPTED
        handover["confirmed_at"] = now_text()
        # 确认后任务归接班人继续处理
        self.task_repo.reassign(handover["task_id"], actor["id"])
        self.repo.add_event(
            handover, "ACCEPT", actor, from_owner, actor["id"],
            "接班人确认，任务负责人由交班人变更为接班人",
        )
        return handover

    def revoke(self, handover_id: int, actor: dict):
        handover = self._get_pending(handover_id)
        ensure(handover["handover_from"] == actor["id"], "HANDOVER_NOT_FROM_OWNER")

        to_owner = handover["handover_to"]
        handover["status"] = hs.HANDOVER_STATUS[2]  # REVOKED
        handover["revoked_at"] = now_text()
        # 确认前撤回：任务仍归交班人，不发生负责人变更
        self.repo.add_event(
            handover, "REVOKE", actor, actor["id"], to_owner,
            "接班人确认前交班人撤回，交接失效，任务仍由交班人持有",
        )
        return handover

    def _get_pending(self, handover_id: int) -> dict:
        handover = self.repo.find_by_id(handover_id)
        ensure(handover is not None, "HANDOVER_NOT_FOUND")
        ensure(handover["status"] == "PENDING", "HANDOVER_NOT_PENDING", status=handover["status"])
        return handover
