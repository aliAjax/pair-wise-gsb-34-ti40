import { useEffect, useState } from "react";
import { getShiftHandover } from "../../api/ShiftHandover";
import { useShiftHandoverStore } from "../../stores/ShiftHandoverStore";
import { getCurrentUserId } from "../../api/Inspector";
import { HandoverStatusText } from "../../constants/HandoverStatus";
import { StatusBadge } from "../common/StatusBadge";
import { HandoverItemList } from "./HandoverItemList";
import { HandoverTimeline } from "./HandoverTimeline";
import { formatDate } from "../../utils/formatters";
import type { Inspector } from "../../types/Inspector";
import type { ShiftHandover } from "../../types/ShiftHandover";

type Props = {
  open: boolean;
  handoverId: number | null;
  onClose: () => void;
  inspectors: Inspector[];
  onChanged?: () => void;
};

export function HandoverDetailDialog({ open, handoverId, onClose, inspectors, onChanged }: Props) {
  const [detail, setDetail] = useState<ShiftHandover | null>(null);
  const accept = useShiftHandoverStore((state) => state.accept);
  const revoke = useShiftHandoverStore((state) => state.revoke);
  const acting = useShiftHandoverStore((state) => state.acting);
  const error = useShiftHandoverStore((state) => state.error);

  useEffect(() => {
    if (open && handoverId != null) {
      void getShiftHandover(handoverId).then(setDetail);
    } else {
      setDetail(null);
    }
  }, [open, handoverId, acting]);

  if (!open || !detail) return null;

  const nameOf = (id: number) => inspectors.find((row) => row.id === id)?.name ?? `#${id}`;
  const isFromMe = detail.handover_from === getCurrentUserId();
  const isToMe = detail.handover_to === getCurrentUserId();
  const pending = detail.status === "PENDING";

  const handleAccept = async () => {
    await accept(detail.id);
    onChanged?.();
  };
  const handleRevoke = async () => {
    await revoke(detail.id);
    onChanged?.();
  };

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal wide" onClick={(event) => event.stopPropagation()}>
        <header className="modal-head">
          <div>
            <h2>交接单 {detail.code}</h2>
            <p className="muted small">任务 #{detail.task_id} · 发起于 {formatDate(detail.created_at)}</p>
          </div>
          <div className="head-side">
            <StatusBadge value={detail.status} />
            <button className="icon-btn" onClick={onClose}>×</button>
          </div>
        </header>

        <div className="modal-body">
          <section className="info-grid">
            <div><span className="muted small">交班人</span><strong>{nameOf(detail.handover_from)}</strong></div>
            <div><span className="muted small">接班人</span><strong>{nameOf(detail.handover_to)}</strong></div>
            <div><span className="muted small">预计到场</span><strong>{formatDate(detail.estimated_arrival_at)}</strong></div>
            <div>
              <span className="muted small">确认时间</span>
              <strong>{detail.confirmed_at ? formatDate(detail.confirmed_at) : "尚未确认"}</strong>
            </div>
            <div>
              <span className="muted small">撤回时间</span>
              <strong>{detail.revoked_at ? formatDate(detail.revoked_at) : "—"}</strong>
            </div>
            <div className="full"><span className="muted small">当前状态</span><strong>{HandoverStatusText[detail.status as keyof typeof HandoverStatusText] ?? detail.status}</strong></div>
            <div className="full">
              <span className="muted small">现场说明</span>
              <p className="site-note">{detail.site_note}</p>
            </div>
          </section>

          <section>
            <h3>交接检查项（{detail.items.length}）</h3>
            <HandoverItemList items={detail.items} />
          </section>

          <section>
            <h3>操作留痕</h3>
            <HandoverTimeline events={detail.events} resolver={nameOf} />
          </section>
        </div>

        <footer className="modal-foot">
          <span className="form-error">{error}</span>
          <div className="foot-actions">
            <button className="btn ghost" onClick={onClose}>关闭</button>
            {pending && isFromMe && (
              <button className="btn warn" disabled={acting} onClick={handleRevoke}>
                {acting ? "处理中…" : "撤回交接"}
              </button>
            )}
            {pending && isToMe && (
              <button className="btn primary" disabled={acting} onClick={handleAccept}>
                {acting ? "处理中…" : "确认接班，任务转我"}
              </button>
            )}
            {pending && !isFromMe && !isToMe && (
              <span className="muted small">等待 {nameOf(detail.handover_to)} 确认</span>
            )}
            {!pending && <span className="muted small">交接闭环已结束，操作按钮已关闭</span>}
          </div>
        </footer>
      </div>
    </div>
  );
}
