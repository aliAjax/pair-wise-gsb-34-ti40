from src.seed import seed


class InspectionResultRepository:
    def find_all(self):
        return seed["inspectionResult"]

    def find_by_task(self, task_id):
        return [row for row in seed["inspectionResult"] if row["task_id"] == task_id]
