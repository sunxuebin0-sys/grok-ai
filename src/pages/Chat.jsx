import { useState, useEffect, useRef } from 'react'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    const saved = localStorage.getItem('chat_history')
    if (saved) setMessages(JSON.parse(saved))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    if (messages.length) localStorage.setItem('chat_history', JSON.stringify(messages))
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    const assistantMsg = { role: 'assistant', content: '' }
    setMessages(prev => [...prev, assistantMsg])

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ messages: newMessages })
      })
      if (!res.ok) throw new Error('请求失败')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const d = line.slice(6)
            if (d === '[DONE]') break
            try {
              const json = JSON.parse(d)
              const delta = json.choices?.[0]?.delta?.content || ''
              full += delta
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: full }
                return updated
              })
            } catch {}
          }
        }
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: '❌ 请求失败：' + err.message }
        return updated
      })
    } finally {
      setLoading(false)
    }
  }

  const clearHistory = () => {
    setMessages([])
    localStorage.removeItem('chat_history')
  }

  return (
    <div className="chat-page">
      <div className="chat-header">
        <h2>💬 AI 聊天</h2>
        <button className="btn-ghost" onClick={clearHistory}>🗑️ 清空记录</button>
      </div>
      <div className="chat-messages">
        {messages.length === 0 && <div className="chat-empty">👋 你好！我是 Grok AI，有什么可以帮你的？</div>}
        {messages.map((msg, i) => (
          <div key={i} className={`msg ${msg.role}`}> 
            <div className="msg-avatar">{msg.role === 'user' ? '👤' : '🤖'}</div>
            <div className="msg-content">{msg.content}{loading && i === messages.length - 1 && msg.role === 'assistant' && <span className="cursor">▋</span>}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input-area">
        <textarea rows={2} placeholder="输入消息，按 Enter 发送，Shift+Enter 换行..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
        />
        <button className="btn-send" onClick={sendMessage} disabled={loading}>
          {loading ? <span className="loading"></span> : '发送'}
        </button>
      </div>
    </div>
  )
}