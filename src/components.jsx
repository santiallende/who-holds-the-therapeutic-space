// ─── INLINE CITATION ─────────────────────────────────────────────────────────
export function Cite({ url, label }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      style={{
        display: "inline-block",
        marginLeft: 3,
        fontSize: "11px",
        color: "#4a7cc4",
        textDecoration: "none",
        verticalAlign: "super",
        letterSpacing: 0,
        fontFamily: "'IBM Plex Mono',monospace",
      }}
    >
      [↗]
    </a>
  );
}

// ─── PERSON ROW ───────────────────────────────────────────────────────────────
export function PersonRow({ person, accent = "#c87d12" }) {
  return (
    <div style={{
      display: "flex", gap: 8, paddingLeft: 6,
      borderLeft: `2px solid ${accent}`, marginBottom: 7,
    }}>
      <div>
        <div style={{ fontSize: 13, color: "#e8e0d0", lineHeight: 1.3 }}>
          <strong style={{ color: "#e0d0b8" }}>{person.name}</strong>
          {person.src && <Cite url={person.src} label={person.title} />}
        </div>
        <div style={{ fontSize: 10.5, color: "#aaa080", lineHeight: 1.4 }}>{person.title}</div>
        {person.note && (
          <div style={{ fontSize: 10.5, color: "#8a8065", lineHeight: 1.5, marginTop: 1 }}>{person.note}</div>
        )}
      </div>
    </div>
  );
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
export function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: "9.5px",
      color: "#8a8065",
      letterSpacing: ".12em",
      textTransform: "uppercase",
      marginBottom: 6,
      fontFamily: "'IBM Plex Mono',monospace",
    }}>
      {children}
    </div>
  );
}

// ─── CONFLICT BLOCK ───────────────────────────────────────────────────────────
export function ConflictBlock({ text, src, srcLabel }) {
  return (
    <div style={{
      background: "rgba(139,32,32,.1)",
      borderLeft: "3px solid #8b2020",
      borderRadius: "0 4px 4px 0",
      padding: "8px 10px",
      marginBottom: 10,
    }}>
      <div style={{
        fontSize: "9.5px", color: "#c0392b",
        letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 3,
      }}>
        ⚠ Conflict of Interest
      </div>
      <p style={{ fontSize: 13, color: "#c0b898", lineHeight: 1.7, margin: 0 }}>
        {text}
        {src && <Cite url={src} label={srcLabel || "source"} />}
      </p>
    </div>
  );
}
