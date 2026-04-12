/* ═══════════════════════════════════════════════════
   FORSCHUNGSTAGEBUCH — script.js
═══════════════════════════════════════════════════ */

/* ── SUPABASE KONFIGURATION ──────────────────────────────────────────
   1. Gehe zu https://supabase.com → Neues Projekt erstellen (kostenlos)
   2. Settings → API → kopiere "Project URL" und "anon public" Key
   3. Trage sie hier ein (der anon-Key ist sicher, öffentlich sichtbar)
   ──────────────────────────────────────────────────────────────────── */
const SUPABASE_URL      = 'https://qqjahksotcdkvwutazvh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DBaxvM-PdGUBdVMF6p0fPQ_Z9OibJFu';

const _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* Emails, die intern für die Supabase-Nutzer verwendet werden.
   Passwörter werden NUR in Supabase gespeichert (gehasht) – nie im Code. */
const ROLE_EMAIL = {
  lehrer: 'lehrer@forschungstagebuch.local',
  admin:  'admin@forschungstagebuch.local',
};

/* ── DB-LADESPIN HELPER ── */
function dbShow(msg='Laden …'){const o=document.getElementById('dbLoading');if(o){document.getElementById('dbLoadingMsg').textContent=msg;o.style.display='flex';}}

/* ── SLIDE FORMATS ── */
const FMT = {
  '16:9':    {w:960,  h:540,  label:'960 × 540 px'},
  '4:3':     {w:960,  h:720,  label:'960 × 720 px'},
  'A4-quer': {w:1123, h:794,  label:'A4 Querformat'},
  'A4-hoch': {w:794,  h:1123, label:'A4 Hochformat'},
  'A3-quer': {w:1587, h:1123, label:'A3 Querformat'},
  'A3-hoch': {w:1123, h:1587, label:'A3 Hochformat'},
};

/* ── ER ELEMENT DEFAULTS ── */
const ERD = {
  'er-entity':        {w:160,h:60, label:'Entität',              stroke:'#e8a030',fill:'rgba(232,160,48,.09)'},
  'er-weak-entity':   {w:160,h:60, label:'Schwache Entität',     stroke:'#e8a030',fill:'rgba(232,160,48,.09)'},
  'er-relation':      {w:130,h:80, label:'Beziehungstyp',        stroke:'#3b82f6',fill:'rgba(59,130,246,.09)'},
  'er-weak-relation': {w:140,h:86, label:'Schwacher Bez.typ',    stroke:'#3b82f6',fill:'rgba(59,130,246,.07)'},
  'er-attribute':     {w:130,h:54, label:'Attribut',             stroke:'#86efac',fill:'rgba(134,239,172,.07)'},
  'er-key-attribute': {w:130,h:54, label:'Schlüsselattribut',    stroke:'#86efac',fill:'rgba(134,239,172,.07)'},
  'er-multi-attribute':{w:140,h:58,label:'Mehrwertiges Attr.',   stroke:'#86efac',fill:'rgba(134,239,172,.05)'},
  'er-derived-attr':  {w:130,h:54, label:'Abgel. Attribut',      stroke:'#86efac',fill:'rgba(134,239,172,.04)'},
  'er-isa':           {w:100,h:80, label:'IS-A',                  stroke:'#c084fc',fill:'rgba(192,132,252,.09)'},
  'er-cardinality':   {w:50, h:40, label:'Kardinalität',          stroke:'transparent',fill:'transparent'},
};
const SNAP_TH = 32; // snap threshold px — how close cursor must be to element border

/* ── DEFAULT DATA ── */
const DEFS = [
  {id:1,q:'Q2',datum:'2026-02-10',pos:10,titel:'Einführung ER-Modell',tags:['ER-Modell','Datenbanken','Modellierung'],
   slides:[
    {id:'s1',title:'Grundbegriffe',format:'16:9',slideBg:'#0c0c0c',elements:[
      {id:'e1',type:'title',x:40,y:28,w:880,h:66,z:1,html:'Einführung in das <em style="color:#e8a030">ER-Modell</em>',style:{fontSize:34,fontFamily:"'Playfair Display',serif",color:'#e4ddd0',fontWeight:'900',textAlign:'left',lineHeight:1.2,background:'transparent',borderRadius:0}},
      {id:'e2',type:'text',x:40,y:108,w:490,h:320,z:2,html:'Das Entity-Relationship-Modell (ERM) stellt die Struktur von Daten grafisch dar – als Bauplan für eine Datenbank.<br><br><strong>Grundbausteine:</strong><ul><li><strong>Entität</strong> – Objekt der realen Welt</li><li><strong>Attribut</strong> – Eigenschaft einer Entität</li><li><strong>Beziehung</strong> – Verbindung zwischen Entitäten</li></ul><br>Werkzeug: <u>yEd Graph Editor</u>',style:{fontSize:14,fontFamily:"'DM Sans',sans-serif",color:'#888077',fontWeight:'400',textAlign:'left',lineHeight:1.75,background:'transparent',borderRadius:0}},
      {id:'e3',type:'er-entity',    x:560,y:115,w:155,h:56,z:3,text:'Schüler', erStyle:{stroke:'#e8a030',fill:'rgba(232,160,48,.09)',strokeWidth:2,dashed:false}},
      {id:'e4',type:'er-relation',  x:577,y:212,w:125,h:73,z:4,text:'besucht',erStyle:{stroke:'#3b82f6',fill:'rgba(59,130,246,.09)',strokeWidth:2,dashed:false}},
      {id:'e5',type:'er-entity',    x:560,y:330,w:155,h:56,z:5,text:'Kurs',   erStyle:{stroke:'#e8a030',fill:'rgba(232,160,48,.09)',strokeWidth:2,dashed:false}},
      {id:'e6',type:'er-key-attribute',x:732,y:120,w:134,h:48,z:6,text:'Schüler-ID',erStyle:{stroke:'#86efac',fill:'rgba(134,239,172,.07)',strokeWidth:1.5,dashed:false}},
      {id:'e7',type:'er-attribute', x:732,y:182,w:120,h:48,z:7,text:'Name',  erStyle:{stroke:'#86efac',fill:'rgba(134,239,172,.07)',strokeWidth:1.5,dashed:false}},
      {id:'e8',type:'er-cardinality',x:530,y:243,w:42,h:28,z:8,text:'m',erStyle:{stroke:'transparent',fill:'transparent',strokeWidth:0,dashed:false}},
      {id:'e9',type:'er-cardinality',x:704,y:243,w:42,h:28,z:9,text:'n',erStyle:{stroke:'transparent',fill:'transparent',strokeWidth:0,dashed:false}},
      {id:'ea',type:'er-line',x1:637,y1:171,x2:637,y2:212,z:10,erStyle:{stroke:'#888077',strokeWidth:2,dashed:false}},
      {id:'eb',type:'er-line',x1:637,y1:285,x2:637,y2:330,z:11,erStyle:{stroke:'#888077',strokeWidth:2,dashed:false}},
      {id:'ec',type:'text',x:40,y:448,w:880,h:28,z:12,html:'Peter Chen, 1976  ·  Informatik Q2  ·  10.02.2026',style:{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:'#3a3836',fontWeight:'400',textAlign:'left',lineHeight:1.4,background:'transparent',borderRadius:0}},
    ]},
    {id:'s2',title:'Kardinalitäten',format:'16:9',slideBg:'#0c0c0c',elements:[
      {id:'f1',type:'title',x:40,y:28,w:880,h:66,z:1,html:'Kardinalitäten',style:{fontSize:34,fontFamily:"'Playfair Display',serif",color:'#e4ddd0',fontWeight:'900',textAlign:'left',lineHeight:1.2,background:'transparent',borderRadius:0}},
      {id:'f2',type:'text',x:40,y:108,w:420,h:340,z:2,html:'<strong>1:1</strong> – eins-zu-eins<br>Person ↔ Personalausweis<br><br><strong>1:n</strong> – eins-zu-viele<br>Vermieter → Ferienwohnungen<br><br><strong>m:n</strong> – viele-zu-viele<br>Schüler ↔ Kurs',style:{fontSize:14,fontFamily:"'DM Sans',sans-serif",color:'#888077',fontWeight:'400',textAlign:'left',lineHeight:1.9,background:'transparent',borderRadius:0}},
      {id:'f3',type:'er-entity',   x:510,y:115,w:145,h:54,z:3,text:'Schüler', erStyle:{stroke:'#e8a030',fill:'rgba(232,160,48,.09)',strokeWidth:2,dashed:false}},
      {id:'f4',type:'er-relation', x:527,y:207,w:118,h:70,z:4,text:'besucht',erStyle:{stroke:'#3b82f6',fill:'rgba(59,130,246,.09)',strokeWidth:2,dashed:false}},
      {id:'f5',type:'er-entity',   x:510,y:325,w:145,h:54,z:5,text:'Kurs',   erStyle:{stroke:'#e8a030',fill:'rgba(232,160,48,.09)',strokeWidth:2,dashed:false}},
      {id:'f6',type:'er-cardinality',x:476,y:231,w:38,h:28,z:6,text:'m',erStyle:{stroke:'transparent',fill:'transparent',strokeWidth:0,dashed:false}},
      {id:'f7',type:'er-cardinality',x:652,y:231,w:38,h:28,z:7,text:'n',erStyle:{stroke:'transparent',fill:'transparent',strokeWidth:0,dashed:false}},
      {id:'f8',type:'er-line',x1:582,y1:169,x2:582,y2:207,z:8,erStyle:{stroke:'#888077',strokeWidth:2,dashed:false}},
      {id:'f9',type:'er-line',x1:582,y1:277,x2:582,y2:325,z:9,erStyle:{stroke:'#888077',strokeWidth:2,dashed:false}},
    ]},
  ]},
  {id:2,q:'Q2',datum:'2026-02-17',pos:20,titel:'ERM → Relationale Datenbank',tags:['Relationale DB','SQL','Transformation'],
   slides:[
    {id:'s1',title:'Transformationsregeln',format:'16:9',slideBg:'#0c0c0c',elements:[
      {id:'g1',type:'title',x:40,y:28,w:880,h:66,z:1,html:'ERM → Relationale Datenbank',style:{fontSize:32,fontFamily:"'Playfair Display',serif",color:'#e4ddd0',fontWeight:'900',textAlign:'left',lineHeight:1.2,background:'transparent',borderRadius:0}},
      {id:'g2',type:'text',x:40,y:108,w:355,h:360,z:2,html:'<strong>Regel 1</strong> – Entität → Tabelle<br>Schlüsselattr. → PRIMARY KEY<br><br><strong>Regel 2</strong> – 1:n → Fremdschlüssel<br>PK der "1"-Seite als FK<br><br><strong>Regel 3</strong> – m:n → Zwischentabelle<br>Zusammengesetzter PK<br><br><strong>Regel 4</strong> – IS-A<br>Gemeinsame oder Unterklassen-Tabelle',style:{fontSize:13.5,fontFamily:"'DM Sans',sans-serif",color:'#888077',fontWeight:'400',textAlign:'left',lineHeight:1.75,background:'transparent',borderRadius:0}},
      {id:'g3',type:'code',x:415,y:108,w:505,h:370,z:3,html:'CREATE TABLE Schueler (\n    id           INT PRIMARY KEY,\n    name         VARCHAR(80),\n    geburtsdatum DATE\n);\n\nCREATE TABLE Zeugnis (\n    id          INT PRIMARY KEY,\n    schueler_id INT REFERENCES Schueler(id),\n    datum       DATE,\n    note        DECIMAL(3,1)\n);\n\nCREATE TABLE Schueler_Kurs (\n    schueler_id INT REFERENCES Schueler(id),\n    kurs_id     INT REFERENCES Kurs(id),\n    PRIMARY KEY (schueler_id, kurs_id)\n);',style:{fontSize:11.5,fontFamily:"'JetBrains Mono',monospace",color:'#7dd3fc',background:'#030303',borderRadius:8}},
    ]},
  ]},
];

/* ════════ STATE ════════ */
let curRole=null, activeQ={lehrer:'Q2',admin:'Q2'};
let dragListSrc=null, pwVis=false;
let edEntry=null, edSlideIdx=0, selElId=null, zMax=10;
// Unified move state
let MS=null; // {type:'move'|'resize'|'drag-pt', elId, sx,sy, data:{}}
let cvScale=1, cvOffX=0, cvOffY=0;
let vScale=1;
let activeRTBEl=null; // element id for rich text focus
let adminScreen='journal'; // 'journal' | 'dateien' | 'notizen'

/* ── Undo / Redo ── */
let _undoStack=[], _redoStack=[];
const UNDO_MAX=60;
function _snapElements(){const sl=curSlide();return sl?JSON.stringify(sl.elements):null;}
function pushHistory(){
  const snap=_snapElements(); if(!snap)return;
  _undoStack.push(snap);
  if(_undoStack.length>UNDO_MAX)_undoStack.shift();
  _redoStack=[];
  _updateHistBtns();
  _spRefresh();
}
function _restoreElements(snap){
  const sl=curSlide(); if(!sl||!snap)return;
  sl.elements=JSON.parse(snap);
  deselectAll(); renderSlide(); renderSpanel(); _updateHistBtns();
}
function edUndo(){
  if(!_undoStack.length)return;
  const cur=_snapElements(); if(cur)_redoStack.push(cur);
  _restoreElements(_undoStack.pop());
}
function edRedo(){
  if(!_redoStack.length)return;
  const cur=_snapElements(); if(cur)_undoStack.push(cur);
  _restoreElements(_redoStack.pop());
}
function _updateHistBtns(){
  const u=document.getElementById('edUndoBtn'), r=document.getElementById('edRedoBtn');
  if(u)u.disabled=!_undoStack.length;
  if(r)r.disabled=!_redoStack.length;
}
function _clearHistory(){_undoStack=[];_redoStack=[];_updateHistBtns();}
/* Debounced push for continuous inputs (format panel sliders/numbers) */
let _histDebTimer=null;
function pushHistoryDebounced(){
  clearTimeout(_histDebTimer);
  _histDebTimer=setTimeout(pushHistory,400);
}

/* Debounced slide-panel preview refresh — called after any element change */
let _spDebTimer=null;
function _spRefresh(){clearTimeout(_spDebTimer);_spDebTimer=setTimeout(()=>{if(edEntry)renderSpanel();},120);}

/* ════════ STORAGE (Supabase + In-Memory-Cache) ════════
   load()    → gibt den Cache synchron zurück (für alle bestehenden Aufrufe)
   persist() → aktualisiert Cache + schreibt async in die DB
   loadFromDB() → lädt alle Einträge aus Supabase in den Cache
   ══════════════════════════════════════════════════════ */
let _data = [];   // In-Memory-Cache aller Einträge

function migrate(e){
  if(!e.slides){
    const s={id:'s1',title:e.titel||'Folie 1',format:e.format||'16:9',slideBg:e.slideBg||'#0c0c0c',elements:[]};
    if(e.elements){
      s.elements=e.elements.map(el=>{
        if(!el.html){
          if(el.type==='title'||el.type==='text') el.html=(el.text||'').replace(/\n/g,'<br>');
          else if(el.type==='code') el.html=el.text||'';
        }
        return el;
      });
    }
    e.slides=[s];
    delete e.elements; delete e.format; delete e.slideBg;
  }
  e.slides.forEach(sl=>{
    (sl.elements||[]).forEach(el=>{
      if(!el.html&&(el.type==='title'||el.type==='text'||el.type==='code')){
        el.html=(el.text||'').replace(/\n/g,'<br>');
      }
      if(!el.erStyle&&el.type&&el.type.startsWith('er-'))el.erStyle={stroke:'#e8a030',fill:'rgba(232,160,48,.09)',strokeWidth:2,dashed:false};
      if(el.erStyle&&el.erStyle.dashed===undefined)el.erStyle.dashed=false;
    });
  });
  return e;
}

function load() { return _data; }

async function loadFromDB() {
  const { data, error } = await _sb.from('entries').select('*').order('pos', { ascending: true });
  if (error) { console.error('Supabase Ladefehler:', error.message); return; }
  _data = (data || []).map(row => migrate({
    id:     row.id,
    q:      row.q      || 'Q2',
    datum:  row.datum  || new Date().toISOString().split('T')[0],
    pos:    row.pos    || 10,
    titel:  row.titel  || 'Eintrag',
    tags:   row.tags   || [],
    slides: row.slides || [],
  }));
}

/* persist(): Cache sofort aktualisieren, dann async in DB schreiben */
function persist(arr) {
  _data = arr;
  _upsertToDB(arr);
}

async function _upsertToDB(arr) {
  if (!arr.length) return;
  const rows = arr.map(e => ({
    id:     e.id,
    q:      e.q,
    datum:  e.datum,
    pos:    e.pos ?? 10,
    titel:  e.titel,
    tags:   e.tags   || [],
    slides: e.slides || [],
  }));
  const { error } = await _sb.from('entries').upsert(rows, { onConflict: 'id' });
  if (error) console.error('Supabase Schreibfehler:', error.message);
}

async function _deleteFromDB(id) {
  const { error } = await _sb.from('entries').delete().eq('id', id);
  if (error) console.error('Supabase Löschfehler:', error.message);
}

/* ════════ AUTH (Supabase) ════════ */
function toggleEye(){
  pwVis=!pwVis; const f=document.getElementById('pwf'); f.type=pwVis?'text':'password';
  document.getElementById('eyeIco').innerHTML=pwVis
    ?'<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'
    :'<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
}
function onPwIn(){ /* hint entfernt */ }

async function doLogin(){
  const role = document.getElementById('roleSelect').value;
  const pw   = document.getElementById('pwf').value;
  const errEl = document.getElementById('lerr');
  const btn   = document.querySelector('.btn-login');
  errEl.textContent = '';

  if (!pw) { errEl.textContent = '❌ Bitte Passwort eingeben.'; return; }

  btn.disabled = true; btn.textContent = 'Einloggen …';

  const { data, error } = await _sb.auth.signInWithPassword({
    email:    ROLE_EMAIL[role],
    password: pw,
  });

  btn.disabled = false; btn.textContent = 'Einloggen →';
  document.getElementById('pwf').value = '';

  if (error) {
    errEl.textContent = '❌ Falsches Passwort.';
    errEl.classList.remove('shake'); void errEl.offsetWidth; errEl.classList.add('shake');
    return;
  }

  curRole = role;
  dbShow('Einträge laden …');
  await loadFromDB();
  document.getElementById('dbLoading').style.display = 'none';
  showView(role + 'View');
  refreshAll();
}

async function logout(){
  await _sb.auth.signOut();
  curRole = null;
  _data = [];
  adminScreen='journal';
  _noteLoaded=false;
  _treeState={};
  showView('loginView');
}
function showView(id){
  document.querySelectorAll('.view').forEach(v=>{v.classList.remove('active');v.style.display='none';});
  const t=document.getElementById(id);t.style.display=(id==='loginView')?'flex':'block';t.classList.add('active');
  document.getElementById('editorView').classList.remove('open');
  document.getElementById('viewerOverlay').classList.remove('open');
}

/* ════════ HELPERS ════════ */
function uid(){return 'e'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);}
function esc(s){return(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function toHex(s){
  if(!s||s==='transparent')return '#000000';
  if(s.startsWith('#'))return s.length===4?'#'+s[1]+s[1]+s[2]+s[2]+s[3]+s[3]:s.slice(0,7);
  const m=s.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if(!m)return '#000000';
  return '#'+[m[1],m[2],m[3]].map(x=>+x<16?'0'+(+x).toString(16):(+x).toString(16)).join('');
}
function fmtD(s){return new Date(s+'T00:00:00').toLocaleDateString('de-DE',{day:'2-digit',month:'long',year:'numeric'});}
function fmtM(s){return new Date(s+'T00:00:00').toLocaleDateString('de-DE',{month:'long',year:'numeric'});}
function matches(e,q){
  if(!q)return true; q=q.toLowerCase();
  const d=new Date(e.datum+'T00:00:00');
  const ds=d.toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'});
  const ms=d.toLocaleDateString('de-DE',{month:'2-digit',year:'numeric'});
  const ml=d.toLocaleDateString('de-DE',{month:'long',year:'numeric'}).toLowerCase();
  return e.titel.toLowerCase().includes(q)||(e.tags||[]).some(t=>t.toLowerCase().includes(q))
    ||ds.includes(q)||ms.includes(q)||ml.includes(q)||e.datum.replace(/-/g,'.').includes(q);
}
function getList(q,s){return load().filter(e=>e.q===q&&matches(e,s)).sort((a,b)=>(a.pos??999)-(b.pos??999)||(new Date(b.datum)-new Date(a.datum)));}
function slSz(sl){return FMT[sl?.format||'16:9']||FMT['16:9'];}

/* ════════ QUARTER TABS ════════ */
function buildQTabs(mode){
  const all=load(), el=document.getElementById(mode==='lehrer'?'qtL':'qtA');
  el.innerHTML=['Q1','Q2','Q3','Q4'].map(q=>{
    const has=all.some(e=>e.q===q), act=activeQ[mode]===q?'act':'';
    return `<button class="q-tab ${act}" onclick="setQ('${mode}','${q}')">${q}${has?'<span class="q-dot"></span>':''}</button>`;
  }).join('');
}
function setQ(mode,q){activeQ[mode]=q;buildQTabs(mode);if(mode==='lehrer')renderL();else renderA();}

/* ════════ ER SVG RENDERER ════════ */
function erShapeSVG(type,w,h,stroke,fill,sw,dashed){
  const s=stroke||'#e8a030', f=fill||'transparent', p=Math.max(0.5,sw||2);
  const da=dashed?`stroke-dasharray="${p*2.5} ${p*2}"`:'';
  const pad=p/2;
  switch(type){
    case 'er-entity':     return `<rect x="${pad}" y="${pad}" width="${w-p}" height="${h-p}" fill="${f}" stroke="${s}" stroke-width="${p}" rx="2" ${da}/>`;
    case 'er-weak-entity':{const m=6;return `<rect x="${pad}" y="${pad}" width="${w-p}" height="${h-p}" fill="${f}" stroke="${s}" stroke-width="${p}" rx="2"/><rect x="${m}" y="${m}" width="${w-m*2}" height="${h-m*2}" fill="none" stroke="${s}" stroke-width="${Math.max(1,p-0.5)}" rx="1"/>`;}
    case 'er-relation':   {const cx=w/2,cy=h/2;return `<polygon points="${cx},${pad} ${w-pad},${cy} ${cx},${h-pad} ${pad},${cy}" fill="${f}" stroke="${s}" stroke-width="${p}" ${da}/>`;}
    case 'er-weak-relation':{const cx=w/2,cy=h/2,off=8;return `<polygon points="${cx},${pad} ${w-pad},${cy} ${cx},${h-pad} ${pad},${cy}" fill="${f}" stroke="${s}" stroke-width="${p}"/><polygon points="${cx},${off} ${w-off},${cy} ${cx},${h-off} ${off},${cy}" fill="none" stroke="${s}" stroke-width="${Math.max(1,p-0.5)}"/>`;}
    case 'er-attribute':  return `<ellipse cx="${w/2}" cy="${h/2}" rx="${(w-p)/2}" ry="${(h-p)/2}" fill="${f}" stroke="${s}" stroke-width="${p}" ${da}/>`;
    case 'er-key-attribute': return `<ellipse cx="${w/2}" cy="${h/2}" rx="${(w-p)/2}" ry="${(h-p)/2}" fill="${f}" stroke="${s}" stroke-width="${p}"/>`;
    case 'er-multi-attribute':{const ir=6;return `<ellipse cx="${w/2}" cy="${h/2}" rx="${(w-p)/2}" ry="${(h-p)/2}" fill="${f}" stroke="${s}" stroke-width="${p}"/><ellipse cx="${w/2}" cy="${h/2}" rx="${(w-p)/2-ir}" ry="${(h-p)/2-ir}" fill="none" stroke="${s}" stroke-width="${Math.max(1,p-0.5)}"/>`;}
    case 'er-derived-attr':return `<ellipse cx="${w/2}" cy="${h/2}" rx="${(w-p)/2}" ry="${(h-p)/2}" fill="${f}" stroke="${s}" stroke-width="${p}" stroke-dasharray="${p*2} ${p*1.5}"/>`;
    case 'er-isa':        return `<polygon points="${w/2},${pad} ${w-pad},${h-pad} ${pad},${h-pad}" fill="${f}" stroke="${s}" stroke-width="${p}" ${da}/>`;
    default: return '';
  }
}
function updateERSVG(el){
  const dom=document.getElementById('sel_'+el.id);if(!dom)return;
  const svg=dom.querySelector('svg.er-s');if(!svg)return;
  svg.setAttribute('viewBox',`0 0 ${el.w} ${el.h}`);
  const erS=el.erStyle||{};
  svg.innerHTML=erShapeSVG(el.type,el.w,el.h,erS.stroke,erS.fill,erS.strokeWidth,erS.dashed);
}

/* ════════ ER LINE ════════ */
const ER_LINE_PAD=22;
function lnBounds(el){
  const lx=Math.min(el.x1,el.x2), ly=Math.min(el.y1,el.y2);
  const rw=Math.abs(el.x2-el.x1)+2*ER_LINE_PAD, rh=Math.abs(el.y2-el.y1)+2*ER_LINE_PAD;
  return{lx:lx-ER_LINE_PAD,ly:ly-ER_LINE_PAD,w:rw,h:rh};
}
function buildLineDom(el){
  const b=lnBounds(el);
  const erS=el.erStyle||{};
  const wrap=document.createElement('div');
  wrap.className='er-line-el'; wrap.id='sel_'+el.id; wrap.dataset.elid=el.id;
  wrap.style.cssText=`left:${b.lx}px;top:${b.ly}px;width:${b.w}px;height:${b.h}px;z-index:${el.z||5}`;

  // Visible SVG line
  const sx1=el.x1-b.lx, sy1=el.y1-b.ly, sx2=el.x2-b.lx, sy2=el.y2-b.ly;
  const svgVis=mkSVGEl('svg'); svgVis.classList.add('er-line-vis');
  svgVis.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible';
  svgVis.setAttribute('viewBox',`0 0 ${b.w} ${b.h}`);
  const sw=erS.strokeWidth||2;
  const da=erS.dashed?`stroke-dasharray="${sw*2.5} ${sw*2}"`:'';
  svgVis.innerHTML=`<line x1="${sx1}" y1="${sy1}" x2="${sx2}" y2="${sy2}" stroke="${erS.stroke||'#888077'}" stroke-width="${sw}" stroke-linecap="round" ${da}/>`;
  wrap.appendChild(svgVis);

  // Hit-area SVG (wide invisible line for easier clicking)
  const svgHit=mkSVGEl('svg'); svgHit.classList.add('er-line-hit');
  svgHit.style.cssText='position:absolute;inset:0;width:100%;height:100%;overflow:visible';
  svgHit.setAttribute('viewBox',`0 0 ${b.w} ${b.h}`);
  const hitLine=mkSVGEl('line');
  hitLine.setAttribute('x1',sx1);hitLine.setAttribute('y1',sy1);
  hitLine.setAttribute('x2',sx2);hitLine.setAttribute('y2',sy2);
  hitLine.setAttribute('stroke','transparent');hitLine.setAttribute('stroke-width','20');
  hitLine.setAttribute('stroke-linecap','round');hitLine.style.cursor='move';
  hitLine.addEventListener('mousedown',ev=>{ev.stopPropagation();selectLine(el.id);startMoveLine(el.id,ev);});
  svgHit.appendChild(hitLine); wrap.appendChild(svgHit);

  // Endpoint handles
  [1,2].forEach(pn=>{
    const pt=document.createElement('div'); pt.className='er-line-pt'; pt.dataset.pt=pn;
    const px=pn===1?sx1:sx2, py=pn===1?sy1:sy2;
    pt.style.left=px+'px'; pt.style.top=py+'px';
    pt.addEventListener('mousedown',ev=>{ev.preventDefault();ev.stopPropagation();startDragPt(el.id,pn,ev);});
    wrap.appendChild(pt);
  });
  return wrap;
}
function updateLineDom(el){
  const b=lnBounds(el);
  const wrap=document.getElementById('sel_'+el.id);if(!wrap)return;
  wrap.style.left=b.lx+'px'; wrap.style.top=b.ly+'px';
  wrap.style.width=b.w+'px'; wrap.style.height=b.h+'px';
  const sx1=el.x1-b.lx, sy1=el.y1-b.ly, sx2=el.x2-b.lx, sy2=el.y2-b.ly;
  const erS=el.erStyle||{};
  const vis=wrap.querySelector('svg.er-line-vis');
  if(vis){
    vis.setAttribute('viewBox',`0 0 ${b.w} ${b.h}`);
    const sw=erS.strokeWidth||2; const da=erS.dashed?`stroke-dasharray="${sw*2.5} ${sw*2}"`:'';
    vis.innerHTML=`<line x1="${sx1}" y1="${sy1}" x2="${sx2}" y2="${sy2}" stroke="${erS.stroke||'#888077'}" stroke-width="${sw}" stroke-linecap="round" ${da}/>`;
  }
  const hit=wrap.querySelector('svg.er-line-hit');
  if(hit){
    hit.setAttribute('viewBox',`0 0 ${b.w} ${b.h}`);
    const hl=hit.querySelector('line');
    if(hl){hl.setAttribute('x1',sx1);hl.setAttribute('y1',sy1);hl.setAttribute('x2',sx2);hl.setAttribute('y2',sy2);}
  }
  const pts=wrap.querySelectorAll('.er-line-pt');
  pts.forEach(p=>{
    const pn=+p.dataset.pt;
    p.style.left=(pn===1?sx1:sx2)+'px'; p.style.top=(pn===1?sy1:sy2)+'px';
  });
}
function mkSVGEl(tag){return document.createElementNS('http://www.w3.org/2000/svg',tag);}

/* ════════ THUMBNAIL GENERATOR ════════ */
/* ════════ THUMBNAIL GENERATOR (CSS transform approach — no clipping) ════════ */
function mkThumb(slide, tw){
  const sz=slSz(slide), sc=tw/sz.w, ph=Math.round(sz.h*sc);
  const bg=slide.slideBg||'#0c0c0c';
  const sorted=(slide.elements||[]).slice().sort((a,b)=>(a.z||0)-(b.z||0));

  // Build elements at NATURAL size (no scaling), then CSS-transform the whole slide
  const items=sorted.map(el=>{
    const st=el.style||{};
    let posStyle='', inner='';

    if(el.type==='er-line'){
      const lx=Math.min(el.x1,el.x2), ly=Math.min(el.y1,el.y2);
      const lw=Math.abs(el.x2-el.x1)+2*ER_LINE_PAD, lh=Math.abs(el.y2-el.y1)+2*ER_LINE_PAD;
      posStyle=`left:${lx-ER_LINE_PAD}px;top:${ly-ER_LINE_PAD}px;width:${lw}px;height:${Math.max(2,lh)}px`;
      const sx1=el.x1-lx+ER_LINE_PAD, sy1=el.y1-ly+ER_LINE_PAD, sx2=el.x2-lx+ER_LINE_PAD, sy2=el.y2-ly+ER_LINE_PAD;
      const erS=el.erStyle||{};
      const sw2=erS.strokeWidth||2;
      const da2=erS.dashed?`stroke-dasharray="${sw2*2.5} ${sw2*2}"`:'';
      inner=`<svg style="position:absolute;inset:0;width:100%;height:100%;overflow:visible"><line x1="${sx1}" y1="${sy1}" x2="${sx2}" y2="${sy2}" stroke="${erS.stroke||'#888077'}" stroke-width="${sw2}" stroke-linecap="round" ${da2}/></svg>`;
    } else {
      const ex=el.x||0, ey=el.y||0, ew=Math.max(1,el.w||10), eh=Math.max(1,el.h||10);
      const bgS=(st.background&&st.background!=='transparent')?`background:${st.background};`:'';
      const radS=st.borderRadius?`border-radius:${st.borderRadius}px;`:'';
      posStyle=`left:${ex}px;top:${ey}px;width:${ew}px;height:${eh}px;overflow:hidden;${bgS}${radS}`;

      if(el.type==='title'||el.type==='text'){
        // Render at natural size — text fully visible, no font scaling hacks needed
        inner=`<div style="font-size:${st.fontSize||14}px;color:${st.color||'#888077'};font-family:${st.fontFamily||'sans-serif'};font-weight:${st.fontWeight||400};text-align:${st.textAlign||'left'};line-height:${st.lineHeight||1.6};padding:6px 12px;box-sizing:border-box;overflow:hidden;height:100%">${el.html||''}</div>`;
      } else if(el.type==='code'){
        const txt=(el.html||'').replace(/<br\s*\/?>/gi,'\n').replace(/<[^>]+>/g,'');
        inner=`<div style="background:#030303;height:100%;padding:10px 12px;font-size:${st.fontSize||12}px;color:#7dd3fc;font-family:'JetBrains Mono',monospace;overflow:hidden;white-space:pre;line-height:1.6;box-sizing:border-box">${esc(txt)}</div>`;
      } else if(el.type==='badge'){
        inner=`<div style="background:rgba(232,160,48,.1);border:1px solid rgba(232,160,48,.2);color:#e8a030;border-radius:100px;padding:5px 14px;font-size:12px;font-family:monospace;display:inline-flex;align-items:center">${esc(el.text||'')}</div>`;
      } else if(el.type==='divider'){
        inner=`<div style="display:flex;align-items:center;height:100%;padding:0 8px"><hr style="border:none;border-top:2px solid rgba(232,160,48,.3);width:100%;margin:0"></div>`;
      } else if(el.type==='image'&&el.src){
        inner=`<img src="${el.src}" style="width:100%;height:100%;object-fit:contain">`;
      } else if(el.type&&el.type.startsWith('er-')){
        const erS=el.erStyle||{};
        const svg=erShapeSVG(el.type,ew,eh,erS.stroke,erS.fill,erS.strokeWidth||2,erS.dashed);
        const tc=el.style?.color||'#e4ddd0';
        const ff=el.style?.fontFamily||"'DM Sans',sans-serif";
        const fw=el.style?.fontWeight||600;
        const fs=el.style?.fontSize||13;
        const tdec=el.type==='er-key-attribute'?'underline':'none';
        inner=`<svg viewBox="0 0 ${ew} ${eh}" width="${ew}" height="${eh}" style="position:absolute;inset:0">${svg}</svg>`
             +`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:${fs}px;color:${tc};font-family:${ff};font-weight:${fw};text-align:center;text-decoration:${tdec};padding:4px;overflow:hidden">${esc(el.text||'')}</div>`;
      }
    }
    return `<div style="position:absolute;${posStyle}">${inner}</div>`;
  }).join('');

  // Use zoom (not transform:scale) so the inner div's layout size matches its visual size → no clipping
  return `<div style="width:${tw}px;height:${ph}px;overflow:hidden;border-radius:4px;position:relative;flex-shrink:0;background:${bg}">
    <div style="position:absolute;top:0;left:0;width:${sz.w}px;height:${sz.h}px;zoom:${sc.toFixed(6)};pointer-events:none">
      ${items}
    </div>
  </div>`;
}

/* ════════ RENDER ENTRY CARDS ════════ */
function entryCard(e, idx, isAdmin){
  const tags=(e.tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join('');
  const slides=e.slides||[];
  // tw = width of the rendered preview — 880px matches card inner width (~1000px max-width - padding)
  const tw=880;
  const slideItems=slides.map((sl,si)=>{
    const lbl=esc(sl.title||`Folie ${si+1}`);
    return `<div class="ec-slide-item" onclick="${isAdmin?`openEditor(${e.id},${si})`:`openViewer(${e.id})`}">
      <div class="ec-slide-lbl">${lbl}</div>
      <div class="ec-slide-preview" style="line-height:0">
        ${mkThumb(sl,tw)}
      </div>
      <div class="ec-slide-hint">${isAdmin?'✎ Bearbeiten':'⤢ Vollbild'}</div>
    </div>`;
  }).join('');
  const acts=isAdmin?`
    <div class="e-acts">
      <button class="ib mv" title="Nach oben" onclick="event.stopPropagation();moveE(${e.id},-1)"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="18 15 12 9 6 15"/></svg></button>
      <button class="ib mv" title="Nach unten" onclick="event.stopPropagation();moveE(${e.id},1)"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg></button>
      <button class="ib ed" title="Bearbeiten" onclick="event.stopPropagation();openEditor(${e.id},0)"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
      <button class="ib dl" title="Löschen" onclick="event.stopPropagation();delE(${e.id})"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button>
    </div>`:
    `<button class="ib" style="color:#60a5fa;border-color:rgba(96,165,250,.25)" title="Folien anzeigen" onclick="event.stopPropagation();openViewer(${e.id})">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
    </button>`;
  return `<div class="ec${isAdmin?' adm-pad':''}" id="ec${e.id}" ${isAdmin?`draggable="true" data-id="${e.id}"`:''}>
    ${isAdmin?`<div class="dh"><div class="dd"></div><div class="dd"></div><div class="dd"></div><div class="dd"></div><div class="dd"></div><div class="dd"></div></div>`:''}
    <div class="ec-hdr">
      <div class="ec-hdr-left"><span class="e-date">${fmtD(e.datum)}</span><div class="e-tags">${tags}</div></div>
      ${acts}
    </div>
    <div class="e-title">${esc(e.titel)}</div>
    <div class="ec-slides">${slideItems||'<div class="has-elements-badge" style="border-style:dashed">Keine Folien</div>'}</div>
    <div class="ec-footer">
      ${slides.length?`<span class="ec-badge">${slides.length} Folie${slides.length!==1?'n':''}</span>`:''}
    </div>
  </div>`;
}

function renderL(){
  const q=activeQ.lehrer, s=document.getElementById('srL').value||'';
  const list=getList(q,s), c=document.getElementById('entL');
  if(!list.length){c.innerHTML=`<div class="empty"><div class="empty-i">📓</div><h3>${s?'Keine Treffer':'Noch keine Einträge für '+q}</h3><p>${s?'Anderen Begriff versuchen.':'Noch nichts dokumentiert.'}</p></div>`;return;}
  let html='', lm='';
  list.forEach((e,i)=>{const m=fmtM(e.datum);if(m!==lm){html+=`<div class="month-sep">${m}</div>`;lm=m;}html+=entryCard(e,i,false);});
  c.innerHTML=html;
}
function renderA(){
  const q=activeQ.admin, s=document.getElementById('srA').value||'';
  const list=getList(q,s), c=document.getElementById('entA');
  if(!list.length){c.innerHTML=`<div class="empty"><div class="empty-i">📓</div><h3>${s?'Keine Treffer':'Keine Einträge für '+q}</h3><p>${s?'Anderen Begriff.':'Neuer Eintrag erstellen.'}</p></div>`;return;}
  let html='', lm='';
  list.forEach((e,i)=>{const m=fmtM(e.datum);if(m!==lm){html+=`<div class="month-sep">${m}</div>`;lm=m;}html+=entryCard(e,i,true);});
  c.innerHTML=html; initListDrag();
}

/* list drag */
function initListDrag(){
  document.querySelectorAll('#entA .ec').forEach(c=>{
    c.addEventListener('dragstart',ev=>{dragListSrc=c;c.classList.add('dragging');ev.dataTransfer.effectAllowed='move';});
    c.addEventListener('dragend',()=>{c.classList.remove('dragging');document.querySelectorAll('.ec').forEach(x=>x.classList.remove('over'));});
    c.addEventListener('dragover',ev=>{ev.preventDefault();if(c!==dragListSrc)c.classList.add('over');});
    c.addEventListener('dragleave',()=>c.classList.remove('over'));
    c.addEventListener('drop',ev=>{ev.preventDefault();c.classList.remove('over');if(!dragListSrc||dragListSrc===c)return;swapPos(+dragListSrc.dataset.id,+c.dataset.id);});
  });
}
function swapPos(a,b){const all=load(),ea=all.find(e=>e.id===a),eb=all.find(e=>e.id===b);if(!ea||!eb)return;const t=ea.pos??999;ea.pos=eb.pos??999;eb.pos=t;persist(all);renderA();renderL();}
function moveE(id,dir){const list=getList(activeQ.admin,''),idx=list.findIndex(e=>e.id===id),si=idx+dir;if(si<0||si>=list.length)return;swapPos(list[idx].id,list[si].id);}
function delE(id){const e=load().find(x=>x.id===id);if(!e||!confirm(`"${e.titel}" löschen?`))return;const card=document.getElementById('ec'+id);_deleteFromDB(id);const go=()=>{_data=_data.filter(x=>x.id!==id);refreshAll();};if(card){card.style.transition='all .22s';card.style.opacity='0';card.style.transform='translateX(14px)';setTimeout(go,230);}else go();}

function updStats(){
  const all=load();
  ['sn1','an1'].forEach(id=>{ const el=document.getElementById(id);if(el)el.textContent=all.length;});
  const sl=all.reduce((a,e)=>a+(e.slides||[]).length,0);
  ['sn2','an2'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=sl;});
  const tags=new Set(all.flatMap(e=>e.tags||[]));
  ['sn3','an3'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=tags.size;});
}
function refreshAll(){buildQTabs('lehrer');buildQTabs('admin');renderL();renderA();updStats();}

/* ════════ ADMIN SCREEN SWITCHER ════════ */
function switchAdminScreen(screen){
  adminScreen=screen;
  ['journal','dateien','notizen'].forEach(s=>{
    const map={journal:'Journal',dateien:'Dateien',notizen:'Notizen'};
    const btn=document.getElementById('modeBtn'+map[s]);
    if(btn)btn.classList.toggle('act',s===screen);
  });
  const js=document.getElementById('adminJournalSection');
  const fs=document.getElementById('adminFilesSection');
  const ns=document.getElementById('adminNotesSection');
  const st=document.getElementById('adminStats');
  if(js)js.style.display=screen==='journal'?'':'none';
  if(fs)fs.style.display=screen==='dateien'?'':'none';
  if(ns)ns.style.display=screen==='notizen'?'':'none';
  if(st)st.style.display=screen==='journal'?'':'none';
  if(screen==='dateien')loadFiles();
  if(screen==='notizen')loadNote();
}

/* ════════ VIEWER ════════ */
let vEntry=null;
function openViewer(id){
  vEntry=JSON.parse(JSON.stringify(load().find(e=>e.id===id)));
  if(!vEntry)return;
  document.getElementById('viewerTitle').textContent=vEntry.titel;
  document.getElementById('viewerOverlay').classList.add('open');
  vScale=1; renderViewer(); setTimeout(vFit,60);
}
function closeViewer(){document.getElementById('viewerOverlay').classList.remove('open');vEntry=null;}

/* Block any editing in viewer — allow only selection + copy */
document.addEventListener('DOMContentLoaded',()=>{
  const vs=document.getElementById('viewerScroll');
  vs.addEventListener('beforeinput',ev=>{
    if(!document.getElementById('viewerOverlay').classList.contains('open'))return;
    ev.preventDefault();
  });
  vs.addEventListener('keydown',ev=>{
    if(!document.getElementById('viewerOverlay').classList.contains('open'))return;
    const key=ev.key.toLowerCase();
    // Ctrl+A: select all text inside all viewer slides
    if((ev.ctrlKey||ev.metaKey)&&key==='a'){
      ev.preventDefault();
      const sel=window.getSelection(); sel.removeAllRanges();
      const slides=document.querySelectorAll('#viewerScroll .viewer-slide-el');
      if(!slides.length)return;
      const range=document.createRange();
      range.setStartBefore(slides[0]);
      range.setEndAfter(slides[slides.length-1]);
      sel.addRange(range);
      return;
    }
    // Allow: Ctrl+C, Ctrl+F, arrow/nav keys for selection
    const allowedCtrl=(ev.ctrlKey||ev.metaKey)&&['c','f'].includes(key);
    const nav=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown','Shift'].includes(ev.key);
    if(!allowedCtrl&&!nav){ev.preventDefault();}
  });
});
function renderViewer(){
  const inn=document.getElementById('viewerInner'); inn.innerHTML='';
  inn.style.transform=''; inn.style.transformOrigin='top center';
  (vEntry.slides||[]).forEach((sl,si)=>{
    const sz=slSz(sl);
    const block=document.createElement('div'); block.className='viewer-slide-block';
    const lbl=document.createElement('div'); lbl.className='viewer-slide-lbl';
    lbl.textContent=`Folie ${si+1}${sl.title?' — '+sl.title:''}`;
    const wrap=document.createElement('div'); wrap.className='viewer-slide-el';
    wrap.style.cssText=`width:${sz.w}px;height:${sz.h}px;background:${sl.slideBg||'#0c0c0c'}`;
    (sl.elements||[]).slice().sort((a,b)=>(a.z||0)-(b.z||0)).forEach(el=>{
      if(el.type==='er-line'){
        const b=lnBounds(el), erS=el.erStyle||{};
        const d=document.createElement('div');
        d.style.cssText=`position:absolute;left:${b.lx}px;top:${b.ly}px;width:${b.w}px;height:${b.h}px;z-index:${el.z||1};pointer-events:none;overflow:visible`;
        const sx1=el.x1-b.lx,sy1=el.y1-b.ly,sx2=el.x2-b.lx,sy2=el.y2-b.ly;
        const sw=erS.strokeWidth||2; const da=erS.dashed?`stroke-dasharray="${sw*2.5} ${sw*2}"`:'';
        d.innerHTML=`<svg style="position:absolute;inset:0;width:100%;height:100%;overflow:visible"><line x1="${sx1}" y1="${sy1}" x2="${sx2}" y2="${sy2}" stroke="${erS.stroke||'#888077'}" stroke-width="${sw}" stroke-linecap="round" ${da}/></svg>`;
        wrap.appendChild(d);
      } else {
        const st=el.style||{};
        const d=document.createElement('div'); d.className='ro-el';
        d.style.cssText=`left:${el.x||0}px;top:${el.y||0}px;width:${el.w||10}px;height:${Math.max(1,el.h||10)}px;z-index:${el.z||1};border-radius:${st.borderRadius||0}px`;
        if(st.background&&st.background!=='transparent')d.style.background=st.background;
        const inn2=document.createElement('div'); inn2.className='ro-in';
        inn2.appendChild(buildInnerContent(el,true)); d.appendChild(inn2); wrap.appendChild(d);
      }
    });
    block.appendChild(lbl); block.appendChild(wrap);
    inn.appendChild(block);
  });
  applyVScale();
}
function applyVScale(){
  const inn=document.getElementById('viewerInner');
  const scroll=document.getElementById('viewerScroll');
  const slides=vEntry?.slides||[];
  const mw=slides.length?Math.max(...slides.map(sl=>slSz(sl).w)):960;
  const scaledW=mw*vScale;
  const padH=40;
  inn.style.transform=`scale(${vScale})`;
  inn.style.transformOrigin='top center';
  inn.style.minWidth=(scaledW+padH*2)+'px';
  inn.style.width='max-content';
  document.getElementById('vzPct').textContent=Math.round(vScale*100)+'%';
}
function vFit(){
  if(!vEntry)return;
  const scroll=document.getElementById('viewerScroll');
  // Use visualViewport width if available (accounts for browser zoom)
  const availW=(window.visualViewport?window.visualViewport.width:scroll.clientWidth);
  const mw=Math.max(...(vEntry.slides||[]).map(sl=>slSz(sl).w));
  vScale=Math.max(0.1,Math.min(1,(availW-80)/mw));
  applyVScale();
}
function vZoom(d){vScale=Math.max(.1,Math.min(4,vScale+d));applyVScale();}

/* ════════ EDITOR ════════ */
function openEditor(id, slideIdx=0){
  const all=load();
  if(id){edEntry=JSON.parse(JSON.stringify(all.find(e=>e.id===id)));if(!edEntry)return;}
  else{
    const maxPos=Math.max(0,...all.filter(e=>e.q===activeQ.admin).map(e=>e.pos||0));
    edEntry={id:Math.max(0,...all.map(e=>e.id))+1,q:activeQ.admin,datum:new Date().toISOString().split('T')[0],pos:maxPos+10,titel:'Neuer Eintrag',tags:[],
      slides:[{id:uid(),title:'Folie 1',format:'16:9',slideBg:'#0c0c0c',elements:[]}]};
  }
  edSlideIdx=Math.min(slideIdx,(edEntry.slides||[]).length-1);
  selElId=null; activeRTBEl=null; _clearHistory();
  zMax=Math.max(10,...(curSlide()?.elements||[]).map(e=>e.z||0));
  // Fill entry panel
  document.getElementById('sldEntryTitle').value=edEntry.titel||'';
  document.getElementById('sldDate').value=edEntry.datum||'';
  document.getElementById('sldQ').value=edEntry.q||'Q2';
  document.getElementById('sldTags').value=(edEntry.tags||[]).join(', ');
  document.getElementById('edBarTitle').textContent=edEntry.titel||'Neuer Eintrag';
  document.getElementById('editorView').classList.add('open');
  edTab('ins'); cvScale=1; cvOffX=0; cvOffY=0;
  populateSlideMeta(); renderSlide(); renderSpanel(); setTimeout(fitSlide,50);
}
function curSlide(){return edEntry?.slides?.[edSlideIdx]||edEntry?.slides?.[0];}
function closeEditor(){
  if(!confirm('Änderungen verwerfen?'))return;
  document.getElementById('editorView').classList.remove('open');
  edEntry=null; selElId=null; hideGuides(); hideRTB();
}
function resetSlide(){
  if(!edEntry)return;
  const sl=curSlide(); if(!sl)return;
  if(!confirm(`Alle Elemente von "${sl.title||'diese Folie'}" löschen?`))return;
  pushHistory();
  sl.elements=[];
  deselectAll(); hideRTB();
  renderSlide(); renderSpanel();
}
function saveEditor(){
  if(!edEntry)return; flushEl();
  // Read entry meta
  edEntry.titel=document.getElementById('sldEntryTitle').value.trim()||'Neuer Eintrag';
  edEntry.datum=document.getElementById('sldDate').value;
  edEntry.q=document.getElementById('sldQ').value;
  edEntry.tags=document.getElementById('sldTags').value.split(',').map(t=>t.trim()).filter(Boolean);
  let all=load(); const idx=all.findIndex(e=>e.id===edEntry.id);
  if(idx>=0)all[idx]=edEntry; else all.push(edEntry);
  persist(all); refreshAll();
  document.getElementById('editorView').classList.remove('open');
  edEntry=null; selElId=null; hideGuides(); hideRTB();
}
function populateSlideMeta(){
  const sl=curSlide(); if(!sl)return;
  document.getElementById('sldSlideTitle').value=sl.title||'';
  document.getElementById('sldFmt').value=sl.format||'16:9';
  document.getElementById('fmtSzInfo').textContent=FMT[sl.format||'16:9']?.label||'';
  document.getElementById('sldBg').value=sl.slideBg||'#0c0c0c';
}

/* ── Slide management ── */
function addSlide(){
  if(!edEntry)return;
  const sl={id:uid(),title:`Folie ${edEntry.slides.length+1}`,format:'16:9',slideBg:'#0c0c0c',elements:[]};
  edEntry.slides.push(sl); switchSlide(edEntry.slides.length-1);
}
function deleteSlide(idx){
  if(!edEntry||edEntry.slides.length<=1){alert('Mindestens eine Folie erforderlich.');return;}
  if(!confirm(`Folie ${idx+1} löschen?`))return;
  edEntry.slides.splice(idx,1);
  edSlideIdx=Math.min(edSlideIdx,edEntry.slides.length-1);
  switchSlide(edSlideIdx);
}
function switchSlide(idx){
  flushEl(); deselectAll(); _clearHistory();
  edSlideIdx=idx;
  zMax=Math.max(10,...(curSlide()?.elements||[]).map(e=>e.z||0));
  populateSlideMeta(); renderSlide(); renderSpanel(); setTimeout(fitSlide,30);
}
function toggleSpPanel(){
  const panel=document.getElementById('spPanel');
  panel.classList.toggle('collapsed');
}
// Continuously re-center slide as edCvArea resizes (covers panel animation + window resize)
let _cvAreaRO=null;
function initCvAreaObserver(){
  if(_cvAreaRO)return;
  const area=document.getElementById('edCvArea');
  _cvAreaRO=new ResizeObserver(()=>{
    if(!document.getElementById('editorView').classList.contains('open')||!edEntry)return;
    const sl=curSlide(); if(!sl)return;
    const sz=slSz(sl), aw=area.clientWidth, ah=area.clientHeight;
    // Only recompute offset so scale is preserved during panel animation
    cvOffX=(aw-sz.w*cvScale)/2; cvOffY=(ah-sz.h*cvScale)/2;
    applyTf();
  });
  _cvAreaRO.observe(area);
}
function renderSpanel(){
  const list=document.getElementById('spList'); list.innerHTML='';
  let spDragSrc=null;
  (edEntry?.slides||[]).forEach((sl,i)=>{
    const tw=144, sz=slSz(sl), th=Math.round(tw*sz.h/sz.w);
    const item=document.createElement('div'); item.className='sp-item'+(i===edSlideIdx?' active':'');
    item.draggable=true; item.dataset.idx=i;
    item.innerHTML=`<div class="sp-item-thumb" style="height:${th}px">${mkThumb(sl,tw)}<span class="sp-num">${i+1}</span></div>
      <div class="sp-item-foot"><input class="sp-item-title-inp" value="${esc(sl.title||'Folie '+(i+1))}" title="Doppelklick zum Umbenennen" data-idx="${i}"><button class="sp-item-del" onclick="event.stopPropagation();deleteSlide(${i})">×</button></div>`;
    item.addEventListener('click',ev=>{if(ev.target.tagName!=='INPUT'&&ev.target.tagName!=='BUTTON')switchSlide(i);});
    const inp=item.querySelector('.sp-item-title-inp');
    inp.addEventListener('click',ev=>ev.stopPropagation());
    inp.addEventListener('change',ev=>{
      ev.stopPropagation();
      const sl2=edEntry?.slides?.[i]; if(sl2){sl2.title=inp.value||('Folie '+(i+1));renderSpanel();if(i===edSlideIdx)document.getElementById('sldSlideTitle').value=sl2.title;}
    });
    inp.addEventListener('keydown',ev=>{if(ev.key==='Enter'){inp.blur();}ev.stopPropagation();});
    // Slide drag-to-reorder
    item.addEventListener('dragstart',ev=>{
      if(ev.target.tagName==='INPUT')return;
      spDragSrc=i; item.classList.add('sp-dragging'); ev.dataTransfer.effectAllowed='move';
    });
    item.addEventListener('dragend',()=>{
      item.classList.remove('sp-dragging');
      list.querySelectorAll('.sp-item').forEach(x=>x.classList.remove('sp-drag-over'));
    });
    item.addEventListener('dragover',ev=>{
      ev.preventDefault(); if(spDragSrc===null||spDragSrc===i)return;
      list.querySelectorAll('.sp-item').forEach(x=>x.classList.remove('sp-drag-over'));
      item.classList.add('sp-drag-over');
    });
    item.addEventListener('dragleave',()=>item.classList.remove('sp-drag-over'));
    item.addEventListener('drop',ev=>{
      ev.preventDefault(); item.classList.remove('sp-drag-over');
      if(spDragSrc===null||spDragSrc===i)return;
      const from=spDragSrc; spDragSrc=null;
      flushEl();
      const moved=edEntry.slides.splice(from,1)[0];
      edEntry.slides.splice(i,0,moved);
      // Keep selection on same slide content
      edSlideIdx=edEntry.slides.indexOf(moved);
      renderSlide(); renderSpanel();
    });
    list.appendChild(item);
  });
}

/* ── Canvas ── */
function applySlideSize(){
  const sl=curSlide(); if(!sl)return;
  const sz=slSz(sl), slide=document.getElementById('slideCV');
  slide.style.width=sz.w+'px'; slide.style.height=sz.h+'px';
  slide.style.background=sl.slideBg||'#0c0c0c';
}
function fitSlide(){
  const area=document.getElementById('edCvArea'), sl=curSlide(); if(!sl)return;
  const sz=slSz(sl), aw=area.clientWidth, ah=area.clientHeight;
  cvScale=Math.min((aw-80)/sz.w,(ah-80)/sz.h,1);
  cvOffX=(aw-sz.w*cvScale)/2; cvOffY=(ah-sz.h*cvScale)/2;
  applyTf();
}
function applyTf(){
  document.getElementById('slideCV').style.transform=`translate(${cvOffX}px,${cvOffY}px) scale(${cvScale})`;
  document.getElementById('edZoomPct').textContent=Math.round(cvScale*100)+'%';
}
function toggleGrid(on){document.getElementById('slideCV').classList.toggle('grid-on',on);}
document.addEventListener('wheel',ev=>{
  if(!document.getElementById('editorView').classList.contains('open'))return;
  if(!ev.target.closest('#edCvArea'))return;
  ev.preventDefault();
  const rect=document.getElementById('edCvArea').getBoundingClientRect();
  const mx=ev.clientX-rect.left, my=ev.clientY-rect.top, d=ev.deltaY<0?1.1:0.91;
  cvOffX=mx-(mx-cvOffX)*d; cvOffY=my-(my-cvOffY)*d;
  cvScale=Math.max(.08,Math.min(4,cvScale*d)); applyTf();
},{passive:false});
function onCvDown(ev){if(ev.target===document.getElementById('edCvArea')){deselectAll();hideRTB();}}
function onSlideBgDown(ev){if(ev.target===document.getElementById('slideCV')){deselectAll();hideRTB();}}
function onCvDrop(ev){
  ev.preventDefault(); ev.stopPropagation();
  const files=ev.dataTransfer.files; if(!files.length||!files[0].type.startsWith('image/'))return;
  const rect=document.getElementById('slideCV').getBoundingClientRect();
  const x=Math.round((ev.clientX-rect.left)/cvScale), y=Math.round((ev.clientY-rect.top)/cvScale);
  loadImgFile(files[0],null,Math.max(0,x),Math.max(0,y));
}
function evDef(ev){ev.preventDefault();}

/* ── Render slide ── */
function renderSlide(){
  const slide=document.getElementById('slideCV'); slide.innerHTML='';
  applySlideSize();
  const els=(curSlide()?.elements||[]).slice().sort((a,b)=>(a.z||0)-(b.z||0));
  els.forEach(el=>{
    if(el.type==='er-line') slide.appendChild(buildLineDom(el));
    else slide.appendChild(buildElDOM(el));
  });
}

/* ── Build element DOM ── */
function buildElDOM(el){
  const st=el.style||{};
  const wrap=document.createElement('div'); wrap.className='sel';
  wrap.id='sel_'+el.id; wrap.dataset.elid=el.id;
  wrap.style.cssText=`left:${el.x||0}px;top:${el.y||0}px;width:${el.w||100}px;height:${Math.max(1,el.h||30)}px;z-index:${el.z||10};border-radius:${st.borderRadius||0}px`;
  if(st.background&&st.background!=='transparent')wrap.style.background=st.background;

  const bd=document.createElement('div'); bd.className='sel-bd'; wrap.appendChild(bd);
  // Wider overlay for easier clicking
  const ov=document.createElement('div'); ov.className='sel-ov'; wrap.appendChild(ov);
  ov.addEventListener('mousedown',ev=>{ev.stopPropagation();selectEl(el.id);startMove(el.id,ev);});
  const bar=document.createElement('div'); bar.className='sel-bar'; wrap.appendChild(bar);
  bar.innerHTML=`<span class="sel-bar-grip">⠿⠿</span><span class="sel-bar-lbl">${typeLabel(el.type)}</span>`;
  const xb=document.createElement('button'); xb.className='sel-bar-x'; xb.textContent='×';
  xb.addEventListener('click',ev=>{ev.stopPropagation();deleteEl(el.id);}); bar.appendChild(xb);
  bar.addEventListener('mousedown',ev=>{ev.preventDefault();ev.stopPropagation();selectEl(el.id);startMove(el.id,ev);});
  const inn=document.createElement('div'); inn.className='sel-in'; inn.appendChild(buildInnerContent(el,false)); wrap.appendChild(inn);
  const rh=document.createElement('div'); rh.className='sel-rh'; wrap.appendChild(rh);
  rh.addEventListener('mousedown',ev=>{ev.preventDefault();ev.stopPropagation();startResize(el.id,ev);});
  return wrap;
}

function typeLabel(t){return{title:'Überschrift',text:'Text',code:'Code',image:'Bild',divider:'Linie',badge:'Badge','er-entity':'Entität','er-weak-entity':'Schwache Entität','er-relation':'Beziehungstyp','er-weak-relation':'Schw. Beziehungstyp','er-attribute':'Attribut','er-key-attribute':'Schlüsselattr.','er-multi-attribute':'Mehrwertiger Attr.','er-derived-attr':'Abgel. Attribut','er-isa':'IS-A','er-line':'Verbindungslinie','er-cardinality':'Kardinalität'}[t]||t;}

function buildInnerContent(el, readOnly){
  const st=el.style||{};
  if(el.type==='title'||el.type==='text'){
    const div=document.createElement('div'); div.className='el-text';
    div.contentEditable=readOnly?'false':'true'; div.spellcheck=false;
    div.style.cssText=`font-size:${st.fontSize||14}px;font-family:${st.fontFamily||"'DM Sans',sans-serif"};color:${st.color||'#e4ddd0'};font-weight:${st.fontWeight||400};font-style:${st.fontStyle||'normal'};text-decoration:${st.textDecoration||'none'};text-align:${st.textAlign||'left'};line-height:${st.lineHeight||1.6}`;
    // Set innerHTML AFTER style so browser doesn't re-wrap content
    div.innerHTML=el.html||'';
    // Remove any leading <br> that browsers inject as first contenteditable child
    if(div.firstChild&&div.firstChild.nodeName==='BR'&&div.childNodes.length>1){
      div.removeChild(div.firstChild);
    }
    if(!readOnly){
      div.addEventListener('mousedown',ev=>ev.stopPropagation());
      div.addEventListener('focus',()=>{activeRTBEl=el.id;});
      div.addEventListener('input',()=>{const e=getEl(el.id);if(e)e.html=div.innerHTML;_spRefresh();});
      div.addEventListener('mouseup',()=>{saveRange();setTimeout(posRTB,20);});
      div.addEventListener('keyup',()=>{saveRange();setTimeout(posRTB,20);});
    }
    return div;
  }
  if(el.type==='code'){
    const div=document.createElement('div'); div.className='el-code';
    div.contentEditable=readOnly?'false':'true'; div.spellcheck=false;
    div.textContent=el.html||(el.text||'');
    if(!readOnly){
      div.addEventListener('mousedown',ev=>ev.stopPropagation());
      div.addEventListener('input',()=>{const e=getEl(el.id);if(e)e.html=div.textContent;_spRefresh();});
    }
    return div;
  }
  if(el.type==='image'){
    const wrap=document.createElement('div'); wrap.className='el-img-wrap';
    if(el.src){const img=document.createElement('img');img.src=el.src;wrap.appendChild(img);}
    else if(!readOnly){
      const ph=document.createElement('div'); ph.className='el-img-ph';
      ph.innerHTML=`<div style="opacity:.3;color:var(--text2)"><svg width="36" height="32" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.4"/><circle cx="5.5" cy="5.5" r="1.5" fill="currentColor"/><path d="M1 11l4-4 3 3 2.5-2.5L16 13" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div style="font-size:11px;color:var(--text3)">Klicken oder D&D</div>`;
      const fi=document.createElement('input'); fi.type='file'; fi.accept='image/*';
      fi.addEventListener('change',()=>{if(fi.files[0])loadImgFile(fi.files[0],el.id);});
      ph.appendChild(fi);
      ph.addEventListener('dragover',ev=>{ev.preventDefault();ev.stopPropagation();ph.classList.add('dnd-hover');});
      ph.addEventListener('dragleave',()=>ph.classList.remove('dnd-hover'));
      ph.addEventListener('drop',ev=>{ev.preventDefault();ev.stopPropagation();ph.classList.remove('dnd-hover');if(ev.dataTransfer.files[0])loadImgFile(ev.dataTransfer.files[0],el.id);});
      wrap.appendChild(ph);
    }
    return wrap;
  }
  if(el.type==='divider'){const d=document.createElement('div');d.className='el-divider';d.innerHTML='<hr>';return d;}
  if(el.type==='badge'){
    const d=document.createElement('div');d.className='el-badge';
    const p=document.createElement('div');p.className='el-badge-inner';
    p.contentEditable=readOnly?'false':'true'; p.textContent=el.text||'Badge';
    if(!readOnly){p.addEventListener('mousedown',ev=>ev.stopPropagation());p.addEventListener('input',()=>{const e=getEl(el.id);if(e)e.text=p.textContent;_spRefresh();});}
    d.appendChild(p);return d;
  }
  if(el.type&&el.type.startsWith('er-')){
    const wrap=document.createElement('div'); wrap.className='el-er-wrap';
    // SVG shape
    const svg=mkSVGEl('svg'); svg.className='el-er-svg er-s';
    svg.setAttribute('viewBox',`0 0 ${el.w} ${el.h}`);
    svg.setAttribute('preserveAspectRatio','none');
    svg.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible';
    const erS=el.erStyle||{};
    svg.innerHTML=erShapeSVG(el.type,el.w,el.h,erS.stroke,erS.fill,erS.strokeWidth,erS.dashed);
    wrap.appendChild(svg);
    // Text label
    const txt=document.createElement('div'); txt.className='el-er-text';
    if(el.type==='er-cardinality')txt.classList.add('el-er-cardinality');
    if(el.type==='er-key-attribute')txt.classList.add('key-attr');
    txt.contentEditable=readOnly?'false':'true'; txt.textContent=el.text||'';
    if(!readOnly){txt.addEventListener('mousedown',ev=>ev.stopPropagation());txt.addEventListener('input',()=>{const e=getEl(el.id);if(e)e.text=txt.textContent;_spRefresh();});}
    wrap.appendChild(txt);
    return wrap;
  }
  return document.createElement('div');
}

function loadImgFile(file,elId,dropX,dropY){
  const reader=new FileReader();
  reader.onload=ev=>{
    if(elId){
      const e=getEl(elId); if(!e)return; e.src=ev.target.result;
      const dom=document.getElementById('sel_'+elId); if(!dom)return;
      const inn=dom.querySelector('.sel-in'); inn.innerHTML=''; inn.appendChild(buildInnerContent(e,false));
    } else {
      const sz=slSz(curSlide()); const id=uid();
      const newEl={id,type:'image',x:Math.min(dropX||60,sz.w-200),y:Math.min(dropY||60,sz.h-150),w:280,h:200,z:++zMax,src:ev.target.result,style:{background:'transparent',borderRadius:4}};
      curSlide().elements.push(newEl); document.getElementById('slideCV').appendChild(buildElDOM(newEl)); selectEl(id);
    }
  };
  reader.readAsDataURL(file);
}

/* ── Get / flush ── */
function getEl(id){return(curSlide()?.elements||[]).find(e=>e.id===id);}
function flushEl(){
  if(!selElId)return; const el=getEl(selElId); if(!el)return;
  const dom=document.getElementById('sel_'+selElId); if(!dom)return;
  const ce=dom.querySelector('.el-text'); if(ce)el.html=ce.innerHTML;
  const cd=dom.querySelector('.el-code'); if(cd)el.html=cd.textContent;
  const ba=dom.querySelector('.el-badge-inner'); if(ba)el.text=ba.textContent;
  const et=dom.querySelector('.el-er-text'); if(et)el.text=et.textContent;
}

/* ════════ SELECT ════════ */
function selectEl(id){
  flushEl(); deselectAll(); selElId=id;
  const dom=document.getElementById('sel_'+id);
  if(dom){dom.classList.add('selected');dom.style.zIndex=++zMax;}
  const el=getEl(id); if(!el)return;
  edTab('fmt'); populateFmt(el);
}
function selectLine(id){
  deselectAll(); selElId=id;
  const dom=document.getElementById('sel_'+id);
  if(dom){dom.classList.add('selected');dom.style.zIndex=++zMax;}
  const el=getEl(id); if(!el)return;
  edTab('fmt'); populateFmt(el);
}
function deselectAll(){
  flushEl();
  document.querySelectorAll('.sel.selected,.er-line-el.selected').forEach(d=>d.classList.remove('selected'));
  selElId=null;
  document.getElementById('fmtEmpty').style.display='block';
  document.getElementById('fmtCtrl').style.display='none';
  hideConnDots();
}

/* ════════ FORMAT PANEL ════════ */
function populateFmt(el){
  const st=el.style||{}, erS=el.erStyle||{};
  document.getElementById('fmtEmpty').style.display='none';
  document.getElementById('fmtCtrl').style.display='block';
  document.getElementById('fmtTypePill').textContent=typeLabel(el.type);
  const isText=el.type==='title'||el.type==='text';
  const isER=el.type&&el.type.startsWith('er-')&&el.type!=='er-line'&&el.type!=='er-cardinality';
  const isLine=el.type==='er-line';
  document.getElementById('fmtTextSec').style.display=isText?'block':'none';
  document.getElementById('fmtERSec').style.display=isER?'block':'none';
  document.getElementById('fmtLineSec').style.display=isLine?'block':'none';
  if(isText){
    document.getElementById('fmtFont').value=st.fontFamily||"'DM Sans',sans-serif";
    document.getElementById('fmtSize').value=st.fontSize||14;
    document.getElementById('fmtColor').value=toHex(st.color||'#e4ddd0');
    document.getElementById('fmtLH').value=st.lineHeight||1.6;
  }
  if(isER){
    document.getElementById('fmtStroke').value=toHex(erS.stroke||'#e8a030');
    document.getElementById('fmtFill').value=toHex(erS.fill==='transparent'?'#000000':erS.fill||'#000000');
    document.getElementById('fmtSW').value=erS.strokeWidth||2;
    document.getElementById('fmtDash').checked=!!erS.dashed;
  }
  if(isLine){
    document.getElementById('fmtLC').value=toHex(erS.stroke||'#888077');
    document.getElementById('fmtLSW').value=erS.strokeWidth||2;
    document.getElementById('fmtLDash').checked=!!erS.dashed;
  }
  const bg=st.background||'transparent';
  document.getElementById('fmtBgT').checked=!bg||bg==='transparent';
  document.getElementById('fmtBg').value=(!bg||bg==='transparent')?'#000000':toHex(bg);
  document.getElementById('fmtRad').value=st.borderRadius||0;
  document.getElementById('fmtRadV').textContent=st.borderRadius||0;
  // Hide radius control for ER elements (shapes are defined by SVG, not CSS border-radius)
  const radRow=document.getElementById('fmtRadRow');
  if(radRow) radRow.style.display=(isER||isLine)?'none':'block';
  refreshFP(el);
}
function refreshFP(el){
  if(el.type==='er-line'){
    const b=lnBounds(el);
    document.getElementById('fmtX').value=Math.round(b.lx);
    document.getElementById('fmtY').value=Math.round(b.ly);
    document.getElementById('fmtW').value=Math.round(b.w);
    document.getElementById('fmtH').value=Math.round(b.h);
  } else {
    document.getElementById('fmtX').value=Math.round(el.x||0);
    document.getElementById('fmtY').value=Math.round(el.y||0);
    document.getElementById('fmtW').value=Math.round(el.w||0);
    document.getElementById('fmtH').value=Math.round(el.h||0);
  }
}

function applyFmt(prop,val){
  if(!selElId)return; const el=getEl(selElId); if(!el)return;
  pushHistoryDebounced();
  el.style=el.style||{}; el.style[prop]=val;
  const dom=document.getElementById('sel_'+selElId); if(!dom)return;
  if(prop==='borderRadius'){dom.style.borderRadius=val+'px';}
  if(prop==='background'){dom.style.background=(!val||val==='transparent')?'':val;}
  const inn=dom.querySelector('.el-text');
  if(inn&&['fontFamily','fontSize','color','fontWeight','fontStyle','textDecoration','textAlign','lineHeight'].includes(prop)){
    if(prop==='fontSize')inn.style.fontSize=val+'px'; else inn.style[prop]=val;
  }
  _spRefresh();
}
function applyERSt(prop,val){
  if(!selElId)return; const el=getEl(selElId); if(!el)return;
  pushHistoryDebounced();
  el.erStyle=el.erStyle||{}; el.erStyle[prop]=val;
  if(el.type==='er-line'){updateLineDom(el);_spRefresh();return;}
  updateERSVG(el); _spRefresh();
}
function setTransp(checked){
  if(!selElId)return; const el=getEl(selElId); if(!el)return;
  el.style=el.style||{};
  if(checked){el.style.background='transparent';const d=document.getElementById('sel_'+selElId);if(d)d.style.background='';}
  else applyFmt('background',document.getElementById('fmtBg').value);
}
function applyPos(dim,val){
  if(!selElId)return; const el=getEl(selElId); if(!el)return;
  pushHistoryDebounced();
  if(el.type==='er-line'){
    const b=lnBounds(el);
    if(dim==='x'){const dx=val-b.lx;el.x1+=dx;el.x2+=dx;}
    if(dim==='y'){const dy=val-b.ly;el.y1+=dy;el.y2+=dy;}
    updateLineDom(el);_spRefresh();return;
  }
  if(dim==='x')el.x=val; if(dim==='y')el.y=val;
  if(dim==='w')el.w=Math.max(10,val); if(dim==='h')el.h=Math.max(2,val);
  const d=document.getElementById('sel_'+selElId); if(!d)return;
  d.style.left=el.x+'px';d.style.top=el.y+'px';d.style.width=el.w+'px';d.style.height=el.h+'px';
  if(el.type&&el.type.startsWith('er-'))updateERSVG(el);
  _spRefresh();
}
function snapCH(){if(!selElId)return;const el=getEl(selElId);if(!el||el.type==='er-line')return;const sz=slSz(curSlide());el.x=Math.round(sz.w/2-(el.w||0)/2);const d=document.getElementById('sel_'+selElId);if(d)d.style.left=el.x+'px';refreshFP(el);}
function snapCV(){if(!selElId)return;const el=getEl(selElId);if(!el||el.type==='er-line')return;const sz=slSz(curSlide());el.y=Math.round(sz.h/2-(el.h||0)/2);const d=document.getElementById('sel_'+selElId);if(d)d.style.top=el.y+'px';refreshFP(el);}
function bringFwd(){if(!selElId)return;const el=getEl(selElId);if(!el)return;el.z=++zMax;const d=document.getElementById('sel_'+selElId);if(d)d.style.zIndex=el.z;}
function sendBck(){if(!selElId)return;const el=getEl(selElId);if(!el)return;el.z=Math.max(1,(el.z||10)-5);const d=document.getElementById('sel_'+selElId);if(d)d.style.zIndex=el.z;}
function deleteEl(id){
  if(!edEntry)return; const sl=curSlide(); if(!sl)return;
  pushHistory();
  sl.elements=sl.elements.filter(e=>e.id!==id);
  const dom=document.getElementById('sel_'+id); if(dom)dom.remove();
  if(selElId===id){selElId=null;document.getElementById('fmtEmpty').style.display='block';document.getElementById('fmtCtrl').style.display='none';}
  renderSpanel();
}

/* ════════ ADD ELEMENT ════════ */
function addEl(type){
  if(!edEntry)return; const sl=curSlide(); if(!sl)return;
  pushHistory();
  const sz=slSz(sl), id=uid(), z=++zMax;
  let el={id,type,z,style:{}};
  if(type==='title') Object.assign(el,{x:40,y:28,w:Math.min(sz.w-80,880),h:66,html:'Neue Überschrift',style:{fontSize:34,fontFamily:"'Playfair Display',serif",color:'#e4ddd0',fontWeight:'900',textAlign:'left',lineHeight:1.2,background:'transparent',borderRadius:0}});
  else if(type==='text') Object.assign(el,{x:60,y:80,w:380,h:200,html:'Text …',style:{fontSize:14,fontFamily:"'DM Sans',sans-serif",color:'#888077',fontWeight:'400',textAlign:'left',lineHeight:1.75,background:'transparent',borderRadius:0}});
  else if(type==='code') Object.assign(el,{x:60,y:80,w:380,h:200,html:'// Code hier',style:{fontSize:13,fontFamily:"'JetBrains Mono',monospace",color:'#7dd3fc',background:'#030303',borderRadius:8}});
  else if(type==='image') Object.assign(el,{x:60,y:80,w:280,h:200,style:{background:'transparent',borderRadius:4}});
  else if(type==='divider') Object.assign(el,{x:40,y:Math.round(sz.h/2),w:Math.min(sz.w-80,880),h:4,style:{background:'transparent',borderRadius:0}});
  else if(type==='badge') Object.assign(el,{x:60,y:80,w:200,h:40,text:'Badge',style:{background:'transparent',borderRadius:0}});
  else if(type==='er-line'){
    const cx=Math.round(sz.w/2), cy=Math.round(sz.h/2);
    Object.assign(el,{x1:cx-90,y1:cy,x2:cx+90,y2:cy,erStyle:{stroke:'#888077',strokeWidth:2,dashed:false}});
  } else if(type==='er-cardinality'){
    const cx=Math.round(sz.w/2), cy=Math.round(sz.h/2);
    Object.assign(el,{x:cx-25,y:cy-20,w:50,h:40,text:'1',style:{fontSize:17,fontFamily:"'JetBrains Mono',monospace",color:'#e8a030',fontWeight:'700',textAlign:'center',lineHeight:1.2,background:'transparent',borderRadius:0},erStyle:{stroke:'transparent',fill:'transparent',strokeWidth:0,dashed:false}});
  } else if(type&&type.startsWith('er-')){
    const d=ERD[type]||{}, cx=Math.round(sz.w/2), cy=Math.round(sz.h/2);
    Object.assign(el,{x:cx-Math.round((d.w||140)/2),y:cy-Math.round((d.h||60)/2),w:d.w||140,h:d.h||60,text:d.label||'',style:{background:'transparent',borderRadius:0},erStyle:{stroke:d.stroke||'#e8a030',fill:d.fill||'transparent',strokeWidth:2,dashed:false}});
  }
  sl.elements.push(el);
  if(type==='er-line') document.getElementById('slideCV').appendChild(buildLineDom(el));
  else document.getElementById('slideCV').appendChild(buildElDOM(el));
  if(type==='er-line') selectLine(id); else selectEl(id);
  renderSpanel();
}

/* ════════ MOVEMENT STATE MACHINE ════════ */
function startMove(elId,ev){
  const el=getEl(elId); if(!el)return;
  pushHistory();
  let lineBindings=null;
  if(el.type&&el.type.startsWith('er-')&&el.type!=='er-line'){
    const pts=connPts(el);
    lineBindings=[];
    const ATTACHED_TH=4;
    (curSlide()?.elements||[]).forEach(line=>{
      if(line.type!=='er-line')return;
      let b1=-1,b2=-1,best1=ATTACHED_TH,best2=ATTACHED_TH;
      pts.forEach((p,i)=>{
        const d1=Math.hypot(line.x1-p.x,line.y1-p.y);
        if(d1<best1){best1=d1;b1=i;}
        const d2=Math.hypot(line.x2-p.x,line.y2-p.y);
        if(d2<best2){best2=d2;b2=i;}
      });
      if(b1>=0||b2>=0)lineBindings.push({lineId:line.id,pt1Idx:b1,pt2Idx:b2});
    });
  }
  MS={type:'move',elId,sx:ev.clientX,sy:ev.clientY,data:{x:el.x||0,y:el.y||0},lineBindings};
  ev.preventDefault();
}
function startMoveLine(elId,ev){
  const el=getEl(elId); if(!el)return;
  pushHistory();
  MS={type:'move-line',elId,sx:ev.clientX,sy:ev.clientY,data:{x1:el.x1,y1:el.y1,x2:el.x2,y2:el.y2}};
  ev.preventDefault();
}
function startResize(elId,ev){
  const el=getEl(elId); if(!el)return;
  pushHistory();
  MS={type:'resize',elId,sx:ev.clientX,sy:ev.clientY,data:{w:el.w||10,h:el.h||10}};
  ev.preventDefault();
}
function startDragPt(lineId,ptNum,ev){
  const el=getEl(lineId); if(!el)return;
  pushHistory();
  MS={type:'drag-pt',elId:lineId,ptNum,sx:ev.clientX,sy:ev.clientY,
      data:{x1:el.x1,y1:el.y1,x2:el.x2,y2:el.y2}};
  ev.preventDefault();
  showConnDots(lineId);
}

/* ════════ ER BORDER PROJECTION ════════ */
/* Projects point (px,py) onto the nearest point on the element's geometric border.
   No fixed snap points — the line end slides freely along the border. */
function projectOnBorder(el, px, py){
  const x=el.x||0, y=el.y||0, w=el.w||0, h=el.h||0;
  const cx=x+w/2, cy=y+h/2;
  const t=el.type||'';

  // Ellipse types: project onto ellipse perimeter
  if(t==='er-attribute'||t==='er-key-attribute'||t==='er-multi-attribute'||t==='er-derived-attr'){
    const rx=w/2, ry=h/2;
    const dx=px-cx, dy=py-cy;
    if(Math.abs(dx)<0.001&&Math.abs(dy)<0.001) return {x:Math.round(cx),y:Math.round(cy-ry)};
    const angle=Math.atan2(dy,rx?(dx/rx*ry):dx); // normalise for ellipse
    // Proper ellipse projection: scale to unit circle, get angle, scale back
    const a=Math.atan2(dy/ry, dx/rx);
    return {x:Math.round(cx+rx*Math.cos(a)), y:Math.round(cy+ry*Math.sin(a))};
  }

  // Diamond types: project onto nearest of 4 diamond edges
  if(t==='er-relation'||t==='er-weak-relation'){
    // 4 apices
    const top={x:cx,y:y}, right={x:x+w,y:cy}, bottom={x:cx,y:y+h}, left={x:x,y:cy};
    const edges=[[top,right],[right,bottom],[bottom,left],[left,top]];
    let best=null, bd=Infinity;
    edges.forEach(([a,b])=>{
      const p=closestPtOnSeg(a,b,{x:px,y:py});
      const d=Math.hypot(px-p.x,py-p.y);
      if(d<bd){bd=d;best=p;}
    });
    return {x:Math.round(best.x),y:Math.round(best.y)};
  }

  // Triangle (IS-A): project onto nearest of 3 edges
  if(t==='er-isa'){
    const top={x:cx,y:y}, bl={x:x,y:y+h}, br={x:x+w,y:y+h};
    const edges=[[top,bl],[top,br],[bl,br]];
    let best=null, bd=Infinity;
    edges.forEach(([a,b])=>{
      const p=closestPtOnSeg(a,b,{x:px,y:py});
      const d=Math.hypot(px-p.x,py-p.y);
      if(d<bd){bd=d;best=p;}
    });
    return {x:Math.round(best.x),y:Math.round(best.y)};
  }

  // Rectangle (entity, weak-entity, etc.): project onto nearest of 4 edges
  const edges=[
    [{x,y},{x:x+w,y}],           // top
    [{x:x+w,y},{x:x+w,y:y+h}],   // right
    [{x:x+w,y:y+h},{x,y:y+h}],   // bottom
    [{x,y:y+h},{x,y}],            // left
  ];
  let best=null, bd=Infinity;
  edges.forEach(([a,b])=>{
    const p=closestPtOnSeg(a,b,{x:px,y:py});
    const d=Math.hypot(px-p.x,py-p.y);
    if(d<bd){bd=d;best=p;}
  });
  return {x:Math.round(best.x),y:Math.round(best.y)};
}

function closestPtOnSeg(a, b, p){
  const dx=b.x-a.x, dy=b.y-a.y;
  const lenSq=dx*dx+dy*dy;
  if(lenSq===0) return {x:a.x,y:a.y};
  const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/lenSq));
  return {x:a.x+t*dx, y:a.y+t*dy};
}

/* Legacy connPts kept for lineBindings compatibility (move tracking) */
function connPts(el){
  const x=el.x||0, y=el.y||0, w=el.w||0, h=el.h||0;
  const cx=x+w/2, cy=y+h/2;
  const t=el.type||'';
  if(t==='er-attribute'||t==='er-key-attribute'||t==='er-multi-attribute'||t==='er-derived-attr'){
    const rx=w/2, ry=h/2, pts=[];
    for(let i=0;i<16;i++){const a=(i/16)*Math.PI*2;pts.push({x:Math.round(cx+rx*Math.cos(a)),y:Math.round(cy+ry*Math.sin(a))});}
    pts.push({x:cx,y:y},{x:cx,y:y+h},{x:x,y:cy},{x:x+w,y:cy});
    return pts;
  }
  if(t==='er-relation'||t==='er-weak-relation'){
    return [{x:cx,y:y},{x:x+w,y:cy},{x:cx,y:y+h},{x:x,y:cy}];
  }
  if(t==='er-isa'){
    const top={x:cx,y:y},bl={x:x,y:y+h},br={x:x+w,y:y+h};
    return [top,bl,br,{x:(top.x+bl.x)/2,y:(top.y+bl.y)/2},{x:(top.x+br.x)/2,y:(top.y+br.y)/2},{x:(bl.x+br.x)/2,y:(bl.y+br.y)/2}];
  }
  return [{x:cx,y:y},{x:cx,y:y+h},{x:x,y:cy},{x:x+w,y:cy}];
}

/* No visual snap dots — border projection is continuous */
function showConnDots(){}
function hideConnDots(){document.getElementById('slideCV')?.querySelectorAll('.conn-dot').forEach(d=>d.remove());}

function findSnap(nx,ny,excludeId){
  const sl=curSlide(); if(!sl)return null;
  let best=null, bd=SNAP_TH;
  const PREFER_TH=18; // radius within which center/corners override free-border
  sl.elements.forEach(el=>{
    if(!el.type.startsWith('er-')||el.type==='er-line'||el.type==='er-cardinality'||el.id===excludeId)return;
    // Gate: only consider elements whose border is within SNAP_TH
    const borderPt=projectOnBorder(el,nx,ny);
    const borderDist=Math.hypot(nx-borderPt.x,ny-borderPt.y);
    if(borderDist>=bd)return; // farther away than current best element
    bd=borderDist; // this element is the new closest
    const x=el.x||0,y=el.y||0,w=el.w||0,h=el.h||0;
    const cx=Math.round(x+w/2),cy=Math.round(y+h/2);
    const t=el.type;
    // Build list: center first (highest priority), then key points per shape
    let preferred=[{x:cx,y:cy}];
    if(t==='er-attribute'||t==='er-key-attribute'||t==='er-multi-attribute'||t==='er-derived-attr'){
      // Ellipse: 4 axis intersections
      preferred.push({x:cx,y:y},{x:cx,y:y+h},{x:x,y:cy},{x:x+w,y:cy});
    } else if(t==='er-relation'||t==='er-weak-relation'){
      // Diamond: 4 apices
      preferred.push({x:cx,y:y},{x:x+w,y:cy},{x:cx,y:y+h},{x:x,y:cy});
    } else if(t==='er-isa'){
      // Triangle: 3 vertices + edge midpoints
      preferred.push({x:cx,y:y},{x:x,y:y+h},{x:x+w,y:y+h},
        {x:Math.round((cx+x)/2),y:Math.round((y+y+h)/2)},
        {x:Math.round((cx+x+w)/2),y:Math.round((y+y+h)/2)},
        {x:cx,y:y+h});
    } else {
      // Rectangle: 4 corners + 4 edge midpoints
      preferred.push(
        {x:x,y:y},{x:x+w,y:y},{x:x+w,y:y+h},{x:x,y:y+h},
        {x:cx,y:y},{x:cx,y:y+h},{x:x,y:cy},{x:x+w,y:cy}
      );
    }
    // Find closest preferred point within PREFER_TH
    let closestPref=null, closestPrefD=PREFER_TH;
    for(const pt of preferred){
      const d=Math.hypot(nx-pt.x,ny-pt.y);
      if(d<closestPrefD){closestPrefD=d;closestPref=pt;}
    }
    best=closestPref||borderPt;
  });
  return best;
}

/* Global mouse events */
document.addEventListener('mousemove',ev=>{
  if(!MS)return;
  const dx=(ev.clientX-MS.sx)/cvScale, dy=(ev.clientY-MS.sy)/cvScale;

  if(MS.type==='move'){
    const el=getEl(MS.elId); if(!el)return;
    const nx=Math.round(MS.data.x+dx), ny=Math.round(MS.data.y+dy);
    const snap=trySnapEl(el,nx,ny); el.x=snap.x; el.y=snap.y;
    const dom=document.getElementById('sel_'+MS.elId);
    if(dom){dom.style.left=el.x+'px';dom.style.top=el.y+'px';}
    // Update attached ER lines using pre-bound point indices (no per-frame proximity search)
    if(MS.lineBindings&&MS.lineBindings.length){
      const newPts=connPts(el);
      MS.lineBindings.forEach(({lineId,pt1Idx,pt2Idx})=>{
        const line=getEl(lineId); if(!line)return;
        let changed=false;
        if(pt1Idx>=0&&newPts[pt1Idx]){line.x1=newPts[pt1Idx].x;line.y1=newPts[pt1Idx].y;changed=true;}
        if(pt2Idx>=0&&newPts[pt2Idx]){line.x2=newPts[pt2Idx].x;line.y2=newPts[pt2Idx].y;changed=true;}
        if(changed)updateLineDom(line);
      });
    }
    refreshFP(el);
  }

  if(MS.type==='move-line'){
    const el=getEl(MS.elId); if(!el)return;
    el.x1=Math.round(MS.data.x1+dx); el.y1=Math.round(MS.data.y1+dy);
    el.x2=Math.round(MS.data.x2+dx); el.y2=Math.round(MS.data.y2+dy);
    updateLineDom(el); refreshFP(el);
  }

  if(MS.type==='resize'){
    const el=getEl(MS.elId); if(!el)return;
    el.w=Math.max(10,Math.round(MS.data.w+dx));
    el.h=Math.max(2,Math.round(MS.data.h+dy));
    const dom=document.getElementById('sel_'+MS.elId);
    if(dom){dom.style.width=el.w+'px';dom.style.height=el.h+'px';}
    if(el.type&&el.type.startsWith('er-'))updateERSVG(el);
    refreshFP(el);
  }

  if(MS.type==='drag-pt'){
    const el=getEl(MS.elId); if(!el)return;
    const rect=document.getElementById('slideCV').getBoundingClientRect();
    let nx=Math.round((ev.clientX-rect.left)/cvScale);
    let ny=Math.round((ev.clientY-rect.top)/cvScale);
    const snap=findSnap(nx,ny,MS.elId);
    if(snap){nx=snap.x;ny=snap.y;}
    if(MS.ptNum===1){el.x1=nx;el.y1=ny;}else{el.x2=nx;el.y2=ny;}
    updateLineDom(el); refreshFP(el);
    // Highlight snapped pt handle
    const wrap=document.getElementById('sel_'+MS.elId);
    if(wrap){wrap.querySelectorAll('.er-line-pt').forEach(p=>{p.classList.toggle('snapped',+p.dataset.pt===MS.ptNum&&!!snap);});}
  }
});
document.addEventListener('mouseup',()=>{
  if(MS&&(MS.type==='move'||MS.type==='move-line'||MS.type==='resize'||MS.type==='drag-pt')){
    const el=getEl(MS.elId);
    let changed=false;
    if(MS.type==='move'&&el)
      changed=(el.x!==MS.data.x||el.y!==MS.data.y);
    else if(MS.type==='move-line'&&el)
      changed=(el.x1!==MS.data.x1||el.y1!==MS.data.y1||el.x2!==MS.data.x2||el.y2!==MS.data.y2);
    else if(MS.type==='resize'&&el)
      changed=(el.w!==MS.data.w||el.h!==MS.data.h);
    else if(MS.type==='drag-pt'&&el)
      changed=(el.x1!==MS.data.x1||el.y1!==MS.data.y1||el.x2!==MS.data.x2||el.y2!==MS.data.y2);
    if(changed){
      if(MS.type!=='drag-pt'&&el)el.z=zMax;
      _spRefresh();
    } else {
      /* Nothing moved — discard the snapshot we pushed at drag start */
      _undoStack.pop();
      _updateHistBtns();
    }
  }
  MS=null;hideGuides();hideConnDots();
});

/* ── Snap helper for regular elements ── */
const SNAP=10;
function trySnapEl(el,nx,ny){
  const sz=slSz(curSlide());
  const ew=el.w||0, eh=el.h||0;
  let rx=nx, ry=ny;
  let bestX=SNAP, bestY=SNAP;
  let guideX=null, guideY=null;
  let colorX='rgba(239,68,68,.85)', colorY='rgba(239,68,68,.85)';

  function checkX(candidateLeft,axisX,isCenter){
    const d=Math.abs(nx-candidateLeft);
    if(d<bestX){bestX=d;rx=candidateLeft;guideX=axisX;colorX=isCenter?'rgba(59,130,246,.85)':'rgba(239,68,68,.85)';}
  }
  function checkY(candidateTop,axisY,isCenter){
    const d=Math.abs(ny-candidateTop);
    if(d<bestY){bestY=d;ry=candidateTop;guideY=axisY;colorY=isCenter?'rgba(59,130,246,.85)':'rgba(239,68,68,.85)';}
  }

  /* Slide center */
  const scx=sz.w/2, scy=sz.h/2;
  checkX(Math.round(scx-ew/2),scx,true);
  checkY(Math.round(scy-eh/2),scy,true);

  /* Other elements */
  (curSlide()?.elements||[]).forEach(o=>{
    if(o.id===selElId||!o.w||o.type==='er-line')return;
    const ox=o.x||0,oy=o.y||0,ow=o.w||0,oh=o.h||0;
    const ocx=ox+ow/2,ocy=oy+oh/2;
    checkX(ox,           ox,    false);
    checkX(Math.round(ocx-ew/2),ocx,true);
    checkX(ox+ow-ew,     ox+ow, false);
    checkX(ox+ow,        ox+ow, false);
    checkX(ox-ew,        ox,    false);
    checkY(oy,           oy,    false);
    checkY(Math.round(ocy-eh/2),ocy,true);
    checkY(oy+oh-eh,     oy+oh, false);
    checkY(oy+oh,        oy+oh, false);
    checkY(oy-eh,        oy,    false);
  });

  /* Show / hide guide lines */
  const sRect=document.getElementById('slideCV')?.getBoundingClientRect();
  if(sRect){
    const gH=document.getElementById('gH');
    const gV=document.getElementById('gV');
    if(guideY!==null){
      gH.style.display='block';
      gH.style.top=(sRect.top+guideY*cvScale)+'px';
      gH.style.background=colorY;
      gH.style.boxShadow=`0 0 4px ${colorY}`;
    } else { gH.style.display='none'; }
    if(guideX!==null){
      gV.style.display='block';
      gV.style.left=(sRect.left+guideX*cvScale)+'px';
      gV.style.background=colorX;
      gV.style.boxShadow=`0 0 4px ${colorX}`;
    } else { gV.style.display='none'; }
  }
  return{x:rx,y:ry};
}
function hideGuides(){document.getElementById('gH').style.display='none';document.getElementById('gV').style.display='none';}

/* ════════ KEYBOARD ════════ */
document.addEventListener('keydown',ev=>{
  if(!document.getElementById('editorView').classList.contains('open'))return;
  if(ev.key==='Escape'){deselectAll();hideRTB();return;}
  // Undo / Redo
  if((ev.ctrlKey||ev.metaKey)&&!ev.shiftKey&&ev.key.toLowerCase()==='z'&&!isEdit(ev.target)){ev.preventDefault();edUndo();return;}
  if((ev.ctrlKey||ev.metaKey)&&(ev.key.toLowerCase()==='y'||(ev.shiftKey&&ev.key.toLowerCase()==='z'))&&!isEdit(ev.target)){ev.preventDefault();edRedo();return;}
  if(ev.key==='Delete'&&selElId&&!isEdit(ev.target)){deleteEl(selElId);return;}
  if(selElId&&!isEdit(ev.target)&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(ev.key)){
    ev.preventDefault(); const el=getEl(selElId); if(!el)return; const step=ev.shiftKey?10:1;
    if(el.type==='er-line'){
      if(ev.key==='ArrowLeft'){el.x1-=step;el.x2-=step;}if(ev.key==='ArrowRight'){el.x1+=step;el.x2+=step;}
      if(ev.key==='ArrowUp'){el.y1-=step;el.y2-=step;}if(ev.key==='ArrowDown'){el.y1+=step;el.y2+=step;}
      updateLineDom(el);
    } else {
      if(ev.key==='ArrowLeft')el.x-=step;if(ev.key==='ArrowRight')el.x+=step;
      if(ev.key==='ArrowUp')el.y-=step;if(ev.key==='ArrowDown')el.y+=step;
      const d=document.getElementById('sel_'+selElId);if(d){d.style.left=el.x+'px';d.style.top=el.y+'px';}
    }
    refreshFP(el);
  }
});
function isEdit(t){return t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT'||t.isContentEditable||t.contentEditable==='true';}

/* ════════ SIDEBAR TABS + COLLAPSIBLE ════════ */
function edTab(name){['ins','fmt','sld'].forEach(n=>{document.getElementById('etb-'+n).classList.toggle('act',n===name);document.getElementById('ep-'+n).style.display=n===name?'block':'none';});}
function toggleSec(hdr){
  hdr.classList.toggle('open');
  const body=hdr.nextElementSibling; if(!body)return;
  body.style.maxHeight=hdr.classList.contains('open')?'2000px':'0';
}

/* ════════ RICH TEXT TOOLBAR ════════ */
let savedRange=null;
let rtbCurrentSize=14;

function saveRange(){
  const sel=window.getSelection();
  if(sel&&sel.rangeCount>0){
    const r=sel.getRangeAt(0);
    if(!r.collapsed)savedRange=r.cloneRange();
  }
}
function restoreRange(){
  if(!savedRange)return false;
  try{
    const sel=window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedRange);
    return true;
  }catch(e){return false;}
}
function syncSavedToEl(){
  if(activeRTBEl){
    const el=getEl(activeRTBEl);
    const dom=document.getElementById('sel_'+activeRTBEl);
    const ce=dom?.querySelector('.el-text');
    if(el&&ce)el.html=ce.innerHTML;
  } else if(adminScreen==='notizen'){
    scheduleNoteSave();
  }
}

function rfmt(cmd,val){
  if(!restoreRange())return;
  document.execCommand('styleWithCSS',false,true);
  document.execCommand(cmd,false,val||null);
  syncSavedToEl();
  // Re-save range after command (selection may shift)
  saveRange();
  setTimeout(posRTB,10);
}

/* Font picker */
function toggleRtbDrop(id){
  const d=document.getElementById(id);
  const wasOpen=d.classList.contains('open');
  document.querySelectorAll('.rtb-drop.open').forEach(x=>x.classList.remove('open'));
  if(!wasOpen)d.classList.add('open');
}

/* Font picker — driven by data-font/data-label attributes */
document.addEventListener('click',ev=>{
  const item=ev.target.closest('.rtb-drop-item[data-font]');
  if(!item)return;
  ev.preventDefault();
  const raw=item.dataset.font;   // e.g. "DM Sans,sans-serif"
  const label=item.dataset.label;
  // Wrap multi-word family names in quotes: "DM Sans,sans-serif" → "'DM Sans',sans-serif"
  const fontVal=raw.split(',').map((p,i)=>i===0&&p.includes(' ')?`'${p}'`:p).join(',');
  document.getElementById('rtbFontLbl').textContent=label;
  document.querySelectorAll('.rtb-drop.open').forEach(x=>x.classList.remove('open'));
  if(!restoreRange())return;
  document.execCommand('styleWithCSS',false,true);
  document.execCommand('fontName',false,fontVal);
  syncSavedToEl();
  saveRange();
  setTimeout(posRTB,10);
});

/* Size stepper — robust: uses execCommand fontSize with CSS mapping */
const RTB_SIZE_STEPS=[6,7,8,9,10,11,12,13,14,16,18,20,22,24,28,32,36,42,48,56,64,72,96];

function rtbApplySize(sz){
  sz=Math.round(sz);
  if(!sz||sz<1||sz>400)return;
  rtbCurrentSize=sz;
  document.getElementById('rtbSizeVal').value=sz;
  if(!restoreRange())return;
  const sel=window.getSelection();
  if(!sel||!sel.rangeCount)return;

  // Mark the selection with a font tag, then replace with a proper span
  document.execCommand('styleWithCSS',false,false);
  document.execCommand('fontSize',false,'7');
  document.execCommand('styleWithCSS',false,true);

  const dom=activeRTBEl?document.getElementById('sel_'+activeRTBEl):null;
  const container=dom?.querySelector('.el-text')||document.body;
  const created=[];
  container.querySelectorAll('font[size="7"]').forEach(f=>{
    const s=document.createElement('span');
    s.style.fontSize=sz+'px';
    if(f.style&&f.style.cssText) s.style.cssText+=';'+f.style.cssText;
    f.replaceWith(s);
    s.append(...Array.from(f.childNodes));
    created.push(s);
  });

  // Re-select the replaced content so toolbar stays visible
  if(created.length){
    try{
      const newRange=document.createRange();
      if(created.length===1){
        newRange.selectNodeContents(created[0]);
      } else {
        newRange.setStartBefore(created[0]);
        newRange.setEndAfter(created[created.length-1]);
      }
      sel.removeAllRanges();
      sel.addRange(newRange);
      savedRange=newRange.cloneRange();
    }catch(e){}
  }

  syncSavedToEl();
  // Use longer delay so browser finishes DOM stabilisation before measuring rect
  setTimeout(()=>{saveRange();posRTB();},30);
}

function rtbStepSize(delta){
  if(!restoreRange())return;
  const sel=window.getSelection();
  if(!sel||!sel.rangeCount)return;
  // Read current computed size from anchor node
  const node=sel.anchorNode;
  const ancEl=node?.nodeType===3?node.parentElement:node;
  const curPx=ancEl?parseFloat(window.getComputedStyle(ancEl).fontSize)||rtbCurrentSize:rtbCurrentSize;
  let idx=RTB_SIZE_STEPS.findIndex(s=>s>=Math.round(curPx));
  if(idx<0)idx=RTB_SIZE_STEPS.length-1;
  idx=Math.max(0,Math.min(RTB_SIZE_STEPS.length-1,idx+delta));
  rtbApplySize(RTB_SIZE_STEPS[idx]);
}

/* Color */
function openRtbColor(){
  saveRange();
  const inp=document.getElementById('rtbFg');
  inp.click();
}
function applyRtbColor(val){
  // Update A letter and bar to reflect new color
  document.getElementById('rtbColorA').style.color=val;
  document.getElementById('rtbColorBar').style.background=val;
  document.getElementById('rtbFg').value=val;
  if(!restoreRange())return;
  document.execCommand('styleWithCSS',false,true);
  document.execCommand('foreColor',false,val);
  syncSavedToEl();
  saveRange();
  setTimeout(posRTB,10);
}

function posRTB(){
  const sel=window.getSelection(); if(!sel||!sel.rangeCount){hideRTB();return;}
  const range=sel.getRangeAt(0); if(range.collapsed){hideRTB();return;}
  const anc=range.commonAncestorContainer;
  const textEl=anc.nodeType===3
    ?anc.parentElement.closest('.el-text,.notes-editor')
    :anc.closest?.('.el-text,.notes-editor');
  if(!textEl){hideRTB();return;}

  // Read current selection color and update A + bar
  const ancEl=anc.nodeType===3?anc.parentElement:anc;
  if(ancEl){
    const col=window.getComputedStyle(ancEl).color;
    if(col){
      // Convert rgb(...) to hex for the color input
      const hex=rgbToHex(col);
      if(hex){
        document.getElementById('rtbColorA').style.color=hex;
        document.getElementById('rtbColorBar').style.background=hex;
        document.getElementById('rtbFg').value=hex;
      }
    }
    // Read current font size
    const fs=parseFloat(window.getComputedStyle(ancEl).fontSize);
    if(fs){
      rtbCurrentSize=Math.round(fs);
      document.getElementById('rtbSizeVal').value=rtbCurrentSize;
    }
  }

  const rect=range.getBoundingClientRect(), tb=document.getElementById('rtb');
  tb.classList.add('vis');
  const tbW=tb.offsetWidth||400, tbH=tb.offsetHeight||36;
  let top=rect.top-tbH-10, left=rect.left+rect.width/2-tbW/2;
  if(top<4)top=rect.bottom+8;
  left=Math.max(6,Math.min(left,window.innerWidth-tbW-6));
  tb.style.top=top+'px'; tb.style.left=left+'px';
}

function rgbToHex(rgb){
  const m=rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if(!m)return null;
  return '#'+[m[1],m[2],m[3]].map(x=>(+x).toString(16).padStart(2,'0')).join('');
}
function hideRTB(){
  document.getElementById('rtb').classList.remove('vis');
  document.querySelectorAll('.rtb-drop.open').forEach(x=>x.classList.remove('open'));
}

document.addEventListener('selectionchange',()=>{
  const editorOpen=document.getElementById('editorView').classList.contains('open');
  const notesActive=adminScreen==='notizen'&&curRole==='admin'&&document.getElementById('adminView')?.classList.contains('active');
  if(!editorOpen&&!notesActive){hideRTB();return;}
  const active=document.activeElement;
  if(active&&(active.classList.contains('el-text')||active.classList.contains('notes-editor'))){
    saveRange();
    setTimeout(posRTB,30);
  }
});
document.addEventListener('mousedown',ev=>{
  if(!ev.target.closest('#rtb')&&!ev.target.closest('.el-text')&&!ev.target.closest('.notes-editor')){
    hideRTB();
  }
  // Close font dropdown on outside click
  if(!ev.target.closest('.rtb-drop')){
    document.querySelectorAll('.rtb-drop.open').forEach(x=>x.classList.remove('open'));
  }
});

/* ════════ CANVAS WHEEL VIEWER ════════ */
document.addEventListener('wheel',ev=>{
  if(!document.getElementById('viewerOverlay').classList.contains('open'))return;
  // Ctrl+Scroll → zoom in viewer
  if(ev.ctrlKey){
    ev.preventDefault();
    const d=ev.deltaY<0?0.1:-0.1;
    vZoom(d);
  }
  // Otherwise let the scroll area handle it naturally
},{passive:false});


/* ════════════════════════════════════════════════════
   DATEIEN — Supabase Storage Cloud (File Tree)
   Bucket: info-files (erstelle im Supabase-Dashboard:
   Storage → New Bucket → Name: "info-files" → Private)
   Policies: Authenticated users können lesen/schreiben/löschen
   ════════════════════════════════════════════════════ */
const FILES_BUCKET = 'info-files';
const FILES_MAX_BYTES = 50 * 1024 * 1024;
const FILES_TOTAL_LIMIT = 1024 * 1024 * 1024;

let _renameTarget = null;
let _treeState = {};     // path → { expanded: bool, items: array|null }
let _fileDragSrc = null; // path of the file currently being dragged

function fmtBytes(b){
  if(!b||b===0)return '0 B';
  const u=['B','KB','MB','GB'], i=Math.floor(Math.log(b)/Math.log(1024));
  return (b/Math.pow(1024,i)).toFixed(i?1:0)+' '+u[i];
}

/* SVG icons — all consistent with each other */
const SVG_FOLDER=`<svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="color:var(--gold);opacity:.85"><path d="M1 3.5C1 2.67 1.67 2 2.5 2H6.38c.35 0 .68.13.93.37L8.5 3.5H15.5C16.33 3.5 17 4.17 17 5v8c0 .83-.67 1.5-1.5 1.5h-13C1.67 14.5 1 13.83 1 13V3.5z" stroke="currentColor" stroke-width="1.4" fill="rgba(232,160,48,.08)"/></svg>`;
const SVG_FOLDER_OPEN=`<svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="color:var(--gold);opacity:.85"><path d="M1 3.5C1 2.67 1.67 2 2.5 2H6.38c.35 0 .68.13.93.37L8.5 3.5H15.5C16.33 3.5 17 4.17 17 5v1H2.5C1.67 6 1 5.33 1 4.5V3.5z" stroke="currentColor" stroke-width="1.4" fill="rgba(232,160,48,.12)"/><path d="M1 6h16l-1.8 7.2A1.5 1.5 0 0 1 13.74 14.5H2.5A1.5 1.5 0 0 1 1 13V6z" stroke="currentColor" stroke-width="1.4" fill="rgba(232,160,48,.14)"/></svg>`;
const SVG_CHEVRON_RIGHT=`<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
const SVG_CHEVRON_DOWN=`<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;
const SVG_SPINNER=`<div class="file-spinner" style="width:10px;height:10px;border-width:1.5px;display:inline-block"></div>`;

function fileIcon(name){
  const ext=(name.split('.').pop()||'').toLowerCase();
  const color={
    png:'var(--gold)',jpg:'var(--gold)',jpeg:'var(--gold)',gif:'var(--gold)',svg:'var(--gold)',webp:'var(--gold)',
    pdf:'#f87171',
    doc:'#7dd3fc',docx:'#7dd3fc',
    ppt:'#fb923c',pptx:'#fb923c',
    xls:'#86efac',xlsx:'#86efac',
    mp4:'#c084fc',mp3:'#c084fc',
    zip:'#94a3b8',rar:'#94a3b8',
    py:'#fbbf24',js:'#fbbf24',ts:'#fbbf24',
    html:'#fb923c',css:'#7dd3fc',json:'#86efac',
    txt:'#94a3b8',md:'#94a3b8',
  }[ext]||'var(--text3)';
  const imgExts=['png','jpg','jpeg','gif','svg','webp'];
  if(imgExts.includes(ext)){
    return `<svg width="16" height="14" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="color:${color}"><rect x="1" y="1" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.4" fill="rgba(232,160,48,.06)"/><circle cx="5.5" cy="5.5" r="1.5" fill="currentColor" opacity=".7"/><path d="M1 11l4-4 3 3 2.5-2.5L16 13" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/></svg>`;
  }
  // Generic file icon with colored accent
  return `<svg width="15" height="16" viewBox="0 0 15 18" fill="none" xmlns="http://www.w3.org/2000/svg" style="color:${color}"><path d="M2 1h7.5L13 4.5V17H2V1z" stroke="currentColor" stroke-width="1.3" fill="rgba(0,0,0,.0)" opacity=".5"/><polyline points="9 1 9 5 13 5" stroke="currentColor" stroke-width="1.3" opacity=".5"/><line x1="4" y1="8" x2="11" y2="8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity=".7"/><line x1="4" y1="11" x2="11" y2="11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity=".7"/><line x1="4" y1="14" x2="8" y2="14" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity=".7"/></svg>`;
}

/* ── Load root and render tree ── */
async function loadFiles(){
  _treeState={};
  const listEl=document.getElementById('filesList');
  if(listEl)listEl.innerHTML='<div style="text-align:center;padding:40px;color:var(--text3);font-size:13px">Laden …</div>';

  const {data,error}=await _sb.storage.from(FILES_BUCKET).list('',{
    limit:500,offset:0,sortBy:{column:'name',order:'asc'}
  });

  if(error){
    if(listEl)listEl.innerHTML=error.message.includes('not found')
      ?`<div class="files-empty"><div class="files-empty-i" style="font-size:32px">☁️</div><div style="font-size:14px;color:var(--text2)">Bucket nicht gefunden</div><div class="files-empty-p">Erstelle <strong style="color:var(--gold)">info-files</strong> im Supabase-Dashboard.</div></div>`
      :`<div class="files-empty"><div class="files-empty-i" style="font-size:32px">⚠️</div><div class="files-empty-p">${esc(error.message)}</div></div>`;
    return;
  }

  const items=(data||[]).filter(f=>f.name!=='.emptyFolderPlaceholder');
  _treeState['']={expanded:true,items};

  // Compute total used across all root-level files only (approximation)
  const rootFiles=items.filter(f=>f.id!==null);
  const totalUsed=rootFiles.reduce((s,f)=>s+(f.metadata?.size||0),0);
  const pct=Math.min(100,(totalUsed/FILES_TOTAL_LIMIT)*100);
  const fillEl=document.getElementById('filesStorageFill');
  const pctEl=document.getElementById('filesStoragePct');
  const lblEl=document.getElementById('filesStorageLabel');
  if(fillEl){fillEl.style.width=pct.toFixed(1)+'%';fillEl.style.background=pct>85?'#f87171':pct>65?'#fbbf24':'var(--gold)';}
  if(pctEl)pctEl.textContent=pct.toFixed(1)+'%';
  if(lblEl)lblEl.textContent=`${fmtBytes(totalUsed)} von 1 GB`;

  renderFileTree();
}

async function _loadFolderItems(path){
  const {data,error}=await _sb.storage.from(FILES_BUCKET).list(path,{
    limit:500,offset:0,sortBy:{column:'name',order:'asc'}
  });
  if(error)return[];
  return(data||[]).filter(f=>f.name!=='.emptyFolderPlaceholder');
}

/* ── Toggle folder expand/collapse ── */
async function toggleFolder(path){
  const st=_treeState[path];
  if(st&&st.expanded){
    _treeState[path].expanded=false;
    renderFileTree();
    return;
  }
  if(!st||st.items===null||st.items===undefined){
    // Show loading spinner on the arrow
    _treeState[path]={expanded:false,items:undefined};
    renderFileTree(); // show spinner state
    const items=await _loadFolderItems(path);
    _treeState[path]={expanded:true,items};
  } else {
    _treeState[path].expanded=true;
  }
  renderFileTree();
}

/* ── Render the full tree ── */
function renderFileTree(){
  const listEl=document.getElementById('filesList');if(!listEl)return;
  const rootSt=_treeState[''];
  if(!rootSt||!rootSt.items){
    listEl.innerHTML='<div class="files-empty"><div class="files-empty-i">☁️</div><div class="files-empty-p">Fehler beim Laden.</div></div>';
    return;
  }
  if(!rootSt.items.length){
    listEl.innerHTML=`<div class="files-empty"><div class="files-empty-i">☁️</div><div style="font-size:14px;color:var(--text2)">Leer</div><div class="files-empty-p">Lade Dateien hoch oder erstelle einen Ordner.</div></div>`;
    return;
  }
  listEl.innerHTML=_renderTreeLevel(rootSt.items,'',0);
}

function _renderTreeLevel(items,parentPath,depth){
  if(!items)return`<div class="tree-loading">${SVG_SPINNER} Laden …</div>`;
  const folders=items.filter(f=>f.id===null);
  const files=items.filter(f=>f.id!==null);
  let html='';
  const indent=depth*18;

  for(const f of folders){
    const fullPath=parentPath?`${parentPath}/${f.name}`:f.name;
    const safePath=fullPath.replace(/'/g,"\\'");
    const st=_treeState[fullPath];
    const expanded=st?.expanded||false;
    const loading=st&&st.items===undefined;
    const arrowIcon=loading?SVG_SPINNER:expanded?SVG_CHEVRON_DOWN:SVG_CHEVRON_RIGHT;
    const folderIcon=expanded?SVG_FOLDER_OPEN:SVG_FOLDER;
    html+=`<div class="file-tree-folder" data-tree-path="${fullPath}"
      ondragover="treeFolderDragOver(event,'${safePath}')"
      ondragleave="treeFolderDragLeave(event)"
      ondrop="treeFolderDrop(event,'${safePath}')">
      <div class="file-tree-folder-row" style="padding-left:${indent}px"
           onclick="toggleFolder('${safePath}')">
        <span class="file-tree-arrow">${arrowIcon}</span>
        <span class="file-icon-inline">${folderIcon}</span>
        <span class="file-tree-name">${esc(f.name)}</span>
        <div class="file-acts" onclick="event.stopPropagation()">
          <button class="file-act-btn del" onclick="deleteFolder('${safePath}')" title="Ordner löschen">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
          </button>
        </div>
      </div>
      ${expanded&&st.items?`<div class="file-tree-children">${_renderTreeLevel(st.items,fullPath,depth+1)}</div>`:''}
    </div>`;
  }

  for(const f of files){
    const fullPath=parentPath?`${parentPath}/${f.name}`:f.name;
    const safePath=fullPath.replace(/'/g,"\\'");
    const size=f.metadata?.size||0;
    const date=f.updated_at?new Date(f.updated_at).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'}):'-';
    const icon=fileIcon(f.name);
    html+=`<div class="file-item" data-name="${fullPath}" draggable="true"
      style="padding-left:${indent+4}px"
      ondragstart="fileItemDragStart(event,'${safePath}')"
      ondragend="fileItemDragEnd(event)">
      <div class="file-icon">${icon}</div>
      <div class="file-info">
        <div class="file-name" title="${esc(f.name)}">${esc(f.name)}</div>
        <div class="file-meta"><span>${fmtBytes(size)}</span><span>${date}</span></div>
      </div>
      <div class="file-acts">
        <span class="file-status" style="display:none"><div class="file-spinner"></div><span class="file-status-txt"></span></span>
        <button class="file-act-btn dl" onclick="downloadFile('${safePath}')" title="Herunterladen">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
        <button class="file-act-btn rn" onclick="openRenameModal('${safePath}')" title="Umbenennen">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <label class="file-act-btn ov" title="Überschreiben" style="cursor:pointer">
          <input type="file" style="display:none" onchange="overwriteFile('${safePath}',this)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
        </label>
        <button class="file-act-btn mv" onclick="openMoveModal('${safePath}')" title="Verschieben (Modal)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 9l-3 3 3 3"/><path d="M19 9l3 3-3 3"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
        </button>
        <button class="file-act-btn del" onclick="deleteFile('${safePath}')" title="Löschen">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        </button>
      </div>
    </div>`;
  }
  return html||'<div class="tree-empty-folder">Leer</div>';
}

/* ── Drag-and-drop between tree nodes ── */
function fileItemDragStart(ev,path){
  _fileDragSrc=path;
  ev.dataTransfer.effectAllowed='move';
  ev.dataTransfer.setData('text/plain',path);
  setTimeout(()=>{
    const el=document.querySelector(`.file-item[data-name="${path}"]`);
    if(el)el.classList.add('dragging');
  },0);
}
function fileItemDragEnd(ev){
  _fileDragSrc=null;
  document.querySelectorAll('.file-item.dragging').forEach(e=>e.classList.remove('dragging'));
}
function treeFolderDragOver(ev,folderPath){
  if(!_fileDragSrc)return;
  ev.preventDefault();ev.stopPropagation();
  ev.dataTransfer.dropEffect='move';
  const el=document.querySelector(`.file-tree-folder[data-tree-path="${folderPath}"]`);
  if(el)el.classList.add('drag-over');
}
function treeFolderDragLeave(ev){
  // Only remove if leaving the folder element itself (not a child)
  const folder=ev.currentTarget.closest?.('.file-tree-folder');
  if(folder&&!folder.contains(ev.relatedTarget))folder.classList.remove('drag-over');
}
async function treeFolderDrop(ev,folderPath){
  ev.preventDefault();ev.stopPropagation();
  const folder=ev.currentTarget.closest?.('.file-tree-folder')||ev.currentTarget;
  folder.classList.remove('drag-over');
  if(!_fileDragSrc)return;
  const srcPath=_fileDragSrc; _fileDragSrc=null;
  const srcDir=srcPath.includes('/')?srcPath.substring(0,srcPath.lastIndexOf('/')):'';
  if(srcDir===folderPath)return; // already in this folder
  const fileName=srcPath.split('/').pop();
  const destPath=`${folderPath}/${fileName}`;
  await _moveFile(srcPath,destPath);
}

/* Drop onto the root (files-list background) */
function treeRootDragOver(ev){
  if(!_fileDragSrc)return;
  ev.preventDefault();
  ev.dataTransfer.dropEffect='move';
  document.getElementById('filesList')?.classList.add('drag-over-root');
}
function treeRootDragLeave(ev){
  if(!ev.currentTarget.contains(ev.relatedTarget))
    document.getElementById('filesList')?.classList.remove('drag-over-root');
}
async function treeRootDrop(ev){
  ev.preventDefault();
  document.getElementById('filesList')?.classList.remove('drag-over-root');
  if(!_fileDragSrc)return;
  const srcPath=_fileDragSrc; _fileDragSrc=null;
  const srcDir=srcPath.includes('/')?srcPath.substring(0,srcPath.lastIndexOf('/')):'';
  if(srcDir==='')return; // already at root
  const fileName=srcPath.split('/').pop();
  await _moveFile(srcPath,fileName);
}

/* ── Upload files ── */
async function uploadFilesToBucket(fileList,pathPrefix=''){
  const failed=[];
  const statusDiv=document.getElementById('filesUploadStatus');
  const statusTxt=document.getElementById('filesUploadStatusText');
  const arr=Array.from(fileList);
  for(let i=0;i<arr.length;i++){
    const file=arr[i];
    if(file.size>FILES_MAX_BYTES){failed.push(`${file.name} (zu groß, max. 50 MB)`);continue;}
    const uploadPath=pathPrefix?`${pathPrefix}/${file.name}`:file.name;
    if(statusDiv&&statusTxt){statusTxt.textContent=`Hochladen ${i+1}/${arr.length}: ${file.name}`;statusDiv.style.display='flex';}
    const {error}=await _sb.storage.from(FILES_BUCKET).upload(uploadPath,file,{upsert:true});
    if(error)failed.push(`${file.name}: ${error.message}`);
  }
  if(statusDiv)statusDiv.style.display='none';
  if(failed.length)alert('Fehler beim Hochladen:\n'+failed.join('\n'));
  await loadFiles();
}

/* ── Upload folder (webkitdirectory input) ── */
async function uploadFolderToBucket(fileList){
  const failed=[];
  const statusDiv=document.getElementById('filesUploadStatus');
  const statusTxt=document.getElementById('filesUploadStatusText');
  const arr=Array.from(fileList);
  for(let i=0;i<arr.length;i++){
    const file=arr[i];
    if(file.size>FILES_MAX_BYTES){failed.push(`${file.name} (zu groß)`);continue;}
    // webkitRelativePath is e.g. "FolderName/sub/file.txt" — use it directly from root
    const uploadPath=file.webkitRelativePath||file.name;
    if(statusDiv&&statusTxt){statusTxt.textContent=`Hochladen ${i+1}/${arr.length}: ${uploadPath}`;statusDiv.style.display='flex';}
    const {error}=await _sb.storage.from(FILES_BUCKET).upload(uploadPath,file,{upsert:true});
    if(error)failed.push(`${uploadPath}: ${error.message}`);
  }
  if(statusDiv)statusDiv.style.display='none';
  if(failed.length)alert('Fehler beim Hochladen:\n'+failed.join('\n'));
  await loadFiles();
}

/* ── FileSystem Entries (drag-drop folder) ── */
function _readDirEntries(reader){
  return new Promise(resolve=>{
    const all=[];
    const read=()=>{reader.readEntries(batch=>{if(!batch.length){resolve(all);return;}all.push(...batch);read();},()=>resolve(all));};
    read();
  });
}
async function _collectFiles(entry,pathSoFar){
  const results=[];
  if(entry.isFile){
    const file=await new Promise((res,rej)=>entry.file(res,rej));
    const uploadPath=pathSoFar?`${pathSoFar}/${entry.name}`:entry.name;
    results.push({file,uploadPath});
  } else if(entry.isDirectory){
    const subPath=pathSoFar?`${pathSoFar}/${entry.name}`:entry.name;
    const subEntries=await _readDirEntries(entry.createReader());
    if(!subEntries.length){
      results.push({
        file:new File([new Blob([''])],'.emptyFolderPlaceholder',{type:'text/plain'}),
        uploadPath:`${subPath}/.emptyFolderPlaceholder`
      });
    }
    for(const sub of subEntries)results.push(...await _collectFiles(sub,subPath));
  }
  return results;
}
async function uploadEntries(entries){
  const statusDiv=document.getElementById('filesUploadStatus');
  const statusTxt=document.getElementById('filesUploadStatusText');
  const failed=[];
  // Collect all files from the dropped entries — paths are built from root
  let allFiles=[];
  for(const entry of entries)allFiles.push(...await _collectFiles(entry,''));
  for(let i=0;i<allFiles.length;i++){
    const {file,uploadPath}=allFiles[i];
    if(file.name!=='.emptyFolderPlaceholder'&&file.size>FILES_MAX_BYTES){failed.push(`${file.name} (zu groß, max. 50 MB)`);continue;}
    if(statusDiv&&statusTxt){statusTxt.textContent=`Hochladen ${i+1}/${allFiles.length}: ${uploadPath}`;statusDiv.style.display='flex';}
    const {error}=await _sb.storage.from(FILES_BUCKET).upload(uploadPath,file,{upsert:true});
    if(error)failed.push(`${uploadPath}: ${error.message}`);
  }
  if(statusDiv)statusDiv.style.display='none';
  if(failed.length)alert('Fehler beim Hochladen:\n'+failed.join('\n'));
  await loadFiles();
}

function filesOnDragOver(ev){ev.preventDefault();document.getElementById('filesDropZone').classList.add('dnd');}
function filesOnDragLeave(){document.getElementById('filesDropZone').classList.remove('dnd');}
function filesOnDrop(ev){
  ev.preventDefault();document.getElementById('filesDropZone').classList.remove('dnd');
  const items=ev.dataTransfer?.items;
  if(items&&items.length){
    const entries=[];
    for(let i=0;i<items.length;i++){const e=items[i].webkitGetAsEntry?.();if(e)entries.push(e);}
    if(entries.length){uploadEntries(entries);return;}
  }
  const files=ev.dataTransfer?.files;
  if(files&&files.length)uploadFilesToBucket(files);
}
function filesOnInput(ev){const files=ev.target.files;if(files&&files.length){uploadFilesToBucket(files);ev.target.value='';}}
function folderOnInput(ev){const files=ev.target.files;if(files&&files.length){uploadFolderToBucket(files);ev.target.value='';}}

/* ── Create folder (always at root) ── */
function openCreateFolderModal(){
  document.getElementById('createFolderInput').value='';
  document.getElementById('createFolderModal').style.display='flex';
  setTimeout(()=>document.getElementById('createFolderInput').focus(),50);
}
function closeCreateFolderModal(){document.getElementById('createFolderModal').style.display='none';}
document.addEventListener('keydown',ev=>{
  if(ev.key==='Escape'&&document.getElementById('createFolderModal')?.style.display==='flex')closeCreateFolderModal();
});
async function confirmCreateFolder(){
  const name=document.getElementById('createFolderInput').value.trim();
  if(!name)return;
  closeCreateFolderModal();
  const placeholderPath=name+'/.emptyFolderPlaceholder';
  const {error}=await _sb.storage.from(FILES_BUCKET).upload(placeholderPath,new Blob(['']),{upsert:true});
  if(error){alert('Ordner erstellen fehlgeschlagen: '+error.message);return;}
  const items=await _loadFolderItems('');
  _treeState['']={expanded:true,items};
  renderFileTree();
}

/* ── Delete folder (recursively) ── */
async function listAllInPath(path){
  const {data}=await _sb.storage.from(FILES_BUCKET).list(path,{limit:1000});
  let paths=[];
  for(const item of data||[]){
    const full=path+'/'+item.name;
    if(item.id===null){paths=paths.concat(await listAllInPath(full));}
    else{paths.push(full);}
  }
  return paths;
}
async function deleteFolder(fullPath){
  if(!confirm(`Ordner "${fullPath.split('/').pop()}" und alle Inhalte wirklich löschen?`))return;
  const allFiles=await listAllInPath(fullPath);
  if(allFiles.length){
    const {error}=await _sb.storage.from(FILES_BUCKET).remove(allFiles);
    if(error){alert('Lösch-Fehler: '+error.message);return;}
  }
  // Remove from tree state and refresh parent
  delete _treeState[fullPath];
  const parentPath=fullPath.includes('/')?fullPath.substring(0,fullPath.lastIndexOf('/')):'';
  const items=await _loadFolderItems(parentPath);
  _treeState[parentPath]={expanded:true,items:(_treeState[parentPath]?.items?items:items)};
  _treeState[parentPath].items=items;
  _treeState[parentPath].expanded=true;
  renderFileTree();
}

/* ── Helper ── */
function setFileStatus(name,msg){
  const item=document.querySelector(`.file-item[data-name="${name}"]`);if(!item)return;
  const st=item.querySelector('.file-status');if(!st)return;
  st.style.display=msg?'flex':'none';
  const txt=st.querySelector('.file-status-txt');if(txt)txt.textContent=msg;
}

function guessMime(name){
  const ext=(name.split('.').pop()||'').toLowerCase();
  const map={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',
    svg:'image/svg+xml',pdf:'application/pdf',mp4:'video/mp4',mp3:'audio/mpeg',zip:'application/zip',
    json:'application/json',txt:'text/plain',md:'text/markdown',html:'text/html',
    doc:'application/msword',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ppt:'application/vnd.ms-powerpoint',pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    xls:'application/vnd.ms-excel',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'};
  return map[ext]||'application/octet-stream';
}

/* ── Download single file ── */
async function downloadFile(fullPath){
  const {data,error}=await _sb.storage.from(FILES_BUCKET).createSignedUrl(fullPath,60);
  if(error){alert('Download-Fehler: '+error.message);return;}
  const a=document.createElement('a');a.href=data.signedUrl;a.download=fullPath.split('/').pop();
  document.body.appendChild(a);a.click();document.body.removeChild(a);
}

/* ── Download ALL as ZIP ── */
async function listAllFilesRecursive(path=''){
  const {data}=await _sb.storage.from(FILES_BUCKET).list(path,{limit:1000});
  let files=[];
  for(const item of data||[]){
    if(item.name==='.emptyFolderPlaceholder')continue;
    const full=path?`${path}/${item.name}`:item.name;
    if(item.id===null){files=files.concat(await listAllFilesRecursive(full));}
    else{files.push(full);}
  }
  return files;
}
async function downloadAllAsZip(){
  const btn=document.getElementById('filesZipBtn');
  if(btn){btn.disabled=true;btn.innerHTML='<div class="file-spinner" style="width:12px;height:12px;border-width:1.5px"></div> Erstelle ZIP …';}
  try{
    const allFiles=await listAllFilesRecursive();
    if(!allFiles.length){alert('Keine Dateien vorhanden.');return;}
    const zip=new JSZip();
    for(let i=0;i<allFiles.length;i++){
      const path=allFiles[i];
      if(btn)btn.innerHTML=`<div class="file-spinner" style="width:12px;height:12px;border-width:1.5px"></div> ${i+1}/${allFiles.length} …`;
      const {data,error}=await _sb.storage.from(FILES_BUCKET).download(path);
      if(error){console.warn('Skip '+path+': '+error.message);continue;}
      zip.file(path,data);
    }
    const blob=await zip.generateAsync({type:'blob'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Forschungstagebuch-Dateien.zip';
    document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(a.href);
  }catch(e){alert('ZIP-Fehler: '+e.message);}
  finally{if(btn){btn.disabled=false;btn.innerHTML='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Alles als ZIP';}}
}

/* ── Delete / Overwrite file ── */
async function deleteFile(fullPath){
  if(!confirm(`"${fullPath.split('/').pop()}" wirklich löschen?`))return;
  setFileStatus(fullPath,'Löschen …');
  const {error}=await _sb.storage.from(FILES_BUCKET).remove([fullPath]);
  if(error){setFileStatus(fullPath,'');alert('Lösch-Fehler: '+error.message);return;}
  // Refresh parent folder in tree
  const parentPath=fullPath.includes('/')?fullPath.substring(0,fullPath.lastIndexOf('/')):'';
  const items=await _loadFolderItems(parentPath);
  if(_treeState[parentPath]){_treeState[parentPath].items=items;}
  renderFileTree();
}
async function overwriteFile(fullPath,inputEl){
  const file=inputEl.files[0];if(!file)return;
  if(file.size>FILES_MAX_BYTES){alert('Datei zu groß (max. 50 MB)');return;}
  if(!confirm(`"${fullPath.split('/').pop()}" überschreiben?`))return;
  setFileStatus(fullPath,'Überschreiben …');
  const {error}=await _sb.storage.from(FILES_BUCKET).upload(fullPath,file,{upsert:true});
  if(error){setFileStatus(fullPath,'');alert('Fehler: '+error.message);return;}
  const parentPath=fullPath.includes('/')?fullPath.substring(0,fullPath.lastIndexOf('/')):'';
  const items=await _loadFolderItems(parentPath);
  if(_treeState[parentPath])_treeState[parentPath].items=items;
  renderFileTree();
}

/* ── Core move helper ── */
async function _moveFile(srcPath,destPath){
  setFileStatus(srcPath,'Verschieben …');
  try{
    const {data:blob,error:dlErr}=await _sb.storage.from(FILES_BUCKET).download(srcPath);
    if(dlErr)throw new Error(dlErr.message);
    const fileName=srcPath.split('/').pop();
    const contentType=(blob.type&&blob.type!=='')?blob.type:guessMime(srcPath);
    const file=new File([blob],fileName,{type:contentType});
    const {error:ulErr}=await _sb.storage.from(FILES_BUCKET).upload(destPath,file,{upsert:true,contentType});
    if(ulErr)throw new Error(ulErr.message);
    const {error:delErr}=await _sb.storage.from(FILES_BUCKET).remove([srcPath]);
    if(delErr)throw new Error(delErr.message);
    // Refresh both source and destination parent paths
    const srcParent=srcPath.includes('/')?srcPath.substring(0,srcPath.lastIndexOf('/')):'';
    const dstParent=destPath.includes('/')?destPath.substring(0,destPath.lastIndexOf('/')):'';
    for(const p of new Set([srcParent,dstParent])){
      const items=await _loadFolderItems(p);
      if(_treeState[p]){_treeState[p].items=items;}
      else if(p===''){_treeState['']={expanded:true,items};}
    }
    renderFileTree();
  }catch(e){
    setFileStatus(srcPath,'');
    alert('Verschieben fehlgeschlagen: '+e.message);
  }
}

/* ── Rename ── */
function openRenameModal(fullPath){
  _renameTarget=fullPath;
  document.getElementById('renameInput').value=fullPath.split('/').pop();
  document.getElementById('renameModal').style.display='flex';
  setTimeout(()=>{const inp=document.getElementById('renameInput');inp.focus();inp.select();},50);
}
function closeRenameModal(){document.getElementById('renameModal').style.display='none';_renameTarget=null;}
document.addEventListener('keydown',ev=>{
  if(ev.key==='Escape'&&document.getElementById('renameModal')?.style.display==='flex')closeRenameModal();
});
async function confirmRename(){
  const newBaseName=document.getElementById('renameInput').value.trim();
  if(!newBaseName||!_renameTarget)return;
  const dir=_renameTarget.includes('/')?_renameTarget.substring(0,_renameTarget.lastIndexOf('/')):'';
  const newFullPath=dir?`${dir}/${newBaseName}`:newBaseName;
  if(newFullPath===_renameTarget){closeRenameModal();return;}
  const targetName=_renameTarget;
  closeRenameModal();
  await _moveFile(targetName,newFullPath);
}

/* ── Move via modal ── */
let _moveModalTarget=null;
async function openMoveModal(fullPath){
  _moveModalTarget=fullPath;
  const sel=document.getElementById('moveFolderSelect');
  if(!sel)return;
  sel.innerHTML='<option value="">— Wurzelverzeichnis —</option>';
  await _collectFolderOptions(sel,'',0);
  const currentDir=fullPath.includes('/')?fullPath.substring(0,fullPath.lastIndexOf('/')):'';
  Array.from(sel.options).forEach(opt=>{if(opt.value===currentDir)opt.disabled=true;});
  document.getElementById('moveModal').style.display='flex';
}
async function _collectFolderOptions(selectEl,path,depth){
  const {data}=await _sb.storage.from(FILES_BUCKET).list(path,{limit:500});
  const folders=(data||[]).filter(f=>f.id===null&&f.name!=='.emptyFolderPlaceholder');
  for(const f of folders){
    const fullP=path?`${path}/${f.name}`:f.name;
    const indent='\u00a0\u00a0'.repeat(depth)+(depth?'└ ':'');
    const opt=document.createElement('option');opt.value=fullP;opt.textContent=indent+f.name;
    selectEl.appendChild(opt);
    if(depth<4)await _collectFolderOptions(selectEl,fullP,depth+1);
  }
}
function closeMoveModal(){document.getElementById('moveModal').style.display='none';_moveModalTarget=null;}
document.addEventListener('keydown',ev=>{
  if(ev.key==='Escape'&&document.getElementById('moveModal')?.style.display==='flex')closeMoveModal();
});
async function confirmMove(){
  const destFolder=document.getElementById('moveFolderSelect').value;
  if(!_moveModalTarget)return;
  const fileName=_moveModalTarget.split('/').pop();
  const newFullPath=destFolder?`${destFolder}/${fileName}`:fileName;
  if(newFullPath===_moveModalTarget){closeMoveModal();return;}
  const src=_moveModalTarget;
  closeMoveModal();
  await _moveFile(src,newFullPath);
}


/* ════════════════════════════════════════════════════
   NOTIZEN — Supabase notes Tabelle
   SQL: CREATE TABLE notes (id INT PRIMARY KEY DEFAULT 1,
        content TEXT NOT NULL DEFAULT '', updated_at TIMESTAMPTZ DEFAULT NOW());
        INSERT INTO notes (id,content) VALUES (1,'') ON CONFLICT DO NOTHING;
   ════════════════════════════════════════════════════ */
let _noteSaveTimer=null;
let _noteLoaded=false;

async function loadNote(){
  if(_noteLoaded)return; // already loaded this session
  const ed=document.getElementById('notesEditor');
  if(!ed)return;
  ed.innerHTML='<span style="color:var(--text3);font-size:13px">Notizen laden …</span>';

  const { data, error } = await _sb.from('notes').select('content').eq('id',1).single();
  if(error&&error.code!=='PGRST116'){
    ed.innerHTML=''; setNotesStatus('Ladefehler','error'); return;
  }
  ed.innerHTML = (data?.content)||'';
  _noteLoaded=true;
  setNotesStatus('Gespeichert','ok');
}

function onNotesInput(){
  setNotesStatus('Ungespeicherte Änderungen','pending');
  clearTimeout(_noteSaveTimer);
  _noteSaveTimer=setTimeout(saveNote, 1500);
}

async function saveNote(){
  const ed=document.getElementById('notesEditor');
  if(!ed)return;
  const content=ed.innerHTML||'';
  setNotesStatus('Speichern …','saving');
  const { error } = await _sb.from('notes').upsert({id:1,content,updated_at:new Date().toISOString()},{onConflict:'id'});
  if(error){setNotesStatus('Fehler beim Speichern','error');return;}
  setNotesStatus('Gespeichert','ok');
}

function setNotesStatus(msg, state){
  const txt=document.getElementById('notesSaveText');
  const ico=document.getElementById('notesSaveIcon');
  if(txt)txt.textContent=msg;
  if(ico){
    ico.style.opacity=state==='ok'?'1':'0';
    ico.style.color=state==='error'?'#f87171':'var(--gold)';
  }
  const wrap=document.querySelector('.notes-save-status');
  if(wrap)wrap.style.color=state==='error'?'#f87171':state==='saving'?'var(--gold)':'var(--text3)';
}

function onNotesFocus(){
  // Make RTB aware we're in notes mode
  activeRTBEl=null;
}
function onNotesBlur(){
  // Save on blur too
  clearTimeout(_noteSaveTimer);
  const ed=document.getElementById('notesEditor');
  if(ed&&ed.innerHTML!==undefined&&_noteLoaded){
    saveNote();
  }
}

function scheduleNoteSave(){
  if(adminScreen!=='notizen'||!_noteLoaded)return;
  clearTimeout(_noteSaveTimer);
  _noteSaveTimer=setTimeout(saveNote,1500);
}

/* ════════ BOOT ════════ */
document.addEventListener('DOMContentLoaded',async ()=>{
  initCvAreaObserver();
  window.addEventListener('resize',()=>{
    if(document.getElementById('editorView').classList.contains('open')&&edEntry){cvScale=1;fitSlide();}
    if(document.getElementById('viewerOverlay').classList.contains('open')&&vEntry)vFit();
  });
  if(window.visualViewport){
    window.visualViewport.addEventListener('resize',()=>{
      if(document.getElementById('viewerOverlay').classList.contains('open')&&vEntry)vFit();
    });
  }

  /* Supabase-Session nach Seiten-Reload wiederherstellen */
  dbShow('Verbinden …');
  const { data: { session } } = await _sb.auth.getSession();
  if(session){
    /* Rolle aus E-Mail ableiten */
    const email = session.user.email || '';
    const role = Object.entries(ROLE_EMAIL).find(([,v])=>v===email)?.[0];
    if(role){
      curRole = role;
      dbShow('Einträge laden …');
      await loadFromDB();
      document.getElementById('dbLoading').style.display='none';
      showView(role+'View');
      refreshAll();
      return;
    }
  }
  document.getElementById('dbLoading').style.display='none';
  showView('loginView');
});