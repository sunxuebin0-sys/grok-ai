export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: GROK_API_KEY is not set' });
  }

  const { prompt, size = '1024x1024', n = 1 } = req.body || {};

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (prompt.trim().length > 2000) {
    return res.status(400).json({ error: 'Prompt is too long (max 2000 characters)' });
  }

  const validSizes = ['1024x1024', '1792x1024', '1024x1792'];
  if (!validSizes.includes(size)) {
    return res.status(400).json({ error: 'Invalid size. Must be one of: ' + validSizes.join(', ') });
  }

  const validCounts = [1, 2, 4];
  const count = parseInt(n, 10);
  if (!validCounts.includes(count)) {
    return res.status(400).json({ error: 'Invalid count. Must be 1, 2, or 4' });
  }

  try {
    const response = await fetch('https://api.x.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'grok-2-image',
        prompt: prompt.trim(),
        n: count,
        size
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData?.error?.message || `API request failed with status ${response.status}`;

      if (response.status === 429) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please wait a moment before trying again.' });
      }

      return res.status(response.status).json({ error: message });
    }

    const data = await response.json();
    const urls = (data.data || []).map(item => item.url).filter(Boolean);
    return res.status(200).json({ urls });
  } catch (err) {
    console.error('Image generation error:', err);
    return res.status(500).json({ error: 'Failed to generate image. Please try again.' });
  }
}
