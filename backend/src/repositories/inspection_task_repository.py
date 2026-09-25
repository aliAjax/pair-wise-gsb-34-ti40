from src.seed import seed


class InspectionTaskRepository:
    def find_all(self):
        return seed["inspectionTask"]

    def find_by_id(self, task_id):
        return next((row for row in seed["inspectionTask"] if row["id"] == task_id), None)

    def reassign(self, task_id, inspector_id):
        task = self.find_by_id(task_id)
        if task is not None:
            task["inspector_id"] = inspector_id
        return task
