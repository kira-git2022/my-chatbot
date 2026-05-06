import { useEffect, useRef } from "react";

export default function SearchBar({ query, setQuery, matchCount, currentDisplayIdx, onNext, onPrev, onClose }) {
  const inputRef = useRef(null);
  useEffect(() => inputRef.current?.focus(), []);

  const handleKey = e => {
    if (e.key === "Escape") onClose();
    if (e.key === "Enter") e.shiftKey ? onPrev() : onNext();
  };

  const navBtn = {
    background: "transparent", border: "none", cursor: "pointer",
    color: "var(--text-muted)", padding: "4px 6px", borderRadius: 6,
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "color 0.15s, background 0.15s",
  };

  return (
    <div className="search-bar">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>

      <input
        ref={inputRef}
        className="search-input"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Search messages…"
      />

      {query && (
        <span style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap", flexShrink: 0 }}>
          {matchCount === 0 ? "No results" : `${currentDisplayIdx + 1} / ${matchCount}`}
        </span>
      )}

      <button style={navBtn} onClick={onPrev} title="Previous (Shift+Enter)" disabled={matchCount === 0}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15"/>
        </svg>
      </button>
      <button style={navBtn} onClick={onNext} title="Next (Enter)" disabled={matchCount === 0}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      <button style={{ ...navBtn, marginLeft: 2 }} onClick={onClose} title="Close (Esc)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}
