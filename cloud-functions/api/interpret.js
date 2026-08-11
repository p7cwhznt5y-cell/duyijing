// cloud-functions/api/interpret.js
export async function onRequestPost(context) {
  const { request, env } = context;
  
  console.log('🚨🚨🚨 我被调用了！');
  
  const apiKey = env.SILICONFLOW_API_KEY;
  if (!apiKey) {
    console.error('❌ SILICONFLOW_API_KEY 未配置');
    return new Response(JSON.stringify({ 
      error: 'AI_SERVICE_NOT_CONFIGURED',
      message: 'AI 服务尚未配置：缺少 SILICONFLOW_API_KEY'
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
    
    const safeYaoArray = Array.isArray(selectedYao) ? selectedYao : [];
    const yaoStr = safeYaoArray.length > 0 ? safeYaoArray.join('；') : '（无特定爻辞）';
    
    const prompt = `你是一位深谙《周易》哲学的学者。基于${hexagramName}卦的卦辞"${guaCi}"和爻辞${yaoStr}，针对用户问题"${userQuestion || '无'}"，给出200-300字的哲学启发式解读。严禁吉凶断言，末尾必须附："以上内容仅为基于易经哲学的启发式思考，不构成任何实际建议。"`;
    
    console.log('🚀 调用硅基流动 API，模型: Qwen/Qwen3-8B');
    
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen3-8B',
        messages: [
          { role: 'system', content: '你是一位深谙《周易》哲学的学者。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 600
      })
    });
    
    console.log('📡 硅基流动响应状态:', response.status);
    
    // 关键：如果 API 返回错误，直接透传错误信息，方便排查
    if (!response.ok) {
      const errText = await response.text();
      console.error('❌ 硅基流动 API 错误详情:', errText);
      return new Response(JSON.stringify({ 
        interpretation: '',
        error: 'AI_SERVICE_ERROR',
        message: `硅基流动错误: ${errText}`
      }), { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
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
      message: `函数异常: ${error.message}`
    }), { 
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}