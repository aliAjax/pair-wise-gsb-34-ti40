import { useEffect, useMemo, useState } from "react";
import { useInspectionTaskStore } from "../stores/InspectionTaskStore";
import { onHandoverChanged } from "../stores/ShiftHandoverStore";
import { listInspectionResult } from "../api/InspectionResult";
import { listBuilding } from "../api/Building";
import { useInspectors } from "../hooks/useInspectors";
import { getCurrentUserId } from "../api/Inspector";
import { StatusBadge } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";
import { HandoverListPanel } from "../components/handover/HandoverListPanel";
import type { InspectionResult } from "../types/InspectionResult";
import type { Building } from "../types/Building";
import { taskTypeText } from "../utils/formatters";

export function TasksPage() {
  const { rows, load } = useInspectionTaskStore();
  const { inspectors, nameOf, current } = useInspectors();
  const [results, setResults] = useState<InspectionResult[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [onlyMine, setOnlyMine] = useState(true);

  useEffect(() => {
    void load();
    void listInspectionResult().then(setResults);
    void listBuilding().then(setBuildings);
    return onHandoverChanged(() => {
      // 接班确认后任务负责人转移，撤回后保持原负责人，均需重刷任务清单
      void load();
      void listInspectionResult().then(setResults);
    });
  }, [load]);

  const visibleTasks = useMemo(
    () => rows.filter((task) => !onlyMine || task.inspector_id === getCurrentUserId()),
    [rows, onlyMine]
  );

  const progressOf = (taskId: number) => {
    const items = results.filter((row) => row.task_id === taskId);
    const done = items.filter((row) => row.result_status === "NORMAL" || row.result_status === "ABNORMAL" || row.result_status === "MEASURED");
    return { total: items.length, done: done.length, measured: items.filter((row) => row.result_status === "MEASURED").length };
  };

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">shift handover</p>
          <h1>巡检任务 · 班次交接</h1>
          <p className="muted">
            当前登录：<b>{current?.name ?? `#${getCurrentUserId()}`}</b>（{current ? (current.shift === "NIGHT" ? "夜班巡检员" : "白班巡检员") : "巡检员"}）。遇到设备临时故障或现场情况变化时，勾选测到一半的检查项发起交接，接班人确认后任务自动转移；确认前交班人可随时撤回。
          </p>
        </div>
        <label className="switch-line">
          <input type="checkbox" checked={onlyMine} onChange={(event) => setOnlyMine(event.target.checked)} />
          只看本人未完成任务
        </label>
      </section>

      <section className="metrics">
        <div className="stat"><span>我的进行中任务</span><strong>{rows.filter((t) => t.inspector_id === getCurrentUserId() && t.status === "IN_PROGRESS").length}</strong></div>
        <div className="stat"><span>测到一半的检查项</span><strong>{results.filter((r) => r.result_status === "MEASURED").length}</strong></div>
        <div className="stat"><span>任务总数</span><strong>{rows.length}</strong></div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>任务清单</h2>
          <span className="muted small">确认接班后任务负责人会实时更新到这张表</span>
        </div>
        {visibleTasks.length === 0 ? <EmptyState title="没有符合条件的任务" /> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>任务</th><th>楼栋</th><th>类型</th><th>计划日期</th><th>负责人</th><th>状态</th><th>检查项进度</th>
              </tr>
            </thead>
            <tbody>
              {visibleTasks.map((task) => {
                const progress = progressOf(task.id);
                const building = buildings.find((row) => row.id === task.building_id);
                return (
                  <tr key={task.id} className={task.inspector_id === getCurrentUserId() ? "" : "dim-row"}>
                    <td>#{task.id}</td>
                    <td>{building?.name ?? task.building_id}</td>
                    <td>{taskTypeText(task.task_type)}</td>
                    <td>{task.plan_date}</td>
                    <td>{nameOf(task.inspector_id)}</td>
                    <td><StatusBadge value={task.status} /></td>
                    <td>
                      {progress.done}/{progress.total}
                      {progress.measured > 0 && <span className="muted small">（{progress.measured} 项测到一半）</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <HandoverListPanel inspectors={inspectors} />
    </main>
  );
}
