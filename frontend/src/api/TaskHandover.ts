import { getMockState, mockNextId } from "../mocks/mockStore";
import { currentUserId } from "../stores/CurrentUserStore";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { HandoverEvent, TaskHandover, TaskHandoverCreatePayload } from "../types/TaskHandover";

const endpoint = "/api/task-handover";

const UNFINISHED_TASK_STATUS = ["PLANNED", "IN_PROGRESS", "OVERDUE"];
const UNFINISHED_RESULT_STATUS = ["PLANNED", "IN_PROGRESS"];

const nextId = mockNextId;
const nowIso = () => new Date().toISOString();

function assemble(row: TaskHandover): TaskHandover {
  const s = getMockState();
  return {
    ...row,
    items: s.handoverItem.filter((item) => item.handover_id === row.id).map((item) => ({ ...item })),
    events: s.handoverEvent.filter((event) => event.handover_id === row.id).map((event) => ({ ...event }))
  };
}

async function requestRemote<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(path, {
      ...init,
      headers: { "Content-Type": "application/json", "x-user-id": String(currentUserId()) }
    });
    if (res.ok) return (await res.json()) as T;
    if (res.status >= 500) return null; // backend/proxy unavailable -> local mock engine
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? ERROR_MESSAGES.VALIDATION_FAILED);
  } catch (err) {
    if (err instanceof TypeError) return null; // backend offline -> local mock engine
    throw err;
  }
}

function pushEvent(row: TaskHandover, action: HandoverEvent["action"], remark: string) {
  const s = getMockState();
  s.handoverEvent.push({
    id: nextId(s.handoverEvent),
    handover_id: row.id,
    action,
    operator_id: currentUserId(),
    from_owner_id: row.from_inspector_id,
    to_owner_id: row.to_inspector_id,
    created_at: nowIso(),
    remark
  });
}

function mockCreate(payload: TaskHandoverCreatePayload): TaskHandover {
  const s = getMockState();
  const task = s.inspectionTask.find((row) => row.id === payload.task_id);
  if (!task || !payload.note.trim() || !payload.expected_arrival_at || payload.items.length === 0) {
    throw new Error(ERROR_MESSAGES.VALIDATION_FAILED);
  }
  const operatorId = currentUserId();
  if (!UNFINISHED_TASK_STATUS.includes(task.status)) throw new Error(ERROR_MESSAGES.HANDOVER_TASK_FINISHED);
  if (task.inspector_id !== operatorId) throw new Error(ERROR_MESSAGES.HANDOVER_FORBIDDEN);
  if (payload.to_inspector_id === operatorId) throw new Error(ERROR_MESSAGES.VALIDATION_FAILED);
  if (s.taskHandover.some((row) => row.task_id === task.id && row.status === "PENDING")) {
    throw new Error(ERROR_MESSAGES.HANDOVER_ALREADY_PENDING);
  }
  const validResultIds = new Set(
    s.inspectionResult
      .filter((row) => row.task_id === task.id && UNFINISHED_RESULT_STATUS.includes(row.result_status))
      .map((row) => row.id)
  );
  for (const item of payload.items) {
    if (!validResultIds.has(item.result_id)) throw new Error(ERROR_MESSAGES.VALIDATION_FAILED);
  }
  const handoverId = nextId(s.taskHandover);
  const row: TaskHandover = {
    id: handoverId,
    task_id: task.id,
    from_inspector_id: operatorId,
    to_inspector_id: payload.to_inspector_id,
    note: payload.note.trim(),
    expected_arrival_at: payload.expected_arrival_at,
    status: "PENDING",
    created_at: nowIso(),
    confirmed_at: "",
    withdrawn_at: "",
    items: [],
    events: []
  };
  s.taskHandover.push(row);
  for (const item of payload.items) {
    const result = s.inspectionResult.find((r) => r.id === item.result_id)!;
    s.handoverItem.push({
      id: nextId(s.handoverItem),
      handover_id: handoverId,
      device_id: result.device_id,
      item_code: result.item_code,
      result_id: result.id
    });
  }
  pushEvent(row, "CREATED", "夜班交接发起");
  console.info(LOG_TEMPLATES.TaskHandover[0], handoverId);
  return assemble(row);
}

function mockFind(id: number): TaskHandover {
  const row = getMockState().taskHandover.find((r) => r.id === id);
  if (!row) throw new Error(ERROR_MESSAGES.HANDOVER_NOT_FOUND);
  return row;
}

function mockConfirm(id: number): TaskHandover {
  const s = getMockState();
  const row = mockFind(id);
  if (row.status !== "PENDING") throw new Error(ERROR_MESSAGES.HANDOVER_NOT_PENDING);
  if (row.to_inspector_id !== currentUserId()) throw new Error(ERROR_MESSAGES.HANDOVER_FORBIDDEN);
  row.status = "CONFIRMED";
  row.confirmed_at = nowIso();
  const task = s.inspectionTask.find((t) => t.id === row.task_id);
  if (task) task.inspector_id = row.to_inspector_id;
  pushEvent(row, "CONFIRMED", "接班人确认，任务负责人已转移");
  console.info(LOG_TEMPLATES.TaskHandover[1], id);
  return assemble(row);
}

function mockWithdraw(id: number): TaskHandover {
  const row = mockFind(id);
  if (row.status !== "PENDING") throw new Error(ERROR_MESSAGES.HANDOVER_NOT_PENDING);
  if (row.from_inspector_id !== currentUserId()) throw new Error(ERROR_MESSAGES.HANDOVER_FORBIDDEN);
  row.status = "WITHDRAWN";
  row.withdrawn_at = nowIso();
  pushEvent(row, "WITHDRAWN", "交班人撤回交接");
  console.info(LOG_TEMPLATES.TaskHandover[2], id);
  return assemble(row);
}

export async function listTaskHandover(): Promise<TaskHandover[]> {
  try {
    const remote = await requestRemote<TaskHandover[]>(endpoint);
    if (remote) return remote;
  } catch {
    // Backend unreachable or outdated: fall back to the local mock engine.
  }
  return getMockState().taskHandover.map(assemble);
}

export async function createTaskHandover(payload: TaskHandoverCreatePayload): Promise<TaskHandover> {
  const remote = await requestRemote<TaskHandover>(endpoint, { method: "POST", body: JSON.stringify(payload) });
  if (remote) return remote;
  return mockCreate(payload);
}

export async function confirmTaskHandover(id: number): Promise<TaskHandover> {
  const remote = await requestRemote<TaskHandover>(`${endpoint}/${id}/confirm`, { method: "POST" });
  if (remote) return remote;
  return mockConfirm(id);
}

export async function withdrawTaskHandover(id: number): Promise<TaskHandover> {
  const remote = await requestRemote<TaskHandover>(`${endpoint}/${id}/withdraw`, { method: "POST" });
  if (remote) return remote;
  return mockWithdraw(id);
}
