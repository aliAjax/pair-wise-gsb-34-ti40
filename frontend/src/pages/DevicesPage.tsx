import { useEffect, useMemo, useState } from "react";
import { useFireDeviceStore } from "../stores/FireDeviceStore";
import { useInspectionTaskStore } from "../stores/InspectionTaskStore";
import { onHandoverChanged } from "../stores/ShiftHandoverStore";
import { listInspectionResult } from "../api/InspectionResult";
import { listBuilding } from "../api/Building";
import { useInspectors } from "../hooks/useInspectors";
import { getCurrentUserId } from "../api/Inspector";
import { StatusBadge } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";
import { ResultStatusText } from "../constants/ResultStatus";
import { HandoverListPanel } from "../components/handover/HandoverListPanel";
import type { InspectionResult } from "../types/InspectionResult";
import type { Building } from "../types/Building";
import type { FireDevice } from "../types/FireDevice";
import { deviceTypeName, formatDate } from "../utils/formatters";

export function DevicesPage() {
  const { rows: devices, load: loadDevices } = useFireDeviceStore();
  const { rows: tasks, load: loadTasks } = useInspectionTaskStore();
  const { inspectors, nameOf } = useInspectors();
  const [results, setResults] = useState<InspectionResult[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floorFilter, setFloorFilter] = useState("");
  const [activeDeviceId, setActiveDeviceId] = useState<number | null>(null);

  useEffect(() => {
    void loadDevices();
    void loadTasks();
    void listInspectionResult().then(setResults);
    void listBuilding().then(setBuildings);
    return onHandoverChanged(() => {
      void loadTasks();
      void loadDevices();
    });
  }, [loadDevices, loadTasks]);

  const floors = useMemo(() => [...new Set(devices.map((row) => row.floor))].sort(), [devices]);
  const visibleDevices = useMemo(
    () => devices.filter((device) => !floorFilter || device.floor === floorFilter),
    [devices, floorFilter]
  );

  const activeDevice: FireDevice | null = devices.find((row) => row.id === activeDeviceId) ?? null;

  // 该设备关联的本人未完成任务检查项（用于设备页直接发起交接）
  const activeResults = useMemo(() => {
    if (!activeDevice) return [];
    const myOpenTaskIds = new Set(
      tasks
        .filter((task) => task.inspector_id === getCurrentUserId() && ["PLANNED", "IN_PROGRESS", "OVERDUE"].includes(task.status))
        .map((task) => task.id)
    );
    return results.filter((row) => row.device_id === activeDevice.id && myOpenTaskIds.has(row.task_id));
  }, [activeDevice, results, tasks]);

  const ownerOfDevice = (device: FireDevice) => {
    const task = tasks
      .filter((row) => row.status === "IN_PROGRESS" || row.status === "PLANNED")
      .find((row) => results.some((result) => result.task_id === row.id && result.device_id === device.id));
    return task ? nameOf(task.inspector_id) : "—";
  };

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">device handover</p>
          <h1>消防设备台账 · 设备交接</h1>
          <p className="muted">选中设备可查看测到一半的检查项和照片，并直接向白班发起交接；交接确认后该设备所属任务负责人同步变更。</p>
        </div>
        <div className="filter-bar">
          <label>楼层
            <select value={floorFilter} onChange={(event) => setFloorFilter(event.target.value)}>
              <option value="">全部楼层</option>
              {floors.map((floor) => <option key={floor} value={floor}>{floor}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="metrics">
        <div className="stat"><span>设备总数</span><strong>{devices.length}</strong></div>
        <div className="stat"><span>故障 / 维修中</span><strong>{devices.filter((d) => d.status === "FAULT" || d.status === "IN_REPAIR").length}</strong></div>
        <div className="stat"><span>本人未完成检查项</span><strong>
          {results.filter((r) => {
            const task = tasks.find((t) => t.id === r.task_id);
            return task?.inspector_id === getCurrentUserId() && ["PENDING", "MEASURED"].includes(r.result_status);
          }).length}
        </strong></div>
      </section>

      <section className="split-workbench">
        <div className="panel">
          <div className="panel-head"><h2>设备列表</h2><span className="muted small">点击行查看检查项并发起交接</span></div>
          {visibleDevices.length === 0 ? <EmptyState title="该楼层暂无设备" /> : (
            <table className="data-table">
              <thead>
                <tr><th>设备编号</th><th>类型</th><th>楼栋/楼层</th><th>位置</th><th>状态</th><th>当前负责人</th><th>下次维保</th></tr>
              </thead>
              <tbody>
                {visibleDevices.map((device) => {
                  const building = buildings.find((row) => row.id === device.building_id);
                  return (
                    <tr
                      key={device.id}
                      className={activeDeviceId === device.id ? "selected-row" : "clickable-row"}
                      onClick={() => setActiveDeviceId(device.id)}
                    >
                      <td><strong>{device.device_code}</strong></td>
                      <td>{deviceTypeName(device.device_type)}</td>
                      <td>{building?.name ?? device.building_id} · {device.floor}</td>
                      <td>{device.location_desc}</td>
                      <td><StatusBadge value={device.status} /></td>
                      <td>{ownerOfDevice(device)}</td>
                      <td>{formatDate(device.next_maintenance_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="panel side-detail">
          {!activeDevice ? (
            <EmptyState title="点击左侧设备，查看检查项并发起交接" />
          ) : (
            <>
              <div className="panel-head">
                <h2>{activeDevice.device_code}</h2>
                <StatusBadge value={activeDevice.status} />
              </div>
              <p className="muted small">
                {deviceTypeName(activeDevice.device_type)} · {activeDevice.floor} · {activeDevice.location_desc}
              </p>
              <h3>本人未完成检查项</h3>
              {activeResults.length === 0 ? (
                <EmptyState title="该设备在本人任务下没有未完成检查项" />
              ) : (
                <ul className="result-list">
                  {activeResults.map((item) => (
                    <li key={item.id}>
                      <div className="result-line">
                        <strong>{item.item_name}</strong>
                        <StatusBadge value={item.result_status} />
                      </div>
                      <p className="muted small">
                        {ResultStatusText[item.result_status as keyof typeof ResultStatusText] ?? item.result_status}
                        {item.measured_value ? ` · 测值：${item.measured_value}` : ""}
                        {item.photo_url ? " · 📷 已拍照" : ""}
                      </p>
                      {item.note && <p className="item-note">{item.note}</p>}
                    </li>
                  ))}
                </ul>
              )}
              <p className="muted small">下方「班次交接 · 本设备」可直接把这些检查项交给白班。</p>
            </>
          )}
        </div>
      </section>

      {activeDeviceId != null && <HandoverListPanel key={activeDeviceId} inspectors={inspectors} deviceId={activeDeviceId} />}
    </main>
  );
}
