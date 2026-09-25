from src.constants.error_codes import ERROR_CODES
from src.constants.error_messages import ERROR_MESSAGES
from src.constants.handover_action import HandoverAction
from src.constants.handover_status import HandoverStatus
from src.constants.inspection_status import InspectionStatus
from src.constants.log_templates import LOG_TEMPLATES
from src.constructors.task_handover_factory import (
    create_handover_event_dto,
    create_handover_item_dto,
    create_task_handover_dto,
)
from src.repositories.inspection_result_repository import InspectionResultRepository
from src.repositories.inspection_task_repository import InspectionTaskRepository
from src.repositories.task_handover_repository import (
    HandoverEventRepository,
    HandoverItemRepository,
    TaskHandoverRepository,
)
from src.utils.formatters import audit_target, now_iso

UNFINISHED_TASK_STATUS = [status for status in InspectionStatus if status in ("PLANNED", "IN_PROGRESS", "OVERDUE")]
UNFINISHED_RESULT_STATUS = [status for status in InspectionStatus if status in ("PLANNED", "IN_PROGRESS")]


class HandoverError(Exception):
    def __init__(self, code):
        self.code = code if code in ERROR_CODES else ERROR_CODES["VALIDATION_FAILED"]
        super().__init__(ERROR_MESSAGES.get(self.code, ERROR_MESSAGES["VALIDATION_FAILED"]))


class TaskHandoverService:
    def __init__(self):
        self.repo = TaskHandoverRepository()
        self.item_repo = HandoverItemRepository()
        self.event_repo = HandoverEventRepository()
        self.task_repo = InspectionTaskRepository()
        self.result_repo = InspectionResultRepository()

    def _assemble(self, row):
        dto = create_task_handover_dto(**row)
        dto["items"] = [dict(item) for item in self.item_repo.find_by_handover(row["id"])]
        dto["events"] = [dict(event) for event in self.event_repo.find_by_handover(row["id"])]
        return dto

    def list(self, task_id=None, device_id=None, inspector_id=None):
        rows = self.repo.find_all()
        if task_id is not None:
            rows = [row for row in rows if row["task_id"] == task_id]
        if device_id is not None:
            handover_ids = {item["handover_id"] for item in self.item_repo.find_all() if item["device_id"] == device_id}
            rows = [row for row in rows if row["id"] in handover_ids]
        if inspector_id is not None:
            rows = [row for row in rows if row["from_inspector_id"] == inspector_id or row["to_inspector_id"] == inspector_id]
        return [self._assemble(row) for row in rows]

    def get(self, handover_id):
        row = self.repo.find_by_id(handover_id)
        if row is None:
            raise HandoverError("HANDOVER_NOT_FOUND")
        return self._assemble(row)

    def create(self, payload, operator_id):
        task_id = payload.get("task_id")
        to_inspector_id = payload.get("to_inspector_id")
        note = (payload.get("note") or "").strip()
        expected_arrival_at = (payload.get("expected_arrival_at") or "").strip()
        items = payload.get("items") or []
        if task_id is None or to_inspector_id is None or not note or not expected_arrival_at or not items:
            raise HandoverError("VALIDATION_FAILED")
        task = self.task_repo.find_by_id(task_id)
        if task is None:
            raise HandoverError("VALIDATION_FAILED")
        if task["status"] not in UNFINISHED_TASK_STATUS:
            raise HandoverError("HANDOVER_TASK_FINISHED")
        if task["inspector_id"] != operator_id:
            raise HandoverError("HANDOVER_FORBIDDEN")
        if to_inspector_id == operator_id:
            raise HandoverError("VALIDATION_FAILED")
        if self.repo.find_pending_by_task(task_id) is not None:
            raise HandoverError("HANDOVER_ALREADY_PENDING")
        results = self.result_repo.find_by_task(task_id)
        valid_result_ids = {row["id"] for row in results if row["result_status"] in UNFINISHED_RESULT_STATUS}
        normalized_items = []
        for item in items:
            result_id = item.get("result_id")
            if result_id not in valid_result_ids:
                raise HandoverError("VALIDATION_FAILED")
            result = next(row for row in results if row["id"] == result_id)
            normalized_items.append((result, item))
        now = now_iso()
        row = create_task_handover_dto(
            task_id=task_id,
            from_inspector_id=operator_id,
            to_inspector_id=to_inspector_id,
            note=note,
            expected_arrival_at=expected_arrival_at,
            status=HandoverStatus[0],
            created_at=now,
            confirmed_at="",
            withdrawn_at="",
        )
        row.pop("items")
        row.pop("events")
        row = self.repo.insert(row)
        for result, item in normalized_items:
            self.item_repo.insert(create_handover_item_dto(
                handover_id=row["id"],
                device_id=result["device_id"],
                item_code=result["item_code"],
                result_id=result["id"],
            ))
        self._log(row, HandoverAction[0], operator_id, note)
        return self._assemble(row)

    def confirm(self, handover_id, operator_id):
        row = self.repo.find_by_id(handover_id)
        if row is None:
            raise HandoverError("HANDOVER_NOT_FOUND")
        if row["status"] != HandoverStatus[0]:
            raise HandoverError("HANDOVER_NOT_PENDING")
        if row["to_inspector_id"] != operator_id:
            raise HandoverError("HANDOVER_FORBIDDEN")
        row["status"] = HandoverStatus[1]
        row["confirmed_at"] = now_iso()
        self.repo.update(row)
        self.task_repo.update_inspector(row["task_id"], row["to_inspector_id"])
        print(LOG_TEMPLATES["InspectionTask"][2], audit_target("InspectionTask", row["task_id"]),
              "inspector", row["from_inspector_id"], "->", row["to_inspector_id"])
        self._log(row, HandoverAction[1], operator_id, "接班人确认，任务负责人已转移")
        return self._assemble(row)

    def withdraw(self, handover_id, operator_id):
        row = self.repo.find_by_id(handover_id)
        if row is None:
            raise HandoverError("HANDOVER_NOT_FOUND")
        if row["status"] != HandoverStatus[0]:
            raise HandoverError("HANDOVER_NOT_PENDING")
        if row["from_inspector_id"] != operator_id:
            raise HandoverError("HANDOVER_FORBIDDEN")
        row["status"] = HandoverStatus[2]
        row["withdrawn_at"] = now_iso()
        self.repo.update(row)
        self._log(row, HandoverAction[2], operator_id, "交班人撤回交接")
        return self._assemble(row)

    def _log(self, row, action, operator_id, remark):
        template_index = HandoverAction.index(action) if action in HandoverAction else 0
        print(LOG_TEMPLATES["TaskHandover"][template_index], audit_target("TaskHandover", row["id"]),
              "operator", operator_id, "owner", row["from_inspector_id"], "->", row["to_inspector_id"])
        return self.event_repo.insert(create_handover_event_dto(
            handover_id=row["id"],
            action=action,
            operator_id=operator_id,
            from_owner_id=row["from_inspector_id"],
            to_owner_id=row["to_inspector_id"],
            created_at=now_iso(),
            remark=remark,
        ))
