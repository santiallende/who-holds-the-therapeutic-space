import { useState } from "react";
import { COMPANIES, NODE_TYPE_COLOR, NODE_TYPE_LABEL } from "./data.js";
import { Cite, PersonRow, SectionLabel, ConflictBlock } from "./components.jsx";

function CompanyCard({ co, expanded, onToggle }) {
  const typeColor = NODE_TYPE_COLOR[co.type] || "#888";

  return (
    <div style={{
      borderBottom: "1px solid #141412",
      overflow: "hidden",
    }}>
      {/* Header row */}
      <div
        onClick={onToggle}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "11px 14px", cursor: "pointer",
          background: expanded ? "#111110" : "transparent",
        }}
      >
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: typeColor, flexShrink: 0,
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13, color: "#d8cfc0",
            fontFamily: "'Playfair Display',serif",
            lineHeight: 1.2, fontWeight: 600,
          }}>
            {co.label}
            {co.src && <Cite url={co.src} label={co.srcLabel || co.label} />}
          </div>
          <div style={{ fontSize: 13, color: "#8a8065", marginTop: 1, fontFamily: "'IBM Plex Mono',monospace" }}>
            {NODE_TYPE_LABEL[co.type]} · {co.raised} · {co.status}
          </div>
        </div>
        <div style={{ fontSize: 14, color: "#aaa080", flexShrink: 0 }}>
          {expanded ? "−" : "+"}
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div style={{ padding: "0 14px 14px" }}>
          {/* Quick stats */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: "6px 14px",
            marginBottom: 10, paddingTop: 4,
          }}>
            {[
              ["Founded", co.founded],
              ["HQ", co.hq],
              ["Raised", co.raised],
              ["Valuation", co.val],
              ["Providers", co.providers],
              ["Model", co.model],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k} style={{ fontSize: 12.5 }}>
                <span style={{ color: "#7a7055" }}>{k}: </span>
                <span style={{ color: "#e8b860" }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Conflict */}
          {co.conflict && (
            <ConflictBlock text={co.conflict} src={co.src} srcLabel={co.srcLabel} />
          )}

          {/* Coalition role */}
          {co.coalitionRole && (
            <div style={{
              background: "rgba(107,52,160,.08)",
              borderLeft: "3px solid #6b34a0",
              borderRadius: "0 4px 4px 0",
              padding: "8px 10px", marginBottom: 10,
            }}>
              <div style={{ fontSize: "9.5px", color: "#8e44ad", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 3 }}>
                ◈ Aligned Innovation Coalition
              </div>
              <p style={{ fontSize: 13, color: "#c0b898", lineHeight: 1.7, margin: 0 }}>
                {co.coalitionRole}
                <Cite url="https://bhbusiness.com/2024/11/05/major-insurance-companies-back-new-behavioral-health-measurement-standards-program/" label="BHB · Nov 2024" />
              </p>
            </div>
          )}

          {/* Executives */}
          {co.executives?.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <SectionLabel>Executives</SectionLabel>
              {co.executives.map((e, i) => <PersonRow key={i} person={e} accent={typeColor} />)}
            </div>
          )}

          {/* Board */}
          {co.board?.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <SectionLabel>Board & Key Investors</SectionLabel>
              {co.board.map((b, i) => (
                <PersonRow key={i}
                  person={{ name: b.name, title: b.role, src: b.src }}
                  accent="#1e56a0"
                />
              ))}
            </div>
          )}

          {/* Investors */}
          {co.investors?.length > 0 && (
            <div style={{ fontSize: 12.5, color: "#8a8065", lineHeight: 1.6 }}>
              <strong style={{ color: "#baa888" }}>All Investors: </strong>
              {co.investors.map((inv, i, arr) => (
                <span key={i} style={{ color: inv.includes("⚠") ? "#c04040" : "#8a8065" }}>
                  {inv}{i < arr.length - 1 ? ", " : ""}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function IntelPanel() {
  const [expanded, setExpanded] = useState(null);

  const sorted = [...COMPANIES].sort((a, b) => {
    const order = ["platform", "public", "cautionary", "ai", "wellness", "coalition", "vc", "pe", "insurer"];
    return (order.indexOf(a.type) - order.indexOf(b.type)) || a.label.localeCompare(b.label);
  });

  return (
    <div style={{ flex: 1, overflowY: "auto", background: "#0c0c0a" }}>
      {/* Header */}
      <div style={{
        padding: "10px 14px 8px",
        borderBottom: "1px solid #1a1a14",
        position: "sticky", top: 0, background: "#0c0c0a", zIndex: 10,
      }}>
        <div style={{ fontSize: "11px", color: "#7a7055", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 2 }}>
          Company Intelligence
        </div>
        <div style={{ fontSize: 12.5, color: "#8a8065" }}>
          {COMPANIES.length} platforms · Executives · Board · Conflicts · Citations
        </div>
      </div>

      {sorted.map(co => (
        <CompanyCard
          key={co.id}
          co={co}
          expanded={expanded === co.id}
          onToggle={() => setExpanded(expanded === co.id ? null : co.id)}
        />
      ))}
    </div>
  );
}
