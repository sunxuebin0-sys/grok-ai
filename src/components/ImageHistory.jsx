import { useState } from 'react'

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function sanitizeUrl(url) {
  if (typeof url !== 'string') return ''
  const trimmed = url.trim()
  return trimmed.startsWith('https://') ? trimmed : ''
}

export default function ImageHistory({ history, onClear }) {
  const [expanded, setExpanded] = useState(false)

  if (!history || history.length === 0) return null

  return (
    <section className="history-section">
      <div className="history-header" onClick={() => setExpanded(prev => !prev)}>
        <h2 className="section-title">
          🕐 历史记录 <span className="badge">{history.length}</span>
        </h2>
        <button className="collapse-btn" aria-label={expanded ? '折叠' : '展开'}>
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {expanded && (
        <div className="history-body">
          <div className="history-actions">
            <button className="clear-btn" onClick={onClear}>🗑 清空历史</button>
          </div>
          <div className="history-list">
            {history.map(entry => (
              <div key={entry.id} className="history-entry">
                <div className="history-meta">
                  <span className="history-prompt">{entry.prompt}</span>
                  <span className="history-info">{entry.size} · {entry.count} 张 · {formatDate(entry.createdAt)}</span>
                </div>
                <div className="history-thumbs">
                  {entry.urls.map((url, i) => {
                    const safeUrl = sanitizeUrl(url)
                    if (!safeUrl) return null
                    return (
                      <a key={i} href={safeUrl} target="_blank" rel="noopener noreferrer" className="history-thumb">
                        <img src={safeUrl} alt={`History ${i + 1}`} loading="lazy" />
                      </a>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
