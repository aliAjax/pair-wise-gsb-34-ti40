from fastapi import APIRouter, Request
from src.controllers.shift_handover_controller import (
    list_shift_handover,
    list_handover_receivers,
    list_handover_sources,
    get_handover_source_for_device,
    get_shift_handover,
    create_shift_handover,
    accept_shift_handover,
    revoke_shift_handover,
)

router = APIRouter(prefix="/api/shift-handover", tags=["ShiftHandover"])

router.get("")(list_shift_handover)
router.get("/receivers")(list_handover_receivers)
router.get("/sources")(list_handover_sources)
router.get("/sources/device/{device_id}")(get_handover_source_for_device)
router.get("/{handover_id}")(get_shift_handover)
router.post("")(create_shift_handover)
router.post("/{handover_id}/accept")(accept_shift_handover)
router.post("/{handover_id}/revoke")(revoke_shift_handover)
