import { HandoverAction } from "../types/HandoverAction";

export { HandoverAction };
export type { HandoverAction as HandoverActionType } from "../types/HandoverAction";

export const HandoverActionText: Record<HandoverAction, string> = {
  CREATED: "发起交接",
  CONFIRMED: "确认接收",
  WITHDRAWN: "撤回交接",
};
