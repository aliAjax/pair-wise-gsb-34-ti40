import { HandoverStatus } from "../types/HandoverStatus";

export { HandoverStatus };
export type { HandoverStatus as HandoverStatusType } from "../types/HandoverStatus";

export const HandoverStatusText: Record<HandoverStatus, string> = {
  PENDING: "待确认",
  CONFIRMED: "已确认",
  WITHDRAWN: "已撤回",
};
