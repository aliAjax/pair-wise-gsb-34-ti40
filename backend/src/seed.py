seed = {
  "building": [
    {
      "id": 1,
      "name": "1号研发楼",
      "campus": "东区",
      "floor_count": "12",
      "fire_grade": "一级",
      "manager_id": 3,
      "address_code": "EAST-01"
    },
    {
      "id": 2,
      "name": "2号实验楼",
      "campus": "东区",
      "floor_count": "8",
      "fire_grade": "一级",
      "manager_id": 3,
      "address_code": "EAST-02"
    },
    {
      "id": 3,
      "name": "3号综合楼",
      "campus": "西区",
      "floor_count": "6",
      "fire_grade": "二级",
      "manager_id": 4,
      "address_code": "WEST-03"
    }
  ],
  "fireDevice": [
    {
      "id": 1,
      "building_id": 1,
      "device_code": "HYD-1F-001",
      "device_type": "HYDRANT",
      "floor": "1F",
      "location_desc": "1层东侧楼梯间",
      "install_date": "2025-03-11T09:00:00Z",
      "status": "NORMAL",
      "next_maintenance_at": "2026-10-11T09:00:00Z"
    },
    {
      "id": 2,
      "building_id": 1,
      "device_code": "EXT-2F-014",
      "device_type": "EXTINGUISHER",
      "floor": "2F",
      "location_desc": "2层走廊中段",
      "install_date": "2025-05-12T09:00:00Z",
      "status": "NORMAL",
      "next_maintenance_at": "2026-10-12T09:00:00Z"
    },
    {
      "id": 3,
      "building_id": 2,
      "device_code": "SMK-3F-006",
      "device_type": "SMOKE_DETECTOR",
      "floor": "3F",
      "location_desc": "3层实验室门口",
      "install_date": "2025-06-13T09:00:00Z",
      "status": "FAULT",
      "next_maintenance_at": "2026-09-28T09:00:00Z"
    },
    {
      "id": 4,
      "building_id": 2,
      "device_code": "SPR-4F-002",
      "device_type": "SPRINKLER",
      "floor": "4F",
      "location_desc": "4层配电间外",
      "install_date": "2025-07-14T09:00:00Z",
      "status": "NORMAL",
      "next_maintenance_at": "2026-11-14T09:00:00Z"
    },
    {
      "id": 5,
      "building_id": 3,
      "device_code": "EXIT-1F-009",
      "device_type": "EXIT_LIGHT",
      "floor": "1F",
      "location_desc": "1层安全出口上方",
      "install_date": "2025-08-15T09:00:00Z",
      "status": "MAINTAINING",
      "next_maintenance_at": "2026-09-30T09:00:00Z"
    },
    {
      "id": 6,
      "building_id": 3,
      "device_code": "HYD-2F-003",
      "device_type": "HYDRANT",
      "floor": "2F",
      "location_desc": "2层西侧楼梯间",
      "install_date": "2025-09-16T09:00:00Z",
      "status": "NORMAL",
      "next_maintenance_at": "2026-12-16T09:00:00Z"
    }
  ],
  "inspectionTask": [
    {
      "id": 1,
      "building_id": 1,
      "inspector_id": 1,
      "plan_date": "2026-09-25T22:00:00Z",
      "task_type": "夜班巡检",
      "status": "IN_PROGRESS",
      "checklist_version": "v2026.09",
      "finished_at": ""
    },
    {
      "id": 2,
      "building_id": 2,
      "inspector_id": 1,
      "plan_date": "2026-09-25T23:30:00Z",
      "task_type": "夜班巡检",
      "status": "IN_PROGRESS",
      "checklist_version": "v2026.09",
      "finished_at": ""
    },
    {
      "id": 3,
      "building_id": 3,
      "inspector_id": 3,
      "plan_date": "2026-09-25T21:00:00Z",
      "task_type": "夜班巡检",
      "status": "IN_PROGRESS",
      "checklist_version": "v2026.09",
      "finished_at": ""
    },
    {
      "id": 4,
      "building_id": 1,
      "inspector_id": 2,
      "plan_date": "2026-09-24T22:00:00Z",
      "task_type": "夜班巡检",
      "status": "IN_PROGRESS",
      "checklist_version": "v2026.09",
      "finished_at": ""
    },
    {
      "id": 5,
      "building_id": 2,
      "inspector_id": 1,
      "plan_date": "2026-09-24T20:00:00Z",
      "task_type": "夜班巡检",
      "status": "OVERDUE",
      "checklist_version": "v2026.09",
      "finished_at": ""
    },
    {
      "id": 6,
      "building_id": 3,
      "inspector_id": 1,
      "plan_date": "2026-09-26T22:00:00Z",
      "task_type": "夜班巡检",
      "status": "PLANNED",
      "checklist_version": "v2026.09",
      "finished_at": ""
    }
  ],
  "inspectionResult": [
    {
      "id": 1,
      "task_id": 1,
      "device_id": 1,
      "item_code": "PRESSURE_CHECK",
      "result_status": "IN_PROGRESS",
      "measured_value": "0.32MPa",
      "photo_url": "/mock/photo-1.png",
      "note": "压力略偏低，白班复查"
    },
    {
      "id": 2,
      "task_id": 1,
      "device_id": 1,
      "item_code": "VALVE_STATUS",
      "result_status": "PLANNED",
      "measured_value": "",
      "photo_url": "",
      "note": ""
    },
    {
      "id": 3,
      "task_id": 1,
      "device_id": 2,
      "item_code": "PRESSURE_CHECK",
      "result_status": "REVIEWED",
      "measured_value": "正常",
      "photo_url": "/mock/photo-3.png",
      "note": ""
    },
    {
      "id": 4,
      "task_id": 1,
      "device_id": 2,
      "item_code": "EXPIRY_CHECK",
      "result_status": "PLANNED",
      "measured_value": "",
      "photo_url": "",
      "note": ""
    },
    {
      "id": 5,
      "task_id": 2,
      "device_id": 3,
      "item_code": "SMOKE_TEST",
      "result_status": "IN_PROGRESS",
      "measured_value": "报警延迟约8秒",
      "photo_url": "/mock/photo-5.png",
      "note": "疑似故障，已拍现场照片"
    },
    {
      "id": 6,
      "task_id": 2,
      "device_id": 4,
      "item_code": "SPRINKLER_VALVE",
      "result_status": "PLANNED",
      "measured_value": "",
      "photo_url": "",
      "note": ""
    },
    {
      "id": 7,
      "task_id": 3,
      "device_id": 5,
      "item_code": "EXIT_LIGHT_TEST",
      "result_status": "PLANNED",
      "measured_value": "",
      "photo_url": "",
      "note": ""
    },
    {
      "id": 8,
      "task_id": 4,
      "device_id": 6,
      "item_code": "PRESSURE_CHECK",
      "result_status": "IN_PROGRESS",
      "measured_value": "0.35MPa",
      "photo_url": "/mock/photo-8.png",
      "note": ""
    },
    {
      "id": 9,
      "task_id": 4,
      "device_id": 6,
      "item_code": "VALVE_STATUS",
      "result_status": "PLANNED",
      "measured_value": "",
      "photo_url": "",
      "note": ""
    },
    {
      "id": 10,
      "task_id": 5,
      "device_id": 3,
      "item_code": "SMOKE_TEST",
      "result_status": "PLANNED",
      "measured_value": "",
      "photo_url": "",
      "note": ""
    },
    {
      "id": 11,
      "task_id": 5,
      "device_id": 4,
      "item_code": "SPRINKLER_VALVE",
      "result_status": "PLANNED",
      "measured_value": "",
      "photo_url": "",
      "note": ""
    },
    {
      "id": 12,
      "task_id": 6,
      "device_id": 5,
      "item_code": "EXIT_LIGHT_TEST",
      "result_status": "PLANNED",
      "measured_value": "",
      "photo_url": "",
      "note": ""
    },
    {
      "id": 13,
      "task_id": 6,
      "device_id": 6,
      "item_code": "PRESSURE_CHECK",
      "result_status": "PLANNED",
      "measured_value": "",
      "photo_url": "",
      "note": ""
    }
  ],
  "hazardTicket": [
    {
      "id": 1,
      "result_id": 5,
      "severity": "HIGH",
      "owner_id": 2,
      "deadline": "2026-09-27T18:00:00Z",
      "rectify_status": "IN_PROGRESS",
      "rectify_note": "烟感报警延迟，待更换探测器",
      "closed_at": ""
    },
    {
      "id": 2,
      "result_id": 1,
      "severity": "MEDIUM",
      "owner_id": 2,
      "deadline": "2026-09-29T18:00:00Z",
      "rectify_status": "PLANNED",
      "rectify_note": "消火栓压力偏低，安排复测",
      "closed_at": ""
    }
  ],
  "taskHandover": [
    {
      "id": 1,
      "task_id": 2,
      "from_inspector_id": 1,
      "to_inspector_id": 2,
      "note": "3层烟感报警延迟，现场照片已拍，请白班携带备用探测器到场更换。",
      "expected_arrival_at": "2026-09-25T09:00:00Z",
      "status": "PENDING",
      "created_at": "2026-09-25T07:30:00Z",
      "confirmed_at": "",
      "withdrawn_at": ""
    },
    {
      "id": 2,
      "task_id": 4,
      "from_inspector_id": 1,
      "to_inspector_id": 2,
      "note": "2层消火栓压力已测，阀门状态项未查，请继续。",
      "expected_arrival_at": "2026-09-24T09:00:00Z",
      "status": "CONFIRMED",
      "created_at": "2026-09-24T07:10:00Z",
      "confirmed_at": "2026-09-24T08:55:00Z",
      "withdrawn_at": ""
    },
    {
      "id": 3,
      "task_id": 1,
      "from_inspector_id": 1,
      "to_inspector_id": 2,
      "note": "1层消火栓阀门未查，后由本人继续完成，交接撤回。",
      "expected_arrival_at": "2026-09-25T08:30:00Z",
      "status": "WITHDRAWN",
      "created_at": "2026-09-25T06:50:00Z",
      "confirmed_at": "",
      "withdrawn_at": "2026-09-25T07:05:00Z"
    }
  ],
  "handoverItem": [
    {"id": 1, "handover_id": 1, "device_id": 3, "item_code": "SMOKE_TEST", "result_id": 5},
    {"id": 2, "handover_id": 1, "device_id": 4, "item_code": "SPRINKLER_VALVE", "result_id": 6},
    {"id": 3, "handover_id": 2, "device_id": 6, "item_code": "PRESSURE_CHECK", "result_id": 8},
    {"id": 4, "handover_id": 2, "device_id": 6, "item_code": "VALVE_STATUS", "result_id": 9},
    {"id": 5, "handover_id": 3, "device_id": 1, "item_code": "VALVE_STATUS", "result_id": 2}
  ],
  "handoverEvent": [
    {
      "id": 1,
      "handover_id": 1,
      "action": "CREATED",
      "operator_id": 1,
      "from_owner_id": 1,
      "to_owner_id": 2,
      "created_at": "2026-09-25T07:30:00Z",
      "remark": "夜班交接发起"
    },
    {
      "id": 2,
      "handover_id": 2,
      "action": "CREATED",
      "operator_id": 1,
      "from_owner_id": 1,
      "to_owner_id": 2,
      "created_at": "2026-09-24T07:10:00Z",
      "remark": "夜班交接发起"
    },
    {
      "id": 3,
      "handover_id": 2,
      "action": "CONFIRMED",
      "operator_id": 2,
      "from_owner_id": 1,
      "to_owner_id": 2,
      "created_at": "2026-09-24T08:55:00Z",
      "remark": "白班确认接收"
    },
    {
      "id": 4,
      "handover_id": 3,
      "action": "CREATED",
      "operator_id": 1,
      "from_owner_id": 1,
      "to_owner_id": 2,
      "created_at": "2026-09-25T06:50:00Z",
      "remark": "夜班交接发起"
    },
    {
      "id": 5,
      "handover_id": 3,
      "action": "WITHDRAWN",
      "operator_id": 1,
      "from_owner_id": 1,
      "to_owner_id": 2,
      "created_at": "2026-09-25T07:05:00Z",
      "remark": "交班人撤回"
    }
  ]
}
