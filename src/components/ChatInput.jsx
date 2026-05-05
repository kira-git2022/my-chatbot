export default function ChatInput({ inputRef, input, setInput, loading, onSend, onStop }) {
  const handleKey = e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const autoResize = e => {
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  return (
    <div className="chat-input-area">
      <div className="input-box">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          onInput={autoResize}
          placeholder="Message… (Enter to send, Shift+Enter for newline)"
          rows={1}
          style={{
            flex: 1, background: "transparent", border: "none",
            color: "#e2e8f0", fontSize: 14.5, lineHeight: 1.6,
            resize: "none", outline: "none", fontFamily: "inherit",
            maxHeight: 120, overflowY: "auto",
          }}
        />

        {loading ? (
          <button
            onClick={onStop}
            title="Stop generation"
            style={{
              width: 36, height: 36, borderRadius: 10, border: "none",
              background: "rgba(239,68,68,0.2)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "all 0.15s",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#ef4444">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
            </svg>
          </button>
        ) : (
          <button
            onClick={onSend}
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
  );
}
