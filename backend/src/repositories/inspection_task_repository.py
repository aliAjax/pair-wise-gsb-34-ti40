from src.seed import seed


class InspectionTaskRepository:
    def find_all(self):
        return seed["inspectionTask"]

    def find_by_id(self, task_id):
        for row in seed["inspectionTask"]:
            if row["id"] == task_id:
                return row
        return None

    def update_inspector(self, task_id, inspector_id):
        row = self.find_by_id(task_id)
        if row is not None:
            row["inspector_id"] = inspector_id
        return row
