import { useState } from 'react'
import Header from '../components/Header.jsx'

const SIZES = ['1024x1024', '1792x1024', '1024x1792']
const COUNTS = [1, 2, 4]

export default function ImagePage() {
  const [prompt, setPrompt] = useState('')
  const [size, setSize] = useState('1024x1024')
  const [n, setN] = useState(1)
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const token = localStorage.getItem('token')

  async function generate(e) {
    e.preventDefault()
    if (!prompt.trim() || loading) return
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt, size, n }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '生成失败')
      } else {
        setImages(data.images)
      }
    } catch {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  async function downloadImage(url, index) {
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `grok-image-${index + 1}.png`
      a.click()
    } catch {
      window.open(url, '_blank')
    }
  }

  function copyLink(url) {
    navigator.clipboard.writeText(url).then(() => {
      alert('链接已复制！')
    })
  }

  return (
    <div className="page-layout">
      <Header />
      <div className="image-container">
        <div className="image-form-panel">
          <h2 className="panel-title">🎨 AI 生图</h2>
          <form onSubmit={generate} className="image-form">
            <div className="form-group">
              <label>图片描述</label>
              <textarea
                placeholder="描述你想要的图片，例如：一只在草地上奔跑的金毛犬，阳光明媚"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>尺寸</label>
                <select value={size} onChange={e => setSize(e.target.value)}>
                  {SIZES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>数量</label>
                <select value={n} onChange={e => setN(Number(e.target.value))}>
                  {COUNTS.map(c => (
                    <option key={c} value={c}>{c} 张</option>
                  ))}
                </select>
              </div>
            </div>
            {error && <div className="auth-error">{error}</div>}
            <button type="submit" className="btn-primary" disabled={loading || !prompt.trim()}>
              {loading ? '⏳ 生成中...' : '✨ 生成图片'}
            </button>
          </form>
        </div>

        <div className="image-result-panel">
          {loading && (
            <div className="image-loading">
              <div className="spinner" />
              <p>AI 正在创作，请稍候...</p>
            </div>
          )}
          {!loading && images.length === 0 && (
            <div className="image-empty">
              <div className="image-empty-icon">🖼</div>
              <p>填写描述后点击生成图片</p>
            </div>
          )}
          <div className="image-grid">
            {images.map((url, i) => (
              <div key={i} className="image-card">
                <img src={url} alt={`Generated ${i + 1}`} />
                <div className="image-actions">
                  <button className="btn-image-action" onClick={() => downloadImage(url, i)}>
                    ⬇ 下载
                  </button>
                  <button className="btn-image-action" onClick={() => copyLink(url)}>
                    🔗 复制链接
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
