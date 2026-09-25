from fastapi import HTTPException, Request
from src.services.shift_handover_service import ShiftHandoverService
from src.services.handover_errors import HandoverServiceError, error_code
from src.repositories.inspector_repository import InspectorRepository

service = ShiftHandoverService()
inspector_repo = InspectorRepository()


def current_user(request: Request) -> dict:
    user = dict(getattr(request.state, "user", {"id": 1, "role": "inspector", "name": ""}))
    inspector = inspector_repo.find_by_id(user.get("id"))
    if inspector is not None:
        user["name"] = inspector["name"]
    return user


def _raise(exc: HandoverServiceError):
    # controller 层二次包装业务异常，禁止把异常处理全部塞进全局中间件
    raise HTTPException(status_code=400, detail={"code": error_code(exc.code), "message": str(exc)})


def list_shift_handover(request: Request, scope: str = "all"):
    user = current_user(request)
    try:
        return service.list(scope=scope, user_id=user["id"])
    except HandoverServiceError as exc:
        _raise(exc)


def list_handover_receivers(request: Request):
    user = current_user(request)
    return service.list_receivers(user["id"])


def list_handover_sources(request: Request):
    user = current_user(request)
    return service.handover_sources(user["id"])


def get_handover_source_for_device(device_id: int, request: Request):
    user = current_user(request)
    return service.related_for_device(device_id, user["id"])


def get_shift_handover(handover_id: int, request: Request):
    try:
        return service.detail(handover_id)
    except HandoverServiceError as exc:
        _raise(exc)


def create_shift_handover(payload: dict, request: Request):
    user = current_user(request)
    try:
        return service.create(payload, user)
    except HandoverServiceError as exc:
        _raise(exc)


def accept_shift_handover(handover_id: int, request: Request):
    user = current_user(request)
    try:
        return service.accept(handover_id, user)
    except HandoverServiceError as exc:
        _raise(exc)


def revoke_shift_handover(handover_id: int, request: Request):
    user = current_user(request)
    try:
        return service.revoke(handover_id, user)
    except HandoverServiceError as exc:
        _raise(exc)
