import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const SYSTEM_PROMPT_DEFAULT =
  "You are a helpful, intelligent, and friendly AI assistant. Answer clearly and concisely.";
const STORAGE_KEY = "chatbot_v1_messages";
const MODELS = [
  { id: "gpt-4o", label: "GPT-4o" },
  { id: "gpt-4o-mini", label: "GPT-4o mini" },
  { id: "gpt-4-turbo", label: "GPT-4 Turbo" },
];

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
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

  textarea::placeholder { color: #475569; }
  textarea, button, select { -webkit-tap-highlight-color: transparent; }

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
    gap: 22px;
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

  /* Message row */
  .message-row {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    animation: fadeIn 0.3s ease;
  }
  .message-row.user { flex-direction: row-reverse; }

  .message-col {
    display: flex;
    flex-direction: column;
    gap: 5px;
    max-width: 72%;
  }
  .message-row.user .message-col { align-items: flex-end; }
  .message-row.assistant .message-col { align-items: flex-start; }

  .message-bubble {
    border-radius: 18px;
    padding: 11px 15px;
    font-size: 14.5px;
    line-height: 1.65;
    word-break: break-word;
  }
  .message-bubble.user {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 18px 4px 18px 18px;
    color: #fff;
    white-space: pre-wrap;
  }
  .message-bubble.assistant {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 4px 18px 18px 18px;
    color: #e2e8f0;
  }

  /* Markdown inside assistant bubbles */
  .message-bubble.assistant p { margin: 0 0 8px; }
  .message-bubble.assistant p:last-child { margin-bottom: 0; }
  .message-bubble.assistant ul,
  .message-bubble.assistant ol { padding-left: 20px; margin: 4px 0 8px; }
  .message-bubble.assistant li { margin: 3px 0; }
  .message-bubble.assistant h1,
  .message-bubble.assistant h2,
  .message-bubble.assistant h3 { color: #f1f5f9; font-weight: 600; margin: 10px 0 5px; }
  .message-bubble.assistant h1 { font-size: 17px; }
  .message-bubble.assistant h2 { font-size: 15.5px; }
  .message-bubble.assistant h3 { font-size: 14.5px; }
  .message-bubble.assistant code {
    background: rgba(255,255,255,0.1);
    border-radius: 4px;
    padding: 1px 5px;
    font-family: ui-monospace, Consolas, monospace;
    font-size: 13px;
    color: #e2e8f0;
  }
  .message-bubble.assistant pre { margin: 8px 0; }
  .message-bubble.assistant blockquote {
    border-left: 3px solid rgba(99,102,241,0.5);
    padding-left: 12px;
    margin: 8px 0;
    color: #94a3b8;
    font-style: italic;
  }
  .message-bubble.assistant table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 13px; }
  .message-bubble.assistant th {
    background: rgba(255,255,255,0.08);
    padding: 6px 10px;
    text-align: left;
    border: 1px solid rgba(255,255,255,0.1);
  }
  .message-bubble.assistant td { padding: 6px 10px; border: 1px solid rgba(255,255,255,0.08); }
  .message-bubble.assistant a { color: #818cf8; text-decoration: underline; }
  .message-bubble.assistant strong { color: #f1f5f9; }

  /* Streaming cursor */
  .streaming-cursor {
    display: inline-block;
    width: 2px;
    height: 14px;
    background: #94a3b8;
    margin-left: 2px;
    vertical-align: text-bottom;
    animation: pulse 0.8s ease-in-out infinite;
  }

  /* Per-message copy button */
  .msg-copy-btn {
    opacity: 0;
    transition: opacity 0.15s;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px;
    color: #64748b;
    font-size: 11px;
    padding: 3px 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: inherit;
    white-space: nowrap;
  }
  .msg-copy-btn:hover { color: #94a3b8; background: rgba(255,255,255,0.08); }
  .message-row:hover .msg-copy-btn { opacity: 1; }

  /* Code block */
  .code-block {
    border-radius: 8px;
    overflow: hidden;
    margin: 8px 0;
    border: 1px solid rgba(255,255,255,0.08);
  }
  .code-block-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px;
    background: rgba(255,255,255,0.05);
    font-family: ui-monospace, Consolas, monospace;
    font-size: 12px;
    color: #64748b;
  }
  .code-copy-btn {
    background: transparent;
    border: none;
    color: #64748b;
    cursor: pointer;
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 4px;
    transition: color 0.15s, background 0.15s;
    font-family: inherit;
  }
  .code-copy-btn:hover { color: #94a3b8; background: rgba(255,255,255,0.06); }

  /* Model select */
  .model-select {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    color: #cbd5e1;
    font-size: 13px;
    padding: 8px 10px;
    outline: none;
    cursor: pointer;
    font-family: inherit;
  }
  .model-select option { background: #161b27; }

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
  .suggestion-btn {
    padding: 10px 12px;
    border-radius: 12px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    color: #94a3b8;
    font-size: 12.5px;
    cursor: pointer;
    text-align: left;
    line-height: 1.4;
    transition: background 0.15s, border-color 0.15s;
    font-family: inherit;
  }
  .suggestion-btn:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.15); }

  /* TABLET */
  @media (min-width: 641px) and (max-width: 1024px) {
    .sidebar { width: 220px; }
    .chat-messages { padding: 20px 22px; }
    .message-col { max-width: 78%; }
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

    .chat-messages { padding: 14px 12px; gap: 14px; }
    .chat-header { padding: 11px 12px; }
    .chat-input-area { padding: 8px 10px 18px; }

    .message-col { max-width: 86%; }
    .message-bubble { font-size: 14px; padding: 10px 13px; }
    .suggestions-grid { grid-template-columns: 1fr 1fr; max-width: 100%; }

    .welcome-icon { width: 52px !important; height: 52px !important; border-radius: 14px !important; }
    .welcome-title { font-size: 18px !important; }
    .welcome-desc { font-size: 13px !important; }
  }
`;

// ─── Sub-components ───────────────────────────────────────────────────────────

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
        width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 600, color: "#fff",
      }}>U</div>
    );
  }
  return (
    <div style={{
      width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
      background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
      </svg>
    </div>
  );
}

function CodeBlock({ language, children }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="code-block">
      <div className="code-block-header">
        <span>{language || "code"}</span>
        <button className="code-copy-btn" onClick={copy}>
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={oneDark}
        customStyle={{ margin: 0, borderRadius: 0, fontSize: 13, background: "rgba(10,10,20,0.8)" }}
        PreTag="div"
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

function MessageContent({ content, role, streaming }) {
  if (role === "user") {
    return <>{content}{streaming && <span className="streaming-cursor" />}</>;
  }
  if (!content && streaming) return <TypingDots />;
  return (
    <>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre({ children }) {
            return <>{children}</>;
          },
          code({ className, children }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeStr = String(children).replace(/\n$/, "");
            if (match || codeStr.includes("\n")) {
              return <CodeBlock language={match?.[1] || ""}>{codeStr}</CodeBlock>;
            }
            return <code>{children}</code>;
          },
          a({ href, children }) {
            return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
      {streaming && <span className="streaming-cursor" />}
    </>
  );
}

function MsgCopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button className="msg-copy-btn" onClick={copy}>
      {copied
        ? "✓ Copied"
        : (
          <>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy
          </>
        )
      }
    </button>
  );
}

function SidebarContent({ systemPrompt, setSystemPrompt, onClear, messageCount, onClose, model, setModel }) {
  const [draft, setDraft] = useState(systemPrompt);
  const labelStyle = {
    fontSize: 11, fontWeight: 600, color: "#475569",
    letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8,
  };
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
            <div style={{ fontSize: 11, color: "#64748b" }}>Powered by OpenAI</div>
          </div>
        </div>
        <button
          onClick={() => { onClear(); onClose?.(); }}
          style={{
            width: "100%", padding: "9px 14px", background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
            color: "#94a3b8", fontSize: 13, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit",
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
        <div style={labelStyle}>Model</div>
        <select
          className="model-select"
          value={model}
          onChange={e => setModel(e.target.value)}
        >
          {MODELS.map(m => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
      </div>

      <div>
        <div style={labelStyle}>System Prompt</div>
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

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [messages, setMessages] = useState(() => {
    try {
      return (JSON.parse(localStorage.getItem(STORAGE_KEY)) || []).map(m => ({ ...m, streaming: false }));
    } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [systemPrompt, setSystemPrompt] = useState(SYSTEM_PROMPT_DEFAULT);
  const [model, setModel] = useState("gpt-4o");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const abortRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  useEffect(() => {
    const stable = messages.filter(m => !m.streaming);
    if (stable.length === messages.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

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

    abortRef.current = new AbortController();

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          model,
          max_tokens: 1500,
          stream: true,
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

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages(prev => [...prev, { role: "assistant", content: "", streaming: true }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const delta = JSON.parse(data).choices?.[0]?.delta?.content || "";
            assistantContent += delta;
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: "assistant", content: assistantContent, streaming: true };
              return updated;
            });
          } catch (e) { void e; }
        }
      }

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: assistantContent };
        return updated;
      });

    } catch (e) {
      if (e.name === "AbortError") {
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.streaming) updated[updated.length - 1] = { role: last.role, content: last.content };
          return updated;
        });
      } else {
        setMessages(prev => {
          const updated = [...prev];
          if (updated[updated.length - 1]?.streaming) updated.pop();
          return updated;
        });
        setError(e.message);
      }
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const stopGeneration = () => abortRef.current?.abort();

  const handleKey = e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const currentModelLabel = MODELS.find(m => m.id === model)?.label || "GPT-4o";

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
            model={model}
            setModel={setModel}
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
                model={model}
                setModel={setModel}
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
                <div style={{ fontSize: 11, color: "#475569" }}>{currentModelLabel}</div>
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
              {loading ? "Thinking…" : "Ready"}
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
                      className="suggestion-btn"
                      onClick={() => { setInput(s); inputRef.current?.focus(); }}
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
                <div className="message-col">
                  <div className={`message-bubble ${msg.role}`}>
                    <MessageContent content={msg.content} role={msg.role} streaming={msg.streaming} />
                  </div>
                  {!msg.streaming && msg.content && <MsgCopyButton text={msg.content} />}
                </div>
              </div>
            ))}

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
                placeholder="Message… (Enter to send, Shift+Enter for newline)"
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
              {loading ? (
                <button
                  onClick={stopGeneration}
                  title="Stop generation"
                  style={{
                    width: 36, height: 36, borderRadius: 10, border: "none",
                    background: "rgba(239,68,68,0.2)",
                    cursor: "pointer", display: "flex", alignItems: "center",
                    justifyContent: "center", flexShrink: 0, transition: "all 0.15s",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#ef4444">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                  </svg>
                </button>
              ) : (
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  style={{
                    width: 36, height: 36, borderRadius: 10, border: "none",
                    background: !input.trim() ? "rgba(99,102,241,0.2)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    cursor: !input.trim() ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, transition: "all 0.15s",
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              )}
            </div>
            <div style={{ textAlign: "center", fontSize: 11, color: "#2d3748", marginTop: 8 }}>
              Powered by OpenAI API
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
