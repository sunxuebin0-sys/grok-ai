import { useState } from 'react'

export default function Image() {
  const [prompt, setPrompt] = useState('')
  const [size, setSize] = useState('1024x1024')
  const [count, setCount] = useState('1')
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generate = async () => {
    if (!prompt.trim() || loading) return
    setError('')
    setLoading(true)
    setImages([])
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ prompt: prompt.trim(), size, n: parseInt(count) })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '生图失败')
      setImages(data.urls || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = async (url, idx) => {
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `grok-image-${idx + 1}.png`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {
      window.open(url, '_blank')
    }
  }

  const copyLink = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      alert('链接已复制')
    }).catch(() => {
      window.prompt('复制链接：', url)
    })
  }

  return (
    <div className="image-page">
      <div className="image-header">
        <h2>🎨 AI 生图</h2>
        <p>使用 Aurora 模型，根据文字描述生成图片</p>
      </div>

      <div className="image-form">
        <div className="form-group">
          <label>图片描述</label>
          <textarea
            rows={3}
            placeholder="描述你想要的图片，例如：一只可爱的猫咪在樱花树下玩耍，日系风格..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) generate() }}
          />
        </div>
        <div className="image-options">
          <div className="form-group">
            <label>图片尺寸</label>
            <select value={size} onChange={e => setSize(e.target.value)}>
              <option value="1024x1024">1024×1024（方形）</option>
              <option value="1792x1024">1792×1024（横版）</option>
              <option value="1024x1792">1024×1792（竖版）</option>
            </select>
          </div>
          <div className="form-group">
            <label>生成数量</label>
            <select value={count} onChange={e => setCount(e.target.value)}>
              <option value="1">1 张</option>
              <option value="2">2 张</option>
              <option value="4">4 张</option>
            </select>
          </div>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <button className="btn-primary" onClick={generate} disabled={loading || !prompt.trim()}>
          {loading ? <><span className="loading"></span>生成中...</> : '✨ 生成图片'}
        </button>
      </div>

      {loading && (
        <div className="image-loading">
          <span className="loading loading-lg"></span>
          <p>AI 正在创作，请稍候...</p>
        </div>
      )}

      {images.length > 0 && (
        <div className="image-grid">
          {images.map((url, idx) => (
            <div key={idx} className="image-item">
              <img src={url} alt={`Generated ${idx + 1}`} loading="lazy" />
              <div className="image-actions">
                <button className="btn-sm" onClick={() => downloadImage(url, idx)}>⬇️ 下载</button>
                <button className="btn-sm" onClick={() => copyLink(url)}>🔗 复制链接</button>
                <a href={url} target="_blank" rel="noreferrer" className="btn-sm">🔍 查看原图</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
