import { useState } from 'react'

function ImageCard({ url, index }) {
  const [copied, setCopied] = useState(false)

  const handleDownload = async () => {
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `grok-ai-${Date.now()}-${index + 1}.png`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {
      window.open(url, '_blank')
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard not available */
    }
  }

  return (
    <div className="image-card">
      <div className="image-wrapper">
        <img src={url} alt={`Generated image ${index + 1}`} loading="lazy" />
      </div>
      <div className="image-actions">
        <button className="action-btn" onClick={() => window.open(url, '_blank')} title="查看原图">
          🔍 原图
        </button>
        <button className="action-btn" onClick={handleCopy} title="复制链接">
          {copied ? '✓ 已复制' : '🔗 复制'}
        </button>
        <button className="action-btn primary" onClick={handleDownload} title="下载图片">
          ⬇ 下载
        </button>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="image-card skeleton">
      <div className="image-wrapper skeleton-img" />
      <div className="image-actions">
        <div className="skeleton-btn" />
        <div className="skeleton-btn" />
        <div className="skeleton-btn" />
      </div>
    </div>
  )
}

export default function ImageGallery({ images, loading }) {
  if (loading) {
    return (
      <section className="gallery-section">
        <h2 className="section-title">
          <span className="spinner" aria-hidden="true" /> 正在生成图片...
        </h2>
        <div className="gallery-grid">
          {[1, 2].map(i => <SkeletonCard key={i} />)}
        </div>
      </section>
    )
  }

  if (!images || images.length === 0) return null

  return (
    <section className="gallery-section">
      <h2 className="section-title">✦ 生成结果 <span className="badge">{images.length} 张</span></h2>
      <div className="gallery-grid">
        {images.map((url, i) => (
          <ImageCard key={url} url={url} index={i} />
        ))}
      </div>
    </section>
  )
}
