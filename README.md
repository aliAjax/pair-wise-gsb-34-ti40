# 消防设施巡检维保平台

面向园区和物业公司的消防设备巡检、隐患整改、维保计划和合规台账系统。

## 班次交接闭环（夜班 → 白班）

夜班巡检员遇到设备临时故障或现场情况变化时，不再只靠口头交接：

1. 交班人在**巡检任务页**或**消防设备台账页**点击「发起交接」，从本人未完成任务中勾选设备与检查项（测到一半的数值、照片、备注会冻结为快照），填写现场说明和接班人预计到场时间，选择接班人。
2. 交接单进入 `PENDING 待接班确认`：**接班人确认前，交班人随时可撤回**。
3. 接班人在「待我接班」中核对检查项与留痕后确认，任务负责人自动变更为接班人（`ACCEPTED 已接班`）；交班人撤回则交接失效、任务仍归交班人（`REVOKED 已撤回`）。
4. 发起、确认、撤回每一步都记录**操作人、操作时间、前后负责人**，在交接单详情的时间线中可查。

接口前缀：`/api/shift-handover`（`GET /sources`、`GET /sources/device/{device_id}`、`GET /receivers`、`POST /`、`POST /{id}/accept`、`POST /{id}/revoke`）。演示环境用请求头 `x-user-id` 模拟当前登录巡检员（前端左侧栏可切换身份，默认 1 = 张夜行，夜班；切换到 2 = 李晨光，白班，即可确认接班）。后端未启动时，前端内置同规则的本地兜底引擎（`mocks/handoverMockEngine.ts`），仅开前端也能走通发起→确认/撤回闭环。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20103>

后端健康检查：<http://localhost:21103/health>


## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
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
- HandoverStatus（交接状态 PENDING/ACCEPTED/REVOKED）：
  - 后端：`backend/src/constants/handover_status.py`、`models/shift_handover.py`、`services/shift_handover_service.py`、`constructors/shift_handover_factory.py`、`constants/log_templates.py`、`constants/error_codes.py`、`constants/error_messages.py`、`controllers/shift_handover_controller.py`、`routes/shift_handover_routes.py`、`database/init.sql`（shift_handover / item / event 三张表）、`seed.py`。
  - 前端：`constants/HandoverStatus.ts`、`constants/ResultStatus.ts`、`constants/errorCodes.ts`、`constants/errorMessages.ts`、`constants/logTemplates.ts`、`types/ShiftHandover.ts`、`types/HandoverSource.ts`、`constructors/ShiftHandoverConstructor.ts`、`api/ShiftHandover.ts`、`stores/ShiftHandoverStore.ts`、`hooks/useHandoverFlow.ts`、`components/handover/*`、`pages/TasksPage.tsx`、`pages/DevicesPage.tsx`。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
