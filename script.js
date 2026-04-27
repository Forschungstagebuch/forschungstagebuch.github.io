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
  'wb-h':    {w:12000,h:540,  label:'Whiteboard Horizontal (∞ →)', wb:'h'},
  'wb-v':    {w:960,  h:12000,label:'Whiteboard Vertikal (∞ ↕)',   wb:'v'},
  'wb-inf':  {w:12000,h:12000,label:'Whiteboard Unbegrenzt (∞)',   wb:'both'},
  'wb-h':    {w:12000, h:540,  label:'Whiteboard Horizontal (∞ →)', wb:'h'},
  'wb-v':    {w:960,  h:12000, label:'Whiteboard Vertikal (∞ ↕)',  wb:'v'},
  'wb-inf':  {w:12000, h:12000,label:'Whiteboard Unbegrenzt (∞)', wb:'both'},
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

/* ── SYMBOL ELEMENT DEFAULTS ── */
const SYMD = {
  'sym-rect':        {w:160,h:80,  label:'Rechteck'},
  'sym-rounded-rect':{w:160,h:80,  label:'Abg. Rechteck'},
  'sym-circle':      {w:100,h:100, label:'Kreis'},
  'sym-ellipse':     {w:160,h:90,  label:'Ellipse'},
  'sym-triangle':    {w:120,h:100, label:'Dreieck'},
  'sym-right-tri':   {w:120,h:100, label:'Rechtes Dreieck'},
  'sym-diamond':     {w:140,h:100, label:'Raute'},
  'sym-hexagon':     {w:140,h:100, label:'Sechseck'},
  'sym-parallelogram':{w:160,h:80, label:'Parallelogramm'},
  'sym-star':        {w:110,h:110, label:'Stern'},
  'sym-cylinder':    {w:120,h:110, label:'Zylinder'},
};
const ARROW_END_TYPES = ['none','arrow','filled','open-dot','filled-dot','open-diamond','filled-diamond','bar'];
const ARROW_END_LABELS = {'none':'Kein','arrow':'Pfeil (offen)','filled':'Pfeil (gefüllt)','open-dot':'Kreis (offen)','filled-dot':'Kreis (gefüllt)','open-diamond':'Raute (offen)','filled-diamond':'Raute (gefüllt)','bar':'Balken |'};

/* ── SORT STATE ── */
var _sortL = 'oldest', _sortA = 'oldest';
function toggleSortL(){_sortL=(_sortL==='oldest'?'newest':'oldest');renderL();}
function toggleSortA(){_sortA=(_sortA==='oldest'?'newest':'oldest');renderA();}
function setSortL(v){_sortL=v;renderL();}
function setSortA(v){_sortA=v;renderA();}


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
let _multiSel=new Set(); // IDs of shift-selected elements
// Unified move state
let MS=null; // {type:'move'|'resize'|'drag-pt', elId, sx,sy, data:{}}
let cvScale=1, cvOffX=0, cvOffY=0;
let vScale=1;
let activeRTBEl=null; // element id for rich text focus
let adminScreen='journal'; // 'journal' | 'dateien' | 'notizen' | 'backups' | 'einstellungen'

/* ── Settings State ── */
let _settings={default_qs_phase:'Q2'};
let _settingsLoaded=false;

/* ── Editor Change Tracking ── */
let _origSlidesSnap=null; // JSON snapshot of edEntry.slides at editor open
let _origMeta=null;       // {titel,datum,q,tags} at editor open

/* ── Undo / Redo ── */
let _undoStack=[], _redoStack=[];
const UNDO_MAX=60;
function _snapElements(action){const sl=curSlide();return sl?JSON.stringify({elements:sl.elements,slideBg:sl.slideBg,action:action||''}):null;}
function pushHistory(action){
  const snap=_snapElements(action||''); if(!snap)return;
  _undoStack.push(snap);
  if(_undoStack.length>UNDO_MAX)_undoStack.shift();
  _redoStack=[];
  _updateHistBtns();
  _spRefresh();
}
function _restoreElements(snap){
  const sl=curSlide(); if(!sl||!snap)return;
  const data=JSON.parse(snap);
  if(Array.isArray(data)){sl.elements=data;}
  else{sl.elements=data.elements||[];if(data.slideBg!==undefined){sl.slideBg=data.slideBg;}}
  deselectAll(); renderSlide(); applySlideSize(); renderSpanel(); _updateHistBtns();
}
function edUndo(){
  if(!_undoStack.length)return;
  const cur=_snapElements('Rückgängig gemacht'); if(cur)_redoStack.push(cur);
  _restoreElements(_undoStack.pop());
  _closeHistDrops();
}
function edRedo(){
  if(!_redoStack.length)return;
  const cur=_snapElements('Wiederholt'); if(cur)_undoStack.push(cur);
  _restoreElements(_redoStack.pop());
  _closeHistDrops();
}
function _closeHistDrops(){
  document.querySelectorAll('.ed-hist-wrap').forEach(w=>w.classList.remove('open'));
}
let _histDropCloseTimer=null;
function _scheduleCloseHistDrops(){
  clearTimeout(_histDropCloseTimer);
  _histDropCloseTimer=setTimeout(_closeHistDrops,140);
}
function _cancelCloseHistDrops(){
  clearTimeout(_histDropCloseTimer);
}
function toggleHistDrop(openId, closeOtherId){
  const wrap=document.getElementById(openId);
  const other=document.getElementById(closeOtherId);
  if(!wrap)return;
  const isDisabled=wrap.querySelector('.ed-hist-btn')?.disabled;
  if(other)other.classList.remove('open');
  if(isDisabled){wrap.classList.remove('open');return;}
  wrap.classList.toggle('open');
  // Also trigger single undo/redo when clicking the button area directly
}
function openHistDrop(openId, closeOtherId){
  _cancelCloseHistDrops();
  const wrap=document.getElementById(openId);
  const other=document.getElementById(closeOtherId);
  if(!wrap)return;
  const isDisabled=wrap.querySelector('.ed-hist-btn')?.disabled;
  if(other)other.classList.remove('open');
  if(isDisabled){wrap.classList.remove('open');return;}
  wrap.classList.add('open');
}
// Close dropdown when clicking outside
document.addEventListener('click',function(e){
  if(!e.target.closest('.ed-hist-wrap'))_closeHistDrops();
});
function _histLabel(snapStr){
  try{
    const data=JSON.parse(snapStr);
    if(data.action)return data.action;
    // Fallback: generic label
    const els=Array.isArray(data)?data:data.elements||[];
    return els.length+' Element'+(els.length!==1?'e':'');
  }catch(e){return 'Änderung';}
}
function _histIcon(action){
  if(!action)return'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/></svg>';
  if(action.includes('Text'))return'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h10M4 17h7"/></svg>';
  if(action.includes('hinzugefügt'))return'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
  if(action.includes('gelöscht')||action.includes('geleert'))return'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>';
  if(action.includes('verschoben'))return'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/></svg>';
  if(action.includes('skaliert')||action.includes('Größe'))return'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>';
  if(action.includes('Farbe')||action.includes('Stil')||action.includes('format'))return'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="9" stroke-dasharray="2 2"/></svg>';
  if(action.includes('Hintergrund')||action.includes('Folie'))return'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/></svg>';
  return'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/></svg>';
}
function _populateHistDrop(dropId,stack,isUndo){
  const drop=document.getElementById(dropId); if(!drop)return;
  const items=stack.slice().reverse().slice(0,14);
  if(!items.length){drop.innerHTML='<div class="ed-hist-empty">Nichts zum '+(isUndo?'Rückgängig':'Wiederholen')+'</div>';return;}
  drop.innerHTML=items.map((snap,i)=>{
    const lbl=_histLabel(snap);
    const ico=_histIcon(lbl);
    const fn=isUndo?'edUndoTo':'edRedoTo';
    const n=i+1;
    return `<div class="ed-hist-drop-item" onmousedown="event.preventDefault();event.stopPropagation();${fn}(${n})">${ico}<span class="ed-hist-drop-lbl">${lbl}</span><span class="ed-hist-drop-n">${n}</span></div>`;
  }).join('');
}
function _updateHistBtns(){
  const u=document.getElementById('edUndoBtn'), r=document.getElementById('edRedoBtn');
  if(u)u.disabled=!_undoStack.length;
  if(r)r.disabled=!_redoStack.length;
  _populateHistDrop('edUndoDrop',_undoStack,true);
  _populateHistDrop('edRedoDrop',_redoStack,false);
}
function edUndoTo(n){
  if(!_undoStack.length)return;
  n=Math.min(n,_undoStack.length);
  const cur=_snapElements('Rückgängig gemacht'); if(cur)_redoStack.push(cur);
  for(let i=1;i<n;i++){const c=_undoStack.pop();if(c)_redoStack.push(c);}
  _restoreElements(_undoStack.pop());
  _closeHistDrops();
}
function edRedoTo(n){
  if(!_redoStack.length)return;
  n=Math.min(n,_redoStack.length);
  const cur=_snapElements('Wiederholt'); if(cur)_undoStack.push(cur);
  for(let i=1;i<n;i++){const c=_redoStack.pop();if(c)_undoStack.push(c);}
  _restoreElements(_redoStack.pop());
  _closeHistDrops();
}
function _clearHistory(){_undoStack=[];_redoStack=[];_updateHistBtns();}
/* Debounced push for continuous inputs (format panel sliders/numbers) */
let _histDebTimer=null,_histDebAction='';
function pushHistoryDebounced(action){
  clearTimeout(_histDebTimer);
  if(action)_histDebAction=action;
  _histDebTimer=setTimeout(()=>{pushHistory(_histDebAction);_histDebAction='';},400);
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
  await loadSettings();
  document.getElementById('dbLoading').style.display = 'none';
  showView(role + 'View');
  // Open topbar and populate QS on login
  const sfx=role==='lehrer'?'L':'A';
  const bar=document.getElementById('topbar-'+sfx);
  if(bar){bar.classList.add('open');}
  buildQS(role);
  refreshAll();
}

async function logout(){
  await _sb.auth.signOut();
  curRole = null;
  _data = [];
  adminScreen='journal';
  _noteLoaded=false;
  _treeState={};
  _settingsLoaded=false;
  _settings={default_qs_phase:'Q2'};
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
function getList(q,s,sort){
  const srt=sort||'oldest';
  return load().filter(e=>e.q===q&&matches(e,s)).sort((a,b)=>{
    const da=new Date(a.datum), db=new Date(b.datum);
    const dateDiff = srt==='newest' ? db-da : da-db;
    if(dateDiff!==0) return dateDiff;
    // Same date: tiebreak by pos (ascending always)
    return (a.pos??999)-(b.pos??999);
  });
}
function slSz(sl){return FMT[sl?.format||'16:9']||FMT['16:9'];}

/* ════════ QUARTER TABS ════════ */
function buildQTabs(mode){
  const all=load(), el=document.getElementById(mode==='lehrer'?'qtL':'qtA');
  if(!el)return;
  el.innerHTML=['Q1','Q2','Q3','Q4'].map(q=>{
    const has=all.some(e=>e.q===q), act=activeQ[mode]===q?'act':'';
    return `<button class="q-tab ${act}" onclick="setQ('${mode}','${q}')">${q}${has?'<span class="q-dot"></span>':''}</button>`;
  }).join('');
}
function setQ(mode,q){activeQ[mode]=q;buildQTabs(mode);if(mode==='lehrer')renderL();else renderA();}


/* ════════ STORAGE KEY SANITIZATION ════════ */
function sanitizeStorageKey(path){
  return path
    .replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue')
    .replace(/Ä/g,'Ae').replace(/Ö/g,'Oe').replace(/Ü/g,'Ue')
    .replace(/ß/g,'ss').replace(/é|è|ê/g,'e').replace(/à|â/g,'a')
    .replace(/\s+/g,'-')
    .replace(/[^a-zA-Z0-9\/\-!*()\$._]/g,'_');
}

/* ════════ QUICK SELECTION DROPDOWN ════════ */
const _qsOpen={lehrer:true,admin:true}; // open by default
const _qsPhaseOpen={lehrer:'Q1',admin:'Q1'}; // Q1 expanded by default

function _qsSfx(mode){return mode==='lehrer'?'L':'A';}

function buildQS(mode){
  const inner=document.getElementById('qs-inner-'+_qsSfx(mode));
  if(!inner)return;
  const all=load();
  const fmt=d=>new Date(d).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'});
  inner.innerHTML=['Q1','Q2','Q3','Q4'].map(q=>{
    const entries=all.filter(e=>e.q===q).sort((a,b)=>new Date(a.datum)-new Date(b.datum));
    const isOpen=_qsPhaseOpen[mode]===q;
    let dateStr='–';
    if(entries.length){
      const dates=entries.map(e=>new Date(e.datum)).filter(d=>!isNaN(d));
      if(dates.length){
        const mn=new Date(Math.min(...dates.map(d=>d.getTime())));
        const mx=new Date(Math.max(...dates.map(d=>d.getTime())));
        dateStr=mn.getTime()===mx.getTime()?fmt(mn):`${fmt(mn)}–${fmt(mx)}`;
      }
    }
    const listHTML=isOpen?`<div class="qs-dd-list">${
      entries.length?entries.map(e=>{
        const ds=e.datum?fmt(new Date(e.datum)):'–';
        return `<div class="qs-dd-entry" onclick="qsOpenEntry('${mode}',${e.id})"><span class="qs-dd-entry-date">${ds}</span><span class="qs-dd-entry-title">${esc(e.titel||'Ohne Titel')}</span></div>`;
      }).join(''):'<div class="qs-dd-empty">Keine Einträge</div>'
    }</div>`:'';
    const chevRot=isOpen?'rotate(180deg)':'';
    return `<div class="qs-dd-phase"><div class="qs-dd-phase-hdr${isOpen?' open':''}" onclick="toggleQSPhase('${mode}','${q}')"><div class="qs-dd-q">${q}<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="transition:transform .2s;transform:${chevRot}"><polyline points="6 9 12 15 18 9"/></svg></div><div class="qs-dd-date">${dateStr}</div></div>${listHTML}</div>`;
  }).join('');
}

function toggleTopbar(mode){
  _qsOpen[mode]=!_qsOpen[mode];
  const sfx=_qsSfx(mode);
  const bar=document.getElementById('topbar-'+sfx);
  if(bar)bar.classList.toggle('open',_qsOpen[mode]);
  if(_qsOpen[mode])buildQS(mode);
}
function toggleQSPhase(mode,q){
  _qsPhaseOpen[mode]=_qsPhaseOpen[mode]===q?null:q;
  buildQS(mode);
}
function qsOpenEntry(mode,id){
  // Open entry — keep topbar open so user can navigate between entries
  if(mode==='lehrer')openViewer(id);
  else openEditor(id);
}

/* ════════ ER SVG RENDERER ════════ */
function erShapeSVG(type,w,h,stroke,fill,sw,dashed){
  const s=stroke||'#e8a030', f=fill||'transparent', p=Math.max(0.5,sw||2);
  const da=dashed?`stroke-dasharray="${p*2.5} ${p*2}"`:'';
  const pad=p/2;
  switch(type){
    case 'er-entity':     return `<rect x="${pad}" y="${pad}" width="${w-p}" height="${h-p}" fill="${f}" stroke="${s}" stroke-width="${p}" rx="2" ${da}/>`;
    case 'er-weak-entity':{const m=6;return `<rect x="${pad}" y="${pad}" width="${w-p}" height="${h-p}" fill="${f}" stroke="${s}" stroke-width="${p}" rx="2"/><rect x="${m}" y="${m}" width="${w-m*2}" height="${h-m*2}" fill="none" stroke="${s}" stroke-width="${Math.max(1,p-0.5)}" rx="1"/>`;}
    case 'er-relation':   {const cx=w/2,cy=h/2;return `<polygon points="${cx},${pad} ${w-pad},${cy} ${cx},${h-pad} ${pad},${cy}" fill="${f}" stroke="${s}" stroke-width="${p}" stroke-linejoin="round" ${da}/>`;}
    case 'er-weak-relation':{const cx=w/2,cy=h/2,off=8;return `<polygon points="${cx},${pad} ${w-pad},${cy} ${cx},${h-pad} ${pad},${cy}" fill="${f}" stroke="${s}" stroke-width="${p}" stroke-linejoin="round"/><polygon points="${cx},${off} ${w-off},${cy} ${cx},${h-off} ${off},${cy}" fill="none" stroke="${s}" stroke-width="${Math.max(1,p-0.5)}" stroke-linejoin="round"/>`;}
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
function updateSymSVG(el){
  const dom=document.getElementById('sel_'+el.id);if(!dom)return;
  const svg=dom.querySelector('svg.sym-s');if(!svg)return;
  svg.setAttribute('viewBox',`0 0 ${el.w} ${el.h}`);
  const symS=el.symStyle||{};
  svg.innerHTML=symShapeSVG(el.type,el.w,el.h,symS.stroke,symS.fill,symS.strokeWidth,symS.dashed);
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
  const moving=document.body.classList.contains('er-element-moving');
  const vis=wrap.querySelector('svg.er-line-vis');
  if(vis){
    vis.setAttribute('viewBox',`0 0 ${b.w} ${b.h}`);
    const sw=erS.strokeWidth||2; const da=erS.dashed?`stroke-dasharray="${sw*2.5} ${sw*2}"`:'';
    // Use butt linecap during entity move to prevent round-cap dots rendering at endpoints
    const cap=moving?'butt':'round';
    vis.innerHTML=`<line x1="${sx1}" y1="${sy1}" x2="${sx2}" y2="${sy2}" stroke="${erS.stroke||'#888077'}" stroke-width="${sw}" stroke-linecap="${cap}" ${da}/>`;
  }
  const hit=wrap.querySelector('svg.er-line-hit');
  if(hit){
    hit.setAttribute('viewBox',`0 0 ${b.w} ${b.h}`);
    const hl=hit.querySelector('line');
    if(hl){hl.setAttribute('x1',sx1);hl.setAttribute('y1',sy1);hl.setAttribute('x2',sx2);hl.setAttribute('y2',sy2);}
  }
  // Never update er-line-pt positions during entity/resize move — prevents any
  // repaint-triggered rendering of the handles at the line's attachment points
  if(!moving){
    const pts=wrap.querySelectorAll('.er-line-pt');
    pts.forEach(p=>{
      const pn=+p.dataset.pt;
      p.style.left=(pn===1?sx1:sx2)+'px'; p.style.top=(pn===1?sy1:sy2)+'px';
    });
  }
}
function mkSVGEl(tag){return document.createElementNS('http://www.w3.org/2000/svg',tag);}
/* ════════ SYMBOL SHAPES SVG ════════ */
function _ngonPts(n,cx,cy,r,a0){const p=[];for(let i=0;i<n;i++){const a=a0+(i*2*Math.PI/n);p.push(`${(cx+r*Math.cos(a)).toFixed(2)},${(cy+r*Math.sin(a)).toFixed(2)}`);}return p.join(' ');}
function _starPts(n,cx,cy,ro,ri,a0){const p=[];for(let i=0;i<n*2;i++){const a=a0+(i*Math.PI/n);const r=i%2===0?ro:ri;p.push(`${(cx+r*Math.cos(a)).toFixed(2)},${(cy+r*Math.sin(a)).toFixed(2)}`);}return p.join(' ');}
function symShapeSVG(type,w,h,stroke,fill,sw,dashed){
  const s=stroke||'#e8a030',f=fill||'rgba(232,160,48,.09)',p=Math.max(0.5,sw||2);
  const da=dashed?`stroke-dasharray="${p*2.5} ${p*2}"`:'';
  const pad=p/2,cx=w/2,cy=h/2;
  switch(type){
    case 'sym-rect':return `<rect x="${pad}" y="${pad}" width="${w-p}" height="${h-p}" fill="${f}" stroke="${s}" stroke-width="${p}" ${da}/>`;
    case 'sym-rounded-rect':{const rx=Math.min(w,h)*0.14;return `<rect x="${pad}" y="${pad}" width="${w-p}" height="${h-p}" fill="${f}" stroke="${s}" stroke-width="${p}" rx="${rx}" ${da}/>`;}
    case 'sym-circle':{const r=Math.min(w,h)/2-pad;return `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r}" fill="${f}" stroke="${s}" stroke-width="${p}" ${da}/>`;}
    case 'sym-ellipse':return `<ellipse cx="${cx}" cy="${cy}" rx="${(w-p)/2}" ry="${(h-p)/2}" fill="${f}" stroke="${s}" stroke-width="${p}" ${da}/>`;
    case 'sym-triangle':return `<polygon points="${cx},${pad} ${w-pad},${h-pad} ${pad},${h-pad}" fill="${f}" stroke="${s}" stroke-width="${p}" stroke-linejoin="round" ${da}/>`;
    case 'sym-right-tri':return `<polygon points="${pad},${pad} ${w-pad},${h-pad} ${pad},${h-pad}" fill="${f}" stroke="${s}" stroke-width="${p}" stroke-linejoin="round" ${da}/>`;
    case 'sym-diamond':return `<polygon points="${cx},${pad} ${w-pad},${cy} ${cx},${h-pad} ${pad},${cy}" fill="${f}" stroke="${s}" stroke-width="${p}" stroke-linejoin="round" ${da}/>`;
    case 'sym-hexagon':{const pts=_ngonPts(6,cx,cy,Math.min(cx,cy)-pad,0);return `<polygon points="${pts}" fill="${f}" stroke="${s}" stroke-width="${p}" stroke-linejoin="round" ${da}/>`;}
    case 'sym-parallelogram':{const off=w*0.2;return `<polygon points="${off+pad},${pad} ${w-pad},${pad} ${w-off-pad},${h-pad} ${pad},${h-pad}" fill="${f}" stroke="${s}" stroke-width="${p}" stroke-linejoin="round" ${da}/>`;}
    case 'sym-star':{const ro=Math.min(cx,cy)-pad,ri=ro*0.42;const pts=_starPts(5,cx,cy,ro,ri,-Math.PI/2);return `<polygon points="${pts}" fill="${f}" stroke="${s}" stroke-width="${p}" stroke-linejoin="round" ${da}/>`;}
    case 'sym-cylinder':{const ry=h*0.14;return `<ellipse cx="${cx}" cy="${pad+ry}" rx="${(w-p)/2}" ry="${ry}" fill="${f}" stroke="${s}" stroke-width="${p}"/><rect x="${pad}" y="${pad+ry}" width="${w-p}" height="${h-p-ry*2}" fill="${f}" stroke="none"/><line x1="${pad}" y1="${pad+ry}" x2="${pad}" y2="${h-pad-ry}" stroke="${s}" stroke-width="${p}"/><line x1="${w-pad}" y1="${pad+ry}" x2="${w-pad}" y2="${h-pad-ry}" stroke="${s}" stroke-width="${p}"/><ellipse cx="${cx}" cy="${h-pad-ry}" rx="${(w-p)/2}" ry="${ry}" fill="${f}" stroke="${s}" stroke-width="${p}"/>`;}
    default:return '';
  }
}

/* ════════ SYMBOL ARROW ════════ */
const ARR_PAD=24;
/* No <marker>/url(#id) — Chrome resolves url(#id) against the page URL which breaks
   on GitHub Pages. Instead we draw arrowheads as plain geometry at the endpoints. */
function _arrowHead(type, px, py, ang, sz, col, sw){
  /* Rotated offset helper: from tip (px,py), displacement (dx along axis, dy perp) */
  const R=(dx,dy)=>[px+Math.cos(ang)*dx-Math.sin(ang)*dy,
                    py+Math.sin(ang)*dx+Math.cos(ang)*dy];
  const s=sz, hs=s*0.5, lw=sw;
  switch(type){
    case 'filled':{
      const [ax,ay]=R(0,0),[bx,by]=R(-s,-hs),[cx,cy]=R(-s,hs);
      return `<polygon points="${ax},${ay} ${bx},${by} ${cx},${cy}" fill="${col}" stroke="none"/>`;
    }
    case 'arrow':{
      const [ax,ay]=R(0,0),[bx,by]=R(-s,-hs),[cx,cy]=R(-s,hs);
      return `<polyline points="${bx},${by} ${ax},${ay} ${cx},${cy}" fill="none" stroke="${col}" stroke-width="${lw}" stroke-linejoin="round" stroke-linecap="round"/>`;
    }
    case 'open-dot':{
      const r=hs-lw*0.3,[cx2,cy2]=R(-hs,0);
      return `<circle cx="${cx2}" cy="${cy2}" r="${r}" fill="none" stroke="${col}" stroke-width="${lw}"/>`;
    }
    case 'filled-dot':{
      const r=hs-lw*0.3,[cx2,cy2]=R(-hs,0);
      return `<circle cx="${cx2}" cy="${cy2}" r="${r}" fill="${col}" stroke="none"/>`;
    }
    case 'open-diamond':{
      const [ax,ay]=R(0,0),[bx,by]=R(-hs,-hs),[cx,cy]=R(-s,0),[dx,dy]=R(-hs,hs);
      return `<polygon points="${ax},${ay} ${bx},${by} ${cx},${cy} ${dx},${dy}" fill="none" stroke="${col}" stroke-width="${lw}" stroke-linejoin="round"/>`;
    }
    case 'filled-diamond':{
      const [ax,ay]=R(0,0),[bx,by]=R(-hs,-hs),[cx,cy]=R(-s,0),[dx,dy]=R(-hs,hs);
      return `<polygon points="${ax},${ay} ${bx},${by} ${cx},${cy} ${dx},${dy}" fill="${col}" stroke="none"/>`;
    }
    case 'bar':{
      const [ax,ay]=R(0,-hs),[bx,by]=R(0,hs);
      return `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="${col}" stroke-width="${lw}" stroke-linecap="round"/>`;
    }
    default: return '';
  }
}
/* How much to pull back the line endpoint so the shaft doesn't overdraw the head */
function _arrowShrink(type,sz,sw){
  if(type==='none') return 0;
  if(type==='bar')  return sw+2;
  if(type.includes('dot')) return sz*0.5;
  return sz*0.8;
}
/* Build a fresh SVG element for arrow vis — uses geometry-based arrowheads,
   no <marker>/url(#id) so it works correctly in Chrome on GitHub Pages. */
function _buildArrowSVGEl(el, b){
  const svgStr = _arrowLineSVG(el);
  const div = document.createElement('div');
  div.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="er-line-vis" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible" viewBox="0 0 ${b.w} ${b.h}">${svgStr}</svg>`;
  return div.firstChild;
}
function _arrowLineSVG(el){
  const b=arrBounds(el),arS=el.arrowStyle||{};
  const sx1=el.x1-b.lx,sy1=el.y1-b.ly,sx2=el.x2-b.lx,sy2=el.y2-b.ly;
  const sw=arS.strokeWidth||2,col=arS.stroke||'#e8a030',sz=arS.markerSize||9;
  const da=arS.dashed?`stroke-dasharray="${sw*2.5} ${sw*2}"`:'';
  const sType=arS.startType||'none',eType=arS.endType||'filled';
  const ang=Math.atan2(sy2-sy1,sx2-sx1);
  const shrinkS=_arrowShrink(sType,sz,sw),shrinkE=_arrowShrink(eType,sz,sw);
  const lx1=sx1+Math.cos(ang)*shrinkS,ly1=sy1+Math.sin(ang)*shrinkS;
  const lx2=sx2-Math.cos(ang)*shrinkE,ly2=sy2-Math.sin(ang)*shrinkE;
  const line=`<line x1="${lx1}" y1="${ly1}" x2="${lx2}" y2="${ly2}" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" ${da}/>`;
  const startHead=sType!=='none'?_arrowHead(sType,sx1,sy1,ang+Math.PI,sz,col,sw):'';
  const endHead  =eType!=='none'?_arrowHead(eType,sx2,sy2,ang,        sz,col,sw):'';
  return `${line}${startHead}${endHead}`;
}
function arrBounds(el){
  const lx=Math.min(el.x1,el.x2),ly=Math.min(el.y1,el.y2);
  const rw=Math.abs(el.x2-el.x1)+2*ARR_PAD,rh=Math.abs(el.y2-el.y1)+2*ARR_PAD;
  return{lx:lx-ARR_PAD,ly:ly-ARR_PAD,w:Math.max(2*ARR_PAD,rw),h:Math.max(2*ARR_PAD,rh)};
}
function buildArrowDom(el){
  const b=arrBounds(el);
  const wrap=document.createElement('div');
  wrap.className='er-line-el sym-arrow-el';wrap.id='sel_'+el.id;wrap.dataset.elid=el.id;
  wrap.style.cssText=`left:${b.lx}px;top:${b.ly}px;width:${b.w}px;height:${b.h}px;z-index:${el.z||5}`;
  const svgVis=_buildArrowSVGEl(el,b);
  wrap.appendChild(svgVis);
  const svgHit=mkSVGEl('svg');svgHit.classList.add('er-line-hit');
  svgHit.style.cssText='position:absolute;inset:0;width:100%;height:100%;overflow:visible';
  svgHit.setAttribute('viewBox',`0 0 ${b.w} ${b.h}`);
  const sx1=el.x1-b.lx,sy1=el.y1-b.ly,sx2=el.x2-b.lx,sy2=el.y2-b.ly;
  const hitLine=mkSVGEl('line');
  hitLine.setAttribute('x1',sx1);hitLine.setAttribute('y1',sy1);
  hitLine.setAttribute('x2',sx2);hitLine.setAttribute('y2',sy2);
  hitLine.setAttribute('stroke','transparent');hitLine.setAttribute('stroke-width','20');
  hitLine.setAttribute('stroke-linecap','round');hitLine.style.cursor='move';
  hitLine.addEventListener('mousedown',ev=>{ev.stopPropagation();selectLine(el.id);startMoveArrow(el.id,ev);});
  svgHit.appendChild(hitLine);wrap.appendChild(svgHit);
  [1,2].forEach(pn=>{
    const pt=document.createElement('div');pt.className='er-line-pt';pt.dataset.pt=pn;
    const px=pn===1?sx1:sx2,py=pn===1?sy1:sy2;
    pt.style.left=px+'px';pt.style.top=py+'px';
    pt.addEventListener('mousedown',ev=>{ev.preventDefault();ev.stopPropagation();startDragArrowPt(el.id,pn,ev);});
    wrap.appendChild(pt);
  });
  return wrap;
}
function updateArrowDom(el){
  const b=arrBounds(el);
  const wrap=document.getElementById('sel_'+el.id);if(!wrap)return;
  wrap.style.left=b.lx+'px';wrap.style.top=b.ly+'px';wrap.style.width=b.w+'px';wrap.style.height=b.h+'px';
  const sx1=el.x1-b.lx,sy1=el.y1-b.ly,sx2=el.x2-b.lx,sy2=el.y2-b.ly;
  const vis=wrap.querySelector('svg.er-line-vis');
  if(vis){const newVis=_buildArrowSVGEl(el,b);vis.parentNode.replaceChild(newVis,vis);}
  const hit=wrap.querySelector('svg.er-line-hit');
  if(hit){hit.setAttribute('viewBox',`0 0 ${b.w} ${b.h}`);const hl=hit.querySelector('line');if(hl){hl.setAttribute('x1',sx1);hl.setAttribute('y1',sy1);hl.setAttribute('x2',sx2);hl.setAttribute('y2',sy2);}}
  if(!document.body.classList.contains('er-element-moving')){
    wrap.querySelectorAll('.er-line-pt').forEach(p=>{const pn=+p.dataset.pt;p.style.left=(pn===1?sx1:sx2)+'px';p.style.top=(pn===1?sy1:sy2)+'px';});
  }
}
function startMoveArrow(elId,ev){
  const el=getEl(elId);if(!el)return;
  const snap=_snapElements('Pfeil verschoben');
  MS={type:'move-arrow',elId,sx:ev.clientX,sy:ev.clientY,data:{x1:el.x1,y1:el.y1,x2:el.x2,y2:el.y2},snap};
  ev.preventDefault();
}
function startDragArrowPt(lineId,ptNum,ev){
  const el=getEl(lineId);if(!el)return;
  const snap=_snapElements('Pfeil-Endpunkt verschoben');
  MS={type:'drag-arrow-pt',elId:lineId,ptNum,sx:ev.clientX,sy:ev.clientY,data:{x1:el.x1,y1:el.y1,x2:el.x2,y2:el.y2},snap};
  ev.preventDefault();
  showConnDots(lineId);
}

/* ════════ WHITEBOARD HELPERS ════════ */
function isWB(sl){return sl&&FMT[sl.format||'16:9']?.wb;}
function wbBounds(slide){
  const els=(slide||{}).elements||[];
  if(!els.length)return{x:0,y:0,w:960,h:540};
  let mnX=Infinity,mnY=Infinity,mxX=-Infinity,mxY=-Infinity;
  els.forEach(el=>{
    if(el.type==='er-line'||el.type==='sym-arrow'){
      mnX=Math.min(mnX,el.x1,el.x2);mnY=Math.min(mnY,el.y1,el.y2);
      mxX=Math.max(mxX,el.x1,el.x2);mxY=Math.max(mxY,el.y1,el.y2);
    }else{
      mnX=Math.min(mnX,el.x||0);mnY=Math.min(mnY,el.y||0);
      mxX=Math.max(mxX,(el.x||0)+(el.w||0));mxY=Math.max(mxY,(el.y||0)+(el.h||0));
    }
  });
  if(!isFinite(mnX))return{x:0,y:0,w:960,h:540};
  const pad=60;
  return{x:Math.max(0,mnX-pad),y:Math.max(0,mnY-pad),w:mxX-mnX+pad*2,h:mxY-mnY+pad*2};
}


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
      } else if(el.type==='sql'){
        // Use buildInnerContent so thumbnail is pixel-identical to editor/viewer
        const _tmpSql=document.createElement('div');
        _tmpSql.style.cssText=`width:${ew}px;height:${eh}px;overflow:hidden;box-sizing:border-box;border-radius:${st.borderRadius||0}px`;
        const _sqlDom=buildInnerContent(el,true,true);
        _tmpSql.appendChild(_sqlDom);
        // _renderSqlResult already called inside buildInnerContent if el.sqlResult exists,
        // but el-sql-result starts display:none — force it visible if result present
        if(el.sqlResult){
          const _r=_tmpSql.querySelector('.el-sql-result');
          if(_r)_r.style.display='block';
        }
        inner=_tmpSql.innerHTML;
      } else if(el.type==='image'&&el.src){
        inner=`<img src="${el.src}" style="width:100%;height:100%;object-fit:contain">`;
      } else if(el.type==='sym-arrow'){
        const b2=arrBounds(el);
        posStyle=`left:${b2.lx}px;top:${b2.ly}px;width:${b2.w}px;height:${Math.max(2,b2.h)}px;overflow:visible`;
        // Build via DOM for correct geometry-based arrowheads (no url(#id) needed)
        const _svgEl=_buildArrowSVGEl(el,b2);
        inner=_svgEl.outerHTML;
      } else if(el.type&&el.type.startsWith('sym-')&&el.type!=='sym-arrow'){
        const symS2=el.symStyle||{};
        const svg2=symShapeSVG(el.type,ew,eh,symS2.stroke,symS2.fill,symS2.strokeWidth||2,symS2.dashed);
        const tc2=el.style?.color||'#e4ddd0';const fs2=el.style?.fontSize||13;
        inner=`<svg viewBox="0 0 ${ew} ${eh}" width="${ew}" height="${ew}" style="position:absolute;inset:0">${svg2}</svg>`
             +(el.text?`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:${fs2}px;color:${tc2};text-align:center;padding:4px;overflow:hidden">${esc(el.text)}</div>`:'');
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
      } else if(el.type){
        // Generic fallback: use buildInnerContent so future element types render automatically
        const _tmp=document.createElement('div');
        _tmp.style.cssText=`width:${ew}px;height:${eh}px;overflow:hidden;box-sizing:border-box`;
        _tmp.appendChild(buildInnerContent(el,true));
        inner=_tmp.innerHTML;
      }
    }
    return `<div style="position:absolute;${posStyle}">${inner}</div>`;
  }).join('');

  // Whiteboard slides: crop to element bounding box
  if(isWB(slide)){
    const bb=wbBounds(slide);
    const wsc=tw/bb.w, wph=Math.round(bb.h*wsc);
    return `<div style="width:${tw}px;height:${wph}px;overflow:hidden;border-radius:4px;position:relative;flex-shrink:0;background:${bg}">
      <div style="position:absolute;top:${(-bb.y*wsc).toFixed(1)}px;left:${(-bb.x*wsc).toFixed(1)}px;width:${sz.w}px;height:${sz.h}px;zoom:${wsc.toFixed(6)};transform-origin:top left;pointer-events:none">
        ${items}
      </div>
    </div>`;
  }
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
    return `<div class="ec-slide-item" onclick="${isAdmin?`openEditor(${e.id},${si})`:`openViewer(${e.id},${si})`}">
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
  const list=getList(q,s,_sortL), c=document.getElementById('entL');
  if(!list.length){c.innerHTML=`<div class="empty"><div class="empty-i">📓</div><h3>${s?'Keine Treffer':'Noch keine Einträge für '+q}</h3><p>${s?'Anderen Begriff versuchen.':'Noch nichts dokumentiert.'}</p></div>`;return;}
  let html='', lm='';
  list.forEach((e,i)=>{const m=fmtM(e.datum);if(m!==lm){html+=`<div class="month-sep">${m}</div>`;lm=m;}html+=entryCard(e,i,false);});
  c.innerHTML=html;
  const _bL=document.getElementById('sortBtnL');
  if(_bL&&_bL.value!==_sortL)_bL.value=_sortL;
}
function renderA(){
  const q=activeQ.admin, s=document.getElementById('srA').value||'';
  const list=getList(q,s,_sortA), c=document.getElementById('entA');
  if(!list.length){c.innerHTML=`<div class="empty"><div class="empty-i">📓</div><h3>${s?'Keine Treffer':'Keine Einträge für '+q}</h3><p>${s?'Anderen Begriff.':'Neuer Eintrag erstellen.'}</p></div>`;return;}
  let html='', lm='';
  list.forEach((e,i)=>{const m=fmtM(e.datum);if(m!==lm){html+=`<div class="month-sep">${m}</div>`;lm=m;}html+=entryCard(e,i,true);});
  c.innerHTML=html; initListDrag();
  const _bA=document.getElementById('sortBtnA');
  if(_bA&&_bA.value!==_sortA)_bA.value=_sortA;
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
function refreshAll(){buildQTabs('lehrer');buildQTabs('admin');renderL();renderA();updStats();buildQS('lehrer');buildQS('admin');}

/* ════════ ADMIN SCREEN SWITCHER ════════ */
function switchAdminScreen(screen){
  adminScreen=screen;
  const allScreens=['journal','dateien','notizen','backups','einstellungen'];
  const labMap={journal:'Journal',dateien:'Dateien',notizen:'Notizen',backups:'Backups',einstellungen:'Einstellungen'};
  allScreens.forEach(s=>{
    const btn=document.getElementById('modeBtn'+labMap[s]);
    if(btn)btn.classList.toggle('act',s===screen);
  });
  const secMap={
    journal:'adminJournalSection',
    dateien:'adminFilesSection',
    notizen:'adminNotesSection',
    backups:'adminBackupsSection',
    einstellungen:'adminSettingsSection',
  };
  Object.entries(secMap).forEach(([s,id])=>{
    const el=document.getElementById(id);
    if(el)el.style.display=s===screen?'':'none';
  });
  const qsp=document.getElementById('qsPanel-A');
  if(qsp)qsp.style.display=screen==='journal'?'':'none';
  if(screen==='dateien')loadFiles();
  if(screen==='notizen')loadNote();
  if(screen==='backups')loadBackups();
  if(screen==='einstellungen')initSettingsUI();
}

/* ════════ VIEWER ════════ */
let vEntry=null;
function openViewer(id, slideIdx=0){
  vEntry=JSON.parse(JSON.stringify(load().find(e=>e.id===id)));
  if(!vEntry)return;
  document.getElementById('viewerTitle').textContent=vEntry.titel;
  vScale=1; renderViewer();
  document.getElementById('viewerOverlay').classList.add('open');
  // Fit + scroll AFTER the overlay is visible so layout/scroll positions are computed
  requestAnimationFrame(()=>{
    vFit();
    requestAnimationFrame(()=>{
      const scroll = document.getElementById('viewerScroll');
      if(slideIdx === 0){
        // First slide: always start at the very top
        scroll.scrollTop = 0;
      } else {
        const blocks = document.querySelectorAll('#viewerInner .viewer-slide-block');
        const block = blocks[slideIdx];
        if(block){
          // Use getBoundingClientRect so CSS transform scale is accounted for.
          // Scroll so the block appears ~14px below the container top — enough
          // room for the "Folie X" label above the actual slide canvas.
          const blockRect = block.getBoundingClientRect();
          const scrollRect = scroll.getBoundingClientRect();
          scroll.scrollTop = scroll.scrollTop + blockRect.top - scrollRect.top - 14;
        }
      }
    });
  });
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
      } else if(el.type==='sym-arrow'){
        const b=arrBounds(el);
        const d=document.createElement('div');
        d.style.cssText=`position:absolute;left:${b.lx}px;top:${b.ly}px;width:${b.w}px;height:${b.h}px;z-index:${el.z||1};pointer-events:none;overflow:visible`;
        d.appendChild(_buildArrowSVGEl(el,b));
        wrap.appendChild(d);
      } else {
        const st=el.style||{};
        const d=document.createElement('div'); d.className='ro-el';
        d.style.cssText=`left:${el.x||0}px;top:${el.y||0}px;width:${el.w||10}px;height:${Math.max(1,el.h||10)}px;z-index:${el.z||1};border-radius:${st.borderRadius||0}px`;
        if(st.background&&st.background!=='transparent')d.style.background=st.background;
        const inn2=document.createElement('div'); inn2.className='ro-in';
        inn2.appendChild(buildInnerContent(el,true,curRole==='lehrer')); d.appendChild(inn2); wrap.appendChild(d);
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
  // Snapshot original state for change detection
  _origSlidesSnap=JSON.stringify(edEntry.slides);
  _origMeta={
    titel:edEntry.titel||'',
    datum:edEntry.datum||'',
    q:edEntry.q||'Q2',
    tags:(edEntry.tags||[]).join(', '),
  };
  document.getElementById('editorView').classList.add('open');
  edTab('ins'); cvScale=1; cvOffX=0; cvOffY=0;
  populateSlideMeta(); renderSlide(); renderSpanel(); setTimeout(fitSlide,50);
}
function curSlide(){return edEntry?.slides?.[edSlideIdx]||edEntry?.slides?.[0];}
function hasChanges(){
  if(!edEntry)return false;
  // Compare live meta fields against snapshot
  if(document.getElementById('sldEntryTitle').value!==(_origMeta?.titel||''))return true;
  if(document.getElementById('sldDate').value!==(_origMeta?.datum||''))return true;
  if(document.getElementById('sldQ').value!==(_origMeta?.q||'Q2'))return true;
  if(document.getElementById('sldTags').value!==(_origMeta?.tags||''))return true;
  // Compare slide data (elements, format, bg, titles) against snapshot
  if(JSON.stringify(edEntry.slides)!==_origSlidesSnap)return true;
  return false;
}
function closeEditor(){
  if(hasChanges()&&!confirm('Änderungen verwerfen?'))return;
  document.getElementById('editorView').classList.remove('open');
  edEntry=null; selElId=null; hideGuides(); hideRTB();
  _origSlidesSnap=null; _origMeta=null;
}
function resetSlide(){
  if(!edEntry)return;
  const sl=curSlide(); if(!sl)return;
  if(!sl.elements||sl.elements.length===0){
    // Slide already empty – nothing to clear, avoid cluttering undo stack
    return;
  }
  if(!confirm(`Alle Elemente von "${sl.title||'diese Folie'}" löschen?`))return;
  pushHistory('Folie geleert');
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
  const fmt=FMT[sl.format||'16:9']||FMT['16:9'];
  slide.style.width=sz.w+'px'; slide.style.height=sz.h+'px';
  slide.style.background=sl.slideBg||'#0c0c0c';
  // Whiteboard: show grid pattern and remove hard clip
  if(fmt.wb){
    slide.classList.add('wb-mode');
    slide.dataset.wbMode=fmt.wb;
  } else {
    slide.classList.remove('wb-mode');
    delete slide.dataset.wbMode;
  }
}
function fitSlide(){
  const area=document.getElementById('edCvArea'), sl=curSlide(); if(!sl)return;
  const sz=slSz(sl), aw=area.clientWidth, ah=area.clientHeight;
  if(isWB(sl)){
    // For whiteboard: fit to content bounds, or show a nice starting region
    const bb=wbBounds(sl);
    const vw=Math.max(bb.w,960), vh=Math.max(bb.h,540);
    cvScale=Math.min((aw-80)/vw,(ah-80)/vh,1);
    // Center the content viewport: offset so bb.x,bb.y lands at the display center
    cvOffX=(aw/2) - (bb.x + bb.w/2)*cvScale;
    cvOffY=(ah/2) - (bb.y + bb.h/2)*cvScale;
  } else {
    cvScale=Math.min((aw-80)/sz.w,(ah-80)/sz.h,1);
    cvOffX=(aw-sz.w*cvScale)/2; cvOffY=(ah-sz.h*cvScale)/2;
  }
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
function onCvDown(ev){
  const slideCV=document.getElementById('slideCV');
  if(ev.target===document.getElementById('edCvArea')||ev.target===slideCV){
    deselectAll();hideRTB();
    // Start lasso if no modifier — plain background drag
    const rect=slideCV?.getBoundingClientRect();
    if(rect&&!ev.ctrlKey&&!ev.metaKey){
      const lx=(ev.clientX-rect.left)/cvScale, ly=(ev.clientY-rect.top)/cvScale;
      MS={type:'lasso',sx:ev.clientX,sy:ev.clientY,lx0:lx,ly0:ly,snap:null};
      ev.preventDefault();
    }
  }
}
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
    else if(el.type==='sym-arrow') slide.appendChild(buildArrowDom(el));
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
  if(st.borderColor&&st.borderWidth&&st.borderWidth>0)wrap.style.boxShadow=`0 0 0 ${st.borderWidth}px ${st.borderColor}`;

  const bd=document.createElement('div'); bd.className='sel-bd'; wrap.appendChild(bd);
  // Wider overlay for easier clicking
  const ov=document.createElement('div'); ov.className='sel-ov'; wrap.appendChild(ov);
  ov.addEventListener('mousedown',ev=>{
    ev.stopPropagation();
    if(ev.ctrlKey||ev.metaKey){
      // Ctrl/Cmd+click: toggle this element in multi-selection
      if(_multiSel.has(el.id)){
        _multiSel.delete(el.id);
        const d=document.getElementById('sel_'+el.id);
        if(d)d.classList.remove('multi-selected');
      } else {
        // Also add the currently single-selected element if present
        if(selElId&&!_multiSel.has(selElId)){
          _multiSel.add(selElId);
          const d=document.getElementById('sel_'+selElId);
          if(d)d.classList.add('multi-selected');
        }
        _multiSel.add(el.id);
        const d=document.getElementById('sel_'+el.id);
        if(d)d.classList.add('multi-selected');
        selElId=el.id; // keep as primary
      }
      return;
    }
    if(_multiSel.size>0&&_multiSel.has(el.id)){
      // Click on a multi-selected element: start group move
      startGroupMove(ev);
      return;
    }
    _multiSel.forEach(id=>{const d=document.getElementById('sel_'+id);if(d)d.classList.remove('multi-selected');});
    _multiSel.clear();
    selectEl(el.id);startMove(el.id,ev);
  });
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

function typeLabel(t){return{title:'Überschrift',text:'Text',code:'Code',sql:'SQL',image:'Bild',divider:'Linie',badge:'Badge','er-entity':'Entität','er-weak-entity':'Schwache Entität','er-relation':'Beziehungstyp','er-weak-relation':'Schw. Beziehungstyp','er-attribute':'Attribut','er-key-attribute':'Schlüsselattr.','er-multi-attribute':'Mehrwertiger Attr.','er-derived-attr':'Abgel. Attribut','er-isa':'IS-A','er-line':'Verbindungslinie','er-cardinality':'Kardinalität','sym-rect':'Rechteck','sym-rounded-rect':'Abg. Rechteck','sym-circle':'Kreis','sym-ellipse':'Ellipse','sym-triangle':'Dreieck','sym-right-tri':'Rechtes Dreieck','sym-diamond':'Raute','sym-hexagon':'Sechseck','sym-parallelogram':'Parallelogramm','sym-star':'Stern','sym-cylinder':'Zylinder','sym-arrow':'Pfeil'}[t]||t;}

function buildInnerContent(el, readOnly, canRunSql=false){
  const st=el.style||{};
  if(el.type==='title'||el.type==='text'){
    const div=document.createElement('div'); div.className='el-text';
    div.contentEditable=readOnly?'false':'true'; div.spellcheck=!readOnly;
    div.style.cssText=`font-size:${st.fontSize||14}px;font-family:${st.fontFamily||"'DM Sans',sans-serif"};color:${st.color||'#e4ddd0'};font-weight:${st.fontWeight||400};font-style:${st.fontStyle||'normal'};text-decoration:${st.textDecoration||'none'};text-align:${st.textAlign||'left'};line-height:${st.lineHeight||1.6}`;
    // Set innerHTML AFTER style so browser doesn't re-wrap content
    div.innerHTML=el.html||'';
    // Remove any leading <br> that browsers inject as first contenteditable child
    if(div.firstChild&&div.firstChild.nodeName==='BR'&&div.childNodes.length>1){
      div.removeChild(div.firstChild);
    }
    // Ghost text placeholder
    const _phText=el.type==='title'?'Überschrift …':'Text …';
    div.dataset.placeholder=_phText;
    const _checkEmpty=()=>{const t=div.textContent||'';div.classList.toggle('is-empty',!t.trim());};
    _checkEmpty();
    if(!readOnly){
      let _histPushed=false;
      div.addEventListener('mousedown',ev=>ev.stopPropagation());
      div.addEventListener('focus',()=>{activeRTBEl=el.id;_histPushed=false;});
      div.addEventListener('blur',()=>{_histPushed=false;_checkEmpty();});
      div.addEventListener('input',()=>{
        if(!_histPushed){pushHistory('Text bearbeitet');_histPushed=true;}
        const e=getEl(el.id);if(e)e.html=div.innerHTML;_spRefresh();
        _checkEmpty();
      });
      div.addEventListener('paste',ev=>{
        ev.preventDefault();ev.stopPropagation();
        const html=ev.clipboardData?.getData('text/html')||'';
        const plain=ev.clipboardData?.getData('text/plain')||'';
        if(!plain&&!html)return;
        _pendingPaste={html,plain,target:div,elId:el.id};
        document.getElementById('pasteFmtModal').style.display='flex';
      });
      div.addEventListener('mouseup',()=>{saveRange();setTimeout(posRTB,20);});
      div.addEventListener('keyup',()=>{saveRange();setTimeout(posRTB,20);});
      // Tab key: indent/outdent list items; otherwise insert tab stop
      div.addEventListener('keydown',ev=>{
        if(ev.key!=='Tab')return;
        const sel=window.getSelection();
        if(!sel||!sel.rangeCount)return;
        // Walk up from cursor to check if we're inside a list item
        let node=sel.getRangeAt(0).startContainer;
        let inList=false;
        while(node&&node!==div){
          if(node.nodeName==='LI'){inList=true;break;}
          node=node.parentNode;
        }
        if(inList){
          ev.preventDefault();ev.stopPropagation();
          if(ev.shiftKey){document.execCommand('outdent');}
          else{document.execCommand('indent');}
          const e=getEl(el.id);if(e)e.html=div.innerHTML;_spRefresh();
        }
      });
    }
    return div;
  }
  if(el.type==='code'){
    const div=document.createElement('div'); div.className='el-code';
    div.contentEditable=readOnly?'false':'true'; div.spellcheck=false;
    div.textContent=el.html||(el.text||'');
    if(!readOnly){
      let _histPushed=false;
      div.addEventListener('mousedown',ev=>ev.stopPropagation());
      div.addEventListener('focus',()=>{_histPushed=false;});
      div.addEventListener('blur',()=>{_histPushed=false;});
      div.addEventListener('input',()=>{
        if(!_histPushed){pushHistory('Code bearbeitet');_histPushed=true;}
        const e=getEl(el.id);if(e)e.html=div.textContent;_spRefresh();
      });
    }
    return div;
  }
  if(el.type==='sql'){
    const wrap=document.createElement('div'); wrap.className='el-sql-wrap';
    const st=el.style||{};
    // Code area
    const code=document.createElement('div'); code.className='el-code el-sql-code';
    code.style.color=st.color||'#a3e635';
    code.style.fontSize=(st.fontSize||13)+'px';
    code.style.fontFamily=st.fontFamily||"'JetBrains Mono',monospace";
    code.contentEditable=readOnly?'false':'true'; code.spellcheck=false;
    // Apply syntax highlighting
    const _applyHl=()=>{code.innerHTML=highlightSql(el.sql||'');};
    _applyHl();
    if(!readOnly){
      let _histPushed=false;
      code.addEventListener('mousedown',ev=>ev.stopPropagation());
      // Tab key → insert 2 spaces
      code.addEventListener('keydown',ev=>{
        if(ev.key==='Tab'){
          ev.preventDefault();ev.stopPropagation();
          const off=getSqlCursor(code);
          const t=(el.sql||'');
          const nt=t.slice(0,off)+'  '+t.slice(off);
          el.sql=nt;code.innerHTML=highlightSql(nt);setSqlCursor(code,off+2);
        }
      });
      code.addEventListener('focus',()=>{_histPushed=false;});
      code.addEventListener('blur',()=>{_histPushed=false;});
      code.addEventListener('input',()=>{
        if(!_histPushed){pushHistory('SQL bearbeitet');_histPushed=true;}
        const off=getSqlCursor(code);
        const t=code.textContent;
        const e=getEl(el.id);if(e)e.sql=t;el.sql=t;
        code.innerHTML=highlightSql(t);
        setSqlCursor(code,off);
        // Clear error/ok state while editing
        const _sqlWrap=code.closest('.el-sql-wrap');
        if(_sqlWrap)_sqlWrap.classList.remove('sql-state-err','sql-state-ok');
      });
    }
    wrap.appendChild(code);
    // Run/clear buttons: show for editors AND for lehrer (canRunSql)
    if(!readOnly || canRunSql){
      const btnRow=document.createElement('div'); btnRow.className='el-sql-btnrow';
      const runBtn=document.createElement('button'); runBtn.className='el-sql-run';
      runBtn.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> Ausführen';
      runBtn.addEventListener('mousedown',ev=>ev.stopPropagation());
      runBtn.addEventListener('click',ev=>{ev.stopPropagation();runSqlEl(el.id,wrap);});
      const clearBtn=document.createElement('button'); clearBtn.className='el-sql-clear';
      clearBtn.innerHTML='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg> Leeren';
      clearBtn.addEventListener('mousedown',ev=>ev.stopPropagation());
      clearBtn.addEventListener('click',ev=>{
        ev.stopPropagation();
        const res=wrap.querySelector('.el-sql-result');
        const ce=wrap.querySelector('.el-sql-code');
        const e=getEl(el.id); if(e)delete e.sqlResult; el.sqlResult=undefined;
        // Keep result area visible but show empty state
        if(res)_renderSqlResult(res,{rows:[]});
        wrap.classList.remove('sql-state-err','sql-state-ok');
      });
      btnRow.appendChild(runBtn);
      btnRow.appendChild(clearBtn);
      wrap.appendChild(btnRow);
    }
    // Result area
    const res=document.createElement('div'); res.className='el-sql-result';
    res.dataset.elid=el.id;
    if(el.sqlResult){_renderSqlResult(res,el.sqlResult);}
    wrap.appendChild(res);
    return wrap;
  }
  if(el.type==='image'){
    const wrap=document.createElement('div'); wrap.className='el-img-wrap';
    if(el.src){
      const img=document.createElement('img'); img.src=el.src;
      wrap.appendChild(img);
    } else if(!readOnly){
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
    if(!readOnly){
      let _histPushed=false;
      p.addEventListener('mousedown',ev=>ev.stopPropagation());
      p.addEventListener('focus',()=>{_histPushed=false;});
      p.addEventListener('blur',()=>{_histPushed=false;});
      p.addEventListener('input',()=>{
        if(!_histPushed){pushHistory('Badge bearbeitet');_histPushed=true;}
        const e=getEl(el.id);if(e)e.text=p.textContent;_spRefresh();
      });
    }
    d.appendChild(p);return d;
  }
  if(el.type&&el.type.startsWith('sym-')&&el.type!=='sym-arrow'){
    const wrap=document.createElement('div'); wrap.className='el-sym-wrap';
    const svg=mkSVGEl('svg'); svg.className='el-er-svg sym-s';
    svg.setAttribute('viewBox',`0 0 ${el.w} ${el.h}`);
    svg.setAttribute('preserveAspectRatio','none');
    svg.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible';
    const symS=el.symStyle||{};
    svg.innerHTML=symShapeSVG(el.type,el.w,el.h,symS.stroke,symS.fill,symS.strokeWidth,symS.dashed);
    wrap.appendChild(svg);
    const txt=document.createElement('div'); txt.className='el-sym-text';
    txt.contentEditable=readOnly?'false':'true'; txt.textContent=el.text||'';
    if(!readOnly){
      let _histPushed=false;
      txt.addEventListener('mousedown',ev=>ev.stopPropagation());
      txt.addEventListener('focus',()=>{_histPushed=false;});
      txt.addEventListener('blur',()=>{_histPushed=false;});
      txt.addEventListener('input',()=>{if(!_histPushed){pushHistory('Symbol-Text bearbeitet');_histPushed=true;}const e=getEl(el.id);if(e)e.text=txt.textContent;_spRefresh();});
    }
    wrap.appendChild(txt);
    return wrap;
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
    if(!readOnly){
      let _histPushed=false;
      txt.addEventListener('mousedown',ev=>ev.stopPropagation());
      txt.addEventListener('focus',()=>{_histPushed=false;});
      txt.addEventListener('blur',()=>{_histPushed=false;});
      txt.addEventListener('input',()=>{
        if(!_histPushed){pushHistory('ER-Text bearbeitet');_histPushed=true;}
        const e=getEl(el.id);if(e)e.text=txt.textContent;_spRefresh();
      });
    }
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
function getEl(id){
  // First check the active editor slide
  const fromEditor=(curSlide()?.elements||[]).find(e=>e.id===id);
  if(fromEditor)return fromEditor;
  // Fallback: search all slides of vEntry (viewer/lehrer context)
  if(vEntry){
    for(const sl of vEntry.slides||[]){
      const found=(sl.elements||[]).find(e=>e.id===id);
      if(found)return found;
    }
  }
  return undefined;
}
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
  _multiSel.forEach(id=>{const d=document.getElementById('sel_'+id);if(d)d.classList.remove('multi-selected');});
  _multiSel.clear();
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
  const isSym=el.type&&el.type.startsWith('sym-')&&el.type!=='sym-arrow';
  const isArrow=el.type==='sym-arrow';
  const isCode=el.type==='code';
  document.getElementById('fmtTextSec').style.display=isText?'block':'none';
  document.getElementById('fmtERSec').style.display=isER?'block':'none';
  document.getElementById('fmtLineSec').style.display=isLine?'block':'none';
  const symSec=document.getElementById('fmtSymSec'); if(symSec)symSec.style.display=isSym?'block':'none';
  const arrowSec=document.getElementById('fmtArrowSec'); if(arrowSec)arrowSec.style.display=isArrow?'block':'none';
  const sqlSec=document.getElementById('fmtSqlSec');
  if(sqlSec)sqlSec.style.display='none';
  if(isText){
    document.getElementById('fmtFont').value=st.fontFamily||"'DM Sans',sans-serif";
    document.getElementById('fmtSize').value=st.fontSize||14;
    rtbCurrentSize=st.fontSize||14;
    document.getElementById('fmtColor').value=toHex(st.color||'#e4ddd0');
    document.getElementById('fmtLH').value=st.lineHeight||1.6;
    const fmtTBC=document.getElementById('fmtTextBorderColor');
    const fmtTBW=document.getElementById('fmtTextBorderWidth');
    const fmtNB=document.getElementById('fmtTextNoBorder');
    if(fmtTBC)fmtTBC.value=toHex(st.borderColor||'#888077');
    if(fmtTBW)fmtTBW.value=st.borderWidth||0;
    if(fmtNB)fmtNB.checked=!st.borderWidth||st.borderWidth===0;
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
  if(isSym){
    const symS=el.symStyle||{};
    const symStroke=document.getElementById('fmtSymStroke');if(symStroke)symStroke.value=toHex(symS.stroke||'#e8a030');
    const symFill=document.getElementById('fmtSymFill');if(symFill)symFill.value=toHex(symS.fill==='transparent'?'#000000':symS.fill||'#000000');
    const symSW=document.getElementById('fmtSymSW');if(symSW)symSW.value=symS.strokeWidth||2;
    const symDash=document.getElementById('fmtSymDash');if(symDash)symDash.checked=!!symS.dashed;
    const symColor=document.getElementById('fmtSymColor');if(symColor)symColor.value=toHex(el.style?.color||'#e4ddd0');
    const symFS=document.getElementById('fmtSymFontSize');if(symFS)symFS.value=el.style?.fontSize||13;
  }
  if(isArrow){
    const arS=el.arrowStyle||{};
    const arCol=document.getElementById('fmtArrowColor');if(arCol)arCol.value=toHex(arS.stroke||'#e8a030');
    const arSW=document.getElementById('fmtArrowSW');if(arSW)arSW.value=arS.strokeWidth||2;
    const arDash=document.getElementById('fmtArrowDash');if(arDash)arDash.checked=!!arS.dashed;
    const arStart=document.getElementById('fmtArrowStart');if(arStart)arStart.value=arS.startType||'none';
    const arEnd=document.getElementById('fmtArrowEnd');if(arEnd)arEnd.value=arS.endType||'filled';
    const arSize=document.getElementById('fmtArrowSize');if(arSize)arSize.value=arS.markerSize||9;
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
  const _fmtActions={fontFamily:'Schrift geändert',fontSize:'Schriftgröße geändert',color:'Textfarbe geändert',fontWeight:'Schriftstärke geändert',fontStyle:'Schriftstil geändert',textDecoration:'Textdekoration geändert',textAlign:'Textausrichtung geändert',lineHeight:'Zeilenabstand geändert',background:'Hintergrundfarbe geändert',borderRadius:'Eckenradius geändert',borderColor:'Rahmenfarbe geändert',borderWidth:'Rahmenbreite geändert'};
  pushHistoryDebounced(_fmtActions[prop]||'Formatierung geändert');
  el.style=el.style||{}; el.style[prop]=val;
  const dom=document.getElementById('sel_'+selElId); if(!dom)return;
  if(prop==='borderRadius'){dom.style.borderRadius=val+'px';}
  if(prop==='background'){dom.style.background=(!val||val==='transparent')?'':val;}
  if(prop==='borderColor'||prop==='borderWidth'){
    const bw=el.style.borderWidth||0;
    const bc=el.style.borderColor||'#888077';
    dom.style.boxShadow=bw>0?`0 0 0 ${bw}px ${bc}`:'';
  }
  if(prop==='fontSize'){
    rtbCurrentSize=val;
    const rtsv=document.getElementById('rtbSizeVal');if(rtsv)rtsv.value=val;
    const fmtS=document.getElementById('fmtSize');if(fmtS)fmtS.value=val;
  }
  const inn=dom.querySelector('.el-text');
  if(inn&&['fontFamily','fontSize','color','fontWeight','fontStyle','textDecoration','textAlign','lineHeight'].includes(prop)){
    if(prop==='fontSize')inn.style.fontSize=val+'px'; else inn.style[prop]=val;
  }
  _spRefresh();
}
function applyERSt(prop,val){
  if(!selElId)return; const el=getEl(selElId); if(!el)return;
  pushHistoryDebounced('ER-Stil geändert');
  el.erStyle=el.erStyle||{}; el.erStyle[prop]=val;
  if(el.type==='er-line'){updateLineDom(el);_spRefresh();return;}
  updateERSVG(el); _spRefresh();
}
function applySymSt(prop,val){
  if(!selElId)return; const el=getEl(selElId); if(!el)return;
  pushHistoryDebounced('Symbol-Stil geändert');
  el.symStyle=el.symStyle||{}; el.symStyle[prop]=val;
  const dom=document.getElementById('sel_'+selElId); if(!dom)return;
  const svg=dom.querySelector('svg.sym-s'); if(!svg)return;
  const symS=el.symStyle;
  svg.innerHTML=symShapeSVG(el.type,el.w,el.h,symS.stroke,symS.fill,symS.strokeWidth,symS.dashed);
  _spRefresh();
}
function applySymTextSt(prop,val){
  if(!selElId)return; const el=getEl(selElId); if(!el)return;
  pushHistoryDebounced('Symbol-Text geändert');
  el.style=el.style||{}; el.style[prop]=val;
  const dom=document.getElementById('sel_'+selElId); if(!dom)return;
  const txt=dom.querySelector('.el-sym-text'); if(!txt)return;
  if(prop==='color')txt.style.color=val;
  if(prop==='fontSize')txt.style.fontSize=val+'px';
  _spRefresh();
}
function applyArrowSt(prop,val){
  if(!selElId)return; const el=getEl(selElId); if(!el)return;
  pushHistoryDebounced('Pfeil-Stil geändert');
  el.arrowStyle=el.arrowStyle||{}; el.arrowStyle[prop]=val;
  updateArrowDom(el); _spRefresh();
}
function setTransp(checked){
  if(!selElId)return; const el=getEl(selElId); if(!el)return;
  el.style=el.style||{};
  if(checked){el.style.background='transparent';const d=document.getElementById('sel_'+selElId);if(d)d.style.background='';}
  else applyFmt('background',document.getElementById('fmtBg').value);
}
function clearTextBorder(checked){
  if(!selElId||!checked)return;
  const el=getEl(selElId);if(!el)return;
  el.style=el.style||{};el.style.borderWidth=0;
  const dom=document.getElementById('sel_'+selElId);if(dom)dom.style.boxShadow='';
  const fmtTBW=document.getElementById('fmtTextBorderWidth');if(fmtTBW)fmtTBW.value=0;
  _spRefresh();
}
function applyPos(dim,val){
  if(!selElId)return; const el=getEl(selElId); if(!el)return;
  const _posAction=(dim==='x'||dim==='y')?'Position geändert':'Größe geändert';
  pushHistoryDebounced(_posAction);
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
  pushHistory('Element gelöscht');
  sl.elements=sl.elements.filter(e=>e.id!==id);
  const dom=document.getElementById('sel_'+id); if(dom)dom.remove();
  if(selElId===id){selElId=null;document.getElementById('fmtEmpty').style.display='block';document.getElementById('fmtCtrl').style.display='none';}
  renderSpanel();
}
function deleteElById(id){
  // Like deleteEl but without its own pushHistory (caller manages snapshot)
  if(!edEntry)return; const sl=curSlide(); if(!sl)return;
  sl.elements=sl.elements.filter(e=>e.id!==id);
  const dom=document.getElementById('sel_'+id); if(dom)dom.remove();
  if(selElId===id){selElId=null;}
  renderSpanel();
}

/* ════════ ADD ELEMENT ════════ */
function addEl(type){
  if(!edEntry)return; const sl=curSlide(); if(!sl)return;
  pushHistory('Element hinzugefügt');
  const sz=slSz(sl), id=uid(), z=++zMax;
  let el={id,type,z,style:{}};
  if(type==='title') Object.assign(el,{x:40,y:28,w:Math.min(sz.w-80,880),h:66,html:'',style:{fontSize:34,fontFamily:"'Playfair Display',serif",color:'#e4ddd0',fontWeight:'900',textAlign:'left',lineHeight:1.2,background:'transparent',borderRadius:0}});
  else if(type==='text') Object.assign(el,{x:60,y:80,w:380,h:200,html:'',style:{fontSize:14,fontFamily:"'DM Sans',sans-serif",color:'#888077',fontWeight:'400',textAlign:'left',lineHeight:1.75,background:'transparent',borderRadius:0}});
  else if(type==='code') Object.assign(el,{x:60,y:80,w:380,h:200,html:'// Code hier',style:{fontSize:13,fontFamily:"'JetBrains Mono',monospace",color:'#7dd3fc',background:'#030303',borderRadius:8}});
  else if(type==='sql') Object.assign(el,{x:60,y:80,w:420,h:260,sql:'SELECT * FROM entries LIMIT 10;',sqlResult:null,style:{fontSize:13,fontFamily:"'JetBrains Mono',monospace",color:'#a3e635',background:'#030303',borderRadius:8}});
  else if(type==='image') Object.assign(el,{x:60,y:80,w:280,h:200,style:{background:'transparent',borderRadius:4}});
  else if(type==='divider') Object.assign(el,{x:40,y:Math.round(sz.h/2),w:Math.min(sz.w-80,880),h:4,style:{background:'transparent',borderRadius:0}});
  else if(type==='badge') Object.assign(el,{x:60,y:80,w:200,h:40,text:'Badge',style:{background:'transparent',borderRadius:0}});
  else if(type==='er-line'){
    const cx=Math.round(sz.w/2), cy=Math.round(sz.h/2);
    Object.assign(el,{x1:cx-90,y1:cy,x2:cx+90,y2:cy,erStyle:{stroke:'#888077',strokeWidth:2,dashed:false}});
  } else if(type==='er-cardinality'){
    const cx=Math.round(sz.w/2), cy=Math.round(sz.h/2);
    Object.assign(el,{x:cx-25,y:cy-20,w:50,h:40,text:'1',style:{fontSize:17,fontFamily:"'JetBrains Mono',monospace",color:'#e8a030',fontWeight:'700',textAlign:'center',lineHeight:1.2,background:'transparent',borderRadius:0},erStyle:{stroke:'transparent',fill:'transparent',strokeWidth:0,dashed:false}});
  } else if(type==='sym-arrow'){
    const cx=Math.round(sz.w/2),cy=Math.round(sz.h/2);
    Object.assign(el,{x1:cx-100,y1:cy,x2:cx+100,y2:cy,arrowStyle:{stroke:'#e8a030',strokeWidth:2,dashed:false,startType:'none',endType:'filled',markerSize:9}});
  } else if(type&&type.startsWith('sym-')){
    const d=SYMD[type]||{},cx=Math.round(sz.w/2),cy=Math.round(sz.h/2);
    Object.assign(el,{x:cx-Math.round((d.w||120)/2),y:cy-Math.round((d.h||80)/2),w:d.w||120,h:d.h||80,text:'',style:{background:'transparent',borderRadius:0,color:'#e4ddd0',fontSize:13,fontFamily:"'DM Sans',sans-serif"},symStyle:{stroke:'#e8a030',fill:'rgba(232,160,48,.09)',strokeWidth:2,dashed:false}});
  } else if(type&&type.startsWith('er-')){
    const d=ERD[type]||{}, cx=Math.round(sz.w/2), cy=Math.round(sz.h/2);
    Object.assign(el,{x:cx-Math.round((d.w||140)/2),y:cy-Math.round((d.h||60)/2),w:d.w||140,h:d.h||60,text:d.label||'',style:{background:'transparent',borderRadius:0},erStyle:{stroke:d.stroke||'#e8a030',fill:d.fill||'transparent',strokeWidth:2,dashed:false}});
  }
  sl.elements.push(el);
  if(type==='er-line') document.getElementById('slideCV').appendChild(buildLineDom(el));
  else if(type==='sym-arrow') document.getElementById('slideCV').appendChild(buildArrowDom(el));
  else document.getElementById('slideCV').appendChild(buildElDOM(el));
  if(type==='er-line'||type==='sym-arrow') selectLine(id); else selectEl(id);
  renderSpanel();
}

/* ════════ MOVEMENT STATE MACHINE ════════ */
function startGroupMove(ev){
  // Save initial positions of all multi-selected elements
  const snap=_snapElements('Gruppe verschoben');
  const initPositions={};
  _multiSel.forEach(id=>{const el=getEl(id);if(el)initPositions[id]={x:el.x||0,y:el.y||0};});
  document.body.classList.add('er-element-moving');
  MS={type:'move-group',elIds:[..._multiSel],sx:ev.clientX,sy:ev.clientY,data:initPositions,snap};
  ev.preventDefault();
}
function startMove(elId,ev){
  const el=getEl(elId); if(!el)return;
  // Snapshot captured NOW (before move) but pushed to stack only if element actually moves (mouseup)
  const snap=_snapElements('Element verschoben');
  // Render-Bug Fix: Endpunkt-Handles während Bewegung verstecken (CSS + JS)
  document.body.classList.add('er-element-moving');
  document.querySelectorAll('.er-line-pt').forEach(p=>{p.style.display='none';});
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
  MS={type:'move',elId,sx:ev.clientX,sy:ev.clientY,data:{x:el.x||0,y:el.y||0},lineBindings,snap};
  ev.preventDefault();
}
function startMoveLine(elId,ev){
  const el=getEl(elId); if(!el)return;
  const snap=_snapElements('Linie verschoben');
  MS={type:'move-line',elId,sx:ev.clientX,sy:ev.clientY,data:{x1:el.x1,y1:el.y1,x2:el.x2,y2:el.y2},snap};
  ev.preventDefault();
}
function startResize(elId,ev){
  const el=getEl(elId); if(!el)return;
  const snap=_snapElements('Größe geändert');
  document.body.classList.add('er-element-moving');
  MS={type:'resize',elId,sx:ev.clientX,sy:ev.clientY,data:{w:el.w||10,h:el.h||10},snap};
  ev.preventDefault();
}
function startDragPt(lineId,ptNum,ev){
  const el=getEl(lineId); if(!el)return;
  const snap=_snapElements('Linienpunkt verschoben');
  MS={type:'drag-pt',elId:lineId,ptNum,sx:ev.clientX,sy:ev.clientY,
      data:{x1:el.x1,y1:el.y1,x2:el.x2,y2:el.y2},snap};
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

  // Sym shapes: ellipse
  if(t==='sym-circle'||t==='sym-ellipse'){
    const rx=w/2, ry=h/2;
    const a=Math.atan2((py-cy)/ry,(px-cx)/rx);
    return {x:Math.round(cx+rx*Math.cos(a)),y:Math.round(cy+ry*Math.sin(a))};
  }
  // Sym hexagon: 6-gon projection
  if(t==='sym-hexagon'){
    const r=Math.min(cx,cy)-1;
    const verts6=[];for(let i=0;i<6;i++){const a=i*Math.PI/3;verts6.push({x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)});}
    let best=null,bd=Infinity;
    for(let i=0;i<6;i++){const a=verts6[i],b=verts6[(i+1)%6];const p=closestPtOnSeg(a,b,{x:px,y:py});const d=Math.hypot(px-p.x,py-p.y);if(d<bd){bd=d;best=p;}}
    return {x:Math.round(best.x),y:Math.round(best.y)};
  }
  // Sym parallelogram
  if(t==='sym-parallelogram'){
    const off=w*0.2,pad_=1;
    const tl={x:off+pad_,y:pad_},tr={x:w-pad_,y:pad_},br={x:w-off-pad_,y:h-pad_},bl={x:pad_,y:h-pad_};
    const edges=[[tl,tr],[tr,br],[br,bl],[bl,tl]];
    let best=null,bd=Infinity;
    edges.forEach(([a,b])=>{const p=closestPtOnSeg(a,b,{x:px,y:py});const d=Math.hypot(px-p.x,py-p.y);if(d<bd){bd=d;best=p;}});
    return {x:Math.round(best.x),y:Math.round(best.y)};
  }
  // Sym right-triangle
  if(t==='sym-right-tri'){
    const pad_=1;
    const tl={x:pad_,y:pad_},br={x:w-pad_,y:h-pad_},bl={x:pad_,y:h-pad_};
    const edges=[[tl,br],[br,bl],[bl,tl]];
    let best=null,bd=Infinity;
    edges.forEach(([a,b])=>{const p=closestPtOnSeg(a,b,{x:px,y:py});const d=Math.hypot(px-p.x,py-p.y);if(d<bd){bd=d;best=p;}});
    return {x:Math.round(best.x),y:Math.round(best.y)};
  }
  // Sym cylinder: treat as rounded rectangle (use top ellipse + sides)
  if(t==='sym-cylinder'){
    const ry2=h*0.14,pad_=1;
    // Sides are vertical lines; top and bottom are ellipses — approximate with rect edges
    const edges=[[{x:pad_,y:ry2},{x:pad_,y:h-pad_-ry2}],[{x:w-pad_,y:ry2},{x:w-pad_,y:h-pad_-ry2}]];
    let best=null,bd=Infinity;
    edges.forEach(([a,b])=>{const p=closestPtOnSeg(a,b,{x:px,y:py});const d=Math.hypot(px-p.x,py-p.y);if(d<bd){bd=d;best=p;}});
    // Also check top and bottom ellipses
    for(const [ecy2,ery2] of [[ry2,ry2],[h-pad_-ry2,ry2]]){
      const a=Math.atan2((py-(y+ecy2))/(ery2||1),(px-cx)/((w/2-pad_)||1));
      const ep={x:Math.round(cx+(w/2-pad_)*Math.cos(a)),y:Math.round(y+ecy2+ery2*Math.sin(a))};
      const d=Math.hypot(px-ep.x,py-ep.y);if(d<bd){bd=d;best=ep;}
    }
    return best?{x:Math.round(best.x),y:Math.round(best.y)}:{x:Math.round(cx),y:Math.round(y)};
  }
  // Sym diamond
  if(t==='sym-diamond'){
    const top={x:cx,y:y},right={x:x+w,y:cy},bottom={x:cx,y:y+h},left={x:x,y:cy};
    const edges=[[top,right],[right,bottom],[bottom,left],[left,top]];
    let best=null,bd=Infinity;
    edges.forEach(([a,b])=>{const p=closestPtOnSeg(a,b,{x:px,y:py});const d=Math.hypot(px-p.x,py-p.y);if(d<bd){bd=d;best=p;}});
    return {x:Math.round(best.x),y:Math.round(best.y)};
  }
  // Sym triangle
  if(t==='sym-triangle'){
    const top={x:cx,y:y},bl={x:x,y:y+h},br={x:x+w,y:y+h};
    const edges=[[top,bl],[top,br],[bl,br]];
    let best=null,bd=Infinity;
    edges.forEach(([a,b])=>{const p=closestPtOnSeg(a,b,{x:px,y:py});const d=Math.hypot(px-p.x,py-p.y);if(d<bd){bd=d;best=p;}});
    return {x:Math.round(best.x),y:Math.round(best.y)};
  }
  // Sym star: project onto the nearest of the 10 star edges
  if(t==='sym-star'){
    const pad_=1,ro=Math.min(cx,cy)-pad_,ri=ro*0.42,n=5;
    const verts=[];
    for(let i=0;i<n*2;i++){const a=-Math.PI/2+(i*Math.PI/n);verts.push({x:cx+(i%2===0?ro:ri)*Math.cos(a),y:cy+(i%2===0?ro:ri)*Math.sin(a)});}
    let best=null,bd=Infinity;
    for(let i=0;i<verts.length;i++){
      const a=verts[i],b=verts[(i+1)%verts.length];
      const p=closestPtOnSeg(a,b,{x:px,y:py});const d=Math.hypot(px-p.x,py-p.y);
      if(d<bd){bd=d;best=p;}
    }
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
    // Exclude line/arrow types and self; allow all other elements including text, image etc.
    if(el.type==='er-line'||el.type==='er-cardinality'||el.type==='sym-arrow'||el.id===excludeId)return;
    if(el.x===undefined||el.y===undefined||!el.w||!el.h)return; // skip malformed/line elements
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
    } else if(t==='sym-star'){
      // 5-point star: 5 outer tips + 5 inner notches + center
      const ro2=Math.min(cx,cy)-1,ri2=ro2*0.42,n2=5;
      for(let i=0;i<n2*2;i++){const a=-Math.PI/2+(i*Math.PI/n2);const r=i%2===0?ro2:ri2;preferred.push({x:Math.round(cx+r*Math.cos(a)),y:Math.round(cy+r*Math.sin(a))});}
    } else if(t==='sym-hexagon'){
      const r3=Math.min(cx,cy)-1;
      for(let i=0;i<6;i++){const a=i*Math.PI/3;preferred.push({x:Math.round(cx+r3*Math.cos(a)),y:Math.round(cy+r3*Math.sin(a))});}
      // midpoints
      for(let i=0;i<6;i++){const a=(i+0.5)*Math.PI/3;preferred.push({x:Math.round(cx+r3*Math.cos(a)),y:Math.round(cy+r3*Math.sin(a))});}
    } else if(t==='sym-parallelogram'){
      const off3=w*0.2;
      preferred.push({x:Math.round(off3),y:y},{x:x+w,y:y},{x:Math.round(x+w-off3),y:y+h},{x:x,y:y+h});
      preferred.push({x:Math.round(cx+off3/2),y:y},{x:Math.round(cx-off3/2),y:y+h},{x:Math.round(off3/2),y:cy},{x:Math.round(x+w-off3/2),y:cy});
    } else if(t==='sym-right-tri'){
      preferred.push({x:x,y:y},{x:x+w,y:y+h},{x:x,y:y+h},{x:Math.round(x/2),y:Math.round((y+y+h)/2)},{x:Math.round((x+w+x)/2),y:y+h},{x:x,y:cy});
    } else if(t==='sym-cylinder'){
      const ry3=h*0.14;
      preferred.push({x:cx,y:y},{x:cx,y:y+h},{x:x,y:Math.round(y+ry3)},{x:x+w,y:Math.round(y+ry3)},{x:x,y:Math.round(y+h-ry3)},{x:x+w,y:Math.round(y+h-ry3)});
    } else if(t==='sym-circle'||t==='sym-ellipse'){
      preferred.push({x:cx,y:y},{x:cx,y:y+h},{x:x,y:cy},{x:x+w,y:cy});
    } else if(t==='sym-diamond'){
      preferred.push({x:cx,y:y},{x:x+w,y:cy},{x:cx,y:y+h},{x:x,y:cy});
    } else if(t==='sym-triangle'){
      preferred.push({x:cx,y:y},{x:x,y:y+h},{x:x+w,y:y+h},{x:Math.round((cx+x)/2),y:Math.round((y+y+h)/2)},{x:Math.round((cx+x+w)/2),y:Math.round((y+y+h)/2)});
    } else {
      // Rectangle / text / image / etc.: 4 corners + 4 edge midpoints
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

  if(MS.type==='lasso'){
    const rect=document.getElementById('slideCV')?.getBoundingClientRect();if(!rect)return;
    const lx1=MS.lx0,ly1=MS.ly0;
    const lx2=(ev.clientX-rect.left)/cvScale,ly2=(ev.clientY-rect.top)/cvScale;
    const lBox=document.getElementById('lassoBox');
    if(lBox){
      const sx1=rect.left+Math.min(lx1,lx2)*cvScale,sy1=rect.top+Math.min(ly1,ly2)*cvScale;
      const sw2=Math.abs(lx2-lx1)*cvScale,sh2=Math.abs(ly2-ly1)*cvScale;
      lBox.style.cssText=`display:block;left:${sx1}px;top:${sy1}px;width:${sw2}px;height:${sh2}px`;
    }
    MS._lx2=lx2;MS._ly2=ly2;
    return;
  }
  if(MS.type==='move-group'){
    MS.elIds.forEach(id=>{
      const el=getEl(id);if(!el||!MS.data[id])return;
      const nx=Math.round(MS.data[id].x+dx), ny=Math.round(MS.data[id].y+dy);
      el.x=nx;el.y=ny;
      const dom=document.getElementById('sel_'+id);
      if(dom){dom.style.left=el.x+'px';dom.style.top=el.y+'px';}
    });
    return;
  }
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
  if(MS.type==='move-arrow'){
    const el=getEl(MS.elId); if(!el)return;
    el.x1=Math.round(MS.data.x1+dx); el.y1=Math.round(MS.data.y1+dy);
    el.x2=Math.round(MS.data.x2+dx); el.y2=Math.round(MS.data.y2+dy);
    updateArrowDom(el); refreshFP(el);
  }
  if(MS.type==='drag-arrow-pt'){
    const el=getEl(MS.elId); if(!el)return;
    const rect=document.getElementById('slideCV').getBoundingClientRect();
    let nx=Math.round((ev.clientX-rect.left)/cvScale);
    let ny=Math.round((ev.clientY-rect.top)/cvScale);
    const snap=findSnap(nx,ny,MS.elId);
    if(snap){nx=snap.x;ny=snap.y;}
    else{
      // Angle snap: magnetic within 15° of any 45° multiple; Shift forces snap regardless
      const ox=MS.ptNum===1?el.x2:el.x1, oy=MS.ptNum===1?el.y2:el.y1;
      const angle=Math.atan2(ny-oy,nx-ox);
      const snapAngle=Math.round(angle/(Math.PI/4))*(Math.PI/4);
      const angDiff=Math.abs(angle-snapAngle);
      const SNAP_ANG_TH=Math.PI/12; // ~15° dead-zone
      if(ev.shiftKey||angDiff<SNAP_ANG_TH){
        const dist=Math.hypot(nx-ox,ny-oy);
        nx=Math.round(ox+dist*Math.cos(snapAngle));
        ny=Math.round(oy+dist*Math.sin(snapAngle));
      }
    }
    if(MS.ptNum===1){el.x1=nx;el.y1=ny;}else{el.x2=nx;el.y2=ny;}
    updateArrowDom(el); refreshFP(el);
    const wrap=document.getElementById('sel_'+MS.elId);
    if(wrap){wrap.querySelectorAll('.er-line-pt').forEach(p=>{p.classList.toggle('snapped',+p.dataset.pt===MS.ptNum&&!!snap);});}
  }

  if(MS.type==='resize'){
    const el=getEl(MS.elId); if(!el)return;
    const rawW=Math.max(10,Math.round(MS.data.w+dx));
    const rawH=Math.max(2,Math.round(MS.data.h+dy));
    // Snap size to other elements' dimensions and slide center
    const sl2=curSlide();const sz2=slSz(sl2);
    let sw2=rawW,sh2=rawH,bestX=SNAP,bestY=SNAP,guideX=null,guideY=null,cX='rgba(239,68,68,.85)',cY='rgba(239,68,68,.85)';
    // Slide center alignment
    const snapCenterW=Math.round(sz2.w/2-(el.x||0));
    if(Math.abs(rawW-snapCenterW)<bestX){bestX=Math.abs(rawW-snapCenterW);sw2=snapCenterW;guideX=sz2.w/2;cX='rgba(59,130,246,.85)';}
    // Other elements' edges
    if(sl2)sl2.elements.forEach(oe=>{
      if(oe.id===el.id||!oe.w)return;
      // Match right edge to other right edges
      const oRight=(oe.x||0)+(oe.w||0);const myRight=(el.x||0)+rawW;
      const dR=Math.abs(myRight-oRight);if(dR<bestX){bestX=dR;sw2=oRight-(el.x||0);guideX=oRight;cX='rgba(239,68,68,.85)';}
      // Match width
      const dW=Math.abs(rawW-(oe.w||0));if(dW<bestX){bestX=dW;sw2=oe.w;guideX=(el.x||0)+oe.w/2;cX='rgba(239,68,68,.85)';}
      const oBottom=(oe.y||0)+(oe.h||0);const myBottom=(el.y||0)+rawH;
      const dB=Math.abs(myBottom-oBottom);if(dB<bestY){bestY=dB;sh2=oBottom-(el.y||0);guideY=oBottom;cY='rgba(239,68,68,.85)';}
      const dH=Math.abs(rawH-(oe.h||0));if(dH<bestY){bestY=dH;sh2=oe.h;guideY=(el.y||0)+oe.h/2;cY='rgba(239,68,68,.85)';}
    });
    el.w=Math.max(10,sw2);el.h=Math.max(2,sh2);
    const dom=document.getElementById('sel_'+MS.elId);
    if(dom){dom.style.width=el.w+'px';dom.style.height=el.h+'px';}
    // Show guides
    const sRect2=document.getElementById('slideCV')?.getBoundingClientRect();
    if(sRect2){
      const gH=document.getElementById('gH'),gV=document.getElementById('gV');
      if(guideY!==null){gH.style.display='block';gH.style.top=(sRect2.top+guideY*cvScale)+'px';gH.style.background=cY;gH.style.boxShadow=`0 0 4px ${cY}`;}else{gH.style.display='none';}
      if(guideX!==null){gV.style.display='block';gV.style.left=(sRect2.left+guideX*cvScale)+'px';gV.style.background=cX;gV.style.boxShadow=`0 0 4px ${cX}`;}else{gV.style.display='none';}
    }
    if(el.type&&el.type.startsWith('er-'))updateERSVG(el);
    if(el.type&&el.type.startsWith('sym-')&&el.type!=='sym-arrow')updateSymSVG(el);
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
  document.body.classList.remove('er-element-moving');
  // Restore CSS control over er-line endpoint handles (clear inline style set by startMove)
  document.querySelectorAll('.er-line-pt').forEach(p=>{p.style.display='';});
  if(MS&&MS.type==='lasso'){
    const lBox=document.getElementById('lassoBox');if(lBox)lBox.style.display='none';
    const lx1=Math.min(MS.lx0,MS._lx2||MS.lx0),ly1=Math.min(MS.ly0,MS._ly2||MS.ly0);
    const lx2=Math.max(MS.lx0,MS._lx2||MS.lx0),ly2=Math.max(MS.ly0,MS._ly2||MS.ly0);
    if(lx2-lx1>4||ly2-ly1>4){ // only if dragged a meaningful distance
      const sl=curSlide();
      if(sl)sl.elements.forEach(el=>{
        if(!el.x&&el.x!==0)return;
        const ex=el.x||0,ey=el.y||0,ew=el.w||0,eh=el.h||0;
        const inLasso=(ex<lx2&&ex+ew>lx1&&ey<ly2&&ey+eh>ly1);
        if(inLasso){
          _multiSel.add(el.id);
          const d=document.getElementById('sel_'+el.id);if(d)d.classList.add('multi-selected');
        }
      });
    }
    MS=null;return;
  }
  if(MS&&MS.type==='move-group'){
    // Check if anything actually moved
    let changed=false;
    MS.elIds.forEach(id=>{const el=getEl(id);if(el&&MS.data[id]&&(el.x!==MS.data[id].x||el.y!==MS.data[id].y))changed=true;});
    if(changed&&MS.snap){_undoStack.push(MS.snap);if(_undoStack.length>UNDO_MAX)_undoStack.shift();_redoStack=[];_updateHistBtns();}
    MS=null;hideGuides();hideConnDots();return;
  }
  if(MS&&(MS.type==='move'||MS.type==='move-line'||MS.type==='resize'||MS.type==='drag-pt'||MS.type==='move-arrow'||MS.type==='drag-arrow-pt')){
    const el=getEl(MS.elId);
    let changed=false;
    if(MS.type==='move'&&el)
      changed=(el.x!==MS.data.x||el.y!==MS.data.y);
    else if((MS.type==='move-line'||MS.type==='move-arrow')&&el)
      changed=(el.x1!==MS.data.x1||el.y1!==MS.data.y1||el.x2!==MS.data.x2||el.y2!==MS.data.y2);
    else if(MS.type==='resize'&&el)
      changed=(el.w!==MS.data.w||el.h!==MS.data.h);
    else if((MS.type==='drag-pt'||MS.type==='drag-arrow-pt')&&el)
      changed=(el.x1!==MS.data.x1||el.y1!==MS.data.y1||el.x2!==MS.data.x2||el.y2!==MS.data.y2);
    if(changed){
      // Push the pre-drag snapshot now that we know something changed
      if(MS.snap){_undoStack.push(MS.snap);if(_undoStack.length>UNDO_MAX)_undoStack.shift();_redoStack=[];_updateHistBtns();}
      if(MS.type!=='drag-pt'&&el)el.z=zMax;
      _spRefresh();
    }
    // If nothing moved, snapshot is simply discarded — undo button never lit up
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
  if(ev.key==='Delete'&&!isEdit(ev.target)){
    if(_multiSel.size>0){
      const snap=_snapElements('Gruppe gelöscht');
      _multiSel.forEach(id=>deleteElById(id));
      _multiSel.clear();
      if(snap){_undoStack.push(snap);if(_undoStack.length>UNDO_MAX)_undoStack.shift();_redoStack=[];_updateHistBtns();}
      return;
    }
    if(selElId){deleteEl(selElId);return;}
  }
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
    if(el&&ce){el.html=ce.innerHTML;pushHistoryDebounced('Textformatierung geändert');}
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

let _rtbHLColor='#ffd966';

function openRtbHL(){
  saveRange();
  document.getElementById('rtbHLPicker').click();
}

function setRtbHL(color){
  _rtbHLColor=color;
  const bar=document.getElementById('rtbHLBar');if(bar)bar.style.background=color;
  const icon=document.getElementById('rtbHLIcon');if(icon)icon.style.background=color;
  // Immediately apply the new color to the current selection (if any)
  if(restoreRange()){
    const sel=window.getSelection();
    if(sel&&sel.rangeCount&&!sel.isCollapsed){
      document.execCommand('styleWithCSS',false,true);
      document.execCommand('hiliteColor',false,color);
      syncSavedToEl();
      saveRange();
      setTimeout(posRTB,10);
    }
  }
}

function rfmtHighlight(){
  if(!restoreRange())return;
  const sel=window.getSelection();if(!sel||!sel.rangeCount)return;
  const node=sel.anchorNode;
  const ancEl=node?.nodeType===3?node.parentElement:node;
  // Check if already highlighted with a background color (not the element bg)
  const curBg=ancEl?window.getComputedStyle(ancEl).backgroundColor:'';
  const isHL=curBg&&curBg!=='rgba(0, 0, 0, 0)'&&curBg!=='transparent';
  document.execCommand('styleWithCSS',false,true);
  document.execCommand('hiliteColor',false,isHL?'transparent':_rtbHLColor);
  syncSavedToEl();saveRange();setTimeout(posRTB,10);
}

/* ════════ PASTE FORMAT DIALOG ════════ */
let _pendingPaste=null;
function pasteChoice(mode){
  document.getElementById('pasteFmtModal').style.display='none';
  if(!_pendingPaste||mode==='cancel'){_pendingPaste=null;return;}
  const{html,plain,target,elId}=_pendingPaste;_pendingPaste=null;
  if(!target.isConnected)return;
  target.focus();
  // Restore selection or place at end
  const sel=window.getSelection();
  if(sel&&sel.rangeCount){
    const range=sel.getRangeAt(0);
    range.deleteContents();
    let lastNode=null;
    if(mode==='plain'){
      const lines=plain.split(/\r?\n/);
      lines.forEach((line,i)=>{
        if(i>0)range.insertNode(document.createElement('br'));
        const tn=document.createTextNode(line);range.insertNode(tn);lastNode=tn;
      });
    } else {
      const tmp=document.createElement('div');
      tmp.innerHTML=html||plain.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\r?\n/g,'<br>');
      if(mode==='merge'){
        tmp.querySelectorAll('[style]').forEach(el=>{
          el.style.color='';el.style.fontFamily='';el.style.fontSize='';el.style.backgroundColor='';
          if(!el.getAttribute('style').trim())el.removeAttribute('style');
        });
        // Strip font tags
        tmp.querySelectorAll('font').forEach(f=>{
          const span=document.createElement('span');
          span.append(...Array.from(f.childNodes));f.replaceWith(span);
        });
      }
      const frag=document.createDocumentFragment();
      while(tmp.firstChild)frag.appendChild(tmp.firstChild);
      lastNode=frag.lastChild;
      range.insertNode(frag);
    }
    if(lastNode){
      try{range.setStartAfter(lastNode);range.setEndAfter(lastNode);sel.removeAllRanges();sel.addRange(range);savedRange=range.cloneRange();}catch(e){}
    }
  }
  pushHistory('Text eingefügt');
  const e=getEl(elId);if(e)e.html=target.innerHTML;
  target.classList.toggle('is-empty',!(target.textContent||'').trim());
  _spRefresh();
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
  const _fmtS=document.getElementById('fmtSize');if(_fmtS)_fmtS.value=sz;
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
  // Only call posRTB — savedRange is already correctly set above via newRange.cloneRange()
  // Calling saveRange() here would overwrite it with whatever collapsed cursor the browser left
  setTimeout(posRTB,30);
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
      const hex=rgbToHex(col);
      if(hex){
        document.getElementById('rtbColorA').style.color=hex;
        document.getElementById('rtbColorBar').style.background=hex;
        document.getElementById('rtbFg').value=hex;
      }
    }
    // Read font size: walk up through spans with explicit font-size, not computed style
    // (computed style reads the element-level size when anchor lands on the div itself)
    {
      let sizeNode=ancEl;
      let foundFs=null;
      while(sizeNode&&!sizeNode.classList?.contains('el-text')){
        if(sizeNode.style&&sizeNode.style.fontSize){foundFs=parseFloat(sizeNode.style.fontSize);break;}
        sizeNode=sizeNode.parentElement;
      }
      if(foundFs&&foundFs>0){
        rtbCurrentSize=Math.round(foundFs);
        document.getElementById('rtbSizeVal').value=rtbCurrentSize;
        const fmtS=document.getElementById('fmtSize');if(fmtS)fmtS.value=rtbCurrentSize;
      } else {
        // Anchor is in unstyled text — keep rtbCurrentSize as-is, just display it
        document.getElementById('rtbSizeVal').value=rtbCurrentSize;
        const fmtS=document.getElementById('fmtSize');if(fmtS)fmtS.value=rtbCurrentSize;
      }
    }
    // Sync bold/italic/underline/strikethrough active states
    const cmdMap={bold:'rtbBtnBold',italic:'rtbBtnItalic',underline:'rtbBtnUnder',strikeThrough:'rtbBtnStrike'};
    for(const[cmd,id] of Object.entries(cmdMap)){
      const btn=document.getElementById(id);
      if(btn)btn.classList.toggle('active',document.queryCommandState(cmd));
    }
    // Sync highlight state
    const hlBtn=document.getElementById('rtbBtnHL');
    if(hlBtn){
      const bg=window.getComputedStyle(ancEl).backgroundColor;
      const isHL=bg&&bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent';
      hlBtn.classList.toggle('active',!!isHL);
      if(isHL){
        const hlBar=document.getElementById('rtbHLBar');
        if(hlBar)hlBar.style.background=bg;
        // Sync picker + internal color state so next apply uses the same color
        const hlHex=rgbToHex(bg);
        if(hlHex){
          _rtbHLColor=hlHex;
          const picker=document.getElementById('rtbHLPicker');if(picker)picker.value=hlHex;
        }
      }
    }
    // Sync font label
    const ff=window.getComputedStyle(ancEl).fontFamily||'';
    const fontLabelMap=[['Calibri','Calibri'],['DM Sans','DM Sans'],['Playfair Display','Playfair'],['JetBrains Mono','Mono'],['Arial','Arial'],['Georgia','Georgia'],['Helvetica','Helvetica'],['Times New Roman','Times'],['Trebuchet','Trebuchet'],['Verdana','Verdana'],['Courier','Courier'],['Impact','Impact']];
    const matched=fontLabelMap.find(([k])=>ff.toLowerCase().includes(k.toLowerCase()));
    const lbl=document.getElementById('rtbFontLbl');
    if(lbl)lbl.textContent=matched?matched[1]:'Schrift';
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
let _renameTargetIsFolder = false;
let _treeState = {};     // path → { expanded: bool, items: array|null }

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
      draggable="true"
      ondragstart="folderDragStart(event,'${safePath}')"
      ondragend="folderDragEnd(event)"
      ondragover="treeFolderDragOver(event,'${safePath}')"
      ondragleave="treeFolderDragLeave(event)"
      ondrop="treeFolderDrop(event,'${safePath}')">
      <div class="file-tree-folder-row" style="padding-left:${indent}px"
           onclick="toggleFolder('${safePath}')">
        <span class="file-tree-arrow">${arrowIcon}</span>
        <span class="file-icon-inline">${folderIcon}</span>
        <span class="file-tree-name">${esc(f.name)}</span>
        <div class="file-acts" onclick="event.stopPropagation()">
          <button class="file-act-btn dl" onclick="downloadFolderAsZip('${safePath}')" title="Als ZIP herunterladen">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
          <button class="file-act-btn rn" onclick="openRenameModal('${safePath}',true)" title="Ordner umbenennen">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="file-act-btn mv" onclick="openMoveModal('${safePath}','folder')" title="Ordner verschieben">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 9l-3 3 3 3"/><path d="M19 9l3 3-3 3"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
          </button>
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
/* Single drag-source state: {path, type:'file'|'folder'} */
let _dragSrc = null;

function _clearAllDragHighlights(){
  document.querySelectorAll('.file-item.dragging').forEach(e=>e.classList.remove('dragging'));
  document.querySelectorAll('.file-tree-folder.dragging').forEach(e=>e.classList.remove('dragging'));
  document.querySelectorAll('.file-tree-folder.drag-over').forEach(e=>e.classList.remove('drag-over'));
  document.getElementById('filesList')?.classList.remove('drag-over-root');
}

function fileItemDragStart(ev,path){
  _dragSrc={path,type:'file'};
  ev.dataTransfer.effectAllowed='move';
  ev.dataTransfer.setData('text/plain',path);
  ev.stopPropagation(); // prevent bubble to parent folder's ondragstart which would overwrite _dragSrc
  setTimeout(()=>{
    const el=document.querySelector(`.file-item[data-name="${path}"]`);
    if(el)el.classList.add('dragging');
  },0);
}
function fileItemDragEnd(){_dragSrc=null;_clearAllDragHighlights();}

function folderDragStart(ev,path){
  _dragSrc={path,type:'folder'};
  ev.dataTransfer.effectAllowed='move';
  ev.dataTransfer.setData('text/plain',path);
  ev.stopPropagation();
  setTimeout(()=>{
    const el=document.querySelector(`.file-tree-folder[data-tree-path="${path}"]`);
    if(el)el.classList.add('dragging');
  },0);
}
function folderDragEnd(){_dragSrc=null;_clearAllDragHighlights();}

function treeFolderDragOver(ev,folderPath){
  if(!_dragSrc)return;
  if(_dragSrc.type==='folder'&&(folderPath===_dragSrc.path||folderPath.startsWith(_dragSrc.path+'/')))return;
  ev.preventDefault();ev.stopPropagation();
  ev.dataTransfer.dropEffect='move';
  // The root highlight must be cleared here — stopPropagation prevents filesList from
  // receiving dragover, so treeRootDragLeave never fires when moving into a folder child.
  document.getElementById('filesList')?.classList.remove('drag-over-root');
  // Clear other highlights first, then highlight only this folder
  document.querySelectorAll('.file-tree-folder.drag-over').forEach(e=>{
    if(e.dataset.treePath!==folderPath)e.classList.remove('drag-over');
  });
  const el=document.querySelector(`.file-tree-folder[data-tree-path="${folderPath}"]`);
  if(el)el.classList.add('drag-over');
}
function treeFolderDragLeave(ev){
  const folder=ev.currentTarget;
  if(!folder.contains(ev.relatedTarget))folder.classList.remove('drag-over');
}
async function treeFolderDrop(ev,folderPath){
  ev.preventDefault();ev.stopPropagation();
  _clearAllDragHighlights();
  if(!_dragSrc)return;
  const src=_dragSrc; _dragSrc=null;
  if(src.type==='folder'){
    if(folderPath===src.path||folderPath.startsWith(src.path+'/'))return;
    const folderName=src.path.split('/').pop();
    const destPath=`${folderPath}/${folderName}`;
    const srcParent=src.path.includes('/')?src.path.substring(0,src.path.lastIndexOf('/')):'';
    if(srcParent===folderPath)return; // already inside this folder
    await _moveFolder(src.path,destPath);
  } else {
    const srcDir=src.path.includes('/')?src.path.substring(0,src.path.lastIndexOf('/')):'';
    if(srcDir===folderPath)return;
    await _moveFile(src.path,`${folderPath}/${src.path.split('/').pop()}`);
  }
}

/* Drop onto the root (files-list background) */
function treeRootDragOver(ev){
  if(!_dragSrc)return;
  if(ev.target.closest('.file-tree-folder'))return;
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
  _clearAllDragHighlights();
  if(!_dragSrc){
    // External drop from OS onto the root list area
    const items=ev.dataTransfer?.items;
    if(items&&items.length){
      const entries=[];
      for(let i=0;i<items.length;i++){const e=items[i].webkitGetAsEntry?.();if(e)entries.push(e);}
      /* use same dispatch path as filesOnDrop */
    }
    _dropDispatch(ev.dataTransfer?.items,ev.dataTransfer?.files);
    return;
  }
  const src=_dragSrc; _dragSrc=null;
  if(src.type==='folder'){
    const folderName=src.path.split('/').pop();
    const srcParent=src.path.includes('/')?src.path.substring(0,src.path.lastIndexOf('/')):'';
    if(srcParent==='')return; // already at root
    await _moveFolder(src.path,folderName);
  } else {
    const srcDir=src.path.includes('/')?src.path.substring(0,src.path.lastIndexOf('/')):'';
    if(srcDir==='')return;
    await _moveFile(src.path,src.path.split('/').pop());
  }
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
    const rawPath=pathPrefix?`${pathPrefix}/${file.name}`:file.name;
    const uploadPath=sanitizeStorageKey(rawPath);
    if(statusDiv&&statusTxt){statusTxt.textContent=`Hochladen ${i+1}/${arr.length}: ${file.name}`;statusDiv.style.display='flex';}
    const {error}=await _sb.storage.from(FILES_BUCKET).upload(uploadPath,file,{upsert:true,contentType:file.type||'application/octet-stream'});
    if(error)failed.push(`${file.name}: ${error.message}`);
  }
  if(statusDiv)statusDiv.style.display='none';
  if (failed.length) {
    alert('Fehler beim Hochladen:\n' + failed.join('\n'));
  }
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
    const uploadPath=sanitizeStorageKey(file.webkitRelativePath||file.name);
    if(statusDiv&&statusTxt){statusTxt.textContent=`Hochladen ${i+1}/${arr.length}: ${uploadPath}`;statusDiv.style.display='flex';}
    const safeUploadPath=sanitizeStorageKey(uploadPath);
    const {error}=await _sb.storage.from(FILES_BUCKET).upload(safeUploadPath,file,{upsert:true,contentType:file.type||'application/octet-stream'});
    if(error)failed.push(`${file.name}: ${error.message}`);
  }
  if(statusDiv)statusDiv.style.display='none';
  if(failed.length)alert('Fehler beim Hochladen:\n'+failed.join('\n'));
  await loadFiles();
}

/* ── Folder upload: modern FSA API (Chrome 86+) + legacy FileEntry fallback ──

   PRIMARY path  — getAsFileSystemHandle()
     FileSystemDirectoryHandle stays valid after the drop event ends.
     We collect ALL handle-promises synchronously during the event,
     then await them and traverse with the async-iterator API.

   FALLBACK path — webkitGetAsEntry() + readEntries()
     Kept for browsers without FSA support.  All readEntries() calls
     start synchronously within the drop handler before any await.   */

async function _uploadViaFSA(handlePromises){
  const handles=await Promise.all(handlePromises);
  const allFiles=[];
  for(const h of handles){
    if(!h)continue;
    if(h.kind==='directory'){
      const files=await _traverseDirHandle(h,h.name);
      allFiles.push(...files);
    }else{
      const f=await h.getFile();
      allFiles.push({file:f,uploadPath:sanitizeStorageKey(h.name)});
    }
  }
  _doFolderUpload(allFiles);
}
async function _traverseDirHandle(dirH,path){
  const files=[];
  for await(const[name,h] of dirH.entries()){
    const cp=`${path}/${name}`;
    if(h.kind==='file'){
      const f=await h.getFile();
      files.push({file:f,uploadPath:sanitizeStorageKey(cp)});
    }else if(h.kind==='directory'){
      files.push(...await _traverseDirHandle(h,cp));
    }
  }
  if(!files.length){
    files.push({
      file:new File([''],'.emptyFolderPlaceholder',{type:'text/plain'}),
      uploadPath:`${sanitizeStorageKey(path)}/.emptyFolderPlaceholder`
    });
  }
  return files;
}

/* Legacy fallback — callback-based, all readEntries() started synchronously */
function _startFolderGather(entries,onDone){
  const gathered=[];let pending=0;
  function dec(){if(--pending===0)onDone(gathered);}
  function pe(e,prefix){
    pending++;
    if(e.isFile){
      e.file(f=>{gathered.push({file:f,uploadPath:sanitizeStorageKey(prefix?`${prefix}/${e.name}`:e.name)});dec();},dec);
    }else if(e.isDirectory){
      const sub=sanitizeStorageKey(prefix?`${prefix}/${e.name}`:e.name);
      const reader=e.createReader();const subs=[];
      function ra(){reader.readEntries(batch=>{
        if(!batch.length){
          if(!subs.length)gathered.push({file:new File([''],'.emptyFolderPlaceholder',{type:'text/plain'}),uploadPath:`${sub}/.emptyFolderPlaceholder`});
          else subs.forEach(s=>pe(s,sub));
          dec();
        }else{subs.push(...batch);ra();}
      },dec);}
      ra();
    }else dec();
  }
  if(!entries.length){onDone([]);return;}
  entries.forEach(e=>pe(e,''));
}

async function _doFolderUpload(fileList){
  const statusDiv=document.getElementById('filesUploadStatus');
  const statusTxt=document.getElementById('filesUploadStatusText');
  const failed=[];
  if(!fileList.length){
    alert('Keine Dateien im Ordner gefunden.\nBitte den „Ordner wählen"-Button verwenden.');
    return;
  }
  for(let i=0;i<fileList.length;i++){
    const{file,uploadPath}=fileList[i];
    if(file.name!=='.emptyFolderPlaceholder'&&file.size>FILES_MAX_BYTES){failed.push(`${file.name} (zu groß, max. 50 MB)`);continue;}
    if(statusDiv&&statusTxt){statusTxt.textContent=`Hochladen ${i+1}/${fileList.length}: ${uploadPath}`;statusDiv.style.display='flex';}
    const{error}=await _sb.storage.from(FILES_BUCKET).upload(uploadPath,file,{upsert:true,contentType:file.type||'application/octet-stream'});
    if(error)failed.push(`${uploadPath}: ${error.message}`);
  }
  if(statusDiv)statusDiv.style.display='none';
  if(failed.length)alert('Fehler beim Hochladen:\n'+failed.join('\n'));
  await loadFiles();
}

function _dropDispatch(items,filesObj){
  /* Try FSA (modern Chrome) first */
  if(items&&typeof items[0]?.getAsFileSystemHandle==='function'){
    const promises=[];
    for(let i=0;i<items.length;i++) promises.push(items[i].getAsFileSystemHandle().catch(()=>null));
    _uploadViaFSA(promises);
    return;
  }
  /* Fallback: FileEntry API — collect entries synchronously */
  const fsEntries=[];
  if(items){for(let i=0;i<items.length;i++){const e=items[i].webkitGetAsEntry?.();if(e)fsEntries.push(e);}}
  if(fsEntries.length){_startFolderGather(fsEntries,_doFolderUpload);return;}
  /* Last resort: flat files */
  if(filesObj&&filesObj.length)uploadFilesToBucket(filesObj);
}

function filesOnDragOver(ev){ev.preventDefault();document.getElementById('filesDropZone').classList.add('dnd');}
function filesOnDragLeave(){document.getElementById('filesDropZone').classList.remove('dnd');}
function filesOnDrop(ev){
  ev.preventDefault();document.getElementById('filesDropZone').classList.remove('dnd');
  _dropDispatch(ev.dataTransfer?.items,ev.dataTransfer?.files);
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

/* ── Download a specific folder as ZIP ── */
async function downloadFolderAsZip(folderPath){
  const folderName=folderPath.split('/').pop();
  try{
    const allFiles=await listAllInPath(folderPath);
    const realFiles=allFiles.filter(p=>!p.endsWith('/.emptyFolderPlaceholder')&&!p.endsWith('emptyFolderPlaceholder'));
    if(!realFiles.length){alert('Ordner ist leer.');return;}
    const zip=new JSZip();
    for(let i=0;i<realFiles.length;i++){
      const path=realFiles[i];
      const relPath=path.substring(folderPath.length+1);
      const {data,error}=await _sb.storage.from(FILES_BUCKET).download(path);
      if(error){console.warn('Skip '+path+': '+error.message);continue;}
      zip.file(relPath,data);
    }
    const blob=await zip.generateAsync({type:'blob'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=folderName+'.zip';
    document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(a.href);
  }catch(e){alert('ZIP-Fehler: '+e.message);}
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

/* ── Core move file helper ── */
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
    await _refreshParents(srcPath,destPath);
  }catch(e){
    setFileStatus(srcPath,'');
    alert('Verschieben fehlgeschlagen: '+e.message);
  }
}

/* ── Core move folder helper (recursively copies all files then deletes originals) ── */
async function _moveFolder(srcPath,destPath){
  try{
    const allFiles=await listAllInPath(srcPath);
    if(!allFiles.length){
      // Empty folder — create placeholder at dest
      await _sb.storage.from(FILES_BUCKET).upload(`${destPath}/.emptyFolderPlaceholder`,new Blob(['']),{upsert:true});
    } else {
      for(const filePath of allFiles){
        const relativePart=filePath.substring(srcPath.length+1);
        const newPath=`${destPath}/${relativePart}`;
        const {data:blob,error:dlErr}=await _sb.storage.from(FILES_BUCKET).download(filePath);
        if(dlErr)continue;
        const fileName=filePath.split('/').pop();
        const contentType=(blob.type&&blob.type!=='')?blob.type:guessMime(filePath);
        const file=new File([blob],fileName,{type:contentType});
        await _sb.storage.from(FILES_BUCKET).upload(newPath,file,{upsert:true,contentType});
      }
      const {error:delErr}=await _sb.storage.from(FILES_BUCKET).remove(allFiles);
      if(delErr)console.warn('Löschen nach Verschieben:', delErr.message);
    }
    // Remove old placeholder if it existed
    await _sb.storage.from(FILES_BUCKET).remove([`${srcPath}/.emptyFolderPlaceholder`]).catch(()=>{});
    // Delete the stale tree state for the old path and old dest (in case it was expanded before)
    Object.keys(_treeState).filter(k=>k===srcPath||k.startsWith(srcPath+'/')).forEach(k=>delete _treeState[k]);
    // destPath is the full new folder path (e.g. 'FolderB/FolderA'), so pass it directly
    await _refreshParents(srcPath,destPath);
  }catch(e){
    alert('Ordner verschieben fehlgeschlagen: '+e.message);
  }
}

async function _refreshParents(srcPath,destPath){
  const srcParent=srcPath.includes('/')?srcPath.substring(0,srcPath.lastIndexOf('/')):'';
  const dstParent=destPath.includes('/')?destPath.substring(0,destPath.lastIndexOf('/')):'';
  for(const p of new Set([srcParent,dstParent])){
    const items=await _loadFolderItems(p);
    if(_treeState[p]){_treeState[p].items=items;}
    else if(p===''){_treeState['']={expanded:true,items};}
    else{_treeState[p]={expanded:false,items};}
  }
  renderFileTree();
}

/* ── Rename ── */
function openRenameModal(fullPath,isFolder=false){
  _renameTarget=fullPath;
  _renameTargetIsFolder=isFolder;
  document.getElementById('renameInput').value=fullPath.split('/').pop();
  const _rnTitle=document.querySelector('#renameModal .modal-title');
  if(_rnTitle)_rnTitle.textContent=isFolder?'Ordner umbenennen':'Datei umbenennen';
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
  const _rnIsFolder=_renameTargetIsFolder;
  closeRenameModal();
  if(_rnIsFolder)await _moveFolder(targetName,newFullPath);
  else await _moveFile(targetName,newFullPath);
}

/* ── Move via modal ── */
let _moveModalTarget=null;
let _moveModalIsFolder=false;
async function openMoveModal(fullPath,type='file'){
  _moveModalTarget=fullPath;
  _moveModalIsFolder=(type==='folder');
  const sel=document.getElementById('moveFolderSelect');
  if(!sel)return;
  sel.innerHTML='<option value="">— Root —</option>';
  await _collectFolderOptions(sel,'',0,_moveModalIsFolder?fullPath:null);
  const currentDir=fullPath.includes('/')?fullPath.substring(0,fullPath.lastIndexOf('/')):'';
  Array.from(sel.options).forEach(opt=>{if(opt.value===currentDir)opt.disabled=true;});
  document.getElementById('moveModal').style.display='flex';
}
async function _collectFolderOptions(selectEl,path,depth,excludePath){
  const {data}=await _sb.storage.from(FILES_BUCKET).list(path,{limit:500});
  const folders=(data||[]).filter(f=>f.id===null&&f.name!=='.emptyFolderPlaceholder');
  for(const f of folders){
    const fullP=path?`${path}/${f.name}`:f.name;
    // Skip the folder being moved and its descendants
    if(excludePath&&(fullP===excludePath||fullP.startsWith(excludePath+'/')))continue;
    const indent='\u00a0\u00a0'.repeat(depth)+(depth?'└ ':'');
    const opt=document.createElement('option');opt.value=fullP;opt.textContent=indent+f.name;
    selectEl.appendChild(opt);
    if(depth<4)await _collectFolderOptions(selectEl,fullP,depth+1,excludePath);
  }
}
function closeMoveModal(){document.getElementById('moveModal').style.display='none';_moveModalTarget=null;}
document.addEventListener('keydown',ev=>{
  if(ev.key==='Escape'&&document.getElementById('moveModal')?.style.display==='flex')closeMoveModal();
});
async function confirmMove(){
  const destFolder=document.getElementById('moveFolderSelect').value;
  if(!_moveModalTarget)return;
  const itemName=_moveModalTarget.split('/').pop();
  const newFullPath=destFolder?`${destFolder}/${itemName}`:itemName;
  if(newFullPath===_moveModalTarget){closeMoveModal();return;}
  const src=_moveModalTarget;
  const isFolder=_moveModalIsFolder;
  closeMoveModal();
  if(isFolder) await _moveFolder(src,newFullPath);
  else await _moveFile(src,newFullPath);
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

/* ════════════════════════════════════════════════════
   BACKUPS — Supabase backups table
   SQL (einmalig in Supabase ausführen):
   CREATE TABLE backups (
     id BIGINT PRIMARY KEY,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     label TEXT,
     data JSONB NOT NULL
   );
   -- RLS: authenticated users dürfen lesen/schreiben/löschen
   ALTER TABLE backups ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "auth_all" ON backups FOR ALL TO authenticated USING (true) WITH CHECK (true);
   ════════════════════════════════════════════════════ */
const MAX_BACKUPS=5;

async function loadBackups(){
  const listEl=document.getElementById('backupsList');
  if(listEl)listEl.innerHTML='<div style="text-align:center;padding:40px;color:var(--text3);font-size:13px">Laden …</div>';
  const {data,error}=await _sb.from('backups').select('*').order('created_at',{ascending:false});
  if(error){
    if(listEl)listEl.innerHTML=`<div class="backup-empty"><div style="font-size:32px;margin-bottom:10px;opacity:.3">⚠️</div><div style="font-size:13px;color:var(--text3)">${esc(error.message)}</div></div>`;
    return;
  }
  renderBackupsList(data||[]);
}

function renderBackupsList(backups){
  const listEl=document.getElementById('backupsList');
  if(!listEl)return;
  // Update count display
  const countEl=document.getElementById('backupsCount');
  if(countEl)countEl.textContent=`${backups.length} / ${MAX_BACKUPS}`;
  if(!backups.length){
    listEl.innerHTML=`<div class="backup-empty"><div style="font-size:32px;margin-bottom:10px;opacity:.28">💾</div><div style="font-size:14px;color:var(--text2);margin-bottom:6px">Keine Backups</div><div style="font-size:12px;color:var(--text3)">Erstelle ein Backup, um alle Forschungstagebuch-Einträge zu sichern.</div></div>`;
    return;
  }
  listEl.innerHTML=backups.map(b=>{
    const d=new Date(b.created_at);
    const dateStr=d.toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'})+' '+d.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});
    const count=(b.data?.entries||[]).length;
    const slides=(b.data?.entries||[]).reduce((a,e)=>a+(e.slides||[]).length,0);
    return `<div class="backup-item">
      <div style="flex-shrink:0;opacity:.6;display:flex;align-items:center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg></div>
      <div class="backup-info">
        <div class="backup-label">${esc(b.label||'Backup')}</div>
        <div class="backup-meta">
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> ${dateStr}</span>
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> ${count} Einträge · ${slides} Folien</span>
        </div>
      </div>
      <div class="file-acts">
        <button class="file-act-btn dl" onclick="downloadBackup(${b.id})" title="Als JSON herunterladen">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
        <button class="file-act-btn rn" onclick="restoreBackup(${b.id})" title="Einträge aus Backup wiederherstellen">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>
        </button>
        <button class="file-act-btn del" onclick="deleteBackup(${b.id})" title="Backup löschen">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        </button>
      </div>
    </div>`;
  }).join('');
}

async function createBackup(){
  const btn=document.getElementById('btnCreateBackup');
  if(btn){btn.disabled=true;btn.textContent='Erstelle …';}
  try{
    const entries=load();
    const now=new Date();
    const label=`Backup ${now.toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'})} ${now.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}`;
    const id=Date.now();
    // Lösche älteste Backups wenn Limit überschritten
    const {data:existing,error:listErr}=await _sb.from('backups').select('id,created_at').order('created_at',{ascending:true});
    if(!listErr&&existing&&existing.length>=MAX_BACKUPS){
      const toDelete=existing.slice(0,existing.length-MAX_BACKUPS+1).map(b=>b.id);
      await _sb.from('backups').delete().in('id',toDelete);
    }
    const {error}=await _sb.from('backups').insert({id,label,data:{entries}});
    if(error){alert('Backup-Fehler: '+error.message);return;}
    await loadBackups();
  }finally{
    if(btn){btn.disabled=false;btn.innerHTML='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="3"/></svg> Backup erstellen';}
  }
}

async function downloadBackup(id){
  const {data,error}=await _sb.from('backups').select('*').eq('id',id).single();
  if(error){alert('Fehler: '+error.message);return;}
  const json=JSON.stringify(data.data,null,2);
  const blob=new Blob([json],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download=`forschungstagebuch_backup_${id}.json`;
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

async function restoreBackup(id){
  if(!confirm('Achtung: Alle aktuellen Einträge werden durch dieses Backup ersetzt. Fortfahren?'))return;
  const {data,error}=await _sb.from('backups').select('data').eq('id',id).single();
  if(error){alert('Fehler: '+error.message);return;}
  const entries=data.data?.entries||[];
  // Alle aktuellen Einträge löschen
  const allIds=load().map(e=>e.id);
  if(allIds.length){
    const {error:delErr}=await _sb.from('entries').delete().in('id',allIds);
    if(delErr){alert('Fehler beim Löschen: '+delErr.message);return;}
  }
  // Backup-Einträge einfügen
  if(entries.length){
    const rows=entries.map(e=>({id:e.id,q:e.q,datum:e.datum,pos:e.pos??10,titel:e.titel,tags:e.tags||[],slides:e.slides||[]}));
    const {error:insErr}=await _sb.from('entries').upsert(rows,{onConflict:'id'});
    if(insErr){alert('Fehler beim Wiederherstellen: '+insErr.message);return;}
  }
  _data=entries.map(e=>migrate(JSON.parse(JSON.stringify(e))));
  refreshAll();
  alert('✓ Backup erfolgreich geladen!');
}

async function deleteBackup(id){
  if(!confirm('Dieses Backup wirklich löschen?'))return;
  const {error}=await _sb.from('backups').delete().eq('id',id);
  if(error){alert('Fehler: '+error.message);return;}
  await loadBackups();
}

function triggerUploadBackup(){
  const fi=document.createElement('input');
  fi.type='file'; fi.accept='.json,application/json';
  fi.addEventListener('change',()=>{if(fi.files[0])uploadBackupFile(fi.files[0]);});
  fi.click();
}

function backupDragOver(ev){
  ev.preventDefault();
  ev.dataTransfer.dropEffect='copy';
  document.getElementById('adminBackupsSection').classList.add('backup-drop-active');
}
function backupDragLeave(ev){
  if(!ev.currentTarget.contains(ev.relatedTarget)){
    document.getElementById('adminBackupsSection').classList.remove('backup-drop-active');
  }
}
function backupDrop(ev){
  ev.preventDefault();
  document.getElementById('adminBackupsSection').classList.remove('backup-drop-active');
  const files=Array.from(ev.dataTransfer.files);
  const jsonFiles=files.filter(f=>f.name.toLowerCase().endsWith('.json')||f.type==='application/json');
  if(!files.length)return;
  if(!jsonFiles.length){alert('Nur JSON-Backup-Dateien können hochgeladen werden.\nBitte lade eine .json Datei hoch.');return;}
  if(jsonFiles.length>1){alert('Bitte nur eine Backup-Datei auf einmal hochladen.');return;}
  uploadBackupFile(jsonFiles[0]);
}

async function uploadBackupFile(file){
  let parsed;
  try{
    const text=await file.text();
    parsed=JSON.parse(text);
  }catch(e){alert('Ungültige JSON-Datei: '+e.message);return;}

  const entries=parsed?.entries||[];
  if(!Array.isArray(entries)||!entries.length){
    alert('Keine gültigen Einträge in der Backup-Datei gefunden.');return;
  }
  if(!confirm(`Achtung: ${entries.length} Einträge aus Datei laden?\nAlle aktuellen Einträge werden überschrieben. Fortfahren?`))return;

  const btn=document.getElementById('btnUploadBackup');
  if(btn){btn.disabled=true;btn.textContent='Laden …';}
  try{
    // Alle aktuellen Einträge löschen
    const allIds=load().map(e=>e.id);
    if(allIds.length){
      const {error:delErr}=await _sb.from('entries').delete().in('id',allIds);
      if(delErr){alert('Fehler beim Löschen: '+delErr.message);return;}
    }
    // Einträge aus Datei einfügen
    const rows=entries.map(e=>({id:e.id,q:e.q,datum:e.datum,pos:e.pos??10,titel:e.titel,tags:e.tags||[],slides:e.slides||[]}));
    const {error:insErr}=await _sb.from('entries').upsert(rows,{onConflict:'id'});
    if(insErr){alert('Fehler beim Wiederherstellen: '+insErr.message);return;}
    _data=entries.map(e=>migrate(JSON.parse(JSON.stringify(e))));
    refreshAll();
    // Als neues Backup-Eintrag speichern
    const now=new Date();
    const label=`Upload ${now.toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'})} ${now.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}`;
    await _sb.from('backups').insert({id:Date.now(),label,data:{entries}});
    await loadBackups();
    alert('✓ Backup aus Datei erfolgreich geladen!');
  }finally{
    if(btn){btn.disabled=false;btn.innerHTML='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Hochladen';}
  }
}

/* ════════════════════════════════════════════════════
   EINSTELLUNGEN — Supabase settings table
   SQL (einmalig in Supabase ausführen):
   CREATE TABLE settings (
     id INT PRIMARY KEY DEFAULT 1,
     default_qs_phase TEXT DEFAULT 'Q2'
   );
   INSERT INTO settings (id,default_qs_phase) VALUES (1,'Q2') ON CONFLICT DO NOTHING;
   ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "auth_all" ON settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
   ════════════════════════════════════════════════════ */

async function loadSettings(){
  if(_settingsLoaded){applySettings();initSettingsUI();return;}
  const {data,error}=await _sb.from('settings').select('*').eq('id',1).single();
  if(!error&&data){
    _settings={default_qs_phase:data.default_qs_phase||'Q2'};
  }
  _settingsLoaded=true;
  applySettings();
}

function applySettings(){
  // Standard Q-Phase für Quick Selection setzen
  if(_settings.default_qs_phase){
    _qsPhaseOpen.lehrer=_settings.default_qs_phase;
    _qsPhaseOpen.admin=_settings.default_qs_phase;
    // Auch die aktive Q-Phase im Forschungstagebuch (Lehrer-Ansicht) setzen
    activeQ.lehrer=_settings.default_qs_phase;
    buildQTabs('lehrer');
    renderL();
  }
}

function initSettingsUI(){
  const sel=document.getElementById('settingsDefaultQ');
  if(sel)sel.value=_settings.default_qs_phase||'Q2';
  document.getElementById('settingsSaveHint').textContent='';
}

function toggleSettingsCard(titleEl){
  const card=titleEl.closest('.settings-card');
  if(!card)return;
  card.classList.toggle('collapsed');
  const chevron=titleEl.querySelector('.settings-chevron');
  if(chevron)chevron.style.transform=card.classList.contains('collapsed')?'rotate(-90deg)':'rotate(0deg)';
}

async function saveSettings(){
  const sel=document.getElementById('settingsDefaultQ');
  if(!sel)return;
  _settings.default_qs_phase=sel.value;
  applySettings();
  const hint=document.getElementById('settingsSaveHint');
  // Lehrer hat keine Schreibrechte auf die settings-Tabelle → nur lokal anwenden
  if(curRole!=='admin'){
    if(hint){hint.textContent='✓ Angewendet (nur für diese Sitzung)';setTimeout(()=>{hint.textContent='';},2500);}
    return;
  }
  if(hint)hint.textContent='Speichern …';
  const {error}=await _sb.from('settings').upsert({id:1,default_qs_phase:_settings.default_qs_phase},{onConflict:'id'});
  if(hint)hint.textContent=error?'❌ Fehler beim Speichern':'✓ Gespeichert';
  if(!error){
    buildQS('lehrer');
    buildQS('admin');
    setTimeout(()=>{if(hint)hint.textContent='';},2000);
  }
}

/* ════════════════════════════════════════════════════════════════
   SQL ELEMENT — Eigener Element-Typ, der SQL-Abfragen ausführt.
   Sicherheit:
     • Die exec_sql() RPC-Funktion in Supabase läuft mit SECURITY DEFINER
       und ist nur für Admin-User (JWT-E-Mail-Check) erreichbar.
     • Im Client werden nur offensichtlich gefährliche Systemzugriffe
       (pg_catalog, information_schema etc.) gewarnt — die eigentliche
       Durchsetzung liegt beim Datenbankserver.
   ════════════════════════════════════════════════════════════════ */

/* Split raw SQL into individual statements, skipping comments and empty parts */
function _splitSqlStmts(sql){
  const stmts=[];
  let cur='', inStr=false, strCh='';
  let i=0;
  while(i<sql.length){
    const ch=sql[i];
    if(!inStr&&ch==='-'&&sql[i+1]==='-'){
      // line comment — consume until newline
      while(i<sql.length&&sql[i]!=='\n'){i++;} continue;
    }
    if(!inStr&&ch==='/'&&sql[i+1]==='*'){
      // block comment
      i+=2; while(i<sql.length&&!(sql[i-1]==='*'&&sql[i]==='/')){i++;} i++; continue;
    }
    if(!inStr&&(ch==="'"||ch==='"')){inStr=true;strCh=ch;cur+=ch;}
    else if(inStr&&ch===strCh){inStr=false;cur+=ch;}
    else if(!inStr&&ch===';'){
      const s=cur.trim(); if(s)stmts.push(s); cur='';
    } else {cur+=ch;}
    i++;
  }
  const s=cur.trim(); if(s)stmts.push(s);
  return stmts;
}

function _sqlStateEl(wrapDom,cls){
  const w=wrapDom?.querySelector('.el-sql-wrap')||wrapDom;
  if(w){w.classList.remove('sql-state-err','sql-state-ok');w.classList.add(cls);}
}
function _sqlStateClear(wrapDom){
  const w=wrapDom?.querySelector('.el-sql-wrap')||wrapDom;
  if(w)w.classList.remove('sql-state-err','sql-state-ok');
}

async function runSqlEl(elId, wrapDom){
  const el=getEl(elId); if(!el||el.type!=='sql')return;
  const query=(el.sql||'').trim();
  if(!query)return;
  // Client-side guard: block direct system-table access
  const lower=query.toLowerCase().replace(/--[^\n]*/g,'').replace(/\/\*[\s\S]*?\*\//g,'');
  const danger=['pg_catalog','information_schema','pg_shadow','pg_authid'];
  if(danger.some(d=>lower.includes(d))){
    const res=wrapDom.querySelector('.el-sql-result');
    if(res)_renderSqlResult(res,{error:'Direkte Systemtabellenabfragen sind nicht erlaubt.'});
    _sqlStateEl(wrapDom,'sql-state-err');
    return;
  }
  // Show loading state
  const runBtn=wrapDom.querySelector('.el-sql-run');
  const clearBtn=wrapDom.querySelector('.el-sql-clear');
  const codeEl=wrapDom.querySelector('.el-sql-code');
  if(runBtn){runBtn.disabled=true;runBtn.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="sql-spin" style="display:inline-block"><path d="M12 2a10 10 0 0 1 10 10"/></svg> …';}
  if(clearBtn)clearBtn.disabled=true;
  if(codeEl)_sqlStateClear(wrapDom);
  // Split into individual statements and run each separately.
  // This lets multi-statement blocks (CREATE + INSERT + SELECT) work correctly:
  // each DDL/DML auto-commits and its side-effects are visible to the next statement.
  const stmts=_splitSqlStmts(query);
  let lastResult=null;
  try{
    for(const stmt of stmts){
      const{data,error}=await _sb.rpc('exec_sql',{query_text:stmt});
      const result=error?{error:error.message}:{rows:Array.isArray(data)?data:(data?[data]:[])};
      lastResult=result;
      if(result.error)break; // stop on first error
    }
    const result=lastResult||{rows:[]};
    // Infer correct column order — PostgreSQL JSONB alphabetises keys
    if(!result.error&&result.rows&&result.rows.length){
      result.columnOrder=_inferColumnOrder(stmts,result.rows);
    }
    el.sqlResult=result;
    const res=wrapDom.querySelector('.el-sql-result');
    if(res)_renderSqlResult(res,result);
    if(codeEl){
      if(result.error)_sqlStateEl(wrapDom,'sql-state-err');
      else _sqlStateEl(wrapDom,'sql-state-ok');
    }
  }catch(e){
    const res=wrapDom.querySelector('.el-sql-result');
    if(res)_renderSqlResult(res,{error:e.message});
    if(codeEl)_sqlStateEl(wrapDom,'sql-state-err');
  }finally{
    if(runBtn){runBtn.disabled=false;runBtn.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> Ausführen';}
    if(clearBtn)clearBtn.disabled=false;
  }
}

/* ── SQL Cursor helpers (preserve caret through innerHTML rewrite) ── */
function getSqlCursor(el){
  const sel=window.getSelection();
  if(!sel||!sel.rangeCount)return 0;
  const r=sel.getRangeAt(0);
  const pre=r.cloneRange();
  pre.selectNodeContents(el);
  pre.setEnd(r.endContainer,r.endOffset);
  return pre.toString().length;
}
function setSqlCursor(el,offset){
  const sel=window.getSelection();
  if(!sel)return;
  const r=document.createRange();
  let chars=0,found=false;
  function walk(node){
    if(found)return;
    if(node.nodeType===3){
      const len=node.textContent.length;
      if(chars+len>=offset){r.setStart(node,offset-chars);r.collapse(true);found=true;}
      else chars+=len;
    } else {for(const c of node.childNodes)walk(c);}
  }
  walk(el);
  if(!found){r.selectNodeContents(el);r.collapse(false);}
  sel.removeAllRanges();sel.addRange(r);
}

/* ── SQL Syntax Highlighter ── */
function highlightSql(raw){
  if(!raw)return '';
  const segments=[];
  let i=0;
  while(i<raw.length){
    if(raw[i]==='-'&&raw[i+1]==='-'){
      const end=raw.indexOf('\n',i);
      const seg=end===-1?raw.slice(i):raw.slice(i,end);
      segments.push({t:'comment',v:seg}); i+=seg.length;
    } else if(raw[i]==='/'&&raw[i+1]==='*'){
      const end=raw.indexOf('*/',i+2);
      const seg=end===-1?raw.slice(i):raw.slice(i,end+2);
      segments.push({t:'comment',v:seg}); i+=seg.length;
    } else if(raw[i]==="'"){
      let j=i+1;
      while(j<raw.length){if(raw[j]==="'"&&raw[j-1]!=='\\'){j++;break;}j++;}
      segments.push({t:'string',v:raw.slice(i,j)}); i=j;
    } else {
      let j=i;
      while(j<raw.length&&!(raw[j]==='-'&&raw[j+1]==='-')&&!(raw[j]==='/'&&raw[j+1]==='*')&&raw[j]!=="'")j++;
      segments.push({t:'code',v:raw.slice(i,j)}); i=j;
    }
  }
  const e=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const KW=/\b(SELECT|FROM|WHERE|INSERT|INTO|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|INDEX|VIEW|DATABASE|JOIN|LEFT|RIGHT|INNER|OUTER|FULL|CROSS|ON|AS|AND|OR|NOT|IN|IS|NULL|LIKE|BETWEEN|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|DISTINCT|COUNT|SUM|AVG|MIN|MAX|UNION|ALL|WITH|VALUES|SET|PRIMARY|KEY|FOREIGN|REFERENCES|CONSTRAINT|DEFAULT|UNIQUE|CHECK|CASCADE|IF|EXISTS|RETURNING|TRUNCATE|BEGIN|COMMIT|ROLLBACK|USING)\b/gi;
  const TY=/\b(INT|INTEGER|BIGINT|SMALLINT|FLOAT|DOUBLE|DECIMAL|NUMERIC|VARCHAR|CHAR|TEXT|BOOLEAN|BOOL|DATE|TIME|TIMESTAMP|SERIAL|BIGSERIAL|UUID|JSON|JSONB|REAL)\b/gi;
  const NUM=/\b(\d+(?:\.\d+)?)\b/g;
  return segments.map(seg=>{
    if(seg.t==='comment')return`<span class="sql-hl-comment">${e(seg.v)}</span>`;
    if(seg.t==='string')return`<span class="sql-hl-string">${e(seg.v)}</span>`;
    let h=e(seg.v);
    h=h.replace(KW,m=>`<span class="sql-hl-kw">${m}</span>`);
    h=h.replace(TY,m=>`<span class="sql-hl-type">${m}</span>`);
    h=h.replace(NUM,m=>`<span class="sql-hl-num">${m}</span>`);
    return h;
  }).join('');
}

/* ── SQL Column Order Inference ──────────────────────────────────────────
   PostgreSQL gibt JSONB zurück, wobei Schlüssel alphabetisch sortiert
   werden — die ursprüngliche Spaltenreihenfolge geht verloren.
   Diese Funktion rekonstruiert die gewünschte Reihenfolge durch Parsen:
   • Explizites SELECT col1, col2 → genau diese Reihenfolge verwenden
   • SELECT *                     → Reihenfolge aus CREATE TABLE lesen  */
function _inferColumnOrder(stmts, rows){
  if(!rows||!rows.length)return[];
  const keys=Object.keys(rows[0]);
  if(keys.length<=1)return keys;

  const stripCmt=s=>s.replace(/--[^\n]*/g,'').replace(/\/\*[\s\S]*?\*\//g,'');

  // Find the last SELECT statement in the block
  const selStmt=[...stmts].reverse().find(s=>/^\s*SELECT\b/i.test(stripCmt(s)));
  if(selStmt){
    const clean=stripCmt(selStmt);
    const m=clean.match(/^\s*SELECT\s+([\s\S]+?)\s+FROM\b/i);
    if(m){
      const colList=m[1].trim();
      // Only process if no wildcard
      if(!colList.includes('*')){
        const ordered=[];
        colList.split(',').forEach(c=>{
          // Handle "expr AS alias" — take the last bare identifier as column name
          const alias=c.trim().match(/(?:\bAS\s+)?([`"[\w]?[\w]+[`"\]]?)\s*$/i);
          const name=(alias?alias[1]:c.trim()).replace(/[`"[\]]/g,'');
          const k=keys.find(k=>k.toLowerCase()===name.toLowerCase());
          if(k&&!ordered.includes(k))ordered.push(k);
        });
        // Append any remaining keys not matched (e.g. computed expressions)
        keys.forEach(k=>{if(!ordered.includes(k))ordered.push(k);});
        if(ordered.length)return ordered;
      }
    }
  }

  // For SELECT * — reconstruct order from CREATE TABLE in the same block
  const fullSql=stmts.join(';');
  const createMatch=stripCmt(fullSql).match(
    /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+\w+\s*\(([\s\S]+?)\)\s*;/i
  );
  if(createMatch){
    const ordered=[];
    createMatch[1].split(',').forEach(line=>{
      // Each line starts with the column name followed by its type
      const m2=line.trim().match(/^[`"]?(\w+)[`"]?\s+\w/);
      if(m2){
        const k=keys.find(k=>k.toLowerCase()===m2[1].toLowerCase());
        if(k&&!ordered.includes(k))ordered.push(k);
      }
    });
    if(ordered.length){
      keys.forEach(k=>{if(!ordered.includes(k))ordered.push(k);});
      return ordered;
    }
  }

  return keys; // fallback: alphabetical order as returned by JSONB
}

function _renderSqlResult(resDiv, result){
  if(!result){resDiv.innerHTML='';resDiv.style.display='none';return;}
  resDiv.style.display='block';
  if(result.error){
    resDiv.innerHTML=`<div class="sql-res-err"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span>${esc(result.error).replace(/\n/g,'<br>')}</span></div>`;
    return;
  }
  const rows=result.rows||[];
  if(!rows.length){resDiv.innerHTML='<div class="sql-res-empty">0 Zeilen zurückgegeben.</div>';return;}
  const keys=result.columnOrder||Object.keys(rows[0]);
  const thead=`<tr>${keys.map(k=>`<th>${esc(k)}</th>`).join('')}</tr>`;
  const tbody=rows.map(row=>`<tr>${keys.map(k=>{const v=row[k]==null?'<span style="opacity:.4;font-style:italic">NULL</span>':esc(String(row[k]));return`<td title="${esc(row[k]==null?'NULL':String(row[k]))}">${v}</td>`}).join('')}</tr>`).join('');
  resDiv.innerHTML=`<div class="sql-res-count">${rows.length} Zeile${rows.length!==1?'n':''} · ${keys.length} Spalte${keys.length!==1?'n':''}</div><div class="sql-res-table-wrap"><table class="sql-res-table"><thead>${thead}</thead><tbody>${tbody}</tbody></table></div>`;
}

function closeSqlModal(){
  const modal=document.getElementById('sqlResultModal');
  if(modal)modal.style.display='none';
}

/* ════════ PASTE (Ctrl+V / Cmd+V) IN EDITOR ════════
   • Image in clipboard  → creates an image element at a sensible position
   • Plain text          → creates a text element with the pasted content
   Text elements that are actively focused handle their own paste — we only
   intercept paste when the canvas / a non-editable element is focused.   */
document.addEventListener('paste', ev => {
  if (!document.getElementById('editorView').classList.contains('open')) return;

  // Let contenteditable / input elements handle their own paste natively
  const active = document.activeElement;
  if (active && (
    active.isContentEditable ||
    active.contentEditable === 'true' ||
    active.tagName === 'INPUT' ||
    active.tagName === 'TEXTAREA' ||
    active.tagName === 'SELECT'
  )) return;

  const items = ev.clipboardData?.items;
  if (!items) return;

  // ── Image ──────────────────────────────────────────────────────────
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      ev.preventDefault();
      const file = item.getAsFile();
      if (file) {
        // Place near centre of slide, slightly offset so repeated pastes stack
        const sz = slSz(curSlide()) || {w:960,h:540};
        const x = Math.round(sz.w / 2 - 140);
        const y = Math.round(sz.h / 2 - 100);
        loadImgFile(file, null, x, y);
      }
      return;
    }
  }

  // ── Plain text ─────────────────────────────────────────────────────
  for (const item of items) {
    if (item.type === 'text/plain') {
      ev.preventDefault();
      item.getAsString(text => {
        if (!text.trim() || !edEntry) return;
        const sl = curSlide(); if (!sl) return;
        pushHistory('Text eingefügt');
        const sz = slSz(sl), id = uid(), z = ++zMax;
        // Convert plain text to safe HTML (preserve line breaks)
        const safeHtml = text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\r\n|\r|\n/g, '<br>');
        const el = {
          id, type: 'text', z,
          x: 60, y: 80, w: Math.min(500, sz.w - 120), h: 200,
          html: safeHtml,
          style: {
            fontSize: 14, fontFamily: "'DM Sans',sans-serif", color: '#888077',
            fontWeight: '400', textAlign: 'left', lineHeight: 1.75,
            background: 'transparent', borderRadius: 0
          }
        };
        sl.elements.push(el);
        document.getElementById('slideCV').appendChild(buildElDOM(el));
        selectEl(id);
        renderSpanel();
      });
      return;
    }
  }
});


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
      await loadSettings();
      document.getElementById('dbLoading').style.display='none';
      showView(role+'View');
      refreshAll();
      return;
    }
  }
  document.getElementById('dbLoading').style.display='none';
  showView('loginView');
});