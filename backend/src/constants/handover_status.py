# 交接单生命周期状态
# PENDING   交班人已发起，等待接班人确认；交班人可撤回
# ACCEPTED  接班人已确认，任务正式转移给接班人
# REVOKED   接班人确认前被交班人撤回，交接失效
HANDOVER_STATUS = ["PENDING", "ACCEPTED", "REVOKED"]

HANDOVER_STATUS_TEXT = {
    "PENDING": "待接班确认",
    "ACCEPTED": "已接班",
    "REVOKED": "已撤回",
}

# 交接事件类型：每个动作都留痕，记录操作人、时间与前后负责人
HANDOVER_EVENT_TYPES = ["CREATE", "ACCEPT", "REVOKE"]
