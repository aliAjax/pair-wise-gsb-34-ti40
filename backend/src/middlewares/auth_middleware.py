async def auth_middleware(request, call_next):
    # 演示环境通过请求头模拟登录态：x-user-id 指定当前巡检员，x-role 指定角色
    request.state.user = {
        "id": int(request.headers.get("x-user-id", "1")),
        "role": request.headers.get("x-role", "inspector"),
        "name": request.headers.get("x-user-name", ""),
    }
    return await call_next(request)
