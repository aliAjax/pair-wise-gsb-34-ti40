from fastapi import APIRouter
from src.controllers.inspector_controller import list_inspector

router = APIRouter(prefix="/api/inspector", tags=["Inspector"])
router.get("")(list_inspector)
