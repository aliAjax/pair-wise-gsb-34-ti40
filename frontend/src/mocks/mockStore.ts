import { mockData } from "./seedData";
import type { InspectionResult } from "../types/InspectionResult";
import type { InspectionTask } from "../types/InspectionTask";
import type { HandoverEvent, HandoverItem, TaskHandover } from "../types/TaskHandover";

export type MockState = {
  taskHandover: TaskHandover[];
  handoverItem: HandoverItem[];
  handoverEvent: HandoverEvent[];
  inspectionTask: InspectionTask[];
  inspectionResult: InspectionResult[];
};

let mockState: MockState | null = null;

export function getMockState(): MockState {
  if (!mockState) {
    const clone = JSON.parse(JSON.stringify(mockData)) as unknown as MockState & {
      taskHandover: Array<Omit<TaskHandover, "items" | "events">>;
    };
    mockState = {
      taskHandover: clone.taskHandover.map((row) => ({ ...row, items: [], events: [] })),
      handoverItem: clone.handoverItem,
      handoverEvent: clone.handoverEvent,
      inspectionTask: clone.inspectionTask,
      inspectionResult: clone.inspectionResult
    };
  }
  return mockState;
}

export const mockNextId = (rows: Array<{ id: number }>) => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
