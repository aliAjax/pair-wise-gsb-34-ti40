import { HandoverStatusText } from "../../constants/HandoverStatus";
import type { HandoverStatus as HandoverStatusValue } from "../../types/HandoverStatus";

export function HandoverStatusTag({ value }: { value: HandoverStatusValue }) {
  const key = value.toLowerCase();
  return <span className={`badge handover-${key}`}>{HandoverStatusText[value] ?? value}</span>;
}
