export default async function handler(req, res) {
  // 只允许 POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 跨域头（允许任意前端访问）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    // 调用豆包 API（Key 安全存在 Vercel 环境变量里）
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DOUBAO_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.DOUBAO_MODEL_ID || 'doubao-seed-1-8-251228',
        messages: [
          {
            role: 'system',
            content: '你是家庭厨师顾问，只返回JSON，不要任何其他文字。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.8
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('豆包 API 错误:', data);
      return res.status(500).json({ error: data.error?.message || '生成失败' });
    }

    const text = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ text });

  } catch (err) {
    console.error('服务器错误:', err);
    return res.status(500).json({ error: '服务器错误，请稍后再试' });
  }
}
