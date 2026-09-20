import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react'
import { sendMessage, resetChat, ChatMessage } from './services/gemini'

const SUGGESTIONS = [
  '🚗 My car makes a grinding noise when I brake',
  '💡 Check engine light is on, what should I do?',
  '🌡️ My car overheats after 20 minutes of driving',
  '🔋 Car won\'t start in the morning, battery seems fine',
]

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

function renderText(text: string) {
  // Basic markdown-like bold formatting
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: msg,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError('')

    // Auto-resize textarea back
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      const response = await sendMessage(msg)
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (err) {
      console.error(err)
      setError('⚠️ Could not connect to MechMate AI. Check your API key in .env file.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    // Auto-resize
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const handleReset = () => {
    resetChat()
    setMessages([])
    setError('')
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo">🔧</div>
          <div className="header-title">
            <h1>MechMate</h1>
            <p>AI Car Problem Solver</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {messages.length > 0 && (
            <button className="reset-btn" onClick={handleReset}>
              🔄 New Chat
            </button>
          )}
          <div className="status-badge">
            <div className="status-dot" />
            Online
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="chat-area">
        {messages.length === 0 ? (
          <div className="welcome">
            <div className="welcome-icon">🚗</div>
            <h2>What's wrong with your car?</h2>
            <p>
              Describe your car problem in simple words — MechMate will diagnose it,
              explain what's wrong, and tell you how to fix it.
            </p>
            <div className="suggestions">
              <div className="suggestion-label">Try asking:</div>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  className="suggestion-btn"
                  onClick={() => handleSend(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`message-wrapper ${msg.role === 'user' ? 'user' : 'ai'}`}
              >
                <div className={`avatar ${msg.role === 'user' ? 'user' : 'ai'}`}>
                  {msg.role === 'user' ? 'SK' : '🔧'}
                </div>
                <div>
                  <div className={`message-bubble ${msg.role === 'user' ? 'user' : 'ai'}`}>
                    {msg.role === 'assistant'
                      ? msg.content.split('\n').map((line, i) => (
                          <span key={i}>
                            {renderText(line)}
                            {i < msg.content.split('\n').length - 1 && <br />}
                          </span>
                        ))
                      : msg.content}
                  </div>
                  <div className="message-time">{formatTime(msg.timestamp)}</div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="message-wrapper ai">
                <div className="avatar ai">🔧</div>
                <div className="typing-indicator">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="input-area">
        {error && <div className="error-msg">{error}</div>}
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            className="message-input"
            placeholder="Describe your car problem... (e.g. 'my brakes squeak when I slow down')"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={loading}
          />
          <button
            className="send-btn"
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            title="Send"
          >
            ➤
          </button>
        </div>
        <div className="input-hint">Press Enter to send · Shift+Enter for new line</div>
      </div>
    </div>
  )
}
