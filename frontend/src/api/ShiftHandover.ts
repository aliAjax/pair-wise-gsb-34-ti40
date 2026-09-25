import { getCurrentUserId } from "./Inspector";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import {
  listLocal, getLocal, receiversLocal, sourcesLocal, deviceSourceLocal,
  createLocal, acceptLocal, revokeLocal
} from "../mocks/handoverMockEngine";
import type { ShiftHandover, HandoverCreateForm } from "../types/ShiftHandover";
import type { HandoverSourceTask, HandoverDeviceSource } from "../types/HandoverSource";

const endpoint = "/api/shift-handover";

const headers = () => ({
  "Content-Type": "application/json",
  "x-user-id": String(getCurrentUserId())
});

async function readJsonOrThrow(res: Response) {
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const message = payload?.detail?.message ?? ERROR_MESSAGES.VALIDATION_FAILED;
    throw new Error(message);
  }
  return payload;
}

export async function listShiftHandover(scope: "all" | "from_me" | "to_me" = "all"): Promise<ShiftHandover[]> {
  try {
    const res = await fetch(`${endpoint}?scope=${scope}`, { headers: { "x-user-id": String(getCurrentUserId()) } });
    if (res.ok) return await res.json();
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  return listLocal(scope, getCurrentUserId());
}

export async function getShiftHandover(id: number): Promise<ShiftHandover | null> {
  try {
    const res = await fetch(`${endpoint}/${id}`, { headers: { "x-user-id": String(getCurrentUserId()) } });
    if (res.ok) return await res.json();
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  return getLocal(id);
}

export async function listHandoverSources(): Promise<HandoverSourceTask[]> {
  try {
    const res = await fetch(`${endpoint}/sources`, { headers: { "x-user-id": String(getCurrentUserId()) } });
    if (res.ok) return await res.json();
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  return sourcesLocal(getCurrentUserId());
}

export async function getHandoverSourceForDevice(deviceId: number): Promise<HandoverDeviceSource | null> {
  try {
    const res = await fetch(`${endpoint}/sources/device/${deviceId}`, { headers: { "x-user-id": String(getCurrentUserId()) } });
    if (res.ok) return await res.json();
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  return deviceSourceLocal(deviceId, getCurrentUserId());
}

export async function listHandoverReceivers() {
  try {
    const res = await fetch(`${endpoint}/receivers`, { headers: { "x-user-id": String(getCurrentUserId()) } });
    if (res.ok) return await res.json();
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  return receiversLocal(getCurrentUserId());
}

export async function createShiftHandover(form: HandoverCreateForm): Promise<ShiftHandover> {
  try {
    const res = await fetch(endpoint, { method: "POST", headers: headers(), body: JSON.stringify(form) });
    return await readJsonOrThrow(res);
  } catch (err) {
    // 网络错误时走本地兜底引擎；业务错误（服务端可达且返回 4xx）直接透传
    if (err instanceof TypeError) return createLocal(form, getCurrentUserId());
    throw err;
  }
}

export async function acceptShiftHandover(id: number): Promise<ShiftHandover> {
  try {
    const res = await fetch(`${endpoint}/${id}/accept`, { method: "POST", headers: headers() });
    return await readJsonOrThrow(res);
  } catch (err) {
    if (err instanceof TypeError) return acceptLocal(id, getCurrentUserId());
    throw err;
  }
}

export async function revokeShiftHandover(id: number): Promise<ShiftHandover> {
  try {
    const res = await fetch(`${endpoint}/${id}/revoke`, { method: "POST", headers: headers() });
    return await readJsonOrThrow(res);
  } catch (err) {
    if (err instanceof TypeError) return revokeLocal(id, getCurrentUserId());
    throw err;
  }
}
