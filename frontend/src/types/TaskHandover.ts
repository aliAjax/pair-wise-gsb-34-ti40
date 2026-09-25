import type { HandoverAction } from "./HandoverAction";
import type { HandoverStatus } from "./HandoverStatus";

export interface HandoverItem {
  id: number;
  handover_id: number;
  device_id: number;
  item_code: string;
  result_id: number;
}

export interface HandoverEvent {
  id: number;
  handover_id: number;
  action: HandoverAction;
  operator_id: number;
  from_owner_id: number;
  to_owner_id: number;
  created_at: string;
  remark: string;
}

export interface TaskHandover {
  id: number;
  task_id: number;
  from_inspector_id: number;
  to_inspector_id: number;
  note: string;
  expected_arrival_at: string;
  status: HandoverStatus;
  created_at: string;
  confirmed_at: string;
  withdrawn_at: string;
  items: HandoverItem[];
  events: HandoverEvent[];
}

export interface TaskHandoverCreatePayload {
  task_id: number;
  to_inspector_id: number;
  note: string;
  expected_arrival_at: string;
  items: Array<{ result_id: number }>;
}
