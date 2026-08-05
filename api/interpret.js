// Cloudflare Worker / Vercel Serverless Function：代理 DeepSeek API
// API Key 从环境变量读取（DEEPSEEK_API_KEY），绝不硬编码

const SYSTEM_PROMPT = `你是一个深谙《周易》哲学的学者。你的任务是基于用户抽取到的卦象，给出哲学层面的启发式解读，而非预测吉凶。规则：
1. 严禁出现"大吉""凶兆""必定""一定"等绝对化断言
2. 解读应帮助用户从易经"变易"思维出发，审视自己的处境
3. 字数 200-300 字
4. 末尾必须附："以上内容仅为基于易经哲学的启发式思考，不构成任何实际建议。"
5. 若用户输入含"想死""自杀"等，立即返回心理援助热线信息`;

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const TIMEOUT_MS = 10000;
const MAX_TOKENS = 600;  // 200-300 字中文约需 400-600 tokens

const FORBIDDEN_PHRASES = ["大吉", "大凶", "凶兆", "必死", "必定成功", "必定失败", "必定", "一定", "肯定会", "必将"];

function containsForbidden(text) {
  return FORBIDDEN_PHRASES.some(p => text.includes(p));
}

export default async function handler(req) {
  // 处理 CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  // 从环境变量读取 API Key（Cloudflare Workers: env / Vercel: process.env）
  const apiKey = req.env?.DEEPSEEK_API_KEY || process.env?.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API Key 未配置" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  const { hexagramName, guaCi, selectedYao, userQuestion } = body || {};

  // 构造用户消息
  const yaoText = Array.isArray(selectedYao) && selectedYao.length > 0
    ? selectedYao.join("\n")
    : "（未指定爻辞，请基于整体卦象解读）";

  const userMessage = `今日抽取到的卦象：${hexagramName}
卦辞：${guaCi}
相关爻辞：
${yaoText}

用户提问：${userQuestion && userQuestion.trim() ? userQuestion : "（用户未提问，请基于卦象整体给出启发）"}

请基于此卦象给出 200-300 字的哲学启发式解读。`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const resp = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        max_tokens: MAX_TOKENS,
        temperature: 0.8,
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      return new Response(JSON.stringify({ error: `DeepSeek API ${resp.status}: ${errText}` }), {
        status: 502,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const data = await resp.json();
    let interpretation = data?.choices?.[0]?.message?.content || "";

    // 后置过滤：若含禁用断言，追加提示（首版兜底）
    if (containsForbidden(interpretation)) {
      // 移除明显断言用词（简单替换）
      FORBIDDEN_PHRASES.forEach(p => {
        interpretation = interpretation.split(p).join("（此处不作吉凶断言）");
      });
    }

    // 强制附免责声明（若 AI 未附）
    const disclaimer = "以上内容仅为基于易经哲学的启发式思考，不构成任何实际建议。";
    if (!interpretation.includes(disclaimer)) {
      interpretation = `${interpretation.trim()}\n\n${disclaimer}`;
    }

    return new Response(JSON.stringify({ interpretation }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    clearTimeout(timeoutId);
    const msg = err?.name === "AbortError" ? "请求超时" : (err?.message || "未知错误");
    return new Response(JSON.stringify({ error: `AI 解读失败：${msg}` }), {
      status: 504,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
}
