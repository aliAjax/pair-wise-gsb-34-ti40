import { useEffect, useMemo, useState } from "react";
import { useInspectionResultStore } from "../../stores/InspectionResultStore";
import { useCurrentUserStore } from "../../stores/CurrentUserStore";
import { checkItemText } from "../../constants/CheckItem";
import { handoverCandidates } from "../../constants/Inspectors";
import { DeviceTypeText } from "../../constants/DeviceType";
import { EmptyState } from "./EmptyState";
import type { FireDevice } from "../../types/FireDevice";
import type { InspectionResult } from "../../types/InspectionResult";
import type { InspectionTask } from "../../types/InspectionTask";
import type { TaskHandoverCreatePayload } from "../../types/TaskHandover";

export type CreateHandoverHandler = (payload: TaskHandoverCreatePayload) => Promise<unknown>;

type Props = {
  open: boolean;
  task: InspectionTask | null;
  devices: FireDevice[];
  presetDeviceId?: number | null;
  onClose: () => void;
  onCreate: CreateHandoverHandler;
};

const UNFINISHED_RESULT_STATUS = ["PLANNED", "IN_PROGRESS"];

const isUnfinished = (result: InspectionResult) => UNFINISHED_RESULT_STATUS.includes(result.result_status);

const toLocalInputValue = (iso: string) => iso.slice(0, 16);

export function HandoverCreateDialog({ open, task, devices, presetDeviceId, onClose, onCreate }: Props) {
  const results = useInspectionResultStore((state) => state.rows);
  const loadResults = useInspectionResultStore((state) => state.load);
  const currentUserId = useCurrentUserStore((state) => state.currentUserId);
  const [selected, setSelected] = useState<number[]>([]);
  const [toInspectorId, setToInspectorId] = useState<number>(0);
  const [note, setNote] = useState("");
  const [expectedArrival, setExpectedArrival] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    if (open) loadResults();
  }, [open, loadResults]);

  useEffect(() => {
    if (!open) return;
    setErrorText("");
    setNote("");
    setExpectedArrival("");
    setSelected([]);
    setToInspectorId(handoverCandidates(currentUserId)[0]?.id ?? 0);
  }, [open, task?.id, currentUserId]);

  const taskResults = useMemo(
    () => (task ? results.filter((result) => result.task_id === task.id && isUnfinished(result)) : []),
    [results, task]
  );

  const groups = useMemo(() => {
    return devices
      .map((device) => ({ device, items: taskResults.filter((result) => result.device_id === device.id) }))
      .filter((group) => group.items.length > 0);
  }, [devices, taskResults]);

  useEffect(() => {
    if (!open || groups.length === 0) return;
    const target = presetDeviceId ?? groups[0].device.id;
    const presetIds = taskResults.filter((result) => result.device_id === target).map((result) => result.id);
    setSelected((prev) => (prev.length > 0 ? prev : presetIds));
  }, [open, groups, presetDeviceId, taskResults]);

  if (!open || !task) return null;

  const toggleItem = (resultId: number) => {
    setSelected((prev) => (prev.includes(resultId) ? prev.filter((id) => id !== resultId) : [...prev, resultId]));
  };

  const toggleDevice = (deviceItems: InspectionResult[]) => {
    const ids = deviceItems.map((item) => item.id);
    setSelected((prev) => {
      const allChecked = ids.every((id) => prev.includes(id));
      const rest = prev.filter((id) => !ids.includes(id));
      return allChecked ? rest : [...rest, ...ids];
    });
  };

  const handleSubmit = async () => {
    setErrorText("");
    if (selected.length === 0 || !note.trim() || !expectedArrival || !toInspectorId) {
      setErrorText("请勾选检查项，并填写现场说明、预计到场时间和接班人。");
      return;
    }
    setSubmitting(true);
    try {
      await onCreate({
        task_id: task.id,
        to_inspector_id: toInspectorId,
        note: note.trim(),
        expected_arrival_at: new Date(expectedArrival).toISOString(),
        items: selected.map((resultId) => ({ result_id: resultId }))
      });
      onClose();
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : "交接发起失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dialog-mask" role="dialog" aria-modal="true" aria-label="发起交接">
      <div className="dialog">
        <h3>发起交接 · 任务 #{task.id}（{task.task_type}）</h3>
        <p className="dialog-hint">勾选尚未完成的设备检查项，已测数值和现场照片会随交接单一并带给接班人。</p>

        {groups.length === 0 ? (
          <EmptyState title="该任务下没有可交接的未完成检查项" />
        ) : (
          <div className="dialog-groups">
            {groups.map(({ device, items }) => {
              const checkedCount = items.filter((item) => selected.includes(item.id)).length;
              return (
                <div key={device.id} className="device-group">
                  <label className="device-group-head">
                    <input
                      type="checkbox"
                      checked={checkedCount === items.length}
                      onChange={() => toggleDevice(items)}
                    />
                    <strong>{device.device_code}</strong>
                    <span className="chip">
                      {DeviceTypeText[device.device_type as keyof typeof DeviceTypeText] ?? device.device_type}
                    </span>
                    <span className="muted">
                      {device.floor} · {device.location_desc}
                    </span>
                  </label>
                  <div className="items">
                    {items.map((item) => (
                      <label key={item.id} className="item-line">
                        <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleItem(item.id)} />
                        <span>{checkItemText(item.item_code)}</span>
                        {item.measured_value ? <em className="chip">已测：{item.measured_value}</em> : null}
                        {item.photo_url ? (
                          <span className="chip photo" title={item.photo_url}>
                            📷 含现场照片
                          </span>
                        ) : null}
                        {item.note ? <span className="muted">备注：{item.note}</span> : null}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="form-row">
          <label htmlFor="handover-note">现场说明</label>
          <textarea
            id="handover-note"
            rows={3}
            placeholder="说明设备临时故障、现场情况变化、需要接班人重点处理的事项"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>
        <div className="form-grid">
          <div className="form-row">
            <label htmlFor="handover-arrival">预计到场时间</label>
            <input
              id="handover-arrival"
              type="datetime-local"
              value={expectedArrival ? toLocalInputValue(expectedArrival) : ""}
              onChange={(event) => setExpectedArrival(event.target.value)}
            />
          </div>
          <div className="form-row">
            <label htmlFor="handover-receiver">接班人</label>
            <select id="handover-receiver" value={toInspectorId} onChange={(event) => setToInspectorId(Number(event.target.value))}>
              {handoverCandidates(currentUserId).map((inspector) => (
                <option key={inspector.id} value={inspector.id}>
                  {inspector.name}（{inspector.shift} · {inspector.role}）
                </option>
              ))}
            </select>
          </div>
        </div>
        {errorText ? <p className="error-text">{errorText}</p> : null}
        <div className="dialog-actions">
          <button type="button" className="btn ghost" onClick={onClose} disabled={submitting}>
            取消
          </button>
          <button type="button" className="btn" onClick={handleSubmit} disabled={submitting || groups.length === 0}>
            {submitting ? "提交中…" : "提交交接"}
          </button>
        </div>
        <p className="dialog-footnote">提交后任务仍由本人负责，待接班人确认后才转移；确认前本人可撤回。</p>
      </div>
    </div>
  );
}
