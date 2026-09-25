import { HandoverStatusText } from "../../constants/HandoverStatus";
import { StatusBadge } from "../common/StatusBadge";
import { formatDate } from "../../utils/formatters";
import type { Inspector } from "../../types/Inspector";
import type { ShiftHandover } from "../../types/ShiftHandover";

type Props = {
  row: ShiftHandover;
  inspectors: Inspector[];
  currentUserId: number;
  onView: (id: number) => void;
  highlightDeviceId?: number;
};

/** 单条交接卡片：任务页与设备页共用 */
export function HandoverCard({ row, inspectors, currentUserId, onView, highlightDeviceId }: Props) {
  const nameOf = (id: number) => inspectors.find((item) => item.id === id)?.name ?? `#${id}`;
  const deviceText = [...new Set(row.items.map((item) => item.device_code))].join("、");
  const roleTag =
    row.handover_from === currentUserId ? "我交班" : row.handover_to === currentUserId ? "待我接班" : "相关交接";
  const linked = highlightDeviceId
    ? row.items.filter((item) => item.device_id === highlightDeviceId).length
    : 0;

  return (
    <article className={`handover-card status-${String(row.status).toLowerCase()}`}>
      <div className="hc-head">
        <button className="hc-title" onClick={() => onView(row.id)}>
          <strong>{row.code}</strong>
          <StatusBadge value={row.status} />
          <span className={"role-flag " + (row.handover_to === currentUserId ? "to-me" : "from-me")}>{roleTag}</span>
        </button>
        <span className="muted small">{formatDate(row.created_at)}</span>
      </div>
      <p className="hc-flow">
        <b>{nameOf(row.handover_from)}</b>
        <span className="arrow">→</span>
        <b>{nameOf(row.handover_to)}</b>
        <span className="muted small">任务 #{row.task_id}</span>
      </p>
      <p className="hc-devices">
        设备：{deviceText}
        {highlightDeviceId && linked > 0 && <span className="muted small">（本设备 {linked} 项）</span>}
        <span className="muted small">共 {row.items.length} 个检查项</span>
      </p>
      <p className="hc-note">{row.site_note}</p>
      <div className="hc-foot">
        <span className="muted small">预计到场：{formatDate(row.estimated_arrival_at)}</span>
        <span className="muted small">
          {row.status === "PENDING" && "待确认 · 交班人可撤回"}
          {row.status === "ACCEPTED" && `已于 ${formatDate(row.confirmed_at)} 确认接班`}
          {row.status === "REVOKED" && `已于 ${formatDate(row.revoked_at)} 撤回`}
        </span>
        <span className="muted small">{HandoverStatusText[row.status as keyof typeof HandoverStatusText]}</span>
      </div>
    </article>
  );
}
