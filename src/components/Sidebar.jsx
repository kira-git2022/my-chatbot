import { useState } from "react";
import { MODELS, TOKEN_COSTS } from "../constants";

const LABEL = {
  fontSize: 11, fontWeight: 600, color: "var(--text-dim)",
  letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8,
};

function formatCost(cost) {
  if (cost < 0.001) return "< $0.001";
  return `$${cost.toFixed(4)}`;
}

export default function Sidebar({ systemPrompt, setSystemPrompt, onClear, messageCount, model, setModel, totalUsage, onClose }) {
  const [draft, setDraft] = useState(systemPrompt);

  const costs = TOKEN_COSTS[model] ?? TOKEN_COSTS["gpt-4o"];
  const estimatedCost = totalUsage.prompt * costs.input / 1_000_000
                      + totalUsage.completion * costs.output / 1_000_000;
  const totalTokens = totalUsage.prompt + totalUsage.completion;

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
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-bright)" }}>AI Chatbot</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Powered by OpenAI</div>
          </div>
        </div>

        <button
          onClick={() => { onClear(); onClose?.(); }}
          style={{
            width: "100%", padding: "9px 14px", background: "transparent",
            border: "1px solid var(--border-input)", borderRadius: 10,
            color: "var(--text-faint)", fontSize: 13, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          New Conversation
          <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-dim)", opacity: 0.7 }}>⌘K</span>
        </button>
      </div>

      {/* Model selector */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
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
            width: "100%", background: "var(--bg-input)",
            border: "1px solid var(--border)", borderRadius: 10,
            color: "var(--text)", fontSize: 13, lineHeight: 1.6,
            padding: "10px 12px", resize: "vertical", fontFamily: "inherit", outline: "none",
          }}
          placeholder="Define the AI's personality..."
        />
        <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 6 }}>
          Changes apply to new conversations
        </div>
      </div>

      {/* Stats */}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{
          background: "var(--bg-stats)", border: "1px solid var(--border-stats)",
          borderRadius: 10, padding: "12px 14px",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
        }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>Messages</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>{messageCount}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>Tokens</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>
              {totalTokens > 0 ? totalTokens.toLocaleString() : "—"}
            </div>
          </div>
        </div>
        {totalTokens > 0 && (
          <div style={{
            background: "var(--bg-stats)", border: "1px solid var(--border-stats)",
            borderRadius: 10, padding: "10px 14px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Est. cost</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
              {formatCost(estimatedCost)}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
