import { useState } from "react";
import { useCurrentUserStore } from "../../stores/CurrentUserStore";
import { inspectorName } from "../../constants/Inspectors";
import { checkItemText } from "../../constants/CheckItem";
import { formatDateTime } from "../../utils/formatters";
import { EmptyState } from "./EmptyState";
import { HandoverStatusTag } from "./HandoverStatusTag";
import { HandoverTimeline } from "./HandoverTimeline";
import type { FireDevice } from "../../types/FireDevice";
import type { InspectionResult } from "../../types/InspectionResult";
import type { InspectionTask } from "../../types/InspectionTask";
import type { TaskHandover } from "../../types/TaskHandover";

type Props = {
  title?: string;
  handovers: TaskHandover[];
  devices: FireDevice[];
  results: InspectionResult[];
  tasks: InspectionTask[];
  acting?: boolean;
  emptyText?: string;
  onConfirm?: (id: number) => Promise<unknown>;
  onWithdraw?: (id: number) => Promise<unknown>;
};

export function HandoverPanel({
  title = "交接记录",
  handovers,
  devices,
  results,
  tasks,
  acting = false,
  emptyText = "暂无交接记录",
  onConfirm,
  onWithdraw
}: Props) {
  const [showTimeline, setShowTimeline] = useState<number | null>(null);
  const currentUserId = useCurrentUserStore((state) => state.currentUserId);
  const ordered = [...handovers].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  const deviceOf = (deviceId: number) => devices.find((device) => device.id === deviceId);
  const resultOf = (resultId: number) => results.find((result) => result.id === resultId);
  const taskOf = (taskId: number) => tasks.find((task) => task.id === taskId);

  return (
    <section className="panel">
      <h2>{title}</h2>
      {ordered.length === 0 ? (
        <EmptyState title={emptyText} />
      ) : (
        <div className="handover-grid">
          {ordered.map((handover) => {
            const task = taskOf(handover.task_id);
            return (
              <article key={handover.id} className="handover-card">
                <header>
                  <div className="handover-title">
                    <strong>交接单 #{handover.id}</strong>
                    <HandoverStatusTag value={handover.status} />
                  </div>
                  <button
                    type="button"
                    className="btn ghost small"
                    onClick={() => setShowTimeline((prev) => (prev === handover.id ? null : handover.id))}
                  >
                    {showTimeline === handover.id ? "收起流转" : "查看流转"}
                  </button>
                </header>

                <div className="handover-meta">
                  <span>任务 #{handover.task_id}{task ? ` · ${task.task_type}` : ""}</span>
                  {task ? <span>计划 {formatDateTime(task.plan_date)}</span> : null}
                  <span>
                    交班人 <strong>{inspectorName(handover.from_inspector_id)}</strong> → 接班人{" "}
                    <strong>{inspectorName(handover.to_inspector_id)}</strong>
                  </span>
                  <span>发起时间 {formatDateTime(handover.created_at)}</span>
                  <span>预计到场 {formatDateTime(handover.expected_arrival_at)}</span>
                  {handover.confirmed_at ? <span>确认时间 {formatDateTime(handover.confirmed_at)}</span> : null}
                  {handover.withdrawn_at ? <span>撤回时间 {formatDateTime(handover.withdrawn_at)}</span> : null}
                </div>

                <p className="handover-note">现场说明：{handover.note}</p>

                <div className="handover-items">
                  {handover.items.map((item) => {
                    const device = deviceOf(item.device_id);
                    const result = resultOf(item.result_id);
                    return (
                      <span key={item.id} className="chip">
                        {device?.device_code ?? `设备#${item.device_id}`} · {checkItemText(item.item_code)}
                        {result?.measured_value ? `（${result.measured_value}）` : ""}
                        {result?.photo_url ? <em className="photo"> 📷</em> : null}
                      </span>
                    );
                  })}
                </div>

                {showTimeline === handover.id ? <HandoverTimeline events={handover.events} /> : null}

                {handover.status === "PENDING" ? (
                  <div className="handover-actions">
                    {onConfirm && handover.to_inspector_id === currentUserId ? (
                      <button
                        type="button"
                        className="btn small"
                        disabled={acting}
                        onClick={() => onConfirm(handover.id)}
                      >
                        {acting ? "处理中…" : "确认接收"}
                      </button>
                    ) : null}
                    {onWithdraw && handover.from_inspector_id === currentUserId ? (
                      <button
                        type="button"
                        className="btn ghost small"
                        disabled={acting}
                        onClick={() => onWithdraw(handover.id)}
                      >
                        撤回交接
                      </button>
                    ) : null}
                    <span className="muted">
                      {handover.to_inspector_id === currentUserId
                        ? "待你确认，确认后任务负责人转移至你"
                        : handover.from_inspector_id === currentUserId
                          ? "待接班人确认，确认前你仍可撤回"
                          : "等待对方处理"}
                    </span>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
