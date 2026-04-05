import { useState } from 'react'

const SIZES = [
  { value: '1024x1024', label: '方形 1:1', icon: '⬜' },
  { value: '1792x1024', label: '横版 16:9', icon: '▬' },
  { value: '1024x1792', label: '竖版 9:16', icon: '▮' }
]

const COUNTS = [
  { value: 1, label: '1 张' },
  { value: 2, label: '2 张' },
  { value: 4, label: '4 张' }
]

export default function ImageGenerator({ onGenerate, loading }) {
  const [prompt, setPrompt] = useState('')
  const [size, setSize] = useState('1024x1024')
  const [count, setCount] = useState(1)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!prompt.trim() || loading) return
    onGenerate({ prompt: prompt.trim(), size, count })
  }

  const charCount = prompt.length
  const maxChars = 2000

  return (
    <section className="generator-card">
      <form onSubmit={handleSubmit}>
        <div className="prompt-area">
          <label className="field-label" htmlFor="prompt">描述你想要的图片</label>
          <textarea
            id="prompt"
            className="prompt-input"
            placeholder="例如：一只可爱的橘猫坐在樱花树下，日落时分，电影感光线，超高清..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={4}
            maxLength={maxChars}
            disabled={loading}
          />
          <div className="char-count">{charCount}/{maxChars}</div>
        </div>

        <div className="options-row">
          <div className="option-group">
            <label className="field-label">图片尺寸</label>
            <div className="size-buttons">
              {SIZES.map(s => (
                <button
                  key={s.value}
                  type="button"
                  className={`size-btn${size === s.value ? ' active' : ''}`}
                  onClick={() => setSize(s.value)}
                  disabled={loading}
                >
                  <span className="size-icon">{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="option-group">
            <label className="field-label">生成数量</label>
            <div className="count-buttons">
              {COUNTS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  className={`count-btn${count === c.value ? ' active' : ''}`}
                  onClick={() => setCount(c.value)}
                  disabled={loading}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="generate-btn"
          disabled={!prompt.trim() || loading}
        >
          {loading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              生成中...
            </>
          ) : (
            <>
              <span>✦</span>
              生成图片
            </>
          )}
        </button>
      </form>
    </section>
  )
}
