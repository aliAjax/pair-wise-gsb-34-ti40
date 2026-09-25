import type { HandoverCreateForm } from "../types/ShiftHandover";

export const createDefaultHandoverForm = (overrides: Partial<HandoverCreateForm> = {}): HandoverCreateForm => ({
  task_id: 0,
  handover_to: 0,
  site_note: "",
  estimated_arrival_at: "",
  items: [],
  ...overrides
});

export const createHandoverCreatePayload = createDefaultHandoverForm;
