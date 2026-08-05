// 《观变：易经互动推演器》数据层类型定义

export type HexagramCategory =
  | "🚀 进取"
  | "🛡️ 守成"
  | "🌊 变通"
  | "⏳ 等待"
  | "⚖️ 权衡"
  | "🔥 警示"
  | "💪 蓄力"
  | "🔄 转折";

export interface Hexagram {
  index: number;
  name: string;
  symbol: string;
  binary: string;
  guaCi: string;
  yaoCi: string[];
  category: HexagramCategory;
}

export interface DailyReading {
  date: string;
  hexagramIndex: number;
  question?: string;
  interpretation?: string;
}
