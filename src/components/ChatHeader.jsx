import { MODELS } from "../constants";

export default function ChatHeader({ model, loading, onMenuOpen }) {
  const modelLabel = MODELS.find(m => m.id === model)?.label ?? "GPT-4o";

  return (
    <div className="chat-header">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button className="menu-btn" onClick={onMenuOpen} aria-label="Open menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9" }}>Chat</div>
          <div style={{ fontSize: 11, color: "#475569" }}>{modelLabel}</div>
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
  );
}
