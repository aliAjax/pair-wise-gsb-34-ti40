from src.seed import seed
class FireDeviceRepository:
    def find_all(self):
        return seed["fireDevice"]

    def find_by_id(self, device_id):
        return next((row for row in seed["fireDevice"] if row["id"] == device_id), None)
