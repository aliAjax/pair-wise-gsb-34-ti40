import type { HandoverStatus, HandoverEventType } from "../constants/HandoverStatus";

export interface Inspector {
  id: number;
  name: string;
  shift: "NIGHT" | "DAY" | string;
  phone: string;
}

/** 交接单中冻结的检查项快照（含测到一半的数值与照片） */
export interface HandoverItem {
  id: number;
  device_id: number;
  device_code: string;
  device_name: string;
  item_code: string;
  item_name: string;
  result_id: number;
  measured_value: string;
  photo_url: string;
  note: string;
}

/** 每一步交接操作的留痕：操作人、时间、前后负责人 */
export interface HandoverEvent {
  id: number;
  type: HandoverEventType | string;
  actor_id: number;
  actor_name: string;
  from_owner_id: number;
  to_owner_id: number;
  created_at: string;
  remark: string;
}

export interface ShiftHandover {
  id: number;
  code: string;
  task_id: number;
  building_id: number;
  handover_from: number;
  handover_to: number;
  status: HandoverStatus | string;
  site_note: string;
  estimated_arrival_at: string;
  created_at: string;
  confirmed_at: string;
  revoked_at: string;
  items: HandoverItem[];
  events: HandoverEvent[];
}

/** 发起交接表单 */
export interface HandoverCreateForm {
  task_id: number;
  handover_to: number;
  site_note: string;
  estimated_arrival_at: string;
  items: { result_id: number }[];
}
