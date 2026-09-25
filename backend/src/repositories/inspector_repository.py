from src.seed import seed


class InspectorRepository:
    def find_all(self):
        return seed["inspector"]

    def find_by_id(self, inspector_id):
        return next((row for row in seed["inspector"] if row["id"] == inspector_id), None)
