import type { Hexagram } from "../data/types.ts";

const DISCLAIMER = "以上内容仅为基于易经哲学的启发式思考，不构成任何实际建议。";

export interface InterpretRequest {
  hexagramName: string;
  guaCi: string;
  selectedYao: string[];
  userQuestion?: string;
}

export interface InterpretResponse {
  interpretation: string;
  error?: string;
}

function yaoTitle(position: number, isYang: boolean): string {
  const number = isYang ? "九" : "六";
  if (position === 1) return `初${number}`;
  if (position === 6) return `上${number}`;
  const names = ["", "二", "三", "四", "五", ""];
  return `${number}${names[position] ?? String(position)}`;
}

export async function interpretHexagram(
  hexagram: Hexagram,
  userQuestion: string,
): Promise<InterpretResponse> {
  const selectedYao: string[] = [];
  for (let i = 0; i < 6; i++) {
    const bit = hexagram.binary[i]!;
    const position = i + 1;
    const isYang = bit === "1";
    const title = yaoTitle(position, isYang);
    const text = hexagram.yaoCi[i] ?? "";
    selectedYao.push(`${title}：${text}`);
  }

  const body: InterpretRequest = {
    hexagramName: hexagram.name,
    guaCi: hexagram.guaCi,
    selectedYao,
    userQuestion: userQuestion.trim() || undefined,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 11000);

  try {
    const resp = await fetch("/api/interpret", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!resp.ok) {
      return {
        interpretation: "",
        error: "今日卦象已为你抽取，但 AI 解读暂时不可用，请稍后再试。",
      };
    }

    const data = (await resp.json()) as { interpretation?: string; error?: string };
    let interpretation = data.interpretation || "";

    if (interpretation && !interpretation.includes(DISCLAIMER)) {
      interpretation = `${interpretation.trim()}\n\n${DISCLAIMER}`;
    }

    return { interpretation, error: data.error };
  } catch {
    clearTimeout(timeoutId);
    return {
      interpretation: "",
      error: "今日卦象已为你抽取，但 AI 解读暂时不可用，请稍后再试。",
    };
  }
}
