from src.seed import seed


def _next_id(rows):
    return max([row["id"] for row in rows], default=0) + 1


class TaskHandoverRepository:
    def find_all(self):
        return seed["taskHandover"]

    def find_by_id(self, handover_id):
        for row in seed["taskHandover"]:
            if row["id"] == handover_id:
                return row
        return None

    def find_pending_by_task(self, task_id):
        for row in seed["taskHandover"]:
            if row["task_id"] == task_id and row["status"] == "PENDING":
                return row
        return None

    def insert(self, row):
        row["id"] = _next_id(seed["taskHandover"])
        seed["taskHandover"].append(row)
        return row

    def update(self, row):
        return row


class HandoverItemRepository:
    def find_all(self):
        return seed["handoverItem"]

    def find_by_handover(self, handover_id):
        return [row for row in seed["handoverItem"] if row["handover_id"] == handover_id]

    def insert(self, row):
        row["id"] = _next_id(seed["handoverItem"])
        seed["handoverItem"].append(row)
        return row


class HandoverEventRepository:
    def find_all(self):
        return seed["handoverEvent"]

    def find_by_handover(self, handover_id):
        return [row for row in seed["handoverEvent"] if row["handover_id"] == handover_id]

    def insert(self, row):
        row["id"] = _next_id(seed["handoverEvent"])
        seed["handoverEvent"].append(row)
        return row
