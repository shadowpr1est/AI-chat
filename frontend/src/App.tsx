import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import './App.css'

const BACKEND_URL = 'http://localhost:8000'; // поменяй на свой адрес при деплое

const assistants = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'gemini', label: 'Gemini' },
]

function App() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{role: string, content: string}[]>([])
  const [assistant, setAssistant] = useState('openai')
  const [loading, setLoading] = useState(false)
  const chatWindowRef = useRef<HTMLDivElement>(null)

  // Загрузка истории при смене ассистента
  useEffect(() => {
    setMessages([])
    fetch(`${BACKEND_URL}/history/${assistant}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(data.map((msg: any) => ({ role: msg.role, content: msg.content })))
        }
      })
  }, [assistant])

  // Прокрутка вниз при новом сообщении
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, loading])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    setMessages(msgs => [...msgs, { role: 'user', content: input }])
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, assistant }),
      })
      const data = await res.json()
      setMessages(msgs => [...msgs, { role: 'assistant', content: data.content }])
    } catch (err) {
      setMessages(msgs => [...msgs, { role: 'assistant', content: 'Ошибка соединения с сервером.' }])
    } finally {
      setLoading(false)
      setInput('')
    }
  }

  return (
    <div className="chatgpt-app chatgpt-app-modern">
      <header className="chatgpt-header chatgpt-header-modern">
        <span className="chatgpt-logo">🤖</span> AI Chat
        <select value={assistant} onChange={e => setAssistant(e.target.value)} className="chatgpt-select">
          {assistants.map(a => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>
      </header>
      <div ref={chatWindowRef} className="chatgpt-chat-window chatgpt-chat-window-modern">
        {messages.length === 0 && (
          <div className="chatgpt-message assistant">
            <div className="chatgpt-avatar">🤖</div>
            <div className="chatgpt-bubble chatgpt-bubble-modern">Начните диалог с {assistants.find(a => a.value === assistant)?.label}</div>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`chatgpt-message ${msg.role}`}> 
            <div className="chatgpt-avatar">{msg.role === 'user' ? '🧑' : '🤖'}</div>
            {msg.role === 'assistant' ? (
              <div className={`chatgpt-bubble chatgpt-bubble-modern ${msg.role} chatgpt-markdown`}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            ) : (
              <div className={`chatgpt-bubble chatgpt-bubble-modern ${msg.role}`}>{msg.content}</div>
            )}
          </div>
        ))}
        {loading && (
          <div className="chatgpt-message assistant">
            <div className="chatgpt-avatar">🤖</div>
            <div className="chatgpt-bubble chatgpt-bubble-modern">Печатает...</div>
          </div>
        )}
      </div>
      <form className="chatgpt-input-bar chatgpt-input-bar-modern" onSubmit={sendMessage}>
        <input
          className="chatgpt-input chatgpt-input-modern"
          type="text"
          placeholder="Введите сообщение..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button className="chatgpt-send-btn chatgpt-send-btn-modern" type="submit" disabled={loading || !input.trim()}>Отправить</button>
      </form>
    </div>
  )
}

export default App
