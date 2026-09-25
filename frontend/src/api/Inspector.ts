import { mockData } from "../mocks/seedData";
import type { Inspector } from "../types/Inspector";

const endpoint = "/api/inspector";

const CURRENT_USER_KEY = "fire-inspect:current-user";
export const DEFAULT_USER_ID = 1;

/** 当前登录巡检员由前端模拟（演示环境），通过 x-user-id 请求头传递给后端。
 *  默认 1 = 张夜行（夜班），顶栏可切换到白班账号体验「确认接班」。 */
export function getCurrentUserId(): number {
  try {
    return Number(localStorage.getItem(CURRENT_USER_KEY)) || DEFAULT_USER_ID;
  } catch {
    return DEFAULT_USER_ID;
  }
}

export function setCurrentUserId(id: number) {
  try {
    localStorage.setItem(CURRENT_USER_KEY, String(id));
  } catch {
    // localStorage 不可用时忽略
  }
}

// 兼容既有引用：动态身份请使用 getCurrentUserId()
export const CURRENT_USER_ID = DEFAULT_USER_ID;

export async function listInspector(): Promise<Inspector[]> {
  try {
    const res = await fetch(endpoint, { headers: { "x-user-id": String(getCurrentUserId()) } });
    if (res.ok) return await res.json();
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  return [...(mockData.inspector as unknown as Inspector[])];
}
