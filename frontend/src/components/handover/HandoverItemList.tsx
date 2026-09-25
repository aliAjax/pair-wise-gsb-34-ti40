import { StatusBadge } from "../common/StatusBadge";
import type { HandoverItem } from "../../types/ShiftHandover";

/** 依据冻结快照推断交接检查项进度：有异常线索 -> 异常；有测值 -> 已测待判定；否则未检查 */
export function snapshotStatus(item: HandoverItem): string {
  if (item.note.includes("无响应") || item.note.includes("超时") || item.note.includes("失效")) return "ABNORMAL";
  if (item.measured_value || item.photo_url) return "MEASURED";
  return "PENDING";
}

const SNAPSHOT_STATUS_TEXT: Record<string, string> = {
  ABNORMAL: "异常待处理",
  MEASURED: "已测待判定",
  PENDING: "未检查"
};

/** 交接检查项清单：冻结的测量值、照片、备注，供接班人逐设备核对 */
export function HandoverItemList({ items }: { items: HandoverItem[] }) {
  const groups = new Map<number, { code: string; name: string; rows: HandoverItem[] }>();
  items.forEach((item) => {
    const group = groups.get(item.device_id) ?? { code: item.device_code, name: item.device_name, rows: [] };
    group.rows.push(item);
    groups.set(item.device_id, group);
  });

  return (
    <div className="handover-items">
      {[...groups.values()].map((group) => (
        <div className="handover-device" key={group.code}>
          <p className="handover-device-head">
            <strong>{group.code}</strong>
            <span className="muted small">{group.name}</span>
            <span className="muted small">{group.rows.length} 个检查项</span>
          </p>
          <table className="mini-table">
            <thead>
              <tr><th>检查项</th><th>交接时进度</th><th>测到一半的数值</th><th>现场照片</th><th>备注</th></tr>
            </thead>
            <tbody>
              {group.rows.map((item) => {
                const status = snapshotStatus(item);
                return (
                  <tr key={item.id}>
                    <td>{item.item_name}<span className="muted small">（{item.item_code}）</span></td>
                    <td>
                      <StatusBadge value={status} />
                      <span className="muted small">{SNAPSHOT_STATUS_TEXT[status]}</span>
                    </td>
                    <td>{item.measured_value || <span className="muted">未测</span>}</td>
                    <td>{item.photo_url ? <a href={item.photo_url} target="_blank" rel="noreferrer">📷 查看照片</a> : <span className="muted">无</span>}</td>
                    <td>{item.note || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
