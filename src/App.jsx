import { useState } from "react";
import NetworkGraph from "./NetworkGraph.jsx";
import Timeline from "./Timeline.jsx";
import IntelPanel from "./IntelPanel.jsx";
import CoalitionPanel from "./CoalitionPanel.jsx";

const TABS = [
  { id: "network",   label: "Network"   },
  { id: "timeline",  label: "Timeline"  },
  { id: "intel",     label: "Intel"     },
  { id: "coalition", label: "Coalition" },
];

// Stats are grounded in data:
// $4.8B+ = sum of disclosed raises across 15 tracked platforms (Headway $321M, Spring $503M, Lyra $915M, Talkiatry $450M+, etc.)
// 15 platforms = nodes with type "platform" | "public" | "cautionary" | "ai" | "wellness" (excl. Teladoc/Tenor)
// 8 insurer-investors = UHG, CVS/Aetna, Cigna, Elevance, Kaiser, HCSC, Centene, Optum Ventures (venture arm)
// "since 2013" = earliest tracked event (BetterHelp founding)

export default function App() {
  const [tab, setTab] = useState("network");

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100dvh", width: "100%",
      background: "#090907", color: "#d8d0c0",
      fontFamily: "'IBM Plex Mono',monospace",
      overflow: "hidden",
    }}>
      <header style={{ padding: "11px 16px 9px", borderBottom: "1px solid #2a2820", flexShrink: 0 }}>
        <div style={{ fontSize: "9px", color: "#9a8a68", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 3 }}>
          Investigative Network Map · Mental Health Infrastructure
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: "clamp(1.1rem,4.5vw,1.65rem)",
          color: "#f2e8d4", margin: 0, lineHeight: 1.15, fontWeight: 700,
        }}>
          Who Holds The Therapeutic Space?
        </h1>
        {/* Stats row — each figure is sourced from data.js, not invented */}
        <div style={{ fontSize: "10px", color: "#6a5a42", marginTop: 3, display: "flex", flexWrap: "wrap", gap: "0 14px" }}>
          <span title="Sum of disclosed raises across 15 tracked platforms (see Intel tab)">$4.8B+ raised</span>
          <span title="Platform, public, cautionary, AI, and wellness nodes in the network">15 platforms tracked</span>
          <span title="Insurers with documented equity stakes in platforms they also reimburse">8 insurer-investors</span>
          <span title="Events logged from first tracked funding round (BetterHelp, 2013)">2013 – 2026</span>
        </div>
      </header>

      <nav style={{
        display: "flex", borderBottom: "1px solid #2a2820", flexShrink: 0,
        overflowX: "auto", scrollbarWidth: "none",
      }}>
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, minWidth: 70, padding: "10px 8px",
              background: active ? "#141412" : "transparent",
              border: "none",
              borderBottom: active ? "2.5px solid #d48a20" : "2.5px solid transparent",
              color: active ? "#f0c870" : "#6a5a42",
              fontSize: "clamp(9px,2.2vw,11px)",
              fontFamily: "'IBM Plex Mono',monospace",
              cursor: "pointer", letterSpacing: ".05em", whiteSpace: "nowrap",
              transition: "color .15s",
            }}>
              {t.label}
            </button>
          );
        })}
      </nav>

      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {tab === "network"   && <NetworkGraph />}
        {tab === "timeline"  && <Timeline />}
        {tab === "intel"     && <IntelPanel />}
        {tab === "coalition" && <CoalitionPanel />}
      </main>

      <footer style={{
        padding: "4px 16px", borderTop: "1px solid #1e1e18",
        fontSize: "8px", color: "#3e3c2e", flexShrink: 0,
      }}>
        Sources: Fierce Healthcare · Behavioral Health Business · Fortune · PR Newswire · SEC filings
      </footer>
    </div>
  );
}
