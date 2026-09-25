# 本地种子数据：全部为演示数据，不接入第三方 API。
# inspector 为巡检员花名册，交接流程用它解析交班人/接班人姓名。
seed = {
  "inspector": [
    {"id": 1, "name": "张夜行", "shift": "NIGHT", "phone": "13800000001"},
    {"id": 2, "name": "李晨光", "shift": "DAY", "phone": "13800000002"},
    {"id": 3, "name": "王冬梅", "shift": "NIGHT", "phone": "13800000003"},
    {"id": 4, "name": "赵旭日", "shift": "DAY", "phone": "13800000004"}
  ],
  "building": [
    {"id": 1, "name": "A 栋研发楼", "campus": "滨江科技园", "floor_count": 12, "fire_grade": "一级", "manager_id": 4, "address_code": "330108-A"},
    {"id": 2, "name": "B 栋综合楼", "campus": "滨江科技园", "floor_count": 8, "fire_grade": "二级", "manager_id": 2, "address_code": "330108-B"},
    {"id": 3, "name": "C 栋仓储中心", "campus": "云谷园区", "floor_count": 3, "fire_grade": "一级", "manager_id": 4, "address_code": "330110-C"}
  ],
  "fireDevice": [
    {"id": 101, "building_id": 1, "device_code": "MH-A-0101", "device_type": "EXTINGUISHER", "floor": "1F", "location_desc": "一层大厅东侧消火栓旁", "install_date": "2025-03-12", "status": "NORMAL", "next_maintenance_at": "2026-12-01T09:00:00"},
    {"id": 102, "building_id": 1, "device_code": "XHS-A-0203", "device_type": "HYDRANT", "floor": "2F", "location_desc": "二层西侧楼梯口", "install_date": "2024-11-02", "status": "IN_REPAIR", "next_maintenance_at": "2026-10-15T09:00:00"},
    {"id": 103, "building_id": 1, "device_code": "YGC-A-0305", "device_type": "SMOKE_DETECTOR", "floor": "3F", "location_desc": "三层会议室吊顶中央", "install_date": "2025-01-20", "status": "NORMAL", "next_maintenance_at": "2026-11-20T09:00:00"},
    {"id": 104, "building_id": 1, "device_code": "PLS-A-0402", "device_type": "SPRINKLER", "floor": "4F", "location_desc": "四层茶水间管廊", "install_date": "2024-09-08", "status": "FAULT", "next_maintenance_at": "2026-09-30T09:00:00"},
    {"id": 105, "building_id": 2, "device_code": "JSD-B-0101", "device_type": "EXIT_LIGHT", "floor": "1F", "location_desc": "一层安全出口上方", "install_date": "2025-05-30", "status": "NORMAL", "next_maintenance_at": "2026-12-10T09:00:00"},
    {"id": 106, "building_id": 2, "device_code": "MH-B-0202", "device_type": "EXTINGUISHER", "floor": "2F", "location_desc": "二层走廊中段", "install_date": "2024-12-15", "status": "NORMAL", "next_maintenance_at": "2026-10-25T09:00:00"},
    {"id": 107, "building_id": 2, "device_code": "XHS-B-0301", "device_type": "HYDRANT", "floor": "3F", "location_desc": "三层电梯厅东侧", "install_date": "2025-02-18", "status": "NORMAL", "next_maintenance_at": "2026-11-05T09:00:00"},
    {"id": 108, "building_id": 3, "device_code": "YGC-C-0108", "device_type": "SMOKE_DETECTOR", "floor": "1F", "location_desc": "仓库一区立柱上方", "install_date": "2024-08-22", "status": "FAULT", "next_maintenance_at": "2026-09-28T09:00:00"},
    {"id": 109, "building_id": 3, "device_code": "PLS-C-0201", "device_type": "SPRINKLER", "floor": "2F", "location_desc": "仓库二层货架主通道", "install_date": "2024-07-11", "status": "NORMAL", "next_maintenance_at": "2026-12-18T09:00:00"}
  ],
  "inspectionTask": [
    {"id": 5001, "building_id": 1, "inspector_id": 1, "plan_date": "2026-09-25", "task_type": "NIGHT_PATROL", "status": "IN_PROGRESS", "checklist_version": "v2026.09", "finished_at": ""},
    {"id": 5002, "building_id": 2, "inspector_id": 1, "plan_date": "2026-09-25", "task_type": "NIGHT_PATROL", "status": "IN_PROGRESS", "checklist_version": "v2026.09", "finished_at": ""},
    {"id": 5003, "building_id": 3, "inspector_id": 3, "plan_date": "2026-09-25", "task_type": "NIGHT_PATROL", "status": "IN_PROGRESS", "checklist_version": "v2026.09", "finished_at": ""},
    {"id": 5004, "building_id": 1, "inspector_id": 2, "plan_date": "2026-09-24", "task_type": "DAY_PATROL", "status": "REVIEWED", "checklist_version": "v2026.09", "finished_at": "2026-09-24T17:20:00"},
    {"id": 5005, "building_id": 2, "inspector_id": 2, "plan_date": "2026-09-25", "task_type": "DAY_PATROL", "status": "PLANNED", "checklist_version": "v2026.09", "finished_at": ""}
  ],
  # item_status: PENDING 未检查 / MEASURED 已测待判定 / NORMAL 正常 / ABNORMAL 异常
  "inspectionResult": [
    {"id": 9001, "task_id": 5001, "device_id": 101, "item_code": "PRESSURE_GAUGE", "item_name": "压力表读数", "result_status": "MEASURED", "measured_value": "1.25 MPa", "photo_url": "/mock/photo-9001.jpg", "note": "读数在绿区，指针轻微抖动"},
    {"id": 9002, "task_id": 5001, "device_id": 101, "item_code": "SEAL_TAG", "item_name": "铅封与标签", "result_status": "NORMAL", "measured_value": "完好", "photo_url": "/mock/photo-9002.jpg", "note": ""},
    {"id": 9003, "task_id": 5001, "device_id": 102, "item_code": "WATER_PRESSURE", "item_name": "静水压力", "result_status": "MEASURED", "measured_value": "0.18 MPa", "photo_url": "/mock/photo-9003.jpg", "note": "压力偏低，泵房稳压泵疑似故障，待复测"},
    {"id": 9004, "task_id": 5001, "device_id": 102, "item_code": "VALVE_STATE", "item_name": "阀门启闭状态", "result_status": "PENDING", "measured_value": "", "photo_url": "", "note": ""},
    {"id": 9005, "task_id": 5001, "device_id": 103, "item_code": "SMOKE_TEST", "item_name": "烟感模拟试验", "result_status": "ABNORMAL", "measured_value": "响应 68s", "photo_url": "/mock/photo-9005.jpg", "note": "加烟后报警超时，已挂故障牌"},
    {"id": 9006, "task_id": 5001, "device_id": 103, "item_code": "INDICATOR_LAMP", "item_name": "巡检指示灯", "result_status": "PENDING", "measured_value": "", "photo_url": "", "note": ""},
    {"id": 9007, "task_id": 5001, "device_id": 104, "item_code": "SPRINKLER_HEAD", "item_name": "喷淋头外观", "result_status": "PENDING", "measured_value": "", "photo_url": "", "note": ""},
    {"id": 9008, "task_id": 5002, "device_id": 105, "item_code": "LIGHT_TEST", "item_name": "应急点亮测试", "result_status": "MEASURED", "measured_value": "点亮 4s", "photo_url": "/mock/photo-9008.jpg", "note": "切换略慢，白天复测"},
    {"id": 9009, "task_id": 5002, "device_id": 106, "item_code": "PRESSURE_GAUGE", "item_name": "压力表读数", "result_status": "PENDING", "measured_value": "", "photo_url": "", "note": ""},
    {"id": 9010, "task_id": 5002, "device_id": 107, "item_code": "WATER_PRESSURE", "item_name": "静水压力", "result_status": "PENDING", "measured_value": "", "photo_url": "", "note": ""},
    {"id": 9011, "task_id": 5003, "device_id": 108, "item_code": "SMOKE_TEST", "item_name": "烟感模拟试验", "result_status": "ABNORMAL", "measured_value": "无响应", "photo_url": "/mock/photo-9011.jpg", "note": "探测器可能进灰失效"},
    {"id": 9012, "task_id": 5003, "device_id": 109, "item_code": "SPRINKLER_HEAD", "item_name": "喷淋头外观", "result_status": "PENDING", "measured_value": "", "photo_url": "", "note": ""},
    {"id": 9013, "task_id": 5004, "device_id": 101, "item_code": "PRESSURE_GAUGE", "item_name": "压力表读数", "result_status": "NORMAL", "measured_value": "1.30 MPa", "photo_url": "/mock/photo-9013.jpg", "note": ""}
  ],
  "hazardTicket": [
    {"id": 1, "result_id": 9005, "severity": "HIGH", "owner_id": 2, "deadline": "2026-09-27", "rectify_status": "OPEN", "rectify_note": "", "closed_at": ""},
    {"id": 2, "result_id": 9011, "severity": "CRITICAL", "owner_id": 4, "deadline": "2026-09-26", "rectify_status": "OPEN", "rectify_note": "", "closed_at": ""}
  ],
  # 交接单状态：PENDING 待接 / ACCEPTED 已接 / REVOKED 已撤回
  "shiftHandover": [
    {
      "id": 7001,
      "code": "HJ-20260925-001",
      "task_id": 5003,
      "building_id": 3,
      "handover_from": 3,
      "handover_to": 4,
      "status": "PENDING",
      "site_note": "C 栋 108 号烟感加烟无响应，已开严重隐患单；109 号喷淋头未查，仓库区叉车通道夜间照明不足，请注意避让。",
      "estimated_arrival_at": "2026-09-25T08:30:00",
      "created_at": "2026-09-25T07:40:00",
      "confirmed_at": "",
      "revoked_at": "",
      "items": [
        {"id": 8101, "device_id": 108, "device_code": "YGC-C-0108", "device_name": "点型感烟探测器", "item_code": "SMOKE_TEST", "item_name": "烟感模拟试验", "result_id": 9011, "measured_value": "无响应", "photo_url": "/mock/photo-9011.jpg", "note": "探测器可能进灰失效"},
        {"id": 8102, "device_id": 109, "device_code": "PLS-C-0201", "device_name": "闭式喷淋头", "item_code": "SPRINKLER_HEAD", "item_name": "喷淋头外观", "result_id": 9012, "measured_value": "", "photo_url": "", "note": ""}
      ],
      "events": [
        {"id": 1, "type": "CREATE", "actor_id": 3, "actor_name": "王冬梅", "from_owner_id": 3, "to_owner_id": 4, "created_at": "2026-09-25T07:40:00", "remark": "发起夜班交接，等待白班确认"}
      ]
    }
  ]
}
