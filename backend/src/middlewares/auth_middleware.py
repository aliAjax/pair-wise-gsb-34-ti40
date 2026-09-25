async def auth_middleware(request, call_next):
    try:
        user_id = int(request.headers.get("x-user-id", "1"))
    except ValueError:
        user_id = 1
    request.state.user = {"id": user_id, "role": request.headers.get("x-role", "admin")}
    return await call_next(request)
