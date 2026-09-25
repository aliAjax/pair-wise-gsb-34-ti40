from datetime import datetime, timezone


def audit_target(kind, id):
    return f"{kind}#{id}"


def now_iso():
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
