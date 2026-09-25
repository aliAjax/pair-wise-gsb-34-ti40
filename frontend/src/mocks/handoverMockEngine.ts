import { mockData } from "./seedData";
import type { ShiftHandover, HandoverCreateForm } from "../types/ShiftHandover";
import type { HandoverSourceTask, HandoverDeviceSource, HandoverSourceItem } from "../types/HandoverSource";

/**
 * 离线兜底交接引擎：后端不可达时在浏览器内复现核心闭环规则，
 * 保证评审环境（仅启动前端）也能完整演示发起/确认/撤回。
 */

const DEVICE_NAME: Record<string, string> = {
  EXTINGUISHER: "手提式灭火器",
  HYDRANT: "室内消火栓",
  SMOKE_DETECTOR: "点型感烟探测器",
  SPRINKLER: "闭式喷淋头",
  EXIT_LIGHT: "应急疏散指示灯"
};

const OPEN_STATUS = new Set(["PLANNED", "IN_PROGRESS", "OVERDUE"]);

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function nowText(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const rows = clone(mockData.shiftHandover) as unknown as ShiftHandover[];
let handoverSeq = 7100 + rows.length;
let itemSeq = 8200;
let eventSeq = 100;

const inspectors = mockData.inspector as unknown as { id: number; name: string; shift: string }[];
export const nameOf = (id: number) => inspectors.find((row) => row.id === id)?.name ?? `#${id}`;

export function listLocal(scope: "all" | "from_me" | "to_me", userId: number): ShiftHandover[] {
  return rows
    .filter((row) => scope === "all" || (scope === "from_me" ? row.handover_from === userId : row.handover_to === userId))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getLocal(id: number): ShiftHandover | null {
  return rows.find((row) => row.id === id) ?? null;
}

export function receiversLocal(userId: number) {
  return inspectors.filter((row) => row.id !== userId);
}

function buildSources(userId: number): HandoverSourceTask[] {
  const devices = mockData.fireDevice as unknown as {
    id: number; device_code: string; device_type: string; floor: string; location_desc: string;
  }[];
  const deviceMap = new Map(devices.map((d) => [d.id, d]));
  return (mockData.inspectionTask as unknown as {
    id: number; building_id: number; inspector_id: number; plan_date: string; task_type: string; status: string;
  }[])
    .filter((task) => task.inspector_id === userId && OPEN_STATUS.has(task.status))
    .map((task) => {
      const groups = new Map<number, HandoverSourceTask["devices"][number]>();
      (mockData.inspectionResult as unknown as {
        id: number; task_id: number; device_id: number; item_code: string; item_name: string;
        result_status: string; measured_value: string; photo_url: string; note: string;
      }[])
        .filter((r) => r.task_id === task.id)
        .forEach((r) => {
          const device = deviceMap.get(r.device_id);
          const group: HandoverSourceTask["devices"][number] = groups.get(r.device_id) ?? {
            device_id: r.device_id,
            device_code: device?.device_code ?? "",
            device_name: DEVICE_NAME[device?.device_type ?? ""] ?? device?.device_type ?? "",
            floor: device?.floor ?? "",
            location_desc: device?.location_desc ?? "",
            items: []
          };
          const item: HandoverSourceItem = {
            result_id: r.id, item_code: r.item_code, item_name: r.item_name,
            result_status: r.result_status, measured_value: r.measured_value,
            photo_url: r.photo_url, note: r.note
          };
          group.items.push(item);
          groups.set(r.device_id, group);
        });
      return {
        task_id: task.id, building_id: task.building_id, task_type: task.task_type,
        plan_date: task.plan_date, status: task.status, devices: [...groups.values()]
      };
    });
}

export function sourcesLocal(userId: number): HandoverSourceTask[] {
  return buildSources(userId);
}

export function deviceSourceLocal(deviceId: number, userId: number): HandoverDeviceSource | null {
  for (const source of buildSources(userId)) {
    const device = source.devices.find((d) => d.device_id === deviceId);
    if (device) {
      return {
        task_id: source.task_id, building_id: source.building_id, task_type: source.task_type,
        plan_date: source.plan_date, status: source.status, device
      };
    }
  }
  return null;
}

function findPending(id: number): ShiftHandover {
  const row = getLocal(id);
  if (!row) throw new Error("交接单不存在");
  if (row.status !== "PENDING") throw new Error("交接单不是待确认状态");
  return row;
}

export function createLocal(form: HandoverCreateForm, userId: number): ShiftHandover {
  if (!form.handover_to) throw new Error("请选择接班人");
  if (!form.site_note.trim()) throw new Error("请填写现场说明");
  if (!form.estimated_arrival_at) throw new Error("请填写预计到场时间");
  if (form.items.length === 0) throw new Error("请至少勾选一个设备检查项");

  const task = (mockData.inspectionTask as unknown as {
    id: number; building_id: number; inspector_id: number; status: string;
  }[]).find((t) => t.id === form.task_id);
  if (!task || task.inspector_id !== userId) throw new Error("只能交接本人名下未完成的巡检任务");
  if (!OPEN_STATUS.has(task.status)) throw new Error("任务已完成或已复核，无法交接");

  const results = mockData.inspectionResult as unknown as {
    id: number; task_id: number; device_id: number; item_code: string; item_name: string;
    measured_value: string; photo_url: string; note: string;
  }[];
  const devices = mockData.fireDevice as unknown as {
    id: number; device_code: string; device_type: string;
  }[];

  const handover: ShiftHandover = {
    id: ++handoverSeq,
    code: `HJ-LOCAL-${String(rows.length + 1).padStart(3, "0")}`,
    task_id: form.task_id,
    building_id: task.building_id,
    handover_from: userId,
    handover_to: form.handover_to,
    status: "PENDING",
    site_note: form.site_note,
    estimated_arrival_at: form.estimated_arrival_at,
    created_at: nowText(),
    confirmed_at: "",
    revoked_at: "",
    items: [],
    events: []
  };

  form.items.forEach((picked) => {
    const r = results.find((row) => row.id === picked.result_id && row.task_id === form.task_id);
    if (!r) throw new Error("勾选的检查项不属于该任务");
    const device = devices.find((d) => d.id === r.device_id);
    handover.items.push({
      id: ++itemSeq,
      device_id: r.device_id,
      device_code: device?.device_code ?? "",
      device_name: DEVICE_NAME[device?.device_type ?? ""] ?? device?.device_type ?? "",
      item_code: r.item_code,
      item_name: r.item_name,
      result_id: r.id,
      measured_value: r.measured_value,
      photo_url: r.photo_url,
      note: r.note
    });
  });

  handover.events.push({
    id: ++eventSeq, type: "CREATE", actor_id: userId, actor_name: nameOf(userId),
    from_owner_id: userId, to_owner_id: form.handover_to, created_at: handover.created_at,
    remark: `发起交接，勾选 ${handover.items.length} 个检查项，等待 ${nameOf(form.handover_to)} 确认`
  });

  rows.push(handover);
  return handover;
}

export function acceptLocal(id: number, userId: number): ShiftHandover {
  const row = findPending(id);
  if (row.handover_to !== userId) throw new Error("只有指定的接班人可以确认交接单");
  row.status = "ACCEPTED";
  row.confirmed_at = nowText();
  const task = (mockData.inspectionTask as unknown as { id: number; inspector_id: number }[])
    .find((t) => t.id === row.task_id);
  if (task) task.inspector_id = userId;
  row.events.push({
    id: ++eventSeq, type: "ACCEPT", actor_id: userId, actor_name: nameOf(userId),
    from_owner_id: row.handover_from, to_owner_id: userId, created_at: row.confirmed_at,
    remark: "接班人确认，任务负责人由交班人变更为接班人"
  });
  return row;
}

export function revokeLocal(id: number, userId: number): ShiftHandover {
  const row = findPending(id);
  if (row.handover_from !== userId) throw new Error("只有交班人本人可以撤回交接单");
  row.status = "REVOKED";
  row.revoked_at = nowText();
  row.events.push({
    id: ++eventSeq, type: "REVOKE", actor_id: userId, actor_name: nameOf(userId),
    from_owner_id: userId, to_owner_id: row.handover_to, created_at: row.revoked_at,
    remark: "接班人确认前交班人撤回，交接失效，任务仍由交班人持有"
  });
  return row;
}
