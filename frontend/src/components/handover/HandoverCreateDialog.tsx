import { useEffect, useMemo, useState } from "react";
import { useHandoverFlow } from "../../hooks/useHandoverFlow";
import { useShiftHandoverStore } from "../../stores/ShiftHandoverStore";
import { createDefaultHandoverForm } from "../../constructors/ShiftHandoverConstructor";
import { ResultStatusText } from "../../constants/ResultStatus";
import { HandoverStatusText } from "../../constants/HandoverStatus";
import { StatusBadge } from "../common/StatusBadge";
import { EmptyState } from "../common/EmptyState";
import { taskTypeText } from "../../utils/formatters";

type Props = {
  open: boolean;
  onClose: () => void;
  /** 设备页发起时传入：仅展示该设备下本人未完成检查项 */
  deviceId?: number;
  onCreated?: () => void;
};

export function HandoverCreateDialog({ open, onClose, deviceId, onCreated }: Props) {
  const { sources, receivers, selected, allItems, loading, toggle, toggleDevice, toggleAll, reset, deviceSource } =
    useHandoverFlow(deviceId);
  const create = useShiftHandoverStore((state) => state.create);
  const acting = useShiftHandoverStore((state) => state.acting);
  const error = useShiftHandoverStore((state) => state.error);
  const clearError = useShiftHandoverStore((state) => state.clearError);

  const [receiverId, setReceiverId] = useState<number>(0);
  const [siteNote, setSiteNote] = useState("");
  const [eta, setEta] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (open) {
      reset();
      setReceiverId(receivers[0]?.id ?? 0);
      setSiteNote("");
      setEta("");
      setFormError("");
      clearError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, receivers.length]);

  // 选中的检查项必须属于同一个任务
  const selectedTaskId = useMemo(() => {
    for (const id of selected) return allItems.get(id)?.task_id ?? 0;
    return 0;
  }, [selected, allItems]);

  if (!open) return null;

  const submit = async () => {
    setFormError("");
    if (!selectedTaskId) return setFormError("请至少勾选一个设备检查项");
    if (!receiverId) return setFormError("请选择接班人");
    if (!siteNote.trim()) return setFormError("请填写现场说明");
    if (!eta) return setFormError("请填写预计到场时间");
    const form = createDefaultHandoverForm({
      task_id: selectedTaskId,
      handover_to: receiverId,
      site_note: siteNote.trim(),
      estimated_arrival_at: eta,
      items: [...selected].map((resultId) => ({ result_id: resultId }))
    });
    try {
      await create(form);
      onCreated?.();
      onClose();
    } catch {
      // 错误信息已进入 store.error，在弹窗内展示
    }
  };

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal wide" onClick={(event) => event.stopPropagation()}>
        <header className="modal-head">
          <h2>{deviceId ? `设备交接：${deviceSource?.device.device_code ?? ""}` : "发起班次交接"}</h2>
          <button className="icon-btn" onClick={onClose}>×</button>
        </header>

        {loading ? (
          <p className="muted">正在读取本人未完成任务…</p>
        ) : sources.length === 0 ? (
          <EmptyState title="本人名下没有未完成任务，无需交接" />
        ) : (
          <div className="modal-body">
            <div className="handover-source">
              <div className="check-head">
                <label className="check-line">
                  <input type="checkbox" checked={selected.size === allItems.size && allItems.size > 0} onChange={toggleAll} />
                  全选检查项
                </label>
                <span className="muted">已选 {selected.size} 项，将随单冻结测量值与照片</span>
              </div>
              {sources.map((task) => (
                <div className="task-block" key={task.task_id}>
                  <div className="task-block-head">
                    <strong>任务 #{task.task_id} · {taskTypeText(task.task_type)}</strong>
                    <StatusBadge value={task.status} />
                    <span className="muted">计划日期 {task.plan_date}</span>
                  </div>
                  {task.devices.map((device) => {
                    const checkedCount = device.items.filter((item) => selected.has(item.result_id)).length;
                    return (
                      <div className="device-block" key={device.device_id}>
                        <label className="check-line device-line">
                          <input
                            type="checkbox"
                            checked={checkedCount === device.items.length}
                            onChange={() => toggleDevice(device.items)}
                          />
                          <strong>{device.device_code}</strong>
                          <span className="muted">{device.device_name} · {device.floor} · {device.location_desc}</span>
                        </label>
                        <div className="item-grid">
                          {device.items.map((item) => (
                            <label
                              key={item.result_id}
                              className={`item-card ${selected.has(item.result_id) ? "selected" : ""}`}
                            >
                              <input type="checkbox" checked={selected.has(item.result_id)} onChange={() => toggle(item.result_id)} />
                              <div>
                                <p>{item.item_name}</p>
                                <div className="item-meta">
                                  <StatusBadge value={item.result_status} />
                                  <span>{ResultStatusText[item.result_status as keyof typeof ResultStatusText] ?? item.result_status}</span>
                                  {item.measured_value && <span>测值：{item.measured_value}</span>}
                                  {item.photo_url && <span className="photo-flag">📷 已拍照</span>}
                                </div>
                                {item.note && <p className="item-note">{item.note}</p>}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="form-grid">
              <label>
                <span>接班人 *</span>
                <select value={receiverId} onChange={(event) => setReceiverId(Number(event.target.value))}>
                  <option value={0}>请选择白班接班人</option>
                  {receivers.map((row) => (
                    <option key={row.id} value={row.id}>{row.name}（{row.shift === "DAY" ? "白班" : "夜班"} · {row.phone}）</option>
                  ))}
                </select>
              </label>
              <label>
                <span>预计到场时间 *</span>
                <input type="datetime-local" value={eta} onChange={(event) => setEta(event.target.value)} />
              </label>
              <label className="full">
                <span>现场说明 *（设备临时故障 / 现场情况变化 / 未完成进度）</span>
                <textarea
                  rows={3}
                  placeholder="例如：消火栓静水压力 0.18MPa 偏低，稳压泵疑似故障；烟感加烟 68s 才报警，已挂故障牌"
                  value={siteNote}
                  onChange={(event) => setSiteNote(event.target.value)}
                />
              </label>
            </div>
            {selected.size > 0 && (
              <p className="muted small">提交后进入「{HandoverStatusText.PENDING}」，接班人确认前你仍可撤回；测到一半的 {selected.size} 个检查项和照片会随单保留。</p>
            )}
          </div>
        )}

        <footer className="modal-foot">
          <span className="form-error">{formError || error}</span>
          <div className="foot-actions">
            <button className="btn ghost" onClick={onClose}>取消</button>
            <button className="btn primary" disabled={acting || loading || sources.length === 0} onClick={submit}>
              {acting ? "提交中…" : "提交交接"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
