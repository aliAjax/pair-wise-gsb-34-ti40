from src.seed import seed
from src.constructors.shift_handover_factory import build_handover_event


class ShiftHandoverRepository:
    def __init__(self):
        self.rows = seed["shiftHandover"]
        self._item_seq = 8200
        self._event_seq = 100

    def find_all(self):
        return self.rows

    def find_by_id(self, handover_id):
        return next((row for row in self.rows if row["id"] == handover_id), None)

    def create(self, handover):
        self.rows.append(handover)
        return handover

    def next_id(self) -> int:
        return 7100 + len(self.rows)

    def next_item_id(self) -> int:
        self._item_seq += 1
        return self._item_seq

    def next_event_id(self) -> int:
        self._event_seq += 1
        return self._event_seq

    def add_event(self, handover, event_type, actor, from_owner, to_owner, remark):
        event = build_handover_event(
            id=self.next_event_id(),
            type=event_type,
            actor_id=actor["id"],
            actor_name=actor["name"],
            from_owner_id=from_owner,
            to_owner_id=to_owner,
            remark=remark,
        )
        handover["events"].append(event)
        return event
