import { useEffect, useState } from "react";
import { listInspector, getCurrentUserId } from "../api/Inspector";
import type { Inspector } from "../types/Inspector";

/** 巡检员花名册：交接卡片、详情用它把负责人 id 解析成姓名 */
export function useInspectors() {
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const currentUserId = getCurrentUserId();
  useEffect(() => {
    void listInspector().then(setInspectors);
  }, []);
  const nameOf = (id: number) => inspectors.find((row) => row.id === id)?.name ?? `#${id}`;
  const current = inspectors.find((row) => row.id === currentUserId);
  return { inspectors, nameOf, currentUserId, current };
}
