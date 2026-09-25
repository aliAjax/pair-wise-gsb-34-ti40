CREATE TABLE IF NOT EXISTS building (
  id INTEGER PRIMARY KEY,
  name TEXT,
  campus TEXT,
  floor_count TEXT,
  fire_grade TEXT,
  manager_id TEXT,
  address_code TEXT
);

CREATE TABLE IF NOT EXISTS fire_device (
  id INTEGER PRIMARY KEY,
  building_id TEXT,
  device_code TEXT,
  device_type TEXT,
  floor TEXT,
  location_desc TEXT,
  install_date TEXT,
  status TEXT,
  next_maintenance_at TEXT
);

CREATE TABLE IF NOT EXISTS inspection_task (
  id INTEGER PRIMARY KEY,
  building_id TEXT,
  inspector_id TEXT,
  plan_date TEXT,
  task_type TEXT,
  status TEXT,
  checklist_version TEXT,
  finished_at TEXT
);

CREATE TABLE IF NOT EXISTS inspection_result (
  id INTEGER PRIMARY KEY,
  task_id TEXT,
  device_id TEXT,
  item_code TEXT,
  result_status TEXT,
  measured_value TEXT,
  photo_url TEXT,
  note TEXT
);

CREATE TABLE IF NOT EXISTS hazard_ticket (
  id INTEGER PRIMARY KEY,
  result_id TEXT,
  severity TEXT,
  owner_id TEXT,
  deadline TEXT,
  rectify_status TEXT,
  rectify_note TEXT,
  closed_at TEXT
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY,
  actor TEXT,
  action TEXT,
  target_type TEXT,
  target_id TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS inspector (
  id INTEGER PRIMARY KEY,
  name TEXT,
  shift TEXT,
  phone TEXT
);

-- 班次交接单：记录交班人、接班人、现场说明、预计到场时间与生命周期状态
CREATE TABLE IF NOT EXISTS shift_handover (
  id INTEGER PRIMARY KEY,
  code TEXT,
  task_id INTEGER,
  building_id INTEGER,
  handover_from INTEGER,
  handover_to INTEGER,
  status TEXT,
  site_note TEXT,
  estimated_arrival_at TEXT,
  created_at TEXT,
  confirmed_at TEXT,
  revoked_at TEXT
);

-- 交接检查项快照：冻结测到一半的数值与照片，避免交接丢失
CREATE TABLE IF NOT EXISTS shift_handover_item (
  id INTEGER PRIMARY KEY,
  handover_id INTEGER,
  device_id INTEGER,
  device_code TEXT,
  device_name TEXT,
  item_code TEXT,
  item_name TEXT,
  result_id INTEGER,
  measured_value TEXT,
  photo_url TEXT,
  note TEXT
);

-- 交接操作留痕：每一步记录操作人、时间与前后负责人
CREATE TABLE IF NOT EXISTS shift_handover_event (
  id INTEGER PRIMARY KEY,
  handover_id INTEGER,
  event_type TEXT,
  actor_id INTEGER,
  actor_name TEXT,
  from_owner_id INTEGER,
  to_owner_id INTEGER,
  created_at TEXT,
  remark TEXT
);
