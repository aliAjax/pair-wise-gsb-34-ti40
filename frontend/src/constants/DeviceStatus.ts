export const DeviceStatus = ["NORMAL", "FAULT", "MAINTAINING"] as const;
export type DeviceStatus = (typeof DeviceStatus)[number];
export const DeviceStatusText: Record<DeviceStatus, string> = {
  NORMAL: "正常",
  FAULT: "故障",
  MAINTAINING: "维保中"
};
