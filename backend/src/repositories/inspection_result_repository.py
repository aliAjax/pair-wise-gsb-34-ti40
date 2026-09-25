from src.seed import seed


class InspectionResultRepository:
    def find_all(self):
        return seed["inspectionResult"]

    def find_by_id(self, result_id):
        return next((row for row in seed["inspectionResult"] if row["id"] == result_id), None)

    def list_by_task(self, task_id):
        return [row for row in seed["inspectionResult"] if row["task_id"] == task_id]
