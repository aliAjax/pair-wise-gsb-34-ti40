export const CHECK_ITEM_TEXT: Record<string, string> = {
  PRESSURE_CHECK: "压力检查",
  VALVE_STATUS: "阀门状态",
  EXPIRY_CHECK: "效期核查",
  SMOKE_TEST: "烟感测试",
  SPRINKLER_VALVE: "喷淋阀检查",
  EXIT_LIGHT_TEST: "应急灯测试",
};

export const checkItemText = (code: string): string => CHECK_ITEM_TEXT[code] ?? code;
