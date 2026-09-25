import { create } from "zustand";
import { CURRENT_INSPECTOR_ID } from "../constants/Inspectors";

type State = {
  currentUserId: number;
  switchTo: (id: number) => void;
};

export const useCurrentUserStore = create<State>((set) => ({
  currentUserId: CURRENT_INSPECTOR_ID,
  switchTo: (currentUserId) => set({ currentUserId })
}));

export const currentUserId = () => useCurrentUserStore.getState().currentUserId;
