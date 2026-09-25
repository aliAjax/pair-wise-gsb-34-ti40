import { HandoverActionText } from "../../constants/HandoverAction";
import { inspectorName } from "../../constants/Inspectors";
import { formatDateTime } from "../../utils/formatters";
import type { HandoverEvent } from "../../types/TaskHandover";

export function HandoverTimeline({ events }: { events: HandoverEvent[] }) {
  const ordered = [...events].sort((a, b) => a.id - b.id);
  if (ordered.length === 0) return <div className="empty">暂无操作记录</div>;
  return (
    <ul className="timeline">
      {ordered.map((event) => (
        <li key={event.id}>
          <div className="timeline-head">
            <strong>{HandoverActionText[event.action] ?? event.action}</strong>
            <span>{formatDateTime(event.created_at)}</span>
          </div>
          <p className="timeline-owner">
            操作人：{inspectorName(event.operator_id)} ｜ 负责人：
            {inspectorName(event.from_owner_id)} → {inspectorName(event.to_owner_id)}
          </p>
          {event.remark ? <p className="timeline-remark">{event.remark}</p> : null}
        </li>
      ))}
    </ul>
  );
}
