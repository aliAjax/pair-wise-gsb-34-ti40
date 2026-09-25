# 消防设施巡检维保平台

面向园区和物业公司的消防设备巡检、隐患整改、维保计划和合规台账系统。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20103>

后端健康检查：<http://localhost:21103/health>

交接闭环接口示例：

```bash
# 查看交接单（含勾选检查项与流转事件）
curl http://localhost:21103/api/task-handover
# 交班人发起交接（x-user-id 模拟当前登录人）
curl -X POST http://localhost:21103/api/task-handover \
  -H 'Content-Type: application/json' -H 'x-user-id: 1' \
  -d '{"task_id":1,"to_inspector_id":2,"note":"现场说明","expected_arrival_at":"2026-09-25T09:00:00Z","items":[{"result_id":1}]}'
# 接班人确认 / 交班人撤回
curl -X POST http://localhost:21103/api/task-handover/1/confirm -H 'x-user-id: 2'
curl -X POST http://localhost:21103/api/task-handover/1/withdraw -H 'x-user-id: 1'
```

## 交接班闭环说明

夜班巡检员遇到设备临时故障或现场情况变化时，可在 **巡检任务页** 或 **消防设备台账页** 直接发起交接：

1. 交班人从本人未完成任务（PLANNED / IN_PROGRESS / OVERDUE）中勾选设备和未完成检查项，已测数值与现场照片随交接单一并交接，不会丢失；
2. 填写现场说明与预计到场时间，选择接班人后提交，交接单进入 `PENDING`；
3. 接班人确认（`CONFIRMED`）后，任务负责人自动转移给接班人继续处理；确认前交班人可撤回（`WITHDRAWN`）；
4. 每一步都记录操作人、时间与前后负责人（`handover_event`），页面时间线可回看全部流转。

页面右上角可切换当前登录人（夜班/白班），便于演示「交班人发起 → 接班人确认」完整闭环；后端通过 `x-user-id` 请求头识别操作人。

## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`（已配置 `/api` 代理到 `http://localhost:21103`）
- 后端：进入 `backend` 后按技术栈运行开发命令，接口统一挂在 `/api`。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Material UI + Redux Toolkit |
| 后端 | FastAPI + Python 3.11 + SQLAlchemy 2.0 |
| 数据库 | PostgreSQL 15 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, utils, types, config
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `fire-inspect`
- `FRONTEND_PORT`: 前端端口，默认 `20103`
- `BACKEND_PORT`: 后端端口，默认 `21103`
- `DB_PORT`: 数据库宿主机端口
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: fire-inspect`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-fire-inspect}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- DeviceType: constants/DeviceType、types/DeviceType、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- InspectionStatus: constants/InspectionStatus、types/InspectionStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- HazardSeverity: constants/HazardSeverity、types/HazardSeverity、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- HandoverStatus（PENDING/CONFIRMED/WITHDRAWN）: `frontend/src/constants/HandoverStatus.ts`、`frontend/src/types/HandoverStatus.ts`、`backend/src/constants/handover_status.py`、`frontend/src/constants/statusText.ts`、`frontend/src/components/common/HandoverStatusTag.tsx`、`backend/src/services/task_handover_service.py`、`frontend/src/mocks/seedData.ts` 与 `backend/src/seed.py`、`database/init.sql` 均有引用。
- HandoverAction（CREATED/CONFIRMED/WITHDRAWN）: `frontend/src/constants/HandoverAction.ts`、`frontend/src/types/HandoverAction.ts`、`backend/src/constants/handover_action.py`、`frontend/src/components/common/HandoverTimeline.tsx`、`backend/src/services/task_handover_service.py` 均有引用。
- DeviceStatus（NORMAL/FAULT/MAINTAINING）: `frontend/src/constants/DeviceStatus.ts`、`frontend/src/pages/DevicesPage.tsx`、`frontend/src/mocks/seedData.ts` 与 `backend/src/seed.py` 均有引用。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
