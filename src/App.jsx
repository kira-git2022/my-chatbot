import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT_DEFAULT = "You are a helpful, intelligent, and friendly AI assistant. Answer clearly and concisely.";

const GLOBAL_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body, html { height: 100%; overflow: hidden; }

  @keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
    40% { transform: translateY(-6px); opacity: 1; }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
  @keyframes overlayIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

  textarea::placeholder { color: #475569; }
  textarea, button { -webkit-tap-highlight-color: transparent; }

  .app-container {
    display: flex;
    height: 100vh;
    height: 100dvh;
    background: #0f1117;
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    color: #e2e8f0;
    overflow: hidden;
    position: relative;
  }

  .sidebar {
    width: 260px;
    background: rgba(255,255,255,0.03);
    border-right: 1px solid rgba(255,255,255,0.06);
    display: flex;
    flex-direction: column;
    padding: 20px 16px;
    gap: 20px;
    flex-shrink: 0;
    overflow-y: auto;
  }

  .chat-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .chat-header {
    padding: 14px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 24px 28px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    -webkit-overflow-scrolling: touch;
  }

  .chat-input-area {
    padding: 12px 16px 16px;
    border-top: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.01);
    flex-shrink: 0;
  }

  .input-box {
    display: flex;
    gap: 10px;
    align-items: flex-end;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    padding: 10px 10px 10px 14px;
    transition: border-color 0.15s;
  }
  .input-box:focus-within { border-color: rgba(99,102,241,0.5); }

  .message-row {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    animation: fadeIn 0.3s ease;
  }
  .message-row.user { flex-direction: row-reverse; }

  .message-bubble {
    border-radius: 18px;
    padding: 11px 15px;
    font-size: 14.5px;
    line-height: 1.65;
    white-space: pre-wrap;
    word-break: break-word;
    max-width: 72%;
  }
  .message-bubble.user {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 18px 4px 18px 18px;
    color: #fff;
  }
  .message-bubble.assistant {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 4px 18px 18px 18px;
    color: #e2e8f0;
  }

  .menu-btn { display: none; }

  .drawer-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    z-index: 50;
    animation: overlayIn 0.2s ease;
  }
  .drawer {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    background: #161b27;
    border-radius: 20px 20px 0 0;
    border-top: 1px solid rgba(255,255,255,0.08);
    z-index: 51;
    padding: 0 20px 40px;
    max-height: 85vh;
    overflow-y: auto;
    animation: slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);
    -webkit-overflow-scrolling: touch;
  }
  .drawer-handle {
    width: 36px; height: 4px;
    background: rgba(255,255,255,0.15);
    border-radius: 2px;
    margin: 14px auto 20px;
  }

  .suggestions-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    width: 100%;
    max-width: 380px;
    margin-top: 4px;
  }

  /* TABLET */
  @media (min-width: 641px) and (max-width: 1024px) {
    .sidebar { width: 220px; }
    .chat-messages { padding: 20px 22px; }
    .message-bubble { max-width: 78%; }
  }

  /* MOBILE */
  @media (max-width: 640px) {
    .sidebar { display: none; }

    .menu-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px; height: 36px;
      background: transparent;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      cursor: pointer;
      color: #94a3b8;
      flex-shrink: 0;
    }

    .chat-messages { padding: 14px 12px; gap: 12px; }
    .chat-header { padding: 11px 12px; }
    .chat-input-area { padding: 8px 10px 18px; }

    .message-bubble {
      max-width: 86%;
      font-size: 14px;
      padding: 10px 13px;
    }

    .suggestions-grid {
      grid-template-columns: 1fr 1fr;
      max-width: 100%;
    }

    .welcome-icon { width: 52px !important; height: 52px !important; border-radius: 14px !important; }
    .welcome-title { font-size: 18px !important; }
    .welcome-desc { font-size: 13px !important; }
  }
`;

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "3px 2px" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%", background: "#94a3b8",
          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

function Avatar({ role }) {
  if (role === "user") {
    return (
      <div style={{
        width: 30, height: 30, borderRadius: "50%",
        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 600, color: "#fff", flexShrink: 0,
      }}>U</div>
    );
  }
  return (
    <div style={{
      width: 30, height: 30, borderRadius: "50%",
      background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
      </svg>
    </div>
  );
}

function SidebarContent({ systemPrompt, setSystemPrompt, onClear, messageCount, onClose }) {
  const [draft, setDraft] = useState(systemPrompt);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, height: "100%" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>AI Chatbot</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>Powered by GPT-4o</div>
          </div>
        </div>

        <button
          onClick={() => { onClear(); onClose?.(); }}
          style={{
            width: "100%", padding: "9px 14px", background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
            color: "#94a3b8", fontSize: 13, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          New Conversation
        </button>
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
          System Prompt
        </div>
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={() => setSystemPrompt(draft)}
          rows={5}
          style={{
            width: "100%", background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10,
            color: "#cbd5e1", fontSize: 13, lineHeight: 1.6,
            padding: "10px 12px", resize: "vertical", fontFamily: "inherit", outline: "none",
          }}
          placeholder="Define the AI's personality..."
        />
        <div style={{ fontSize: 11, color: "#475569", marginTop: 6 }}>
          Changes apply to new conversations
        </div>
      </div>

      <div style={{ marginTop: "auto" }}>
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 10, padding: "12px 14px",
        }}>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Messages this session</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#e2e8f0" }}>{messageCount}</div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [systemPrompt, setSystemPrompt] = useState(SYSTEM_PROMPT_DEFAULT);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          max_tokens: 1000,
          messages: [
            { role: "system", content: systemPrompt },
            ...newMessages.map(m => ({ role: m.role, content: m.content })),
          ],
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "API error");
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "(No response)";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKey = e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => { setMessages([]); setError(null); };

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <div className="app-container">

        {/* Desktop sidebar */}
        <div className="sidebar">
          <SidebarContent
            systemPrompt={systemPrompt}
            setSystemPrompt={setSystemPrompt}
            onClear={clearChat}
            messageCount={messages.length}
          />
        </div>

        {/* Mobile bottom drawer */}
        {drawerOpen && (
          <>
            <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />
            <div className="drawer">
              <div className="drawer-handle" />
              <SidebarContent
                systemPrompt={systemPrompt}
                setSystemPrompt={setSystemPrompt}
                onClear={clearChat}
                messageCount={messages.length}
                onClose={() => setDrawerOpen(false)}
              />
            </div>
          </>
        )}

        {/* Main chat area */}
        <div className="chat-area">

          {/* Header */}
          <div className="chat-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button className="menu-btn" onClick={() => setDrawerOpen(true)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9" }}>Chat</div>
                <div style={{ fontSize: 11, color: "#475569" }}>GPT-4o</div>
              </div>
            </div>
            <div style={{
              fontSize: 12, padding: "4px 10px",
              background: loading ? "rgba(234,179,8,0.15)" : "rgba(34,197,94,0.1)",
              border: `1px solid ${loading ? "rgba(234,179,8,0.3)" : "rgba(34,197,94,0.2)"}`,
              borderRadius: 20, color: loading ? "#eab308" : "#22c55e",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: loading ? "#eab308" : "#22c55e",
                animation: loading ? "bounce 1s infinite" : "none",
              }} />
              {loading ? "Thinking..." : "Ready"}
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.length === 0 && (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", flex: 1, gap: 14,
                animation: "fadeIn 0.5s ease", textAlign: "center",
              }}>
                <div className="welcome-icon" style={{
                  width: 60, height: 60, borderRadius: 16,
                  background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 36px rgba(99,102,241,0.25)",
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div>
                  <div className="welcome-title" style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>
                    Start a Conversation
                  </div>
                  <div className="welcome-desc" style={{ fontSize: 14, color: "#475569", maxWidth: 300, lineHeight: 1.7, margin: "0 auto" }}>
                    Ask me anything — writing, coding, analysis, brainstorming and more.
                  </div>
                </div>
                <div className="suggestions-grid">
                  {["Explain quantum computing", "Write a short story", "Help me debug code", "Give me a recipe idea"].map(s => (
                    <button
                      key={s}
                      onClick={() => { setInput(s); inputRef.current?.focus(); }}
                      style={{
                        padding: "10px 12px", borderRadius: 12,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#94a3b8", fontSize: 12.5, cursor: "pointer",
                        textAlign: "left", lineHeight: 1.4,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`message-row ${msg.role}`}>
                <Avatar role={msg.role} />
                <div className={`message-bubble ${msg.role}`}>{msg.content}</div>
              </div>
            ))}

            {loading && (
              <div className="message-row assistant">
                <Avatar role="assistant" />
                <div className="message-bubble assistant"><TypingDots /></div>
              </div>
            )}

            {error && (
              <div style={{
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: 12, padding: "11px 14px", color: "#fca5a5", fontSize: 13,
                display: "flex", gap: 8, alignItems: "flex-start",
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span><strong>Error:</strong> {error}</span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="chat-input-area">
            <div className="input-box">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Message... (Enter to send)"
                rows={1}
                style={{
                  flex: 1, background: "transparent", border: "none",
                  color: "#e2e8f0", fontSize: 14.5, lineHeight: 1.6,
                  resize: "none", outline: "none", fontFamily: "inherit",
                  maxHeight: 120, overflowY: "auto",
                }}
                onInput={e => {
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                style={{
                  width: 36, height: 36, borderRadius: 10, border: "none",
                  background: loading || !input.trim()
                    ? "rgba(99,102,241,0.2)"
                    : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "all 0.15s",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
            <div style={{ textAlign: "center", fontSize: 11, color: "#2d3748", marginTop: 8 }}>
              Powered by GPT-4o · OpenAI API
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
