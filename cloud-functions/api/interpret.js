// cloud-functions/api/interpret.js
export async function onRequestPost(context) {
  const { request, env } = context;
  
  console.log('🚨🚨🚨 我被调用了！');
  
  // 1. 读取硅基流动 API Key（从环境变量获取）
  const apiKey = env.SILICONFLOW_API_KEY;
  if (!apiKey) {
    console.error('❌ SILICONFLOW_API_KEY 未配置');
    return new Response(JSON.stringify({ 
      error: 'AI_SERVICE_NOT_CONFIGURED',
      message: 'AI 服务尚未配置'
    }), { 
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  console.log('✅ API Key 存在，长度:', apiKey.length);
  
  try {
    const body = await request.json();
    const { hexagramName, guaCi, selectedYao, userQuestion } = body;
    
    console.log('📥 收到请求:', { hexagramName, userQuestion });
    
    const prompt = `你是一位深谙《周易》哲学的学者。基于${hexagramName}卦的卦辞"${guaCi}"和爻辞${selectedYao.join('；')}，针对用户问题"${userQuestion || '无'}"，给出200-300字的哲学启发式解读。严禁吉凶断言，末尾必须附："以上内容仅为基于易经哲学的启发式思考，不构成任何实际建议。"`;
    
    console.log('🚀 调用硅基流动 API，模型: deepseek-ai/DeepSeek-V4-Flash');
    
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V4-Flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 600
      })
    });
    
    console.log('📡 硅基流动响应状态:', response.status);
    
    if (!response.ok) {
      const errText = await response.text();
      console.error('❌ 硅基流动 API 错误:', errText);
      throw new Error(`API ${response.status}: ${errText}`);
    }
    
    const data = await response.json();
    let interpretation = data.choices?.[0]?.message?.content || '';
    
    if (interpretation && !interpretation.includes('不构成任何实际建议')) {
      interpretation += '\n\n以上内容仅为基于易经哲学的启发式思考，不构成任何实际建议。';
    }
    
    console.log('✅ 解读生成成功，长度:', interpretation.length);
    
    return new Response(JSON.stringify({ interpretation }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('💥 函数执行异常:', error.message);
    return new Response(JSON.stringify({ 
      interpretation: '',
      error: 'AI_SERVICE_ERROR',
      message: 'AI 解读暂时不可用，请稍后再试'
    }), { 
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}