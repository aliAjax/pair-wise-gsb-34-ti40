from src.repositories.inspector_repository import InspectorRepository


class InspectorService:
    def __init__(self):
        self.repo = InspectorRepository()

    def list(self):
        return self.repo.find_all()
