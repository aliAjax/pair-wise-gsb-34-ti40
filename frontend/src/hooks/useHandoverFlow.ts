import { useCallback, useEffect, useMemo, useState } from "react";
import { useTaskHandoverStore } from "../stores/TaskHandoverStore";
import { useInspectionTaskStore } from "../stores/InspectionTaskStore";
import { useCurrentUserStore } from "../stores/CurrentUserStore";
import type { TaskHandover, TaskHandoverCreatePayload } from "../types/TaskHandover";

export function useHandoverFlow() {
  const rows = useTaskHandoverStore((state) => state.rows);
  const loading = useTaskHandoverStore((state) => state.loading);
  const load = useTaskHandoverStore((state) => state.load);
  const create = useTaskHandoverStore((state) => state.create);
  const confirm = useTaskHandoverStore((state) => state.confirm);
  const withdraw = useTaskHandoverStore((state) => state.withdraw);
  const loadTasks = useInspectionTaskStore((state) => state.load);
  const currentUserId = useCurrentUserStore((state) => state.currentUserId);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    load();
    loadTasks();
  }, [load, loadTasks, currentUserId]);

  const refresh = useCallback(async () => {
    await Promise.all([load(), loadTasks()]);
  }, [load, loadTasks]);

  const run = useCallback(
    async (fn: () => Promise<TaskHandover>) => {
      setActing(true);
      try {
        const result = await fn();
        await refresh();
        return result;
      } finally {
        setActing(false);
      }
    },
    [refresh]
  );

  const createHandover = useCallback(
    (payload: TaskHandoverCreatePayload) => run(() => create(payload)),
    [run, create]
  );
  const confirmHandover = useCallback((id: number) => run(() => confirm(id)), [run, confirm]);
  const withdrawHandover = useCallback((id: number) => run(() => withdraw(id)), [run, withdraw]);

  const byTask = useCallback((taskId: number) => rows.filter((row) => row.task_id === taskId), [rows]);
  const byDevice = useCallback(
    (deviceId: number) => rows.filter((row) => row.items.some((item) => item.device_id === deviceId)),
    [rows]
  );
  const mine = useMemo(
    () => rows.filter((row) => row.from_inspector_id === currentUserId || row.to_inspector_id === currentUserId),
    [rows, currentUserId]
  );
  const pendingInbox = useMemo(
    () => rows.filter((row) => row.status === "PENDING" && row.to_inspector_id === currentUserId),
    [rows, currentUserId]
  );
  const pendingForTask = useCallback(
    (taskId: number) => byTask(taskId).find((row) => row.status === "PENDING") ?? null,
    [byTask]
  );

  return {
    rows,
    loading,
    acting,
    refresh,
    createHandover,
    confirmHandover,
    withdrawHandover,
    byTask,
    byDevice,
    mine,
    pendingInbox,
    pendingForTask
  };
}
