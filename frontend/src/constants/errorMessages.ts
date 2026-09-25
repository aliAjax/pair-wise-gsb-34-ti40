export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  HANDOVER_NOT_FOUND: "交接单不存在",
  HANDOVER_NOT_PENDING: "交接单不是待确认状态",
  HANDOVER_NOT_FROM_OWNER: "只有交班人本人可以撤回交接单",
  HANDOVER_NOT_TO_OWNER: "只有指定的接班人可以确认交接单",
  HANDOVER_TASK_NOT_OWNED: "只能交接本人名下未完成的巡检任务",
  HANDOVER_TASK_NOT_OPEN: "任务已完成或已复核，无法交接",
  HANDOVER_EMPTY_ITEMS: "请至少勾选一个设备检查项",
  HANDOVER_RECEIVER_REQUIRED: "请选择接班人",
  HANDOVER_SITE_NOTE_REQUIRED: "请填写现场说明",
  HANDOVER_ETA_REQUIRED: "请填写预计到场时间",
  HANDOVER_ITEM_RESULT_MISMATCH: "勾选的检查项不属于该任务"
} as const;
