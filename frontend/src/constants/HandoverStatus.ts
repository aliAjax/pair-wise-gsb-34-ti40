export const HandoverStatus = ["PENDING", "ACCEPTED", "REVOKED"] as const;
export type HandoverStatus = (typeof HandoverStatus)[number];

export const HandoverStatusText: Record<HandoverStatus, string> = {
  PENDING: "待接班确认",
  ACCEPTED: "已接班",
  REVOKED: "已撤回"
};

// 交接单操作事件：发起 / 确认接班 / 撤回
export const HandoverEventType = ["CREATE", "ACCEPT", "REVOKE"] as const;
export type HandoverEventType = (typeof HandoverEventType)[number];

export const HandoverEventTypeText: Record<HandoverEventType, string> = {
  CREATE: "发起交接",
  ACCEPT: "确认接班",
  REVOKE: "交班人撤回"
};
