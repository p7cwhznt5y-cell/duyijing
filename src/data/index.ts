// 数据层统一导出
export type {
  Hexagram,
  HexagramCategory,
  DailyReading,
} from "./types.ts";

export {
  HEXAGRAMS,
  getHexagramByIndex,
  getHexagramsByCategory,
  getRandomHexagram,
} from "./hexagrams.ts";

export {
  HEXAGRAM_CATEGORIES,
  getHexagramsForCategory,
  type CategoryMeta,
} from "./categories.ts";

export {
  getTodayReading,
  saveTodayReading,
  isLocalStorageAvailable,
  getTodayString,
} from "./dailyReading.ts";
