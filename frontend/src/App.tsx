import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import './App.css'
import { FaPlus, FaSearch, FaCog, FaRegPaperPlane } from 'react-icons/fa'

const BACKEND_URL = 'http://localhost:8000';

const assistants = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'gemini', label: 'Gemini' },
]

interface Chat {
  id: string;
  title: string;
  assistant: string;
  messages: {role: string, content: string}[];
}

function App() {
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string>('')
  const [input, setInput] = useState('')
  const [assistant, setAssistant] = useState('openai')
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const chatWindowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`${BACKEND_URL}/chats`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setChats(data)
          if (data.length > 0 && !currentChatId) {
            setCurrentChatId(data[0].id)
          }
          if (data.length === 0) {
            createNewChat()
          }
        }
      })
  }, [])

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [chats, loading])

  const currentChat = chats.find(chat => chat.id === currentChatId)

  const createNewChat = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat', assistant })
      })
      if (!res.ok) throw new Error('Failed to create chat')
      const chat = await res.json()
      setChats(prev => [...prev, chat])
      setCurrentChatId(chat.id)
      setInput('')
    } catch (err) {
      alert('Failed to create chat: ' + (err instanceof Error ? err.message : err))
    }
  }

  const deleteChat = async (chatId: string) => {
    try {
      await fetch(`${BACKEND_URL}/chats/${chatId}`, { method: 'DELETE' })
      setChats(prev => {
        const idx = prev.findIndex(chat => chat.id === chatId)
        const newChats = prev.filter(chat => chat.id !== chatId)
        if (currentChatId === chatId) {
          // Открыть следующий чат, если есть, иначе предыдущий, иначе пусто
          if (newChats.length > 0) {
            const nextIdx = idx < newChats.length ? idx : newChats.length - 1
            setCurrentChatId(newChats[nextIdx].id)
          } else {
            setCurrentChatId('')
          }
        }
        return newChats
      })
    } catch (err) {
      alert('Failed to delete chat: ' + (err instanceof Error ? err.message : err))
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !currentChat) return
    const updatedChat = {
      ...currentChat,
      messages: [...currentChat.messages, { role: 'user', content: input }]
    }
    setChats(prev => prev.map(chat => chat.id === currentChatId ? updatedChat : chat))
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, assistant, chatId: currentChatId }),
      })
      if (!res.ok) throw new Error('Server error')
      const data = await res.json()
      setChats(prev => prev.map(chat => chat.id === currentChatId ? {
        ...chat,
        messages: [...chat.messages, { role: 'assistant', content: data.content }],
        title: chat.messages.length === 0 ? input.slice(0, 30) + '...' : chat.title
      } : chat))
    } catch (err) {
      alert('Failed to send message: ' + (err instanceof Error ? err.message : err))
      setChats(prev => prev.map(chat => chat.id === currentChatId ? {
        ...chat,
        messages: [...chat.messages, { role: 'assistant', content: 'Connection error.' }]
      } : chat))
    } finally {
      setLoading(false)
      setInput('')
    }
  }

  // Фильтрация чатов по поиску
  const filteredChats = chats.filter(chat => chat.title.toLowerCase().includes(search.toLowerCase()))

  // Получить ассистента текущего чата или выбранного
  const currentAssistant = currentChat ? assistants.find(a => a.value === currentChat.assistant) : assistants.find(a => a.value === assistant)

  return (
    <div className="cbui-root">
      {/* Sidebar */}
      <aside className="cbui-sidebar">
        <div className="cbui-sidebar-header">
          <select className="cbui-workspace-select" disabled>
            <option>Select workspace...</option>
          </select>
        </div>
        <button className="cbui-new-chat-btn" onClick={createNewChat}><FaPlus /> New Chat</button>
        <div className="cbui-search-box">
          <FaSearch className="cbui-search-icon" />
          <input
            className="cbui-search-input"
            type="text"
            placeholder="Search chats..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="cbui-chat-list">
          {filteredChats.length === 0 && <div className="cbui-no-chats">No chats.</div>}
          {filteredChats.map(chat => (
            <div
              key={chat.id}
              className={`cbui-chat-item${currentChatId === chat.id ? ' active' : ''}`}
              onClick={() => setCurrentChatId(chat.id)}
            >
              <span className="cbui-chat-title">{chat.title}</span>
              <button
                className="cbui-delete-chat-btn"
                onClick={e => { e.stopPropagation(); deleteChat(chat.id) }}
                title="Delete chat"
              >×</button>
            </div>
          ))}
        </div>
      </aside>
      {/* Main panel */}
      <main className="cbui-main">
        <header className="cbui-main-header">
          <div className="cbui-main-title">Quick Settings <FaCog className="cbui-cog" /></div>
          <div className="cbui-main-model">
            <select
              className="cbui-assistant-select"
              value={assistant}
              onChange={e => setAssistant(e.target.value)}
              style={{background:'#23242b', color:'#fff', border:'1px solid #23242b', borderRadius:'7px', padding:'0.3em 0.7em', fontSize:'1em'}}
            >
              {assistants.map(a => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>
        </header>
        <div ref={chatWindowRef} className="cbui-chat-window">
          {(!currentChat || currentChat.messages.length === 0) ? (
            <div className="cbui-center-welcome">
              <div className="cbui-logo">UI</div>
              <div className="cbui-welcome-title">Chatbot UI</div>
              <div style={{marginTop:'1.5em', color:'#888', fontSize:'1.1em'}}>Current AI: <b>{currentAssistant?.label}</b></div>
            </div>
          ) : (
            currentChat.messages.map((msg, idx) => (
              <div key={idx} className={`cbui-message ${msg.role}`}>
                <div className="cbui-avatar">{msg.role === 'user' ? '🧑' : '🤖'}</div>
                <div className="cbui-bubble">
                  {msg.role === 'assistant' ? <ReactMarkdown>{msg.content}</ReactMarkdown> : msg.content}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="cbui-message assistant">
              <div className="cbui-avatar">🤖</div>
              <div className="cbui-bubble">
                <div className="cbui-typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
        </div>
        <form className="cbui-input-bar" onSubmit={sendMessage}>
          <input
            className="cbui-input"
            type="text"
            placeholder="Send a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading || !currentChat}
          />
          <button
            className="cbui-send-btn"
            type="submit"
            disabled={loading || !input.trim() || !currentChat}
            title="Send"
          >
            <FaRegPaperPlane />
          </button>
        </form>
      </main>
    </div>
  )
}

export default App
