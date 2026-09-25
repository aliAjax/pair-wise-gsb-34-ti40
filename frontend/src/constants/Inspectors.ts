import type { Inspector } from "../types/Inspector";

export const INSPECTORS: Inspector[] = [
  { id: 1, name: "张强", shift: "夜班", role: "巡检员" },
  { id: 2, name: "李伟", shift: "白班", role: "巡检员" },
  { id: 3, name: "王芳", shift: "夜班", role: "巡检员" },
  { id: 4, name: "赵磊", shift: "白班", role: "维保商" },
];

export const CURRENT_INSPECTOR_ID = 1;

export const inspectorName = (id: number): string => {
  const found = INSPECTORS.find((inspector) => inspector.id === id);
  return found ? `${found.name}（${found.shift}）` : `#${id}`;
};

export const handoverCandidates = (excludeId: number = CURRENT_INSPECTOR_ID): Inspector[] =>
  INSPECTORS.filter((inspector) => inspector.id !== excludeId);
