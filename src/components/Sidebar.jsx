import { useState } from "react";
import { MODELS } from "../constants";

const LABEL = {
  fontSize: 11, fontWeight: 600, color: "#475569",
  letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8,
};

export default function Sidebar({ systemPrompt, setSystemPrompt, onClear, messageCount, model, setModel, onClose }) {
  const [draft, setDraft] = useState(systemPrompt);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, height: "100%" }}>

      {/* Brand + new chat */}
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

      {/* Model selector */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
        <div style={LABEL}>Model</div>
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

      {/* System prompt */}
      <div>
        <div style={LABEL}>System Prompt</div>
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

      {/* Stats */}
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
