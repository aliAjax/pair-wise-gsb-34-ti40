import { useEffect, useMemo, useState } from "react";
import {
  listHandoverSources,
  listHandoverReceivers,
  getHandoverSourceForDevice
} from "../api/ShiftHandover";
import type { HandoverSourceTask, HandoverDeviceSource, HandoverSourceItem } from "../types/HandoverSource";
import type { Inspector } from "../types/Inspector";

/**
 * 交接发起闭环：
 * - 拉取本人未完成任务（按设备聚合的检查项）
 * - 维护检查项勾选集合（key: result_id）
 * - 提供接班人候选与设备页单设备来源
 */
export function useHandoverFlow(deviceId?: number) {
  const [sources, setSources] = useState<HandoverSourceTask[]>([]);
  const [deviceSource, setDeviceSource] = useState<HandoverDeviceSource | null>(null);
  const [receivers, setReceivers] = useState<Inspector[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([
      deviceId ? getHandoverSourceForDevice(deviceId) : listHandoverSources(),
      listHandoverReceivers()
    ]).then(([sourceData, receiverRows]) => {
      if (!alive) return;
      if (deviceId) {
        setDeviceSource(sourceData as HandoverDeviceSource | null);
        setSources(sourceData ? [{
          task_id: (sourceData as HandoverDeviceSource).task_id,
          building_id: (sourceData as HandoverDeviceSource).building_id,
          task_type: (sourceData as HandoverDeviceSource).task_type,
          plan_date: (sourceData as HandoverDeviceSource).plan_date,
          status: (sourceData as HandoverDeviceSource).status,
          devices: [(sourceData as HandoverDeviceSource).device]
        }] : []);
      } else {
        setSources(sourceData as HandoverSourceTask[]);
      }
      setReceivers(receiverRows);
    }).finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [deviceId]);

  const allItems = useMemo(() => {
    const map = new Map<number, HandoverSourceItem & { task_id: number; device_id: number }>();
    sources.forEach((task) => task.devices.forEach((device) => device.items.forEach((item) => {
      map.set(item.result_id, { ...item, task_id: task.task_id, device_id: device.device_id });
    })));
    return map;
  }, [sources]);

  const toggle = (resultId: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(resultId)) next.delete(resultId);
      else next.add(resultId);
      return next;
    });
  };

  const toggleDevice = (items: HandoverSourceItem[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const allChecked = items.every((item) => next.has(item.result_id));
      items.forEach((item) => (allChecked ? next.delete(item.result_id) : next.add(item.result_id)));
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => (prev.size === allItems.size ? new Set() : new Set(allItems.keys())));
  };

  const reset = () => setSelected(new Set());

  return {
    sources,
    deviceSource,
    receivers,
    selected,
    allItems,
    loading,
    toggle,
    toggleDevice,
    toggleAll,
    reset
  };
}
