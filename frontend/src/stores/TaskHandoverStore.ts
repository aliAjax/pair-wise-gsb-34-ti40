import { create } from "zustand";
import {
  confirmTaskHandover,
  createTaskHandover,
  listTaskHandover,
  withdrawTaskHandover
} from "../api/TaskHandover";
import type { TaskHandover, TaskHandoverCreatePayload } from "../types/TaskHandover";

type State = {
  rows: TaskHandover[];
  loading: boolean;
  load: () => Promise<void>;
  create: (payload: TaskHandoverCreatePayload) => Promise<TaskHandover>;
  confirm: (id: number) => Promise<TaskHandover>;
  withdraw: (id: number) => Promise<TaskHandover>;
};

export const useTaskHandoverStore = create<State>((set) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listTaskHandover(), loading: false });
  },
  async create(payload) {
    const created = await createTaskHandover(payload);
    set((state) => ({ rows: [created, ...state.rows] }));
    return created;
  },
  async confirm(id) {
    const updated = await confirmTaskHandover(id);
    set((state) => ({ rows: state.rows.map((row) => (row.id === id ? updated : row)) }));
    return updated;
  },
  async withdraw(id) {
    const updated = await withdrawTaskHandover(id);
    set((state) => ({ rows: state.rows.map((row) => (row.id === id ? updated : row)) }));
    return updated;
  }
}));
