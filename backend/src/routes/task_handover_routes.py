from fastapi import APIRouter

from src.controllers.task_handover_controller import (
    confirm_task_handover,
    create_task_handover,
    get_task_handover,
    list_task_handover,
    withdraw_task_handover,
)

router = APIRouter(prefix="/api/task-handover", tags=["TaskHandover"])

router.get("")(list_task_handover)
router.get("/{handover_id}")(get_task_handover)
router.post("")(create_task_handover)
router.post("/{handover_id}/confirm")(confirm_task_handover)
router.post("/{handover_id}/withdraw")(withdraw_task_handover)
