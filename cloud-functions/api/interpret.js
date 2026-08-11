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
    
    console.log('🚀 调用硅基流动 API（流式），模型: Qwen/Qwen3-8B');
    
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
        max_tokens: 400,  // 降低输出长度，减少生成时间
        stream: true       // 关键：启用流式输出，避免 504 超时
      })
    });
    
    console.log('📡 硅基流动响应状态:', response.status);
    
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
    
    // 解析 SSE 流式响应，拼接完整文本
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let interpretation = '';
    let buffer = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const dataStr = trimmed.slice(5).trim();
        if (dataStr === '[DONE]') continue;
        
        try {
          const json = JSON.parse(dataStr);
          const delta = json.choices?.[0]?.delta?.content || '';
          interpretation += delta;
        } catch (e) {
          // 忽略解析错误，继续处理下一行
        }
      }
    }
    
    // 确保 disclaimer 存在
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