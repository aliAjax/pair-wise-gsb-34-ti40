import { useEffect, useMemo, useState } from "react";
import { useBuildingStore } from "../stores/BuildingStore";
import { useFireDeviceStore } from "../stores/FireDeviceStore";
import { useInspectionResultStore } from "../stores/InspectionResultStore";
import { useInspectionTaskStore } from "../stores/InspectionTaskStore";
import { useCurrentUserStore } from "../stores/CurrentUserStore";
import { useHandoverFlow } from "../hooks/useHandoverFlow";
import { DeviceLocationCell } from "../components/common/DeviceLocationCell";
import { HandoverCreateDialog } from "../components/common/HandoverCreateDialog";
import { HandoverPanel } from "../components/common/HandoverPanel";
import { StatusBadge } from "../components/common/StatusBadge";
import { UserSwitcher } from "../components/common/UserSwitcher";
import { EmptyState } from "../components/common/EmptyState";
import { DeviceTypeText } from "../constants/DeviceType";
import { DeviceStatusText } from "../constants/DeviceStatus";
import { formatDateTime } from "../utils/formatters";
import type { FireDevice } from "../types/FireDevice";
import type { InspectionTask } from "../types/InspectionTask";

const UNFINISHED_TASK_STATUS = ["PLANNED", "IN_PROGRESS", "OVERDUE"];
const UNFINISHED_RESULT_STATUS = ["PLANNED", "IN_PROGRESS"];

export function DevicesPage() {
  const currentUserId = useCurrentUserStore((state) => state.currentUserId);
  const devices = useFireDeviceStore((state) => state.rows);
  const results = useInspectionResultStore((state) => state.rows);
  const tasks = useInspectionTaskStore((state) => state.rows);
  const buildings = useBuildingStore((state) => state.rows);
  const loadDevices = useFireDeviceStore((state) => state.load);
  const loadResults = useInspectionResultStore((state) => state.load);
  const loadBuildings = useBuildingStore((state) => state.load);
  const flow = useHandoverFlow();

  const [dialogTask, setDialogTask] = useState<InspectionTask | null>(null);
  const [presetDeviceId, setPresetDeviceId] = useState<number | null>(null);
  const [filterDeviceId, setFilterDeviceId] = useState<number | null>(null);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    loadDevices();
    loadResults();
    loadBuildings();
  }, [loadDevices, loadResults, loadBuildings]);

  const buildingNameOf = (id: number) => buildings.find((building) => building.id === id)?.name ?? `#${id}`;

  const myUnfinishedTasks = useMemo(
    () => tasks.filter((task) => task.inspector_id === currentUserId && UNFINISHED_TASK_STATUS.includes(task.status)),
    [tasks, currentUserId]
  );

  const handoverTargetFor = (device: FireDevice): { task: InspectionTask; count: number } | null => {
    for (const task of myUnfinishedTasks) {
      const count = results.filter(
        (result) =>
          result.task_id === task.id &&
          result.device_id === device.id &&
          UNFINISHED_RESULT_STATUS.includes(result.result_status)
      ).length;
      if (count > 0) return { task, count };
    }
    return null;
  };

  const pendingCountForDevice = (deviceId: number) =>
    flow.byDevice(deviceId).filter((handover) => handover.status === "PENDING").length;

  const openCreateForDevice = (device: FireDevice) => {
    const target = handoverTargetFor(device);
    if (!target) return;
    setPresetDeviceId(device.id);
    setDialogTask(target.task);
  };

  const handleError = (fn: (id: number) => Promise<unknown>) => async (id: number) => {
    setPageError("");
    try {
      await fn(id);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "操作失败，请稍后重试");
    }
  };

  const panelHandovers = filterDeviceId ? flow.byDevice(filterDeviceId) : flow.mine;
  const panelDevice = filterDeviceId ? devices.find((device) => device.id === filterDeviceId) : null;

  return (
    <>
      <section className="page-head">
        <div>
          <p className="eyebrow">device handover</p>
          <h1>消防设备台账</h1>
          <p className="muted">设备临时故障时，可从设备行直接勾选检查项发起交接，并查看设备相关交接流转。</p>
        </div>
        <UserSwitcher />
      </section>

      {flow.pendingInbox.length > 0 ? (
        <section className="alert-strip">
          <strong>你有 {flow.pendingInbox.length} 条待确认交接，确认后任务将归你继续处理。</strong>
        </section>
      ) : null}
      {pageError ? <section className="alert-strip error">{pageError}</section> : null}

      <section className="panel wide">
        <h2>设备列表</h2>
        {devices.length === 0 ? (
          <EmptyState title="暂无设备数据" />
        ) : (
          <div className="data-table" style={{ gridTemplateColumns: "1.4fr 1.4fr 2fr 1fr 1.6fr 1.2fr 1.8fr" }}>
            <div className="table-head">
              <span>设备编号</span>
              <span>类型</span>
              <span>位置</span>
              <span>状态</span>
              <span>下次维保</span>
              <span>待交接项</span>
              <span>操作</span>
            </div>
            {devices.map((device) => {
              const target = handoverTargetFor(device);
              const pendingCount = pendingCountForDevice(device.id);
              return (
                <div key={device.id} className="table-row">
                  <span>
                    <strong>{device.device_code}</strong>
                  </span>
                  <span>{DeviceTypeText[device.device_type as keyof typeof DeviceTypeText] ?? device.device_type}</span>
                  <span>
                    <DeviceLocationCell device={device} buildingName={buildingNameOf(device.building_id)} />
                  </span>
                  <span>
                    <StatusBadge value={device.status} />
                    <span className="muted">
                      {" "}
                      {DeviceStatusText[device.status as keyof typeof DeviceStatusText] ?? device.status}
                    </span>
                  </span>
                  <span className="muted">{formatDateTime(device.next_maintenance_at)}</span>
                  <span>
                    {target ? (
                      <strong>
                        {target.count} 项（任务 #{target.task.id}）
                      </strong>
                    ) : (
                      <span className="muted">无可交接项</span>
                    )}
                  </span>
                  <span className="row-actions">
                    <button
                      type="button"
                      className="btn small"
                      disabled={target === null || pendingCount > 0}
                      title={
                        target === null
                          ? "当前身份的未完成任务中没有该设备的待检查项"
                          : pendingCount > 0
                            ? "该设备已有待确认交接"
                            : undefined
                      }
                      onClick={() => openCreateForDevice(device)}
                    >
                      发起交接
                    </button>
                    <button
                      type="button"
                      className={`btn ghost small ${filterDeviceId === device.id ? "active-filter" : ""}`}
                      onClick={() => setFilterDeviceId(filterDeviceId === device.id ? null : device.id)}
                    >
                      查看交接
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <HandoverPanel
        title={panelDevice ? `交接记录 · ${panelDevice.device_code}` : "我的交接闭环（全部设备）"}
        handovers={panelHandovers}
        devices={devices}
        results={results}
        tasks={tasks}
        acting={flow.acting}
        emptyText="还没有与该设备相关的交接记录"
        onConfirm={handleError((id) => flow.confirmHandover(id))}
        onWithdraw={handleError((id) => flow.withdrawHandover(id))}
      />
      {filterDeviceId ? (
        <button type="button" className="btn ghost small self-start" onClick={() => setFilterDeviceId(null)}>
          查看全部交接
        </button>
      ) : null}

      <HandoverCreateDialog
        open={dialogTask !== null}
        task={dialogTask}
        devices={devices}
        presetDeviceId={presetDeviceId}
        onClose={() => {
          setDialogTask(null);
          setPresetDeviceId(null);
        }}
        onCreate={flow.createHandover}
      />
    </>
  );
}
