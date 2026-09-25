import { useEffect, useMemo, useState } from "react";
import { useShiftHandoverStore } from "../../stores/ShiftHandoverStore";
import { getCurrentUserId } from "../../api/Inspector";
import type { Inspector } from "../../types/Inspector";
import { HandoverCard } from "./HandoverCard";
import { HandoverCreateDialog } from "./HandoverCreateDialog";
import { HandoverDetailDialog } from "./HandoverDetailDialog";
import { EmptyState } from "../common/EmptyState";

type Props = {
  inspectors: Inspector[];
  /** 设备页传入 deviceId 后：发起只勾选该设备，列表只看与该设备相关的交接单 */
  deviceId?: number;
  refreshSignal?: number;
};

type Scope = "all" | "from_me" | "to_me";

const SCOPE_TABS: { key: Scope; label: string }[] = [
  { key: "all", label: "全部交接" },
  { key: "to_me", label: "待我接班" },
  { key: "from_me", label: "我交班的" }
];

/** 交接列表面板：任务页和设备页共用，支持发起、查看、确认、撤回 */
export function HandoverListPanel({ inspectors, deviceId, refreshSignal = 0 }: Props) {
  const { rows, loading, scope, setScope, load } = useShiftHandoverStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSignal]);

  const visibleRows = useMemo(() => {
    if (!deviceId) return rows;
    return rows.filter((row) => row.items.some((item) => item.device_id === deviceId));
  }, [rows, deviceId]);

  const pendingToMe = visibleRows.filter(
    (row) => row.status === "PENDING" && row.handover_to === getCurrentUserId()
  ).length;

  return (
    <section className="panel handover-panel">
      <div className="panel-head">
        <div>
          <h2>班次交接{deviceId ? " · 本设备" : ""}</h2>
          <p className="muted small">勾选设备和检查项发起交接，接班人确认后任务自动转移；确认前交班人可撤回</p>
        </div>
        <button className="btn primary" onClick={() => setCreateOpen(true)}>
          发起交接
        </button>
      </div>

      <div className="scope-tabs">
        {SCOPE_TABS.map((tab) => (
          <button
            key={tab.key}
            className={scope === tab.key ? "active" : ""}
            onClick={() => setScope(tab.key)}
          >
            {tab.label}
            {tab.key === "to_me" && pendingToMe > 0 ? `（${pendingToMe}）` : ""}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="muted">加载中…</p>
      ) : visibleRows.length === 0 ? (
        <EmptyState title={deviceId ? "本设备暂无交接记录" : "暂无交接单，夜班未完成任务可在此发起交接"} />
      ) : (
        <div className="handover-grid">
          {visibleRows.map((row) => (
            <HandoverCard
              key={row.id}
              row={row}
              inspectors={inspectors}
              currentUserId={getCurrentUserId()}
              highlightDeviceId={deviceId}
              onView={setDetailId}
            />
          ))}
        </div>
      )}

      <HandoverCreateDialog
        open={createOpen}
        deviceId={deviceId}
        onClose={() => setCreateOpen(false)}
        onCreated={() => setScope("from_me")}
      />
      <HandoverDetailDialog
        open={detailId != null}
        handoverId={detailId}
        inspectors={inspectors}
        onClose={() => setDetailId(null)}
        onChanged={() => setScope(scope)}
      />
    </section>
  );
}
