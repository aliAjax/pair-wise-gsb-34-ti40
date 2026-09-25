export const HandoverAction = ["CREATED", "CONFIRMED", "WITHDRAWN"] as const;
export type HandoverAction = (typeof HandoverAction)[number];
