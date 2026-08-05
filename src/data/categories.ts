// 决策推演器情境分类定义
import type { HexagramCategory } from "./types.ts";
import { HEXAGRAMS } from "./hexagrams.ts";

export interface CategoryMeta {
  value: HexagramCategory;
  label: string;
  description: string;
}

export const HEXAGRAM_CATEGORIES: CategoryMeta[] = [
  {
    value: "🚀 进取",
    label: "进取",
    description: "主动出击、向前推进，追求目标突破",
  },
  {
    value: "🛡️ 守成",
    label: "守成",
    description: "稳固基业、守护已有，保持承载力",
  },
  {
    value: "🌊 变通",
    label: "变通",
    description: "灵活应变、随势调整，不拘泥现状",
  },
  {
    value: "⏳ 等待",
    label: "等待",
    description: "时机未到、静默积蓄，静待花开",
  },
  {
    value: "⚖️ 权衡",
    label: "权衡",
    description: "纷争取舍、判断裁决，理性决策",
  },
  {
    value: "🔥 警示",
    label: "警示",
    description: "风险警戒、防患未然，引以为戒",
  },
  {
    value: "💪 蓄力",
    label: "蓄力",
    description: "隐忍克制、潜修厚积，充实内力",
  },
  {
    value: "🔄 转折",
    label: "转折",
    description: "新旧交替、转机来临，顺势转身",
  },
];

export function getHexagramsForCategory(category: HexagramCategory) {
  return HEXAGRAMS.filter((h) => h.category === category);
}
