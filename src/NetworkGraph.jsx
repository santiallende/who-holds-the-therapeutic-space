import { useState, useEffect, useRef } from "react";
import { NODES, LINKS, NODE_TYPE_COLOR, NODE_TYPE_LABEL, EDGE_TYPES, COMPANIES } from "./data.js";
import { Cite, PersonRow } from "./components.jsx";

// ─── FORCE SIMULATION ────────────────────────────────────────────────────────
function useForce(nodes, links, w, h) {
  const [pos, setPos] = useState(null);
  useEffect(() => {
    if (!w || !h) return;
    const R = Math.min(w, h) * 0.33;
    let arr = nodes.map((n, i) => ({
      ...n,
      x: w/2 + Math.cos((i/nodes.length)*Math.PI*2)*R,
      y: h/2 + Math.sin((i/nodes.length)*Math.PI*2)*R,
      vx:0, vy:0,
    }));
    let frame, iter = 0;
    const tick = () => {
      iter++;
      const byId = id => arr.find(n=>n.id===id);
      for (let i=0;i<arr.length;i++) for (let j=i+1;j<arr.length;j++) {
        const a=arr[i],b=arr[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.sqrt(dx*dx+dy*dy)||1;
        const minD=(a.r||12)+(b.r||12)+28;
        if(d<minD){const f=(minD-d)/d*0.45;a.vx-=dx*f;a.vy-=dy*f;b.vx+=dx*f;b.vy+=dy*f;}
        const rep=950/(d*d);
        a.vx-=(dx/d)*rep;a.vy-=(dy/d)*rep;b.vx+=(dx/d)*rep;b.vy+=(dy/d)*rep;
      }
      links.forEach(l=>{
        const a=byId(l.s),b=byId(l.t);if(!a||!b)return;
        const dx=b.x-a.x,dy=b.y-a.y,d=Math.sqrt(dx*dx+dy*dy)||1;
        const target=l.type==="acquisition"?90:l.type==="board"?115:160;
        const f=(d-target)/d*0.055;
        a.vx+=dx*f;a.vy+=dy*f;b.vx-=dx*f;b.vy-=dy*f;
      });
      const PAD=24;
      arr.forEach(n=>{
        n.vx+=(w/2-n.x)*0.001; n.vy+=(h/2-n.y)*0.001;
        n.vx*=0.82; n.vy*=0.82;
        n.x+=n.vx; n.y+=n.vy;
        n.x=Math.max(n.r+PAD,Math.min(w-n.r-PAD,n.x));
        n.y=Math.max(n.r+PAD,Math.min(h-n.r-PAD-18,n.y));
      });
      setPos(arr.map(n=>({...n})));
      if(iter<520) frame=requestAnimationFrame(tick);
    };
    frame=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(frame);
  },[w,h]); // eslint-disable-line
  return pos;
}

// ─── ARC LAYOUT ──────────────────────────────────────────────────────────────
function arcLayout(nodes, w, h) {
  const ORDER=["platform","public","cautionary","ai","wellness","coalition","vc","pe","insurer"];
  const sorted=[...nodes].sort((a,b)=>{
    const ai=ORDER.indexOf(a.type),bi=ORDER.indexOf(b.type);
    return ai!==bi?ai-bi:(b.r||10)-(a.r||10);
  });
  const pad=72, spacing=(w-pad*2)/(sorted.length-1);
  const baseY=Math.round(h*0.38);
  return sorted.map((n,i)=>({...n,x:pad+i*spacing,y:baseY}));
}

// ─── SHARED HELPERS ──────────────────────────────────────────────────────────
function Stat({k,v}){return(<div style={{fontSize:13}}><span style={{color:"#8a8065"}}>{k}: </span><span style={{color:"#f0c060",fontWeight:600}}>{v}</span></div>);}
function Section({title,children}){return(<div style={{marginBottom:10}}><div style={{fontSize:"11px",color:"#8a8065",letterSpacing:".1em",textTransform:"uppercase",marginBottom:6}}>{title}</div>{children}</div>);}

// ─── NODE DRAWER ─────────────────────────────────────────────────────────────
function NodeDrawer({node,co,onClose}){
  if(!node)return null;
  const c=NODE_TYPE_COLOR[node.type]||"#888";
  return(
    <div onClick={e=>e.stopPropagation()} style={{
      position:"absolute",bottom:0,left:0,right:0,
      background:"#0e0e0c",borderTop:`2px solid ${c}`,
      padding:"12px 14px 16px",maxHeight:"54%",overflowY:"auto",
      zIndex:100,boxShadow:"0 -8px 32px rgba(0,0,0,.7)",
    }}>
      <button onClick={onClose} style={{position:"absolute",top:10,right:12,background:"none",border:"none",color:"#555",fontSize:20,cursor:"pointer",lineHeight:1,padding:0}}>×</button>
      <div style={{marginBottom:10}}>
        <div style={{fontSize:"10px",color:c,letterSpacing:".14em",textTransform:"uppercase",marginBottom:3}}>
          {NODE_TYPE_LABEL[node.type]||node.type}{node.type==="insurer"?" ⚠":""}
        </div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.1rem",color:"#f0e8d8",lineHeight:1.2,fontWeight:700}}>
          {node.label}{co?.src&&<Cite url={co.src} label={co.label}/>}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"5px 14px",marginBottom:10}}>
        {co?.raised&&<Stat k="Raised" v={co.raised}/>}
        {co?.val&&<Stat k="Valuation" v={co.val}/>}
        {co?.status&&<Stat k="Status" v={co.status}/>}
        {co?.hq&&<Stat k="HQ" v={co.hq}/>}
        {co?.founded&&<Stat k="Founded" v={co.founded}/>}
        {co?.providers&&<Stat k="Network" v={co.providers}/>}
        {co?.model&&<Stat k="Model" v={co.model}/>}
      </div>
      {co?.executives?.length>0&&<Section title="Executives">{co.executives.map((e,i)=><PersonRow key={i} person={e}/>)}</Section>}
      {co?.board?.length>0&&<Section title="Board / Investors">{co.board.map((b,i)=><PersonRow key={i} person={b}/>)}</Section>}
      {(node.conflict||co?.conflict)&&(
        <Section title="⚠ Structural Conflict">
          <div style={{background:"rgba(139,32,32,.1)",borderLeft:"3px solid #8b2020",padding:"8px 10px",borderRadius:"0 4px 4px 0"}}>
            <p style={{fontSize:12.5,color:"#c0b090",lineHeight:1.7,margin:0}}>
              {node.conflict||co.conflict}
            </p>
            {(co?.src||node.src)&&(
              <a href={co?.src||node.src} target="_blank" rel="noopener noreferrer"
                style={{display:"inline-block",marginTop:6,fontSize:10.5,color:"#8bafd4",textDecoration:"none",opacity:0.85}}>
                ↗ {co?.srcLabel||node.srcLabel||"Source"}
              </a>
            )}
          </div>
        </Section>
      )}
      {co?.coalitionRole&&<Section title="◈ NQF Coalition Role"><p style={{fontSize:12,color:"#b0a0c8",lineHeight:1.65,margin:0}}>{co.coalitionRole}</p></Section>}
    </div>
  );
}

// ─── LEGEND BAR ──────────────────────────────────────────────────────────────
function LegendBar({viewMode,setViewMode}){
  return(
    <div style={{
      display:"grid",
      gridTemplateColumns:"1fr auto 1fr",
      alignItems:"center",
      padding:"5px 10px",
      background:"#0c0c0a",
      borderBottom:"1px solid #1a1a14",
      flexShrink:0,
      gap:"0 12px",
    }}>

      {/* Left: edge type legend */}
      <div style={{display:"flex",alignItems:"center",gap:"4px 10px",flexWrap:"wrap"}}>
        {Object.entries(EDGE_TYPES).map(([k,v])=>(
          <div key={k} style={{display:"flex",alignItems:"center",gap:4}}>
            <svg width={18} height={8}><line x1={0} y1={4} x2={18} y2={4} stroke={v.color} strokeWidth={v.width} strokeDasharray={v.dash||undefined} strokeOpacity={0.85}/></svg>
            <span style={{fontSize:10,color:"#8a8065",fontFamily:"'IBM Plex Mono',monospace"}}>{k}</span>
          </div>
        ))}
      </div>

      {/* Center: view toggle */}
      <div style={{display:"flex",background:"#141412",border:"1px solid #2e2c20",borderRadius:5,overflow:"hidden"}}>
        {[["arc","Arc"],["force","Force"]].map(([m,label])=>(
          <button key={m} onClick={()=>setViewMode(m)} style={{
            background:viewMode===m?"#3a3420":"transparent",
            border:"none",
            borderRight:m==="arc"?"1px solid #2e2c20":"none",
            color:viewMode===m?"#f0c040":"#6a5a38",
            fontSize:11,padding:"4px 16px",cursor:"pointer",
            fontFamily:"'IBM Plex Mono',monospace",
            fontWeight:viewMode===m?"600":"400",
            letterSpacing:".05em",
            transition:"background .12s,color .12s",
          }}>{label}</button>
        ))}
      </div>

      {/* Right: node type color legend */}
      <div style={{display:"flex",alignItems:"center",gap:"3px 10px",flexWrap:"wrap",justifyContent:"flex-end"}}>
        {Object.entries(NODE_TYPE_COLOR).map(([type,color])=>(
          <div key={type} style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{width:9,height:9,borderRadius:"50%",background:color,opacity:0.85,flexShrink:0}}/>
            <span style={{fontSize:9.5,color:"#7a7060",fontFamily:"'IBM Plex Mono',monospace"}}>
              {NODE_TYPE_LABEL[type]||type}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}

// ─── NODE RENDERER ────────────────────────────────────────────────────────────
function NodeG({n, isSel, isHov, isDim, activeId, onSelect, onHover, onLeave, hideLabel}){
  const c=NODE_TYPE_COLOR[n.type]||"#888";
  const isBig=n.type==="platform"||n.type==="public";
  const isIns=n.type==="insurer";
  const isWarn=n.type==="cautionary";
  return(
    <g style={{cursor:"pointer"}}
      onClick={e=>{e.stopPropagation();onSelect(isSel?null:n);}}
      onMouseEnter={()=>onHover(n.id)}
      onMouseLeave={onLeave}>
      {(isSel||isHov)&&<circle cx={n.x} cy={n.y} r={n.r+8} fill="none" stroke={c} strokeWidth={1.5} opacity={0.5}/>}
      {isIns&&<circle cx={n.x} cy={n.y} r={n.r+5} fill="none" stroke="#c0392b" strokeWidth={0.8} opacity={isDim?0.07:0.32}/>}
      {isWarn&&<circle cx={n.x} cy={n.y} r={n.r+5} fill="none" stroke="#c0392b" strokeWidth={0.8} strokeDasharray="3 2" opacity={isDim?0.07:0.32}/>}
      {n.type==="ai"&&<circle cx={n.x} cy={n.y} r={n.r+4} fill="none" stroke="#8e44ad" strokeWidth={0.8} opacity={isDim?0.04:0.24}/>}
      <circle cx={n.x} cy={n.y} r={n.r} fill={c}
        fillOpacity={isDim?0.15:isBig?0.92:0.62}
        stroke={(isIns||isWarn)?"#c0392b":n.type==="ai"?"#8e44ad":"rgba(255,255,255,0.08)"}
        strokeWidth={(isIns||isWarn||n.type==="ai")?1.2:0.5}
        style={isBig&&!isDim?{filter:"url(#glow)"}:{}}/>
      {isIns&&<text x={n.x} y={n.y-n.r-5} textAnchor="middle" fontSize={9} fill={isDim?"#442020":"#e05050"} style={{pointerEvents:"none"}}>⚠</text>}
      {n.type==="coalition"&&<text x={n.x} y={n.y-n.r-5} textAnchor="middle" fontSize={9} fill={isDim?"#2a1a2a":"#8e44ad"} style={{pointerEvents:"none"}}>◈</text>}
      {!hideLabel&&<text x={n.x} y={n.y+n.r+14} textAnchor="middle"
        fontSize={isBig?12:10.5}
        fill={isDim?"#252318":isBig?"#ddd5c0":"#a89880"}
        fontFamily="'IBM Plex Mono',monospace" fontWeight={isBig?"600":"400"}
        style={{pointerEvents:"none"}}>{n.label}</text>}
    </g>
  );
}

// ─── ARC DIAGRAM ─────────────────────────────────────────────────────────────

// Insurer node IDs — matches data.js exactly
const INSURER_IDS = ["cigna_v","optum_v","cvs_v","elevance","kp_v","uhg","centene","hcsc"];

function ArcDiagram({sz,onSelect,selected}){
  const [hov,setHov]=useState(null);
  const positions=arcLayout(NODES,sz.w,sz.h);
  const byId=id=>positions.find(n=>n.id===id);
  const activeId=hov||selected?.id;
  const baseY=Math.round(sz.h*0.38);

  const degree={};
  LINKS.forEach(l=>{degree[l.s]=(degree[l.s]||0)+1;degree[l.t]=(degree[l.t]||0)+1;});

  const ORDER=["platform","public","cautionary","ai","wellness","coalition","vc","pe","insurer"];
  const GROUP_DEFS=[
    {types:["platform","public"],   label:"Platforms",    color:"#c07b10"},
    {types:["cautionary"],          label:"Cautionary",   color:"#8b2020"},
    {types:["ai","wellness"],       label:"AI/Wellness",  color:"#1a7060"},
    {types:["coalition"],           label:"Coalition",    color:"#703060"},
    {types:["vc","pe"],             label:"VC / PE",      color:"#7a3010"},
    {types:["insurer"],             label:"Insurers ⚠",   color:"#1a4b8e"},
  ];

  return(
    <svg width={sz.w} height={sz.h} style={{display:"block"}}>
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="glowB"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>

      {/* Insurer background highlight bands — clipped to node area, reduced opacity so stacking doesn't compound */}
      {positions
        .filter(n => INSURER_IDS.includes(n.id))
        .map(n => (
          <rect key={`ins-bg-${n.id}`}
            x={n.x - (n.r || 12) - 10}
            y={baseY - 30}
            width={(n.r || 12) * 2 + 20}
            height={60}
            fill="rgba(139,32,32,.06)"
            style={{pointerEvents:"none"}}
          />
        ))
      }

      {/* Single continuous baseline with group labels floating above it */}
      {(()=>{
        const labelY = baseY + 118;
        const allXs = positions.map(n => n.x);
        const lineMinX = Math.min(...allXs) - 12;
        const lineMaxX = Math.max(...allXs) + 12;
        return(
          <g>
            <line x1={lineMinX} y1={labelY-8} x2={lineMaxX} y2={labelY-8} stroke="#3a3828" strokeWidth={0.8} strokeOpacity={1}/>
            {GROUP_DEFS.map((grp,gi)=>{
              const xs=[];
              grp.types.forEach(t=>positions.filter(n=>n.type===t).forEach(n=>xs.push(n.x)));
              if(!xs.length)return null;
              const midX=(Math.min(...xs)+Math.max(...xs))/2;
              return(
                <text key={gi} x={midX} y={labelY+8} textAnchor="middle" fontSize={9} fill={grp.color} opacity={0.85}
                  fontFamily="'IBM Plex Mono',monospace" letterSpacing=".08em">{grp.label}</text>
              );
            })}
          </g>
        );
      })()}

      {/* Baseline */}
      <line x1={40} y1={baseY} x2={sz.w-40} y2={baseY} stroke="#222018" strokeWidth={1}/>

      {/* Arcs — behind nodes */}
      {LINKS.map((l,i)=>{
        const a=byId(l.s),b=byId(l.t);if(!a||!b)return null;
        const cfg=EDGE_TYPES[l.type]||EDGE_TYPES.investment;
        const isActive=activeId&&(l.s===activeId||l.t===activeId);
        const isDim=activeId&&!isActive;
        const mx=(a.x+b.x)/2,span=Math.abs(b.x-a.x);
        const arcH=Math.min(span*0.62,sz.h*0.34);
        return(
          <path key={i} d={`M ${a.x} ${baseY} Q ${mx} ${baseY-arcH} ${b.x} ${baseY}`}
            fill="none" stroke={cfg.color}
            strokeWidth={isActive?Math.max(cfg.width*2.2,2):cfg.width}
            strokeOpacity={isDim?0.04:isActive?0.92:0.32}
            strokeDasharray={cfg.dash||undefined}
            style={{transition:"stroke-opacity .1s,stroke-width .1s",pointerEvents:"none"}}/>
        );
      })}

      {/* Nodes */}
      {positions.map(n=>{
        const isDim=activeId&&activeId!==n.id&&!LINKS.some(l=>(l.s===activeId&&l.t===n.id)||(l.t===activeId&&l.s===n.id));
        const isBig=n.type==="platform"||n.type==="public";
        const deg=degree[n.id]||0;
        const c=NODE_TYPE_COLOR[n.type]||"#888";
        const isSel=selected?.id===n.id,isHov=hov===n.id;
        return(
          <g key={n.id}>
            {deg>3&&!isDim&&<circle cx={n.x} cy={baseY} r={n.r+3} fill={c} fillOpacity={0.1} style={{filter:"url(#glowB)"}}/>}
            <NodeG n={{...n,y:baseY}} isSel={isSel} isHov={isHov} isDim={isDim} activeId={activeId}
              onSelect={onSelect} onHover={setHov} onLeave={()=>setHov(null)} hideLabel/>
            <text transform={`translate(${n.x},${baseY+n.r+8}) rotate(-48)`}
              textAnchor="end" fontSize={isBig?10.5:9.5}
              fill={isDim?"#252318":isBig?"#ddd5c0":"#a89880"}
              fontFamily="'IBM Plex Mono',monospace" fontWeight={isBig?"600":"400"}
              style={{pointerEvents:"none"}}>{n.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── FORCE GRAPH ─────────────────────────────────────────────────────────────
function ForceGraph({sz,onSelect,selected,animOffset}){
  const [hov,setHov]=useState(null);
  const pos=useForce(NODES,LINKS,sz.w,sz.h);
  if(!pos)return null;
  const byId=id=>pos.find(n=>n.id===id);
  const activeId=hov||selected?.id;
  return(
    <svg width={sz.w} height={sz.h} style={{display:"block"}}>
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {LINKS.map((l,i)=>{
        const a=byId(l.s),b=byId(l.t);if(!a||!b)return null;
        const cfg=EDGE_TYPES[l.type]||EDGE_TYPES.investment;
        const isActive=activeId&&(l.s===activeId||l.t===activeId);
        const isDim=activeId&&!isActive;
        return(
          <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={cfg.color} strokeWidth={isActive?cfg.width*2.5:cfg.width}
            strokeOpacity={isDim?0.04:isActive?0.95:0.5}
            strokeDasharray={cfg.dash||undefined}
            strokeDashoffset={l.type==="acquisition"?-animOffset:undefined}
            style={{transition:"stroke-opacity .12s,stroke-width .12s",pointerEvents:"none"}}/>
        );
      })}
      {pos.map(n=>{
        const isDim=activeId&&activeId!==n.id&&!LINKS.some(l=>(l.s===activeId&&l.t===n.id)||(l.t===activeId&&l.s===n.id));
        return(
          <NodeG key={n.id} n={n} isSel={selected?.id===n.id} isHov={hov===n.id}
            isDim={isDim} activeId={activeId}
            onSelect={onSelect} onHover={setHov} onLeave={()=>setHov(null)}/>
        );
      })}
    </svg>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function NetworkGraph(){
  const ref=useRef(null);
  const [sz,setSz]=useState({w:0,h:0});
  const [selected,setSelected]=useState(null);
  const [animOffset,setAnimOffset]=useState(0);
  const [viewMode,setViewMode]=useState("arc");

  useEffect(()=>{
    if(!ref.current)return;
    const ro=new ResizeObserver(es=>{const r=es[0].contentRect;setSz({w:r.width,h:r.height});});
    ro.observe(ref.current);
    return()=>ro.disconnect();
  },[]);

  useEffect(()=>{
    let id;const tick=()=>{setAnimOffset(o=>(o+0.3)%24);id=requestAnimationFrame(tick);};
    id=requestAnimationFrame(tick);return()=>cancelAnimationFrame(id);
  },[]);

  const selectedCo=selected?COMPANIES.find(c=>c.id===selected.id):null;

  return(
    <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"hidden",position:"relative"}}>
      <LegendBar viewMode={viewMode} setViewMode={setViewMode}/>
      <div ref={ref}
        style={{flex:1,position:"relative",overflow:"hidden",background:"#090907"}}
        onClick={()=>setSelected(null)}>
        {sz.w>0&&(
          viewMode==="arc"
            ?<ArcDiagram sz={sz} onSelect={setSelected} selected={selected}/>
            :<ForceGraph sz={sz} onSelect={setSelected} selected={selected} animOffset={animOffset}/>
        )}
        <div style={{position:"absolute",bottom:8,left:0,right:0,textAlign:"center",
          fontSize:"10px",color:"#6a6050",fontFamily:"'IBM Plex Mono',monospace",pointerEvents:"none"}}>
          {viewMode==="arc"
            ?"Arc height = relationship distance · Hover to highlight · Click for full detail"
            :"Hover a node to highlight its connections · Click for full detail"}
        </div>
        {selected&&<NodeDrawer node={selected} co={selectedCo} onClose={()=>setSelected(null)}/>}
      </div>
    </div>
  );
}
