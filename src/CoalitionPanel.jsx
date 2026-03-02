import { Cite, SectionLabel } from "./components.jsx";

const COALITION = {
  name: "Aligned Innovation Coalition",
  org: "National Quality Forum (NQF)",
  launched: "November 2024",
  duration: "24-month project",
  goal: "Standardize behavioral health measurement tools for value-based care contracts.",
  src: "https://bhbusiness.com/2024/11/05/major-insurance-companies-back-new-behavioral-health-measurement-standards-program/",
  srcLabel: "Behavioral Health Business · Nov 2024",
  tools: [
    {
      name: "Omnibus Assessment",
      desc: "Combines depression, anxiety, and functional outcome measures into a single standardized instrument.",
    },
    {
      name: "PROPM",
      desc: "Patient-Reported Outcome Performance Measure — tracks patient-reported outcomes across payer networks.",
    },
  ],
  nqf: { name: "Dana Gelb Safran", role: "CEO, National Quality Forum" },
  headwayLeads: [
    { name: "Dr. Jeff Gould", role: "Sr. Medical Director, Headway — leads clinical pilot" },
    { name: "Olivia Davis", role: "CCO, Headway — recruited payer partners" },
  ],
  payers: [
    "CareFirst",
    "Elevance Health (formerly Anthem)",
    "Geisinger",
    "Highmark Health",
    "Kaiser Permanente",
    "BlueCross BlueShield Association",
  ],
  timeline: "Tools available Q3 2025. Immediate rollout possible.",
  conflict: `Headway runs the provider-facing pilot with 100+ therapists and 1,000+ submitted assessments. If NQF measures become the payer standard for reimbursement, Headway — which earns commissions from the same payers funding this coalition — could require all therapists on its platform to comply. That would give Headway (and its strategic investor HCSC, which simultaneously sets reimbursement rates for Headway therapists) structural control over what constitutes "quality" mental health care nationwide.`,
};

export default function CoalitionPanel() {
  return (
    <div style={{ flex: 1, overflowY: "auto", background: "#0c0c0a", padding: "14px" }}>

      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: "11px", color: "#8e44ad", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 4 }}>
          ◈ Industry Coalition
          <Cite url={COALITION.src} label={COALITION.srcLabel} />
        </div>
        <h2 style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: "1.3rem", color: "#d8d0e8",
          margin: "0 0 4px", lineHeight: 1.2,
        }}>
          {COALITION.name}
        </h2>
        <div style={{ fontSize: 12.5, color: "#6a5a70", fontFamily: "'IBM Plex Mono',monospace" }}>
          Org: {COALITION.org} · Launched: {COALITION.launched} · Duration: {COALITION.duration}
        </div>
      </div>

      {/* Goal */}
      <div style={{
        background: "rgba(107,52,160,.07)", borderLeft: "3px solid #6b34a0",
        borderRadius: "0 4px 4px 0", padding: "8px 10px", marginBottom: 14,
      }}>
        <p style={{ fontSize: 12.5, color: "#c0b8d0", lineHeight: 1.7, margin: 0 }}>
          {COALITION.goal}
        </p>
      </div>

      {/* Tools */}
      <SectionLabel>Measurement Tools</SectionLabel>
      {COALITION.tools.map(t => (
        <div key={t.name} style={{
          padding: "8px 10px", marginBottom: 7,
          background: "#111110", borderRadius: 4, border: "1px solid #1a1818",
        }}>
          <div style={{ fontSize: 13, color: "#ddd5c0", fontWeight: 600, marginBottom: 3 }}>{t.name}</div>
          <div style={{ fontSize: 12.5, color: "#9a9075", lineHeight: 1.6 }}>{t.desc}</div>
        </div>
      ))}

      {/* People */}
      <div style={{ marginTop: 12, marginBottom: 12 }}>
        <SectionLabel>Key People</SectionLabel>
        <div style={{ paddingLeft: 6, borderLeft: "2px solid #6b34a0", marginBottom: 7 }}>
          <div style={{ fontSize: 13, color: "#e8e0d0", fontWeight: 600 }}>{COALITION.nqf.name}</div>
          <div style={{ fontSize: 10.5, color: "#aaa080" }}>{COALITION.nqf.role}</div>
        </div>
        {COALITION.headwayLeads.map((p, i) => (
          <div key={i} style={{ paddingLeft: 6, borderLeft: "2px solid #c87d12", marginBottom: 7 }}>
            <div style={{ fontSize: 13, color: "#e8e0d0", fontWeight: 600 }}>{p.name}</div>
            <div style={{ fontSize: 10.5, color: "#aaa080" }}>{p.role}</div>
          </div>
        ))}
      </div>

      {/* Payers */}
      <div style={{ marginBottom: 12 }}>
        <SectionLabel>Payer Members ⚠</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {COALITION.payers.map(p => (
            <span key={p} style={{
              background: "rgba(30,86,160,.1)", border: "1px solid rgba(30,86,160,.25)",
              borderRadius: 3, padding: "3px 7px", fontSize: 12.5, color: "#5a80b0",
              fontFamily: "'IBM Plex Mono',monospace",
            }}>
              {p}
            </span>
          ))}
        </div>
        <div style={{ fontSize: 10.5, color: "#7a7055", marginTop: 6, lineHeight: 1.6 }}>
          Timeline: {COALITION.timeline}
        </div>
      </div>

      {/* Conflict */}
      <div style={{
        background: "rgba(139,32,32,.1)", borderLeft: "3px solid #8b2020",
        borderRadius: "0 4px 4px 0", padding: "10px 12px",
      }}>
        <div style={{ fontSize: "9.5px", color: "#c0392b", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 5 }}>
          ⚠ Structural Conflict of Interest
        </div>
        <p style={{ fontSize: 13, color: "#c0b898", lineHeight: 1.75, margin: 0 }}>
          {COALITION.conflict}
          <Cite url={COALITION.src} label={COALITION.srcLabel} />
        </p>
      </div>
    </div>
  );
}
