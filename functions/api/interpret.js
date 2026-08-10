// functions/api/interpret.js

// 安全过滤：禁止词列表
const FORBIDDEN_PHRASES = [
  '自杀', '自残', '结束生命', '不想活了', '活着没意思',
  '死亡方法', '安乐死', '伤害他人', '杀人', '报复社会'
];

// 系统 Prompt：设定 AI 角色和行为边界
const SYSTEM_PROMPT = `你是一位深谙《周易》哲学的学者，精通64卦的卦辞、爻辞及其哲学内涵。你的任务是：

1. 基于用户获得的卦象和爻辞，提供哲学层面的启发式思考
2. 解读应聚焦于"变化规律"和"处世智慧"，而非预测吉凶
3. 严禁给出任何形式的命运预测、投资建议、医疗建议
4. 如果用户提到自杀、自残、抑郁等危险信号，必须优先建议寻求专业帮助
5. 回答控制在200-300字，语言平实易懂
6. 末尾必须附上免责声明`;

// 免责声明
const DISCLAIMER = "\n\n以上内容仅为基于易经哲学的启发式思考，不构成任何实际建议。";

export async function onRequestPost(context) {
  const { request, env } = context;
  
  // 1. Key 缺失检查
  if (!env.DEEPSEEK_API_KEY) {
    return new Response(JSON.stringify({ 
      error: 'AI_SERVICE_NOT_CONFIGURED',
      message: 'AI 服务尚未配置，请联系管理员'
    }), { 
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const body = await request.json();
    const { hexagramName, guaCi, selectedYao, userQuestion } = body;
    
    // 2. 安全过滤：检查用户输入是否包含禁止词
    if (userQuestion) {
      const foundForbidden = FORBIDDEN_PHRASES.some(phrase => 
        userQuestion.toLowerCase().includes(phrase)
      );
      if (foundForbidden) {
        return new Response(JSON.stringify({ 
          interpretation: '',
          error: 'SAFETY_FILTER_TRIGGERED'
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 3. 构造完整 Prompt（含 System Prompt）
    const userPrompt = `基于${hexagramName}卦的卦辞"${guaCi}"和爻辞${selectedYao.join('；')}，针对用户问题"${userQuestion || '无'}"，给出200-300字的哲学启发式解读。`;
    
    // 4. 调用 DeepSeek API（带超时控制）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
    
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-v4-pro',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 600
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`DeepSeek API returned ${response.status}`);
    }
    
    const data = await response.json();
    let interpretation = data.choices?.[0]?.message?.content || '';
    
    // 5. 强制追加免责声明
    if (interpretation && !interpretation.includes('不构成任何实际建议')) {
      interpretation += DISCLAIMER;
    }
    
    return new Response(JSON.stringify({ interpretation }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    // 6. 区分超时和其他错误
    const errorMessage = error.name === 'AbortError' 
      ? 'AI_RESPONSE_TIMEOUT' 
      : 'AI_SERVICE_ERROR';
      
    return new Response(JSON.stringify({ 
      interpretation: '',
      error: errorMessage,
      message: 'AI 解读暂时不可用，请稍后再试'
    }), { 
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
