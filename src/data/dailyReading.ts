// 每日卦象记录的 localStorage 读写工具
import type { DailyReading } from "./types.ts";

const KEY_PREFIX = "guanbian_reading_";

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = "__guanbian_storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function getTodayReading(): DailyReading | null {
  if (!isLocalStorageAvailable()) return null;
  try {
    const raw = window.localStorage.getItem(`${KEY_PREFIX}${getTodayString()}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DailyReading & { hexagramId?: number };
    const hexagramIndex =
      parsed.hexagramIndex !== undefined
        ? parsed.hexagramIndex
        : (parsed.hexagramId as number);
    if (hexagramIndex === undefined) return null;
    return {
      date: parsed.date,
      hexagramIndex,
      question: parsed.question,
      interpretation: parsed.interpretation,
    };
  } catch {
    return null;
  }
}

export function saveTodayReading(reading: DailyReading): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.setItem(
      `${KEY_PREFIX}${getTodayString()}`,
      JSON.stringify(reading),
    );
  } catch {
  }
}
