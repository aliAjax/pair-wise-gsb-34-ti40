/** 发起交接时的检查项（来源于本人未完成任务的巡检结果） */
export interface HandoverSourceItem {
  result_id: number;
  item_code: string;
  item_name: string;
  result_status: string;
  measured_value: string;
  photo_url: string;
  note: string;
}

export interface HandoverSourceDevice {
  device_id: number;
  device_code: string;
  device_name: string;
  floor: string;
  location_desc: string;
  items: HandoverSourceItem[];
}

/** 按任务聚合的交接来源：任务 -> 设备 -> 检查项三级 */
export interface HandoverSourceTask {
  task_id: number;
  building_id: number;
  task_type: string;
  plan_date: string;
  status: string;
  devices: HandoverSourceDevice[];
}

/** 设备页发起交接时返回的单设备来源 */
export interface HandoverDeviceSource {
  task_id: number;
  building_id: number;
  task_type: string;
  plan_date: string;
  status: string;
  device: HandoverSourceDevice;
}
