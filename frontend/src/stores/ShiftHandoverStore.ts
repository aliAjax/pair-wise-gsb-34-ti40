import { create } from "zustand";
import {
  listShiftHandover,
  createShiftHandover,
  acceptShiftHandover,
  revokeShiftHandover
} from "../api/ShiftHandover";
import type { ShiftHandover, HandoverCreateForm } from "../types/ShiftHandover";

type Scope = "all" | "from_me" | "to_me";

/** 交接状态变化（发起/确认/撤回）后广播，任务页、设备页据此刷新负责人 */
const CHANGE_EVENT = "handover:changed";
export function emitHandoverChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE_EVENT));
}
export function onHandoverChanged(handler: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
}

type State = {
  rows: ShiftHandover[];
  loading: boolean;
  acting: boolean;
  error: string;
  scope: Scope;
  setScope: (scope: Scope) => void;
  load: () => Promise<void>;
  create: (form: HandoverCreateForm) => Promise<ShiftHandover>;
  accept: (id: number) => Promise<void>;
  revoke: (id: number) => Promise<void>;
  clearError: () => void;
};

export const useShiftHandoverStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  acting: false,
  error: "",
  scope: "all",
  setScope(scope) {
    set({ scope });
    void get().load();
  },
  async load() {
    set({ loading: true, error: "" });
    try {
      set({ rows: await listShiftHandover(get().scope), loading: false });
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : "加载交接单失败" });
    }
  },
  async create(form) {
    set({ acting: true, error: "" });
    try {
      const created = await createShiftHandover(form);
      await get().load();
      emitHandoverChanged();
      return created;
    } catch (err) {
      const message = err instanceof Error ? err.message : "发起交接失败";
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ acting: false });
    }
  },
  async accept(id) {
    set({ acting: true, error: "" });
    try {
      await acceptShiftHandover(id);
      await get().load();
      emitHandoverChanged();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "确认接班失败" });
    } finally {
      set({ acting: false });
    }
  },
  async revoke(id) {
    set({ acting: true, error: "" });
    try {
      await revokeShiftHandover(id);
      await get().load();
      emitHandoverChanged();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "撤回交接失败" });
    } finally {
      set({ acting: false });
    }
  },
  clearError() {
    set({ error: "" });
  }
}));
