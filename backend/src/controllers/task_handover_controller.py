from fastapi import Request
from fastapi.responses import JSONResponse

from src.constants.error_codes import ERROR_CODES
from src.constants.error_messages import ERROR_MESSAGES
from src.services.task_handover_service import HandoverError, TaskHandoverService

service = TaskHandoverService()


def _current_user_id(request: Request) -> int:
    user = getattr(request.state, "user", None) or {}
    return int(user.get("id", 1))


def _wrap_error(exc: HandoverError) -> JSONResponse:
    code = exc.code if exc.code in ERROR_CODES.values() else ERROR_CODES["VALIDATION_FAILED"]
    message = ERROR_MESSAGES.get(code, ERROR_MESSAGES["VALIDATION_FAILED"])
    status_code = 404 if code == "HANDOVER_NOT_FOUND" else 400
    return JSONResponse(status_code=status_code, content={"code": code, "message": message})


def list_task_handover(task_id: int | None = None, device_id: int | None = None, inspector_id: int | None = None):
    return service.list(task_id=task_id, device_id=device_id, inspector_id=inspector_id)


def get_task_handover(handover_id: int):
    try:
        return service.get(handover_id)
    except HandoverError as exc:
        return _wrap_error(exc)


async def create_task_handover(request: Request):
    try:
        payload = await request.json()
        return service.create(payload, _current_user_id(request))
    except HandoverError as exc:
        return _wrap_error(exc)


def confirm_task_handover(handover_id: int, request: Request):
    try:
        return service.confirm(handover_id, _current_user_id(request))
    except HandoverError as exc:
        return _wrap_error(exc)


def withdraw_task_handover(handover_id: int, request: Request):
    try:
        return service.withdraw(handover_id, _current_user_id(request))
    except HandoverError as exc:
        return _wrap_error(exc)
