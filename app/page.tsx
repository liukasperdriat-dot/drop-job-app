'use client';

import { useState } from 'react';
import Link from 'next/link';

const JOBS = [
  { id: 1, title: 'Développeur React Senior', company: 'Contentsquare', loc: 'Paris', remote: 'Hybride', contract: 'CDI', salary: '55k — 70k€', g: 'haut', gt: '12% au-dessus', src: 'LinkedIn', cat: 'tech', skills: ['React','TypeScript','GraphQL','Jest'], desc: "Rejoignez l'équipe Frontend pour développer des interfaces d'analytics performantes utilisées par plus de 1 000 clients enterprise." },
  { id: 2, title: 'Product Designer', company: 'Doctolib', loc: 'Paris', remote: 'Full remote', contract: 'CDI', salary: '45k — 60k€', g: 'haut', gt: 'Au-dessus', src: 'WTTJ', cat: 'design', skills: ['Figma','Design System','UX Research'], desc: "Repensez les parcours de prise de rendez-vous pour plus de 80 millions d'utilisateurs européens." },
  { id: 3, title: 'Data Scientist ML', company: 'BlaBlaCar', loc: 'Paris', remote: 'Hybride', contract: 'CDI', salary: '50k — 65k€', g: 'juste', gt: 'Juste marché', src: 'Indeed', cat: 'data', skills: ['Python','PyTorch','SQL','dbt'], desc: "Prédisez les comportements de covoiturage et optimisez le matching offre/demande." },
  { id: 4, title: 'Backend Engineer Go', company: 'Qonto', loc: 'Berlin', remote: 'Full remote', contract: 'CDI', salary: '60k — 80k€', g: 'haut', gt: 'Au-dessus', src: 'HelloWork', cat: 'tech', skills: ['Go','Kubernetes','PostgreSQL'], desc: "Concevez des microservices ultra-performants pour traiter des millions de transactions par jour." },
  { id: 5, title: 'Product Manager', company: 'Leboncoin', loc: 'Paris', remote: 'Hybride', contract: 'CDI', salary: '48k — 62k€', g: 'bas', gt: 'Sous le marché', src: 'France Travail', cat: 'product', skills: ['Roadmap','OKR','SQL'], desc: "Gérez l'une des plus grandes marketplaces françaises." },
  { id: 6, title: 'DevOps / SRE', company: 'OVHcloud', loc: 'Roubaix', remote: 'Remote possible', contract: 'CDI', salary: '45k — 58k€', g: 'juste', gt: 'Juste marché', src: 'LinkedIn', cat: 'tech', skills: ['Kubernetes','Ansible','Terraform'], desc: "Maintenez l'infrastructure qui héberge 1,6 million de serveurs." },
];

const GAUGE: Record<string, { col: string; bg: string; badge: string; desc: string; rot: number; dash: number }> = {
  bas:   { col: '#c0392b', bg: 'rgba(192,57,43,.07)',  badge: 'Sous le marché',      desc: 'Cette offre est <strong>18% en-dessous</strong> de la moyenne.', rot: -50, dash: 140 },
  juste: { col: '#1d8348', bg: 'rgba(29,131,72,.07)',  badge: 'Dans la moyenne',     desc: 'Cette offre est dans la <strong>fourchette normale</strong>.', rot: 0, dash: 82 },
  haut:  { col: '#b45309', bg: 'rgba(180,83,9,.07)',   badge: 'Au-dessus du marché', desc: 'Cette offre est <strong>12% au-dessus</strong> de la moyenne à Lyon.', rot: 50, dash: 18 },
};

const gc = (g: string) => GAUGE[g]?.col || '#aeaeb2';

const LOGOS: Record<string, string> = {
  'Contentsquare': '<rect x="2" y="2" width="6" height="6" rx="1.5"/><rect x="10" y="2" width="6" height="6" rx="1.5"/><rect x="2" y="10" width="6" height="6" rx="1.5"/><rect x="10" y="10" width="6" height="6" rx="1.5"/>',
  'Doctolib':      '<circle cx="9" cy="7" r="4"/><path d="M3 16c0-3.3 2.7-6 6-6s6 2.7 6 6"/>',
  'BlaBlaCar':     '<path d="M2 10h1.5l2-5h7l2 5H16a1 1 0 0 1 1 1v2H5l-1-3z"/><circle cx="6" cy="14" r="1.5"/><circle cx="12" cy="14" r="1.5"/>',
  'Qonto':         '<rect x="2" y="4" width="14" height="10" rx="2"/><path d="M6 8h6M6 11h4"/>',
  'Leboncoin':     '<circle cx="9" cy="9" r="7"/><path d="M6 9h6M9 6v6"/>',
  'OVHcloud':      '<path d="M14 11a5 5 0 0 0-10 0"/><path d="M5 11v3a2 2 0 0 0 4 0v-3"/><path d="M9 14v-3"/>',
};

const GEN_STEPS = ['Analyse des mots-clés ATS','Interrogation de votre profil','Adaptation du vocabulaire','Calcul du score de matching','Génération du PDF'];

const v = {
  bg: '#f5f5f7', bg2: '#e8e8ed', white: '#fff',
  text: '#1d1d1f', text2: '#6e6e73', text3: '#aeaeb2',
  line: 'rgba(0,0,0,0.08)', line2: 'rgba(0,0,0,0.14)',
  blue: '#0071e3',
  shadow: '0 1px 2px rgba(0,0,0,.05), 0 2px 12px rgba(0,0,0,.05)',
  shadow2: '0 2px 6px rgba(0,0,0,.07), 0 8px 28px rgba(0,0,0,.07)',
};

export default function HomePage() {
  const [filter, setFilter]   = useState('all');
  const [billing, setBilling] = useState<'monthly'|'weekly'>('monthly');
  const [salMin, setSalMin]   = useState(40);
  const [salMax, setSalMax]   = useState(65);
  const [gauge, setGauge]     = useState('haut');
  const [paywall, setPaywall] = useState(false);
  const [job, setJob]         = useState<typeof JOBS[0]|null>(null);
  const [genOpen, setGenOpen] = useState(false);
  const [genStep, setGenStep] = useState(0);

  const filtered = JOBS.filter(j =>
    filter === 'all' ? true :
    filter === 'remote' ? j.remote.toLowerCase().includes('remote') :
    j.cat === filter
  );

  const startGen = () => {
    setJob(null); setGenStep(0); setGenOpen(true);
    let s = 0;
    const iv = setInterval(() => {
      s++;
      if (s >= GEN_STEPS.length) { clearInterval(iv); setTimeout(() => { setGenOpen(false); setPaywall(true); }, 600); }
      else setGenStep(s);
    }, 800);
  };

  const pct = (val: number) => ((val - 20) / 100) * 100;

  return (
    <>
    <div style={{ background: v.bg, color: v.text, fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,sans-serif", minHeight:'100vh', WebkitFontSmoothing:'antialiased' }}>

      {/* NAV */}
      <nav style={{ position:'sticky', top:0, zIndex:200, height:52, background:'rgba(245,245,247,0.92)', backdropFilter:'blur(24px) saturate(180%)', borderBottom:`1px solid ${v.line}` }}>
        <div style={{ maxWidth:1080, margin:'0 auto', height:'100%', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <a href="#" style={{ display:'flex', alignItems:'center', gap:7, textDecoration:'none', color:v.text, fontSize:15, fontWeight:600, letterSpacing:'-0.02em' }}>
            <svg viewBox="0 0 40 40" fill="none" width={26} height={26}>
              <rect x="5" y="5" width="30" height="30" rx="7" transform="rotate(45 20 20)" stroke="currentColor" strokeWidth="2.2" fill="none"/>
              <rect x="9" y="9" width="22" height="22" rx="5" transform="rotate(45 20 20)" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.45"/>
              <circle cx="20" cy="20" r="7.5" stroke="currentColor" strokeWidth="1.8" fill="none"/>
              <line x1="20" y1="15.5" x2="20" y2="22.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <polyline points="17,20.5 20,23.5 23,20.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            drop-job
          </a>
          <ul style={{ display:'flex', alignItems:'center', gap:0, listStyle:'none' }}>
            {[['#jobs','Rechercher'],['#bento','CV IA'],['#pricing','Prix']].map(([h,l])=>(
              <li key={h}><a href={h} style={{ padding:'5px 13px', fontSize:13, color:v.text2, textDecoration:'none', display:'block', borderRadius:100 }}>{l}</a></li>
            ))}
          </ul>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Link href="/auth/login" style={{ fontSize:13, color:v.text2, textDecoration:'none', padding:'5px 4px' }}>Connexion</Link>
            <button onClick={()=>setPaywall(true)} style={{ padding:'7px 17px', borderRadius:100, fontSize:13, fontWeight:500, background:v.blue, color:'#fff', border:'none', cursor:'pointer', fontFamily:'inherit' }}>Commencer</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ maxWidth:1080, margin:'0 auto', padding:'88px 24px 56px', textAlign:'center' }}>
        <h1 style={{ fontSize:'clamp(48px,7.5vw,80px)', fontWeight:600, letterSpacing:'-0.04em', lineHeight:1.06, marginBottom:18 }}>
          Postulez.<br/>C'est fait.
        </h1>
        <p style={{ fontSize:19, fontWeight:300, color:v.text2, lineHeight:1.6, maxWidth:500, margin:'0 auto 44px' }}>
          Regroupez 5 sites majeurs. L'IA adapte votre CV pour chaque offre. Obtenez le bon salaire.
        </p>

        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
          {/* Search bar */}
          <div style={{ display:'flex', alignItems:'center', background:v.white, borderRadius:100, border:`1px solid ${v.line2}`, boxShadow:v.shadow2, width:'100%', maxWidth:620, overflow:'hidden' }}>
            <div style={{ padding:'0 10px 0 18px', display:'flex', color:v.text3, flexShrink:0 }}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width={15} height={15}><circle cx="7" cy="7" r="4.5"/><line x1="10.5" y1="10.5" x2="14" y2="14"/></svg>
            </div>
            <input type="text" placeholder="Chercher un métier, une entreprise…" style={{ flex:1, padding:'13px 0', minWidth:0, background:'transparent', border:'none', outline:'none', fontFamily:'inherit', fontSize:15, color:v.text }} />
            <div style={{ width:1, height:20, background:v.line2, flexShrink:0 }} />
            <div style={{ display:'flex', alignItems:'center', gap:5, padding:'0 14px', flexShrink:0 }}>
              <svg viewBox="0 0 12 16" fill="none" stroke={v.text3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width={12} height={12}><path d="M6 1C3.8 1 2 2.8 2 5c0 3.3 4 9 4 9s4-5.7 4-9c0-2.2-1.8-4-4-4z"/><circle cx="6" cy="5" r="1.3"/></svg>
              <input type="text" defaultValue="Lyon" style={{ border:'none', background:'transparent', outline:'none', fontFamily:'inherit', fontSize:14, fontWeight:500, color:v.text2, width:72 }} />
            </div>
            <button style={{ margin:5, padding:'8px 20px', borderRadius:100, background:v.blue, color:'#fff', border:'none', fontFamily:'inherit', fontSize:13, fontWeight:500, cursor:'pointer', flexShrink:0 }}>Rechercher</button>
          </div>

          {/* Salary strip — overflow:visible partout pour que les thumbs soient visibles */}
          <div style={{ display:'flex', alignItems:'center', gap:14, width:'100%', maxWidth:620, background:v.white, borderRadius:12, border:`1px solid ${v.line}`, padding:'16px 20px', boxShadow:v.shadow, overflow:'visible' }}>
            <span style={{ fontSize:12, fontWeight:500, color:v.text2, flexShrink:0, whiteSpace:'nowrap' }}>Rémunération (Annuelle)</span>
            {/* Dual range wrapper */}
            <div style={{ flex:1, position:'relative', height:20, overflow:'visible' }}>
              {/* Track background */}
              <div style={{ position:'absolute', left:0, right:0, top:'50%', transform:'translateY(-50%)', height:3, background:v.bg2, borderRadius:2 }} />
              {/* Track fill */}
              <div style={{ position:'absolute', top:'50%', transform:'translateY(-50%)', height:3, background:v.blue, borderRadius:2, left:`${pct(salMin)}%`, width:`${pct(salMax)-pct(salMin)}%` }} />
              {/* Min thumb */}
              <input
                type="range" min={20} max={120} step={1} value={salMin}
                onChange={e => { const n = +e.target.value; if (n < salMax - 5) setSalMin(n); }}
                className="dualrange"
                style={{ position:'absolute', width:'100%', top:0, left:0, zIndex:2 }}
              />
              {/* Max thumb */}
              <input
                type="range" min={20} max={120} step={1} value={salMax}
                onChange={e => { const n = +e.target.value; if (n > salMin + 5) setSalMax(n); }}
                className="dualrange"
                style={{ position:'absolute', width:'100%', top:0, left:0, zIndex:3 }}
              />
            </div>
            <span style={{ fontSize:13, fontWeight:600, color:v.text, flexShrink:0, minWidth:108, textAlign:'right', letterSpacing:'-0.02em' }}>{salMin}k€ — {salMax}k€</span>
          </div>
        </div>

        <div style={{ marginTop:14 }}>
          <button onClick={()=>setPaywall(true)} style={{ padding:'12px 30px', borderRadius:100, background:v.white, color:v.text, border:`1px solid ${v.line2}`, fontFamily:'inherit', fontSize:15, fontWeight:400, cursor:'pointer', boxShadow:v.shadow }}>Commencer gratuitement</button>
        </div>
      </div>

      {/* BENTO */}
      <div id="bento" style={{ maxWidth:1080, margin:'0 auto', padding:'0 24px 72px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>

          <BCard>
            <BCIcon><svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" width={22} height={22}><path d="M2 7l9-4 9 4-9 4-9-4z"/><path d="M2 12l9 4 9-4"/><path d="M2 17l9 4 9-4"/></svg></BCIcon>
            <BCTitle>Sources Unifiées</BCTitle>
            <div style={{ display:'flex', flexWrap:'wrap', gap:5, margin:'12px 0 10px' }}>
              {['Indeed','LinkedIn','France Travail','HelloWork','WTTJ'].map(s=><SrcPill key={s} label={s} />)}
            </div>
            <BCsub>Toutes vos recherches, un seul endroit.</BCsub>
          </BCard>

          <BCard>
            <BCIcon><svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" width={22} height={22}><path d="M13 2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z"/><polyline points="13,2 13,7 18,7"/><path d="M14 12l-3 1.5L9 12l1.5 3L9 17l2-1 2 1-1.5-2z"/></svg></BCIcon>
            <BCTitle>Smart CV IA</BCTitle>
            <div style={{ display:'flex', alignItems:'center', gap:6, margin:'14px 0 10px' }}>
              <div style={{ flex:1, background:v.bg, border:`1px solid ${v.line}`, borderRadius:8, padding:'8px 10px', fontSize:10.5, fontWeight:500, color:v.text2, textAlign:'center', lineHeight:1.35 }}>Offre<br/>analysée</div>
              <svg viewBox="0 0 13 13" fill="none" stroke={v.text3} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" width={13} height={13}><path d="M2 6.5h9M7.5 3l4 3.5-4 3.5"/></svg>
              <div style={{ flex:1, background:v.bg, border:`1px solid ${v.line}`, borderRadius:8, padding:'8px 10px', fontSize:10.5, fontWeight:500, color:v.text2, textAlign:'center', lineHeight:1.35 }}>CV<br/>optimisé</div>
            </div>
            <div style={{ background:v.bg, border:`1px solid ${v.line}`, borderRadius:8, padding:10, position:'relative' }}>
              <div style={{ fontSize:8, fontWeight:600, color:v.text2, borderBottom:`1px solid ${v.line}`, paddingBottom:5, marginBottom:6, lineHeight:1.4 }}>Candidature pour Développeur React<br/>chez Contentsquare</div>
              {[58,78,42].map(w=><div key={w} style={{ height:5, borderRadius:3, background:v.bg2, marginBottom:4, width:`${w}%` }}/>)}
              <div style={{ position:'absolute', bottom:5, right:7, fontSize:7.5, fontWeight:600, color:'rgba(0,113,227,.2)', letterSpacing:'.04em' }}>DROP-JOB FREE</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:10, fontSize:11, color:v.text3 }}>
              Gratuit avec mention · <span style={{ color:v.blue, fontWeight:500 }}>illimité Premium</span>
            </div>
          </BCard>

          <BCard>
            <BCIcon><svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" width={22} height={22}><path d="M4.5 16a7.5 7.5 0 1 1 13 0"/><path d="M11 16 l-3-4" strokeWidth="1.6"/><circle cx="11" cy="16" r="1" fill="currentColor" stroke="none"/></svg></BCIcon>
            <BCTitle>Salary Gauge</BCTitle>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', margin:'10px 0 8px' }}>
              <svg width="120" height="66" viewBox="0 0 120 66">
                <path d="M8 60 A52 52 0 0 1 112 60" fill="none" stroke="#e8e8ed" strokeWidth="7" strokeLinecap="round"/>
                <path d="M8 60 A52 52 0 0 1 112 60" fill="none" stroke={GAUGE[gauge].col} strokeWidth="7" strokeLinecap="round" strokeDasharray="163" strokeDashoffset={GAUGE[gauge].dash} style={{ transition:'all .5s' }}/>
                <line x1="60" y1="60" x2="60" y2="18" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" transform={`rotate(${GAUGE[gauge].rot} 60 60)`} style={{ transition:'transform .5s' }}/>
                <circle cx="60" cy="60" r="4" fill="white" stroke="#1d1d1f" strokeWidth="1.5"/>
                <text x="6" y="68" fontSize="8" fill="#aeaeb2" fontFamily="Inter,sans-serif">Bas</text>
                <text x="49" y="68" fontSize="8" fill="#aeaeb2" fontFamily="Inter,sans-serif">Juste</text>
                <text x="113" y="68" fontSize="8" fill="#aeaeb2" fontFamily="Inter,sans-serif" textAnchor="end">Haut</text>
              </svg>
              <div style={{ marginTop:8, padding:'3px 13px', borderRadius:100, fontSize:11, fontWeight:600, background:GAUGE[gauge].bg, color:GAUGE[gauge].col }}>{GAUGE[gauge].badge}</div>
              <div style={{ fontSize:12, color:v.text2, textAlign:'center', marginTop:6, lineHeight:1.45 }} dangerouslySetInnerHTML={{ __html: GAUGE[gauge].desc }} />
            </div>
            <div style={{ display:'flex', gap:4, justifyContent:'center', marginTop:10 }}>
              {(['bas','juste','haut'] as const).map(lv=>(
                <button key={lv} onClick={()=>setGauge(lv)} style={{ padding:'4px 11px', borderRadius:100, fontSize:11, fontWeight:500, color: gauge===lv ? v.blue : v.text2, background: gauge===lv ? 'rgba(0,113,227,.07)' : v.bg, border:`1px solid ${gauge===lv ? 'rgba(0,113,227,.18)' : v.line}`, cursor:'pointer', fontFamily:'inherit' }}>{lv==='bas'?'Bas':lv==='juste'?'Juste':'Haut'}</button>
              ))}
            </div>
          </BCard>

          <BCard>
            <BCIcon><svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" width={22} height={22}><rect x="2" y="3" width="5" height="10" rx="1.5"/><rect x="8.5" y="3" width="5" height="14" rx="1.5"/><rect x="15" y="3" width="5" height="7" rx="1.5"/></svg></BCIcon>
            <BCTitle>Tableau de Bord</BCTitle>
            <BCsub>Suivi de vos candidatures.</BCsub>
            <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:14 }}>
              {[
                { name:'Ritz',     tag:'Envoyé',    bg:'rgba(0,113,227,.07)', col:v.blue },
                { name:'TechCorp', tag:'Relancé',   bg:'rgba(180,83,9,.07)',  col:'#b45309' },
                { name:'StartupX', tag:'Entretien', bg:'rgba(29,131,72,.07)', col:'#1d8348' },
              ].map(r=>(
                <div key={r.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 11px', borderRadius:8, background:v.bg, border:`1px solid ${v.line}` }}>
                  <span style={{ fontSize:12, fontWeight:500 }}>{r.name}</span>
                  <span style={{ fontSize:10, fontWeight:600, padding:'2px 9px', borderRadius:100, background:r.bg, color:r.col }}>{r.tag}</span>
                </div>
              ))}
            </div>
          </BCard>
        </div>
      </div>

      {/* JOBS */}
      <div id="jobs" style={{ maxWidth:1080, margin:'0 auto', padding:'0 24px 72px' }}>
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:18 }}>
          <div style={{ fontSize:22, fontWeight:600, letterSpacing:'-0.03em' }}>Offres du moment</div>
          <div style={{ fontSize:13, color:v.text3 }}>{filtered.length} offres</div>
        </div>
        <div style={{ display:'flex', gap:5, marginBottom:16, flexWrap:'wrap' }}>
          {[['all','Tout'],['tech','Tech'],['design','Design'],['data','Data'],['product','Product'],['remote','Remote']].map(([val,label])=>(
            <span key={val} onClick={()=>setFilter(val)} style={{ padding:'5px 14px', borderRadius:100, background: filter===val ? 'rgba(0,113,227,.07)' : v.white, border:`1px solid ${filter===val ? 'rgba(0,113,227,.18)' : v.line}`, fontSize:12, fontWeight:500, color: filter===val ? v.blue : v.text2, cursor:'pointer', userSelect:'none' }}>{label}</span>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:10 }}>
          {filtered.map(j=>(
            <div key={j.id} onClick={()=>setJob(j)} style={{ background:v.white, border:`1px solid ${v.line}`, borderRadius:18, padding:20, cursor:'pointer', boxShadow:v.shadow, transition:'all .18s' }}
              onMouseEnter={e=>{ (e.currentTarget as HTMLDivElement).style.boxShadow=v.shadow2; (e.currentTarget as HTMLDivElement).style.transform='translateY(-2px)'; }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLDivElement).style.boxShadow=v.shadow; (e.currentTarget as HTMLDivElement).style.transform='none'; }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
                <div style={{ width:38, height:38, borderRadius:9, background:v.bg, border:`1px solid ${v.line}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" width={18} height={18} dangerouslySetInnerHTML={{ __html: LOGOS[j.company]||'' }} />
                </div>
                <span style={{ fontSize:10, fontWeight:500, padding:'3px 8px', borderRadius:100, textTransform:'uppercase', letterSpacing:'.02em', background:v.bg, border:`1px solid ${v.line}`, color:v.text3 }}>{j.src}</span>
              </div>
              <div style={{ fontSize:15, fontWeight:600, letterSpacing:'-0.02em', marginBottom:3 }}>{j.title}</div>
              <div style={{ fontSize:13, color:v.text2 }}>{j.company} · {j.loc}</div>
              <div style={{ display:'flex', gap:5, marginTop:12, flexWrap:'wrap' }}>
                {[j.contract, j.remote].map(t=><span key={t} style={{ padding:'3px 9px', borderRadius:100, fontSize:11, background:v.bg, border:`1px solid ${v.line}`, color:v.text2 }}>{t}</span>)}
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:14, paddingTop:14, borderTop:`1px solid ${v.line}` }}>
                <span style={{ fontSize:14, fontWeight:600, letterSpacing:'-0.02em' }}>{j.salary}</span>
                <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, fontWeight:500 }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:gc(j.g) }} />
                  <span style={{ color:gc(j.g) }}>{j.gt}</span>
                </div>
              </div>
              <button style={{ display:'block', width:'100%', marginTop:12, padding:9, background:'rgba(0,113,227,.07)', color:v.blue, border:'1px solid rgba(0,113,227,.14)', borderRadius:8, fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>Postuler avec CV IA</button>
            </div>
          ))}
        </div>
      </div>

      {/* PRICING */}
      <div id="pricing" style={{ maxWidth:1080, margin:'0 auto', padding:'0 24px 90px' }}>
        <div style={{ fontSize:22, fontWeight:600, letterSpacing:'-0.03em' }}>Tarification</div>
        <div style={{ display:'flex', justifyContent:'center', margin:'24px 0 32px' }}>
          <div style={{ display:'flex', background:v.white, border:`1px solid ${v.line2}`, borderRadius:100, padding:3, gap:2, boxShadow:v.shadow }}>
            {(['monthly','weekly'] as const).map(b=>(
              <button key={b} onClick={()=>setBilling(b)} style={{ padding:'7px 22px', borderRadius:100, border:'none', fontFamily:'inherit', fontSize:13, fontWeight:500, cursor:'pointer', background: billing===b ? v.white : 'transparent', color: billing===b ? v.text : v.text2, boxShadow: billing===b ? '0 1px 4px rgba(0,0,0,.1), 0 0 0 1px rgba(0,0,0,.14)' : 'none', transition:'all .2s', position:'relative' }}>
                {b==='monthly' ? 'Mensuel' : 'Hebdo'}
                {b==='weekly' && <span style={{ position:'absolute', top:-6, right:-4, background:'#1d8348', color:'#fff', fontSize:9, fontWeight:600, padding:'1px 5px', borderRadius:100 }}>Flexible</span>}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, maxWidth:660, margin:'0 auto' }}>
          <div style={{ background:v.white, border:`1px solid ${v.line}`, borderRadius:18, padding:'28px 26px', boxShadow:v.shadow }}>
            <div style={{ fontSize:11, fontWeight:500, letterSpacing:'.06em', textTransform:'uppercase', color:v.text3, marginBottom:14 }}>Gratuit</div>
            <div style={{ fontSize:42, fontWeight:300, letterSpacing:'-0.04em', lineHeight:1 }}>0€</div>
            <div style={{ fontSize:12, color:v.text2, marginTop:6, marginBottom:20 }}>Pour démarrer, sans limite de durée.</div>
            <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
              {[{l:'Toutes les offres agrégées',ok:true},{l:'1 CV Smart / mois',ok:true},{l:'Jauge salariale IA',ok:true},{l:'Suppression du filigrane',ok:false},{l:'Filtres avancés',ok:false},{l:'Édition manuelle du CV',ok:false}].map(f=>(
                <li key={f.l} style={{ display:'flex', alignItems:'flex-start', gap:9, fontSize:13, color: f.ok ? v.text2 : v.text3 }}>
                  <div style={{ flexShrink:0, marginTop:1 }}>
                    {f.ok
                      ? <svg viewBox="0 0 14 14" fill="none" stroke="#1d8348" strokeWidth="1.6" strokeLinecap="round" width={14} height={14}><polyline points="2,7 6,11 12,3"/></svg>
                      : <svg viewBox="0 0 14 14" fill="none" stroke={v.text3} strokeWidth="1.6" strokeLinecap="round" width={14} height={14}><line x1="3" y1="3" x2="11" y2="11"/><line x1="11" y1="3" x2="3" y2="11"/></svg>}
                  </div>
                  {f.l}
                </li>
              ))}
            </ul>
            <button onClick={()=>setPaywall(true)} style={{ width:'100%', padding:11, borderRadius:8, fontFamily:'inherit', fontSize:13, fontWeight:500, cursor:'pointer', background:v.bg, color:v.text2, border:`1px solid ${v.line2}` }}>Commencer gratuitement</button>
          </div>
          <div style={{ background:v.white, border:`1.5px solid ${v.blue}`, borderRadius:18, padding:'28px 26px', boxShadow:`0 0 0 3px rgba(0,113,227,.07), ${v.shadow2}` }}>
            <div style={{ fontSize:11, fontWeight:500, letterSpacing:'.06em', textTransform:'uppercase', color:v.blue, marginBottom:14 }}>Premium</div>
            <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
              <div style={{ fontSize:42, fontWeight:300, letterSpacing:'-0.04em', lineHeight:1 }}>{billing==='monthly'?'9,90€':'3,49€'}</div>
              <div style={{ fontSize:13, color:v.text3, alignSelf:'flex-end', paddingBottom:4 }}>/ {billing==='monthly'?'mois':'semaine'}</div>
            </div>
            <div style={{ fontSize:12, color:v.text2, marginTop:6, marginBottom:20 }}>{billing==='monthly'?'Sans engagement, annulez quand vous voulez.':'Idéal pour une recherche intensive et courte.'}</div>
            <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
              {['Tout du plan Gratuit','CV illimités, sans filigrane','Édition manuelle complète','Filtres avancés + remote','Score de matching IA','Alertes email & push'].map(f=>(
                <li key={f} style={{ display:'flex', alignItems:'flex-start', gap:9, fontSize:13, color:v.text2 }}>
                  <div style={{ flexShrink:0, marginTop:1 }}><svg viewBox="0 0 14 14" fill="none" stroke="#1d8348" strokeWidth="1.6" strokeLinecap="round" width={14} height={14}><polyline points="2,7 6,11 12,3"/></svg></div>
                  {f}
                </li>
              ))}
            </ul>
            <button onClick={()=>setPaywall(true)} style={{ width:'100%', padding:11, borderRadius:8, fontFamily:'inherit', fontSize:13, fontWeight:500, cursor:'pointer', background:v.blue, color:'#fff', border:'none', boxShadow:'0 2px 8px rgba(0,113,227,.25)' }}>Passer à Premium</button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop:`1px solid ${v.line}`, padding:'22px 24px' }}>
        <div style={{ maxWidth:1080, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600, letterSpacing:'-0.02em' }}>
            <svg viewBox="0 0 40 40" fill="none" width={22} height={22}><rect x="5" y="5" width="30" height="30" rx="7" transform="rotate(45 20 20)" stroke="currentColor" strokeWidth="2.2" fill="none"/><rect x="9" y="9" width="22" height="22" rx="5" transform="rotate(45 20 20)" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.45"/><circle cx="20" cy="20" r="7.5" stroke="currentColor" strokeWidth="1.8" fill="none"/><line x1="20" y1="15.5" x2="20" y2="22.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><polyline points="17,20.5 20,23.5 23,20.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            drop-job
          </div>
          <div style={{ display:'flex', gap:18 }}>
            {['Confidentialité','CGU','Blog','API'].map(l=><a key={l} href="#" style={{ fontSize:12, color:v.text3, textDecoration:'none' }}>{l}</a>)}
          </div>
          <div style={{ fontSize:12, color:v.text3 }}>© 2025 Drop-Job</div>
        </div>
      </footer>
    </div>

    {/* PAYWALL */}
    {paywall && (
      <div onClick={e=>e.target===e.currentTarget&&setPaywall(false)} style={{ display:'flex', position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,.22)', backdropFilter:'blur(8px)', alignItems:'flex-end', justifyContent:'center' }}>
        <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', borderTop:`1px solid rgba(0,0,0,.08)`, width:'100%', maxWidth:560, padding:'24px 28px 32px', boxShadow:'0 -4px 32px rgba(0,0,0,.1)' }}>
          <div style={{ width:32, height:4, borderRadius:2, background:'#e8e8ed', margin:'0 auto 22px' }} />
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(192,57,43,.05)', border:'1px solid rgba(192,57,43,.12)', borderRadius:8, padding:'10px 13px', fontSize:12, color:'#c0392b', marginBottom:18 }}>
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width={14} height={14}><circle cx="7" cy="7" r="5.5"/><line x1="7" y1="4.5" x2="7" y2="7.5"/><circle cx="7" cy="9.5" r=".5" fill="currentColor" stroke="none"/></svg>
            Vous avez utilisé votre CV gratuit ce mois-ci
          </div>
          <div style={{ fontSize:21, fontWeight:500, letterSpacing:'-0.03em', marginBottom:5 }}>Passez à Premium</div>
          <div style={{ fontSize:14, color:'#6e6e73', marginBottom:18, lineHeight:1.5, fontWeight:300 }}>Débloquez des CV sans filigrane, l'édition manuelle et des candidatures illimitées.</div>
          <div style={{ display:'flex', flexDirection:'column', gap:9, marginBottom:22 }}>
            {['CV illimités, propres, éditables','Filtres avancés — télétravail, culture, taille','Score de matching IA pour chaque offre'].map(p=>(
              <div key={p} style={{ display:'flex', alignItems:'center', gap:9, fontSize:13, color:'#6e6e73' }}>
                <svg viewBox="0 0 14 14" fill="none" stroke="#1d8348" strokeWidth="1.6" strokeLinecap="round" width={14} height={14}><polyline points="2,7 6,11 12,3"/></svg>{p}
              </div>
            ))}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <button style={{ width:'100%', padding:13, borderRadius:8, background:'#0071e3', color:'#fff', border:'none', fontFamily:'inherit', fontSize:15, fontWeight:500, cursor:'pointer' }}>Passer à Premium — 9,90€ / mois</button>
            <button onClick={()=>setPaywall(false)} style={{ width:'100%', padding:11, borderRadius:8, background:'transparent', color:'#6e6e73', border:'1px solid rgba(0,0,0,.14)', fontFamily:'inherit', fontSize:13, cursor:'pointer' }}>Continuer avec le plan gratuit</button>
          </div>
        </div>
      </div>
    )}

    {/* JOB DETAIL */}
    {job && (
      <div onClick={e=>e.target===e.currentTarget&&setJob(null)} style={{ display:'flex', position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,.2)', backdropFilter:'blur(8px)', alignItems:'center', justifyContent:'center', padding:24 }}>
        <div style={{ background:'#fff', borderRadius:18, border:'1px solid rgba(0,0,0,.08)', width:'100%', maxWidth:500, maxHeight:'88vh', overflowY:'auto', padding:26, boxShadow:'0 2px 6px rgba(0,0,0,.07), 0 8px 28px rgba(0,0,0,.07)' }}>
          <button onClick={()=>setJob(null)} style={{ float:'right', width:26, height:26, borderRadius:'50%', background:'#f5f5f7', border:'1px solid rgba(0,0,0,.08)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#6e6e73' }}>
            <svg viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" width={11} height={11}><line x1="1" y1="1" x2="10" y2="10"/><line x1="10" y1="1" x2="1" y2="10"/></svg>
          </button>
          <div style={{ fontSize:12, color:'#aeaeb2', marginBottom:4 }}>{job.company} · {job.loc}</div>
          <div style={{ fontSize:22, fontWeight:500, letterSpacing:'-0.03em', marginBottom:16 }}>{job.title}</div>
          <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:16 }}>
            {[job.contract,job.remote,job.src].map(t=><span key={t} style={{ padding:'3px 9px', borderRadius:100, fontSize:11, background:'#f5f5f7', border:'1px solid rgba(0,0,0,.08)', color:'#6e6e73' }}>{t}</span>)}
          </div>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:10, fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase', color:'#aeaeb2', marginBottom:7 }}>Description</div>
            <p style={{ fontSize:13, color:'#6e6e73', lineHeight:1.65 }}>{job.desc}</p>
          </div>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:10, fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase', color:'#aeaeb2', marginBottom:7 }}>Compétences</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
              {job.skills.map(s=><span key={s} style={{ padding:'4px 10px', borderRadius:100, fontSize:11, background:'#f5f5f7', border:'1px solid rgba(0,0,0,.08)', color:'#6e6e73' }}>{s}</span>)}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <div style={{ fontSize:20, fontWeight:500, letterSpacing:'-0.03em' }}>{job.salary}</div>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, fontWeight:500 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:gc(job.g) }} />
              <span style={{ color:gc(job.g) }}>{job.gt}</span>
            </div>
          </div>
          <button onClick={startGen} style={{ width:'100%', padding:12, borderRadius:8, background:'#0071e3', color:'#fff', border:'none', fontFamily:'inherit', fontSize:14, fontWeight:500, cursor:'pointer' }}>Générer mon CV pour cette offre</button>
        </div>
      </div>
    )}

    {/* GEN */}
    {genOpen && (
      <div style={{ display:'flex', position:'fixed', inset:0, zIndex:400, background:'rgba(0,0,0,.4)', backdropFilter:'blur(12px)', alignItems:'center', justifyContent:'center' }}>
        <div style={{ background:'#fff', borderRadius:18, border:'1px solid rgba(0,0,0,.08)', width:'100%', maxWidth:360, padding:32, textAlign:'center', boxShadow:'0 2px 6px rgba(0,0,0,.07), 0 8px 28px rgba(0,0,0,.07)' }}>
          <div style={{ width:40, height:40, borderRadius:'50%', border:'2px solid #e8e8ed', borderTopColor:'#0071e3', animation:'spin .7s linear infinite', margin:'0 auto 18px' }} />
          <div style={{ fontSize:17, fontWeight:500, letterSpacing:'-0.025em', marginBottom:18 }}>Génération de votre CV…</div>
          <div style={{ textAlign:'left', display:'flex', flexDirection:'column', gap:9 }}>
            {GEN_STEPS.map((s,i)=>(
              <div key={s} style={{ display:'flex', alignItems:'center', gap:9, fontSize:12, color: i<genStep ? '#1d8348' : i===genStep ? '#1d1d1f' : '#aeaeb2', fontWeight: i===genStep ? 500 : 400, transition:'color .3s' }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background: i<genStep ? '#1d8348' : i===genStep ? '#0071e3' : '#e8e8ed', flexShrink:0, transition:'all .3s', boxShadow: i===genStep ? '0 0 0 3px rgba(0,113,227,.12)' : 'none' }} />
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    )}

    <style>{`
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }

      /* ── Dual range slider ── */
      input.dualrange {
        -webkit-appearance: none;
        appearance: none;
        height: 20px;
        background: transparent;
        pointer-events: none;
        outline: none;
        margin: 0;
      }
      input.dualrange::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #ffffff;
        border: 2px solid #0071e3;
        box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        cursor: pointer;
        pointer-events: all;
      }
      input.dualrange::-webkit-slider-thumb:hover {
        transform: scale(1.1);
        box-shadow: 0 0 0 4px rgba(0,113,227,0.15);
      }
      input.dualrange::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #ffffff;
        border: 2px solid #0071e3;
        box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        cursor: pointer;
        pointer-events: all;
      }
      input.dualrange::-webkit-slider-runnable-track {
        background: transparent;
        height: 20px;
      }

      @keyframes spin { to { transform: rotate(360deg); } }
    `}</style>
    </>
  );
}

function BCard({ children }: { children: React.ReactNode }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{ background:'#fff', borderRadius:18, border:'1px solid rgba(0,0,0,.08)', boxShadow: h ? '0 2px 6px rgba(0,0,0,.07),0 8px 28px rgba(0,0,0,.07)' : '0 1px 2px rgba(0,0,0,.05),0 2px 12px rgba(0,0,0,.05)', padding:'24px 22px 20px', transition:'box-shadow .2s,transform .2s', transform: h ? 'translateY(-2px)' : 'none', overflow:'hidden' }}>
      {children}
    </div>
  );
}
function BCIcon({ children }: { children: React.ReactNode }) {
  return <div style={{ width:32, height:32, marginBottom:14, display:'flex', alignItems:'center', justifyContent:'center' }}>{children}</div>;
}
function BCTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize:14, fontWeight:600, letterSpacing:'-0.015em', color:'#1d1d1f', marginBottom:4 }}>{children}</div>;
}
function BCsub({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize:12, color:'#6e6e73', lineHeight:1.55 }}>{children}</div>;
}
function SrcPill({ label }: { label: string }) {
  const [on, setOn] = useState(true);
  return (
    <div onClick={()=>setOn(p=>!p)} style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 9px', borderRadius:100, background: on ? 'rgba(0,113,227,.07)' : '#f5f5f7', border:`1px solid ${on ? 'rgba(0,113,227,.18)' : 'rgba(0,0,0,.14)'}`, fontSize:11, fontWeight:500, color: on ? '#0071e3' : '#6e6e73', cursor:'pointer', userSelect:'none' }}>
      <svg viewBox="0 0 8 8" width={8} height={8}><circle cx="4" cy="4" r="3" fill="currentColor"/></svg>
      {label}
    </div>
  );
}