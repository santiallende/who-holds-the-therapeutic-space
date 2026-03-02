import { useState, useRef, useEffect } from "react";
import { TIMELINE_EVENTS, TIMELINE_TYPE_CFG, SWIM_ORDER, COMPANIES } from "./data.js";
import { Cite } from "./components.jsx";

const LANE_H = 46;
const YEAR_W = 90;
const LEFT_PAD = 130;
const SVG_LEFT_PAD = 40; // push dots right so 2012 isn't flush against label column
const MIN_YEAR = 2012;
const MAX_YEAR = 2026;
const YEARS = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i);

const SWIM_ORDER_DISPLAY = SWIM_ORDER.filter ? null : null; // resolved at runtime

function getLane(company) {
  const order = SWIM_ORDER.filter(id => id !== "_industry");
  const i = order.indexOf(company);
  return i >= 0 ? i : order.length - 1;
}

function formatAmount(a) {
  if (!a) return null;
  if (a >= 1000) return `$${(a / 1000).toFixed(1)}B`;
  return `$${a}M`;
}

function xOf(date) {
  const year = parseInt(date);
  const month = parseInt((date.split("-")[1]) || 1);
  return SVG_LEFT_PAD + ((year - MIN_YEAR) + (month - 1) / 12) * YEAR_W;
}

// ─── EVENT DETAIL PANEL ───────────────────────────────────────────────────────
function EventPanel({ ev, onClose }) {
  if (!ev) return null;
  const cfg = TIMELINE_TYPE_CFG[ev.type] || TIMELINE_TYPE_CFG.raise;
  const co = COMPANIES.find(c => c.id === ev.company);
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      maxHeight: "42%", background: "#0e0e0c",
      borderTop: `2px solid ${cfg.accent}`,
      padding: "12px 16px 16px",
      overflowY: "auto", zIndex: 300,
      boxShadow: "0 -8px 32px rgba(0,0,0,.85)",
    }} onClick={e => e.stopPropagation()}>
      <button onClick={onClose} style={{
        position: "absolute", top: 10, right: 12,
        background: "none", border: "none", color: "#555",
        fontSize: 20, cursor: "pointer", lineHeight: 1,
      }}>×</button>

      <div style={{
        fontSize: 10, color: cfg.accent, letterSpacing: ".14em",
        textTransform: "uppercase", marginBottom: 4,
      }}>
        {ev.date?.replace(/-/, " / ")} · {cfg.label}
        {ev.src && <Cite url={ev.src} label={ev.title} />}
      </div>

      <div style={{
        fontFamily: "'Playfair Display',serif",
        fontSize: "1.05rem", color: "#f0e8d8",
        lineHeight: 1.3, marginBottom: 8, paddingRight: 18,
      }}>
        {ev.title}
      </div>

      {ev.amount && (
        <div style={{
          fontSize: 15, color: "#e8b850", fontWeight: 700,
          fontFamily: "'IBM Plex Mono',monospace", marginBottom: 10,
        }}>
          {formatAmount(ev.amount)}
        </div>
      )}

      {co && (
        <div style={{
          background: "#141412", borderRadius: 4, padding: "7px 9px",
          marginBottom: 10, fontSize: 11, color: "#9a9070",
          fontFamily: "'IBM Plex Mono',monospace",
        }}>
          {co.raised && <div>Raised: <span style={{ color: "#c8b880" }}>{co.raised}</span></div>}
          {co.status && <div>Status: <span style={{ color: "#c8b880" }}>{co.status}</span></div>}
          {co.providers && <div>Network: <span style={{ color: "#c8b880" }}>{co.providers}</span></div>}
        </div>
      )}

      <p style={{ fontSize: 12.5, color: "#b0a888", lineHeight: 1.7, margin: 0 }}>
        {ev.detail}
      </p>
    </div>
  );
}

// ─── MAIN TIMELINE ────────────────────────────────────────────────────────────
export default function Timeline() {
  const containerRef = useRef(null);
  const [containerW, setContainerW] = useState(800);
  const [selectedEv, setSelectedEv] = useState(null);
  const [hoveredEv, setHoveredEv] = useState(null);
  const [filter, setFilter] = useState("all"); // all | raise | acquisition | conflict | warning

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(es => setContainerW(es[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const LABEL_OVERRIDES = {
    lifestance:   "LifeStance",
    ash:          "Slingshot AI",
    modernhealth: "Modern Health",
    alma:         "Alma → Spring",
    headspace:    "Headspace/Ginger",
    uhg:          "UHG / Optum",
    centene:      "Centene/Magellan",
    hcsc:         "HCSC",
  };
  const laneNames = SWIM_ORDER.map(id => {
    if (id === "_industry") return "Industry-wide";
    if (LABEL_OVERRIDES[id]) return LABEL_OVERRIDES[id];
    const co = COMPANIES.find(c => c.id === id);
    return co?.label || id;
  });

  const totalH = SWIM_ORDER.filter(id => id !== "_industry").length * LANE_H + 32;
  const totalW = YEARS.length * YEAR_W + SVG_LEFT_PAD + 100;

  const filteredEvents = filter === "all"
    ? TIMELINE_EVENTS
    : TIMELINE_EVENTS.filter(ev => ev.type === filter);

  const FILTER_OPTS = [
    { key: "all", label: "All events" },
    { key: "raise", label: "Funding" },
    { key: "acquire", label: "Acquisitions" },
    { key: "conflict", label: "Conflicts" },
    { key: "warning", label: "Warnings" },
    { key: "ipo", label: "IPOs" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", background: "#090907" }}>

      {/* Filter bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "7px 12px", borderBottom: "1px solid #1a1a14",
        flexShrink: 0, flexWrap: "wrap",
      }}>
        <span style={{ fontSize: 10, color: "#9a9070", marginRight: 4, fontFamily: "'IBM Plex Mono',monospace" }}>FILTER:</span>
        {FILTER_OPTS.map(o => {
          const cfg = o.key !== "all" ? (TIMELINE_TYPE_CFG[o.key] || {}) : {};
          const active = filter === o.key;
          return (
            <button key={o.key} onClick={() => setFilter(o.key)} style={{
              background: active ? (cfg.color || "#2a2820") : "transparent",
              border: `1px solid ${active ? (cfg.accent || "#8a8060") : "#2a2820"}`,
              color: active ? "#f0e8d8" : "#6a6050",
              fontSize: 10, padding: "3px 9px", borderRadius: 3,
              cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace",
              transition: "all .12s",
            }}>{o.label}</button>
          );
        })}
        <span style={{ marginLeft: "auto", fontSize: 10, color: "#7a7060", fontFamily: "'IBM Plex Mono',monospace" }}>
          {filteredEvents.length} events · Click dot for detail
        </span>
      </div>

      {/* Single scroll container — both x and y */}
      <div ref={containerRef} style={{ flex: 1, overflow: "auto", position: "relative" }}
        onClick={() => setSelectedEv(null)}>

        {/* Inner layout row — wide enough for all years */}
        <div style={{ display: "flex", minWidth: LEFT_PAD + totalW, minHeight: totalH + 24 }}>

          {/* Sticky label column — pins to left during horizontal scroll */}
          <div style={{
            position: "sticky", left: 0, zIndex: 10,
            width: LEFT_PAD, flexShrink: 0,
            background: "#090907",
            borderRight: "1px solid #1a1a14",
          }}>
            <div style={{ height: 24, background: "#090907", borderBottom: "1px solid #1a1a14" }} />
            {SWIM_ORDER.filter(id => id !== "_industry").map((id, i) => {
              const name = laneNames[SWIM_ORDER.indexOf(id)];
              const isInsurer = ["UHG / Optum","Centene/Magellan","HCSC"].includes(name);
              return (
                <div key={id} style={{
                  height: LANE_H,
                  display: "flex", alignItems: "center", justifyContent: "flex-end",
                  paddingRight: 8,
                  fontSize: 10, fontFamily: "'IBM Plex Mono',monospace",
                  color: isInsurer ? "#c06060" : "#b0a882",
                  fontWeight: isInsurer ? 600 : 400,
                  background: isInsurer ? "rgba(139,32,32,.06)" : i % 2 === 0 ? "#0a0a08" : "#0c0c0a",
                  whiteSpace: "nowrap",
                }}>
                  {name}{isInsurer ? " ⚠" : ""}
                </div>
              );
            })}
          </div>

          {/* SVG — grid and dots only */}
          <svg width={totalW} height={totalH} style={{ display: "block", flexShrink: 0 }}>

            {/* Lane backgrounds */}
            {SWIM_ORDER.filter(id => id !== "_industry").map((id, i) => {
              const isInsurer = ["uhg","centene","hcsc"].includes(id);
              return (
                <rect key={id} x={0} y={i * LANE_H + 24} width={totalW} height={LANE_H}
                  fill={isInsurer ? "rgba(139,32,32,.06)" : i % 2 === 0 ? "#0a0a08" : "#0c0c0a"} />
              );
            })}

            {/* Year header background — sticky top via SVG foreignObject is complex; use rect */}
            <rect x={0} y={0} width={totalW} height={24} fill="#090907" />

            {/* Year grid lines + labels */}
            {YEARS.map(yr => {
              const x = SVG_LEFT_PAD + (yr - MIN_YEAR) * YEAR_W;
              const isCurrent = yr === 2026;
              return (
                <g key={yr}>
                  <line x1={x} y1={24} x2={x} y2={totalH}
                    stroke={isCurrent ? "#3a3020" : "#161614"} strokeWidth={isCurrent ? 1.5 : 1} />
                  <text x={x + YEAR_W / 2} y={16} textAnchor="middle"
                    fontSize={13} fill={isCurrent ? "#e89020" : "#8a7858"}
                    fontFamily="'IBM Plex Mono',monospace" fontWeight={isCurrent ? "700" : "500"}>
                    {yr}{isCurrent ? " ▸" : ""}
                  </text>
                </g>
              );
            })}

            {/* Event dots */}
            {filteredEvents.map(ev => {
              const cfg = TIMELINE_TYPE_CFG[ev.type] || TIMELINE_TYPE_CFG.raise;
              const lane = getLane(ev.company || "_industry");
              const cx = xOf(ev.date);
              const cy = lane * LANE_H + 24 + LANE_H / 2;
              const isSel = selectedEv?.id === ev.id;
              const isHov = hoveredEv?.id === ev.id;
              const isConflict = ev.type === "conflict" || ev.type === "warning";
              const r = isConflict ? 9 : ev.amount ? Math.min(6 + ev.amount / 80, 11) : 6;
              return (
                <g key={ev.id} style={{ cursor: "pointer" }}
                  onClick={e => { e.stopPropagation(); setSelectedEv(isSel ? null : ev); }}
                  onMouseEnter={() => setHoveredEv(ev)}
                  onMouseLeave={() => setHoveredEv(null)}>
                  {isConflict && (
                    <circle cx={cx} cy={cy} r={r + 7} fill={cfg.color} opacity={isSel || isHov ? 0.22 : 0.08} />
                  )}
                  {(isSel || isHov) && (
                    <circle cx={cx} cy={cy} r={r + 5} fill="none" stroke={cfg.accent} strokeWidth={1.5} opacity={0.7} />
                  )}
                  <circle cx={cx} cy={cy} r={r}
                    fill={cfg.color}
                    stroke={isSel || isHov ? cfg.accent : "rgba(255,255,255,0.06)"}
                    strokeWidth={isSel || isHov ? 2 : 0.5} />
                  <text x={cx} y={cy + 3.5} textAnchor="middle"
                    fontSize={isConflict ? 9 : 8} fill={cfg.accent}
                    style={{ pointerEvents: "none" }}>{cfg.sym}</text>
                  {ev.amount && (isSel || isHov) && (
                    <text x={cx} y={cy - r - 8} textAnchor="middle"
                      fontSize={9.5} fill={cfg.accent}
                      fontFamily="'IBM Plex Mono',monospace" fontWeight="600"
                      style={{ pointerEvents: "none" }}>
                      {formatAmount(ev.amount)}
                    </text>
                  )}
                  {ev.amount && ev.amount >= 200 && !isSel && !isHov && (
                    <text x={cx} y={cy - r - 5} textAnchor="middle"
                      fontSize={8.5} fill={cfg.accent} opacity={0.75}
                      fontFamily="'IBM Plex Mono',monospace" fontWeight="600"
                      style={{ pointerEvents: "none" }}>
                      {formatAmount(ev.amount)}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Hover tooltip */}
            {hoveredEv && !selectedEv && (() => {
              const cfg = TIMELINE_TYPE_CFG[hoveredEv.type] || TIMELINE_TYPE_CFG.raise;
              const lane = getLane(hoveredEv.company || "_industry");
              const cx = xOf(hoveredEv.date);
              const cy = lane * LANE_H + 24 + LANE_H / 2;
              const lines = hoveredEv.title.length > 32
                ? [hoveredEv.title.slice(0, 32), hoveredEv.title.slice(32)]
                : [hoveredEv.title];
              return (
                <g style={{ pointerEvents: "none" }}>
                  <rect x={cx - 3} y={cy - 52} width={Math.min(hoveredEv.title.length * 6.2 + 12, 230)} height={lines.length * 14 + 10}
                    fill="#111110" stroke={cfg.accent} strokeWidth={0.8} rx={3} opacity={0.95} />
                  {lines.map((line, i) => (
                    <text key={i} x={cx + 3} y={cy - 40 + i * 14} fontSize={10.5}
                      fill="#e0d0b8" fontFamily="'IBM Plex Mono',monospace">{line}</text>
                  ))}
                </g>
              );
            })()}
          </svg>
        </div>
      </div>

      {/* EventPanel — fixed to viewport bottom, always visible regardless of scroll */}
      {selectedEv && (
        <EventPanel ev={selectedEv} onClose={() => setSelectedEv(null)} />
      )}

      {/* Legend */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: "4px 12px",
        padding: "6px 12px", background: "#0a0a08",
        borderTop: "1px solid #1a1a14", flexShrink: 0,
      }}>
        {Object.entries(TIMELINE_TYPE_CFG).map(([k, v]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: v.color, border: `1px solid ${v.accent}` }} />
            <span style={{ fontSize: 11, color: "#b0a882", fontFamily: "'IBM Plex Mono',monospace" }}>{v.label}</span>
          </div>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 10, color: "#3a3828", fontFamily: "'IBM Plex Mono',monospace" }}>
          Sources: Fierce Healthcare · BH Business · SEC filings · Company PRs
        </span>
      </div>
    </div>
  );
}
