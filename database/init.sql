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

CREATE TABLE IF NOT EXISTS task_handover (
  id INTEGER PRIMARY KEY,
  task_id TEXT,
  from_inspector_id TEXT,
  to_inspector_id TEXT,
  note TEXT,
  expected_arrival_at TEXT,
  status TEXT,
  created_at TEXT,
  confirmed_at TEXT,
  withdrawn_at TEXT
);

CREATE TABLE IF NOT EXISTS handover_item (
  id INTEGER PRIMARY KEY,
  handover_id TEXT,
  device_id TEXT,
  item_code TEXT,
  result_id TEXT
);

CREATE TABLE IF NOT EXISTS handover_event (
  id INTEGER PRIMARY KEY,
  handover_id TEXT,
  action TEXT,
  operator_id TEXT,
  from_owner_id TEXT,
  to_owner_id TEXT,
  created_at TEXT,
  remark TEXT
);
