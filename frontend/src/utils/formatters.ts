export const formatDate = (value: string) => (value ? new Date(value).toLocaleString("zh-CN") : "—");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);
export const formatDateTimeLocal = (value: string) => (value ? value.slice(0, 16) : "");

// 设备类型 / 班次 / 交接动作的中文展示，多个页面共同依赖
export const DEVICE_TYPE_NAME: Record<string, string> = {
  EXTINGUISHER: "手提式灭火器",
  HYDRANT: "室内消火栓",
  SMOKE_DETECTOR: "点型感烟探测器",
  SPRINKLER: "闭式喷淋头",
  EXIT_LIGHT: "应急疏散指示灯"
};
export const SHIFT_TEXT: Record<string, string> = { NIGHT: "夜班", DAY: "白班" };
export const TASK_TYPE_TEXT: Record<string, string> = { NIGHT_PATROL: "夜班巡检", DAY_PATROL: "白班巡检" };

export const deviceTypeName = (value: string) => DEVICE_TYPE_NAME[value] ?? value;
export const shiftText = (value: string) => SHIFT_TEXT[value] ?? value;
export const taskTypeText = (value: string) => TASK_TYPE_TEXT[value] ?? value;
