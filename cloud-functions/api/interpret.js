// cloud-functions/api/interpret.js
export async function onRequestPost(context) {
  const { request, env } = context;
  
  console.log('🚨🚨🚨 我被调用了！');

  // 读取两个 API Key
  const deepseekApiKey = env.DEEPSEEK_API_KEY;
  const siliconflowApiKey = env.SILICONFLOW_API_KEY;

  if (!deepseekApiKey && !siliconflowApiKey) {
    console.error('❌ 未配置任何 API Key');
    return new Response(JSON.stringify({ 
      error: 'AI_SERVICE_NOT_CONFIGURED',
      message: 'AI 解读服务尚未就绪，请联系管理员配置。'
    }), { 
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { hexagramName, guaCi, selectedYao, userQuestion } = body;
    
    console.log('📥 收到请求:', { hexagramName, userQuestion });
    
    const safeYaoArray = Array.isArray(selectedYao) ? selectedYao : [];
    const yaoStr = safeYaoArray.length > 0 ? safeYaoArray.join('；') : '（无特定爻辞）';
    
    const prompt = `你是一位深谙《周易》哲学的学者。基于${hexagramName}卦的卦辞"${guaCi}"和爻辞${yaoStr}，针对用户问题"${userQuestion || '无'}"，给出200-300字的哲学启发式解读。严禁吉凶断言，末尾必须附："以上内容仅为基于易经哲学的启发式思考，不构成任何实际建议。"`;

    // 定义模型配置列表（按优先级从高到低）
    const models = [];

    if (deepseekApiKey) {
      models.push({
        name: 'DeepSeek V4 Flash',
        url: 'https://api.deepseek.com/chat/completions',
        apiKey: deepseekApiKey,
        model: 'deepseek-v4-flash',
        timeout: 25000, // 25秒超时
      });
    }

    if (siliconflowApiKey) {
      models.push({
        name: '硅基流动 Qwen3-8B',
        url: 'https://api.siliconflow.cn/v1/chat/completions',
        apiKey: siliconflowApiKey,
        model: 'Qwen/Qwen3-8B',
        timeout: 45000, // 45秒超时（免费模型可能更慢）
      });
    }

    let interpretation = '';
    let lastError = null;

    // 按顺序尝试每个模型
    for (const modelConfig of models) {
      console.log(`🚀 尝试模型: ${modelConfig.name} (超时 ${modelConfig.timeout}ms)`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), modelConfig.timeout);

      try {
        const response = await fetch(modelConfig.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${modelConfig.apiKey}`
          },
          body: JSON.stringify({
            model: modelConfig.model,
            messages: [
              { role: 'system', content: '你是一位深谙《周易》哲学的学者。' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 400,
            stream: false // 使用非流式，便于控制超时
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`⚠️ ${modelConfig.name} 返回错误: ${response.status} - ${errText}`);
          lastError = `${modelConfig.name} 错误: ${response.status}`;
          continue; // 尝试下一个模型
        }

        const data = await response.json();
        interpretation = data.choices?.[0]?.message?.content || '';

        if (interpretation) {
          console.log(`✅ ${modelConfig.name} 生成成功，长度: ${interpretation.length}`);
          break; // 成功获取结果，跳出循环
        } else {
          console.warn(`⚠️ ${modelConfig.name} 返回空内容`);
          lastError = `${modelConfig.name} 返回空内容`;
        }

      } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          console.warn(`⏰ ${modelConfig.name} 超时`);
          lastError = `${modelConfig.name} 超时`;
        } else {
          console.warn(`💥 ${modelConfig.name} 请求异常:`, err.message);
          lastError = `${modelConfig.name} 异常: ${err.message}`;
        }
        // 继续尝试下一个模型
      }
    }

    // 所有模型都失败了
    if (!interpretation) {
      console.error('❌ 所有模型均失败');
      return new Response(JSON.stringify({ 
        interpretation: '',
        error: 'AI_SERVICE_UNAVAILABLE',
        message: 'AI 解读服务暂时繁忙，请稍后再试。如持续无法使用，请关注微信公众号【绾绾wanny】获取帮助。'
     }), { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
     });
    }

    // 确保免责声明存在
    if (!interpretation.includes('不构成任何实际建议')) {
      interpretation += '\n\n以上内容仅为基于易经哲学的启发式思考，不构成任何实际建议。';
    }

    console.log('✅ 最终解读生成成功，长度:', interpretation.length);
    
    return new Response(JSON.stringify({ interpretation }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 函数执行异常:', error.message);
    return new Response(JSON.stringify({ 
      interpretation: '',
      error: 'AI_SERVICE_ERROR',
      message: 'AI 解读服务暂时异常，请稍后再试。如持续无法使用，请关注微信公众号【绾绾wanny】获取帮助。'
    }), { 
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}