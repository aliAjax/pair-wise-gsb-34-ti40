export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  HANDOVER_NOT_FOUND: "交接单不存在或已被清理",
  HANDOVER_NOT_PENDING: "交接单不在待确认状态，无法执行该操作",
  HANDOVER_FORBIDDEN: "当前用户无权操作该交接单",
  HANDOVER_TASK_FINISHED: "任务已完成，不能发起交接",
  HANDOVER_ALREADY_PENDING: "该任务已有待确认的交接单，请先处理"
};
