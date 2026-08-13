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
  const timeoutId = setTimeout(() => controller.abort(), 115000); // 115秒超时

  try {
    // 使用完整URL避免相对路径问题，同时添加 credentials
    const url = window.location.origin + "/api/interpret";
    const resp = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      credentials: "same-origin"
    });

    clearTimeout(timeoutId);

    // 先读取原始文本
    const rawText = await resp.text();

    // 尝试解析JSON
    let data: any = null;
    try {
      data = JSON.parse(rawText);
    } catch (parseErr) {
      console.error("❌ 后端返回非JSON:", rawText.substring(0, 500));
      return {
        interpretation: "",
        error: "服务器响应异常，请稍后再试。"
      };
    }

    if (!resp.ok) {
      return {
        interpretation: "",
        error: "当前用户较多，AI 解卦服务暂遇繁忙，请稍安勿躁。如需人工协助，点击对话框联系管理员。"
      };
    }

    // 即使状态码200，也可能有业务错误
    if (data.error) {
      return {
        interpretation: "",
        error: "当前用户较多，AI 解卦服务暂遇繁忙，请稍安勿躁。如需人工协助，点击对话框联系管理员。"
      };
    }

    let interpretation = data.interpretation || "";

    if (interpretation && !interpretation.includes(DISCLAIMER)) {
      interpretation = `${interpretation.trim()}\n\n${DISCLAIMER}`;
    }

    return { interpretation };
  } catch (fetchErr: any) {
    clearTimeout(timeoutId);
    console.error("💥 fetch异常:", fetchErr);

    if (fetchErr.name === "AbortError") {
      return {
        interpretation: "",
        error: "请求超时，AI 解卦生成时间较长，请稍后再试。"
      };
    }
    return {
      interpretation: "",
      error: "网络请求失败，请检查网络连接后重试。"
    };
  }
}