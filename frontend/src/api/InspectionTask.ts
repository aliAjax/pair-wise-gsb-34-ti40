import { getMockState } from "../mocks/mockStore";
import type { InspectionTask } from "../types/InspectionTask";

const endpoint = "/api/inspection-task";

export async function listInspectionTask(): Promise<InspectionTask[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && true) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  // Fall back to the shared mock store so handover ownership transfers stay visible offline.
  return getMockState().inspectionTask.map((row) => ({ ...row }));
}

export async function saveInspectionTask(payload: InspectionTask) {
  console.info("save InspectionTask", payload);
  return payload;
}
