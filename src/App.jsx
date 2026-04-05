import { useState, useEffect } from 'react'
import ImageGenerator from './components/ImageGenerator.jsx'
import ImageGallery from './components/ImageGallery.jsx'
import ImageHistory from './components/ImageHistory.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const [images, setImages] = useState([])
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('imageHistory') || '[]')
    } catch {
      return []
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const handleGenerate = async ({ prompt, size, count }) => {
    setLoading(true)
    setError('')
    setImages([])

    try {
      const res = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, size, n: count })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '生成失败，请稍后重试')
        return
      }

      const newImages = data.urls || []
      setImages(newImages)

      if (newImages.length > 0) {
        const entry = {
          id: Date.now(),
          prompt,
          size,
          count,
          urls: newImages,
          createdAt: new Date().toISOString()
        }
        const updated = [entry, ...history].slice(0, 50)
        setHistory(updated)
        localStorage.setItem('imageHistory', JSON.stringify(updated))
      }
    } catch {
      setError('网络错误，请检查连接后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleClearHistory = () => {
    setHistory([])
    localStorage.removeItem('imageHistory')
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">✦</span>
            <span className="logo-text">Grok AI 图片生成器</span>
          </div>
          <ThemeToggle theme={theme} onToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />
        </div>
      </header>

      <main className="app-main">
        <div className="hero">
          <h1 className="hero-title">
            <span className="gradient-text">AI 图片生成</span>
          </h1>
          <p className="hero-subtitle">输入创意描述，让 Grok AI 为你生成精美图片</p>
        </div>

        <ImageGenerator onGenerate={handleGenerate} loading={loading} />

        {error && (
          <div className="error-banner" role="alert">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {(loading || images.length > 0) && (
          <ImageGallery images={images} loading={loading} />
        )}

        <ImageHistory history={history} onClear={handleClearHistory} />
      </main>

      <footer className="app-footer">
        <p>Powered by <a href="https://x.ai" target="_blank" rel="noopener noreferrer">xAI Grok</a></p>
      </footer>
    </div>
  )
}
