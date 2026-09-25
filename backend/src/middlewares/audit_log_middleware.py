from src.utils.formatters import audit_target, now_iso

WATCHED_PREFIXES = ("/api/task-handover",)


async def audit_log_middleware(request, call_next):
    print("audit", request.method, request.url.path)
    if request.method in ("POST", "PUT", "PATCH", "DELETE") and request.url.path.startswith(WATCHED_PREFIXES):
        user = getattr(request.state, "user", None) or {}
        print("audit-trail", audit_target("TaskHandover", request.url.path.rsplit("/", 1)[-1]),
              "actor", user.get("id", "?"), "at", now_iso())
    return await call_next(request)
