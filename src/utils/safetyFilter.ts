const SENSITIVE_WORDS = [
  "想死",
  "活不下去",
  "自杀",
  "自残",
  "不想活",
  "轻生",
  "结束生命",
  "割腕",
  "跳楼",
  "上吊",
  "服毒",
  "寻短见",
];

const CARE_MESSAGE = "我很担心你，请拨打心理援助热线 12355 或 400-161-9995，有专业人士可以帮助你。";

/** 检测输入是否含敏感词，若含则返回关怀语 */
export function detectSensitive(content: string): { sensitive: boolean; careMessage?: string } {
  const hit = SENSITIVE_WORDS.some((w) => content.includes(w));
  return hit ? { sensitive: true, careMessage: CARE_MESSAGE } : { sensitive: false };
}

/** 截断输入到指定长度 */
export function truncateInput(content: string, max = 200): string {
  return content.length > max ? content.slice(0, max) : content;
}

export { CARE_MESSAGE };
