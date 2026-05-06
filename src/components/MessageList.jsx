import { useEffect } from "react";
import { SUGGESTIONS } from "../constants";
import Avatar from "./Avatar";
import MessageContent from "./MessageContent";
import MsgCopyButton from "./MsgCopyButton";

function formatTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MessageList({
  messages, error, bottomRef, setInput, inputRef,
  searchQuery, matchingIndices, currentMatchMsgIdx,
}) {
  const isEmpty = messages.length === 0;

  useEffect(() => {
    if (currentMatchMsgIdx < 0) return;
    document
      .querySelector(`[data-msg-index="${currentMatchMsgIdx}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [currentMatchMsgIdx]);

  return (
    <div className="chat-messages">

      {isEmpty && (
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
            <div className="welcome-title" style={{ fontSize: 20, fontWeight: 700, color: "var(--text-bright)", marginBottom: 8 }}>
              Start a Conversation
            </div>
            <div className="welcome-desc" style={{ fontSize: 14, color: "var(--text-dim)", maxWidth: 300, lineHeight: 1.7, margin: "0 auto" }}>
              Ask me anything — writing, coding, analysis, brainstorming and more.
            </div>
          </div>
          <div className="suggestions-grid">
            {SUGGESTIONS.map(s => (
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

      {messages.map((msg, i) => {
        const isMatch   = searchQuery && matchingIndices.includes(i);
        const isCurrent = i === currentMatchMsgIdx;
        return (
          <div key={i} data-msg-index={i} className={`message-row ${msg.role}`}>
            <Avatar role={msg.role} />
            <div className="message-col">
              <div className={`message-bubble ${msg.role}${isMatch ? " search-match" : ""}${isCurrent ? " search-current" : ""}`}>
                <MessageContent
                  content={msg.content}
                  role={msg.role}
                  streaming={msg.streaming}
                  searchQuery={msg.role === "user" ? searchQuery : ""}
                />
              </div>
              {!msg.streaming && msg.content && (
                <div className="msg-meta">
                  <MsgCopyButton text={msg.content} />
                  <span className="msg-timestamp">{formatTime(msg.timestamp)}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {error && (
        <div style={{
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
          borderRadius: 12, padding: "11px 14px", color: "#fca5a5", fontSize: 13,
          display: "flex", gap: 8, alignItems: "flex-start",
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8"  x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span><strong>Error:</strong> {error}</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
