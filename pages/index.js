import { useState, useRef, useEffect } from "react";
import Head from "next/head";

const PROFILES = {
  sport: { label: "Sport 🏋️", calories: 2100, carbs: 220, protein: 160, fat: 64, color: "#ff6b35" },
  rest:  { label: "Repos 🚶", calories: 1750, carbs: 75,  protein: 170, fat: 85, color: "#4da6ff" },
};
const WATER_GOAL = 2500;
const STEPS_GOAL = 10000;
const WEIGHT_START = 83;
const WEIGHT_GOAL  = 78;
const MEALS = ["🌅 Petit-déj", "☀️ Déjeuner", "🌙 Dîner", "⚡ Snacks"];

const QUICK_SPORTS = [
  { icon:"🚶", name:"Marche",        desc:"30 min", kcal:130 },
  { icon:"🚶", name:"Marche",        desc:"1h",     kcal:260 },
  { icon:"🚶", name:"Marche rapide", desc:"45 min", kcal:220 },
  { icon:"🏋️", name:"Muscu",         desc:"45 min", kcal:200 },
  { icon:"🏋️", name:"Muscu",         desc:"1h",     kcal:280 },
  { icon:"🔥", name:"Cross Training",desc:"45 min", kcal:380 },
  { icon:"🔥", name:"Cross Training",desc:"1h",     kcal:480 },
  { icon:"💪", name:"Cross Renfo",   desc:"45 min", kcal:300 },
  { icon:"🏃", name:"Course",        desc:"30 min", kcal:310 },
  { icon:"🚴", name:"Vélo",          desc:"45 min", kcal:340 },
];

const QUICK_FOODS = {
  "🌅 Petit-déj": [
    { name:"Oeufs entiers x3",      cal:210, protein:18, carbs:1,  fat:15 },
    { name:"Blanc de poulet 100g",  cal:110, protein:23, carbs:0,  fat:1  },
    { name:"Fromage blanc 0% 200g", cal:100, protein:18, carbs:7,  fat:0  },
    { name:"Whey shake 30g",        cal:120, protein:24, carbs:3,  fat:1  },
    { name:"Flocons avoine 60g",    cal:220, protein:7,  carbs:38, fat:4  },
    { name:"Banane",                cal:90,  protein:1,  carbs:21, fat:0  },
    { name:"Pain complet x2",       cal:160, protein:6,  carbs:28, fat:2  },
    { name:"Avocat 1/2",            cal:120, protein:1,  carbs:3,  fat:11 },
  ],
  "☀️ Déjeuner": [
    { name:"Blanc de poulet 150g",  cal:165, protein:35, carbs:0,  fat:2  },
    { name:"Saumon 150g",           cal:280, protein:30, carbs:0,  fat:17 },
    { name:"Steak haché 5% 150g",   cal:195, protein:30, carbs:0,  fat:8  },
    { name:"Riz complet cuit 150g", cal:165, protein:4,  carbs:34, fat:1  },
    { name:"Patate douce 200g",     cal:180, protein:3,  carbs:40, fat:0  },
    { name:"Légumes verts",         cal:40,  protein:3,  carbs:5,  fat:0  },
    { name:"Thon boîte 100g",       cal:100, protein:25, carbs:0,  fat:1  },
    { name:"Lentilles cuites 150g", cal:175, protein:13, carbs:25, fat:1  },
  ],
  "🌙 Dîner": [
    { name:"Blanc de poulet 150g",  cal:165, protein:35, carbs:0,  fat:2  },
    { name:"Saumon 150g",           cal:280, protein:30, carbs:0,  fat:17 },
    { name:"Oeufs brouillés x3",    cal:210, protein:18, carbs:1,  fat:15 },
    { name:"Steak haché 5% 150g",   cal:195, protein:30, carbs:0,  fat:8  },
    { name:"Légumes rôtis",         cal:80,  protein:3,  carbs:12, fat:2  },
    { name:"Salade verte",          cal:20,  protein:1,  carbs:2,  fat:0  },
    { name:"Huile d'olive 1 cs",    cal:90,  protein:0,  carbs:0,  fat:10 },
  ],
  "⚡ Snacks": [
    { name:"Yaourt grec 0% 150g",   cal:90,  protein:15, carbs:6,  fat:0  },
    { name:"Amandes 20g",           cal:120, protein:4,  carbs:2,  fat:11 },
    { name:"Barre protéinée",       cal:200, protein:20, carbs:18, fat:6  },
    { name:"Blanc de poulet 80g",   cal:88,  protein:18, carbs:0,  fat:1  },
    { name:"Cottage cheese 100g",   cal:85,  protein:11, carbs:3,  fat:3  },
    { name:"Whey shake 30g",        cal:120, protein:24, carbs:3,  fat:1  },
  ],
};

const QUICK_DRINKS = [
  { name:"Eau",            ml:250, cal:0   },
  { name:"Eau",            ml:500, cal:0   },
  { name:"Café noir",      ml:200, cal:5   },
  { name:"Thé vert",       ml:300, cal:0   },
  { name:"Whey shake",     ml:350, cal:120 },
  { name:"Lait demi-écrémé", ml:200, cal:90 },
  { name:"Jus orange",     ml:200, cal:90  },
  { name:"Soda",           ml:330, cal:140 },
];

// ── API helpers ───────────────────────────────────────────────────────────────
async function apiLoadDay(date) {
  try {
    const r = await fetch(`/api/day?date=${date}`);
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

async function apiSaveDay(date, data) {
  try {
    await fetch(`/api/day?date=${date}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {}
}

async function apiListDays() {
  try {
    const r = await fetch('/api/days');
    if (!r.ok) return [];
    return await r.json();
  } catch { return []; }
}

// ── Utils ─────────────────────────────────────────────────────────────────────
function todayKey() { return new Date().toISOString().split("T")[0]; }
function fmtDate(key, short = false) {
  const d = new Date(key + "T12:00:00");
  if (short) return d.toLocaleDateString("fr-FR", { weekday:"short", day:"numeric", month:"short" });
  return d.toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" });
}
function emptyDay() {
  return { profile:"sport", foods:[], drinks:[], sports:[], steps:0, weight:null, note:"" };
}
function dayTotals(day) {
  const t = (day.foods||[]).reduce((a,f)=>({cal:a.cal+(f.cal||0),protein:a.protein+(f.protein||0),carbs:a.carbs+(f.carbs||0),fat:a.fat+(f.fat||0)}),{cal:0,protein:0,carbs:0,fat:0});
  t.cal    += (day.drinks||[]).reduce((s,d)=>s+(d.cal||0),0);
  t.water   = (day.drinks||[]).filter(d=>["Eau","Thé vert"].includes(d.name)).reduce((s,d)=>s+(d.ml||0),0);
  t.burned  = (day.sports||[]).reduce((s,sp)=>s+(sp.kcal||0),0);
  return t;
}

async function callAI(prompt) {
  const r = await fetch("/api/ai", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:600, messages:[{role:"user",content:prompt}] })
  });
  const d = await r.json();
  return d.content?.map(i=>i.text||"").join("")||"";
}

// ── Shared UI ─────────────────────────────────────────────────────────────────
function Ring({ val, max, color, size=46 }) {
  const r=size/2-5, circ=2*Math.PI*r, pct=Math.min(val/max,1);
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e1e1e" strokeWidth="4"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${pct*circ} ${circ}`} strokeLinecap="round"/>
    </svg>
  );
}

function Sheet({ onClose, children }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={onClose}>
      <div style={{background:"#0f0f0f",borderRadius:"20px 20px 0 0",width:"100%",maxHeight:"90vh",overflow:"auto",padding:"18px 15px 48px"}} onClick={e=>e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// ── Sport Sheet ───────────────────────────────────────────────────────────────
function SportSheet({ onAdd, onClose }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");

  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true); setErr(""); setRes(null);
    try {
      const raw = await callAI(`Expert physiologie sport. Estime les calories brûlées pour un homme 40 ans, 83kg, musclé et actif.
Activité : "${text}"
Réponds UNIQUEMENT en JSON sans backticks :
{"name":"nom court","icon":"emoji","kcal":000,"duration":"durée","intensity":"Faible|Modérée|Élevée|Très élevée","note":"conseil court"}`);
      setRes(JSON.parse(raw.replace(/```json|```/g,"").trim()));
    } catch { setErr("Analyse impossible. Reformule."); }
    setLoading(false);
  };

  return (
    <Sheet onClose={onClose}>
      <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>🏃 Ajouter une activité</div>
      <div style={{fontSize:11,color:"#555",marginBottom:12}}>Décris ton activité — l'IA estime les calories brûlées.</div>
      <textarea value={text} onChange={e=>{setText(e.target.value);setRes(null);setErr("");}}
        placeholder="Ex : Cross training 45 min intensif, Marche 1h30, Muscu 1h poussée..."
        style={{width:"100%",background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:12,color:"#f0ece4",padding:"12px",fontSize:13,lineHeight:1.6,resize:"none",outline:"none",boxSizing:"border-box",minHeight:70,marginBottom:10}}/>
      {!res && (
        <div style={{marginBottom:10}}>
          <div style={{fontSize:9,color:"#444",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Raccourcis</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {QUICK_SPORTS.map((s,i)=>(
              <button key={i} onClick={()=>{setRes({name:s.name,icon:s.icon,kcal:s.kcal,duration:s.desc,intensity:"Modérée",note:""});setText(`${s.name} ${s.desc}`);}}
                style={{padding:"5px 10px",background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:10,color:"#888",fontSize:10,cursor:"pointer",display:"flex",gap:5,alignItems:"center"}}>
                <span>{s.icon}</span><span>{s.name}</span><span style={{color:"#555"}}>{s.desc}</span>
                <span style={{color:"#22c55e",fontFamily:"monospace"}}>~{s.kcal}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {!res && (
        <button onClick={analyze} disabled={loading||!text.trim()} style={{width:"100%",padding:"13px",background:text.trim()?"#22c55e":"#222",border:"none",borderRadius:12,color:"#fff",fontWeight:700,fontSize:14,cursor:text.trim()?"pointer":"default",opacity:loading?0.6:1,marginBottom:10}}>
          {loading?"⏳ Calcul en cours...":"✨ Estimer les calories brûlées"}
        </button>
      )}
      {err && <div style={{color:"#ef4444",fontSize:12,marginBottom:10}}>{err}</div>}
      {res && (
        <div style={{background:"#161616",borderRadius:14,padding:14}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <div style={{fontSize:28}}>{res.icon}</div>
            <div><div style={{fontWeight:700,fontSize:15}}>{res.name}</div><div style={{fontSize:11,color:"#555"}}>{res.duration} · {res.intensity}</div></div>
          </div>
          <div style={{background:"#1a1a1a",borderRadius:11,padding:"11px 14px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:12,color:"#888"}}>Calories brûlées</div>
            <div style={{fontFamily:"monospace",fontSize:22,fontWeight:700,color:"#22c55e"}}>−{res.kcal} kcal</div>
          </div>
          {res.note && <div style={{background:"#1a1a1a",borderRadius:9,padding:"9px 11px",marginBottom:12,fontSize:11,color:"#888",lineHeight:1.6,borderLeft:"2px solid #22c55e"}}>💡 {res.note}</div>}
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{setRes(null);setText("");}} style={{flex:1,padding:"10px",background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:11,color:"#888",fontWeight:600,fontSize:12,cursor:"pointer"}}>← Modifier</button>
            <button onClick={()=>{onAdd({name:res.name,icon:res.icon,kcal:res.kcal,duration:res.duration,intensity:res.intensity,id:Date.now()});onClose();}}
              style={{flex:2,padding:"10px",background:"#22c55e",border:"none",borderRadius:11,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>Ajouter à ma journée</button>
          </div>
        </div>
      )}
    </Sheet>
  );
}

// ── Text Meal Sheet ───────────────────────────────────────────────────────────
function TextSheet({ profile, activeMeal, setActiveMeal, onAdd, onClose }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");
  const EXAMPLES = ["150g poulet grillé, riz 100g, légumes","omelette 3 oeufs, salade","saumon 150g, patate douce 200g","steak 150g, haricots verts"];
  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true); setErr(""); setRes(null);
    try {
      const raw = await callAI(`Expert nutrition. Analyse ce repas.\nRepas : "${text}"\nRéponds UNIQUEMENT en JSON sans backticks :\n{"name":"nom","cal":000,"protein":00,"carbs":00,"fat":00,"detail":"détail","confidence":"high|medium|low"}`);
      setRes(JSON.parse(raw.replace(/```json|```/g,"").trim()));
    } catch { setErr("Analyse impossible."); }
    setLoading(false);
  };
  return (
    <Sheet onClose={onClose}>
      <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>✍️ Décrire un repas</div>
      <div style={{display:"flex",gap:5,marginBottom:10,overflowX:"auto",paddingBottom:3}}>
        {MEALS.map(m=>(<button key={m} onClick={()=>setActiveMeal(m)} style={{padding:"5px 10px",borderRadius:18,whiteSpace:"nowrap",background:activeMeal===m?profile.color:"#1a1a1a",border:activeMeal===m?"none":"1px solid #2a2a2a",color:activeMeal===m?"#fff":"#555",fontWeight:600,fontSize:10,cursor:"pointer"}}>{m}</button>))}
      </div>
      <textarea value={text} onChange={e=>{setText(e.target.value);setRes(null);setErr("");}} placeholder="Ex : 150g saumon grillé, riz basmati 100g, salade verte..."
        style={{width:"100%",background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:12,color:"#f0ece4",padding:"12px",fontSize:13,lineHeight:1.6,resize:"none",outline:"none",boxSizing:"border-box",minHeight:75,marginBottom:10}}/>
      {!res&&(<div style={{marginBottom:10}}><div style={{fontSize:9,color:"#444",textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Exemples</div><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{EXAMPLES.map((ex,i)=>(<button key={i} onClick={()=>setText(ex)} style={{padding:"4px 9px",background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:10,color:"#666",fontSize:10,cursor:"pointer"}}>{ex}</button>))}</div></div>)}
      {!res&&(<button onClick={analyze} disabled={loading||!text.trim()} style={{width:"100%",padding:"13px",background:text.trim()?profile.color:"#222",border:"none",borderRadius:12,color:"#fff",fontWeight:700,fontSize:14,cursor:text.trim()?"pointer":"default",opacity:loading?0.6:1,marginBottom:10}}>{loading?"⏳ Analyse...":"✨ Calculer les macros"}</button>)}
      {err&&<div style={{color:"#ef4444",fontSize:12,marginBottom:10}}>{err}</div>}
      {res&&(
        <div style={{background:"#161616",borderRadius:14,padding:14}}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:8}}>{res.name}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:7,marginBottom:10,textAlign:"center"}}>
            {[{label:"Kcal",val:res.cal,color:profile.color},{label:"Prot.",val:res.protein+"g",color:"#ff6b35"},{label:"Gluc.",val:res.carbs+"g",color:"#facc15"},{label:"Lip.",val:res.fat+"g",color:"#a78bfa"}].map(x=>(<div key={x.label} style={{background:"#1a1a1a",borderRadius:9,padding:"8px 4px"}}><div style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:x.color}}>{x.val}</div><div style={{fontSize:8,color:"#444",marginTop:2,textTransform:"uppercase"}}>{x.label}</div></div>))}
          </div>
          {res.detail&&<div style={{background:"#1a1a1a",borderRadius:9,padding:"8px 10px",marginBottom:9,fontSize:11,color:"#888",lineHeight:1.7}}>{res.detail}</div>}
          <div style={{fontSize:9,color:"#444",marginBottom:10}}>{res.confidence==="high"?"🟢 Confiance élevée":res.confidence==="medium"?"🟡 Confiance moyenne":"🔴 Faible"}</div>
          <div style={{display:"flex",gap:4,marginBottom:10,overflowX:"auto"}}>
            {MEALS.map(m=>(<button key={m} onClick={()=>setActiveMeal(m)} style={{padding:"3px 8px",borderRadius:11,whiteSpace:"nowrap",background:activeMeal===m?profile.color:"#0f0f0f",border:activeMeal===m?"none":"1px solid #222",color:activeMeal===m?"#fff":"#555",fontSize:9,cursor:"pointer"}}>{m}</button>))}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{setRes(null);setText("");}} style={{flex:1,padding:"10px",background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:11,color:"#888",fontWeight:600,fontSize:12,cursor:"pointer"}}>← Modifier</button>
            <button onClick={()=>{onAdd({name:res.name,cal:res.cal,protein:res.protein,carbs:res.carbs,fat:res.fat,meal:activeMeal,id:Date.now()});onClose();}} style={{flex:2,padding:"10px",background:profile.color,border:"none",borderRadius:11,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>Ajouter à {activeMeal}</button>
          </div>
        </div>
      )}
    </Sheet>
  );
}

function FoodSheet({ profile, activeMeal, setActiveMeal, onAdd, onClose }) {
  const [c, setC] = useState({name:"",cal:"",protein:"",carbs:"",fat:""});
  return (
    <Sheet onClose={onClose}>
      <div style={{fontWeight:700,fontSize:15,marginBottom:11}}>🍽️ Aliments rapides</div>
      <div style={{display:"flex",gap:5,marginBottom:11,overflowX:"auto",paddingBottom:3}}>
        {MEALS.map(m=>(<button key={m} onClick={()=>setActiveMeal(m)} style={{padding:"5px 10px",borderRadius:18,whiteSpace:"nowrap",background:activeMeal===m?profile.color:"#1a1a1a",border:activeMeal===m?"none":"1px solid #2a2a2a",color:activeMeal===m?"#fff":"#555",fontWeight:600,fontSize:10,cursor:"pointer"}}>{m}</button>))}
      </div>
      {(QUICK_FOODS[activeMeal]||[]).map((f,i)=>(<button key={i} onClick={()=>{onAdd({...f,meal:activeMeal,id:Date.now()+i});onClose();}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",background:"#1a1a1a",border:"1px solid #222",borderRadius:10,padding:"10px 12px",marginBottom:5,cursor:"pointer",color:"#f0ece4"}}><span style={{fontWeight:500,fontSize:13}}>{f.name}</span><span style={{fontSize:9,color:"#555",fontFamily:"monospace"}}>{f.cal}kcal P{f.protein} G{f.carbs} L{f.fat}</span></button>))}
      <div style={{borderTop:"1px solid #1e1e1e",paddingTop:11,marginTop:4}}>
        <div style={{fontSize:10,color:"#444",marginBottom:7}}>Saisie manuelle :</div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {[["name","Nom",2],["cal","Kcal",1],["protein","P.",1],["carbs","G.",1],["fat","L.",1]].map(([k,ph,fl])=>(<input key={k} placeholder={ph} value={c[k]} onChange={e=>setC(x=>({...x,[k]:e.target.value}))} type={k==="name"?"text":"number"} style={{flex:fl,minWidth:40,background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:7,color:"#f0ece4",padding:"7px",fontSize:12}}/>))}
          <button onClick={()=>{if(!c.name||!c.cal)return;onAdd({name:c.name,cal:+c.cal,protein:+c.protein||0,carbs:+c.carbs||0,fat:+c.fat||0,meal:activeMeal,id:Date.now()});onClose();}} style={{padding:"7px 13px",background:profile.color,border:"none",borderRadius:7,color:"#fff",fontWeight:700,cursor:"pointer"}}>+</button>
        </div>
      </div>
    </Sheet>
  );
}

function DrinkSheet({ onAdd, onClose }) {
  return (
    <Sheet onClose={onClose}>
      <div style={{fontWeight:700,fontSize:15,marginBottom:11}}>💧 Ajouter une boisson</div>
      {QUICK_DRINKS.map((d,i)=>(<button key={i} onClick={()=>{onAdd({...d,id:Date.now()+i});onClose();}} style={{display:"flex",justifyContent:"space-between",width:"100%",background:"#1a1a1a",border:"1px solid #222",borderRadius:10,padding:"10px 12px",marginBottom:5,cursor:"pointer",color:"#f0ece4"}}><span style={{fontWeight:500}}>{d.name} <span style={{color:"#444",fontSize:10}}>{d.ml}ml</span></span><span style={{fontFamily:"monospace",fontSize:11,color:"#4da6ff"}}>{d.cal} kcal</span></button>))}
    </Sheet>
  );
}

function PhotoSheet({ profile, activeMeal, setActiveMeal, onAdd, onClose }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");
  const ref = useRef();
  const analyze = async () => {
    if (!file) return;
    setLoading(true); setErr(""); setRes(null);
    try {
      const b64 = await new Promise((ok,ko)=>{const r=new FileReader();r.onload=()=>ok(r.result.split(",")[1]);r.onerror=ko;r.readAsDataURL(file);});
      const resp = await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:file.type||"image/jpeg",data:b64}},{type:"text",text:`Analyse ce repas. JSON sans backticks:\n{"name":"nom","cal":000,"protein":00,"carbs":00,"fat":00,"description":"court","confidence":"high|medium|low"}`}]}]})});
      const data = await resp.json();
      const text = data.content?.map(i=>i.text||"").join("")||"";
      setRes(JSON.parse(text.replace(/```json|```/g,"").trim()));
    } catch { setErr("Analyse impossible."); }
    setLoading(false);
  };
  return (
    <Sheet onClose={onClose}>
      <div style={{fontWeight:700,fontSize:15,marginBottom:5}}>📷 Analyser par photo</div>
      <input ref={ref} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(!f)return;setFile(f);setRes(null);setPreview(URL.createObjectURL(f));}}/>
      {!preview?(<button onClick={()=>ref.current.click()} style={{width:"100%",padding:"32px 18px",background:"#1a1a1a",border:"2px dashed #2a2a2a",borderRadius:12,color:"#555",fontSize:13,cursor:"pointer",marginBottom:11}}>📸 Prendre / choisir une photo</button>):(<div style={{marginBottom:11}}><img src={preview} alt="" style={{width:"100%",borderRadius:11,maxHeight:180,objectFit:"cover"}}/><button onClick={()=>{setFile(null);setPreview(null);setRes(null);}} style={{marginTop:5,padding:"4px 11px",background:"#1a1a1a",border:"1px solid #222",borderRadius:7,color:"#555",fontSize:10,cursor:"pointer"}}>Changer</button></div>)}
      {preview&&!res&&(<button onClick={analyze} disabled={loading} style={{width:"100%",padding:"12px",background:profile.color,border:"none",borderRadius:11,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",opacity:loading?0.6:1,marginBottom:9}}>{loading?"⏳ Analyse...":"✨ Analyser avec l'IA"}</button>)}
      {err&&<div style={{color:"#ef4444",fontSize:11,marginBottom:9}}>{err}</div>}
      {res&&(
        <div style={{background:"#1a1a1a",borderRadius:12,padding:13}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:5}}>{res.name}</div>
          <div style={{display:"flex",gap:9,fontFamily:"monospace",fontSize:12,flexWrap:"wrap",marginBottom:7}}><span style={{color:profile.color,fontWeight:700}}>{res.cal} kcal</span><span style={{color:"#777"}}>P{res.protein}g G{res.carbs}g L{res.fat}g</span></div>
          <div style={{display:"flex",gap:4,marginBottom:9,overflowX:"auto"}}>{MEALS.map(m=>(<button key={m} onClick={()=>setActiveMeal(m)} style={{padding:"3px 8px",borderRadius:11,whiteSpace:"nowrap",background:activeMeal===m?profile.color:"#0f0f0f",border:activeMeal===m?"none":"1px solid #222",color:activeMeal===m?"#fff":"#555",fontSize:9,cursor:"pointer"}}>{m}</button>))}</div>
          <button onClick={()=>{onAdd({...res,meal:activeMeal,id:Date.now()});onClose();}} style={{width:"100%",padding:"11px",background:profile.color,border:"none",borderRadius:11,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>Ajouter à {activeMeal}</button>
        </div>
      )}
    </Sheet>
  );
}

// ── Day Page ──────────────────────────────────────────────────────────────────
function DayPage({ dateKey, onBack, onDaySaved }) {
  const isToday = dateKey === todayKey();
  const [day, setDayState] = useState(emptyDay());
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const [activeMeal, setActiveMeal] = useState("☀️ Déjeuner");
  const [wInput, setWInput] = useState("");
  const profile = PROFILES[day.profile] || PROFILES.sport;
  const t = dayTotals(day);
  const calLeft = profile.calories - t.cal;
  const netCal = t.cal - t.burned;
  const netLeft = profile.calories - netCal;

  useEffect(() => {
    (async () => {
      const saved = await apiLoadDay(dateKey);
      const data = saved || emptyDay();
      if (!data.sports) data.sports = [];
      setDayState(data);
      setWInput(data.weight?.toString() || "");
      setLoaded(true);
    })();
  }, [dateKey]);

  const saveTimer = useRef(null);
  const setDay = (updater) => {
    setDayState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        setSaving(true);
        await apiSaveDay(dateKey, next);
        onDaySaved(dateKey, next);
        setSaving(false);
      }, 800);
      return next;
    });
  };

  const addFood  = f  => setDay(d=>({...d,foods: [...(d.foods||[]),  {...f,  id:Date.now()+Math.random()}]}));
  const addDrink = dr => setDay(d=>({...d,drinks:[...(d.drinks||[]), {...dr, id:Date.now()+Math.random()}]}));
  const addSport = sp => setDay(d=>({...d,sports:[...(d.sports||[]), {...sp, id:Date.now()+Math.random()}]}));
  const remFood  = id => setDay(d=>({...d,foods: (d.foods||[]).filter(f=>f.id!==id)}));
  const remDrink = id => setDay(d=>({...d,drinks:(d.drinks||[]).filter(dr=>dr.id!==id)}));
  const remSport = id => setDay(d=>({...d,sports:(d.sports||[]).filter(sp=>sp.id!==id)}));

  if (!loaded) return <div style={{minHeight:"100vh",background:"#080808",display:"flex",alignItems:"center",justifyContent:"center",color:"#444",fontSize:13}}>Chargement...</div>;

  return (
    <div style={{minHeight:"100vh",background:"#080808",color:"#f0ece4",fontFamily:"system-ui,sans-serif",paddingBottom:80}}>
      <div style={{padding:"13px 15px 11px",background:"#0c0c0c",borderBottom:"1px solid #161616",display:"flex",alignItems:"center",gap:9}}>
        <button onClick={onBack} style={{background:"#161616",border:"1px solid #222",borderRadius:9,color:"#f0ece4",padding:"6px 11px",fontSize:12,cursor:"pointer",fontWeight:600}}>← Retour</button>
        <div style={{flex:1}}>
          {isToday&&<div style={{fontSize:8,color:profile.color,letterSpacing:2,textTransform:"uppercase"}}>Aujourd'hui</div>}
          <div style={{fontSize:14,fontWeight:700}}>{fmtDate(dateKey)}</div>
        </div>
        <div style={{display:"flex",gap:7,alignItems:"center"}}>
          {saving&&<div style={{fontSize:9,color:"#444"}}>💾</div>}
          <button onClick={()=>setDay(d=>({...d,profile:d.profile==="sport"?"rest":"sport"}))} style={{padding:"5px 10px",borderRadius:12,border:"none",background:profile.color+"22",color:profile.color,fontWeight:700,fontSize:10,cursor:"pointer"}}>{profile.label}</button>
        </div>
      </div>

      <div style={{padding:"13px 15px 0"}}>
        {/* Objectifs */}
        <div style={{background:profile.color+"11",border:`1px solid ${profile.color}33`,borderRadius:12,padding:"9px 13px",marginBottom:10}}>
          <div style={{fontSize:8,color:profile.color,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Objectifs {profile.label}</div>
          <div style={{display:"flex",gap:10,fontFamily:"monospace",fontSize:11,flexWrap:"wrap"}}>
            <span>🔥 <strong style={{color:profile.color}}>{profile.calories}</strong> kcal</span>
            <span>🥩 <strong style={{color:"#ff6b35"}}>{profile.protein}g</strong></span>
            <span>🍚 <strong style={{color:"#facc15"}}>{profile.carbs}g</strong></span>
            <span>🥑 <strong style={{color:"#a78bfa"}}>{profile.fat}g</strong></span>
          </div>
        </div>

        {/* Calories */}
        <div style={{background:"#0f0f0f",border:"1px solid #1a1a1a",borderRadius:16,padding:"14px",marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
            <div>
              <div style={{fontSize:8,color:"#444",letterSpacing:2,textTransform:"uppercase"}}>Calories ingérées</div>
              <div style={{fontFamily:"monospace",fontSize:30,fontWeight:700,lineHeight:1,marginTop:2}}>{t.cal}<span style={{fontSize:11,color:"#333"}}>/{profile.calories}</span></div>
              {t.burned>0&&<div style={{fontSize:10,color:"#22c55e",marginTop:2,fontFamily:"monospace"}}>−{t.burned} sport → net <strong>{netCal}</strong></div>}
              <div style={{fontSize:11,marginTop:3,color:calLeft>=0?"#22c55e":"#ef4444",fontWeight:600}}>{calLeft>=0?`${calLeft} restantes`:`+${Math.abs(calLeft)} dépassé ⚠️`}</div>
            </div>
            <div style={{display:"flex",gap:5}}>
              {[{l:"P",v:t.protein,m:profile.protein,c:"#ff6b35"},{l:"G",v:t.carbs,m:profile.carbs,c:"#facc15"},{l:"L",v:t.fat,m:profile.fat,c:"#a78bfa"}].map(x=>(
                <div key={x.l} style={{textAlign:"center"}}>
                  <div style={{position:"relative",display:"inline-block"}}>
                    <Ring val={x.v} max={x.m} color={x.c} size={44}/>
                    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace",fontSize:9,color:x.c}}>{x.v}</div>
                  </div>
                  <div style={{fontSize:7,color:"#444",textTransform:"uppercase"}}>{x.l}</div>
                  <div style={{fontSize:6,color:"#333",fontFamily:"monospace"}}>{x.m}g</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{marginTop:9,height:4,background:"#161616",borderRadius:2}}>
            <div style={{height:"100%",width:`${Math.min(t.cal/profile.calories*100,100)}%`,background:t.cal>profile.calories?"#ef4444":t.cal>profile.calories*0.85?"#f97316":profile.color,borderRadius:2}}/>
          </div>
        </div>

        {/* Steps + Water */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:10}}>
          <div style={{background:"#0f0f0f",border:"1px solid #1a1a1a",borderRadius:13,padding:"11px"}}>
            <div style={{fontSize:8,color:"#444",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Pas 👟</div>
            <div style={{fontFamily:"monospace",fontSize:18,color:(day.steps||0)>=STEPS_GOAL?"#22c55e":"#f0ece4"}}>{(day.steps||0).toLocaleString("fr")}</div>
            <div style={{marginTop:5,height:3,background:"#161616",borderRadius:2}}><div style={{height:"100%",width:`${Math.min((day.steps||0)/STEPS_GOAL*100,100)}%`,background:"#22c55e",borderRadius:2}}/></div>
            <div style={{display:"flex",gap:3,marginTop:5,flexWrap:"wrap"}}>
              {[6,8,10,12].map(v=>(<button key={v} onClick={()=>setDay(d=>({...d,steps:v*1000}))} style={{padding:"2px 6px",background:(day.steps||0)===v*1000?"#22c55e22":"#161616",border:`1px solid ${(day.steps||0)===v*1000?"#22c55e":"#222"}`,borderRadius:5,color:(day.steps||0)===v*1000?"#22c55e":"#444",fontSize:8,cursor:"pointer",fontFamily:"monospace"}}>{v}k</button>))}
            </div>
            <input type="number" placeholder="Saisir..." value={day.steps||""} onChange={e=>setDay(d=>({...d,steps:parseInt(e.target.value)||0}))} style={{marginTop:5,width:"100%",background:"#161616",border:"1px solid #222",borderRadius:6,color:"#f0ece4",padding:"4px 7px",fontSize:11,fontFamily:"monospace",boxSizing:"border-box"}}/>
          </div>
          <div style={{background:"#0f0f0f",border:"1px solid #1a1a1a",borderRadius:13,padding:"11px"}}>
            <div style={{fontSize:8,color:"#444",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Eau 💧</div>
            <div style={{fontFamily:"monospace",fontSize:18,color:t.water>=WATER_GOAL?"#4da6ff":"#f0ece4"}}>{(t.water/1000).toFixed(1)}L</div>
            <div style={{marginTop:5,height:3,background:"#161616",borderRadius:2}}><div style={{height:"100%",width:`${Math.min(t.water/WATER_GOAL*100,100)}%`,background:"#4da6ff",borderRadius:2}}/></div>
            <div style={{display:"flex",gap:4,marginTop:7}}>
              {[250,500].map(v=>(<button key={v} onClick={()=>addDrink({name:"Eau",ml:v,cal:0})} style={{padding:"4px 8px",background:"#161616",border:"1px solid #222",borderRadius:6,color:"#4da6ff",fontSize:10,cursor:"pointer"}}>+{v}ml</button>))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:13}}>
          {[{icon:"✍️",label:"Décrire repas",m:"text",color:profile.color},{icon:"🏃",label:"Ajouter sport",m:"sport",color:"#22c55e"},{icon:"🍽️",label:"Aliments",m:"food",color:null},{icon:"💧",label:"Boisson",m:"drink",color:null},{icon:"📷",label:"Photo repas",m:"photo",color:null}].map((b,i)=>(
            <button key={i} onClick={()=>setModal(b.m)} style={{padding:"11px",background:b.color?b.color+"22":"#0f0f0f",border:b.color?`1px solid ${b.color}55`:"1px solid #1a1a1a",borderRadius:12,color:b.color||"#f0ece4",fontWeight:600,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5,gridColumn:i===4?"1 / -1":"auto"}}>
              <span style={{fontSize:16}}>{b.icon}</span>{b.label}
            </button>
          ))}
        </div>

        {/* Sport log */}
        {(day.sports||[]).length>0&&(
          <div style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
              <div style={{fontSize:8,color:"#444",letterSpacing:2,textTransform:"uppercase"}}>Activités sportives</div>
              <div style={{fontFamily:"monospace",fontSize:10,color:"#22c55e"}}>−{t.burned} kcal brûlées</div>
            </div>
            {(day.sports||[]).map(sp=>(
              <div key={sp.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#0a160a",border:"1px solid #22c55e22",borderRadius:11,padding:"10px 13px",marginBottom:5}}>
                <div style={{display:"flex",gap:9,alignItems:"center"}}>
                  <span style={{fontSize:18}}>{sp.icon}</span>
                  <div><div style={{fontWeight:600,fontSize:13}}>{sp.name}</div><div style={{fontSize:9,color:"#555",marginTop:1}}>{sp.duration} · {sp.intensity}</div></div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  <span style={{fontFamily:"monospace",fontSize:13,color:"#22c55e",fontWeight:700}}>−{sp.kcal}</span>
                  <button onClick={()=>remSport(sp.id)} style={{background:"none",border:"none",color:"#333",fontSize:12,cursor:"pointer"}}>✕</button>
                </div>
              </div>
            ))}
            <div style={{background:"#111",borderRadius:10,padding:"8px 13px",display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4}}>
              <span style={{fontSize:11,color:"#555"}}>Balance nette</span>
              <span style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:netLeft>=0?"#22c55e":"#ef4444"}}>{netLeft>=0?`${netLeft} restantes`:`+${Math.abs(netLeft)} dépassé`}</span>
            </div>
          </div>
        )}

        {/* Food log */}
        {MEALS.map(meal=>{
          const items=(day.foods||[]).filter(f=>f.meal===meal);
          if(!items.length) return null;
          const mc=items.reduce((s,f)=>s+(f.cal||0),0);
          return (
            <div key={meal} style={{marginBottom:11}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                <div style={{fontSize:8,color:"#444",letterSpacing:2,textTransform:"uppercase"}}>{meal}</div>
                <div style={{fontFamily:"monospace",fontSize:10,color:profile.color}}>{mc} kcal</div>
              </div>
              {items.map(f=>(<div key={f.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#0f0f0f",border:"1px solid #161616",borderRadius:10,padding:"8px 12px",marginBottom:4}}><div><div style={{fontWeight:500,fontSize:12}}>{f.name}</div><div style={{fontSize:8,color:"#444",marginTop:1,fontFamily:"monospace"}}>P{f.protein}g · G{f.carbs}g · L{f.fat}g</div></div><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontFamily:"monospace",fontSize:11,color:profile.color}}>{f.cal}</span><button onClick={()=>remFood(f.id)} style={{background:"none",border:"none",color:"#333",fontSize:12,cursor:"pointer"}}>✕</button></div></div>))}
            </div>
          );
        })}

        {/* Drinks */}
        {(day.drinks||[]).length>0&&(
          <div style={{marginBottom:11}}>
            <div style={{fontSize:8,color:"#444",letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>Boissons</div>
            {(day.drinks||[]).map(d=>(<div key={d.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#0f0f0f",border:"1px solid #161616",borderRadius:10,padding:"8px 12px",marginBottom:4}}><span style={{fontWeight:500,fontSize:12}}>{d.name} <span style={{color:"#444",fontSize:10}}>{d.ml}ml</span></span><div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontFamily:"monospace",fontSize:10,color:"#4da6ff"}}>{d.cal}</span><button onClick={()=>remDrink(d.id)} style={{background:"none",border:"none",color:"#333",fontSize:12,cursor:"pointer"}}>✕</button></div></div>))}
          </div>
        )}

        {/* Note */}
        <div style={{background:"#0f0f0f",border:"1px solid #1a1a1a",borderRadius:12,padding:"10px",marginBottom:9}}>
          <div style={{fontSize:8,color:"#444",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Note du jour</div>
          <textarea value={day.note||""} onChange={e=>setDay(d=>({...d,note:e.target.value}))} placeholder="Ressenti, commentaires..." style={{width:"100%",background:"transparent",border:"none",color:"#f0ece4",fontSize:12,lineHeight:1.6,resize:"none",outline:"none",boxSizing:"border-box",minHeight:42}}/>
        </div>

        {/* Weight */}
        <div style={{background:"#0f0f0f",border:"1px solid #1a1a1a",borderRadius:12,padding:"10px",marginBottom:20}}>
          <div style={{fontSize:8,color:"#444",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Poids du jour</div>
          <div style={{display:"flex",gap:7}}>
            <input type="number" step="0.1" placeholder="ex: 82.4" value={wInput} onChange={e=>setWInput(e.target.value)} style={{flex:1,background:"#161616",border:"1px solid #222",borderRadius:8,color:"#f0ece4",padding:"8px 10px",fontSize:13,fontFamily:"monospace"}}/>
            <button onClick={()=>{if(!wInput)return;const w=parseFloat(wInput);setDay(d=>({...d,weight:w}));}} style={{padding:"8px 14px",background:profile.color,border:"none",borderRadius:8,color:"#fff",fontWeight:700,cursor:"pointer"}}>OK</button>
          </div>
          {day.weight&&<div style={{marginTop:5,fontSize:10,color:"#22c55e"}}>✓ {day.weight} kg — sauvegardé 💾</div>}
        </div>
      </div>

      {modal==="sport" && <SportSheet onAdd={addSport} onClose={()=>setModal(null)}/>}
      {modal==="text"  && <TextSheet  profile={profile} activeMeal={activeMeal} setActiveMeal={setActiveMeal} onAdd={addFood} onClose={()=>setModal(null)}/>}
      {modal==="food"  && <FoodSheet  profile={profile} activeMeal={activeMeal} setActiveMeal={setActiveMeal} onAdd={addFood} onClose={()=>setModal(null)}/>}
      {modal==="drink" && <DrinkSheet onAdd={addDrink} onClose={()=>setModal(null)}/>}
      {modal==="photo" && <PhotoSheet profile={profile} activeMeal={activeMeal} setActiveMeal={setActiveMeal} onAdd={addFood} onClose={()=>setModal(null)}/>}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function Home() {
  const [tab, setTab] = useState("today");
  const [journalDay, setJournalDay] = useState(null);
  const [summaries, setSummaries] = useState({});
  const [loadingApp, setLoadingApp] = useState(true);
  const today = todayKey();

  useEffect(() => {
    (async () => {
      const dates = await apiListDays();
      const loaded = {};
      await Promise.all(dates.map(async date => {
        const d = await apiLoadDay(date);
        if (d) { if (!d.sports) d.sports=[]; loaded[date] = d; }
      }));
      setSummaries(loaded);
      setLoadingApp(false);
    })();
  }, []);

  const handleDaySaved = (dateKey, dayData) => setSummaries(prev => ({ ...prev, [dateKey]: dayData }));

  const allKeys = Object.keys(summaries).sort((a,b)=>b.localeCompare(a));
  const journalKeys = allKeys.includes(today) ? allKeys : [today, ...allKeys];
  const todayData = summaries[today] || emptyDay();
  const todayT = dayTotals(todayData);
  const todayP = PROFILES[todayData.profile] || PROFILES.sport;
  const accent = todayP.color;
  const wEntries = Object.entries(summaries).filter(([,d])=>d.weight).map(([k,d])=>[k,d.weight]).sort((a,b)=>a[0].localeCompare(b[0]));
  const lastW = wEntries.length ? wEntries[wEntries.length-1][1] : WEIGHT_START;
  const lost = Math.max(0, WEIGHT_START - lastW);
  const prog = Math.min(lost/(WEIGHT_START-WEIGHT_GOAL)*100, 100);

  if (journalDay) return <DayPage dateKey={journalDay} onBack={()=>setJournalDay(null)} onDaySaved={handleDaySaved}/>;

  if (loadingApp) return (
    <div style={{minHeight:"100vh",background:"#080808",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}>
      <div style={{fontSize:22,fontWeight:800,color:"#f0ece4"}}>Fuel<span style={{color:"#ff6b35"}}>Track</span></div>
      <div style={{fontSize:12,color:"#444"}}>Chargement...</div>
    </div>
  );

  return (
    <>
      <Head><title>FuelTrack</title><meta name="viewport" content="width=device-width, initial-scale=1"/><meta name="theme-color" content="#080808"/></Head>
      <div style={{minHeight:"100vh",background:"#080808",color:"#f0ece4",fontFamily:"system-ui,sans-serif",paddingBottom:80}}>

        <div style={{padding:"15px 15px 11px",background:"#0c0c0c",borderBottom:"1px solid #161616"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:8,color:"#444",letterSpacing:3,textTransform:"uppercase",fontFamily:"monospace"}}>{new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</div>
              <div style={{fontSize:21,fontWeight:800,marginTop:2,letterSpacing:-0.5}}>Fuel<span style={{color:accent}}>Track</span></div>
            </div>
            <div style={{background:"#111",border:"1px solid #1e1e1e",borderRadius:10,padding:"6px 10px",textAlign:"right"}}>
              <div style={{fontSize:7,color:"#444",textTransform:"uppercase",letterSpacing:1}}>Poids</div>
              <div style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:accent}}>{lastW} <span style={{fontSize:8,color:"#444"}}>/ 78kg</span></div>
            </div>
          </div>
          <div style={{marginTop:10}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:"#444",marginBottom:3}}><span>83 → 78 kg</span><span style={{color:accent}}>{lost>0?`−${lost.toFixed(1)} kg`:"0 kg"} · {Math.round(prog)}%</span></div>
            <div style={{height:3,background:"#161616",borderRadius:2}}><div style={{height:"100%",width:`${prog}%`,background:accent,borderRadius:2}}/></div>
          </div>
        </div>

        <div style={{display:"flex",padding:"8px 15px",gap:5,borderBottom:"1px solid #111",background:"#0c0c0c",overflowX:"auto"}}>
          {[["today","Aujourd'hui"],["journal","📓 Journal"],["macros","📐 Macros"],["tips","💡 Tips"],["history","📊 Poids"]].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{padding:"5px 11px",borderRadius:16,border:tab===id?"none":"1px solid #1e1e1e",background:tab===id?accent:"transparent",color:tab===id?"#fff":"#555",fontWeight:600,fontSize:11,cursor:"pointer",whiteSpace:"nowrap"}}>{label}</button>
          ))}
        </div>

        {tab==="today"&&(
          <div style={{padding:"15px 15px 0"}}>
            <button onClick={()=>setJournalDay(today)} style={{display:"block",width:"100%",background:"#0f0f0f",border:`1px solid ${accent}55`,borderRadius:16,padding:"16px 15px",cursor:"pointer",textAlign:"left",marginBottom:11}}>
              <div style={{fontSize:8,color:accent,letterSpacing:2,textTransform:"uppercase",marginBottom:2}}>Ouvrir aujourd'hui →</div>
              <div style={{fontSize:15,fontWeight:700,marginBottom:2}}>{fmtDate(today)}</div>
              <div style={{fontSize:11,color:"#555"}}>✍️ Repas · 🏃 Sport · 📷 Photo · 💧 Boissons</div>
            </button>
            <div style={{background:"#0f0f0f",border:"1px solid #161616",borderRadius:14,padding:"13px"}}>
              <div style={{fontSize:8,color:"#444",letterSpacing:2,textTransform:"uppercase",marginBottom:9}}>Résumé aujourd'hui</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,textAlign:"center"}}>
                {[{label:"Kcal",val:todayT.cal,color:accent},{label:"Brûlé",val:todayT.burned>0?`−${todayT.burned}`:"0",color:"#22c55e"},{label:"Eau",val:(todayT.water/1000).toFixed(1)+"L",color:"#4da6ff"},{label:"Pas",val:(todayData.steps||0)>999?`${((todayData.steps||0)/1000).toFixed(1)}k`:todayData.steps||0,color:"#22c55e"}].map(x=>(<div key={x.label} style={{background:"#161616",borderRadius:10,padding:"8px 3px"}}><div style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:x.color}}>{x.val}</div><div style={{fontSize:7,color:"#444",marginTop:2,textTransform:"uppercase",letterSpacing:1}}>{x.label}</div></div>))}
              </div>
            </div>
          </div>
        )}

        {tab==="journal"&&(
          <div style={{padding:"15px 15px 0"}}>
            <div style={{fontSize:8,color:"#444",letterSpacing:3,textTransform:"uppercase",marginBottom:11}}>Journal alimentaire</div>
            {journalKeys.map(key=>{
              const d=summaries[key]||emptyDay();
              const t=dayTotals(d);
              const p=PROFILES[d.profile]||PROFILES.sport;
              const isT=key===today;
              return (
                <button key={key} onClick={()=>setJournalDay(key)} style={{display:"block",width:"100%",background:"#0f0f0f",border:isT?`1px solid ${p.color}55`:"1px solid #161616",borderRadius:14,padding:"12px 14px",marginBottom:8,cursor:"pointer",textAlign:"left"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                    <div>{isT&&<div style={{fontSize:7,color:p.color,letterSpacing:2,textTransform:"uppercase",marginBottom:1}}>Aujourd'hui</div>}<div style={{fontSize:12,fontWeight:700,color:"#f0ece4"}}>{fmtDate(key,true)}</div></div>
                    <div style={{textAlign:"right"}}><div style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:t.cal>p.calories?"#ef4444":"#f0ece4"}}>{t.cal} <span style={{fontSize:8,color:"#444"}}>kcal</span></div>{t.burned>0&&<div style={{fontSize:9,color:"#22c55e",fontFamily:"monospace"}}>−{t.burned} sport</div>}{d.weight&&<div style={{fontSize:9,color:"#555",fontFamily:"monospace"}}>{d.weight} kg</div>}</div>
                  </div>
                  <div style={{height:3,background:"#161616",borderRadius:2,marginBottom:6}}><div style={{height:"100%",width:`${Math.min(t.cal/p.calories*100,100)}%`,background:t.cal>p.calories?"#ef4444":t.cal>p.calories*0.85?"#f97316":p.color,borderRadius:2}}/></div>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <div style={{display:"flex",gap:7,fontFamily:"monospace",fontSize:8,color:"#444"}}><span>P{t.protein}g</span><span>G{t.carbs}g</span><span>L{t.fat}g</span>{(d.steps||0)>0&&<span>👟{((d.steps||0)/1000).toFixed(1)}k</span>}{(d.sports||[]).length>0&&<span style={{color:"#22c55e"}}>🏃{(d.sports||[]).length}</span>}</div>
                    <div style={{fontSize:8,color:"#333"}}>{(d.foods||[]).length>0?`${(d.foods||[]).length} aliment${(d.foods||[]).length>1?"s":""}`:"Vide"}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {tab==="macros"&&(
          <div style={{padding:"15px"}}>
            {Object.entries(PROFILES).map(([key,p])=>(
              <div key={key} style={{background:"#0f0f0f",border:`1px solid ${p.color}44`,borderRadius:16,padding:"15px",marginBottom:13}}>
                <div style={{fontSize:13,fontWeight:700,color:p.color,marginBottom:8}}>{p.label}</div>
                <div style={{fontFamily:"monospace",fontSize:22,fontWeight:700,marginBottom:10}}>{p.calories} <span style={{fontSize:11,color:"#444"}}>kcal</span></div>
                {[{label:"🥩 Protéines",val:p.protein,color:"#ff6b35",pct:Math.round(p.protein*4/p.calories*100)},{label:"🍚 Glucides",val:p.carbs,color:"#facc15",pct:Math.round(p.carbs*4/p.calories*100)},{label:"🥑 Lipides",val:p.fat,color:"#a78bfa",pct:Math.round(p.fat*9/p.calories*100)}].map(m=>(<div key={m.label} style={{marginBottom:9}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,color:"#ccc"}}>{m.label}</span><span style={{fontFamily:"monospace",fontSize:12,color:m.color}}>{m.val}g <span style={{color:"#444"}}>· {m.pct}%</span></span></div><div style={{height:4,background:"#161616",borderRadius:2}}><div style={{height:"100%",width:`${m.pct}%`,background:m.color,borderRadius:2}}/></div></div>))}
              </div>
            ))}
            <div style={{background:"#0f0f0f",border:"1px solid #1a1a1a",borderRadius:14,padding:"13px"}}>
              <div style={{fontSize:10,color:"#444",textTransform:"uppercase",marginBottom:7}}>Projection 8 semaines</div>
              <div style={{fontFamily:"monospace",fontSize:19,fontWeight:700,marginBottom:4}}>~1 960 <span style={{fontSize:11,color:"#444"}}>kcal/j moy.</span></div>
              <div style={{fontSize:11,color:"#666",lineHeight:1.7}}>Déficit ~490 kcal/j · ~400g/sem<br/>8 semaines → <span style={{color:"#22c55e",fontWeight:700}}>~3,5 kg perdus</span></div>
            </div>
          </div>
        )}

        {tab==="tips"&&(
          <div style={{padding:"15px"}}>
            {[{icon:"✍️",title:"Décris tes repas en texte",text:"Le moyen le plus rapide. L'IA calcule tout automatiquement."},{icon:"🏃",title:"Saisis ton sport chaque jour",text:"Calcule les calories brûlées et ta balance nette réelle."},{icon:"🥩",title:"160-170g de protéines/jour",text:"Commence chaque repas par la protéine."},{icon:"🍚",title:"Glucides autour du sport",text:"Riz, patate douce avant/après l'entraînement. Jours repos : légumes."},{icon:"💧",title:"2,5L d'eau minimum",text:"Un grand verre dès le réveil."},{icon:"📊",title:"Peser 1x/semaine",text:"Mardi matin, à jeun, toujours le même moment."},{icon:"🌙",title:"Stop manger après 20h",text:"Coupe le grignotage soirée."},{icon:"🍫",title:"1 repas libre/semaine",text:"Sans culpabilité. Planifie-le."}].map((tip,i)=>(<div key={i} style={{background:"#0f0f0f",border:"1px solid #161616",borderRadius:13,padding:"12px 13px",marginBottom:8,display:"flex",gap:11}}><div style={{fontSize:21}}>{tip.icon}</div><div><div style={{fontWeight:700,fontSize:12,marginBottom:2}}>{tip.title}</div><div style={{fontSize:11,color:"#666",lineHeight:1.6}}>{tip.text}</div></div></div>))}
          </div>
        )}

        {tab==="history"&&(
          <div style={{padding:"15px"}}>
            <div style={{fontSize:8,color:"#444",letterSpacing:3,textTransform:"uppercase",marginBottom:11}}>Évolution poids</div>
            {wEntries.length===0?(<div style={{color:"#333",textAlign:"center",padding:"40px 0",fontSize:12}}>Aucune donnée encore.</div>):(
              <>
                <div style={{background:"#0f0f0f",border:"1px solid #1a1a1a",borderRadius:13,padding:13,marginBottom:11,overflowX:"auto"}}>
                  <div style={{display:"flex",alignItems:"flex-end",gap:6,height:85,minWidth:wEntries.length*40}}>
                    {wEntries.map(([date,w])=>{const all=wEntries.map(e=>e[1]);const minW=Math.min(...all,WEIGHT_GOAL)-0.5,maxW=Math.max(...all,WEIGHT_START)+0.5;const h=((w-minW)/(maxW-minW))*65+10;return(<div key={date} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,flex:"0 0 34px"}}><div style={{fontFamily:"monospace",fontSize:6,color:w<=WEIGHT_GOAL?"#22c55e":"#555"}}>{w}</div><div style={{width:24,height:h,background:w<=WEIGHT_GOAL?"#22c55e":accent,borderRadius:"3px 3px 0 0",opacity:0.85}}/><div style={{fontSize:6,color:"#333",fontFamily:"monospace"}}>{date.slice(5)}</div></div>);})}
                  </div>
                </div>
                {wEntries.slice().reverse().map(([date,w])=>(<div key={date} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#0f0f0f",border:"1px solid #161616",borderRadius:10,padding:"9px 13px",marginBottom:5}}><div style={{fontSize:11,color:"#666"}}>{fmtDate(date,true)}</div><div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:w<=WEIGHT_GOAL?"#22c55e":"#f0ece4"}}>{w} kg</span><span style={{fontSize:9,fontFamily:"monospace",color:WEIGHT_START-w>0?"#22c55e":"#ef4444"}}>{WEIGHT_START-w>0?`−${(WEIGHT_START-w).toFixed(1)}`:`+${(w-WEIGHT_START).toFixed(1)}`}</span></div></div>))}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}