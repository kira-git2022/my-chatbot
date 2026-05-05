export default function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "3px 2px" }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width: 7, height: 7, borderRadius: "50%", background: "#94a3b8",
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
