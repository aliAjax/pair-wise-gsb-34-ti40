import type { TaskHandover, TaskHandoverCreatePayload } from "../types/TaskHandover";

export const createDefaultTaskHandover = (overrides: Partial<TaskHandover> = {}): TaskHandover => ({
  id: 0,
  task_id: 0,
  from_inspector_id: 0,
  to_inspector_id: 0,
  note: "",
  expected_arrival_at: "",
  status: "PENDING",
  created_at: "",
  confirmed_at: "",
  withdrawn_at: "",
  items: [],
  events: [],
  ...overrides
});

export const createTaskHandoverForm = (overrides: Partial<TaskHandoverCreatePayload> = {}): TaskHandoverCreatePayload => ({
  task_id: 0,
  to_inspector_id: 0,
  note: "",
  expected_arrival_at: "",
  items: [],
  ...overrides
});

export const createTaskHandoverResponse = createDefaultTaskHandover;
