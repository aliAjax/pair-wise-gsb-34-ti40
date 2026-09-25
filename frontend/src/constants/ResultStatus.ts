// 检查项（巡检结果）状态：未检查 / 已测待判定 / 正常 / 异常
export const ResultStatus = ["PENDING", "MEASURED", "NORMAL", "ABNORMAL"] as const;
export type ResultStatus = (typeof ResultStatus)[number];

export const ResultStatusText: Record<ResultStatus, string> = {
  PENDING: "未检查",
  MEASURED: "已测待判定",
  NORMAL: "正常",
  ABNORMAL: "异常"
};
