from src.services.inspector_service import InspectorService

service = InspectorService()


def list_inspector():
    return service.list()
