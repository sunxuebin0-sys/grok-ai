import { useState, useEffect, useRef } from 'react'
import Header from '../components/Header.jsx'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamText, setStreamText] = useState('')
  const bottomRef = useRef(null)
  const token = localStorage.getItem('token')

  useEffect(() => {
    loadHistory()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamText])

  async function loadHistory() {
    try {
      const res = await fetch('/api/history', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.messages) setMessages(data.messages)
    } catch {}
  }

  async function saveHistory(msgs) {
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: msgs }),
      })
    } catch {}
  }

  async function clearHistory() {
    try {
      await fetch('/api/history', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessages([])
    } catch {}
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setStreamText('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: newMessages }),
      })

      if (!res.ok) {
        const err = await res.json()
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `❌ 错误：${err.error}` },
        ])
        setLoading(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const json = line.slice(6).trim()
            if (json === '[DONE]') continue
            try {
              const parsed = JSON.parse(json)
              const delta = parsed.choices?.[0]?.delta?.content || ''
              fullText += delta
              setStreamText(fullText)
            } catch {}
          }
        }
      }

      const assistantMsg = { role: 'assistant', content: fullText }
      const finalMessages = [...newMessages, assistantMsg]
      setMessages(finalMessages)
      setStreamText('')
      saveHistory(finalMessages)
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '❌ 网络错误，请稍后重试' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-layout">
      <Header />
      <div className="chat-container">
        <div className="chat-main">
          <div className="chat-toolbar">
            <span className="chat-title">💬 AI 对话</span>
            <button className="btn-clear" onClick={clearHistory} disabled={loading}>
              🗑 清空对话
            </button>
          </div>
          <div className="chat-messages">
            {messages.length === 0 && !streamText && (
              <div className="chat-empty">
                <div className="chat-empty-icon">⚡</div>
                <p>你好！我是 Grok AI，有什么可以帮你的？</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'user' ? '👤' : '⚡'}
                </div>
                <div className="message-content">
                  <pre className="message-text">{msg.content}</pre>
                </div>
              </div>
            ))}
            {streamText && (
              <div className="message assistant">
                <div className="message-avatar">⚡</div>
                <div className="message-content">
                  <pre className="message-text">{streamText}<span className="cursor">▋</span></pre>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <form className="chat-input-area" onSubmit={sendMessage}>
            <textarea
              className="chat-input"
              placeholder="输入消息，Shift+Enter 换行，Enter 发送"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(e)
                }
              }}
              rows={1}
              disabled={loading}
            />
            <button type="submit" className="btn-send" disabled={loading || !input.trim()}>
              {loading ? '⏳' : '➤'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
