import { MODELS } from "../constants";
import { useTheme } from "../ThemeContext";

export default function ChatHeader({ model, loading, onMenuOpen }) {
  const { theme, toggleTheme } = useTheme();
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
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-bright)" }}>Chat</div>
          <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{modelLabel}</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Theme toggle */}
        <button className="theme-toggle-btn" onClick={toggleTheme} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
          {theme === "dark" ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        {/* Status pill */}
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
    </div>
  );
}
