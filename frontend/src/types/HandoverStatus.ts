export const HandoverStatus = ["PENDING", "CONFIRMED", "WITHDRAWN"] as const;
export type HandoverStatus = (typeof HandoverStatus)[number];
