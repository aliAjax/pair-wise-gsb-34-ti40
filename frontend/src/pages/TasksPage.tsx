import { useEffect, useMemo, useState } from "react";
import { useBuildingStore } from "../stores/BuildingStore";
import { useFireDeviceStore } from "../stores/FireDeviceStore";
import { useInspectionResultStore } from "../stores/InspectionResultStore";
import { useInspectionTaskStore } from "../stores/InspectionTaskStore";
import { useCurrentUserStore } from "../stores/CurrentUserStore";
import { useHandoverFlow } from "../hooks/useHandoverFlow";
import { HandoverCreateDialog } from "../components/common/HandoverCreateDialog";
import { HandoverPanel } from "../components/common/HandoverPanel";
import { HandoverStatusTag } from "../components/common/HandoverStatusTag";
import { StatusBadge } from "../components/common/StatusBadge";
import { UserSwitcher } from "../components/common/UserSwitcher";
import { EmptyState } from "../components/common/EmptyState";
import { formatDateTime, formatProgress } from "../utils/formatters";
import type { InspectionTask } from "../types/InspectionTask";

const UNFINISHED_TASK_STATUS = ["PLANNED", "IN_PROGRESS", "OVERDUE"];

export function TasksPage() {
  const currentUserId = useCurrentUserStore((state) => state.currentUserId);
  const tasks = useInspectionTaskStore((state) => state.rows);
  const devices = useFireDeviceStore((state) => state.rows);
  const results = useInspectionResultStore((state) => state.rows);
  const buildings = useBuildingStore((state) => state.rows);
  const loadDevices = useFireDeviceStore((state) => state.load);
  const loadResults = useInspectionResultStore((state) => state.load);
  const loadBuildings = useBuildingStore((state) => state.load);
  const flow = useHandoverFlow();

  const [dialogTask, setDialogTask] = useState<InspectionTask | null>(null);
  const [panelTaskId, setPanelTaskId] = useState<number | null>(null);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    loadDevices();
    loadResults();
    loadBuildings();
  }, [loadDevices, loadResults, loadBuildings]);

  const buildingNameOf = (id: number) => buildings.find((building) => building.id === id)?.name ?? `#${id}`;
  const taskResultsOf = (taskId: number) => results.filter((result) => result.task_id === taskId);
  const doneCountOf = (taskId: number) =>
    taskResultsOf(taskId).filter((result) => ["SUBMITTED", "REVIEWED"].includes(result.result_status)).length;

  const myTasks = useMemo(
    () => tasks.filter((task) => task.inspector_id === currentUserId),
    [tasks, currentUserId]
  );
  const unfinishedTasks = myTasks.filter((task) => UNFINISHED_TASK_STATUS.includes(task.status));

  const panelHandovers = panelTaskId ? flow.byTask(panelTaskId) : flow.mine;
  const panelTitle = panelTaskId ? `交接记录 · 任务 #${panelTaskId}` : "我的交接闭环";

  const handleError = (fn: (id: number) => Promise<unknown>) => async (id: number) => {
    setPageError("");
    try {
      await fn(id);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "操作失败，请稍后重试");
    }
  };

  return (
    <>
      <section className="page-head">
        <div>
          <p className="eyebrow">night handover</p>
          <h1>巡检任务</h1>
          <p className="muted">勾选未完成设备检查项发起交接，接班人确认后任务负责人自动转移。</p>
        </div>
        <UserSwitcher />
      </section>

      {flow.pendingInbox.length > 0 ? (
        <section className="alert-strip">
          <strong>你有 {flow.pendingInbox.length} 条待确认交接，确认后任务将归你继续处理。</strong>
        </section>
      ) : null}
      {pageError ? <section className="alert-strip error">{pageError}</section> : null}

      <section className="panel wide">
        <h2>我的未完成任务（可发起交接）</h2>
        {unfinishedTasks.length === 0 ? (
          <EmptyState title="当前身份下没有未完成任务，切换上方登录人可查看其任务" />
        ) : (
          <div className="data-table" style={{ gridTemplateColumns: "2.2fr 1.6fr 1.2fr 1fr 1.2fr 1.4fr 1.6fr" }}>
            <div className="table-head">
              <span>任务 / 楼栋</span>
              <span>计划时间</span>
              <span>类型</span>
              <span>状态</span>
              <span>检查项进度</span>
              <span>交接状态</span>
              <span>操作</span>
            </div>
            {unfinishedTasks.map((task) => {
              const pending = flow.pendingForTask(task.id);
              const total = taskResultsOf(task.id).length;
              const done = doneCountOf(task.id);
              return (
                <div key={task.id} className="table-row">
                  <span>
                    <strong>#{task.id}</strong> · {buildingNameOf(task.building_id)}
                  </span>
                  <span className="muted">{formatDateTime(task.plan_date)}</span>
                  <span>{task.task_type}</span>
                  <span>
                    <StatusBadge value={task.status} />
                  </span>
                  <span>{formatProgress(done, total)}</span>
                  <span>{pending ? <HandoverStatusTag value={pending.status} /> : <span className="muted">未交接</span>}</span>
                  <span className="row-actions">
                    <button
                      type="button"
                      className="btn small"
                      disabled={Boolean(pending)}
                      title={pending ? "已有待确认交接，处理后可再发起" : undefined}
                      onClick={() => setDialogTask(task)}
                    >
                      发起交接
                    </button>
                    <button type="button" className="btn ghost small" onClick={() => setPanelTaskId(task.id)}>
                      查看交接
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <HandoverPanel
        title={panelTitle}
        handovers={panelHandovers}
        devices={devices}
        results={results}
        tasks={tasks}
        acting={flow.acting}
        emptyText="还没有交接记录，在上方任务行点击“发起交接”"
        onConfirm={handleError((id) => flow.confirmHandover(id))}
        onWithdraw={handleError((id) => flow.withdrawHandover(id))}
      />
      {panelTaskId ? (
        <button type="button" className="btn ghost small self-start" onClick={() => setPanelTaskId(null)}>
          查看全部交接
        </button>
      ) : null}

      <HandoverCreateDialog
        open={dialogTask !== null}
        task={dialogTask}
        devices={devices}
        onClose={() => setDialogTask(null)}
        onCreate={flow.createHandover}
      />
    </>
  );
}
