import { HandoverEventTypeText } from "../../constants/HandoverStatus";
import type { HandoverEvent } from "../../types/ShiftHandover";
import { formatDate } from "../../utils/formatters";

type Props = {
  events: HandoverEvent[];
  resolver: (id: number) => string;
};

/** 交接操作留痕时间线：每一步展示动作、操作人、时间与前后负责人 */
export function HandoverTimeline({ events, resolver }: Props) {
  return (
    <ol className="handover-timeline">
      {events.map((event) => (
        <li key={event.id} className={`tl-item type-${String(event.type).toLowerCase()}`}>
          <div className="tl-dot" />
          <div className="tl-body">
            <div className="tl-head">
              <strong>{HandoverEventTypeText[event.type as keyof typeof HandoverEventTypeText] ?? event.type}</strong>
              <span className="muted small">{formatDate(event.created_at)}</span>
            </div>
            <p>
              操作人：<b>{event.actor_name}</b>
              ｜负责人：{resolver(event.from_owner_id)} → {resolver(event.to_owner_id)}
            </p>
            {event.remark && <p className="muted small">{event.remark}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
