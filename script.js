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
  'er-optionality':   {w:72, h:40, label:'Optionalität',          stroke:'transparent',fill:'transparent'},
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
function _snapElements(action){const sl=curSlide();return sl?JSON.stringify({elements:sl.elements,slideBg:sl.slideBg,bg:sl.bg,title:sl.title||'',format:sl.format||'16:9',action:action||''}):null;}
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
  else{sl.elements=data.elements||[];if(data.slideBg!==undefined){sl.slideBg=data.slideBg; if(data.bg)sl.bg=data.bg; else delete sl.bg;}}
  if(!Array.isArray(data)){ if('title' in data)sl.title=data.title; if('format' in data&&data.format!==(sl.format||'16:9')){sl.format=data.format; setTimeout(fitSlide,30);} }
  deselectAll(); renderSlide(); applySlideSize(); populateSlideMeta(); renderSpanel(); _updateHistBtns();
}
function _stripSuffix(lbl){return lbl.replace(/ \(R\u00fckg\u00e4ngig\)$/,'').replace(/ \(Wiederholt\)$/,'');}
function edUndo(){
  if(!_undoStack.length)return;
  const topLabel=_stripSuffix(_histLabel(_undoStack[_undoStack.length-1]));
  const cur=_snapElements(topLabel+' (R\u00fckg\u00e4ngig)'); if(cur)_redoStack.push(cur);
  _restoreElements(_undoStack.pop());
  _closeHistDrops();
}
function edRedo(){
  if(!_redoStack.length)return;
  const topLabel=_stripSuffix(_histLabel(_redoStack[_redoStack.length-1]));
  const cur=_snapElements(topLabel+' (Wiederholt)'); if(cur)_undoStack.push(cur);
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
    return `<div class="ed-hist-drop-item" onmousedown="event.preventDefault();event.stopPropagation();${fn}(${n})"><span class="ed-hist-drop-n">${n}</span><span class="ed-hist-drop-lbl">${lbl}</span>${ico}</div>`;
  }).join('');
}
function _updateHistBtns(){
  const u=document.getElementById('edUndoBtn'), r=document.getElementById('edRedoBtn');
  if(u)u.disabled=!_undoStack.length;
  if(r)r.disabled=!_redoStack.length;
  _populateHistDrop('edUndoDrop',_undoStack,true);
  _populateHistDrop('edRedoDrop',_redoStack,false);
}
function _relabelSnap(snapStr,suffix){
  try{const d=JSON.parse(snapStr);const base=(d.action||'').replace(/ \(R\u00fckg\u00e4ngig\)$/,'').replace(/ \(Wiederholt\)$/,'');d.action=base+' ('+suffix+')';return JSON.stringify(d);}catch(e){return snapStr;}
}
function edUndoTo(n){
  if(!_undoStack.length)return;
  n=Math.min(n,_undoStack.length);
  const topLabel=_stripSuffix(_histLabel(_undoStack[_undoStack.length-1]));
  const cur=_snapElements(topLabel+' (R\u00fckg\u00e4ngig)'); if(cur)_redoStack.push(cur);
  for(let i=1;i<n;i++){const c=_undoStack.pop();if(c)_redoStack.push(_relabelSnap(c,'R\u00fckg\u00e4ngig'));}
  _restoreElements(_undoStack.pop());
  _closeHistDrops();
}
function edRedoTo(n){
  if(!_redoStack.length)return;
  n=Math.min(n,_redoStack.length);
  const topLabel=_stripSuffix(_histLabel(_redoStack[_redoStack.length-1]));
  const cur=_snapElements(topLabel+' (Wiederholt)'); if(cur)_undoStack.push(cur);
  for(let i=1;i<n;i++){const c=_redoStack.pop();if(c)_undoStack.push(_relabelSnap(c,'Wiederholt'));}
  _restoreElements(_redoStack.pop());
  _closeHistDrops();
}
function _clearHistory(){_undoStack=[];_redoStack=[];_updateHistBtns();}
/* Debounced push for continuous inputs (format panel sliders/numbers) */
let _histDebTimer=null,_histDebAction='';
/* Sichert den Zustand VOR der ersten Änderung eines Schubs (Regler/Eingaben = ein Eintrag).
   Früher wurde erst 400 ms danach gesichert – also NACH der Änderung; Rückgängig wirkte dann erst beim zweiten Klick. */
function pushHistoryDebounced(action){
  const key=(action||'')+'|'+selElId;
  if(!_histDebTimer||key!==_histDebAction)pushHistory(action||'Änderung');
  _histDebAction=key;
  clearTimeout(_histDebTimer);
  _histDebTimer=setTimeout(()=>{_histDebTimer=null;_histDebAction='';},500);
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
  const inn=dom.querySelector('.sel-in');if(!inn)return;
  inn.innerHTML=''; inn.appendChild(buildInnerContent(el,false));
}
function updateSymSVG(el){
  const dom=document.getElementById('sel_'+el.id);if(!dom)return;
  const inn=dom.querySelector('.sel-in');if(!inn)return;
  inn.innerHTML=''; inn.appendChild(buildInnerContent(el,false));
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
  hitLine.addEventListener('mousedown',ev=>{ev.stopPropagation();
    if(ev.ctrlKey||ev.metaKey){
      if(_multiSel.has(el.id)){_multiSel.delete(el.id);const d=document.getElementById('sel_'+el.id);if(d)d.classList.remove('multi-selected');}
      else{if(selElId&&!_multiSel.has(selElId)){_multiSel.add(selElId);const d=document.getElementById('sel_'+selElId);if(d)d.classList.add('multi-selected');}
        _multiSel.add(el.id);const d=document.getElementById('sel_'+el.id);if(d)d.classList.add('multi-selected');selElId=el.id;}
      edTab('fmt');populateMultiFmt();return;
    }
    if(_multiSel.size>0&&_multiSel.has(el.id)){startGroupMove(ev);return;}
    selectLine(el.id);startMoveLine(el.id,ev);});
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
    case 'sym-hexagon':{
      // Flat-top elliptical hexagon that fills the full bounding box
      const rx=cx-pad, ry=cy-pad;
      const pts=[0,60,120,180,240,300].map(deg=>{
        const a=deg*Math.PI/180;
        return `${(cx+rx*Math.cos(a)).toFixed(2)},${(cy+ry*Math.sin(a)).toFixed(2)}`;
      }).join(' ');
      return `<polygon points="${pts}" fill="${f}" stroke="${s}" stroke-width="${p}" stroke-linejoin="round" ${da}/>`;
    }
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
/* Returns ids of er-line/sym-arrow elements whose hit area covers (cx,cy),
   excluding excludeId, ordered by z-index descending — used for cycle selection. */
function _getOverlappingLines(cx,cy,excludeId){
  const THRESH=14; // px tolerance matching the 20px stroke-width / 2
  const sl=curSlide();if(!sl)return[];
  const cv=document.getElementById('slideCV');
  const cvRect=cv?cv.getBoundingClientRect():{left:0,top:0};
  const scale=cv?(cv.offsetWidth/(slSz(sl).w||960)):1;
  const px=(cx-cvRect.left)/scale, py=(cy-cvRect.top)/scale;
  return sl.elements
    .filter(e=>{
      if(e.id===excludeId)return false;
      if(e.type!=='er-line'&&e.type!=='sym-arrow')return false;
      // Point-to-segment distance
      const dx=e.x2-e.x1,dy=e.y2-e.y1;
      const lenSq=dx*dx+dy*dy;
      if(lenSq===0)return false;
      const t=Math.max(0,Math.min(1,((px-e.x1)*dx+(py-e.y1)*dy)/lenSq));
      const nx=e.x1+t*dx-px, ny=e.y1+t*dy-py;
      return Math.sqrt(nx*nx+ny*ny)<=THRESH;
    })
    .sort((a,b)=>(b.z||0)-(a.z||0))
    .map(e=>e.id);
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
  hitLine.addEventListener('mousedown',ev=>{
    ev.stopPropagation();
    if(ev.ctrlKey||ev.metaKey){
      if(_multiSel.has(el.id)){_multiSel.delete(el.id);const d=document.getElementById('sel_'+el.id);if(d)d.classList.remove('multi-selected');}
      else{if(selElId&&!_multiSel.has(selElId)){_multiSel.add(selElId);const d=document.getElementById('sel_'+selElId);if(d)d.classList.add('multi-selected');}
        _multiSel.add(el.id);const d=document.getElementById('sel_'+el.id);if(d)d.classList.add('multi-selected');selElId=el.id;}
      edTab('fmt');populateMultiFmt();return;
    }
    if(_multiSel.size>0&&_multiSel.has(el.id)){startGroupMove(ev);return;}
    // Cycle through overlapping arrows/lines at this position
    const candidates=_getOverlappingLines(ev.clientX,ev.clientY,el.id);
    if(candidates.length>0&&selElId===el.id){
      const next=candidates[0];selectLine(next);
      const nextEl=getEl(next);if(nextEl)nextEl.type==='sym-arrow'?startMoveArrow(next,ev):startMoveLine(next,ev);
    } else {selectLine(el.id);startMoveArrow(el.id,ev);}
  });
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
  const pad=60, x=Math.max(0,mnX-pad), y=Math.max(0,mnY-pad);
  return{x,y,w:Math.max(200,mxX+pad-x),h:Math.max(120,mxY+pad-y)};
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
    } else if(el.type==='marker'){
      const ms=el.markerStyle||{};
      const sw3=ms.strokeWidth||14, pad3=Math.ceil(sw3/2)+2;
      posStyle=`left:${(el.x||0)-pad3}px;top:${(el.y||0)-pad3}px;width:${(el.w||4)+pad3*2}px;height:${(el.h||4)+pad3*2}px;overflow:visible`;
      const pts3=(el.points||[]).map(p=>`${p.x},${p.y}`).join(' ');
      inner=`<svg style="position:absolute;inset:0;width:100%;height:100%;overflow:visible" viewBox="${-pad3} ${-pad3} ${(el.w||4)+pad3*2} ${(el.h||4)+pad3*2}"><polyline points="${pts3}" stroke="${ms.color||'#facc15'}" stroke-width="${sw3}" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="${ms.opacity!=null?ms.opacity:0.35}"/></svg>`;
    } else {
      const ex=el.x||0, ey=el.y||0, ew=Math.max(1,el.w||10), eh=Math.max(1,el.h||10);
      const bgS=(st.background&&st.background!=='transparent')?`background:${st.background};`:'';
      const radS=st.borderRadius?`border-radius:${st.borderRadius}px;`:'';
      const bdS=(st.borderWidth&&st.borderWidth>0)?`border:${st.borderWidth}px solid ${st.borderColor||'#888077'};box-sizing:border-box;`:'';
      posStyle=`left:${ex}px;top:${ey}px;width:${ew}px;height:${eh}px;overflow:hidden;${bgS}${radS}${bdS}`;

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
        const opStyle=symS2.opacity!=null&&symS2.opacity<1?`opacity:${symS2.opacity};`:'';
        const svg2=symShapeSVG(el.type,ew,eh,symS2.stroke,symS2.fill,symS2.strokeWidth||2,symS2.dashed);
        const tc2=el.style?.color||'#e4ddd0';const fs2=el.style?.fontSize||13;
        inner=`<svg viewBox="0 0 ${ew} ${eh}" width="${ew}" height="${eh}" style="position:absolute;inset:0;overflow:visible;${opStyle}">${svg2}</svg>`
             +(el.text?`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:${fs2}px;color:${tc2};text-align:center;padding:4px;overflow:hidden">${esc(el.text)}</div>`:'');
      } else if(el.type&&el.type.startsWith('er-')){
        const erS=el.erStyle||{};
        const svg=erShapeSVG(el.type,ew,eh,erS.stroke,erS.fill,erS.strokeWidth||2,erS.dashed);
        const tc = el.type==='er-cardinality' ? '#22d3ee'
                 : el.type==='er-optionality'  ? '#f87171'
                 : (el.style?.color||'#e4ddd0');
        const ff=el.style?.fontFamily||"'DM Sans',sans-serif";
        const fw=el.style?.fontWeight||600;
        const fs=el.style?.fontSize||13;
        const tdec=el.type==='er-key-attribute'?'underline':'none';
        inner=`<svg viewBox="0 0 ${ew} ${eh}" width="${ew}" height="${eh}" style="position:absolute;inset:0;overflow:visible">${svg}</svg>`
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

  // Whiteboard slides: auf den Inhaltsrahmen zuschneiden, mittig, mit begrenzter Höhe
  if(isWB(slide)){
    const bb=wbBounds(slide), th=wbThumbH(slide,tw), wsc=Math.min(tw/bb.w,th/bb.h);
    const ox=(tw-bb.w*wsc)/2-bb.x*wsc, oy=(th-bb.h*wsc)/2-bb.y*wsc;
    return `<div style="width:${tw}px;height:${th}px;overflow:hidden;border-radius:4px;position:relative;flex-shrink:0;background:${bg}">
      <div style="position:absolute;left:${ox.toFixed(1)}px;top:${oy.toFixed(1)}px;width:${sz.w}px;height:${sz.h}px;transform:scale(${wsc.toFixed(6)});transform-origin:0 0;pointer-events:none">
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
  const tags=(e.tags||[]).map((t,ti)=>isAdmin
    ?`<span class="tag tag-ed" onclick="event.stopPropagation();editETag(${e.id},${ti},this)" title="Zum Umbenennen klicken">${esc(t)}<button class="tag-x" title="Tag entfernen" onclick="event.stopPropagation();delETag(${e.id},${ti})">×</button></span>`
    :`<span class="tag">${esc(t)}</span>`).join('')
    +(isAdmin?`<span class="tag tag-add" title="Tag hinzufügen" onclick="event.stopPropagation();addETag(${e.id},this)">+ Tag</span>`:'');
  const slides=e.slides||[];
  // tw = width of the rendered preview
  // Lehrer: .ec padding left+right = 24+24px → 928-48 = 880px
  // Admin:  .ec.adm-pad padding left=42px, right=24px → 928-66 = 862px
  const tw = 880;
  const slideItems=slides.map((sl,si)=>{
    const lbl=slTitle(sl)?`<div class="ec-slide-lbl">${esc(slTitle(sl))}</div>`:'';
    return `<div class="ec-slide-item" onclick="${isAdmin?`openEditor(${e.id},${si})`:`openViewer(${e.id},${si})`}">
      ${lbl}
      <div class="ec-slide-preview" style="line-height:0">
        ${mkThumb(sl,tw)}
      </div>
      <div class="ec-slide-hint">${isAdmin?'✎ Bearbeiten':'⤢ Vollbild'}</div>
    </div>`;
  }).join('');
  const acts=isAdmin?`
    <div class="e-acts">
      <button class="ib ed" title="Bearbeiten" onclick="event.stopPropagation();openEditor(${e.id},0)"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
      <button class="ib dl" title="Löschen" onclick="event.stopPropagation();delE(${e.id})"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button>
    </div>`:
    `<button class="ib" style="color:#f87171;border-color:rgba(96,165,250,.25)" title="Folien anzeigen" onclick="event.stopPropagation();openViewer(${e.id})">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
    </button>`;
  return `<div class="ec" id="ec${e.id}" data-id="${e.id}">
    <div class="ec-hdr">
      <div class="ec-hdr-left"><span class="e-date${isAdmin?' editable':''}"${isAdmin?` onclick="event.stopPropagation();editEDate(${e.id},this)" title="Datum ändern"`:''}>${fmtD(e.datum)}</span><div class="e-tags">${tags}</div></div>
      ${acts}
    </div>
    <div class="e-title${isAdmin?' editable':''}"${isAdmin?` onclick="event.stopPropagation();editETitle(${e.id},this)" title="Zum Bearbeiten klicken"`:''}>${esc(e.titel)}</div>
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
  c.innerHTML=html;
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
    const sz=slView(sl);
    const block=document.createElement('div'); block.className='viewer-slide-block';
    const lbl=document.createElement('div'); lbl.className='viewer-slide-lbl';
    {const tt=slTitle(sl); lbl.textContent=tt; if(!tt)lbl.style.display='none';}
    const wrap=document.createElement('div'); wrap.className='viewer-slide-el';
    wrap.style.cssText=`width:${sz.w}px;height:${sz.h}px;background:${sl.slideBg||'#0c0c0c'}`;
    const stage=document.createElement('div'); stage.style.cssText=`position:absolute;left:${-sz.x}px;top:${-sz.y}px`; wrap.appendChild(stage);
    (sl.elements||[]).slice().sort((a,b)=>(a.z||0)-(b.z||0)).forEach(el=>{
      if(el.type==='er-line'){
        const b=lnBounds(el), erS=el.erStyle||{};
        const d=document.createElement('div');
        d.style.cssText=`position:absolute;left:${b.lx}px;top:${b.ly}px;width:${b.w}px;height:${b.h}px;z-index:${el.z||1};pointer-events:none;overflow:visible`;
        const sx1=el.x1-b.lx,sy1=el.y1-b.ly,sx2=el.x2-b.lx,sy2=el.y2-b.ly;
        const sw=erS.strokeWidth||2; const da=erS.dashed?`stroke-dasharray="${sw*2.5} ${sw*2}"`:'';
        d.innerHTML=`<svg style="position:absolute;inset:0;width:100%;height:100%;overflow:visible"><line x1="${sx1}" y1="${sy1}" x2="${sx2}" y2="${sy2}" stroke="${erS.stroke||'#888077'}" stroke-width="${sw}" stroke-linecap="round" ${da}/></svg>`;
        stage.appendChild(d);
      } else if(el.type==='sym-arrow'){
        const b=arrBounds(el);
        const d=document.createElement('div');
        d.style.cssText=`position:absolute;left:${b.lx}px;top:${b.ly}px;width:${b.w}px;height:${b.h}px;z-index:${el.z||1};pointer-events:none;overflow:visible`;
        d.appendChild(_buildArrowSVGEl(el,b));
        stage.appendChild(d);
      } else if(el.type==='marker'){
        const ms=el.markerStyle||{};
        const sw2=ms.strokeWidth||14, pad2=Math.ceil(sw2/2)+2;
        const d=document.createElement('div');
        d.style.cssText=`position:absolute;left:${(el.x||0)-pad2}px;top:${(el.y||0)-pad2}px;width:${(el.w||4)+pad2*2}px;height:${(el.h||4)+pad2*2}px;z-index:${el.z||1};pointer-events:none;overflow:visible`;
        const pts=(el.points||[]).map(p=>`${p.x},${p.y}`).join(' ');
        d.innerHTML=`<svg style="position:absolute;inset:0;width:100%;height:100%;overflow:visible" viewBox="${-pad2} ${-pad2} ${(el.w||4)+pad2*2} ${(el.h||4)+pad2*2}"><polyline points="${pts}" stroke="${ms.color||'#facc15'}" stroke-width="${sw2}" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="${ms.opacity!=null?ms.opacity:0.35}"/></svg>`;
        stage.appendChild(d);
      } else {
        const st=el.style||{};
        const d=document.createElement('div'); d.className='ro-el';
        d.style.cssText=`left:${el.x||0}px;top:${el.y||0}px;width:${el.w||10}px;height:${Math.max(1,el.h||10)}px;z-index:${el.z||1};border-radius:${st.borderRadius||0}px`;
        if(st.background&&st.background!=='transparent')d.style.background=st.background;
        if(st.borderWidth&&st.borderWidth>0)d.style.border=`${st.borderWidth}px solid ${st.borderColor||'#888077'}`;
        const inn2=document.createElement('div'); inn2.className='ro-in';
        inn2.appendChild(buildInnerContent(el,true,curRole==='lehrer')); d.appendChild(inn2); stage.appendChild(d);
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
  const mw=slides.length?Math.max(...slides.map(sl=>slView(sl).w)):960;
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
  const mw=Math.max(...(vEntry.slides||[]).map(sl=>slView(sl).w));
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
  SC.init(); // start loading dictionaries in background
  setTimeout(updateWordCount, 200);
  // Set initial language button state
  setSpellLang('de-DE');
  _draftOffer();
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
  if(edEntry)draftClear(edEntry.id);
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
  persist(all); draftClear(edEntry.id); refreshAll();
  document.getElementById('editorView').classList.remove('open');
  edEntry=null; selElId=null; hideGuides(); hideRTB();
}
function populateSlideMeta(){
  const sl=curSlide(); if(!sl)return;
  document.getElementById('sldSlideTitle').value=slTitle(sl);
  document.getElementById('sldFmt').value=sl.format||'16:9';
  {const f=document.getElementById('sldFmt'); if(f)f.title=FMT[sl.format||'16:9']?.label||'';}
  _bgFill();
}

/* ── Slide management ── */
function addSlide(){
  if(!edEntry)return;
  const sl={id:uid(),title:'',format:'16:9',slideBg:'#0c0c0c',elements:[]};
  edEntry.slides.push(sl); switchSlide(edEntry.slides.length-1);
  requestAnimationFrame(()=>{const l=document.getElementById('spList'); if(l){l.scrollTop=l.scrollHeight; l.scrollLeft=l.scrollWidth;}});
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
// Continuously re-center slide as edCvArea resizes (covers panel animation + window resize)
let _cvAreaRO=null;
function initCvAreaObserver(){
  if(_cvAreaRO)return;
  const area=document.getElementById('edCvArea');
  _cvAreaRO=new ResizeObserver(()=>{
    if(!document.getElementById('editorView').classList.contains('open')||!edEntry)return;
    const sl=curSlide(); if(!sl)return;
    const sz=slSz(sl), aw=area.clientWidth, ah=area.clientHeight;
    if(_cvKeep){_syncKeep();return;}
    // Only recompute offset so scale is preserved during panel animation
    const c=_cvCenter(); cvOffX=c.x-sz.w*cvScale/2; cvOffY=c.y-sz.h*cvScale/2;
    applyTf();
  });
  _cvAreaRO.observe(area);
}
function renderSpanel(){
  const list=document.getElementById('spList'); const _sT=list.scrollTop,_sL=list.scrollLeft; list.innerHTML='';
  let spDragSrc=null, lastTh=81;
  (edEntry?.slides||[]).forEach((sl,i)=>{
    const tw=144, sz=slSz(sl), th=isWB(sl)?wbThumbH(sl,tw):Math.round(tw*sz.h/sz.w); lastTh=th;
    const item=document.createElement('div'); item.className='sp-item'+(i===edSlideIdx?' active':'');
    item.draggable=true; item.dataset.idx=i;
    item.innerHTML=`<div class="sp-item-thumb" style="height:${th}px">${mkThumb(sl,tw)}<span class="sp-num">${i+1}</span></div>
      <div class="sp-item-foot"><input class="sp-item-title-inp" value="${esc(slTitle(sl))}" placeholder="Folie ${i+1}" title="Doppelklick zum Umbenennen" data-idx="${i}"><button class="sp-item-del" onclick="event.stopPropagation();deleteSlide(${i})">×</button></div>`;
    item.addEventListener('click',ev=>{if(ev.target.tagName!=='INPUT'&&ev.target.tagName!=='BUTTON')switchSlide(i);});
    const inp=item.querySelector('.sp-item-title-inp');
    inp.addEventListener('click',ev=>ev.stopPropagation());
    inp.addEventListener('change',ev=>{
      ev.stopPropagation();
      const sl2=edEntry?.slides?.[i]; if(sl2){if(i===edSlideIdx)pushHistory('Folientitel geändert'); sl2.title=inp.value.trim();renderSpanel();if(i===edSlideIdx)document.getElementById('sldSlideTitle').value=sl2.title;}
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
  if(edEntry){
    const add=document.createElement('div'); add.className='sp-item sp-add-tile'; add.tabIndex=0; add.setAttribute('role','button');
    add.title='Neue Folie hinzufügen'; add.setAttribute('aria-label','Neue Folie hinzufügen');
    /* gleiche Bauteile wie eine Folie (Vorschau + Fußzeile), damit Breite und Höhe exakt übereinstimmen */
    add.innerHTML='<div class="sp-item-thumb" style="height:'+lastTh+'px"></div>'
      +'<div class="sp-item-foot" aria-hidden="true" style="visibility:hidden"><input class="sp-item-title-inp" tabindex="-1" disabled><button type="button" class="sp-item-del" tabindex="-1">×</button></div>'
      +'<svg class="sp-add-plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
    add.onclick=()=>addSlide();
    add.onkeydown=ev=>{ if(ev.key==='Enter'||ev.key===' '){ ev.preventDefault(); addSlide(); } };
    list.appendChild(add);
  }
  list.scrollTop=_sT; list.scrollLeft=_sL;
}

/* ── Canvas ── */
function applySlideSize(){
  const sl=curSlide(); if(!sl)return;
  const sz=slSz(sl), slide=document.getElementById('slideCV');
  const fmt=FMT[sl.format||'16:9']||FMT['16:9'];
  slide.style.width=sz.w+'px'; slide.style.height=sz.h+'px';
  slide.style.background=sl.slideBg||'#0c0c0c'; _bgFill();
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
  const sl=curSlide(); if(!sl)return;
  const sz=slSz(sl), c=_cvCenter();
  if(isWB(sl)){
    // Whiteboard: Inhalt (oder Startbereich) auf die Bildschirmmitte legen
    const bb=wbBounds(sl), vw=Math.max(bb.w,960), vh=Math.max(bb.h,540);
    cvScale=Math.min(2*c.hw/vw,2*c.hh/vh,1);
    cvOffX=c.x-(bb.x+bb.w/2)*cvScale;
    cvOffY=c.y-(bb.y+bb.h/2)*cvScale;
  } else {
    cvScale=Math.min(2*c.hw/sz.w,2*c.hh/sz.h,1);
    cvOffX=c.x-sz.w*cvScale/2; cvOffY=c.y-sz.h*cvScale/2;
  }
  applyTf();
}
/* Bildschirmmitte relativ zur Arbeitsfläche + nutzbare Halbbreite/-höhe um diese Mitte.
   Gerechnet wird, als wären alle Leisten ausgeklappt – so ändert Ein-/Ausklappen weder Position noch Größe. */
const _DK_FULL={ed:{w:252,h:236},sp:{w:158,h:178}};
function _cvCenter(){
  const a=document.getElementById('edCvArea').getBoundingClientRect();
  let L=a.left,R=a.right,T=a.top,B=a.bottom;
  [['ed','edSb'],['sp','spPanel']].forEach(([k,id])=>{
    const p=document.getElementById(id);
    if(!p||!p.classList.contains('collapsed')||getComputedStyle(p).display==='none')return;
    const s=_dock[k], v=(s==='top'||s==='bottom'), d=(v?_DK_FULL[k].h:_DK_FULL[k].w)-18;
    if(s==='left')L+=d; else if(s==='right')R-=d; else if(s==='top')T+=d; else B-=d;
  });
  const cx=window.innerWidth/2, cy=window.innerHeight/2;
  let hw=Math.min(cx-L,R-cx)-40, hh=Math.min(cy-T-56,B-cy-40);
  if(hw<60||hh<60){ // sehr kleines Fenster: Mitte der Arbeitsfläche nehmen
    return {x:a.width/2,y:a.height/2,hw:Math.max(30,(a.width-80)/2),hh:Math.max(30,(a.height-80)/2)};
  }
  return {x:cx-a.left,y:cy-a.top,hw,hh};
}
function applyTf(){
  document.getElementById('slideCV').style.transform=`translate(${cvOffX}px,${cvOffY}px) scale(${cvScale})`;
  document.getElementById('edZoomPct').textContent=Math.round(cvScale*100)+'%';
  _posSlHdr();
  // Re-render spell underlay positions after zoom/pan since they use getBoundingClientRect
  clearTimeout(applyTf._scTimer);
  applyTf._scTimer=setTimeout(()=>{
    (curSlide()?.elements||[]).forEach(el=>{
      if(el.type==='title'||el.type==='text') SC.renderLayer(el.id);
    });
  },120);
}
document.addEventListener('wheel',ev=>{
  if(!document.getElementById('editorView').classList.contains('open'))return;
  if(!ev.target.closest('#edCvArea'))return;
  ev.preventDefault();
  const rect=document.getElementById('edCvArea').getBoundingClientRect();
  const mx=ev.clientX-rect.left, my=ev.clientY-rect.top, d=ev.deltaY<0?1.1:0.91;
  const ns=Math.max(.08,Math.min(4,cvScale*d)), k=ns/cvScale;
  if(Math.abs(k-1)<1e-9)return;            // Zoom-Limit erreicht: Ansicht nicht weiter verschieben
  cvOffX=mx-(mx-cvOffX)*k; cvOffY=my-(my-cvOffY)*k;
  cvScale=ns; applyTf();
},{passive:false});
// Die (overflow:hidden) Arbeitsfläche darf nie von selbst scrollen, z. B. beim Fokussieren eines Textes im Zoom
document.addEventListener('scroll',ev=>{ const t=ev.target; if(t&&t.id==='edCvArea'&&(t.scrollTop||t.scrollLeft)){ t.scrollTop=0; t.scrollLeft=0; } },true);
function onCvDown(ev){
  const slideCV=document.getElementById('slideCV');
  if(ev.target===document.getElementById('edCvArea')||ev.target===slideCV){
    deselectAll();hideRTB();
    const rect=slideCV?.getBoundingClientRect();
    if(rect&&!ev.ctrlKey&&!ev.metaKey){
      const lx=(ev.clientX-rect.left)/cvScale, ly=(ev.clientY-rect.top)/cvScale;
      if(_markerMode){
        // Start freehand marker drawing (canvas background click path)
        _beginMarkerDraw(ev,lx,ly);
        return;
      }
      MS={type:'lasso',sx:ev.clientX,sy:ev.clientY,lx0:lx,ly0:ly,snap:null};
      ev.preventDefault();
    }
  }
}
function onSlideBgDown(ev){
  if(ev.target===document.getElementById('slideCV')){
    if(_markerMode)return; // handled by onCvDown via the slideCV check
    deselectAll();hideRTB();
  }
}
function onCvDrop(ev){
  ev.preventDefault(); ev.stopPropagation();
  const files=ev.dataTransfer.files; if(!files.length)return;
  if(!files[0].type.startsWith('image/')){
    // .json-Datei auf die Folie gezogen → Automat importieren
    if(/\.json$/i.test(files[0].name)||files[0].type==='application/json') autoHandleDroppedJSON(files[0],ev);
    return;
  }
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
    else if(el.type==='marker') slide.appendChild(buildMarkerDom(el));
    else slide.appendChild(buildElDOM(el));
  });
  // Schedule spell check for all text elements after DOM is settled
  setTimeout(()=>{
    els.forEach(el=>{
      if(el.type==='title'||el.type==='text') SC.scheduleCheck(el.id, 400);
    });
    updateWordCount();
  }, 50);
}

/* ── Build element DOM ── */
function buildElDOM(el){
  const st=el.style||{};
  const wrap=document.createElement('div'); wrap.className='sel';
  wrap.id='sel_'+el.id; wrap.dataset.elid=el.id;
  wrap.style.cssText=`left:${el.x||0}px;top:${el.y||0}px;width:${el.w||100}px;height:${Math.max(1,el.h||30)}px;z-index:${el.z||10};border-radius:${st.borderRadius||0}px;box-sizing:border-box`;
  if(st.background&&st.background!=='transparent')wrap.style.background=st.background;
  wrap.style.boxShadow='';
  if(st.borderWidth&&st.borderWidth>0)wrap.style.border=`${st.borderWidth}px solid ${st.borderColor||'#888077'}`;
  else wrap.style.border='';

  const bd=document.createElement('div'); bd.className='sel-bd'; wrap.appendChild(bd);
  // Wider overlay for easier clicking
  const ov=document.createElement('div'); ov.className='sel-ov'; wrap.appendChild(ov);
  _attachElCtxMenu(ov, el.id);
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
      edTab('fmt');populateMultiFmt();
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

function typeLabel(t){return{regmachine:'Registermaschine',title:'Überschrift',text:'Text',code:'Code',sql:'SQL',image:'Bild',divider:'Linie',badge:'Badge',marker:'Markierung','er-entity':'Entität','er-weak-entity':'Schwache Entität','er-relation':'Beziehungstyp','er-weak-relation':'Schw. Beziehungstyp','er-attribute':'Attribut','er-key-attribute':'Schlüsselattr.','er-multi-attribute':'Mehrwertiger Attr.','er-derived-attr':'Abgel. Attribut','er-isa':'IS-A','er-line':'Verbindungslinie','er-cardinality':'Kardinalität','er-optionality':'Optionalität','sym-rect':'Rechteck','sym-rounded-rect':'Abg. Rechteck','sym-circle':'Kreis','sym-ellipse':'Ellipse','sym-triangle':'Dreieck','sym-right-tri':'Rechtes Dreieck','sym-diamond':'Raute','sym-hexagon':'Sechseck','sym-parallelogram':'Parallelogramm','sym-star':'Stern','sym-cylinder':'Zylinder','sym-arrow':'Pfeil','automaton':'Endlicher Automat','mealy':'Mealy-Automat','syntax':'Syntaxdiagramm','regex':'Regulärer Ausdruck',table:'Tabelle'}[t]||t;}

function _closestLI(node, root){
  while(node&&node!==root){if(node.nodeName==='LI')return node;node=node.parentNode;}
  return null;
}
function _indentLI(li, root){
  if(!li||li.nodeName!=='LI')return;
  const parentList=li.parentNode; // <ul> or <ol>
  if(!parentList)return;
  const prevLI=li.previousElementSibling;
  if(!prevLI||prevLI.nodeName!=='LI'){
    // No previous sibling — already at start of list, can't indent further
    return;
  }
  // Find or create a sub-list inside prevLI
  let subList=prevLI.querySelector(':scope > ul, :scope > ol');
  if(!subList){
    subList=document.createElement(parentList.nodeName); // same tag as parent (ul/ol)
    prevLI.appendChild(subList);
  }
  subList.appendChild(li);
}
function _outdentLI(li, root){
  if(!li||li.nodeName!=='LI')return;
  const parentList=li.parentNode; // <ul> or <ol> this LI lives in
  if(!parentList)return;
  const grandparentLI=parentList.parentNode; // might be <li> if nested
  if(!grandparentLI||grandparentLI.nodeName!=='LI'){
    // Already at top level — nothing to do
    return;
  }
  const greatGrandparentList=grandparentLI.parentNode; // outer <ul>/<ol>
  if(!greatGrandparentList)return;
  // Insert li after grandparentLI in the outer list
  const after=grandparentLI.nextSibling;
  greatGrandparentList.insertBefore(li, after);
  // Clean up empty sub-list if nothing left
  if(parentList.children.length===0)parentList.remove();
}

function buildInnerContent(el, readOnly, canRunSql=false){
  const st=el.style||{};
  if(el.type==='title'||el.type==='text'){
    const div=document.createElement('div'); div.className='el-text';
    div.contentEditable=readOnly?'false':'true'; div.spellcheck=false; /* eigener Prüfer (SC) übernimmt */
    div.style.cssText=`font-size:${st.fontSize||14}px;font-family:${st.fontFamily||"'DM Sans',sans-serif"};color:${st.color||'#e4ddd0'};font-weight:${st.fontWeight||400};font-style:${st.fontStyle||'normal'};text-decoration:${st.textDecoration||'none'};text-align:${st.textAlign||'left'};line-height:${st.lineHeight||1.6}`;
    // Set innerHTML AFTER style so browser doesn't re-wrap content
    div.innerHTML=el.html||'';
    // Apply per-level list symbols (works in all views — editor, reader, teacher, thumbnail)
    if(el.listLevelSyms&&el.listLevelSyms.length)_applyListSymsToDom(div, el.listLevelSyms);
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
        SC.scheduleCheck(el.id);     // re-draw after debounce, keeps old underlines visible
        updateWordCount();
      });
      div.addEventListener('paste',ev=>{
        ev.preventDefault();ev.stopPropagation();
        const html=ev.clipboardData?.getData('text/html')||'';
        const plain=ev.clipboardData?.getData('text/plain')||'';
        if(!plain&&!html)return;
        pasteInline(div,el.id,html,plain);
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
          // Collapse selection to only the LI items that are actually selected,
          // so indent/outdent doesn't bleed into adjacent items.
          const range=sel.getRangeAt(0);
          const startLI=_closestLI(range.startContainer,div);
          const endLI=_closestLI(range.endContainer,div);
          if(startLI&&endLI&&startLI!==endLI){
            // Multi-LI selection: indent each selected LI individually
            const lis=[startLI];
            let cur=startLI.nextElementSibling;
            while(cur&&cur!==endLI.nextElementSibling){if(cur.nodeName==='LI')lis.push(cur);cur=cur.nextElementSibling;}
            lis.forEach(li=>{
              if(ev.shiftKey){_outdentLI(li,div);}
              else{_indentLI(li,div);}
            });
          } else {
            if(ev.shiftKey){_outdentLI(startLI||node,div);}
            else{_indentLI(startLI||node,div);}
          }
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
  if(el.type==='table'){ return buildTableWidget(el, readOnly); }
  if(el.type==='automaton'||el.type==='mealy'){ return buildAutomatonWidget(el, readOnly, canRunSql); }
  if(el.type==='syntax'){ return buildSyntaxWidget(el, readOnly, canRunSql); }
  if(el.type==='regex'){ return buildRegexWidget(el, readOnly, canRunSql); }
  if(el.type==='regmachine'){ return buildRegMachine(el, readOnly); }
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
  if(el.type==='divider'){const d=document.createElement('div');d.className='el-divider';d.innerHTML='<hr>';const s=el.style||{},hr=d.firstChild;if(s.lineColor)hr.style.borderTopColor=s.lineColor;if(s.lineWidth)hr.style.borderTopWidth=s.lineWidth+'px';return d;}
  if(el.type==='badge'){
    const d=document.createElement('div');d.className='el-badge';
    const p=document.createElement('div');p.className='el-badge-inner';
    p.contentEditable=readOnly?'false':'true'; p.textContent=el.text||'Badge';
    {const s=el.style||{}; if(s.badgeFg)p.style.color=s.badgeFg; if(s.badgeBg)p.style.background=s.badgeBg; if(s.badgeBd)p.style.borderColor=s.badgeBd;}
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
    if(symS.opacity!=null&&symS.opacity<1) svg.style.opacity=symS.opacity;
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
    if(el.type==='er-optionality')txt.classList.add('el-er-optionality');
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
      const e=getEl(elId); if(!e)return; pushHistory('Bild geändert'); e.src=ev.target.result;
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
function flushEl(keep){
  if(!selElId)return; const el=getEl(selElId); if(!el)return;
  const dom=document.getElementById('sel_'+selElId); if(!dom)return;
  const ce=dom.querySelector('.el-text');
  if(ce){ el.html=ce.innerHTML; if(!keep&&document.activeElement===ce) ce.blur(); }
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
  const mc=document.getElementById('fmtMultiCtrl');if(mc)mc.style.display='none';
  edTab('fmt'); populateFmt(el);
  if(el.type==='title'||el.type==='text') SC.scheduleCheck(id, 800);
}
function selectLine(id){
  deselectAll(); selElId=id;
  const dom=document.getElementById('sel_'+id);
  if(dom){dom.classList.add('selected');dom.style.zIndex=++zMax;}
  const el=getEl(id); if(!el)return;
  const mc=document.getElementById('fmtMultiCtrl');if(mc)mc.style.display='none';
  edTab('fmt'); populateFmt(el);
}
function deselectAll(){
  closeElOptions();
  flushEl();
  document.querySelectorAll('.sel.selected,.er-line-el.selected').forEach(d=>d.classList.remove('selected'));
  _multiSel.forEach(id=>{const d=document.getElementById('sel_'+id);if(d)d.classList.remove('multi-selected');});
  _multiSel.clear();
  selElId=null;
  document.getElementById('fmtEmpty').style.display='block';
  document.getElementById('fmtCtrl').style.display='none';
  const mc=document.getElementById('fmtMultiCtrl');if(mc)mc.style.display='none';
  hideConnDots();
}

/* ════════ MULTI-SELECTION FORMAT PANEL ════════ */
function populateMultiFmt(){
  const ids=[..._multiSel];
  if(ids.length===0){deselectAll();return;}
  document.getElementById('fmtEmpty').style.display='none';
  document.getElementById('fmtCtrl').style.display='none';
  let mc=document.getElementById('fmtMultiCtrl');
  if(!mc){
    mc=document.createElement('div');mc.id='fmtMultiCtrl';
    document.getElementById('fmtCtrl').parentNode.appendChild(mc);
  }
  mc.style.display='block';
  mc.innerHTML=`<div class="fmt-type-pill" style="margin-bottom:10px">${ids.length} Elemente ausgewählt</div>
    <div style="font-size:11px;color:var(--text2);margin-bottom:8px">Element anklicken zum Bearbeiten:</div>
    <div id="fmtMultiList"></div>
    <div id="fmtMultiSub" style="margin-top:12px;border-top:1px solid var(--border);padding-top:12px;display:none"></div>`;
  const list=mc.querySelector('#fmtMultiList');
  ids.forEach(id=>{
    const el=getEl(id); if(!el)return;
    const row=document.createElement('div');
    row.className='fmt-multi-row';
    row.dataset.elid=id;
    row.innerHTML=`<span class="fmt-multi-icon">${_multiTypeIcon(el.type)}</span><span class="fmt-multi-lbl">${typeLabel(el.type)}</span><span class="fmt-multi-arr">›</span>`;
    row.addEventListener('click',()=>{
      list.querySelectorAll('.fmt-multi-row').forEach(r=>r.classList.remove('active'));
      row.classList.add('active');
      _showMultiSub(el);
    });
    list.appendChild(row);
  });
}

function _multiTypeIcon(type){
  if(type==='title')return '𝐓';
  if(type==='text')return '¶';
  if(type==='image')return '🖼';
  if(type==='code')return '<>';
  if(type==='sym-arrow')return '↗';
  if(type&&type.startsWith('er-'))return '◇';
  if(type&&type.startsWith('sym-'))return '⬡';
  return '▭';
}

function _showMultiSub(el){
  const sub=document.getElementById('fmtMultiSub'); if(!sub)return;
  sub.style.display='block';
  // Temporarily set selElId so populateFmt controls work
  const prev=selElId; selElId=el.id;
  // Build a mini clone of fmtCtrl showing only relevant sections
  sub.innerHTML=`<div style="font-size:11px;font-weight:600;color:var(--gold);margin-bottom:10px;text-transform:uppercase;letter-spacing:.04em">${typeLabel(el.type)}</div>`;
  const clone=document.getElementById('fmtCtrl').cloneNode(true);
  clone.id='fmtCtrlSub'; clone.style.display='block';
  // Remove delete button and position controls from sub (not needed for individual config in group)
  const delBtn=clone.querySelector('.btn-del-el'); if(delBtn)delBtn.remove();
  sub.appendChild(clone);
  // Now populate the cloned controls — we need to wire them to this element
  _populateFmtInto(el, clone);
  selElId=prev;
}

function _populateFmtInto(el, container){
  const st=el.style||{}, erS=el.erStyle||{};
  const isText=el.type==='title'||el.type==='text';
  const isER=el.type&&el.type.startsWith('er-')&&el.type!=='er-line'&&el.type!=='er-cardinality'&&el.type!=='er-optionality';
  const isLine=el.type==='er-line';
  const isSym=el.type&&el.type.startsWith('sym-')&&el.type!=='sym-arrow';
  const isArrow=el.type==='sym-arrow';
  const pill=container.querySelector('#fmtTypePill');if(pill)pill.style.display='none';
  const hide=id=>{const d=container.querySelector('#'+id);if(d)d.style.display='none';};
  const show=id=>{const d=container.querySelector('#'+id);if(d)d.style.display='block';};
  hide('fmtTextSec');hide('fmtERSec');hide('fmtLineSec');hide('fmtSymSec');hide('fmtArrowSec');
  if(isText)show('fmtTextSec'); if(isER)show('fmtERSec'); if(isLine)show('fmtLineSec');
  if(isSym)show('fmtSymSec'); if(isArrow)show('fmtArrowSec');
  // Populate values
  if(isText){
    const f=container.querySelector('#fmtFont');if(f)f.value=st.fontFamily||"'DM Sans',sans-serif";
    const s=container.querySelector('#fmtSize');if(s)s.value=st.fontSize||14;
    const c=container.querySelector('#fmtColor');if(c)c.value=toHex(st.color||'#e4ddd0');
    const lh=container.querySelector('#fmtLH');if(lh)lh.value=st.lineHeight||1.6;
    const tbc=container.querySelector('#fmtTextBorderColor');if(tbc)tbc.value=toHex(st.borderColor||'#888077');
    const tbw=container.querySelector('#fmtTextBorderWidth');if(tbw)tbw.value=st.borderWidth||0;
    const nb=container.querySelector('#fmtTextNoBorder');
    if(nb){nb.checked=!st.borderWidth||st.borderWidth===0;}
  }
  if(isER){
    const sto=container.querySelector('#fmtStroke');if(sto)sto.value=toHex(erS.stroke||'#e8a030');
    const {hex:fhex,alpha:falpha}=_parseFill(erS.fill||'rgba(232,160,48,.09)');
    const fi=container.querySelector('#fmtFill');if(fi)fi.value=fhex;
    const fop=container.querySelector('#fmtFillOp');if(fop)fop.value=falpha;
    const fopV=container.querySelector('#fmtFillOpV');if(fopV)fopV.textContent=Math.round(falpha*100)+'%';
    const sw=container.querySelector('#fmtSW');if(sw)sw.value=erS.strokeWidth||2;
    const da=container.querySelector('#fmtDash');if(da)da.checked=!!erS.dashed;
  }
  if(isLine){
    const lc=container.querySelector('#fmtLC');if(lc)lc.value=toHex(erS.stroke||'#888077');
    const lsw=container.querySelector('#fmtLSW');if(lsw)lsw.value=erS.strokeWidth||2;
    const ld=container.querySelector('#fmtLDash');if(ld)ld.checked=!!erS.dashed;
  }
  if(isSym){
    const symS=el.symStyle||{};
    const ss=container.querySelector('#fmtSymStroke');if(ss)ss.value=toHex(symS.stroke||'#e8a030');
    const {hex:sfhex,alpha:sfalpha}=_parseFill(symS.fill||'rgba(232,160,48,.09)');
    const sf=container.querySelector('#fmtSymFill');if(sf)sf.value=sfhex;
    const sfOp=container.querySelector('#fmtSymFillOp');if(sfOp)sfOp.value=sfalpha;
    const sfOpV=container.querySelector('#fmtSymFillOpV');if(sfOpV)sfOpV.textContent=Math.round(sfalpha*100)+'%';
    const sop2=symS.opacity??1;
    const sOpEl=container.querySelector('#fmtSymOpacity');if(sOpEl)sOpEl.value=sop2;
    const sOpV2=container.querySelector('#fmtSymOpacityV');if(sOpV2)sOpV2.textContent=Math.round(sop2*100)+'%';
    const ssw=container.querySelector('#fmtSymSW');if(ssw)ssw.value=symS.strokeWidth||2;
    const sd=container.querySelector('#fmtSymDash');if(sd)sd.checked=!!symS.dashed;
    const sc=container.querySelector('#fmtSymColor');if(sc)sc.value=toHex(el.style?.color||'#e4ddd0');
    const sfs=container.querySelector('#fmtSymFontSize');if(sfs)sfs.value=el.style?.fontSize||13;
  }
  if(isArrow){
    const arS=el.arrowStyle||{};
    const ac=container.querySelector('#fmtArrowColor');if(ac)ac.value=toHex(arS.stroke||'#e8a030');
    const asw=container.querySelector('#fmtArrowSW');if(asw)asw.value=arS.strokeWidth||2;
    const ad=container.querySelector('#fmtArrowDash');if(ad)ad.checked=!!arS.dashed;
    const ast=container.querySelector('#fmtArrowStart');if(ast)ast.value=arS.startType||'none';
    const aen=container.querySelector('#fmtArrowEnd');if(aen)aen.value=arS.endType||'filled';
    const asz=container.querySelector('#fmtArrowSize');if(asz)asz.value=arS.markerSize||9;
  }
  const bg=st.background||'transparent';
  const bgT=container.querySelector('#fmtBgT');if(bgT)bgT.checked=!bg||bg==='transparent';
  const bgC=container.querySelector('#fmtBg');if(bgC)bgC.value=(!bg||bg==='transparent')?'#000000':toHex(bg);
  const rad=container.querySelector('#fmtRad');if(rad)rad.value=st.borderRadius||0;
  const radV=container.querySelector('#fmtRadV');if(radV)radV.textContent=st.borderRadius||0;
  const radRow=container.querySelector('#fmtRadRow');if(radRow)radRow.style.display=(isER||isLine)?'none':'block';
  // Populate position fields
  if(isArrow){
    const b=arrBounds(el);
    const xi=container.querySelector('#fmtX');if(xi)xi.value=Math.round(b.lx);
    const yi=container.querySelector('#fmtY');if(yi)yi.value=Math.round(b.ly);
    const wi=container.querySelector('#fmtW');if(wi)wi.value=Math.round(b.w);
    const hi=container.querySelector('#fmtH');if(hi)hi.value=Math.round(b.h);
  } else if(isLine){
    const b=lnBounds(el);
    const xi=container.querySelector('#fmtX');if(xi)xi.value=Math.round(b.lx);
    const yi=container.querySelector('#fmtY');if(yi)yi.value=Math.round(b.ly);
    const wi=container.querySelector('#fmtW');if(wi)wi.value=Math.round(b.w);
    const hi=container.querySelector('#fmtH');if(hi)hi.value=Math.round(b.h);
  } else {
    const xi=container.querySelector('#fmtX');if(xi)xi.value=Math.round(el.x||0);
    const yi=container.querySelector('#fmtY');if(yi)yi.value=Math.round(el.y||0);
    const wi=container.querySelector('#fmtW');if(wi)wi.value=Math.round(el.w||0);
    const hi=container.querySelector('#fmtH');if(hi)hi.value=Math.round(el.h||0);
  }
  // Wire all inputs to apply changes to this specific element
  _wireMultiSubInputs(container, el);
}

function _wireMultiSubInputs(container, el){
  // Remove old oninput/onchange attrs from cloned nodes and add new listeners
  const rewire=(sel, applyFn)=>{
    const d=container.querySelector(sel); if(!d)return;
    d.oninput=null; d.onchange=null;
    d.addEventListener('input', ()=>applyFn(d));
    d.addEventListener('change', ()=>applyFn(d));
  };
  const isText=el.type==='title'||el.type==='text';
  const isER=el.type&&el.type.startsWith('er-')&&el.type!=='er-line'&&el.type!=='er-cardinality'&&el.type!=='er-optionality';
  const isLine=el.type==='er-line';
  const isSym=el.type&&el.type.startsWith('sym-')&&el.type!=='sym-arrow';
  const isArrow=el.type==='sym-arrow';
  const applyElStyle=(prop,val)=>{
    pushHistoryDebounced('Gruppenformatierung geändert');
    el.style=el.style||{}; el.style[prop]=val;
    const dom=document.getElementById('sel_'+el.id);
    if(dom){
      if(prop==='borderRadius')dom.style.borderRadius=val+'px';
      if(prop==='background')dom.style.background=(!val||val==='transparent')?'':val;
      if(prop==='borderColor'||prop==='borderWidth'){
        if(prop==='borderColor'&&!(el.style.borderWidth>0)){
          el.style.borderWidth=1;
          const fmtTBW=container.querySelector('#fmtTextBorderWidth');if(fmtTBW)fmtTBW.value=1;
          const fmtNBCb2=container.querySelector('#fmtTextNoBorder');if(fmtNBCb2)fmtNBCb2.checked=false;_noBorderActive=false;
        }
        const bw=el.style.borderWidth||0;
        const bc=el.style.borderColor||'#888077';
        dom.style.boxShadow='';
        dom.style.border=bw>0?`${bw}px solid ${bc}`:'';
      }
      const inn=dom.querySelector('.el-text');
      if(inn&&['fontFamily','fontSize','color','lineHeight'].includes(prop)){
        if(prop==='fontSize')inn.style.fontSize=val+'px'; else inn.style[prop]=val;
      }
    }
    _spRefresh();
  };
  if(isText){
    rewire('#fmtFont', d=>applyElStyle('fontFamily',d.value));
    rewire('#fmtSize', d=>applyElStyle('fontSize',+d.value));
    rewire('#fmtColor', d=>applyElStyle('color',d.value));
    rewire('#fmtLH', d=>applyElStyle('lineHeight',+d.value));
    rewire('#fmtTextBorderColor', d=>applyElStyle('borderColor',d.value));
    rewire('#fmtTextBorderWidth', d=>applyElStyle('borderWidth',+d.value));
  }
  if(isER){
    rewire('#fmtStroke', d=>{pushHistoryDebounced('ER-Stil geändert');el.erStyle=el.erStyle||{};el.erStyle.stroke=d.value;updateERSVG(el);_spRefresh();});
    rewire('#fmtFill', d=>{applyERSt('fillColor',d.value);});
    rewire('#fmtFillOp', d=>{applyERSt('fillOpacity',+d.value);const v=container.querySelector('#fmtFillOpV');if(v)v.textContent=Math.round(+d.value*100)+'%';});
    rewire('#fmtSW', d=>{pushHistoryDebounced('ER-Stil geändert');el.erStyle=el.erStyle||{};el.erStyle.strokeWidth=+d.value;updateERSVG(el);_spRefresh();});
    rewire('#fmtDash', d=>{pushHistoryDebounced('ER-Stil geändert');el.erStyle=el.erStyle||{};el.erStyle.dashed=d.checked;updateERSVG(el);_spRefresh();});
  }
  if(isLine){
    rewire('#fmtLC', d=>{pushHistoryDebounced('Linienstil geändert');el.erStyle=el.erStyle||{};el.erStyle.stroke=d.value;updateLineDom(el);_spRefresh();});
    rewire('#fmtLSW', d=>{pushHistoryDebounced('Linienstil geändert');el.erStyle=el.erStyle||{};el.erStyle.strokeWidth=+d.value;updateLineDom(el);_spRefresh();});
    rewire('#fmtLDash', d=>{pushHistoryDebounced('Linienstil geändert');el.erStyle=el.erStyle||{};el.erStyle.dashed=d.checked;updateLineDom(el);_spRefresh();});
  }
  if(isSym){
    rewire('#fmtSymStroke', d=>{pushHistoryDebounced('Symbol-Stil geändert');el.symStyle=el.symStyle||{};el.symStyle.stroke=d.value;updateSymSVG(el);_spRefresh();});
    rewire('#fmtSymFill', d=>{applySymSt('fillColor',d.value);});
    rewire('#fmtSymFillOp', d=>{applySymSt('fillOpacity',+d.value);const v=container.querySelector('#fmtSymFillOpV');if(v)v.textContent=Math.round(+d.value*100)+'%';});
    rewire('#fmtSymOpacity', d=>{applySymSt('opacity',+d.value);const v=container.querySelector('#fmtSymOpacityV');if(v)v.textContent=Math.round(+d.value*100)+'%';});
    rewire('#fmtSymSW', d=>{pushHistoryDebounced('Symbol-Stil geändert');el.symStyle=el.symStyle||{};el.symStyle.strokeWidth=+d.value;updateSymSVG(el);_spRefresh();});
    rewire('#fmtSymDash', d=>{pushHistoryDebounced('Symbol-Stil geändert');el.symStyle=el.symStyle||{};el.symStyle.dashed=d.checked;updateSymSVG(el);_spRefresh();});
    rewire('#fmtSymColor', d=>{applyElStyle('color',d.value);});
    rewire('#fmtSymFontSize', d=>{applyElStyle('fontSize',+d.value);});
  }
  if(isArrow){
    const applyArr=(prop,val)=>{pushHistoryDebounced('Pfeil-Stil geändert');el.arrowStyle=el.arrowStyle||{};el.arrowStyle[prop]=val;updateArrowDom(el);_spRefresh();};
    rewire('#fmtArrowColor', d=>applyArr('stroke',d.value));
    rewire('#fmtArrowSW', d=>applyArr('strokeWidth',+d.value));
    rewire('#fmtArrowDash', d=>applyArr('dashed',d.checked));
    rewire('#fmtArrowStart', d=>applyArr('startType',d.value));
    rewire('#fmtArrowEnd', d=>applyArr('endType',d.value));
    rewire('#fmtArrowSize', d=>applyArr('markerSize',+d.value));
  }
  // Background + radius for all
  rewire('#fmtBg', d=>{applyElStyle('background',d.value);});
  rewire('#fmtBgT', d=>{applyElStyle('background',d.checked?'transparent':document.getElementById('fmtBg').value);});
  rewire('#fmtRad', d=>{applyElStyle('borderRadius',+d.value);const rv=container.querySelector('#fmtRadV');if(rv)rv.textContent=d.value;});
  // Disable position inputs in sub (they'd conflict with group move)
  ['#fmtX','#fmtY','#fmtW','#fmtH'].forEach(sel=>{
    const d=container.querySelector(sel);if(d){d.disabled=true;d.title='Position in Gruppenauswahl nicht editierbar';}
  });
  // Disable align/order buttons
  container.querySelectorAll('.fmt-tog').forEach(b=>{b.disabled=true;b.style.opacity='0.4';});
}

/* ════════ FORMAT PANEL ════════ */
function populateFmt(el){
  const st=el.style||{}, erS=el.erStyle||{};
  document.getElementById('fmtEmpty').style.display='none';
  document.getElementById('fmtCtrl').style.display='block';
  document.getElementById('fmtTypePill').textContent=typeLabel(el.type);
  const isText=el.type==='title'||el.type==='text';
  const isER=el.type&&el.type.startsWith('er-')&&el.type!=='er-line'&&el.type!=='er-cardinality'&&el.type!=='er-optionality';
  const isLine=el.type==='er-line';
  const isSym=el.type&&el.type.startsWith('sym-')&&el.type!=='sym-arrow';
  const isArrow=el.type==='sym-arrow';
  const isCode=el.type==='code';
  const isMarker=el.type==='marker';
  document.getElementById('fmtTextSec').style.display=isText?'block':'none';
  document.getElementById('fmtERSec').style.display=isER?'block':'none';
  document.getElementById('fmtLineSec').style.display=isLine?'block':'none';
  const symSec=document.getElementById('fmtSymSec'); if(symSec)symSec.style.display=isSym?'block':'none';
  const arrowSec=document.getElementById('fmtArrowSec'); if(arrowSec)arrowSec.style.display=isArrow?'block':'none';
  const markerSec=document.getElementById('fmtMarkerSec'); if(markerSec)markerSec.style.display=isMarker?'block':'none';
  const sqlSec=document.getElementById('fmtSqlSec');
  if(sqlSec)sqlSec.style.display='none';
  const autoSec=document.getElementById('fmtAutoSec'); if(autoSec) autoSec.style.display=(el.type==='automaton'||el.type==='mealy')?'block':'none';
  const synSec=document.getElementById('fmtSynSec'); if(synSec) synSec.style.display=el.type==='syntax'?'block':'none';
  const tblSec=document.getElementById('fmtTblSec'); if(tblSec){ tblSec.style.display=el.type==='table'?'block':'none'; if(el.type==='table') _tblSync(el); }
  if(isText){
    document.getElementById('fmtFont').value=st.fontFamily||"'DM Sans',sans-serif";
    document.getElementById('fmtSize').value=st.fontSize||14;
    rtbCurrentSize=st.fontSize||14;
    document.getElementById('fmtColor').value=toHex(st.color||'#e4ddd0');
    document.getElementById('fmtLH').value=st.lineHeight||1.6;
    const fmtTBC=document.getElementById('fmtTextBorderColor');
    const fmtTBW=document.getElementById('fmtTextBorderWidth');
    const fmtNBCb=document.getElementById('fmtTextNoBorder');
    if(fmtTBC)fmtTBC.value=toHex(st.borderColor||'#888077');
    if(fmtTBW)fmtTBW.value=st.borderWidth||0;
    _noBorderActive=!st.borderWidth||st.borderWidth===0;
    if(fmtNBCb)fmtNBCb.checked=_noBorderActive;
  }
  if(isER){
    const sto=document.getElementById('fmtStroke');if(sto)sto.value=toHex(erS.stroke||'#e8a030');
    const {hex:fhex,alpha:falpha}=_parseFill(erS.fill||'rgba(232,160,48,.09)');
    const fi=document.getElementById('fmtFill');if(fi)fi.value=fhex;
    const fop=document.getElementById('fmtFillOp');if(fop)fop.value=falpha;
    const fopV=document.getElementById('fmtFillOpV');if(fopV)fopV.textContent=Math.round(falpha*100)+'%';
    const sw=document.getElementById('fmtSW');if(sw)sw.value=erS.strokeWidth||2;
    const da=document.getElementById('fmtDash');if(da)da.checked=!!erS.dashed;
  }
  if(isLine){
    document.getElementById('fmtLC').value=toHex(erS.stroke||'#888077');
    document.getElementById('fmtLSW').value=erS.strokeWidth||2;
    document.getElementById('fmtLDash').checked=!!erS.dashed;
  }
  if(isSym){
    const symS=el.symStyle||{};
    const symStroke=document.getElementById('fmtSymStroke');if(symStroke)symStroke.value=toHex(symS.stroke||'#e8a030');
    const {hex:sfhex,alpha:sfalpha}=_parseFill(symS.fill||'rgba(232,160,48,.09)');
    const symFill=document.getElementById('fmtSymFill');if(symFill)symFill.value=sfhex;
    const sfOp=document.getElementById('fmtSymFillOp');if(sfOp)sfOp.value=sfalpha;
    const sfOpV=document.getElementById('fmtSymFillOpV');if(sfOpV)sfOpV.textContent=Math.round(sfalpha*100)+'%';
    const symOp=document.getElementById('fmtSymOpacity');const sop=symS.opacity??1;if(symOp)symOp.value=sop;
    const symOpV=document.getElementById('fmtSymOpacityV');if(symOpV)symOpV.textContent=Math.round(sop*100)+'%';
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
  if(isMarker){
    const ms=el.markerStyle||{};
    const mc=document.getElementById('fmtMarkerColor');if(mc)mc.value=toHex(ms.color||'#facc15');
    const msw=document.getElementById('fmtMarkerSW');if(msw)msw.value=ms.strokeWidth||14;
    const mop=document.getElementById('fmtMarkerOpacity');
    const mopV=document.getElementById('fmtMarkerOpacityV');
    const opVal=ms.opacity!=null?ms.opacity:0.35;
    if(mop)mop.value=opVal;
    if(mopV)mopV.textContent=Math.round(opVal*100)+'%';
  }
  const bg=st.background||'transparent';
  document.getElementById('fmtBgT').checked=!bg||bg==='transparent';
  document.getElementById('fmtBg').value=(!bg||bg==='transparent')?'#000000':toHex(bg);
  document.getElementById('fmtRad').value=st.borderRadius||0;
  document.getElementById('fmtRadV').textContent=st.borderRadius||0;
  // Hide background/radius controls for marker and ER line elements
  const bgSec=document.querySelector('#ep-fmt .sec-hdr:has(+ .sec-body #fmtBg)');
  const radRow=document.getElementById('fmtRadRow');
  if(radRow) radRow.style.display=(isER||isLine||isMarker)?'none':'block';
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
    if(prop==='borderColor'&&!(el.style.borderWidth>0)){
      el.style.borderWidth=1;
      const fmtTBW=document.getElementById('fmtTextBorderWidth');if(fmtTBW)fmtTBW.value=1;
      const fmtNBCb2=document.getElementById('fmtTextNoBorder');if(fmtNBCb2)fmtNBCb2.checked=false;_noBorderActive=false;
    }
    if(prop==='borderWidth'&&val>0&&!el.style.borderColor){
      el.style.borderColor='#888077';
      const fmtTBC=document.getElementById('fmtTextBorderColor');if(fmtTBC)fmtTBC.value='#888077';
    }
    const bw=el.style.borderWidth||0;
    const bc=el.style.borderColor||'#888077';
    dom.style.boxShadow='';
    dom.style.border=bw>0?`${bw}px solid ${bc}`:'';
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
/* Parse any fill value into {hex, alpha} so the opacity slider and color picker stay in sync */
function _parseFill(fill){
  if(!fill||fill==='transparent') return {hex:'#000000', alpha:0};
  if(fill.startsWith('#')) return {hex:fill.slice(0,7), alpha:1};
  // rgb(r,g,b)
  let m=fill.match(/^rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)$/);
  if(m){const h=(n=>n<16?'0'+n.toString(16):n.toString(16));return{hex:'#'+h(+m[1])+h(+m[2])+h(+m[3]),alpha:1};}
  // rgba(r,g,b,a)
  m=fill.match(/^rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\s*\)$/);
  if(m){const h=(n=>n<16?'0'+n.toString(16):n.toString(16));return{hex:'#'+h(+m[1])+h(+m[2])+h(+m[3]),alpha:+m[4]};}
  return {hex:'#000000', alpha:1};
}
function _composeFill(hex, alpha){
  if(alpha<=0) return 'transparent';
  if(alpha>=1) return hex;
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function applyERSt(prop,val){
  if(!selElId)return; const el=getEl(selElId); if(!el)return;
  pushHistoryDebounced('ER-Stil geändert');
  el.erStyle=el.erStyle||{};
  if(prop==='fillColor'){
    const {alpha}=_parseFill(el.erStyle.fill||'transparent');
    el.erStyle.fill=_composeFill(val,alpha);
  } else if(prop==='fillOpacity'){
    const {hex}=_parseFill(el.erStyle.fill||'#000000');
    el.erStyle.fill=_composeFill(hex,val);
  } else {
    el.erStyle[prop]=val;
  }
  if(el.type==='er-line'){updateLineDom(el);_spRefresh();return;}
  updateERSVG(el); _spRefresh();
}
function applySymSt(prop,val){
  if(!selElId)return; const el=getEl(selElId); if(!el)return;
  pushHistoryDebounced('Symbol-Stil geändert');
  el.symStyle=el.symStyle||{};
  if(prop==='fillColor'){
    const {alpha}=_parseFill(el.symStyle.fill||'transparent');
    el.symStyle.fill=_composeFill(val,alpha);
  } else if(prop==='fillOpacity'){
    const {hex}=_parseFill(el.symStyle.fill||'#000000');
    el.symStyle.fill=_composeFill(hex,val);
  } else {
    el.symStyle[prop]=val;
  }
  updateSymSVG(el); _spRefresh();
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
let _noBorderActive=false;
function clearTextBorder(disable){
  _noBorderActive=!!disable;
  const cb=document.getElementById('fmtTextNoBorder');
  if(cb)cb.checked=_noBorderActive;
  if(!selElId)return;
  const el=getEl(selElId);if(!el)return;
  el.style=el.style||{};
  if(_noBorderActive){
    pushHistoryDebounced('Rahmen entfernt');
    el.style.borderWidth=0;
    const dom=document.getElementById('sel_'+selElId);if(dom){dom.style.border='';dom.style.boxShadow='';}
    const fmtTBW=document.getElementById('fmtTextBorderWidth');if(fmtTBW)fmtTBW.value=0;
  } else {
    pushHistoryDebounced('Rahmen aktiviert');
    if(!(el.style.borderWidth>0))el.style.borderWidth=1;
    const bw=el.style.borderWidth||1, bc=el.style.borderColor||'#888077';
    const dom=document.getElementById('sel_'+selElId);if(dom){dom.style.boxShadow='';dom.style.border=`${bw}px solid ${bc}`;}
    const fmtTBW=document.getElementById('fmtTextBorderWidth');if(fmtTBW)fmtTBW.value=bw;
  }
  _spRefresh();
}

/* ════ LIST SUBMENU ════ */
const _LIST_SYMS={
  disc:'•', circle:'○', square:'■', dash:'—', arrow:'→',
  check:'✓', diamond:'◆', star:'★',
  decimal:'1.', 'lower-alpha':'a.', 'lower-roman':'i.', 'upper-alpha':'A.'
};
const _DEF_UL_LEVELS=['disc','circle','square','dash'];
const _DEF_OL_LEVELS=['decimal','lower-alpha','lower-roman','upper-alpha'];

let _listMenuHideTimer=null;
function showListMenu(){
  cancelHideListMenu();
  const menu=document.getElementById('rtbListMenu'); if(!menu)return;
  _buildLmLevels();
  const btn=document.getElementById('rtbListBtn');
  if(btn){
    const br=btn.getBoundingClientRect();
    menu.style.display='block';
    const mh=menu.offsetHeight;
    menu.style.left=br.left+'px';
    menu.style.top=(br.top-mh-8)+'px';
  }
}
function schedHideListMenu(){
  _listMenuHideTimer=setTimeout(()=>{
    const menu=document.getElementById('rtbListMenu');if(menu)menu.style.display='none';
  },120);
}
function cancelHideListMenu(){clearTimeout(_listMenuHideTimer);}

function _getLevelSyms(){
  const el=selElId?getEl(selElId):null;
  return el?.listLevelSyms||[..._DEF_UL_LEVELS];
}
function _buildLmLevels(){
  const cont=document.getElementById('rtbLmLevels'); if(!cont)return;
  const syms=_getLevelSyms();
  const allOpts=Object.entries(_LIST_SYMS);
  cont.innerHTML='';
  [0,1,2,3].forEach(lvl=>{
    const row=document.createElement('div'); row.className='rtb-lm-lvl-row';
    const lbl=document.createElement('span'); lbl.className='rtb-lm-lvl-lbl'; lbl.textContent=`Ebene ${lvl+1}`;
    const sel=document.createElement('select'); sel.className='rtb-lm-lvl-sel';
    allOpts.forEach(([k,v])=>{
      const opt=document.createElement('option');
      opt.value=k; opt.textContent=`${v}  ${k}`;
      if((syms[lvl]||_DEF_UL_LEVELS[lvl])===k)opt.selected=true;
      sel.appendChild(opt);
    });
    sel.addEventListener('mousedown',e=>e.stopPropagation());
    sel.addEventListener('change',()=>_setLevelSym(lvl,sel.value));
    row.appendChild(lbl); row.appendChild(sel);
    cont.appendChild(row);
  });
}
function _setLevelSym(level, symKey){
  if(!selElId)return;
  const el=getEl(selElId); if(!el)return;
  el.listLevelSyms=el.listLevelSyms||[..._DEF_UL_LEVELS];
  el.listLevelSyms[level]=symKey;
  pushHistoryDebounced('Listensymbol geändert');
  _applyListLevelSyms(selElId);
  syncSavedToEl();
}
/* Apply per-level list symbols directly to a DOM container — works in editor,
   viewer, teacher view and thumbnails alike (no scoped CSS needed). */
function _applyListSymsToDom(container, syms){
  if(!container||!syms)return;
  const CUSTOM={dash:'—',arrow:'→',check:'✓',diamond:'◆',star:'★'};
  function _depth(listEl){
    let d=0, n=listEl.parentNode;
    while(n&&n!==container){if(n.nodeName==='UL'||n.nodeName==='OL')d++;n=n.parentNode;}
    return d;
  }
  container.querySelectorAll('ul,ol').forEach(listEl=>{
    const lvl=Math.min(_depth(listEl), syms.length-1);
    const symKey=syms[lvl]||'disc';
    if(CUSTOM[symKey]){
      listEl.style.listStyleType='none';
      Array.from(listEl.children).forEach(li=>{
        if(li.nodeName!=='LI')return;
        let b=li.querySelector(':scope>.custom-bullet');
        if(!b){
          b=document.createElement('span');b.className='custom-bullet';
          b.style.cssText='margin-right:.4em;display:inline-block;min-width:1em';
          li.insertBefore(b,li.firstChild);
        }
        b.textContent=CUSTOM[symKey];
      });
    } else {
      listEl.style.listStyleType=symKey;
      Array.from(listEl.children).forEach(li=>{
        if(li.nodeName!=='LI')return;
        li.querySelectorAll(':scope>.custom-bullet').forEach(b=>b.remove());
      });
    }
  });
}
function _applyListLevelSyms(elId){
  const el=getEl(elId); if(!el)return;
  const syms=el.listLevelSyms||_DEF_UL_LEVELS;
  document.querySelectorAll(`[data-elid="${elId}"] .el-text, #sel_${elId} .el-text`).forEach(d=>_applyListSymsToDom(d,syms));
}
function applyListType(tag, styleType){
  if(!restoreRange())return;
  const cmd=tag==='ul'?'insertUnorderedList':'insertOrderedList';
  document.execCommand('styleWithCSS',false,true);
  const sel=window.getSelection(); if(!sel||!sel.rangeCount)return;
  const existing=_closestList(sel.anchorNode);
  if(existing){_convertListType(existing, tag, styleType);}
  else {
    document.execCommand(cmd,false,null);
    const newSel=window.getSelection();
    if(newSel&&newSel.rangeCount){const newList=_closestList(newSel.anchorNode);if(newList)_setListStyleType(newList, styleType);}
  }
  if(selElId){
    const el=getEl(selElId);
    if(el){
      el.listLevelSyms=el.listLevelSyms||[..._DEF_UL_LEVELS];
      el.listLevelSyms[0]=styleType||'disc';
      const ce=document.querySelector(`#sel_${selElId} .el-text`);
      if(ce)_applyListSymsToDom(ce, el.listLevelSyms);
    }
  }
  syncSavedToEl(); saveRange(); setTimeout(posRTB,10);
}
function _closestList(node){
  while(node){if(node.nodeName==='UL'||node.nodeName==='OL')return node;node=node.parentNode;}
  return null;
}
function _setListStyleType(listEl, styleType){
  const custom={dash:'—',arrow:'→',check:'✓',diamond:'◆',star:'★'};
  if(custom[styleType]){
    listEl.style.listStyleType='none';
    Array.from(listEl.children).forEach(li=>{
      if(li.nodeName!=='LI')return;
      let b=li.querySelector(':scope>.custom-bullet');
      if(!b){b=document.createElement('span');b.className='custom-bullet';b.style.cssText='margin-right:.4em;display:inline-block;min-width:1em';li.insertBefore(b,li.firstChild);}
      b.textContent=custom[styleType];
    });
  } else {
    listEl.style.listStyleType=styleType;
    Array.from(listEl.children).forEach(li=>{if(li.nodeName==='LI')li.querySelectorAll(':scope>.custom-bullet').forEach(b=>b.remove());});
  }
}
function _convertListType(listEl, newTag, styleType){
  if(listEl.nodeName!==newTag.toUpperCase()){
    const newList=document.createElement(newTag);
    newList.style.cssText=listEl.style.cssText;
    while(listEl.firstChild)newList.appendChild(listEl.firstChild);
    listEl.parentNode.replaceChild(newList,listEl);
    _setListStyleType(newList, styleType);
  } else {_setListStyleType(listEl, styleType);}
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
function snapCH(){if(!selElId)return;const el=getEl(selElId);if(!el||el.type==='er-line')return;pushHistory('Position geändert');const sz=slSz(curSlide());el.x=Math.round(sz.w/2-(el.w||0)/2);const d=document.getElementById('sel_'+selElId);if(d)d.style.left=el.x+'px';refreshFP(el);}
function snapCV(){if(!selElId)return;const el=getEl(selElId);if(!el||el.type==='er-line')return;pushHistory('Position geändert');const sz=slSz(curSlide());el.y=Math.round(sz.h/2-(el.h||0)/2);const d=document.getElementById('sel_'+selElId);if(d)d.style.top=el.y+'px';refreshFP(el);}
function bringFwd(){if(!selElId)return;const el=getEl(selElId);if(!el)return;pushHistory('Ebene nach vorn');el.z=++zMax;const d=document.getElementById('sel_'+selElId);if(d)d.style.zIndex=el.z;}
function sendBck(){if(!selElId)return;const el=getEl(selElId);if(!el)return;pushHistory('Ebene nach hinten');el.z=Math.max(1,(el.z||10)-5);const d=document.getElementById('sel_'+selElId);if(d)d.style.zIndex=el.z;}
function deleteEl(id){
  if(!edEntry)return; const sl=curSlide(); if(!sl)return;
  pushHistory(typeLabel(getEl(id)?.type||'')+' gel\u00f6scht');
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
  pushHistory(typeLabel(type)+' hinzugef\u00fcgt');
  const sz=slSz(sl), id=uid(), z=++zMax;
  let el={id,type,z,style:{}};
  if(type==='title') Object.assign(el,{x:40,y:28,w:Math.min(sz.w-80,880),h:66,html:'',style:{fontSize:34,fontFamily:"'Playfair Display',serif",color:'#e4ddd0',fontWeight:'900',textAlign:'left',lineHeight:1.2,background:'transparent',borderRadius:0}});
  else if(type==='text') Object.assign(el,{x:60,y:80,w:380,h:200,html:'',style:{fontSize:14,fontFamily:"'DM Sans',sans-serif",color:'#888077',fontWeight:'400',textAlign:'left',lineHeight:1.75,background:'transparent',borderRadius:0}});
  else if(type==='code') Object.assign(el,{x:60,y:80,w:380,h:200,html:'// Code hier',style:{fontSize:13,fontFamily:"'JetBrains Mono',monospace",color:'#7dd3fc',background:'#030303',borderRadius:8}});
  else if(type==='sql') Object.assign(el,{x:60,y:80,w:420,h:260,sql:'SELECT * FROM entries LIMIT 10;',sqlResult:null,style:{fontSize:13,fontFamily:"'JetBrains Mono',monospace",color:'#a3e635',background:'#030303',borderRadius:8}});
  else if(type==='automaton'){
    const s0={id:uid(),x:110,y:160,label:'q0',start:true,accept:false};
    Object.assign(el,{x:60,y:80,w:560,h:400,automaton:{states:[s0],transitions:[],test:''},style:{background:'#030303',borderRadius:8}});
  }
  else if(type==='mealy'){
    const s0={id:uid(),x:110,y:160,label:'q0',start:true,accept:false};
    Object.assign(el,{x:60,y:80,w:560,h:440,automaton:{states:[s0],transitions:[],test:''},style:{background:'#030303',borderRadius:8}});
  }
  else if(type==='table'){ Object.assign(el,{x:60,y:80,w:420,h:116,table:_tblDefault(3,3),style:{background:'transparent',borderRadius:6}}); setTimeout(()=>_tblFit(id),80); }
  else if(type==='syntax') Object.assign(el,{x:60,y:80,w:660,h:470,syntax:{source:SYN_DEFAULT_SRC,test:''},style:{background:'#030303',borderRadius:8}});
  else if(type==='regmachine') Object.assign(el,{x:60,y:60,w:660,h:500,rm:{prog:_RM_DEF,init:'R1=3, R2=4'},style:{fontSize:12,background:'#030303',borderRadius:8}});
  else if(type==='regex') Object.assign(el,{x:60,y:80,w:420,h:320,regex:{pattern:'',icase:false,fullMatch:true,tests:'',results:null},style:{fontSize:13,fontFamily:"'JetBrains Mono',monospace",color:'#a3e635',background:'#030303',borderRadius:8}});
  else if(type==='image') Object.assign(el,{x:60,y:80,w:280,h:200,style:{background:'transparent',borderRadius:4}});
  else if(type==='divider') Object.assign(el,{x:40,y:Math.round(sz.h/2),w:Math.min(sz.w-80,880),h:4,style:{background:'transparent',borderRadius:0}});
  else if(type==='badge') Object.assign(el,{x:60,y:80,w:200,h:40,text:'Badge',style:{background:'transparent',borderRadius:0}});
  else if(type==='er-line'){
    const cx=Math.round(sz.w/2), cy=Math.round(sz.h/2);
    Object.assign(el,{x1:cx-90,y1:cy,x2:cx+90,y2:cy,erStyle:{stroke:'#888077',strokeWidth:2,dashed:false}});
  } else if(type==='er-cardinality'){
    const cx=Math.round(sz.w/2), cy=Math.round(sz.h/2);
    Object.assign(el,{x:cx-25,y:cy-20,w:50,h:40,text:_cardDefault,style:{fontSize:17,fontFamily:"'JetBrains Mono',monospace",color:'#22d3ee',fontWeight:'700',textAlign:'center',lineHeight:1.2,background:'transparent',borderRadius:0},erStyle:{stroke:'transparent',fill:'transparent',strokeWidth:0,dashed:false}});
  } else if(type==='er-optionality'){
    const cx=Math.round(sz.w/2), cy=Math.round(sz.h/2);
    Object.assign(el,{x:cx-36,y:cy-20,w:72,h:40,text:_optDefault,style:{fontSize:13,fontFamily:"'JetBrains Mono',monospace",color:'#f87171',fontWeight:'700',textAlign:'center',lineHeight:1.2,background:'transparent',borderRadius:0},erStyle:{stroke:'transparent',fill:'transparent',strokeWidth:0,dashed:false}});
  } else if(type==='sym-arrow'){
    const cx=Math.round(sz.w/2),cy=Math.round(sz.h/2);
    const ad=_arrowDefaults;
    Object.assign(el,{x1:cx-100,y1:cy,x2:cx+100,y2:cy,arrowStyle:{stroke:ad.stroke,strokeWidth:ad.strokeWidth,dashed:ad.dashed,startType:ad.startType,endType:ad.endType,markerSize:ad.markerSize}});
  } else if(type&&type.startsWith('sym-')){
    const d=SYMD[type]||{},cx=Math.round(sz.w/2),cy=Math.round(sz.h/2);
    const sd=_symDefaults;
    Object.assign(el,{x:cx-Math.round((d.w||120)/2),y:cy-Math.round((d.h||80)/2),w:d.w||120,h:d.h||80,text:'',style:{background:'transparent',borderRadius:0,color:'#e4ddd0',fontSize:13,fontFamily:"'DM Sans',sans-serif"},symStyle:{stroke:sd.stroke,fill:_composeFill(sd.fillColor,sd.fillOpacity),strokeWidth:sd.strokeWidth,dashed:sd.dashed,opacity:sd.opacity}});
  } else if(type&&type.startsWith('er-')){
    const d=ERD[type]||{}, cx=Math.round(sz.w/2), cy=Math.round(sz.h/2);
    Object.assign(el,{x:cx-Math.round((d.w||140)/2),y:cy-Math.round((d.h||60)/2),w:d.w||140,h:d.h||60,text:d.label||'',style:{background:'transparent',borderRadius:0},erStyle:{stroke:d.stroke||'#e8a030',fill:d.fill||'transparent',strokeWidth:2,dashed:false}});
  }
  sl.elements.push(el);
  if(type==='er-line') document.getElementById('slideCV').appendChild(buildLineDom(el));
  else if(type==='sym-arrow') document.getElementById('slideCV').appendChild(buildArrowDom(el));
  else if(type==='marker') document.getElementById('slideCV').appendChild(buildMarkerDom(el));
  else document.getElementById('slideCV').appendChild(buildElDOM(el));
  if(type==='er-line'||type==='sym-arrow') selectLine(id); else selectEl(id);
  renderSpanel();
}

/* ════════ MARKER ELEMENT ════════ */
/* Ramer-Douglas-Peucker path simplifier */
function _rdp(pts, eps){
  if(pts.length<3)return pts.slice();
  let maxD=0, idx=0;
  const [ax,ay]=pts[0], [bx,by]=pts[pts.length-1];
  const abLen=Math.hypot(bx-ax,by-ay);
  for(let i=1;i<pts.length-1;i++){
    const [px,py]=pts[i];
    const d=abLen<0.001?Math.hypot(px-ax,py-ay):Math.abs((by-ay)*px-(bx-ax)*py+(bx*ay-by*ax))/abLen;
    if(d>maxD){maxD=d;idx=i;}
  }
  if(maxD>eps){
    const r1=_rdp(pts.slice(0,idx+1),eps);
    const r2=_rdp(pts.slice(idx),eps);
    return [...r1.slice(0,-1),...r2];
  }
  return [pts[0],pts[pts.length-1]];
}
/* Compute tight bbox of a point array [{x,y}] */
function _mrkBounds(pts){
  let x1=Infinity,y1=Infinity,x2=-Infinity,y2=-Infinity;
  pts.forEach(p=>{if(p.x<x1)x1=p.x;if(p.y<y1)y1=p.y;if(p.x>x2)x2=p.x;if(p.y>y2)y2=p.y;});
  return {x:x1,y:y1,w:Math.max(4,x2-x1),h:Math.max(4,y2-y1)};
}
/* Build SVG polyline string from local points */
function _mrkPolyStr(el){
  const pts=el.points||[];
  return pts.map(p=>`${p.x},${p.y}`).join(' ');
}
/* Build DOM for a marker element */
function buildMarkerDom(el){
  const ms=el.markerStyle||{};
  const color=ms.color||'#facc15';
  const sw=ms.strokeWidth||14;
  const op=ms.opacity!=null?ms.opacity:0.35;
  const pad=Math.ceil(sw/2)+2; // padding so stroke isn't clipped
  const x=el.x||0, y=el.y||0, w=el.w||4, h=el.h||4;

  const wrap=document.createElement('div');
  wrap.className='sel marker-el'; wrap.id='sel_'+el.id; wrap.dataset.elid=el.id;
  wrap.style.cssText=`left:${x-pad}px;top:${y-pad}px;width:${w+pad*2}px;height:${h+pad*2}px;z-index:${el.z||10};position:absolute;pointer-events:none`;

  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.style.cssText='position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none';
  svg.setAttribute('viewBox',`${-pad} ${-pad} ${w+pad*2} ${h+pad*2}`);

  const pl=document.createElementNS('http://www.w3.org/2000/svg','polyline');
  pl.setAttribute('points',_mrkPolyStr(el));
  pl.setAttribute('stroke',color);
  pl.setAttribute('stroke-width',sw);
  pl.setAttribute('stroke-linecap','round');
  pl.setAttribute('stroke-linejoin','round');
  pl.setAttribute('fill','none');
  pl.setAttribute('opacity',op);
  svg.appendChild(pl);
  wrap.appendChild(svg);

  // Invisible hit overlay for clicking/selecting
  const ov=document.createElement('div');
  ov.className='sel-ov marker-ov';
  ov.style.cssText=`position:absolute;inset:0;cursor:move;pointer-events:auto`;
  _attachElCtxMenu(ov, el.id);
  ov.addEventListener('mousedown',ev=>{
    ev.stopPropagation();
    if(ev.ctrlKey||ev.metaKey){
      if(_multiSel.has(el.id)){_multiSel.delete(el.id);wrap.classList.remove('multi-selected');}
      else{if(selElId&&!_multiSel.has(selElId)){_multiSel.add(selElId);const d2=document.getElementById('sel_'+selElId);if(d2)d2.classList.add('multi-selected');}
        _multiSel.add(el.id);wrap.classList.add('multi-selected');selElId=el.id;}
      edTab('fmt');populateMultiFmt();return;
    }
    if(_multiSel.size>0&&_multiSel.has(el.id)){startGroupMove(ev);return;}
    _multiSel.forEach(id=>{const d2=document.getElementById('sel_'+id);if(d2)d2.classList.remove('multi-selected');});_multiSel.clear();
    selectEl(el.id);startMoveMarker(el.id,ev);
  });
  wrap.appendChild(ov);

  // Drag bar at top
  // pointer-events:auto is critical: the wrapper has pointer-events:none, so the bar
  // must explicitly re-enable them. This also keeps the parent's :hover active when
  // the cursor moves from the element up into the bar (CSS :hover fires for any
  // interactive descendant, even one positioned at top:-26px), preventing the bar
  // from vanishing before the user can reach it.
  const bar=document.createElement('div'); bar.className='sel-bar';
  bar.style.pointerEvents='auto';
  wrap.appendChild(bar);
  bar.innerHTML=`<span class="sel-bar-grip">⠿⠿</span><span class="sel-bar-lbl">Markierung</span>`;
  const xb=document.createElement('button'); xb.className='sel-bar-x'; xb.textContent='×';
  xb.addEventListener('click',ev=>{ev.stopPropagation();deleteEl(el.id);}); bar.appendChild(xb);
  bar.addEventListener('mousedown',ev=>{ev.preventDefault();ev.stopPropagation();selectEl(el.id);startMoveMarker(el.id,ev);});
  return wrap;
}
function updateMarkerDom(el){
  const wrap=document.getElementById('sel_'+el.id); if(!wrap)return;
  const ms=el.markerStyle||{};
  const sw=ms.strokeWidth||14;
  const pad=Math.ceil(sw/2)+2;
  const x=el.x||0,y=el.y||0,w=el.w||4,h=el.h||4;
  wrap.style.left=(x-pad)+'px'; wrap.style.top=(y-pad)+'px';
  wrap.style.width=(w+pad*2)+'px'; wrap.style.height=(h+pad*2)+'px';
  const svg=wrap.querySelector('svg'); if(!svg)return;
  svg.setAttribute('viewBox',`${-pad} ${-pad} ${w+pad*2} ${h+pad*2}`);
  const pl=svg.querySelector('polyline'); if(!pl)return;
  pl.setAttribute('points',_mrkPolyStr(el));
  pl.setAttribute('stroke',ms.color||'#facc15');
  pl.setAttribute('stroke-width',sw);
  pl.setAttribute('opacity',ms.opacity!=null?ms.opacity:0.35);
}
function startMoveMarker(elId,ev){
  const el=getEl(elId);if(!el)return;
  const snap=_snapElements('Markierung verschoben');
  // Save original positions of all points (relative to element)
  MS={type:'move-marker',elId,sx:ev.clientX,sy:ev.clientY,
      data:{x:el.x||0,y:el.y||0,pts:(el.points||[]).map(p=>({x:p.x,y:p.y}))},snap};
  ev.preventDefault();
}

/* ── Marker drawing mode ── */
let _markerMode=false;
/* Default style applied to newly drawn markers; updated via the insert-panel right-click popover */
let _markerDefaults={color:'#facc15',strokeWidth:14,opacity:0.35};

/* Shared helper: begin a freehand marker draw stroke from slide-space point (lx,ly).
   Called from both onCvDown (click on canvas bg) and the marker-mode overlay
   (click on top of any element). */
function _beginMarkerDraw(ev,lx,ly){
  const slideCV=document.getElementById('slideCV'); if(!slideCV)return;
  const previewSVG=document.createElementNS('http://www.w3.org/2000/svg','svg');
  previewSVG.style.cssText='position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:9998';
  previewSVG.setAttribute('viewBox',`0 0 ${slideCV.offsetWidth} ${slideCV.offsetHeight}`);
  const pl=document.createElementNS('http://www.w3.org/2000/svg','polyline');
  pl.setAttribute('stroke',_markerDefaults.color);
  pl.setAttribute('stroke-width',_markerDefaults.strokeWidth);
  pl.setAttribute('stroke-linecap','round');
  pl.setAttribute('stroke-linejoin','round');
  pl.setAttribute('fill','none');
  pl.setAttribute('opacity',_markerDefaults.opacity);
  previewSVG.appendChild(pl);
  slideCV.appendChild(previewSVG);
  MS={type:'draw-marker',rawPts:[{x:lx,y:ly}],previewEl:previewSVG};
  ev.preventDefault();
}

function toggleMarkerMode(){
  _markerMode=!_markerMode;
  const btn=document.getElementById('markerDrawBtn');
  if(btn)btn.classList.toggle('marker-draw-active',_markerMode);
  const cv=document.getElementById('edCvArea');
  if(cv)cv.style.cursor=_markerMode?'crosshair':'';

  /* Transparent overlay injected directly into slideCV so it sits above every
     element (image, shape, etc.) at z-index 9999. Without this, clicking on an
     element overlay steals the mousedown via stopPropagation and the marker
     stroke never starts. The overlay converts every click/drag into a draw stroke
     and does NOT block the context menu (contextmenu events bubble through). */
  const slideCV=document.getElementById('slideCV');
  let ov=document.getElementById('markerModeOverlay');
  if(_markerMode){
    if(!ov&&slideCV){
      ov=document.createElement('div');
      ov.id='markerModeOverlay';
      ov.style.cssText='position:absolute;inset:0;z-index:9999;cursor:crosshair;';
      ov.addEventListener('mousedown',ev=>{
        if(!_markerMode)return;
        /* Check what sits directly under the overlay at this position.
           By briefly setting pointer-events:none we let elementFromPoint
           look through the overlay to the real element beneath it. */
        ov.style.pointerEvents='none';
        const under=document.elementFromPoint(ev.clientX,ev.clientY);
        ov.style.pointerEvents='auto';
        /* If the user clicked on an existing marker (or its drag-bar / delete button),
           forward the event so the marker can be selected, moved, deleted etc. */
        if(under&&under.closest('.marker-el')){
          under.dispatchEvent(new MouseEvent('mousedown',{
            bubbles:true,cancelable:true,
            clientX:ev.clientX,clientY:ev.clientY,
            ctrlKey:ev.ctrlKey,metaKey:ev.metaKey,
            button:ev.button,buttons:ev.buttons
          }));
          return; // do not start a new drawing stroke
        }
        /* Otherwise start a new freehand stroke */
        const rect=slideCV.getBoundingClientRect();
        const lx=(ev.clientX-rect.left)/cvScale, ly=(ev.clientY-rect.top)/cvScale;
        _beginMarkerDraw(ev,lx,ly);
      });
      /* Forward click events to marker elements (needed for the × delete button,
         whose action fires on 'click' not 'mousedown'). */
      ov.addEventListener('click',ev=>{
        if(!_markerMode)return;
        ov.style.pointerEvents='none';
        const under=document.elementFromPoint(ev.clientX,ev.clientY);
        ov.style.pointerEvents='auto';
        if(under&&under.closest('.marker-el')){
          under.dispatchEvent(new MouseEvent('click',{
            bubbles:true,cancelable:true,
            clientX:ev.clientX,clientY:ev.clientY,
            ctrlKey:ev.ctrlKey,metaKey:ev.metaKey,
            button:ev.button
          }));
        }
      });
      /* Right-click on the overlay shows the canvas context menu as normal */
      ov.addEventListener('contextmenu',ev=>{
        const underlying=document.elementFromPoint(ev.clientX,ev.clientY);
        // briefly hide overlay so elementFromPoint finds the real element under it
        ov.style.display='none';
        const target=document.elementFromPoint(ev.clientX,ev.clientY);
        ov.style.display='';
        const elDom=target?.closest('[data-elid]');
        showCtxMenu(ev, elDom?elDom.dataset.elid:null);
      });
      slideCV.appendChild(ov);
    }
  } else {
    if(ov)ov.remove();
    hideMarkerStylePop();
  }
}

function _finishMarkerDraw(rawPts){
  if(rawPts.length<2)return;
  // RDP simplification — epsilon 6px gives natural straight strokes
  const simplified=_rdp(rawPts.map(p=>[p.x,p.y]),6).map(([x,y])=>({x:Math.round(x),y:Math.round(y)}));
  // Compute bounding box
  const bb=_mrkBounds(simplified);
  // Normalize points to local (relative) coords
  const pts=simplified.map(p=>({x:Math.round(p.x-bb.x),y:Math.round(p.y-bb.y)}));
  const sl=curSlide(); if(!sl)return;
  pushHistory('Markierung hinzugefügt');
  const id=uid(), z=++zMax;
  const el={id,type:'marker',z,x:Math.round(bb.x),y:Math.round(bb.y),w:Math.round(bb.w),h:Math.round(bb.h),
    points:pts, markerStyle:{color:_markerDefaults.color,strokeWidth:_markerDefaults.strokeWidth,opacity:_markerDefaults.opacity}};
  sl.elements.push(el);
  document.getElementById('slideCV').appendChild(buildMarkerDom(el));
  selectEl(id);
  renderSpanel();
}

/* ── Marker style popover (right-click on insert-panel button) ── */
function showMarkerStylePop(ev){
  ev.preventDefault(); ev.stopPropagation();
  _closeAllStylePops();
  const pop=document.getElementById('markerStylePop'); if(!pop)return;
  // Populate from current defaults
  const mc=document.getElementById('mspColor');
  const msw=document.getElementById('mspSW'), mswv=document.getElementById('mspSWV');
  const mop=document.getElementById('mspOp'), mopv=document.getElementById('mspOpV');
  if(mc) mc.value=_markerDefaults.color;
  if(msw){ msw.value=_markerDefaults.strokeWidth; if(mswv)mswv.textContent=_markerDefaults.strokeWidth+'px'; }
  if(mop){ mop.value=_markerDefaults.opacity; if(mopv)mopv.textContent=Math.round(_markerDefaults.opacity*100)+'%'; }
  // Position: to the right of the sidebar panel, centered on the button
  const btn=document.getElementById('markerDrawBtn');
  const r=btn?.getBoundingClientRect();
  pop.style.display='block';
  const pw=pop.offsetWidth||200, ph=pop.offsetHeight||130;
  // Horizontally: right edge of the button + gap
  let x = r ? r.right + 10 : ev.clientX + 10;
  // Vertically: center on the button
  let y = r ? r.top + r.height/2 - ph/2 : ev.clientY - ph/2;
  // Clamp to viewport
  if(x+pw > window.innerWidth-8) x = (r ? r.left : ev.clientX) - pw - 8;
  y = Math.max(8, Math.min(y, window.innerHeight - ph - 8));
  pop.style.left=x+'px'; pop.style.top=y+'px';
}
function hideMarkerStylePop(){ _closeAllStylePops(); }
function setMarkerDefault(prop,val){
  _markerDefaults[prop]=val;
  /* Update the SVG preview icon on the insert-panel button */
  const previewBg=document.getElementById('mspPreviewBg');
  const previewFg=document.getElementById('mspPreviewFg');
  if(prop==='color'){
    if(previewBg) previewBg.setAttribute('stroke',val);
    if(previewFg) previewFg.setAttribute('stroke',val);
  }
  if(prop==='strokeWidth'){
    // Map [2,60] → [1.5, 9] for the 36×22 viewBox
    const dsw = 1.5 + (val - 2) / 58 * 7.5;
    if(previewBg) previewBg.setAttribute('stroke-width', dsw.toFixed(1));
  }
  if(prop==='opacity'){
    // bg path shows the semi-transparent fill at the chosen opacity
    if(previewBg) previewBg.setAttribute('opacity', val);
    // fg crisp outline stays readable but fades slightly when very transparent
    if(previewFg) previewFg.setAttribute('opacity', Math.min(0.95, val + 0.45));
  }
  /* Mirror live into the canvas context-menu controls if they're visible */
  if(prop==='color'){ const e=document.getElementById('ctxMarkerColor'); if(e)e.value=val; }
  if(prop==='strokeWidth'){ const e=document.getElementById('ctxMarkerSW'); if(e)e.value=val; const v=document.getElementById('ctxMarkerSWV'); if(v)v.textContent=val+'px'; }
  if(prop==='opacity'){ const e=document.getElementById('ctxMarkerOp'); if(e)e.value=val; const v=document.getElementById('ctxMarkerOpV'); if(v)v.textContent=Math.round(val*100)+'%'; }
}

/* ════════ CARDINALITY & OPTIONALITY QUICK-PICK POPOVERS ════════ */
const CARD_VALUES = ['1','n','m'];
const OPT_VALUES  = ['muss','kann'];

let _cardDefault = '1';
let _optDefault  = 'kann';

function _showErValPop(ev, popId, gridId, values, current, color, onPick){
  ev.preventDefault(); ev.stopPropagation();
  const pop = document.getElementById(popId);
  const grid = document.getElementById(gridId);
  if(!pop||!grid) return;
  // Build chips
  grid.innerHTML = '';
  values.forEach(v => {
    const chip = document.createElement('button');
    chip.className = 'erval-chip' + (v===current?' active':'');
    chip.textContent = v;
    chip.style.color = color;
    chip.addEventListener('click', ()=>{ onPick(v); _closeAllErPops(); });
    grid.appendChild(chip);
  });
  // Position: right of the button, vertically centred on it
  const btn = ev.currentTarget;
  const r = btn.getBoundingClientRect();
  pop.style.display = 'block';
  const pw = pop.offsetWidth||180, ph = pop.offsetHeight||90;
  let x = r.right + 10;
  let y = r.top + r.height/2 - ph/2;
  if(x+pw > window.innerWidth-8) x = r.left - pw - 8;
  y = Math.max(8, Math.min(y, window.innerHeight - ph - 8));
  pop.style.left = x+'px'; pop.style.top = y+'px';
}

function showCardPop(ev){
  _showErValPop(ev,'cardPop','cardGrid',CARD_VALUES,_cardDefault,'#22d3ee',v=>{
    _cardDefault = v;
    const p = document.getElementById('cardBtnPreview'); if(p) p.textContent = v;
  });
}
function showOptPop(ev){
  _showErValPop(ev,'optPop','optGrid',OPT_VALUES,_optDefault,'#f87171',v=>{
    _optDefault = v;
    const p = document.getElementById('optBtnPreview'); if(p) p.textContent = v;
  });
}
function _closeAllErPops(){
  ['cardPop','optPop'].forEach(id=>{ const p=document.getElementById(id); if(p)p.style.display='none'; });
}

/* ════════ SYM / ARROW INSERT-PANEL STYLE POPOVERS ════════ */
let _symDefaults={stroke:'#e8a030',fillColor:'#e8a030',fillOpacity:0.09,strokeWidth:2,dashed:false,opacity:1};
let _arrowDefaults={stroke:'#e8a030',strokeWidth:2,dashed:false,startType:'none',endType:'filled',markerSize:9};
let _symPopType=null; // which shape type the sym popover is currently configured for

function _closeAllStylePops(){
  ['symStylePop','arrowStylePop','markerStylePop','cardPop','optPop','elStylePop'].forEach(id=>{
    const p=document.getElementById(id); if(p)p.style.display='none';
  });
}

function _popPosition(pop, triggerEl){
  const r=triggerEl.getBoundingClientRect();
  pop.style.display='block';
  const pw=pop.offsetWidth||220, ph=pop.offsetHeight||160;
  let x=r.right+10, y=r.top+r.height/2-ph/2;
  if(x+pw>window.innerWidth-8) x=r.left-pw-8;
  y=Math.max(8,Math.min(y,window.innerHeight-ph-8));
  pop.style.left=x+'px'; pop.style.top=y+'px';
}

/* Generates the small live SVG preview inside the sym popover */
function _updateSymPopPreview(){
  const el=document.getElementById('symPopPreview'); if(!el||!_symPopType)return;
  const s=_symDefaults.stroke, f=_composeFill(_symDefaults.fillColor,_symDefaults.fillOpacity);
  const sw=_symDefaults.strokeWidth, da=_symDefaults.dashed;
  el.innerHTML=symShapeSVG(_symPopType,36,22,s,f,sw,da);
  el.style.opacity=_symDefaults.opacity<1?_symDefaults.opacity:'';
}

function showSymStylePop(ev, type){
  ev.preventDefault(); ev.stopPropagation();
  _closeAllStylePops();
  _symPopType=type;
  const pop=document.getElementById('symStylePop'); if(!pop)return;
  // Populate controls
  document.getElementById('sspStroke').value=_symDefaults.stroke;
  document.getElementById('sspFillColor').value=_symDefaults.fillColor;
  document.getElementById('sspFillOp').value=_symDefaults.fillOpacity;
  document.getElementById('sspFillOpV').textContent=Math.round(_symDefaults.fillOpacity*100)+'%';
  document.getElementById('sspSW').value=_symDefaults.strokeWidth;
  document.getElementById('sspDash').checked=_symDefaults.dashed;
  const sspOp=document.getElementById('sspOpacity');if(sspOp)sspOp.value=_symDefaults.opacity;
  const sspOpV=document.getElementById('sspOpacityV');if(sspOpV)sspOpV.textContent=Math.round(_symDefaults.opacity*100)+'%';
  _updateSymPopPreview();
  _popPosition(pop, ev.currentTarget);
}

function setSymDefault(prop,val){
  _symDefaults[prop]=val;
  if(prop==='fillOpacity') document.getElementById('sspFillOpV').textContent=Math.round(val*100)+'%';
  _updateSymPopPreview();
  _updateAllSymBtnIcons();
}

/* Re-render every sym-* insert-button's SVG from current _symDefaults */
function _updateAllSymBtnIcons(){
  const fill=_composeFill(_symDefaults.fillColor,_symDefaults.fillOpacity);
  const {stroke,strokeWidth,dashed,opacity}=_symDefaults;
  document.querySelectorAll('[data-sym-type]').forEach(btn=>{
    const type=btn.dataset.symType;
    const svg=btn.querySelector('.er-ico svg'); if(!svg)return;
    svg.innerHTML=symShapeSVG(type,36,22,stroke,fill,strokeWidth,dashed);
    svg.style.opacity=opacity<1?opacity:'';
  });
}

/* Re-render the arrow insert-button SVG from current _arrowDefaults */
function _updateArrowBtnIcon(){
  const d=_arrowDefaults;
  const svg=document.getElementById('arrowBtnSvg'); if(!svg)return;
  // Build arrow line with head markers matching the format-tab approach
  const col=d.stroke, sw=Math.min(d.strokeWidth,3), da=d.dashed?`stroke-dasharray="${sw*2.5} ${sw*2}"`:'';
  const x1=3,x2=30,y=11,hs=Math.min(7,d.markerSize*0.55);
  let inner=`<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" ${da}/>`;
  // End head
  if(d.endType==='filled'||d.endType==='arrow')
    inner+=`<polyline points="${x2-hs},${y-hs*.6} ${x2},${y} ${x2-hs},${y+hs*.6}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
  else if(d.endType==='filled-dot'||d.endType==='open-dot')
    inner+=`<circle cx="${x2}" cy="${y}" r="${hs*.5}" fill="${d.endType==='filled-dot'?col:'none'}" stroke="${col}" stroke-width="${sw*.7}"/>`;
  else if(d.endType==='filled-diamond'||d.endType==='open-diamond'){
    const dx=hs*.8,dy=hs*.45;
    inner+=`<polygon points="${x2},${y-dy} ${x2+dx*.6},${y} ${x2},${y+dy} ${x2-dx},${y}" fill="${d.endType==='filled-diamond'?col:'none'}" stroke="${col}" stroke-width="${sw*.7}" stroke-linejoin="round"/>`;
  } else if(d.endType==='bar')
    inner+=`<line x1="${x2}" y1="${y-hs*.6}" x2="${x2}" y2="${y+hs*.6}" stroke="${col}" stroke-width="${sw}"/>`;
  // Start head
  if(d.startType==='filled'||d.startType==='arrow')
    inner+=`<polyline points="${x1+hs},${y-hs*.6} ${x1},${y} ${x1+hs},${y+hs*.6}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
  else if(d.startType==='filled-dot'||d.startType==='open-dot')
    inner+=`<circle cx="${x1}" cy="${y}" r="${hs*.5}" fill="${d.startType==='filled-dot'?col:'none'}" stroke="${col}" stroke-width="${sw*.7}"/>`;
  else if(d.startType==='bar')
    inner+=`<line x1="${x1}" y1="${y-hs*.6}" x2="${x1}" y2="${y+hs*.6}" stroke="${col}" stroke-width="${sw}"/>`;
  // Anchor dots
  inner+=`<circle cx="${x1}" cy="${y}" r="2.5" fill="#3b82f6"/><circle cx="${x2+2}" cy="${y}" r="2.5" fill="#3b82f6"/>`;
  svg.innerHTML=inner;
}

/* Arrow popover */
function _updateArrowPopPreview(){
  const el=document.getElementById('arrowPopPreview'); if(!el)return;
  const d=_arrowDefaults;
  const col=d.stroke, sw=d.strokeWidth;
  const da=d.dashed?`stroke-dasharray="${sw*2.5} ${sw*2}"`:'';
  // Simple horizontal arrow preview
  const y=11, x1=3, x2=30;
  let svgContent=`<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" ${da}/>`;
  // Rough filled-arrow heads for preview
  const headSz=Math.min(8,d.markerSize*0.7);
  if(d.endType==='filled'||d.endType==='arrow')
    svgContent+=`<polyline points="${x2-headSz},${y-headSz*0.55} ${x2},${y} ${x2-headSz},${y+headSz*0.55}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
  if(d.startType==='filled'||d.startType==='arrow')
    svgContent+=`<polyline points="${x1+headSz},${y-headSz*0.55} ${x1},${y} ${x1+headSz},${y+headSz*0.55}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
  el.innerHTML=svgContent;
  el.setAttribute('stroke',col); // propagate for currentColor children
}

function showArrowStylePop(ev){
  ev.preventDefault(); ev.stopPropagation();
  _closeAllStylePops();
  const pop=document.getElementById('arrowStylePop'); if(!pop)return;
  const d=_arrowDefaults;
  document.getElementById('aspColor').value=d.stroke;
  document.getElementById('aspSW').value=d.strokeWidth;
  document.getElementById('aspDash').checked=d.dashed;
  document.getElementById('aspStart').value=d.startType;
  document.getElementById('aspEnd').value=d.endType;
  document.getElementById('aspSize').value=d.markerSize;
  _updateArrowPopPreview();
  _popPosition(pop, ev.currentTarget);
}

function setArrowDefault(prop,val){
  _arrowDefaults[prop]=val;
  _updateArrowPopPreview();
  _updateArrowBtnIcon();
}

/* Marker properties panel */
function applyMarkerSt(prop,val){
  if(!selElId)return; const el=getEl(selElId); if(!el||el.type!=='marker')return;
  pushHistoryDebounced('Markierung formatiert');
  el.markerStyle=el.markerStyle||{};
  el.markerStyle[prop]=val;
  updateMarkerDom(el);
}

/* ════════ MOVEMENT STATE MACHINE ════════ */
function startGroupMove(ev){
  // Save initial positions of all multi-selected elements
  const snap=_snapElements('Gruppe verschoben');
  const initPositions={};
  _multiSel.forEach(id=>{
    const el=getEl(id);if(!el)return;
    if(el.type==='sym-arrow'||el.type==='er-line'){
      initPositions[id]={x1:el.x1,y1:el.y1,x2:el.x2,y2:el.y2};
    } else {
      initPositions[id]={x:el.x||0,y:el.y||0};
    }
  });
  document.body.classList.add('er-element-moving');
  MS={type:'move-group',elIds:[..._multiSel],sx:ev.clientX,sy:ev.clientY,data:initPositions,snap};
  ev.preventDefault();
}
function startMove(elId,ev){
  const el=getEl(elId); if(!el)return;
  // Snapshot captured NOW (before move) but pushed to stack only if element actually moves (mouseup)
  const snap=_snapElements(typeLabel(el.type)+' verschoben');
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
  const snap=_snapElements(typeLabel(el.type)+' skaliert');
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
    const r=Math.min(w/2,h/2)-1;
    const verts6=[];for(let i=0;i<6;i++){const a=i*Math.PI/3;verts6.push({x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)});}
    let best=null,bd=Infinity;
    for(let i=0;i<6;i++){const a=verts6[i],b=verts6[(i+1)%6];const p=closestPtOnSeg(a,b,{x:px,y:py});const d=Math.hypot(px-p.x,py-p.y);if(d<bd){bd=d;best=p;}}
    return {x:Math.round(best.x),y:Math.round(best.y)};
  }
  // Sym parallelogram
  if(t==='sym-parallelogram'){
    const off=w*0.2,pad_=1;
    const tl={x:x+off+pad_,y:y+pad_},tr={x:x+w-pad_,y:y+pad_},br={x:x+w-off-pad_,y:y+h-pad_},bl={x:x+pad_,y:y+h-pad_};
    const edges=[[tl,tr],[tr,br],[br,bl],[bl,tl]];
    let best=null,bd=Infinity;
    edges.forEach(([a,b])=>{const p=closestPtOnSeg(a,b,{x:px,y:py});const d=Math.hypot(px-p.x,py-p.y);if(d<bd){bd=d;best=p;}});
    return {x:Math.round(best.x),y:Math.round(best.y)};
  }
  // Sym right-triangle
  if(t==='sym-right-tri'){
    const pad_=1;
    const tl={x:x+pad_,y:y+pad_},br={x:x+w-pad_,y:y+h-pad_},bl={x:x+pad_,y:y+h-pad_};
    const edges=[[tl,br],[br,bl],[bl,tl]];
    let best=null,bd=Infinity;
    edges.forEach(([a,b])=>{const p=closestPtOnSeg(a,b,{x:px,y:py});const d=Math.hypot(px-p.x,py-p.y);if(d<bd){bd=d;best=p;}});
    return {x:Math.round(best.x),y:Math.round(best.y)};
  }
  // Sym cylinder: treat as rounded rectangle (use top ellipse + sides)
  if(t==='sym-cylinder'){
    const ry2=h*0.14,pad_=1;
    // Sides are vertical lines; top and bottom are ellipses — approximate with rect edges
    const edges=[[{x:x+pad_,y:y+ry2},{x:x+pad_,y:y+h-pad_-ry2}],[{x:x+w-pad_,y:y+ry2},{x:x+w-pad_,y:y+h-pad_-ry2}]];
    let best=null,bd=Infinity;
    edges.forEach(([a,b])=>{const p=closestPtOnSeg(a,b,{x:px,y:py});const d=Math.hypot(px-p.x,py-p.y);if(d<bd){bd=d;best=p;}});
    // Also check top and bottom ellipses
    for(const [ecy2,ery2] of [[y+ry2,ry2],[y+h-pad_-ry2,ry2]]){
      const a=Math.atan2((py-ecy2)/(ery2||1),(px-cx)/((w/2-pad_)||1));
      const ep={x:Math.round(cx+(w/2-pad_)*Math.cos(a)),y:Math.round(ecy2+ery2*Math.sin(a))};
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
    const pad_=1,ro=Math.min(w/2,h/2)-pad_,ri=ro*0.42,n=5;
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
  sl.elements.forEach(el=>{
    // Exclude only cardinality lines and self
    if(el.type==='er-line'||el.type==='er-cardinality'||el.type==='er-optionality'||el.id===excludeId)return;
    // sym-arrow: snap to endpoints + midpoint only
    if(el.type==='sym-arrow'){
      const pts=[{x:el.x1,y:el.y1},{x:el.x2,y:el.y2},{x:Math.round((el.x1+el.x2)/2),y:Math.round((el.y1+el.y2)/2)}];
      for(const pt of pts){const d=Math.hypot(nx-pt.x,ny-pt.y);if(d<bd){bd=d;best=pt;}}
      return;
    }
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
      const ro2=Math.min(w/2,h/2)-1,ri2=ro2*0.42,n2=5;
      for(let i=0;i<n2*2;i++){const a=-Math.PI/2+(i*Math.PI/n2);const r=i%2===0?ro2:ri2;preferred.push({x:Math.round(cx+r*Math.cos(a)),y:Math.round(cy+r*Math.sin(a))});}
    } else if(t==='sym-hexagon'){
      const r3=Math.min(w/2,h/2)-1;
      for(let i=0;i<6;i++){const a=i*Math.PI/3;preferred.push({x:Math.round(cx+r3*Math.cos(a)),y:Math.round(cy+r3*Math.sin(a))});}
      // true edge midpoints: apothem = r3*cos(π/6)
      const ap=r3*Math.cos(Math.PI/6);
      for(let i=0;i<6;i++){const a=(i+0.5)*Math.PI/3;preferred.push({x:Math.round(cx+ap*Math.cos(a)),y:Math.round(cy+ap*Math.sin(a))});}
    } else if(t==='sym-parallelogram'){
      const off3=w*0.2;
      preferred.push({x:Math.round(x+off3),y:y},{x:x+w,y:y},{x:Math.round(x+w-off3),y:y+h},{x:x,y:y+h});
      preferred.push({x:Math.round(cx+off3/2),y:y},{x:Math.round(cx-off3/2),y:y+h},{x:Math.round(x+off3/2),y:cy},{x:Math.round(x+w-off3/2),y:cy});
    } else if(t==='sym-right-tri'){
      // vertices: tl, br, bl — plus edge midpoints
      preferred.push({x:x,y:y},{x:x+w,y:y+h},{x:x,y:y+h},{x:cx,y:y+h},{x:x,y:cy});
    } else if(t==='sym-cylinder'){
      const ry3=h*0.14;
      preferred.push({x:cx,y:y},{x:cx,y:y+h},{x:x,y:Math.round(y+ry3)},{x:x+w,y:Math.round(y+ry3)},{x:x,y:Math.round(y+h-ry3)},{x:x+w,y:Math.round(y+h-ry3)});
    } else if(t==='sym-circle'||t==='sym-ellipse'){
      preferred.push({x:cx,y:y},{x:cx,y:y+h},{x:x,y:cy},{x:x+w,y:cy});
    } else if(t==='sym-diamond'){
      preferred.push({x:cx,y:y},{x:x+w,y:cy},{x:cx,y:y+h},{x:x,y:cy});
    } else if(t==='sym-triangle'){
      preferred.push({x:cx,y:y},{x:x,y:y+h},{x:x+w,y:y+h},
        {x:Math.round((cx+x)/2),y:Math.round((y+y+h)/2)},
        {x:Math.round((cx+x+w)/2),y:Math.round((y+y+h)/2)},
        {x:cx,y:y+h});
    } else {
      // Rectangle / text / image / etc.: 4 corners + 4 edge midpoints
      preferred.push(
        {x:x,y:y},{x:x+w,y:y},{x:x+w,y:y+h},{x:x,y:y+h},
        {x:cx,y:y},{x:cx,y:y+h},{x:x,y:cy},{x:x+w,y:cy}
      );
    }
    // Find closest preferred point within SNAP_TH (the overall snap radius).
    // Using PREFER_TH was too restrictive: a user dragging near the midpoint
    // of a long entity edge might be >18px from the preferred point while still
    // within SNAP_TH of the border, causing fallback to an arbitrary borderPt
    // and producing a slightly off-center (rotated-looking) line.
    let closestPref=null, closestPrefD=SNAP_TH;
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

  if(MS.type==='draw-marker'){
    const rect=document.getElementById('slideCV')?.getBoundingClientRect(); if(!rect)return;
    const px=(ev.clientX-rect.left)/cvScale, py=(ev.clientY-rect.top)/cvScale;
    MS.rawPts.push({x:px,y:py});
    // Update live preview polyline
    const pl=MS.previewEl?.querySelector('polyline');
    if(pl)pl.setAttribute('points',MS.rawPts.map(p=>`${p.x},${p.y}`).join(' '));
    return;
  }

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
  if(MS.type==='move-marker'){
    const el=getEl(MS.elId); if(!el)return;
    el.x=Math.round(MS.data.x+dx);
    el.y=Math.round(MS.data.y+dy);
    // Offset all points (they are in local/relative coords so just update anchor)
    updateMarkerDom(el);
    return;
  }
  if(MS.type==='move-group'){
    // ── Step 1: compute raw group bounding box after applying dx/dy ──
    let gx1=Infinity,gy1=Infinity,gx2=-Infinity,gy2=-Infinity;
    MS.elIds.forEach(id=>{
      const d=MS.data[id]; if(!d)return;
      const el=getEl(id); if(!el)return;
      if(el.type==='sym-arrow'||el.type==='er-line'){
        const bx1=Math.min(d.x1,d.x2)+dx, bx2=Math.max(d.x1,d.x2)+dx;
        const by1=Math.min(d.y1,d.y2)+dy, by2=Math.max(d.y1,d.y2)+dy;
        if(bx1<gx1)gx1=bx1; if(by1<gy1)gy1=by1;
        if(bx2>gx2)gx2=bx2; if(by2>gy2)gy2=by2;
      } else {
        const ex=d.x+dx, ey=d.y+dy, ew=el.w||0, eh=el.h||0;
        if(ex<gx1)gx1=ex; if(ey<gy1)gy1=ey;
        if(ex+ew>gx2)gx2=ex+ew; if(ey+eh>gy2)gy2=ey+eh;
      }
    });
    const gw=gx2-gx1, gh=gy2-gy1;
    const gcx=gx1+gw/2, gcy=gy1+gh/2;

    // ── Step 2: snap group bbox against slide + other elements ──
    const sz=slSz(curSlide());
    const scx=sz.w/2, scy=sz.h/2;
    const groupIds=new Set(MS.elIds);
    let bestX=SNAP, bestY=SNAP;
    let snapDdx=0, snapDdy=0;
    let guideX=null, guideY=null;
    let colorX='rgba(239,68,68,.85)', colorY='rgba(239,68,68,.85)';

    function chkX(rawEdge, snappedEdge, axis, isCenter){
      const d=Math.abs(rawEdge-snappedEdge);
      if(d<bestX){bestX=d; snapDdx=snappedEdge-rawEdge; guideX=axis; colorX=isCenter?'rgba(59,130,246,.85)':'rgba(239,68,68,.85)';}
    }
    function chkY(rawEdge, snappedEdge, axis, isCenter){
      const d=Math.abs(rawEdge-snappedEdge);
      if(d<bestY){bestY=d; snapDdy=snappedEdge-rawEdge; guideY=axis; colorY=isCenter?'rgba(59,130,246,.85)':'rgba(239,68,68,.85)';}
    }

    // Slide edges & center
    chkX(gx1, 0,      0,      false);
    chkX(gx2, sz.w,   sz.w,   false);
    chkX(gcx, scx,    scx,    true);
    chkY(gy1, 0,      0,      false);
    chkY(gy2, sz.h,   sz.h,   false);
    chkY(gcy, scy,    scy,    true);

    // Other (non-group) elements
    (curSlide()?.elements||[]).forEach(o=>{
      if(groupIds.has(o.id)||!o.w||o.type==='er-line')return;
      const ox=o.x||0, oy=o.y||0, ow=o.w||0, oh=o.h||0;
      const ocx=ox+ow/2, ocy=oy+oh/2;
      // group left/right/center-x vs other element left/right/center-x
      chkX(gx1, ox,      ox,      false);
      chkX(gx1, ox+ow,   ox+ow,   false);
      chkX(gcx, ocx,     ocx,     true);
      chkX(gx2, ox,      ox,      false);
      chkX(gx2, ox+ow,   ox+ow,   false);
      // group top/bottom/center-y vs other element top/bottom/center-y
      chkY(gy1, oy,      oy,      false);
      chkY(gy1, oy+oh,   oy+oh,   false);
      chkY(gcy, ocy,     ocy,     true);
      chkY(gy2, oy,      oy,      false);
      chkY(gy2, oy+oh,   oy+oh,   false);
    });

    const snapDx=Math.round(dx+snapDdx), snapDy=Math.round(dy+snapDdy);
    const snappedRect={x:gx1+snapDdx,y:gy1+snapDdy,w:gw,h:gh};

    // ── Step 3a: Red/blue alignment guides via gH/gV (same as single element) ──
    const sRect=document.getElementById('slideCV')?.getBoundingClientRect();
    const gH=document.getElementById('gH'), gV=document.getElementById('gV');
    if(sRect){
      if(guideY!==null){
        gH.style.display='block';
        gH.style.top=(sRect.top+guideY*cvScale)+'px';
        gH.style.background=colorY; gH.style.boxShadow=`0 0 4px ${colorY}`;
      } else { gH.style.display='none'; }
      if(guideX!==null){
        gV.style.display='block';
        gV.style.left=(sRect.left+guideX*cvScale)+'px';
        gV.style.background=colorX; gV.style.boxShadow=`0 0 4px ${colorX}`;
      } else { gV.style.display='none'; }
    }
    // ── Step 3b: Green spacing guides via SVG overlay ──
    const spSnap=updateSmartGuides(snappedRect, new Set(MS.elIds), true /*skipEdgeLines — gH/gV used above*/);
    // Apply green spacing snap correction on top of red/blue edge snap
    const finalDx=snapDx+(spSnap&&spSnap.dx?Math.round(spSnap.dx):0);
    const finalDy=snapDy+(spSnap&&spSnap.dy?Math.round(spSnap.dy):0);

    // ── Step 4: Apply movement to all group elements ──
    MS.elIds.forEach(id=>{
      const el=getEl(id);if(!el||!MS.data[id])return;
      if(el.type==='sym-arrow'||el.type==='er-line'){
        const d=MS.data[id];
        el.x1=Math.round(d.x1+finalDx);el.y1=Math.round(d.y1+finalDy);
        el.x2=Math.round(d.x2+finalDx);el.y2=Math.round(d.y2+finalDy);
        if(el.type==='sym-arrow')updateArrowDom(el); else updateLineDom(el);
      } else {
        el.x=Math.round(MS.data[id].x+finalDx);
        el.y=Math.round(MS.data[id].y+finalDy);
        const dom=document.getElementById('sel_'+id);
        if(dom){dom.style.left=el.x+'px';dom.style.top=el.y+'px';}
      }
    });
    return;
  }
  if(MS.type==='move'){
    const el=getEl(MS.elId); if(!el)return;
    const nx=Math.round(MS.data.x+dx), ny=Math.round(MS.data.y+dy);
    const snap=trySnapEl(el,nx,ny); el.x=snap.x; el.y=snap.y;
    const dom=document.getElementById('sel_'+MS.elId);
    if(dom){dom.style.left=el.x+'px';dom.style.top=el.y+'px';}
    const spS=updateSmartGuides({x:el.x,y:el.y,w:el.w||0,h:el.h||0},[MS.elId],true/*skipEdgeLines — trySnapEl already shows gH/gV*/);
    if(spS&&(spS.dx||spS.dy)){
      el.x+=spS.dx; el.y+=spS.dy;
      if(dom){dom.style.left=el.x+'px';dom.style.top=el.y+'px';}
    }
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
    const lr={x:Math.min(el.x1,el.x2),y:Math.min(el.y1,el.y2),w:Math.abs(el.x2-el.x1)||4,h:Math.abs(el.y2-el.y1)||4};
    updateSmartGuides(lr,[MS.elId]);
  }
  if(MS.type==='move-arrow'){
    const el=getEl(MS.elId); if(!el)return;
    el.x1=Math.round(MS.data.x1+dx); el.y1=Math.round(MS.data.y1+dy);
    el.x2=Math.round(MS.data.x2+dx); el.y2=Math.round(MS.data.y2+dy);
    updateArrowDom(el); refreshFP(el);
    const ar={x:Math.min(el.x1,el.x2),y:Math.min(el.y1,el.y2),w:Math.abs(el.x2-el.x1)||4,h:Math.abs(el.y2-el.y1)||4};
    updateSmartGuides(ar,[MS.elId]);
  }
  if(MS.type==='drag-arrow-pt'){
    const el=getEl(MS.elId); if(!el)return;
    const rect=document.getElementById('slideCV').getBoundingClientRect();
    let nx=Math.round((ev.clientX-rect.left)/cvScale);
    let ny=Math.round((ev.clientY-rect.top)/cvScale);
    // Shift suppresses both element snapping and angle snapping
    const snap=ev.shiftKey?null:findSnap(nx,ny,MS.elId);
    if(snap){nx=snap.x;ny=snap.y;}
    else if(!ev.shiftKey){
      // Angle snap: magnetic within 5° of any 45° multiple
      const ox=MS.ptNum===1?el.x2:el.x1, oy=MS.ptNum===1?el.y2:el.y1;
      const angle=Math.atan2(ny-oy,nx-ox);
      const snapAngle=Math.round(angle/(Math.PI/4))*(Math.PI/4);
      const angDiff=Math.abs(angle-snapAngle);
      const SNAP_ANG_TH=Math.PI/36; // ~5°
      if(angDiff<SNAP_ANG_TH){
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
  if(MS&&MS.type==='draw-marker'){
    const rawPts=MS.rawPts||[];
    // Remove preview overlay
    if(MS.previewEl&&MS.previewEl.parentNode)MS.previewEl.parentNode.removeChild(MS.previewEl);
    MS=null;
    _finishMarkerDraw(rawPts);
    return;
  }
  if(MS&&MS.type==='lasso'){
    const lBox=document.getElementById('lassoBox');if(lBox)lBox.style.display='none';
    const lx1=Math.min(MS.lx0,MS._lx2||MS.lx0),ly1=Math.min(MS.ly0,MS._ly2||MS.ly0);
    const lx2=Math.max(MS.lx0,MS._lx2||MS.lx0),ly2=Math.max(MS.ly0,MS._ly2||MS.ly0);
    if(lx2-lx1>4||ly2-ly1>4){ // only if dragged a meaningful distance
      const sl=curSlide();
      if(sl)sl.elements.forEach(el=>{
        let inLasso=false;
        if(el.type==='er-line'||el.type==='sym-arrow'){
          const pts=[[el.x1,el.y1],[el.x2,el.y2],[(el.x1+el.x2)/2,(el.y1+el.y2)/2]];
          inLasso=pts.some(([px,py])=>px>=lx1&&px<=lx2&&py>=ly1&&py<=ly2);
        } else {
          if(!el.x&&el.x!==0)return;
          const ex=el.x||0,ey=el.y||0,ew=el.w||0,eh=el.h||0;
          inLasso=(ex<lx2&&ex+ew>lx1&&ey<ly2&&ey+eh>ly1);
        }
        if(inLasso){
          _multiSel.add(el.id);
          const d=document.getElementById('sel_'+el.id);if(d)d.classList.add('multi-selected');
        }
      });
      if(_multiSel.size>0){edTab('fmt');populateMultiFmt();}
    }
    MS=null;return;
  }
  if(MS&&MS.type==='move-group'){
    // Check if anything actually moved
    let changed=false;
    MS.elIds.forEach(id=>{
      const el=getEl(id);if(!el||!MS.data[id])return;
      if(el.type==='sym-arrow'||el.type==='er-line'){
        if(el.x1!==MS.data[id].x1||el.y1!==MS.data[id].y1)changed=true;
      } else {
        if(el.x!==MS.data[id].x||el.y!==MS.data[id].y)changed=true;
      }
    });
    if(changed&&MS.snap){_undoStack.push(MS.snap);if(_undoStack.length>UNDO_MAX)_undoStack.shift();_redoStack=[];_updateHistBtns();}
    MS=null;hideGuides();hideConnDots();return;
  }
  if(MS&&(MS.type==='move'||MS.type==='move-line'||MS.type==='resize'||MS.type==='drag-pt'||MS.type==='move-arrow'||MS.type==='drag-arrow-pt'||MS.type==='move-marker')){
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
    else if(MS.type==='move-marker'&&el)
      changed=(el.x!==MS.data.x||el.y!==MS.data.y);
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

  /* Other elements — exclude self and all currently multi-selected group members */
  (curSlide()?.elements||[]).forEach(o=>{
    if(o.id===selElId||_multiSel.has(o.id)||!o.w||o.type==='er-line')return;
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
function hideGuides(){document.getElementById('gH').style.display='none';document.getElementById('gV').style.display='none';clearSmartGuides();}

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
    if(el&&ce){pushHistoryDebounced('Textformatierung geändert');el.html=ce.innerHTML;}
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

/* ════════ PASTE: erst ohne Formatierung einfügen, Optionen erscheinen neben dem Textfeld ════════ */
let _pp=null;   // {range,html,plain,target,elId,mode}
function _pasteFrag(mode,html,plain){
  const frag=document.createDocumentFragment();
  if(mode==='plain'||!html){
    plain.split(/\r?\n/).forEach((l,i)=>{ if(i)frag.appendChild(document.createElement('br')); frag.appendChild(document.createTextNode(l)); });
    return frag;
  }
  const tmp=document.createElement('div'); tmp.innerHTML=html;
  tmp.querySelectorAll('script,style,meta,link,title').forEach(n=>n.remove());
  tmp.querySelectorAll('*').forEach(n=>[...n.attributes].forEach(a=>{ if(/^on/i.test(a.name))n.removeAttribute(a.name); }));
  if(mode==='merge'){
    tmp.querySelectorAll('[style]').forEach(n=>{
      n.style.color='';n.style.fontFamily='';n.style.fontSize='';n.style.backgroundColor='';
      if(!n.getAttribute('style').trim())n.removeAttribute('style');
    });
    tmp.querySelectorAll('font').forEach(f=>{ const s=document.createElement('span'); s.append(...f.childNodes); f.replaceWith(s); });
  }
  while(tmp.firstChild)frag.appendChild(tmp.firstChild);
  return frag;
}
function pasteInline(target,elId,html,plain){
  pasteFinish(); target.focus();
  const sel=window.getSelection(); let range;
  if(sel.rangeCount&&target.contains(sel.anchorNode))range=sel.getRangeAt(0).cloneRange();
  else{ range=document.createRange(); range.selectNodeContents(target); range.collapse(false); }
  range.deleteContents(); range.insertNode(_pasteFrag('plain',html,plain));
  pushHistory('Text eingefügt');
  _pp={range,html,plain,target,elId,mode:'plain'};
  _pasteApply();
}
function _pasteApply(){
  const p=_pp; if(!p)return;
  const e=getEl(p.elId); if(e)e.html=p.target.innerHTML;
  p.target.classList.toggle('is-empty',!(p.target.textContent||'').trim());
  const sel=window.getSelection(), c=p.range.cloneRange(); c.collapse(false);
  sel.removeAllRanges(); sel.addRange(c); savedRange=c.cloneRange();
  _spRefresh(); SC.scheduleCheck(p.elId); updateWordCount(); _pasteMenu();
}
function pasteSet(mode){            // Auswahl im Menü: eingefügten Text durch die gewählte Variante ersetzen
  const p=_pp; if(!p)return;
  if(!p.target.isConnected){ pasteFinish(); return; }
  p.mode=mode; p.target.focus();
  p.range.deleteContents(); p.range.insertNode(_pasteFrag(mode,p.html,p.plain));
  _pasteApply();
}
function pasteFinish(){ const m=document.getElementById('pasteOpts'); if(m)m.remove(); _pp=null; }
function _pasteMenu(){
  const p=_pp; if(!p)return;
  let m=document.getElementById('pasteOpts');
  if(!m){ m=document.createElement('div'); m.id='pasteOpts'; m.className='paste-opts'; m.addEventListener('mousedown',e=>e.preventDefault()); document.body.appendChild(m); }
  const o=[['keep','Formatierung übernehmen'],['merge','Zusammenführen (ohne Farbe/Schrift)'],['plain','Ohne Formatierung']];
  m.innerHTML='<div class="po-t">Einfügen</div>'+o.map(([k,l])=>`<button class="po-b${p.mode===k?' on':''}"${(!p.html&&k!=='plain')?' disabled':''} onclick="pasteSet('${k}')">${l}</button>`).join('')+'<button class="po-x" onclick="pasteFinish()" title="Schließen">×</button>';
  const r=(document.getElementById('sel_'+p.elId)||p.target).getBoundingClientRect(), w=m.offsetWidth, h=m.offsetHeight;
  let x=r.right+10, y=r.top;
  if(x+w>innerWidth-8){ x=Math.max(8,r.left); y=r.bottom+10; }   // kein Platz rechts -> unter das Textfeld
  m.style.left=x+'px'; m.style.top=Math.max(8,Math.min(y,innerHeight-h-8))+'px';
}
document.addEventListener('mousedown',ev=>{ if(_pp&&!ev.target.closest('#pasteOpts'))pasteFinish(); },true);
document.addEventListener('keydown',ev=>{ if(_pp&&!/^(Shift|Control|Alt|Meta|CapsLock)$/.test(ev.key)&&!ev.target.closest('#pasteOpts'))pasteFinish(); },true);

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
const SVG_FOLDER=`<svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="color:var(--gold);opacity:.85"><path d="M1 3.5C1 2.67 1.67 2 2.5 2H6.38c.35 0 .68.13.93.37L8.5 3.5H15.5C16.33 3.5 17 4.17 17 5v8c0 .83-.67 1.5-1.5 1.5h-13C1.67 14.5 1 13.83 1 13V3.5z" stroke="currentColor" stroke-width="1.4" style="fill:rgba(var(--gold-rgb),.08)"/></svg>`;
const SVG_FOLDER_OPEN=`<svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="color:var(--gold);opacity:.85"><path d="M1 3.5C1 2.67 1.67 2 2.5 2H6.38c.35 0 .68.13.93.37L8.5 3.5H15.5C16.33 3.5 17 4.17 17 5v1H2.5C1.67 6 1 5.33 1 4.5V3.5z" stroke="currentColor" stroke-width="1.4" style="fill:rgba(var(--gold-rgb),.12)"/><path d="M1 6h16l-1.8 7.2A1.5 1.5 0 0 1 13.74 14.5H2.5A1.5 1.5 0 0 1 1 13V6z" stroke="currentColor" stroke-width="1.4" style="fill:rgba(var(--gold-rgb),.14)"/></svg>`;
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
    return `<svg width="16" height="14" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="color:${color}"><rect x="1" y="1" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.4" style="fill:rgba(var(--gold-rgb),.06)"/><circle cx="5.5" cy="5.5" r="1.5" fill="currentColor" opacity=".7"/><path d="M1 11l4-4 3 3 2.5-2.5L16 13" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/></svg>`;
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
  const {data,error}=await _sb.storage.from(FILES_BUCKET).download(fullPath);
  if(error||!data){alert('Download-Fehler: '+((error&&error.message)||'Datei nicht gefunden'));return;}
  const url=URL.createObjectURL(data);   // gleiche Origin -> "download" wird respektiert
  const a=document.createElement('a');a.href=url;a.download=fullPath.split('/').pop();
  document.body.appendChild(a);a.click();
  setTimeout(()=>{a.remove();URL.revokeObjectURL(url);},400);
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
    // Auch die aktive Q-Phase im Forschungstagebuch setzen — für BEIDE Rollen.
    // (Bugfix: vorher wurde hier nur 'lehrer' gesetzt, activeQ.admin blieb für
    // immer beim Startwert 'Q2', wodurch refreshAll() die Admin-Ansicht nach
    // jedem Login/Reload trotz Einstellung stets auf Q2 zurückgesetzt hat.)
    activeQ.lehrer=_settings.default_qs_phase;
    activeQ.admin=_settings.default_qs_phase;
    buildQTabs('lehrer');
    buildQTabs('admin');
    renderL();
    renderA();
  }
}

function initSettingsUI(){
  const sel=document.getElementById('settingsDefaultQ');
  if(sel)sel.value=_settings.default_qs_phase||'Q2'; _dockSyncUI();
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

/* ════════════════════════════════════════════════════════════════════════
   ENDLICHER AUTOMAT  (Q3: Formale Sprachen & Automaten)
   Selbstständiges Widget: Zustände & Übergänge per Klick/Tipp erstellen,
   NEA + ε-Übergänge unterstützt, Eingaben schrittweise simulierbar.
   ════════════════════════════════════════════════════════════════════════ */
const AUTO_VB_W=600, AUTO_VB_H=300;   // feste logische Zeichenfläche (SVG viewBox)
const AUTO_R=26;                       // Zustandsradius in viewBox-Einheiten

function _autoSymbols(label){
  return (label||'').split(',').map(s=>s.trim()).filter(s=>s.length>0);
}
function _autoIsEps(sym){
  const l=(sym||'').toLowerCase();
  return sym==='ε'||l==='eps'||l==='epsilon';
}
function _autoLabelDisplay(label){
  return _autoSymbols(label).map(s=>_autoIsEps(s)?'ε':s).join(', ');
}
function _autoNextLabel(automaton){
  let n=0; const used=new Set((automaton.states||[]).map(s=>s.label));
  while(used.has('q'+n)) n++;
  return 'q'+n;
}
function _autoFindTrans(automaton, from, to){
  return automaton.transitions.find(t=>t.from===from&&t.to===to);
}
function _autoEpsClosure(automaton, ids){
  const result=new Set(ids), stack=[...ids];
  while(stack.length){
    const cur=stack.pop();
    for(const t of automaton.transitions){
      if(t.from!==cur) continue;
      if(_autoSymbols(t.label).some(_autoIsEps) && !result.has(t.to)){ result.add(t.to); stack.push(t.to); }
    }
  }
  return result;
}
function _autoStepSet(automaton, ids, ch){
  const next=new Set();
  for(const t of automaton.transitions){
    if(!ids.has(t.from)) continue;
    if(_autoSymbols(t.label).includes(ch)) next.add(t.to);
  }
  return _autoEpsClosure(automaton, next);
}
function _autoSimulate(automaton, input){
  const startState=(automaton.states||[]).find(s=>s.start);
  if(!startState) return {ok:false, error:'Kein Startzustand festgelegt.'};
  let cur=_autoEpsClosure(automaton, new Set([startState.id]));
  const trace=[{char:null, states:new Set(cur)}];
  for(const ch of input){
    cur=_autoStepSet(automaton, cur, ch);
    trace.push({char:ch, states:new Set(cur)});
    if(cur.size===0) break;
  }
  const accepted = cur.size>0 && [...cur].some(id=>{
    const st=automaton.states.find(s=>s.id===id); return st&&st.accept;
  });
  return {ok:true, trace, accepted, stuck:cur.size===0};
}

/* Baut den kompletten grafischen SVG-Inhalt (Zustände, Pfeile, Start-Pfeil,
   unsichtbare Klick-Flächen für Übergänge) als String. Enthält KEINEN Text —
   Beschriftungen sind editierbare HTML-Overlays (siehe _autoBuildLabelsLayer). */
function _autoBuildSVG(automaton, sel){
  sel=sel||{};
  const states=automaton.states||[], transitions=automaton.transitions||[];
  const activeSet=sel.active||null;
  const byId=id=>states.find(s=>s.id===id);
  let shapes='', hits='';

  transitions.forEach(t=>{
    const from=byId(t.from), to=byId(t.to);
    if(!from||!to) return;
    const isSel=sel.transId===t.id;
    const col=isSel?'#f5c060':'#5b9bf5';
    const sw=isSel?3:2;
    let d, endAng;
    if(from.id===to.id){
      const cx=from.x, topEdgeY=from.y-AUTO_R;
      const x1=cx-16, y1=topEdgeY+8, x2=cx+16, y2=topEdgeY+8;
      const c1x=cx-16, c1y=topEdgeY-34, c2x=cx+16, c2y=topEdgeY-34;
      d=`M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`;
      endAng=Math.atan2(y2-c2y, x2-c2x);
    } else {
      const reverse=_autoFindTrans(automaton, t.to, t.from);
      const dx=to.x-from.x, dy=to.y-from.y, dist=Math.hypot(dx,dy)||1;
      const ux=dx/dist, uy=dy/dist;
      const sx=from.x+ux*AUTO_R, sy=from.y+uy*AUTO_R;
      const ex=to.x-ux*AUTO_R, ey=to.y-uy*AUTO_R;
      if(reverse){
        const nx=-uy, ny=ux, bow=18;
        const cxp=(sx+ex)/2+nx*bow, cyp=(sy+ey)/2+ny*bow;
        d=`M ${sx} ${sy} Q ${cxp} ${cyp} ${ex} ${ey}`;
        endAng=Math.atan2(ey-cyp, ex-cxp);
      } else {
        d=`M ${sx} ${sy} L ${ex} ${ey}`;
        endAng=Math.atan2(dy,dx);
      }
    }
    const tipX = from.id===to.id ? (from.x+16) : (from.id!==to.id ? null : null);
    shapes+=`<path d="${d}" fill="none" stroke="${col}" stroke-width="${sw}"/>`;
    // Pfeilspitze: Endpunkt der jeweiligen Kurve/Linie
    let endX, endY;
    if(from.id===to.id){ endX=from.x+16; endY=(from.y-AUTO_R)+8; }
    else {
      const reverse2=_autoFindTrans(automaton, t.to, t.from);
      const dx2=to.x-from.x, dy2=to.y-from.y, dist2=Math.hypot(dx2,dy2)||1;
      const ux2=dx2/dist2, uy2=dy2/dist2;
      endX=to.x-ux2*AUTO_R; endY=to.y-uy2*AUTO_R;
    }
    shapes+=_arrowHead('filled', endX, endY, endAng, 10, col, sw);
    hits+=`<path data-trans-id="${t.id}" d="${d}" fill="none" stroke="transparent" stroke-width="16" style="cursor:pointer;pointer-events:stroke"/>`;
  });

  states.forEach(s=>{
    const isSel=sel.stateId===s.id, isPending=sel.pending===s.id;
    const isActive=activeSet&&activeSet.has(s.id);
    const stroke=(isSel||isPending)?'#f5c060':'#e8a030';
    const sw=(isSel||isPending)?3:2;
    if(isActive){
      shapes+=`<circle cx="${s.x}" cy="${s.y}" r="${AUTO_R+9}" fill="none" stroke="#a3e635" stroke-width="2.5" opacity=".9"><animate attributeName="r" values="${AUTO_R+8};${AUTO_R+13};${AUTO_R+8}" dur="1.1s" repeatCount="indefinite"/></circle>`;
    }
    if(isPending){
      shapes+=`<circle cx="${s.x}" cy="${s.y}" r="${AUTO_R+7}" fill="none" stroke="#f5c060" stroke-width="2" stroke-dasharray="4 4" opacity=".8"/>`;
    } else if(isSel){
      shapes+=`<circle cx="${s.x}" cy="${s.y}" r="${AUTO_R+6}" fill="none" stroke="#f5c060" stroke-width="1.5" opacity=".55"/>`;
    }
    if(s.start){
      const x2=s.x-AUTO_R, x1=x2-22;
      shapes+=`<line x1="${x1}" y1="${s.y}" x2="${x2-8}" y2="${s.y}" stroke="#e8a030" stroke-width="2.2" stroke-linecap="round"/>`;
      shapes+=_arrowHead('filled', x2, s.y, 0, 10, '#e8a030', 2.2);
    }
    shapes+=`<circle data-state-id="${s.id}" cx="${s.x}" cy="${s.y}" r="${AUTO_R}" fill="rgba(232,160,48,.10)" stroke="${stroke}" stroke-width="${sw}" style="cursor:pointer"/>`;
    if(s.accept && sel.kind!=='mealy'){
      shapes+=`<circle cx="${s.x}" cy="${s.y}" r="${AUTO_R-5}" fill="none" stroke="${stroke}" stroke-width="1.4" style="pointer-events:none"/>`;
    }
  });
  return shapes+hits;
}

function _autoQueueFocus(span){
  requestAnimationFrame(()=>{
    span.focus();
    const range=document.createRange(); range.selectNodeContents(span); range.collapse(false);
    const sel=window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
  });
}
function _autoMiniBtn(text, active, onClick, danger){
  const b=document.createElement('button'); b.type='button';
  b.className='auto-mini-btn'+(active?' active':'')+(danger?' danger':'');
  b.textContent=text;
  b.addEventListener('mousedown',ev=>ev.stopPropagation());
  b.addEventListener('click',ev=>{ev.stopPropagation();onClick();});
  return b;
}
function _autoWireLabelEditing(span, getLiveObj, prop, isTransition, kind){
  span.addEventListener('mousedown', ev=>ev.stopPropagation());
  span.addEventListener('click', ev=>ev.stopPropagation());
  let histPushed=false;
  span.addEventListener('focus', ()=>{ histPushed=false; });
  span.addEventListener('keydown', ev=>{
    ev.stopPropagation();
    if(ev.key==='Enter'){ ev.preventDefault(); span.blur(); }
  });
  span.addEventListener('paste', ev=>{
    ev.preventDefault(); ev.stopPropagation();
    const text=(ev.clipboardData||window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, text);
  });
  span.addEventListener('input', ()=>{
    if(!histPushed){ pushHistory((isTransition?'Übergang':'Zustand')+' bearbeitet'); histPushed=true; }
    const obj=getLiveObj(); if(!obj) return;
    obj[prop]=span.textContent; _spRefresh();
  });
  span.addEventListener('blur', ()=>{
    histPushed=false;
    const obj=getLiveObj(); if(!obj) return;
    if(isTransition){
      const norm=kind==='mealy'?_mealyNormalize(obj[prop]):_autoSymbols(obj[prop]).map(s=>_autoIsEps(s)?'ε':s).join(', ');
      obj[prop]=norm; span.textContent=norm;
    }
  });
}

/* Editierbare Beschriftungen + kontextuelle Mini-Toolbars als HTML-Overlay
   (SVG <text> kann nicht zuverlässig contentEditable sein). */
function _autoBuildLabelsLayer(el, automaton, ui, readOnly, rerenderFn){
  const focusStateId=ui.focusStateId, focusTransId=ui.focusTransId;
  const isMealy=el.type==='mealy';
  ui.focusStateId=null; ui.focusTransId=null;
  const frag=document.createElement('div'); frag.className='el-auto-labels';
  const states=automaton.states||[], transitions=automaton.transitions||[];

  states.forEach(s=>{
    const span=document.createElement('span'); span.className='auto-state-label';
    span.style.left=(s.x/AUTO_VB_W*100)+'%'; span.style.top=(s.y/AUTO_VB_H*100)+'%';
    span.contentEditable=readOnly?'false':'true';
    span.textContent=s.label||'';
    if(!readOnly) _autoWireLabelEditing(span, ()=>{ const a=getEl(el.id); return a?a.automaton.states.find(x=>x.id===s.id):null; }, 'label', false, isMealy?'mealy':'dfa');
    frag.appendChild(span);
    if(focusStateId===s.id) _autoQueueFocus(span);
  });

  transitions.forEach(t=>{
    const from=states.find(x=>x.id===t.from), to=states.find(x=>x.id===t.to);
    if(!from||!to) return;
    let px,py;
    if(from.id===to.id){ px=from.x; py=from.y-AUTO_R-38; }
    else {
      const reverse=_autoFindTrans(automaton, t.to, t.from);
      const dx=to.x-from.x, dy=to.y-from.y, dist=Math.hypot(dx,dy)||1;
      if(reverse){ const nx=-dy/dist, ny=dx/dist, bow=18; px=(from.x+to.x)/2+nx*bow; py=(from.y+to.y)/2+ny*bow-9; }
      else { px=(from.x+to.x)/2; py=(from.y+to.y)/2-9; }
    }
    const span=document.createElement('span'); span.className='auto-trans-label';
    if(ui.selTrans===t.id) span.classList.add('sel');
    span.style.left=(Math.max(6,Math.min(AUTO_VB_W-6,px))/AUTO_VB_W*100)+'%';
    span.style.top=(py/AUTO_VB_H*100)+'%';
    span.contentEditable=readOnly?'false':'true';
    span.textContent=isMealy?_mealyNormalize(t.label):_autoLabelDisplay(t.label);
    if(isMealy) span.classList.add('mealy');
    if(!readOnly) _autoWireLabelEditing(span, ()=>{ const a=getEl(el.id); return a?a.automaton.transitions.find(x=>x.id===t.id):null; }, 'label', true, isMealy?'mealy':'dfa');
    frag.appendChild(span);
    if(focusTransId===t.id) _autoQueueFocus(span);
  });

  if(!readOnly && ui.selState){
    const s=states.find(x=>x.id===ui.selState);
    if(s){
      const bar=document.createElement('div'); bar.className='auto-mini-bar';
      bar.style.left=(s.x/AUTO_VB_W*100)+'%';
      bar.style.top=(Math.max(0,s.y-AUTO_R)/AUTO_VB_H*100)+'%';
      bar.appendChild(_autoMiniBtn(s.start?'★ Start':'☆ Start', s.start, ()=>{
        pushHistory('Startzustand geändert');
        const a=getEl(el.id).automaton;
        a.states.forEach(x=>x.start=false);
        const live=a.states.find(x=>x.id===s.id); if(live)live.start=true;
        rerenderFn();
      }));
      if(!isMealy) bar.appendChild(_autoMiniBtn(s.accept?'◎ Akz.':'○ Akz.', s.accept, ()=>{
        pushHistory('Akzeptierend umgeschaltet');
        const live=getEl(el.id).automaton.states.find(x=>x.id===s.id); if(live)live.accept=!live.accept;
        rerenderFn();
      }));
      bar.appendChild(_autoMiniBtn('↺ Schleife', false, ()=>{
        pushHistory('Selbstschleife hinzugefügt');
        const a=getEl(el.id).automaton;
        let t=_autoFindTrans(a, s.id, s.id);
        if(!t){ t={id:uid(), from:s.id, to:s.id, label:''}; a.transitions.push(t); }
        ui.focusTransId=t.id; ui.selTrans=t.id; ui.selState=null;
        rerenderFn();
      }));
      bar.appendChild(_autoMiniBtn('🗑', false, ()=>{
        pushHistory('Zustand gelöscht');
        const a=getEl(el.id).automaton;
        a.states=a.states.filter(x=>x.id!==s.id);
        a.transitions=a.transitions.filter(t=>t.from!==s.id&&t.to!==s.id);
        ui.selState=null;
        rerenderFn(); _spRefresh();
      }, true));
      frag.appendChild(bar);
    }
  }
  if(!readOnly && ui.selTrans){
    const t=transitions.find(x=>x.id===ui.selTrans);
    if(t){
      const from=states.find(x=>x.id===t.from), to=states.find(x=>x.id===t.to);
      if(from&&to){
        let px,py;
        if(from.id===to.id){ px=from.x; py=from.y-AUTO_R-56; }
        else { px=(from.x+to.x)/2; py=Math.min(from.y,to.y)-30; }
        const bar=document.createElement('div'); bar.className='auto-mini-bar';
        bar.style.left=(Math.max(6,Math.min(AUTO_VB_W-6,px))/AUTO_VB_W*100)+'%';
        bar.style.top=(py/AUTO_VB_H*100)+'%';
        if(!isMealy) bar.appendChild(_autoMiniBtn('ε', false, ()=>{
          pushHistory('Übergang bearbeitet');
          const live=getEl(el.id).automaton.transitions.find(x=>x.id===t.id);
          const cur=_autoSymbols(live.label);
          if(!cur.some(_autoIsEps)) cur.push('ε');
          live.label=cur.join(', ');
          rerenderFn();
        }));
        bar.appendChild(_autoMiniBtn('🗑', false, ()=>{
          pushHistory('Übergang gelöscht');
          const a=getEl(el.id).automaton;
          a.transitions=a.transitions.filter(x=>x.id!==t.id);
          ui.selTrans=null;
          rerenderFn(); _spRefresh();
        }, true));
        frag.appendChild(bar);
      }
    }
  }
  return frag;
}

function buildAutomatonWidget(el, readOnly, canRun){
  const wrap=document.createElement('div'); wrap.className='el-auto-wrap';
  el.automaton = el.automaton || {states:[], transitions:[], test:''};
  const isMealy=el.type==='mealy'; if(isMealy) wrap.classList.add('is-mealy');

  const ui = { selState:null, selTrans:null, pending:null, connectMode:false,
               focusStateId:null, focusTransId:null,
               simTrace:null, simStep:0, playTimer:null };

  let toolbar=null, hintEl=null, connBtn=null, input=null, tapeRow=null;

  const canvasWrap=document.createElement('div'); canvasWrap.className='el-auto-canvas';
  const svg=mkSVGEl('svg'); svg.setAttribute('viewBox',`0 0 ${AUTO_VB_W} ${AUTO_VB_H}`);
  svg.setAttribute('preserveAspectRatio','none'); svg.classList.add('el-auto-svg');
  const bgRect=mkSVGEl('rect');
  bgRect.setAttribute('x','0'); bgRect.setAttribute('y','0');
  bgRect.setAttribute('width',String(AUTO_VB_W)); bgRect.setAttribute('height',String(AUTO_VB_H));
  bgRect.setAttribute('fill','transparent'); bgRect.style.cursor=readOnly?'default':'copy';
  svg.appendChild(bgRect);
  const labelsHost=document.createElement('div');
  canvasWrap.appendChild(svg); canvasWrap.appendChild(labelsHost);

  function currentAutomaton(){ const a=getEl(el.id); return a?a.automaton:el.automaton; }

  function rerender(){
    const a=currentAutomaton();
    const activeIds = ui.simTrace ? ui.simTrace.trace[ui.simStep].states : null;
    while(svg.children.length>1) svg.removeChild(svg.lastChild);
    svg.insertAdjacentHTML('beforeend', _autoBuildSVG(a, {stateId:ui.selState, transId:ui.selTrans, pending:ui.pending, active:activeIds, kind:isMealy?'mealy':'dfa'}));
    if(!readOnly){
      svg.querySelectorAll('[data-state-id]').forEach(node=>{
        node.addEventListener('mousedown', ev=>onStateMouseDown(ev, node.dataset.stateId));
      });
      svg.querySelectorAll('[data-trans-id]').forEach(node=>{
        node.addEventListener('mousedown', ev=>{ ev.stopPropagation(); onTransTap(node.dataset.transId); });
      });
    }
    labelsHost.innerHTML='';
    labelsHost.appendChild(_autoBuildLabelsLayer(el, a, ui, readOnly, rerender));
    if(hintEl) hintEl.textContent = ui.connectMode
      ? (ui.pending? 'Zielzustand antippen (oder freie Fläche für neuen Zustand)…' : 'Startzustand für Übergang antippen…')
      : (isMealy?'Freie Fläche: neuer Zustand · Beschriftung: Eingabe/Ausgabe, z. B. a/1':'Freie Fläche: neuer Zustand · Zustand antippen: bearbeiten');
    if(connBtn) connBtn.classList.toggle('active', ui.connectMode);
    renderTape();
    _spRefresh();
  }

  function addOrFocusTransition(automaton, from, to){
    let t=_autoFindTrans(automaton, from, to);
    if(!t){ t={id:uid(), from, to, label:''}; automaton.transitions.push(t); }
    ui.selTrans=t.id; ui.selState=null; ui.focusTransId=t.id;
  }

  function onStateTap(stateId){
    if(ui.connectMode){
      if(ui.pending===null){ ui.pending=stateId; }
      else if(ui.pending===stateId){ ui.pending=null; }
      else {
        const aLive=getEl(el.id).automaton;
        pushHistory('Übergang hinzugefügt');
        addOrFocusTransition(aLive, ui.pending, stateId);
        ui.pending=stateId;
      }
    } else {
      if(ui.selState===stateId){ ui.selState=null; }
      else { ui.selState=stateId; ui.selTrans=null; }
    }
    rerender();
  }
  function onTransTap(transId){
    if(ui.selTrans===transId){ ui.selTrans=null; }
    else { ui.selTrans=transId; ui.selState=null; }
    rerender();
  }
  function onCanvasBackgroundTap(vbX, vbY){
    const aLive=getEl(el.id).automaton;
    pushHistory('Zustand hinzugefügt');
    const st={id:uid(), x:Math.round(vbX), y:Math.round(vbY), label:_autoNextLabel(aLive), start:aLive.states.length===0, accept:false};
    aLive.states.push(st);
    if(ui.connectMode && ui.pending!==null){
      addOrFocusTransition(aLive, ui.pending, st.id);
    } else {
      ui.selState=null; ui.selTrans=null;
    }
    if(ui.connectMode) ui.pending=st.id;
    rerender();
  }
  function onStateMouseDown(ev, stateId){
    if(readOnly) return;
    ev.stopPropagation(); ev.preventDefault();
    const state=currentAutomaton().states.find(s=>s.id===stateId); if(!state) return;
    const startClientX=ev.clientX, startClientY=ev.clientY;
    const startX=state.x, startY=state.y;
    let dragging=false;
    function onMove(mv){
      const dxPix=mv.clientX-startClientX, dyPix=mv.clientY-startClientY;
      if(!dragging && Math.hypot(dxPix,dyPix)>4){ dragging=true; pushHistory('Zustand verschoben'); }
      if(dragging){
        const r=canvasWrap.getBoundingClientRect();
        const scaleX=r.width/AUTO_VB_W||1, scaleY=r.height/AUTO_VB_H||1;
        const live=currentAutomaton().states.find(s=>s.id===stateId); if(!live) return;
        let nx=startX+dxPix/scaleX, ny=startY+dyPix/scaleY;
        nx=Math.max(AUTO_R, Math.min(AUTO_VB_W-AUTO_R, nx));
        ny=Math.max(AUTO_R, Math.min(AUTO_VB_H-AUTO_R, ny));
        live.x=Math.round(nx); live.y=Math.round(ny);
        rerender();
      }
    }
    function onUp(){
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if(!dragging) onStateTap(stateId); else _spRefresh();
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  bgRect.addEventListener('click', ev=>{
    if(readOnly) return;
    ev.stopPropagation();
    const r=canvasWrap.getBoundingClientRect();
    const vbX=(ev.clientX-r.left)/(r.width||1)*AUTO_VB_W;
    const vbY=(ev.clientY-r.top)/(r.height||1)*AUTO_VB_H;
    onCanvasBackgroundTap(vbX, vbY);
  });
  bgRect.addEventListener('mousedown', ev=>ev.stopPropagation());

  if(!readOnly){
    toolbar=document.createElement('div'); toolbar.className='el-auto-toolbar';
    const addBtn=document.createElement('button'); addBtn.type='button'; addBtn.className='el-auto-tbtn';
    addBtn.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Zustand';
    addBtn.addEventListener('mousedown',ev=>ev.stopPropagation());
    addBtn.addEventListener('click',ev=>{
      ev.stopPropagation();
      const aLive=getEl(el.id).automaton;
      pushHistory('Zustand hinzugefügt');
      const cx=AUTO_VB_W/2+(Math.random()*160-80), cy=AUTO_VB_H/2+(Math.random()*100-50);
      const st={id:uid(), x:Math.round(cx), y:Math.round(cy), label:_autoNextLabel(aLive), start:aLive.states.length===0, accept:false};
      aLive.states.push(st);
      ui.selState=st.id; ui.selTrans=null; ui.focusStateId=st.id;
      rerender();
    });
    connBtn=document.createElement('button'); connBtn.type='button'; connBtn.className='el-auto-tbtn';
    connBtn.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="5" cy="12" r="3"/><circle cx="19" cy="12" r="3"/><line x1="8" y1="12" x2="16" y2="12"/></svg> Verbinden';
    connBtn.addEventListener('mousedown',ev=>ev.stopPropagation());
    connBtn.addEventListener('click',ev=>{
      ev.stopPropagation();
      ui.connectMode=!ui.connectMode; ui.pending=null; ui.selState=null; ui.selTrans=null;
      rerender();
    });
    hintEl=document.createElement('span'); hintEl.className='el-auto-hint';
    toolbar.appendChild(addBtn); toolbar.appendChild(connBtn); toolbar.appendChild(hintEl);
    wrap.appendChild(toolbar);
  }

  wrap.appendChild(canvasWrap);

  function computeTrace(){
    const a=currentAutomaton();
    const testStr = input ? input.value : (a.test||'');
    const r=isMealy?_mealySimulate(a, testStr):_autoSimulate(a, testStr);
    return Object.assign({input:testStr}, r);
  }
  function showSimError(msg){
    clearInterval(ui.playTimer); ui.playTimer=null; ui.simTrace=null;
    if(tapeRow){ tapeRow.style.display='flex'; tapeRow.innerHTML=`<span class="el-auto-statustext err">${esc(msg)}</span>`; }
  }
  function stepOnce(){
    if(!ui.simTrace){
      const r=computeTrace(); if(!r.ok){ showSimError(r.error); return; }
      ui.simTrace=r; ui.simStep=0;
    } else if(ui.simStep<ui.simTrace.trace.length-1){ ui.simStep++; }
    clearInterval(ui.playTimer); ui.playTimer=null;
    rerender();
  }
  function startPlay(){
    const r=computeTrace(); if(!r.ok){ showSimError(r.error); return; }
    clearInterval(ui.playTimer);
    ui.simTrace=r; ui.simStep=0;
    rerender();
    ui.playTimer=setInterval(()=>{
      if(ui.simStep>=ui.simTrace.trace.length-1){ clearInterval(ui.playTimer); ui.playTimer=null; return; }
      ui.simStep++; rerender();
    },700);
  }
  function resetSim(){
    clearInterval(ui.playTimer); ui.playTimer=null;
    ui.simTrace=null; ui.simStep=0;
    rerender();
  }
  function renderTape(){
    if(!tapeRow) return;
    if(!ui.simTrace){ tapeRow.innerHTML=''; tapeRow.style.display='none'; return; }
    tapeRow.style.display='flex';
    if(isMealy){ tapeRow.innerHTML=_mealyTapeHTML(ui.simTrace, ui.simStep, currentAutomaton()); return; }
    const {trace, accepted, input:testStr}=ui.simTrace;
    let html='<div class="el-auto-tape">';
    if(!testStr){ html+='<span class="auto-tape-empty">(leeres Wort ε)</span>'; }
    else{
      [...testStr].forEach((ch,i)=>{
        const cls=i<ui.simStep?'done':(i===ui.simStep?'current':'');
        html+=`<span class="auto-tape-ch ${cls}">${esc(ch)}</span>`;
      });
    }
    html+='</div>';
    const atEnd=ui.simStep>=trace.length-1;
    const curSet=trace[ui.simStep].states;
    let statusHtml;
    if(curSet.size===0){
      statusHtml='<span class="el-auto-statustext err">Kein Übergang möglich — der Automat "stirbt" hier.</span>';
    } else {
      const names=[...curSet].map(id=>{ const st=currentAutomaton().states.find(s=>s.id===id); return st?st.label:id; }).join(', ');
      if(atEnd){
        statusHtml = accepted
          ? `<span class="el-auto-statustext ok">✓ Akzeptiert — aktiver Zustand {${esc(names)}} ist ein Endzustand</span>`
          : `<span class="el-auto-statustext err">✗ Verworfen — {${esc(names)}} enthält keinen Endzustand</span>`;
      } else {
        statusHtml = `<span class="el-auto-statustext">Aktuell: {${esc(names)}}</span>`;
      }
    }
    tapeRow.innerHTML = html+statusHtml;
  }

  if(!readOnly || canRun){
    const simrow=document.createElement('div'); simrow.className='el-auto-simrow';
    input=document.createElement('input'); input.type='text'; input.className='el-auto-input';
    input.placeholder=isMealy?'Eingabewort, z. B. 0110':'Eingabewort, z. B. ababb'; input.value=el.automaton.test||'';
    input.autocomplete='off'; input.spellcheck=false;
    input.addEventListener('mousedown',ev=>ev.stopPropagation());
    input.addEventListener('keydown',ev=>{ ev.stopPropagation(); if(ev.key==='Enter'){ ev.preventDefault(); startPlay(); } });
    input.addEventListener('input',()=>{ pushHistoryDebounced('Testwort geändert'); const a=getEl(el.id); if(a)a.automaton.test=input.value; });

    const stepBtn=document.createElement('button'); stepBtn.type='button'; stepBtn.className='el-auto-stepbtn'; stepBtn.title='Einzelschritt';
    stepBtn.innerHTML='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>';
    const playBtn=document.createElement('button'); playBtn.type='button'; playBtn.className='el-auto-playbtn'; playBtn.title='Simulation starten';
    playBtn.innerHTML='<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
    const resetBtn=document.createElement('button'); resetBtn.type='button'; resetBtn.className='el-auto-resetbtn'; resetBtn.title='Zurücksetzen';
    resetBtn.innerHTML='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><polyline points="3 4 3 9 8 9"/></svg>';
    [stepBtn,playBtn,resetBtn].forEach(b=>b.addEventListener('mousedown',ev=>ev.stopPropagation()));
    stepBtn.addEventListener('click',ev=>{ev.stopPropagation();stepOnce();});
    playBtn.addEventListener('click',ev=>{ev.stopPropagation();startPlay();});
    resetBtn.addEventListener('click',ev=>{ev.stopPropagation();resetSim();});

    simrow.appendChild(input); simrow.appendChild(stepBtn); simrow.appendChild(playBtn); simrow.appendChild(resetBtn);
    wrap.appendChild(simrow);
    tapeRow=document.createElement('div'); tapeRow.className='el-auto-taperow'; tapeRow.style.display='none';
    wrap.appendChild(tapeRow);
  }

  rerender();
  return wrap;
}

/* ════════════════════════════════════════════════════════════════════════
   REGULÄRER AUSDRUCK  (Q3: Formale Sprachen)
   Muster + mehrere Testwörter (eines pro Zeile), Volltreffer- oder
   Teilstring-Modus, Groß/Klein-Option — Auswertung per nativer RegExp.
   ════════════════════════════════════════════════════════════════════════ */
function _regexEvaluate(pattern, opts, testsStr){
  opts=opts||{};
  const lines=(testsStr||'').split('\n').map(s=>s.replace(/\r$/,''));
  const nonEmpty=lines.filter(l=>l.length>0);
  const flags=opts.icase?'i':'';
  let re;
  try{
    const src = opts.fullMatch!==false ? '^(?:'+pattern+')$' : pattern;
    re=new RegExp(src, flags);
  }catch(err){
    return {ok:false, error:err.message, results:[]};
  }
  const results=nonEmpty.map(line=>({input:line, match:re.test(line)}));
  return {ok:true, error:null, results};
}

function buildRegexWidget(el, readOnly, canRun){
  const wrap=document.createElement('div'); wrap.className='el-regex-wrap';
  el.regex = el.regex || {pattern:'', icase:false, fullMatch:true, tests:'', results:null};
  const st=el.style||{};

  const patRow=document.createElement('div'); patRow.className='el-regex-patrow';
  const slash1=document.createElement('span'); slash1.className='el-regex-lbl'; slash1.textContent='/';
  const patInput=document.createElement('input'); patInput.type='text'; patInput.className='el-regex-pattern';
  patInput.placeholder='a(b|c)*'; patInput.value=el.regex.pattern||'';
  patInput.spellcheck=false; patInput.autocomplete='off';
  patInput.style.color=st.color||'#a3e635'; patInput.style.fontFamily=st.fontFamily||"'JetBrains Mono',monospace"; patInput.style.fontSize=(st.fontSize||13)+'px';
  const slash2=document.createElement('span'); slash2.className='el-regex-lbl'; slash2.textContent='/';
  patRow.appendChild(slash1); patRow.appendChild(patInput); patRow.appendChild(slash2);
  if(!readOnly){
    patInput.addEventListener('mousedown',ev=>ev.stopPropagation());
    patInput.addEventListener('keydown',ev=>{ ev.stopPropagation(); if(ev.key==='Enter'){ ev.preventDefault(); doEvaluate(); } });
    patInput.addEventListener('input',()=>{ pushHistoryDebounced('Regulärer Ausdruck geändert'); const a=getEl(el.id); if(a)a.regex.pattern=patInput.value; });
  } else { patInput.readOnly=true; }

  const optsRow=document.createElement('div'); optsRow.className='el-regex-optsrow';
  if(!readOnly){
    const mkOpt=(labelText, checked, onChange)=>{
      const lab=document.createElement('label'); lab.className='el-regex-opt';
      const cb=document.createElement('input'); cb.type='checkbox'; cb.checked=checked;
      cb.addEventListener('mousedown',ev=>ev.stopPropagation());
      cb.addEventListener('change',()=>{ pushHistory('Regex-Option geändert'); onChange(cb.checked); });
      lab.appendChild(cb); lab.appendChild(document.createTextNode(' '+labelText));
      return lab;
    };
    optsRow.appendChild(mkOpt('Vollständige Übereinstimmung (^…$)', el.regex.fullMatch!==false, v=>{ const a=getEl(el.id); if(a)a.regex.fullMatch=v; }));
    optsRow.appendChild(mkOpt('Groß/Klein ignorieren', !!el.regex.icase, v=>{ const a=getEl(el.id); if(a)a.regex.icase=v; }));
    wrap.appendChild(patRow); wrap.appendChild(optsRow);
  } else {
    wrap.appendChild(patRow);
  }

  const testsArea=document.createElement('textarea'); testsArea.className='el-regex-tests';
  testsArea.placeholder='Ein Testwort pro Zeile …\nabc\nabbccb'; testsArea.value=el.regex.tests||'';
  testsArea.spellcheck=false; testsArea.readOnly=readOnly;
  testsArea.style.color=st.color||'#a3e635'; testsArea.style.fontFamily=st.fontFamily||"'JetBrains Mono',monospace"; testsArea.style.fontSize=(st.fontSize||13)+'px';
  if(!readOnly){
    testsArea.addEventListener('mousedown',ev=>ev.stopPropagation());
    testsArea.addEventListener('keydown',ev=>ev.stopPropagation());
    testsArea.addEventListener('input',()=>{ pushHistoryDebounced('Testwörter geändert'); const a=getEl(el.id); if(a)a.regex.tests=testsArea.value; });
  }
  wrap.appendChild(testsArea);

  const resDiv=document.createElement('div'); resDiv.className='el-regex-results';

  function doEvaluate(){
    const a=getEl(el.id); if(!a) return;
    const r=_regexEvaluate(a.regex.pattern, {icase:a.regex.icase, fullMatch:a.regex.fullMatch!==false}, a.regex.tests);
    a.regex.results=r;
    renderResults(r);
    _spRefresh();
  }
  function renderResults(r){
    if(!r){ resDiv.innerHTML=''; resDiv.style.display='none'; return; }
    resDiv.style.display='block';
    if(!r.ok){
      resDiv.innerHTML=`<div class="regex-res-err"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span>Ungültiger regulärer Ausdruck: ${esc(r.error)}</span></div>`;
      return;
    }
    if(!r.results.length){ resDiv.innerHTML='<div class="regex-res-empty">Keine Testwörter angegeben.</div>'; return; }
    resDiv.innerHTML=r.results.map(x=>`<div class="regex-res-item ${x.match?'ok':'no'}"><span class="regex-res-mark">${x.match?'✓':'✗'}</span><span class="regex-res-word">${esc(x.input)}</span></div>`).join('');
  }

  if(!readOnly || canRun){
    const btnRow=document.createElement('div'); btnRow.className='el-regex-btnrow';
    const runBtn=document.createElement('button'); runBtn.type='button'; runBtn.className='el-regex-run';
    runBtn.innerHTML='<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> Auswerten';
    runBtn.addEventListener('mousedown',ev=>ev.stopPropagation());
    runBtn.addEventListener('click',ev=>{ ev.stopPropagation(); doEvaluate(); });
    btnRow.appendChild(runBtn);
    if(!readOnly){
      const clearBtn=document.createElement('button'); clearBtn.type='button'; clearBtn.className='el-regex-clear';
      clearBtn.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg> Leeren';
      clearBtn.addEventListener('mousedown',ev=>ev.stopPropagation());
      clearBtn.addEventListener('click',ev=>{ ev.stopPropagation(); const a=getEl(el.id); if(a)a.regex.results=null; renderResults(null); });
      btnRow.appendChild(clearBtn);
    }
    wrap.appendChild(btnRow);
  }
  wrap.appendChild(resDiv);
  if(el.regex.results) renderResults(el.regex.results);
  return wrap;
}


/* ════════════════════════════════════════════════════════════════════════
   KLEINE UI-HELFER
   ════════════════════════════════════════════════════════════════════════ */
function _ftToast(msg, kind){
  let t=document.getElementById('ftToast');
  if(!t){ t=document.createElement('div'); t.id='ftToast'; document.body.appendChild(t); }
  t.className='ft-toast'+(kind?' '+kind:''); t.textContent=msg; t.style.display='block';
  clearTimeout(t._tm); t._tm=setTimeout(()=>{ t.style.display='none'; }, kind==='err'?5200:2800);
}

/* ════════════════════════════════════════════════════════════════════════
   ELEMENTOPTIONEN PER RECHTSKLICK
   Das Kontextmenü (Rechtsklick auf JEDES Element im Editor) bietet „Elementoptionen":
   ein schwebendes Fenster, in das das vorhandene Format-Panel (#fmtCtrl) verschoben wird.
   Alle Optionen sind damit für alle Elementtypen (Text, ER, Formen, Linien, Pfeile,
   Markierungen, Automaten, …) direkt am Cursor erreichbar.
   ════════════════════════════════════════════════════════════════════════ */
var _elOptHome=null, _ctxLastX=0, _ctxLastY=0;
function openElOptions(){
  const pop=document.getElementById('elOptPop'), body=document.getElementById('elOptBody');
  if(!pop||!body) return;
  hideCtxMenu();
  closeElOptions();
  let node=null, title='';
  if(_multiSel.size>1){
    populateMultiFmt(); node=document.getElementById('fmtMultiCtrl'); title=_multiSel.size+' Elemente';
  } else {
    const id=selElId||_ctxTargetId; const el=id?getEl(id):null; if(!el) return;
    if(selElId!==id){ (el.type==='er-line'||el.type==='sym-arrow') ? selectLine(id) : selectEl(id); }
    populateFmt(el);
    node=document.getElementById('fmtCtrl'); title=typeLabel(el.type);
  }
  if(!node||!node.parentNode) return;
  _elOptHome={node, parent:node.parentNode, next:node.nextSibling};
  body.appendChild(node); node.style.display='block';
  document.getElementById('elOptTitle').textContent='Elementoptionen · '+title;
  pop.style.display='flex';
  const vw=window.innerWidth, vh=window.innerHeight;
  const w=pop.offsetWidth||290, h=pop.offsetHeight||420;
  let x=_ctxLastX+8, y=_ctxLastY-12;
  if(x+w>vw-10) x=Math.max(10,_ctxLastX-w-8);
  if(y+h>vh-10) y=vh-h-10;
  pop.style.left=x+'px'; pop.style.top=Math.max(10,y)+'px';
}
function closeElOptions(){
  const pop=document.getElementById('elOptPop'); if(!pop) return;
  if(_elOptHome){
    const {node,parent,next}=_elOptHome; _elOptHome=null;
    const mc=document.getElementById('fmtMultiCtrl'), body=document.getElementById('elOptBody');
    if(mc && body && body.contains(mc) && mc!==node) parent.appendChild(mc); // Mehrfachauswahl-Panel zurück in die Seitenleiste
    parent.insertBefore(node, (next&&next.parentNode===parent)?next:null);
    if(node.id==='fmtCtrl') node.style.display=(selElId&&_multiSel.size<=1)?'block':'none';
    else if(node.id==='fmtMultiCtrl') node.style.display=_multiSel.size>1?'block':'none';
  }
  pop.style.display='none';
}
/* Popover per Kopfzeile verschiebbar */
document.addEventListener('mousedown', ev=>{
  const hd=ev.target.closest&&ev.target.closest('#elOptHd');
  if(!hd||ev.target.closest('.el-opt-x')) return;
  const pop=document.getElementById('elOptPop'); if(!pop) return;
  ev.preventDefault();
  const r=pop.getBoundingClientRect(), dx=ev.clientX-r.left, dy=ev.clientY-r.top;
  const mv=e=>{ pop.style.left=Math.max(0,Math.min(window.innerWidth-60,e.clientX-dx))+'px'; pop.style.top=Math.max(0,Math.min(window.innerHeight-40,e.clientY-dy))+'px'; };
  const up=()=>{ document.removeEventListener('mousemove',mv); document.removeEventListener('mouseup',up); };
  document.addEventListener('mousemove',mv); document.addEventListener('mouseup',up);
});

/* ════════════════════════════════════════════════════════════════════════
   AUTO-ERSETZUNG   ->  →    <=  ≤    !=  ≠    …
   Wirkt nur in Text-, Überschrift-, Badge-, ER- und Formen-Beschriftungen (nicht in Code/SQL/RegEx).
   Direkt nach der Ersetzung macht die RÜCKTASTE sie rückgängig (wie in Word/Docs).
   Ein-/Ausschalter: Button „→" in der Text-Werkzeugleiste (wird pro Browser gespeichert).
   ════════════════════════════════════════════════════════════════════════ */
const AUTOREPL = (() => {
  const LS_KEY='ft_autorepl';
  // [Muster, Ersetzung, Original-Zeichenfolge fürs Rückgängigmachen] — längste Muster zuerst
  const RULES=[
    ['...','…'],
    ['←>', '↔','<->'],     // „<-" wird sofort zu ←; kommt ein „>" dazu, wird daraus ↔
    ['≤>', '⇔','<=>'],     // „<=" wird sofort zu ≤; kommt ein „>" dazu, wird daraus ⇔
    ['->','→'], ['<-','←'], ['=>','⇒'], ['<=','≤'], ['>=','≥'], ['!=','≠'], ['+-','±'],
  ];
  // \name + Leerzeichen/Satzzeichen  (nur bewusst getippt, daher unkritisch)
  const WORDS={ eps:'ε', epsilon:'ε', delta:'δ', Delta:'Δ', sigma:'σ', Sigma:'Σ', lambda:'λ', alpha:'α', beta:'β',
    gamma:'γ', Gamma:'Γ', pi:'π', mu:'μ', omega:'ω', Omega:'Ω', empty:'∅', in:'∈', notin:'∉', cup:'∪', cap:'∩',
    subset:'⊆', forall:'∀', exists:'∃', infty:'∞', to:'→', leq:'≤', geq:'≥', neq:'≠', cdot:'·', times:'×' };
  let _busy=false, _last=null;
  const norm=s=>s.replace(/\u00a0/g,' ');

  function enabled(){ try{ return localStorage.getItem(LS_KEY)!=='0'; }catch(e){ return true; } }
  function syncBtn(){ const b=document.getElementById('rtbBtnAutoRepl'); if(b) b.classList.toggle('active', enabled()); }
  function toggle(){
    const on=!enabled();
    try{ localStorage.setItem(LS_KEY,on?'1':'0'); }catch(e){}
    syncBtn();
    _ftToast(on?'Auto-Ersetzung an:  ->  wird zu  →   (Rücktaste direkt danach macht es rückgängig)':'Auto-Ersetzung aus');
  }
  function hostOf(t){
    const h=t&&t.closest?t.closest('[contenteditable="true"]'):null;
    return (h&&h.matches('.el-text,.el-badge-inner,.el-er-text,.el-sym-text'))?h:null;
  }
  function replaceRange(node,start,end,text){
    const sel=window.getSelection(), rg=document.createRange();
    rg.setStart(node,start); rg.setEnd(node,end); sel.removeAllRanges(); sel.addRange(rg);
    let done=false;
    if(typeof document.execCommand==='function'){ try{ done=document.execCommand('insertText',false,text); }catch(e){ done=false; } }
    if(!done){
      node.replaceData(start,end-start,text);
      const r2=document.createRange(); r2.setStart(node,start+text.length); r2.collapse(true);
      sel.removeAllRanges(); sel.addRange(r2);
    }
    const r=sel.rangeCount?sel.getRangeAt(0):null;
    return r?{node:r.startContainer,off:r.startOffset}:null;
  }
  function onInput(ev){
    if(_busy) return;
    _last=null;
    if(!enabled()||ev.isComposing||ev.inputType!=='insertText'||!ev.data||ev.data.length!==1) return;
    if(!hostOf(ev.target)) return;
    const sel=window.getSelection(); if(!sel||!sel.rangeCount||!sel.isCollapsed) return;
    const r=sel.getRangeAt(0), node=r.startContainer;
    if(node.nodeType!==3) return;
    const off=r.startOffset, before=node.data.slice(0,off);
    let hit=null;
    for(const [trig,repl,orig] of RULES){ if(before.endsWith(trig)){ hit={len:trig.length,repl,orig:orig||trig}; break; } }
    if(!hit && /^[\s.,;:!?)\]}]$/.test(ev.data)){
      const m=/\\([A-Za-z]+)$/.exec(before.slice(0,-1));
      if(m && Object.prototype.hasOwnProperty.call(WORDS,m[1])) hit={len:m[0].length+1,repl:WORDS[m[1]]+ev.data,orig:m[0]+ev.data};
    }
    if(!hit) return;
    let pos; _busy=true;
    try{ pos=replaceRange(node,off-hit.len,off,hit.repl); } finally{ _busy=false; }
    if(pos) _last={node:pos.node,end:pos.off,repl:hit.repl,orig:hit.orig};
  }
  function onKeydown(ev){
    if(!_last) return;
    if(ev.key!=='Backspace'){ if(!['Shift','Control','Alt','Meta','CapsLock'].includes(ev.key)) _last=null; return; }
    const sel=window.getSelection(); const L=_last; _last=null;
    if(!sel||!sel.rangeCount||!sel.isCollapsed) return;
    const r=sel.getRangeAt(0);
    if(r.startContainer!==L.node||r.startOffset!==L.end||L.node.nodeType!==3) return;
    const start=L.end-L.repl.length; if(start<0) return;
    if(norm(L.node.data.slice(start,L.end))!==norm(L.repl)) return;
    ev.preventDefault(); ev.stopPropagation();
    _busy=true; try{ replaceRange(L.node,start,L.end,L.orig); } finally{ _busy=false; }
  }
  document.addEventListener('input', onInput, true);
  document.addEventListener('keydown', onKeydown, true);
  document.addEventListener('mousedown', ()=>{ _last=null; }, true);
  document.addEventListener('DOMContentLoaded', syncBtn);
  syncBtn();
  return { toggle, enabled, syncBtn, RULES, WORDS };
})();


/* ════════════════════════════════════════════════════════════════════════
   MEALY-AUTOMAT  (Transduktor: Übergänge „Eingabe/Ausgabe", z. B. a/1)
   Nutzt dieselbe Zeichenfläche wie der endliche Automat (type:'mealy').
   Kein Endzustand; die Simulation liefert das Ausgabewort.
   ════════════════════════════════════════════════════════════════════════ */
function _mealyParse(label){
  return (label||'').split(',').map(s=>s.trim()).filter(s=>s.length>0).map(tok=>{
    const i=tok.indexOf('/');
    if(i<0) return {inp:tok, out:'', missing:true};
    let out=tok.slice(i+1).trim();
    if(_autoIsEps(out)) out='';
    return {inp:tok.slice(0,i).trim(), out};
  });
}
function _mealyNormalize(label){
  return _mealyParse(label).map(r=>r.inp+'/'+(r.out===''?'ε':r.out)).join(', ');
}
function _mealyTokens(a, input){
  if(/\s/.test(input.trim())) return input.trim().split(/\s+/);
  const syms=new Set(); a.transitions.forEach(t=>_mealyParse(t.label).forEach(r=>syms.add(r.inp)));
  const list=[...syms].filter(Boolean).sort((x,y)=>y.length-x.length), out=[]; let i=0;
  while(i<input.length){ const m=list.find(s=>input.startsWith(s,i)), s=m||input[i]; out.push(s); i+=s.length; }
  return out;
}
function _mealySimulate(automaton, input){
  const start=(automaton.states||[]).find(s=>s.start);
  if(!start) return {ok:false, error:'Kein Startzustand festgelegt.'};
  let cur=start.id, output='', stuck=false, stuckChar=null, conflict=null;
  const trace=[{char:null, states:new Set([cur]), out:''}];
  for(const ch of _mealyTokens(automaton,input)){
    const cands=[];
    for(const t of automaton.transitions){
      if(t.from!==cur) continue;
      for(const r of _mealyParse(t.label)) if(r.inp===ch) cands.push({to:t.to, out:r.out});
    }
    if(!cands.length){ stuck=true; stuckChar=ch; trace.push({char:ch, states:new Set([cur]), out:'', stuckHere:true}); break; }
    if(cands.length>1 && !conflict) conflict={state:cur, char:ch};
    cur=cands[0].to; output+=cands[0].out;
    trace.push({char:ch, states:new Set([cur]), out:cands[0].out});
  }
  return {ok:true, trace, output, stuck, stuckChar, conflict};
}
function _mealyTapeHTML(sim, step, automaton){
  const {trace, input, conflict}=sim;
  const nm=id=>{ const st=automaton.states.find(s=>s.id===id); return st?st.label:id; };
  const chars=[...input];
  let inRow='', outRow='';
  chars.forEach((ch,i)=>{
    inRow+=`<span class="auto-tape-ch ${i<step?'done':(i===step?'current':'')}">${esc(ch)}</span>`;
    const e=trace[i+1];
    if(i<step && e && !e.stuckHere) outRow+=`<span class="auto-tape-ch out">${e.out===''?'ε':esc(e.out)}</span>`;
    else outRow+='<span class="auto-tape-ch ghost"></span>';
  });
  if(!chars.length) inRow='<span class="auto-tape-empty">(leeres Wort ε)</span>';
  const cur=trace[step];
  const produced=trace.slice(1,step+1).filter(e=>!e.stuckHere).map(e=>e.out).join('');
  const curName=nm([...cur.states][0]);
  let status;
  if(cur.stuckHere) status=`<span class="el-auto-statustext err">Kein Übergang für „${esc(cur.char)}" in ${esc(curName)} — der Automat ist unvollständig.</span>`;
  else if(step>=trace.length-1) status=`<span class="el-auto-statustext ok">Ausgabe: ${produced===''?'ε (leeres Wort)':esc(produced)}</span>`;
  else status=`<span class="el-auto-statustext">Zustand ${esc(curName)} · Ausgabe bisher: ${produced===''?'…':esc(produced)}</span>`;
  if(conflict && step>=trace.length-1) status+=`<span class="el-auto-statustext warn">⚠ nicht deterministisch: ${esc(nm(conflict.state))} hat mehrere Übergänge für „${esc(conflict.char)}" (der erste wurde genommen)</span>`;
  return `<div class="auto-tape-line"><span class="auto-tape-lbl">Ein</span><div class="el-auto-tape">${inRow}</div></div>`+
         `<div class="auto-tape-line"><span class="auto-tape-lbl">Aus</span><div class="el-auto-tape">${outRow}</div></div>`+status;
}

/* ════════════════════════════════════════════════════════════════════════
   JSON-IMPORT / -EXPORT für Automaten (endlicher Automat & Mealy)
   • Export: Download oder Ablage im Dateien-Bereich (Supabase-Bucket)
   • Import: lokale Datei, Dateien-Bereich oder Drag&Drop einer .json-Datei auf die Folie
   Eigenes Format (siehe _autoExportObject); zusätzlich werden gängige Formal-Schreibweisen
   verstanden (states/start/accept + transitions als Liste oder Tabelle) – fehlende
   Koordinaten werden automatisch angeordnet.
   ════════════════════════════════════════════════════════════════════════ */
const AUTO_JSON_FORMAT='forschungstagebuch-automat';
function _isAutoEl(el){ return !!el && (el.type==='automaton'||el.type==='mealy'); }

function _autoExportObject(el){
  const a=el.automaton||{states:[],transitions:[],test:''}, mealy=el.type==='mealy';
  return {
    format:AUTO_JSON_FORMAT, version:1, type:mealy?'mealy':'automaton',
    states:(a.states||[]).map(s=>Object.assign({id:s.id,label:s.label,x:s.x,y:s.y,start:!!s.start}, mealy?{}:{accept:!!s.accept})),
    transitions:(a.transitions||[]).map(t=>({from:t.from,to:t.to,label:t.label})),
    test:a.test||''
  };
}
function _autoLayoutPositions(n, startIdx){
  if(n<=0) return [];
  if(n===1) return [{x:110,y:150}];
  if(n===2) return [{x:150,y:150},{x:450,y:150}];
  const cx=AUTO_VB_W/2, cy=AUTO_VB_H/2+4, rx=AUTO_VB_W/2-85, ry=AUTO_VB_H/2-58, pos=[];
  for(let k=0;k<n;k++){
    const i=(k-startIdx+n)%n, ang=Math.PI+i*2*Math.PI/n;       // Startzustand links, dann im Uhrzeigersinn
    pos[k]={x:Math.round(cx+rx*Math.cos(ang)), y:Math.round(cy+ry*Math.sin(ang))};
  }
  return pos;
}
/* Format des Automaten-Simulators: {type:"MEALY"|"DEA", automaton:{States:[{ID,Name,x,y,Final,Start,Transitions:[{Source,Target,Labels}]}]}}
   Labels: DEA = ["a","b"] · Mealy = [["Eingabe","Ausgabe"]] ("-" = keine Ausgabe) */
function _autoFromSimulator(obj){
  const A=obj.automaton, states=[], transitions=[];
  A.States.forEach(s=>{
    states.push({id:s.ID, label:s.Name, x:s.x, y:s.y, start:!!s.Start, accept:!!s.Final});
    (s.Transitions||[]).forEach(t=>(t.Labels||[]).forEach(l=>{
      if(Array.isArray(l)) transitions.push({from:t.Source, to:t.Target, symbol:l[0], output:(l[1]==null||l[1]==='-')?'':l[1]});
      else transitions.push({from:t.Source, to:t.Target, symbol:l});
    }));
  });
  const sim=Array.isArray(A.simulationInput)?A.simulationInput.map(String):[];
  return {type:obj.type, states, transitions, test:sim.join(sim.every(x=>x.length===1)?'':' ')};
}
function _autoParseJSON(text){
  let obj;
  try{ obj=JSON.parse(text); }catch(e){ return {ok:false, error:'Keine gültige JSON-Datei ('+e.message+').'}; }
  if(!obj||typeof obj!=='object'||Array.isArray(obj)) return {ok:false, error:'Die Datei enthält keinen Automaten (JSON-Objekt erwartet).'};
  const warn=[];
  let src=obj;
  if(obj.automaton && Array.isArray(obj.automaton.States)) src=_autoFromSimulator(obj);
  if(!src.states && src.automaton && typeof src.automaton==='object') src=Object.assign({}, src.automaton, {type:obj.type||obj.kind||src.automaton.type});
  let rawStates=src.states||src.Q||src.zustaende||src['zustände'];
  if(rawStates && !Array.isArray(rawStates) && typeof rawStates==='object')
    rawStates=Object.keys(rawStates).map(k=>Object.assign({id:k}, (rawStates[k]&&typeof rawStates[k]==='object')?rawStates[k]:{}));
  if(!Array.isArray(rawStates)||!rawStates.length) return {ok:false, error:'Keine Zustände gefunden (Feld „states" fehlt oder ist leer).'};
  if(rawStates.length>60) return {ok:false, error:'Zu viele Zustände (maximal 60).'};
  const typeStr=String(src.type||src.kind||'').toLowerCase();
  const mealyHint=/mealy/.test(typeStr)||!!(src.outputAlphabet||src.output_alphabet||src.outputs||src.gamma||src.Gamma);

  // Zustände
  const num=v=>(typeof v==='number'&&isFinite(v))?v:((typeof v==='string'&&v.trim()!==''&&isFinite(+v))?+v:null);
  const states=rawStates.map((r,i)=>{
    const o=(r&&typeof r==='object')?r:{id:r};
    const key=String(o.id!==undefined?o.id:(o.name!==undefined?o.name:(o.label!==undefined?o.label:'q'+i)));
    return {key, label:String(o.label!==undefined?o.label:(o.name!==undefined?o.name:key)), x:num(o.x), y:num(o.y),
            start:!!(o.start||o.initial||o.isStart||o.isInitial), accept:!!(o.accept||o.accepting||o.final||o.isFinal||o.isAccepting)};
  });
  const ref=new Map();
  states.forEach((s,i)=>{ ref.set(s.key,i); if(!ref.has(s.label)) ref.set(s.label,i); });
  const startRef=src.start??src.initial??src.startState??src.initialState??src.q0??src.startzustand;
  if((typeof startRef==='string'||typeof startRef==='number') && !states.some(s=>s.start)){
    const i=ref.get(String(startRef)); if(i!==undefined) states[i].start=true; else warn.push('Startzustand „'+startRef+'" nicht gefunden.');
  }
  const accRef=src.accept??src.accepting??src.final??src.finalStates??src.acceptStates??src.acceptingStates??src.F??src.endzustaende??src['endzustände']??src.akzeptierend;
  (Array.isArray(accRef)?accRef:((typeof accRef==='string'||typeof accRef==='number')?[accRef]:[])).forEach(a=>{
    const i=ref.get(String(a)); if(i!==undefined) states[i].accept=true; else warn.push('Endzustand „'+a+'" nicht gefunden.');
  });

  // Übergänge (Liste ODER Tabelle {von:{symbol:ziel}})
  const inter=[];
  const rawTrans=src.transitions||src.delta||src.uebergaenge||src['übergänge']||[];
  const symOf=o=>o.symbols??o.symbol??o.input??o.read??o.char??o.label??o.on??o.sym;
  if(Array.isArray(rawTrans)){
    for(const t of rawTrans){
      if(Array.isArray(t)){
        if(t.length===3) inter.push({from:t[0],to:t[2],sym:t[1]});
        else if(t.length>=4) inter.push({from:t[0],to:t[3],sym:t[1],out:t[2]});
      } else if(t&&typeof t==='object'){
        inter.push({from:t.from??t.source??t.src??t.q, to:t.to??t.target??t.dst??t.next, sym:symOf(t), out:t.output??t.out??t.write});
      }
    }
  } else if(rawTrans&&typeof rawTrans==='object'){
    for(const from of Object.keys(rawTrans)){
      const row=rawTrans[from]; if(!row||typeof row!=='object') continue;
      for(const sym of Object.keys(row)){
        const v=row[sym];
        if(mealyHint){
          if(Array.isArray(v)) inter.push({from,to:v[0],sym,out:v[1]});
          else if(v&&typeof v==='object') inter.push({from,to:v.to??v.target??v.next,sym,out:v.output??v.out});
          else inter.push({from,to:v,sym});
        } else (Array.isArray(v)?v:[v]).forEach(to=>inter.push({from,to,sym}));
      }
    }
  }
  const isMealy=mealyHint||inter.some(t=>t.out!==undefined);
  const symText=v=>{
    if(v===undefined||v===null||v==='') return 'ε';
    if(Array.isArray(v)) return v.map(symText).join(', ');
    return String(v);
  };
  const outText=v=>(v===undefined||v===null||v==='')?'ε':String(v);
  const byPair=new Map(); const transitions=[];
  for(const t of inter){
    const fi=ref.get(String(t.from)), ti=ref.get(String(t.to));
    if(fi===undefined||ti===undefined){ warn.push('Übergang „'+t.from+' → '+t.to+'" verweist auf einen unbekannten Zustand und wurde übersprungen.'); continue; }
    const label=(isMealy&&t.out!==undefined)?String(symText(t.sym))+'/'+outText(t.out):symText(t.sym);
    const k=fi+'>'+ti;
    if(byPair.has(k)){
      const e=byPair.get(k); const have=e.label.split(',').map(s=>s.trim());
      label.split(',').map(s=>s.trim()).forEach(tok=>{ if(!have.includes(tok)){ have.push(tok); } });
      e.label=have.join(', ');
    } else { const e={from:fi,to:ti,label}; byPair.set(k,e); transitions.push(e); }
  }

  // Start & Positionen
  if(!states.some(s=>s.start)){ states[0].start=true; warn.push('Kein Startzustand angegeben – der erste Zustand wurde als Startzustand gesetzt.'); }
  else if(states.filter(s=>s.start).length>1){ let f=false; states.forEach(s=>{ if(s.start){ if(f){ s.start=false; } f=true; } }); warn.push('Mehrere Startzustände – nur der erste wurde übernommen.'); }
  const startIdx=Math.max(0,states.findIndex(s=>s.start));
  const hasPos=states.every(s=>s.x!==null&&s.y!==null);
  const auto=hasPos?null:_autoLayoutPositions(states.length,startIdx);
  const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
  const idOf=states.map(()=>uid());
  // Koordinaten außerhalb der Zeichenfläche (z. B. 900×670) werden proportional eingepasst statt abgeschnitten
  const fit=(v,hi)=>{ const mn=Math.min(...v), mx=Math.max(...v); return ((mn<AUTO_R||mx>hi)&&mx>mn) ? v.map(a=>AUTO_R+14+(a-mn)*(hi-AUTO_R-28)/(mx-mn)) : v.map(a=>clamp(a,AUTO_R,hi)); };
  const fx=hasPos?fit(states.map(s=>s.x),AUTO_VB_W-AUTO_R):null, fy=hasPos?fit(states.map(s=>s.y),AUTO_VB_H-AUTO_R):null;
  const outStates=states.map((s,i)=>({
    id:idOf[i], label:s.label,
    x:Math.round(hasPos?fx[i]:auto[i].x),
    y:Math.round(hasPos?fy[i]:auto[i].y),
    start:s.start, accept:isMealy?false:s.accept
  }));
  const outTrans=transitions.map(t=>({id:uid(), from:idOf[t.from], to:idOf[t.to], label:isMealy?_mealyNormalize(t.label):_autoLabelDisplay(t.label)}));
  return {ok:true, kind:isMealy?'mealy':'automaton', automaton:{states:outStates, transitions:outTrans, test:String(src.test||'')}, warnings:warn};
}

function _downloadText(filename, text, mime){
  const blob=new Blob([text],{type:mime||'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click();
  setTimeout(()=>{ a.remove(); URL.revokeObjectURL(url); }, 250);
}
function _readFileText(f){
  return f.text ? f.text() : new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(String(r.result)); r.onerror=rej; r.readAsText(f); });
}
function _autoDefaultName(el){ return (el&&el.type==='mealy'?'mealy-automat':'automat')+'.json'; }

function autoExportJSON(elId){
  const el=getEl(elId||selElId);
  if(!_isAutoEl(el)){ _ftToast('Bitte zuerst einen Automaten auswählen.','err'); return; }
  _downloadText(_autoDefaultName(el), JSON.stringify(_autoExportObject(el),null,2), 'application/json');
  _ftToast('Automat als '+_autoDefaultName(el)+' exportiert','ok');
}
/* Importiert JSON-Text: in ein bestehendes Automaten-Element (ctx.targetId) oder als neues Element. Liefert true/false. */
function autoImportText(text, ctx){
  ctx=ctx||{};
  const p=_autoParseJSON(text);
  if(!p.ok){ _ftToast(p.error,'err'); return false; }
  const tgt=ctx.targetId?getEl(ctx.targetId):null;
  if(_isAutoEl(tgt)){
    pushHistory('Automat importiert');
    tgt.type=p.kind; tgt.automaton=p.automaton;
    renderSlide(); selectEl(tgt.id);
  } else {
    addEl(p.kind);
    const el=getEl(selElId); if(!el) return false;
    el.automaton=p.automaton;
    if(typeof ctx.x==='number') el.x=Math.max(0,Math.round(ctx.x));
    if(typeof ctx.y==='number') el.y=Math.max(0,Math.round(ctx.y));
    renderSlide(); selectEl(el.id);
  }
  const n=p.automaton.states.length, m=p.automaton.transitions.length;
  _ftToast((p.kind==='mealy'?'Mealy-Automat':'Automat')+' importiert ('+n+' Zustände, '+m+' Übergänge)'+(p.warnings.length?' – Hinweis: '+p.warnings[0]:''), p.warnings.length?'':'ok');
  return true;
}
function autoPickLocalJSON(){ const i=document.getElementById('autoJsonInput'); if(i) i.click(); }
async function autoLocalJSONChosen(input){
  const f=input&&input.files&&input.files[0]; if(!f) return;
  try{
    const text=await _readFileText(f);
    const sel=selElId?getEl(selElId):null;
    autoImportText(text,{targetId:_isAutoEl(sel)?sel.id:null});
  }catch(e){ _ftToast('Datei konnte nicht gelesen werden.','err'); }
  input.value='';
}
/* Drag&Drop einer .json-Datei auf die Folie: auf einen Automaten = ersetzen, sonst = neues Element an der Drop-Position */
async function autoHandleDroppedJSON(file, ev){
  try{
    const text=await _readFileText(file);
    const under=document.elementFromPoint(ev.clientX, ev.clientY);
    const dom=under&&under.closest?under.closest('.sel'):null;
    const tel=dom&&dom.dataset?getEl(dom.dataset.elid):null;
    const rect=document.getElementById('slideCV').getBoundingClientRect();
    autoImportText(text,{targetId:_isAutoEl(tel)?tel.id:null, x:(ev.clientX-rect.left)/cvScale, y:(ev.clientY-rect.top)/cvScale});
  }catch(e){ _ftToast('Datei konnte nicht gelesen werden.','err'); }
}

/* ── Anbindung an den Dateien-Bereich (Supabase-Storage-Bucket) ── */
var _autoFilesMode='save';
function _autoFilesStatus(msg, cls){ const s=document.getElementById('jsonFilesStatus'); if(s){ s.className='json-status'+(cls?' '+cls:''); s.textContent=msg||''; } }
function autoOpenFilesModal(mode){
  const el=selElId?getEl(selElId):null, isAuto=_isAutoEl(el);
  if(mode==='save'&&!isAuto){ _ftToast('Bitte zuerst einen Automaten auswählen.','err'); return; }
  const m=document.getElementById('jsonFilesModal'); if(!m) return;
  _autoFilesMode=mode; _autoFilesStatus('');
  document.getElementById('jsonFilesSave').style.display=mode==='save'?'block':'none';
  document.getElementById('jsonFilesLoad').style.display=mode==='load'?'block':'none';
  document.getElementById('jsonFilesTitle').textContent=mode==='save'?'Automat in Dateien speichern':'Automat aus Dateien laden';
  document.getElementById('jsonFilesHint').textContent=mode==='save'
    ? 'Der Automat wird als JSON-Datei im Dateien-Bereich abgelegt (gleicher Name überschreibt die Datei).'
    : (isAuto?'Die gewählte JSON-Datei ersetzt den ausgewählten Automaten (rückgängig machbar).':'Die gewählte JSON-Datei wird als neuer Automat in die Folie eingefügt.');
  if(mode==='save'){
    document.getElementById('jsonFilesName').value=_autoDefaultName(el);
    let f='Automaten'; try{ f=localStorage.getItem('ft_json_folder')??'Automaten'; }catch(e){}
    document.getElementById('jsonFilesFolder').value=f;
  }
  m.style.display='flex';
  if(mode==='load') _autoFillFilesList();
}
function autoCloseFilesModal(){ const m=document.getElementById('jsonFilesModal'); if(m) m.style.display='none'; }
async function _autoFillFilesList(){
  const list=document.getElementById('jsonFilesList'); if(!list) return;
  list.innerHTML='<div class="dict-empty">Lade Dateiliste …</div>';
  try{
    const all=await listAllFilesRecursive();
    const js=all.filter(p=>/\.json$/i.test(p)).sort((a,b)=>a.localeCompare(b,'de'));
    if(!js.length){ list.innerHTML='<div class="dict-empty">Keine JSON-Dateien im Dateien-Bereich gefunden.</div>'; return; }
    list.innerHTML='';
    js.forEach(p=>{
      const i=p.lastIndexOf('/'), name=i<0?p:p.slice(i+1), dir=i<0?'':p.slice(0,i);
      const b=document.createElement('button'); b.type='button'; b.className='json-file-row';
      b.innerHTML=`<span class="json-file-name">${esc(name)}</span><span class="json-file-dir">${esc(dir)}</span>`;
      b.onclick=()=>autoLoadFromFiles(p);
      list.appendChild(b);
    });
  }catch(e){ list.innerHTML='<div class="dict-empty">Die Dateiliste konnte nicht geladen werden.</div>'; }
}
async function autoLoadFromFiles(path){
  _autoFilesStatus('Lade '+path+' …');
  try{
    const {data,error}=await _sb.storage.from(FILES_BUCKET).download(path);
    if(error||!data) throw new Error((error&&error.message)||'Download fehlgeschlagen');
    const text=await _readFileText(data);
    const sel=selElId?getEl(selElId):null;
    if(autoImportText(text,{targetId:_isAutoEl(sel)?sel.id:null})) autoCloseFilesModal();
    else _autoFilesStatus('Die Datei enthält keinen gültigen Automaten.','err');
  }catch(e){ _autoFilesStatus('Fehler: '+(e.message||e),'err'); }
}
async function autoSaveToFiles(){
  const el=selElId?getEl(selElId):null;
  if(!_isAutoEl(el)){ _autoFilesStatus('Bitte zuerst einen Automaten auswählen.','err'); return; }
  let name=(document.getElementById('jsonFilesName').value||'').trim()||_autoDefaultName(el);
  if(!/\.json$/i.test(name)) name+='.json';
  const folder=(document.getElementById('jsonFilesFolder').value||'').trim().replace(/^\/+|\/+$/g,'');
  const path=sanitizeStorageKey(folder?folder+'/'+name:name);
  const blob=new Blob([JSON.stringify(_autoExportObject(el),null,2)],{type:'application/json'});
  _autoFilesStatus('Speichere …');
  try{
    const {error}=await _sb.storage.from(FILES_BUCKET).upload(path,blob,{upsert:true,contentType:'application/json'});
    if(error) throw error;
    try{ localStorage.setItem('ft_json_folder',folder); }catch(e){}
    try{ if(typeof loadFiles==='function'){ const r=loadFiles(); if(r&&r.catch) r.catch(()=>{}); } }catch(e){}
    _ftToast('In Dateien gespeichert: '+path,'ok');
    autoCloseFilesModal();
  }catch(e){ _autoFilesStatus('Fehler beim Speichern: '+(e.message||e),'err'); }
}


/* ════════════════════════════════════════════════════════════════════════
   SYNTAXDIAGRAMM  (Q3: Formale Sprachen & Grammatiken)
   Quelltext (EBNF-artig)  →  Parser  →  AST  →  Layout  →  SVG  (+ Wortprüfung)

     Zahl    = [ '-' ] Ziffer { Ziffer } ;        Terminal   'x' oder "x"   (Oval)
     Ziffer  = '0' | '1' | '2' ;                  Nichtterminal  Name        (Rechteck)
                                                  Alternative  |     Option  [ … ]  oder  …?
     Gruppe ( … )   Wiederholung { … } oder …*    mind. einmal  …+   leer: ε
   ════════════════════════════════════════════════════════════════════════ */
const SYN_DEFAULT_SRC="Zahl = [ '-' ] Ziffer { Ziffer } ;\nZiffer = '0' | '1' | '2' | '3' ;";
const SYN_ST={ FS:14, TH:30, TP:11, AR:10, VS:11, GAP:20, PAD:18, TITLE_H:34, RULE_GAP:20,
  C_LINE:'#8c8678', C_TERM:'#e8a030', C_TERM_F:'rgba(232,160,48,.13)', C_TERM_T:'#f5c060',
  C_NT:'#5b9bf5', C_NT_F:'rgba(91,155,245,.12)', C_NT_T:'#b3d0ff', C_TITLE:'#f5c060',
  FONT:"'JetBrains Mono',monospace" };

function _synTW(text, st){ return [...text].length*st.FS*0.62; }

/* ── Tokenizer ── */
function _synTokenize(src){
  const toks=[], errs=[]; let i=0; const n=src.length;
  const idStart=/[\p{L}_]/u, idPart=/[\p{L}\p{N}_]/u;
  while(i<n){
    const c=src[i];
    if(/\s/.test(c)){ i++; continue; }
    if(c==='/'&&src[i+1]==='/'){ while(i<n&&src[i]!=='\n') i++; continue; }
    if(c==='#'){ while(i<n&&src[i]!=='\n') i++; continue; }
    if(c==='('&&src[i+1]==='*'){ const j=src.indexOf('*)',i+2); i=j<0?n:j+2; continue; }
    if("'\"`„“«".includes(c)){
      const close=c==='„'?'“':(c==='“'?'”':(c==='«'?'»':c));
      let j=i+1, out='';
      while(j<n&&src[j]!==close&&src[j]!=='\n'){ if(src[j]==='\\'&&j+1<n){ out+=src[j+1]; j+=2; } else { out+=src[j]; j++; } }
      if(src[j]!==close){ errs.push({pos:i,msg:'Anführungszeichen nicht geschlossen'}); toks.push({t:'str',v:out,s:i,e:j}); i=j; }
      else { toks.push({t:'str',v:out,s:i,e:j+1}); i=j+1; }
      continue;
    }
    if(c==='<'){ const m=/^<([\p{L}_][\p{L}\p{N}_ -]*)>/u.exec(src.slice(i)); if(m){ toks.push({t:'id',v:m[1].trim(),s:i,e:i+m[0].length}); i+=m[0].length; continue; } }
    if(src.startsWith('::=',i)){ toks.push({t:'def',v:'::=',s:i,e:i+3}); i+=3; continue; }
    if(src.startsWith(':=',i)){ toks.push({t:'def',v:':=',s:i,e:i+2}); i+=2; continue; }
    if(src.startsWith('->',i)){ toks.push({t:'def',v:'->',s:i,e:i+2}); i+=2; continue; }
    if(c==='='||c===':'||c==='→'){ toks.push({t:'def',v:c,s:i,e:i+1}); i++; continue; }
    if('|()[]{};.*+?,'.includes(c)){ toks.push({t:'op',v:c,s:i,e:i+1}); i++; continue; }
    if(idStart.test(c)){
      let j=i+1;
      while(j<n&&(idPart.test(src[j])||(src[j]==='-'&&j+1<n&&idPart.test(src[j+1])))) j++;
      toks.push({t:'id',v:src.slice(i,j),s:i,e:j}); i=j; continue;
    }
    errs.push({pos:i,msg:'Unbekanntes Zeichen „'+c+'"'}); i++;
  }
  toks.push({t:'eof',s:n,e:n});
  return {toks, errs};
}

/* ── AST vereinfachen ── */
function _synSimplify(a){
  switch(a.t){
    case 'seq': {
      const items=[]; a.items.map(_synSimplify).forEach(x=>{ if(x.t==='empty') return; if(x.t==='seq') items.push(...x.items); else items.push(x); });
      return items.length===0?{t:'empty'}:(items.length===1?items[0]:{t:'seq',items});
    }
    case 'choice': {
      let alts=[]; a.alts.map(_synSimplify).forEach(x=>{ if(x.t==='choice') alts.push(...x.alts); else alts.push(x); });
      const hasEmpty=alts.some(x=>x.t==='empty'); alts=alts.filter(x=>x.t!=='empty');
      if(!alts.length) return {t:'empty'};
      const core=alts.length===1?alts[0]:{t:'choice',alts};
      return hasEmpty?_synSimplify({t:'opt',item:core}):core;
    }
    case 'opt': { const x=_synSimplify(a.item);
      if(x.t==='empty') return x; if(x.t==='opt'||x.t==='star') return x; if(x.t==='plus') return {t:'star',item:x.item};
      return {t:'opt',item:x}; }
    case 'star': { const x=_synSimplify(a.item);
      if(x.t==='empty') return x; if(x.t==='opt'||x.t==='star'||x.t==='plus') return {t:'star',item:x.item};
      return {t:'star',item:x}; }
    case 'plus': { const x=_synSimplify(a.item);
      if(x.t==='empty') return x; if(x.t==='opt'||x.t==='star') return {t:'star',item:x.item}; if(x.t==='plus') return x;
      return {t:'plus',item:x}; }
    default: return a;
  }
}

/* ── Parser: liefert {rules:[{name,ast,s}], errors:[{pos,msg}]} (Fehler pro Regel, der Rest wird trotzdem gezeichnet) ── */
function _synParse(src){
  const {toks,errs}=_synTokenize(src||'');
  const errors=errs.map(e=>({pos:e.pos,msg:e.msg})), rules=[];
  let p=0;
  const peek=(o=0)=>toks[Math.min(p+o,toks.length-1)];
  const isRuleStart=()=>peek().t==='id'&&peek(1).t==='def';
  const isEnd=k=>k.t==='op'&&(k.v===';'||k.v==='.');
  function parseAlts(){
    const alts=[parseSeq()];
    while(peek().t==='op'&&peek().v==='|'){ p++; alts.push(parseSeq()); }
    return alts.length===1?alts[0]:{t:'choice',alts};
  }
  function parseSeq(){
    const items=[];
    for(;;){
      const k=peek();
      if(k.t==='eof'||isEnd(k)) break;
      if(k.t==='op'&&(k.v==='|'||k.v===')'||k.v===']'||k.v==='}')) break;
      if(k.t==='def') throw {pos:k.s,msg:'Unerwartetes „'+k.v+'" – fehlt ein „;" vor der nächsten Regel?'};
      if(isRuleStart()) break;
      if(k.t==='op'&&k.v===','){ p++; continue; }
      items.push(parseFactor());
    }
    return items.length===0?{t:'empty'}:(items.length===1?items[0]:{t:'seq',items});
  }
  function parseFactor(){
    let a=parseAtom();
    for(;;){
      const k=peek();
      if(k.t==='op'&&k.v==='*'){ p++; a={t:'star',item:a}; }
      else if(k.t==='op'&&k.v==='+'){ p++; a={t:'plus',item:a}; }
      else if(k.t==='op'&&k.v==='?'){ p++; a={t:'opt',item:a}; }
      else break;
    }
    return a;
  }
  function parseAtom(){
    const k=peek();
    if(k.t==='str'){ p++; return k.v===''?{t:'empty'}:{t:'term',text:k.v,s:k.s,e:k.e}; }
    if(k.t==='id'){ p++; return /^(ε|eps|epsilon)$/i.test(k.v)?{t:'empty'}:{t:'nt',name:k.v,s:k.s,e:k.e}; }
    if(k.t==='op'&&(k.v==='('||k.v==='['||k.v==='{')){
      const close={'(':')','[':']','{':'}'}[k.v]; p++;
      const inner=parseAlts(); const c=peek();
      if(!(c.t==='op'&&c.v===close)) throw {pos:c.s,msg:'Schließende Klammer „'+close+'" fehlt'};
      p++;
      return k.v==='['?{t:'opt',item:inner}:(k.v==='{'?{t:'star',item:inner}:inner);
    }
    throw {pos:k.s,msg:'Unerwartetes Zeichen „'+(k.v||k.t)+'"'};
  }
  function skip(){
    while(peek().t!=='eof'){
      if(isEnd(peek())){ p++; return; }
      if(isRuleStart()) return;
      p++;
    }
  }
  while(peek().t!=='eof'){
    const startP=p, k=peek();
    if(isEnd(k)){ p++; continue; }
    if(!isRuleStart()){ errors.push({pos:k.s,msg:'Regelname mit „=" erwartet, z. B.  Zahl = Ziffer { Ziffer } ;'}); p++; skip(); continue; }
    p+=2;
    try{
      const body=parseAlts();
      if(isEnd(peek())) p++;
      else if(peek().t!=='eof'&&!isRuleStart()) throw {pos:peek().s,msg:'Unerwartetes Zeichen „'+(peek().v||peek().t)+'"'};
      rules.push({name:k.v, ast:_synSimplify(body), s:k.s});
    }catch(err){
      if(err&&err.msg){ errors.push({pos:err.pos,msg:err.msg}); skip(); } else throw err;
    }
    if(p===startP) p++;
  }
  return {rules, errors};
}
function _synLineCol(src,pos){ const pre=src.slice(0,pos); const line=pre.split('\n').length; return {line, col:pos-pre.lastIndexOf('\n')}; }

/* ── Layout: jeder Knoten {w, up, down, draw(x,y)}; y = Grundlinie, x = linke Kante ── */
function _synBuild(ast, st){
  const {AR,VS,GAP,TH}=st;
  const sw=1.8;
  const hl=(x1,x2,y)=>x2>x1?`<path d="M${+x1.toFixed(2)} ${+y.toFixed(2)}H${+x2.toFixed(2)}" class="syn-l"/>`:'';
  const arrow=(tx,ty,ang)=>_arrowHead('filled',tx,ty,ang,8,st.C_LINE,sw);
  const earL=(x,y,dy)=>{ const s=Math.sign(dy), L=Math.abs(dy)-2*AR;
    return `<path class="syn-l" d="M${x} ${y}a${AR} ${AR} 0 0 ${s>0?1:0} ${AR} ${s*AR}v${s*L}a${AR} ${AR} 0 0 ${s>0?0:1} ${AR} ${s*AR}"/>`; };
  const earR=(x,ay,dy)=>{ const s=Math.sign(dy), L=Math.abs(dy)-2*AR;
    return `<path class="syn-l" d="M${x} ${ay}a${AR} ${AR} 0 0 ${s>0?0:1} ${AR} ${-s*AR}v${-s*L}a${AR} ${AR} 0 0 ${s>0?1:0} ${AR} ${-s*AR}"/>`; };
  const empty={w:0,up:0,down:0,draw:()=>''};

  function box(text,term,s,e){
    const w=Math.max(term?26:34, _synTW(text,st)+2*st.TP);
    return {w,up:TH/2,down:TH/2,draw(x,y){
      const top=y-TH/2, rx=term?TH/2:3;
      const stroke=term?st.C_TERM:st.C_NT, fill=term?st.C_TERM_F:st.C_NT_F, tc=term?st.C_TERM_T:st.C_NT_T;
      return `<g class="syn-n" data-s="${s}" data-e="${e}" data-t="${term?1:0}"><rect x="${+x.toFixed(2)}" y="${+top.toFixed(2)}" width="${+w.toFixed(2)}" height="${TH}" rx="${rx}" ry="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`+
             `<text x="${+(x+w/2).toFixed(2)}" y="${+y.toFixed(2)}" dy=".35em" text-anchor="middle" font-family="${st.FONT}" font-size="${st.FS}" fill="${tc}">${esc(text)}</text></g>`;
    }};
  }
  function seq(items){
    const ch=items.map(build);
    const w=ch.reduce((a,c)=>a+c.w,0)+GAP*(ch.length-1);
    return {w,up:Math.max(...ch.map(c=>c.up)),down:Math.max(...ch.map(c=>c.down)),draw(x,y){
      let out='', cx=x;
      ch.forEach((c,i)=>{
        out+=c.draw(cx,y); cx+=c.w;
        if(i<ch.length-1){ out+=hl(cx,cx+GAP-1,y)+arrow(cx+GAP,y,0); cx+=GAP; }
      });
      return out;
    }};
  }
  function choice(alts,normal){
    const inner=Math.max(...alts.map(a=>a.w)), w=inner+4*AR, ys=new Array(alts.length).fill(0);
    for(let i=normal+1;i<alts.length;i++) ys[i]=ys[i-1]+Math.max(2*AR,alts[i-1].down+VS+alts[i].up);
    for(let i=normal-1;i>=0;i--) ys[i]=ys[i+1]-Math.max(2*AR,alts[i].down+VS+alts[i+1].up);
    const up=Math.max(...alts.map((a,i)=>a.up-ys[i])), down=Math.max(...alts.map((a,i)=>a.down+ys[i]));
    return {w,up,down,draw(x,y){
      let out='';
      alts.forEach((a,i)=>{
        const ay=y+ys[i], pad=(inner-a.w)/2, ax=x+2*AR+pad;
        if(ys[i]===0){ out+=hl(x,ax,y)+a.draw(ax,ay)+hl(ax+a.w,x+w,y); }
        else { out+=earL(x,y,ys[i])+hl(x+2*AR,ax,ay)+a.draw(ax,ay)+hl(ax+a.w,x+w-2*AR,ay)+earR(x+w-2*AR,ay,ys[i]); }
      });
      return out;
    }};
  }
  function loop(item){
    const inner=item.w, w=inner+2*AR, d=Math.max(2*AR,item.down+VS);
    return {w,up:item.up,down:d,draw(x,y){
      const R=x+AR+inner, L=x+AR, Y=y+d;
      let out=hl(x,x+AR,y)+item.draw(x+AR,y)+hl(R,x+w,y);
      out+=`<path class="syn-l" d="M${R} ${y}a${AR} ${AR} 0 0 1 ${AR} ${AR}v${d-2*AR}a${AR} ${AR} 0 0 1 ${-AR} ${AR}H${L}a${AR} ${AR} 0 0 1 ${-AR} ${-AR}v${-(d-2*AR)}a${AR} ${AR} 0 0 1 ${AR} ${-AR}"/>`;
      out+=arrow(x+w/2-3,Y,Math.PI);
      return out;
    }};
  }
  function build(a){
    switch(a.t){
      case 'empty': return empty;
      case 'term': return box(a.text,true,a.s,a.e);
      case 'nt':   return box(a.name,false,a.s,a.e);
      case 'seq':  return seq(a.items);
      case 'choice': return choice(a.alts.map(build),0);
      case 'opt':  return choice([empty,build(a.item)],1);
      case 'plus': return loop(build(a.item));
      case 'star': return choice([empty,loop(build(a.item))],1);
    }
    return empty;
  }
  return build(ast);
}

/* ── ein Regel-Diagramm: Titel, Startpunkt, Diagramm, Endpfeil; liefert {svg,w,h} ── */
function _synRuleSVG(rule, st, y0){
  const node=_synBuild(rule.ast, st), {PAD,GAP,TITLE_H}=st;
  const startW=10, endW=22;
  const y=y0+TITLE_H+node.up, nx=PAD+startW+GAP;
  let out=`<text x="${PAD}" y="${y0+TITLE_H-14}" font-family="'DM Sans',sans-serif" font-size="16" font-weight="700" fill="${st.C_TITLE}" class="syn-title">${esc(rule.name)}</text>`;
  out+=`<circle cx="${PAD+4}" cy="${y}" r="4" fill="${st.C_LINE}"/>`;
  out+=`<path class="syn-l" d="M${PAD+8} ${y}H${nx}"/>`;
  out+=node.draw(nx,y);
  const xe=nx+node.w;
  out+=`<path class="syn-l" d="M${xe} ${y}H${xe+GAP+4}"/>`+_arrowHead('filled',xe+GAP+14,y,0,9,st.C_LINE,1.8)+`<path class="syn-l" d="M${xe+GAP+16} ${y-7}V${y+7}"/>`;
  return {svg:out, w:xe+GAP+endW+PAD, h:TITLE_H+node.up+node.down+st.RULE_GAP};
}
function _synRenderAll(parsed, st){
  st=st||SYN_ST;
  let y=st.PAD-6, W=0, out='';
  parsed.rules.forEach(r=>{ const rr=_synRuleSVG(r,st,y); out+=rr.svg; y+=rr.h; W=Math.max(W,rr.w); });
  return {svg:out, w:Math.max(W,160), h:Math.max(y+st.PAD-st.RULE_GAP+6,60)};
}
/* Vollständiges, eigenständiges SVG (für Export/Vorschau) */
function _synStandaloneSVG(parsed, st, bg){
  st=st||SYN_ST; const r=_synRenderAll(parsed,st);
  const css=`.syn-l{fill:none;stroke:${st.C_LINE};stroke-width:1.8;stroke-linecap:round}`;
  const fill=typeof bg==='string'?bg:(bg?'#030303':null);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r.w} ${r.h}" width="${r.w}" height="${r.h}"><style>${css}</style>`+
         (fill?`<rect width="100%" height="100%" fill="${fill}"/>`:'')+r.svg+`</svg>`;
}
/* druckfreundliche Variante für den SVG-Export (weißer Hintergrund, dunkle Linien) */
const SYN_ST_LIGHT=Object.assign({}, SYN_ST, { C_LINE:'#44403a', C_TERM:'#c77700', C_TERM_F:'#fff3dc', C_TERM_T:'#6b3f00',
  C_NT:'#2563eb', C_NT_F:'#e8f0ff', C_NT_T:'#1e3a8a', C_TITLE:'#1f2937' });

/* ── Wortprüfung (Erkennung per Mengen von Endpositionen) ── */
function _synMatch(rules, startName, word){
  const byName=new Map(rules.map(r=>[r.name,r.ast])), memo=new Map(), active=new Set(), unknown=new Set();
  function close(item,start,minOne){
    const res=new Set(minOne?[]:[start]); let fr=[start];
    // Menge aller nach ≥1 (bzw. ≥0) Wiederholungen erreichbaren Positionen
    let first=true;
    while(fr.length){
      const nx=[];
      for(const p of fr) for(const q of m(item,p)){ if(!res.has(q)){ res.add(q); nx.push(q); } }
      fr=nx; first=false;
    }
    return res;
  }
  function m(node,pos){
    switch(node.t){
      case 'empty': return new Set([pos]);
      case 'term': return word.startsWith(node.text,pos)?new Set([pos+node.text.length]):new Set();
      case 'nt': {
        const key=node.name+'@'+pos;
        if(memo.has(key)) return memo.get(key);
        if(active.has(key)) return new Set();
        const ast=byName.get(node.name); if(!ast){ unknown.add(node.name); return new Set(); }
        active.add(key); const r=m(ast,pos); active.delete(key); memo.set(key,r); return r;
      }
      case 'seq': { let cur=new Set([pos]); for(const it of node.items){ const nx=new Set(); for(const p of cur) for(const q of m(it,p)) nx.add(q); cur=nx; if(!cur.size) break; } return cur; }
      case 'choice': { const r=new Set(); for(const a of node.alts) for(const q of m(a,pos)) r.add(q); return r; }
      case 'opt': { const r=new Set([pos]); for(const q of m(node.item,pos)) r.add(q); return r; }
      case 'star': return close(node.item,pos,false);
      case 'plus': return close(node.item,pos,true);
    }
    return new Set();
  }
  const ast=byName.get(startName);
  if(!ast) return {ok:false, unknown:[startName], missingStart:true};
  const ends=m(ast,0);
  return {ok:ends.has(word.length), unknown:[...unknown]};
}

/* ── Widget ── */
function buildSyntaxWidget(el, readOnly, canRun){
  const wrap=document.createElement('div'); wrap.className='el-syn-wrap';
  el.syntax=el.syntax||{source:SYN_DEFAULT_SRC, test:''};
  const ui={srcOpen:!readOnly};
  let toggleBtn=null, srcPanel=null, ta=null, errBox=null, ruleSel=null, wordIn=null, resEl=null;

  const view=document.createElement('div'); view.className='el-syn-view';
  const svg=mkSVGEl('svg'); svg.classList.add('el-syn-svg'); svg.setAttribute('preserveAspectRatio','xMinYMin meet');
  view.appendChild(svg);

  const cur=()=>{ const a=getEl(el.id); return a&&a.syntax?a.syntax:el.syntax; };

  function setSrcOpen(open){
    ui.srcOpen=open;
    if(srcPanel) srcPanel.style.display=open?'flex':'none';
    if(toggleBtn) toggleBtn.classList.toggle('active',open);
  }
  function jumpToSource(s,e,isTerm){
    if(!ta) return;
    setSrcOpen(true);
    const v=ta.value; let a=s, b=e;
    if(isTerm&&/['"`„“«]/.test(v[s]||'')){ a=s+1; b=(e-1>a&&!/['"`”»“]/.test(v[e-1]||''))?e:Math.max(a,e-1); }
    ta.focus(); ta.setSelectionRange(a,b);
  }
  function render(){
    const syn=cur(), parsed=_synParse(syn.source||'');
    const r=_synRenderAll(parsed, SYN_ST);
    svg.setAttribute('viewBox',`0 0 ${r.w} ${r.h}`);
    svg.innerHTML=parsed.rules.length?r.svg:`<text x="18" y="40" font-family="'DM Sans',sans-serif" font-size="15" fill="#6b665c">Noch keine Regel – im Quelltext z. B.  Zahl = Ziffer { Ziffer } ;</text>`;
    if(!parsed.rules.length) svg.setAttribute('viewBox','0 0 520 70');
    if(!readOnly){
      svg.querySelectorAll('.syn-n').forEach(g=>{
        g.addEventListener('mousedown',ev=>ev.stopPropagation());
        g.addEventListener('click',ev=>{ ev.stopPropagation(); jumpToSource(+g.dataset.s,+g.dataset.e,g.dataset.t==='1'); });
      });
    }
    if(errBox){
      errBox.innerHTML=parsed.errors.slice(0,3).map(er=>{ const lc=_synLineCol(syn.source||'',er.pos); return `Zeile ${lc.line}, Spalte ${lc.col}: ${esc(er.msg)}`; }).join('<br>');
      errBox.style.display=parsed.errors.length?'block':'none';
    }
    if(ruleSel){
      const prev=ruleSel.value;
      ruleSel.innerHTML=parsed.rules.map(x=>`<option value="${esc(x.name)}">${esc(x.name)}</option>`).join('');
      if(parsed.rules.some(x=>x.name===prev)) ruleSel.value=prev;
    }
    wrap._parsed=parsed;
    _spRefresh();
  }

  if(!readOnly){
    const tb=document.createElement('div'); tb.className='el-syn-toolbar';
    toggleBtn=document.createElement('button'); toggleBtn.type='button'; toggleBtn.className='el-auto-tbtn el-syn-toggle';
    toggleBtn.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg> Quelltext';
    toggleBtn.addEventListener('mousedown',ev=>ev.stopPropagation());
    toggleBtn.addEventListener('click',ev=>{ ev.stopPropagation(); setSrcOpen(!ui.srcOpen); });
    const hint=document.createElement('span'); hint.className='el-auto-hint';
    hint.textContent='Baustein im Diagramm anklicken → springt zur Stelle im Quelltext';
    tb.appendChild(toggleBtn); tb.appendChild(hint);
    wrap.appendChild(tb);
  }
  wrap.appendChild(view);

  if(!readOnly){
    srcPanel=document.createElement('div'); srcPanel.className='el-syn-src';
    const ins=document.createElement('div'); ins.className='el-syn-ins';
    ta=document.createElement('textarea'); ta.className='el-syn-ta'; ta.spellcheck=false; ta.wrap='off';
    ta.value=cur().source||''; ta.placeholder="Name = 'a' | B { C } [ D ] ( E | F ) ;";
    const onSrc=()=>{ const a=getEl(el.id); if(a) a.syntax.source=ta.value; render(); };
    ta.addEventListener('mousedown',ev=>ev.stopPropagation());
    ta.addEventListener('keydown',ev=>ev.stopPropagation());
    ta.addEventListener('input',()=>{
      if(!ta._hist){ pushHistory('Syntaxdiagramm bearbeitet'); ta._hist=true; }
      onSrc();
    });
    ta.addEventListener('blur',()=>{ ta._hist=false; });
    const snip=(before,after,ph)=>{
      const s=ta.selectionStart, e=ta.selectionEnd, sel=ta.value.slice(s,e), mid=sel||ph;
      pushHistory('Syntaxdiagramm bearbeitet');
      ta.setRangeText(before+mid+after, s, e, 'end');
      ta.focus(); ta.setSelectionRange(s+before.length, s+before.length+mid.length);
      onSrc();
    };
    const newRule=()=>{
      pushHistory('Syntaxdiagramm bearbeitet');
      const v=ta.value, sep=(!v||v.endsWith('\n'))?'':'\n', add=sep+"Neu = 'x' ;";
      ta.value=v+add; ta.focus(); const s=v.length+sep.length; ta.setSelectionRange(s,s+3); onSrc();
    };
    [ ["'x'",'Terminal (Oval)',()=>snip("'","'",'x')],
      ['Name','Nichtterminal (Rechteck)',()=>snip('','','Name')],
      ['|','Alternative',()=>snip(' | ','','')],
      ['[ ]','Option (darf fehlen)',()=>snip('[ ',' ]','')],
      ['{ }','Wiederholung (0× oder öfter)',()=>snip('{ ',' }','')],
      ['( )','Gruppe',()=>snip('( ',' )','')],
      ['+ Regel','Neue Regel',newRule] ].forEach(([lbl,title,fn])=>{
      const b=document.createElement('button'); b.type='button'; b.className='el-syn-ibtn'; b.textContent=lbl; b.title=title;
      b.addEventListener('mousedown',ev=>{ ev.stopPropagation(); ev.preventDefault(); });   // Fokus/Auswahl im Textfeld behalten
      b.addEventListener('click',ev=>{ ev.stopPropagation(); fn(); });
      ins.appendChild(b);
    });
    errBox=document.createElement('div'); errBox.className='el-syn-err'; errBox.style.display='none';
    srcPanel.appendChild(ins); srcPanel.appendChild(ta); srcPanel.appendChild(errBox);
    wrap.appendChild(srcPanel);
  }

  if(!readOnly||canRun){
    const row=document.createElement('div'); row.className='el-syn-check';
    ruleSel=document.createElement('select'); ruleSel.className='el-syn-rule'; ruleSel.title='Startregel';
    wordIn=document.createElement('input'); wordIn.type='text'; wordIn.className='el-auto-input'; wordIn.placeholder='Wort prüfen, z. B. -12';
    wordIn.autocomplete='off'; wordIn.spellcheck=false; wordIn.value=cur().test||'';
    resEl=document.createElement('span'); resEl.className='el-syn-res';
    const btn=document.createElement('button'); btn.type='button'; btn.className='el-auto-playbtn'; btn.title='Wort prüfen';
    btn.innerHTML='<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
    const check=()=>{
      const parsed=wrap._parsed||_synParse(cur().source||''), w=wordIn.value;
      { const a=getEl(el.id); if(a) a.syntax.test=w; }
      if(!parsed.rules.length){ resEl.className='el-syn-res err'; resEl.textContent='Keine Regel vorhanden.'; return; }
      const res=_synMatch(parsed.rules, ruleSel.value||parsed.rules[0].name, w);
      const shown=w===''?'(leeres Wort)':'„'+w+'"';
      if(res.ok){ resEl.className='el-syn-res ok'; resEl.textContent='✓ '+shown+' gehört zur Sprache von '+(ruleSel.value||parsed.rules[0].name); }
      else { resEl.className='el-syn-res err'; resEl.textContent='✗ '+shown+' gehört nicht dazu'; }
      if(res.unknown&&res.unknown.length&&!res.missingStart) resEl.textContent+='  ⚠ unbekannt: '+res.unknown.join(', ');
    };
    [ruleSel,wordIn,btn].forEach(n=>n.addEventListener('mousedown',ev=>ev.stopPropagation()));
    wordIn.addEventListener('keydown',ev=>{ ev.stopPropagation(); if(ev.key==='Enter'){ ev.preventDefault(); check(); } });
    wordIn.addEventListener('input',()=>{ const a=getEl(el.id); if(a) a.syntax.test=wordIn.value; });
    btn.addEventListener('click',ev=>{ ev.stopPropagation(); check(); });
    row.appendChild(ruleSel); row.appendChild(wordIn); row.appendChild(btn); row.appendChild(resEl);
    wrap.appendChild(row);
  }

  setSrcOpen(ui.srcOpen&&!!srcPanel);
  render();
  return wrap;
}
function synToggleSrc(){
  const b=document.querySelector('#sel_'+selElId+' .el-syn-toggle'); if(b) b.click();
}
function synExportSVG(){
  const el=selElId?getEl(selElId):null;
  if(!el||el.type!=='syntax'){ _ftToast('Bitte zuerst ein Syntaxdiagramm auswählen.','err'); return; }
  const parsed=_synParse(el.syntax.source||'');
  if(!parsed.rules.length){ _ftToast('Das Syntaxdiagramm enthält noch keine Regel.','err'); return; }
  _downloadText('syntaxdiagramm.svg', _synStandaloneSVG(parsed, SYN_ST_LIGHT, '#ffffff'), 'image/svg+xml');
  _ftToast('Als syntaxdiagramm.svg exportiert (weißer Hintergrund, druckfreundlich)','ok');
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

  // ── Internal element clipboard takes priority over OS clipboard ─────
  if (_ctxClipboard && _ctxClipboard.length > 0) {
    ev.preventDefault();
    ctxPaste();
    return;
  }

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


// =====================================================================
// SPELL CHECKER (nspell + dictionary-de + dictionary-en-gb)
// =====================================================================
const SC = (() => {
  // LanguageTool Public API — handles German compound words + grammar
  const LT_API = 'https://api.languagetool.org/v2/check';
  const _custom = new Set(JSON.parse(localStorage.getItem('spellCustomDict') || '[]'));
  const _timers  = new Map(); // elId → debounce timer
  const _cache   = new Map(); // text → LT response
  const _drawn   = new Map(); // elId → last rendered match-fingerprint
  const _hits  = new Map();   // elId -> [{u,word,replacements,message,isSpell,range}] für Hover/Rechtsklick-Treffertest
  let _lang = 'de-DE';        // or 'en-GB'

  // --- LanguageTool call ---
  // Levenshtein distance — filter absurd suggestions
  function _lev(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({length: m+1}, (_, i) => [i, ...Array(n).fill(0)]);
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++)
      for (let j = 1; j <= n; j++)
        dp[i][j] = a[i-1]===b[j-1] ? dp[i-1][j-1]
          : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    return dp[m][n];
  }

  // Only keep a suggestion if it's plausible (not wildly different from original)
  function _filterSuggs(original, replacements) {
    if (!replacements.length) return [];
    const orig = original.toLowerCase();
    return replacements.filter(r => {
      const rep = r.toLowerCase();
      const dist = _lev(orig, rep);
      // Short words: max 2 edits. Longer words: max 35% of length, capped at 5.
      const maxDist = orig.length <= 5 ? 2 : Math.min(5, Math.floor(orig.length * 0.35));
      return dist <= maxDist;
    });
  }

  // Cache version — bump to bust all in-memory cached LT results
  const _CACHE_VER = 'v5';

  async function _ltCheck(text) {
    if (!text.trim()) return [];
    const key = _CACHE_VER + _lang + '\0' + text;
    if (_cache.has(key)) return _cache.get(key);
    try {
      const body = new URLSearchParams({
        text,
        language: _lang,
        // Blacklist noisy categories — do NOT use enabledOnly, it breaks German rule IDs
        disabledCategories: [
          'STYLE',            // purely stylistic
          'REDUNDANCY',       // "redundant" false positives
          'COLLOQUIALISMS',   // informal-but-valid language
          'GENDER_NEUTRALITY',// gendering suggestions
          'TYPOGRAPHY',       // quote marks, dashes
        ].join(','),
        disabledRules: [
          'WHITESPACE_RULE',
          'UPPERCASE_SENTENCE_START',
          'COMMA_PARENTHESIS_WHITESPACE',
          'WORD_REPEAT_BEGINNING_RULE',
          'TOO_LONG_SENTENCE',
          'SENTENCE_FRAGMENT',
        ].join(','),
      });
      const r = await fetch(LT_API, { method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body });
      if (!r.ok) return [];
      const data = await r.json();
      const matches = (data.matches || []).filter(m => {
        const surface = m.context?.text?.slice(m.context.offset, m.context.offset + m.context.length) || '';
        // Skip custom dictionary words
        if (_custom.has(surface) || _custom.has(surface.toLowerCase())) return false;

        const isSpell = m.rule?.issueType === 'misspelling' || m.rule?.category?.id === 'TYPOS';
        const reps = (m.replacements || []).map(r => r.value);

        if (isSpell) {
          // Spelling: Levenshtein filter — no plausible suggestion = valid compound → skip
          const good = _filterSuggs(surface, reps);
          if (!good.length) return false;
          m.replacements = good.map(v => ({ value: v }));
        } else {
          // Grammar: only discard if every suggestion is absurdly different
          // (catches "Reihenfolge"→"Pest" while allowing "soll"→"sollte")
          if (reps.length) {
            const absurd = reps.every(r => {
              const d = _lev(surface.toLowerCase(), r.toLowerCase());
              return d > Math.max(surface.length * 0.7, 4);
            });
            if (absurd) return false;
            m.replacements = reps.map(v => ({ value: v }));
          }
        }
        return true;
      });
      _cache.set(key, matches);
      return matches;
    } catch { return []; }
  }

  function setLang(l) { _lang = l; _cache.clear(); }

  function addWord(word) {
    _custom.add(word.trim());
    localStorage.setItem('spellCustomDict', JSON.stringify([..._custom]));
    _cache.clear();
    document.querySelectorAll('.el-text[contenteditable="true"]').forEach(ce => {
      const elId = ce.closest('[data-elid]')?.dataset?.elid;
      if (elId) scheduleCheck(elId, 0);
    });
    renderDictModal();
  }

  function removeWord(word) {
    _custom.delete(word);
    localStorage.setItem('spellCustomDict', JSON.stringify([..._custom]));
    _cache.clear();
    document.querySelectorAll('.el-text[contenteditable="true"]').forEach(ce => {
      const elId = ce.closest('[data-elid]')?.dataset?.elid;
      if (elId) scheduleCheck(elId, 0);
    });
    renderDictModal();
  }

  function getCustom() { return [..._custom].sort(); }

  // --- Build a flat node-map once; use it for BOTH text extraction and offset resolution ---
  // Returns { text: string, map: [{node, start, end}] }
  function _buildNodeMap(root) {
    const BLOCK = new Set(['p','div','li','h1','h2','h3','h4','h5','h6','blockquote','pre']);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let text = '';
    const map = []; // {node: TextNode, start, end}
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.tagName.toLowerCase();
        if (tag === 'br') {
          text += '\n';
        } else if (BLOCK.has(tag) && text.length > 0 && !text.endsWith('\n')) {
          text += '\n';
        }
      } else {
        // TEXT_NODE
        const start = text.length;
        text += node.textContent;
        map.push({ node, start, end: text.length });
      }
    }
    return { text, map };
  }

  function _mapResolve(map, charIdx) {
    for (const entry of map) {
      if (charIdx >= entry.start && charIdx <= entry.end) {
        return { node: entry.node, offset: charIdx - entry.start };
      }
    }
    // Fallback: return end of last entry
    const last = map[map.length - 1];
    return last ? { node: last.node, offset: last.end - last.start } : null;
  }

  // --- Render underlines for an element ---
  async function renderLayer(elId) {
    const dom = document.getElementById('sel_' + elId); if (!dom) return;
    const ce  = dom.querySelector('.el-text');            if (!ce)  return;

    let layer = dom.querySelector('.spell-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'spell-layer';
      dom.appendChild(layer);
    }

    const { text, map } = _buildNodeMap(ce);
    if (!text.trim()) { layer.innerHTML = ''; _drawn.delete(elId); _hits.delete(elId); return; }

    const matches = await _ltCheck(text);

    // Recheck DOM is still there after async
    if (!document.getElementById('sel_' + elId)) return;

    // Fingerprint: offsets + lengths + rule IDs — skip full redraw if nothing changed
    const fp = matches.map(m => `${m.offset}:${m.length}:${m.rule?.id}`).join('|');
    if (_drawn.get(elId) === fp) return;
    _drawn.set(elId, fp);

    layer.innerHTML = '';
    _hits.delete(elId);
    if (!matches.length) return;

    const scale   = typeof cvScale !== 'undefined' ? cvScale : 1;
    const ceRect  = ce.getBoundingClientRect();
    const domRect = dom.getBoundingClientRect();

    layer.style.left   = Math.round((ceRect.left - domRect.left) / scale) + 'px';
    layer.style.top    = Math.round((ceRect.top  - domRect.top)  / scale) + 'px';
    layer.style.width  = Math.round(ceRect.width  / scale) + 'px';
    layer.style.height = Math.round(ceRect.height / scale) + 'px';

    const hits = [];
    for (const m of matches) {
      const start = _mapResolve(map, m.offset);
      const end   = _mapResolve(map, m.offset + m.length);
      if (!start || !end) continue;

      const range = document.createRange();
      try { range.setStart(start.node, start.offset); range.setEnd(end.node, end.offset); }
      catch { continue; }

      const wr = range.getBoundingClientRect();
      if (!wr.width) continue;

      // Spelling = red, Grammar = blue
      const isSpell = m.rule?.issueType === 'misspelling' || m.rule?.category?.id === 'TYPOS';
      const left   = Math.round((wr.left  - ceRect.left) / scale);
      const top    = Math.round((wr.top   - ceRect.top)  / scale);
      const width  = Math.round(wr.width  / scale);
      const height = Math.round(wr.height / scale);

      const u = document.createElement('span');
      u.className = 'spell-u' + (isSpell ? '' : ' grammar-u');
      u.style.cssText = `left:${left}px;top:${top}px;width:${width}px;height:${height}px`;
      u.dataset.word = text.slice(m.offset, m.offset + m.length);

      const replacements = (m.replacements || []).slice(0, 6).map(r => r.value);
      const message = m.message || '';

      // Das Overlay ist rein visuell (pointer-events:none). Hover/Rechtsklick werden per
      // Treffertest erkannt (_hitAt) — so lassen sich markierte Wörter normal anklicken,
      // markieren und bearbeiten (vorher haben die Overlays alle Mausereignisse abgefangen).
      hits.push({ u, word: u.dataset.word, replacements, message, isSpell, range });

      layer.appendChild(u);
    }
    _hits.set(elId, hits);
  }

  function scheduleCheck(elId, delay = 800) {
    if (_timers.has(elId)) clearTimeout(_timers.get(elId));
    _timers.set(elId, setTimeout(() => { _timers.delete(elId); renderLayer(elId); }, delay));
  }

  function clearLayer(elId) {
    const dom = document.getElementById('sel_' + elId); if (!dom) return;
    const layer = dom.querySelector('.spell-layer'); if (layer) layer.innerHTML = '';
    _drawn.delete(elId); _hits.delete(elId);
  }

  // --- Popup ---
  let _hoverTimer = null;

  function schedulePopup(word, replacements, message, isSpell, range, triggerEl, elId) {
    if (_hoverTimer) clearTimeout(_hoverTimer);
    _hoverTimer = setTimeout(() => showPopup(word, replacements, message, isSpell, range, triggerEl, elId), 180);
  }

  function hidePopup() {
    document.getElementById('spellPopup').style.display = 'none';
  }

  function showPopup(word, replacements, message, isSpell, range, triggerEl, elId) {
    hidePopup();
    const pop = document.getElementById('spellPopup');
    const colorCls = isSpell ? 'sp-pop-word-spell' : 'sp-pop-word-grammar';

    pop.innerHTML = `
      <div class="sp-pop-word ${colorCls}">${escHtml(word)}</div>
      ${message ? `<div class="sp-pop-msg">${escHtml(message)}</div>` : ''}
      ${replacements.length
        ? replacements.map(s => `<button class="sp-pop-sugg" data-s="${escHtml(s)}">${escHtml(s)}</button>`).join('')
        : '<span class="sp-pop-none">Keine Vorschläge</span>'}
      <div class="sp-pop-sep"></div>
      <button class="sp-pop-add" data-w="${escHtml(word)}">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        Zum Wörterbuch</button>`;

    pop.querySelectorAll('.sp-pop-sugg').forEach(btn => {
      btn.addEventListener('click', () => {
        replaceMisspelled(btn.dataset.s, range.cloneRange(), elId);
        hidePopup();
      });
    });
    pop.querySelector('.sp-pop-add').addEventListener('click', () => {
      addWord(word); hidePopup();
    });

    const ur = triggerEl.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    pop.style.display = 'block';
    const pw = pop.offsetWidth || 190, ph = pop.offsetHeight || 200;
    let px = ur.left, py = ur.bottom + 6;
    if (px + pw > vw - 8) px = vw - pw - 8;
    if (py + ph > vh - 8) py = ur.top - ph - 4;
    pop.style.left = Math.max(4, px) + 'px';
    pop.style.top  = Math.max(4, py) + 'px';
  }

  function replaceMisspelled(replacement, range, elId) {
    try {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      document.execCommand('insertText', false, replacement);
      const el = typeof getEl === 'function' ? getEl(elId) : null;
      const ce = document.getElementById('sel_' + elId)?.querySelector('.el-text');
      if (el && ce) el.html = ce.innerHTML;
      _cache.clear();
      scheduleCheck(elId, 300);
    } catch(e) { console.warn('Replace failed:', e); }
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // --- Custom dictionary modal ---
  function renderDictModal() {
    const list = document.getElementById('dictWordList'); if (!list) return;
    const words = getCustom();
    list.innerHTML = words.length
      ? words.map(w => `<div class="dict-row"><span class="dict-word">${escHtml(w)}</span><button class="dict-del" data-w="${escHtml(w)}" title="Entfernen">✕</button></div>`).join('')
      : '<div class="dict-empty">Noch keine eigenen Wörter</div>';
    list.querySelectorAll('.dict-del').forEach(btn => {
      btn.addEventListener('click', () => removeWord(btn.dataset.w));
    });
  }

  function openDictModal() { renderDictModal(); document.getElementById('dictModal').style.display = 'flex'; }
  function closeDictModal() { document.getElementById('dictModal').style.display = 'none'; }

  // --- Treffertest für Hover & Rechtsklick (die Unterstreichungen selbst sind pointer-events:none) ---
  function _hitAt(elId, x, y) {
    const list = _hits.get(elId); if (!list) return null;
    for (const h of list) {
      if (!h.u.isConnected) continue;
      const r = h.u.getBoundingClientRect();
      if (x >= r.left - 1 && x <= r.right + 1 && y >= r.top - 1 && y <= r.bottom + 1) return h;
    }
    return null;
  }
  function _ceOf(target) {
    const ce = target && target.closest ? target.closest('.el-text[contenteditable="true"]') : null;
    if (!ce) return null;
    const elId = ce.closest('[data-elid]')?.dataset?.elid;
    return elId ? { ce, elId } : null;
  }
  let _lastHit = null, _lastInputTs = 0;
  document.addEventListener('input', () => { _lastInputTs = Date.now(); }, true);
  document.addEventListener('mousemove', ev => {
    const c = _ceOf(ev.target);
    if (!c) { if (_lastHit) { _lastHit = null; if (_hoverTimer) clearTimeout(_hoverTimer); } return; }
    if (Date.now() - _lastInputTs < 900) return;       // während des Tippens sind die Overlays veraltet
    const h = _hitAt(c.elId, ev.clientX, ev.clientY);
    if (h === _lastHit) return;
    _lastHit = h;
    if (_hoverTimer) clearTimeout(_hoverTimer);
    if (h) schedulePopup(h.word, h.replacements, h.message, h.isSpell, h.range.cloneRange(), h.u, c.elId);
  }, { passive: true });

  // Rechtsklick auf ein markiertes Wort → Vorschläge (ersetzt das vom Editor unterdrückte Browser-Menü)
  function contextAt(ev) {
    const c = _ceOf(ev.target); if (!c) return false;
    const h = _hitAt(c.elId, ev.clientX, ev.clientY); if (!h) return false;
    if (_hoverTimer) clearTimeout(_hoverTimer);
    showPopup(h.word, h.replacements, h.message, h.isSpell, h.range.cloneRange(), h.u, c.elId);
    return true;
  }

  // Close popup on any mousedown — use capture so el-text's stopPropagation doesn't block it
  document.addEventListener('mousedown', ev => {
    if (!ev.target.closest('#spellPopup')) hidePopup();
  }, true);

  // No init() needed — API is called per-check
  function init() {
    document.querySelectorAll('.el-text[contenteditable="true"]').forEach(ce => {
      const elId = ce.closest('[data-elid]')?.dataset?.elid;
      if (elId) scheduleCheck(elId, 600);
    });
  }

  return { init, addWord, removeWord, getCustom, renderLayer, scheduleCheck, clearLayer,
           hidePopup, setLang, openDictModal, closeDictModal, renderDictModal, contextAt };
})();


function setSpellLang(lang){
  SC.setLang(lang);
  document.getElementById('edLangDe')?.classList.toggle('active', lang==='de-DE');
  document.getElementById('edLangEn')?.classList.toggle('active', lang==='en-GB');
  // Re-check all visible text elements with new language
  (curSlide()?.elements||[]).forEach(el=>{
    if(el.type==='title'||el.type==='text'){ SC.clearLayer(el.id); SC.scheduleCheck(el.id,200); }
  });
}


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
/* ════════ CONTEXT MENU ════════ */
let _ctxClipboard = null; // internal element clipboard
let _ctxTargetId  = null; // element id that was right-clicked (null = canvas bg)
let _ctxPasteSlideX = null; // slide-coords where right-click happened (for paste position)
let _ctxPasteSlideY = null;

/* ── Capturing mousedown on canvas: cycle-select overlapping lines/arrows ── */
document.addEventListener('mousedown', ev => {
  if (!document.getElementById('editorView')?.classList.contains('open')) return;
  const cv = document.getElementById('slideCV');
  if (!cv || !cv.contains(ev.target)) return;

  // Let endpoint handle clicks pass through unchanged
  if (ev.target.classList.contains('er-line-pt')) return;

  const sl = curSlide(); if (!sl) return;
  const cvRect = cv.getBoundingClientRect();
  const scale  = cv.offsetWidth / (slSz(sl).w || 960);
  const px = (ev.clientX - cvRect.left)  / scale;
  const py = (ev.clientY - cvRect.top)   / scale;

  // Collect all lines/arrows whose hit area covers this point
  const THRESH = 7;
  const hits = sl.elements
    .filter(e => {
      if (e.type !== 'er-line' && e.type !== 'sym-arrow') return false;
      const dx = e.x2 - e.x1, dy = e.y2 - e.y1;
      const lenSq = dx*dx + dy*dy; if (lenSq === 0) return false;
      const t = Math.max(0, Math.min(1, ((px-e.x1)*dx + (py-e.y1)*dy) / lenSq));
      const nx = e.x1 + t*dx - px, ny = e.y1 + t*dy - py;
      return Math.sqrt(nx*nx + ny*ny) <= THRESH;
    })
    .sort((a, b) => (b.z||0) - (a.z||0));

  if (hits.length === 0) return; // let normal handlers take over

  ev.stopPropagation(); // take over selection completely

  if (ev.ctrlKey || ev.metaKey) {
    // Ctrl+click: toggle all hits in multi-selection (top one only for simplicity)
    const e = hits[0];
    if (_multiSel.has(e.id)) {
      _multiSel.delete(e.id);
      document.getElementById('sel_'+e.id)?.classList.remove('multi-selected');
    } else {
      if (selElId && !_multiSel.has(selElId)) {
        _multiSel.add(selElId);
        document.getElementById('sel_'+selElId)?.classList.add('multi-selected');
      }
      _multiSel.add(e.id);
      document.getElementById('sel_'+e.id)?.classList.add('multi-selected');
      selElId = e.id;
    }
    edTab('fmt'); populateMultiFmt();
    return;
  }

  if (_multiSel.size > 0 && hits.some(e => _multiSel.has(e.id))) {
    startGroupMove(ev); return;
  }

  // Cycle: if already selected one of the hits, move to next in list
  let pick = hits[0];
  if (hits.length > 1) {
    const curIdx = hits.findIndex(e => e.id === selElId);
    pick = curIdx >= 0 ? hits[(curIdx + 1) % hits.length] : hits[0];
  }

  selectLine(pick.id);
  if (pick.type === 'sym-arrow') startMoveArrow(pick.id, ev);
  else startMoveLine(pick.id, ev);
}, true /* capturing */);


function showCtxMenu(ev, elId) {
  ev.preventDefault();
  ev.stopPropagation();

  // Store slide-space position for paste/duplicate placement
  const cv = document.getElementById('slideCV');
  const sl = curSlide();
  if (cv && sl) {
    const cvRect = cv.getBoundingClientRect();
    const scale  = cv.offsetWidth / (slSz(sl).w || 960);
    _ctxPasteSlideX = Math.round((ev.clientX - cvRect.left) / scale);
    _ctxPasteSlideY = Math.round((ev.clientY - cvRect.top)  / scale);
  } else { _ctxPasteSlideX = null; _ctxPasteSlideY = null; }

  // Select the right-clicked element so actions apply to it
  if (elId) {
    if (!_multiSel.has(elId)) { selectEl(elId); }
  }

  _ctxTargetId = elId || null;
  _ctxLastX = ev.clientX; _ctxLastY = ev.clientY;

  const menu = document.getElementById('ctxMenu');
  const hasEl   = !!(elId || _multiSel.size > 0 || selElId);
  const hasCopy = !!_ctxClipboard;

  // Enable / disable items
  menu.querySelector('#ctxCutBtn').disabled    = !hasEl;
  menu.querySelector('#ctxDupBtn').disabled    = !hasEl;
  menu.querySelector('#ctxFrontBtn').disabled  = !hasEl;
  menu.querySelector('#ctxBackBtn').disabled   = !hasEl;
  menu.querySelector('#ctxDeleteBtn').disabled = !hasEl;
  menu.querySelector('#ctxPasteBtn').disabled  = !hasCopy;

  // Show / populate marker properties section
  const ctxMarkerSec = document.getElementById('ctxMarkerSec');
  const targetEl = elId ? getEl(elId) : (selElId ? getEl(selElId) : null);
  const isMarkerTarget = targetEl && targetEl.type === 'marker';
  const optBtn = menu.querySelector('#ctxOptBtn');
  if (optBtn) {
    optBtn.disabled = !hasEl;
    const lb = menu.querySelector('#ctxOptLbl');
    if (lb) lb.textContent = 'Elementoptionen' + (_multiSel.size > 1 ? ' · ' + _multiSel.size + ' Elemente' : (targetEl ? ' · ' + typeLabel(targetEl.type) : ''));
  }
  if (ctxMarkerSec) {
    ctxMarkerSec.style.display = isMarkerTarget ? 'block' : 'none';
    if (isMarkerTarget) {
      const ms = targetEl.markerStyle || {};
      const mc = document.getElementById('ctxMarkerColor');
      const msw = document.getElementById('ctxMarkerSW');
      const mswv = document.getElementById('ctxMarkerSWV');
      const mop = document.getElementById('ctxMarkerOp');
      const mopv = document.getElementById('ctxMarkerOpV');
      if (mc)   mc.value  = toHex(ms.color || '#facc15');
      if (msw)  { msw.value  = ms.strokeWidth || 14; if (mswv) mswv.textContent = (ms.strokeWidth || 14) + 'px'; }
      if (mop)  { mop.value  = ms.opacity != null ? ms.opacity : 0.35; if (mopv) mopv.textContent = Math.round((ms.opacity != null ? ms.opacity : 0.35) * 100) + '%'; }
    }
  }

  // Position
  menu.style.display = 'block';
  const vw = window.innerWidth, vh = window.innerHeight;
  const mw = menu.offsetWidth  || 220;
  const mh = menu.offsetHeight || 300;
  let x = ev.clientX, y = ev.clientY;
  if (x + mw > vw - 8) x = vw - mw - 8;
  if (y + mh > vh - 8) y = vh - mh - 8;
  menu.style.left = x + 'px';
  menu.style.top  = y + 'px';
}

function hideCtxMenu() {
  document.getElementById('ctxMenu').style.display = 'none';
}

// Close on any click or Escape outside the menu
document.addEventListener('click', ev => {
  const menu = document.getElementById('ctxMenu');
  if (menu && menu.style.display !== 'none' && !menu.contains(ev.target)) hideCtxMenu();
  /* Close all insert-panel style popovers */
  ['symStylePop','arrowStylePop','markerStylePop','cardPop','optPop','elStylePop'].forEach(id=>{
    const p=document.getElementById(id);
    if(p&&p.style.display!=='none'&&!p.contains(ev.target)) p.style.display='none';
  });
});
document.addEventListener('keydown', ev => {
  if (ev.key === 'Escape') { hideCtxMenu(); closeElOptions(); }
}, true);
document.addEventListener('contextmenu', ev => {
  // Contextmenu on canvas background → show with no element target
  const edOpen = document.getElementById('editorView')?.classList.contains('open');
  if (!edOpen) return;
  const inCanvas = !!ev.target.closest('#edCvArea');
  if (!inCanvas) { hideCtxMenu(); return; }
  // Rechtsklick auf ein rot/blau unterstrichenes Wort → Rechtschreib-Vorschläge statt Kontextmenü
  if (SC.contextAt(ev)) { ev.preventDefault(); ev._ctxHandled = true; hideCtxMenu(); return; }
  // If not already handled by an element overlay, treat as background click
  if (!ev._ctxHandled) showCtxMenu(ev, null);
});

// Hook contextmenu on element overlays (called from buildElDOM)
function _attachElCtxMenu(ovEl, elId) {
  ovEl.addEventListener('contextmenu', ev => {
    ev._ctxHandled = true;
    showCtxMenu(ev, elId);
  });
}

/* ── Actions ── */
function _activeIds() {
  if (_multiSel.size > 0) return [..._multiSel];
  if (selElId) return [selElId];
  if (_ctxTargetId) return [_ctxTargetId];
  return [];
}

function ctxCopy() {
  hideCtxMenu();
  const ids = _activeIds();
  if (!ids.length) return;
  const sl = curSlide(); if (!sl) return;
  _ctxClipboard = ids.map(id => JSON.parse(JSON.stringify(sl.elements.find(e => e.id === id)))).filter(Boolean);
}

function ctxCut() {
  hideCtxMenu();
  const ids = _activeIds();
  if (!ids.length) return;
  ctxCopy();
  pushHistory('Ausgeschnitten');
  ids.forEach(id => deleteElById(id));
  _multiSel.clear();
  selElId = null;
  document.getElementById('fmtEmpty').style.display = 'block';
  document.getElementById('fmtCtrl').style.display  = 'none';
}

function ctxPaste(isDuplicate) {
  hideCtxMenu();
  if (!_ctxClipboard || !_ctxClipboard.length) return;
  const sl = curSlide(); if (!sl) return;
  pushHistory('Eingefügt');

  const OFFSET = 20; // offset for plain Ctrl+V (no right-click position)
  const cv = document.getElementById('slideCV');
  const sz = slSz(sl);

  // Compute bounding box of clipboard elements to position group at paste point
  let minX = Infinity, minY = Infinity;
  _ctxClipboard.forEach(orig => {
    if ('x' in orig) { minX = Math.min(minX, orig.x); minY = Math.min(minY, orig.y); }
    if ('x1' in orig) { minX = Math.min(minX, orig.x1, orig.x2); minY = Math.min(minY, orig.y1, orig.y2); }
  });

  // Decide where to place: at right-click position or offset from original
  let dx, dy;
  if (!isDuplicate && _ctxPasteSlideX !== null) {
    // Place top-left of group at right-click position
    dx = _ctxPasteSlideX - (isFinite(minX) ? minX : 0);
    dy = _ctxPasteSlideY - (isFinite(minY) ? minY : 0);
  } else {
    // Duplicate or keyboard Ctrl+V: small offset from original
    dx = OFFSET; dy = OFFSET;
  }

  // Clear previous selection visually before resetting the set
  _multiSel.forEach(id => document.getElementById('sel_'+id)?.classList.remove('multi-selected'));
  if (selElId) { document.getElementById('sel_'+selElId)?.classList.remove('selected'); selElId = null; }
  _multiSel.clear();
  const newIds = [];
  _ctxClipboard.forEach(orig => {
    const newEl = JSON.parse(JSON.stringify(orig));
    newEl.id = uid();
    newEl.z  = ++zMax;
    if ('x' in newEl)  { newEl.x += dx; newEl.y += dy; }
    if ('x1' in newEl) { newEl.x1 += dx; newEl.y1 += dy; newEl.x2 += dx; newEl.y2 += dy; }
    sl.elements.push(newEl);
    // Use the correct builder and append to the live canvas
    let dom;
    if (newEl.type === 'er-line')    dom = buildLineDom(newEl);
    else if (newEl.type === 'sym-arrow') dom = buildArrowDom(newEl);
    else                              dom = buildElDOM(newEl);
    cv.appendChild(dom);
    newIds.push(newEl.id);
    _multiSel.add(newEl.id);
  });

  if (newIds.length === 1) {
    selElId = newIds[0]; _multiSel.clear();
    selectEl(selElId);
  } else {
    selElId = newIds[newIds.length - 1];
    // Highlight all pasted elements as multi-selected
    newIds.forEach(id => document.getElementById('sel_'+id)?.classList.add('multi-selected'));
    populateMultiFmt();
  }
  renderSpanel();
  autoSave();
}

function ctxDuplicate() {
  hideCtxMenu();
  const savedX = _ctxPasteSlideX, savedY = _ctxPasteSlideY;
  ctxCopy();
  _ctxPasteSlideX = savedX; _ctxPasteSlideY = savedY;
  ctxPaste(true); // isDuplicate=true → use offset instead of click position
}

function ctxDelete() {
  hideCtxMenu();
  const ids = _activeIds();
  if (!ids.length) return;
  if (ids.length === 1) {
    deleteEl(ids[0]);
  } else {
    pushHistory('Gruppe gelöscht');
    ids.forEach(id => deleteElById(id));
    _multiSel.clear();
    selElId = null;
    document.getElementById('fmtEmpty').style.display = 'block';
    document.getElementById('fmtCtrl').style.display  = 'none';
  }
}

function ctxBringFront() {
  hideCtxMenu();
  const ids = _activeIds();
  ids.forEach(id => {
    const el = getEl(id); if (!el) return;
    el.z = ++zMax;
    const d = document.getElementById('sel_' + id);
    if (d) d.style.zIndex = el.z;
  });
  autoSave();
}

function ctxSendBack() {
  hideCtxMenu();
  const ids = _activeIds();
  ids.forEach(id => {
    const el = getEl(id); if (!el) return;
    el.z = Math.max(1, (el.z || 10) - 5);
    const d = document.getElementById('sel_' + id);
    if (d) d.style.zIndex = el.z;
  });
  autoSave();
}

function ctxSelectAll() {
  hideCtxMenu();
  const sl = curSlide(); if (!sl) return;
  _multiSel.clear();
  sl.elements.forEach(el => _multiSel.add(el.id));
  document.querySelectorAll('.sel').forEach(d => d.classList.add('multi-selected'));
  selElId = sl.elements[sl.elements.length - 1]?.id || null;
  populateMultiFmt();
}

/* ── Keyboard shortcuts: Ctrl+C / Ctrl+X / Ctrl+D for elements ── */
document.addEventListener('keydown', ev => {
  if (!document.getElementById('editorView')?.classList.contains('open')) return;
  const k = ev.key.toLowerCase();
  // If copying text in an editable field → clear element clipboard so Ctrl+V stays text
  if ((ev.ctrlKey||ev.metaKey) && k==='c' && isEdit(ev.target)) { _ctxClipboard=null; return; }
  if (isEdit(ev.target)) return;
  if (!(ev.ctrlKey || ev.metaKey)) return;
  if (k === 'c' && (selElId || _multiSel.size > 0)) { ev.preventDefault(); ctxCopy(); return; }
  if (k === 'x' && (selElId || _multiSel.size > 0)) { ev.preventDefault(); ctxCut(); return; }
  if (k === 'd' && (selElId || _multiSel.size > 0)) { ev.preventDefault(); const s=_ctxPasteSlideX; ctxCopy(); _ctxPasteSlideX=s; ctxPaste(true); return; }
  if (k === 'a') { ev.preventDefault(); ctxSelectAll(); return; }
});

/* ════════ SMART ALIGNMENT GUIDES ════════ */
const SG_SNAP   = 10;   // snap threshold for edge/center guides (slide-px)
const SG_SP_TOL = 20;  // tolerance for spacing equality (slide-px) — more forgiving
const SG_COLORS = { edge:'rgba(239,68,68,.9)', center:'rgba(59,130,246,.9)', spacing:'rgba(52,211,153,.85)' };

let _sgHighlights = []; // highlight divs currently shown

function _sgSVG(){
  let svg = document.getElementById('smartGuidesSVG');
  if(!svg){
    const cv = document.getElementById('slideCV');
    if(!cv) return null;
    svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.id = 'smartGuidesSVG';
    svg.setAttribute('class','smart-guides-svg');
    svg.setAttribute('xmlns','http://www.w3.org/2000/svg');
    svg.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible;z-index:9';
    cv.appendChild(svg);
  }
  // Always sync viewBox to slide dimensions so slide-px coords map correctly
  const sl=curSlide();
  if(sl){ const sz=slSz(sl); svg.setAttribute('viewBox',`0 0 ${sz.w} ${sz.h}`); }
  return svg;
}

function clearSmartGuides(){
  const svg=_sgSVG(); if(svg) svg.innerHTML='';
  _sgHighlights.forEach(h=>h.remove());
  _sgHighlights=[];
}

/* Main entry — call during mousemove with the moving element's current rect (slide-px)
   skipEdgeLines: true when group move already draws gH/gV guides separately */
function updateSmartGuides(movingRect, excludeIds, skipEdgeLines){
  clearSmartGuides();
  const svg=_sgSVG(); if(!svg) return;
  const sl=curSlide(); if(!sl) return;
  const sz=slSz(sl);
  const excl=new Set(excludeIds||[]);

  // Rects of all stationary elements
  const others=[];
  sl.elements.forEach(el=>{
    if(excl.has(el.id))return;
    let r=null;
    if(el.type==='er-line'||el.type==='sym-arrow'){
      const x1=Math.min(el.x1,el.x2),y1=Math.min(el.y1,el.y2);
      r={id:el.id,type:el.type,x:x1,y:y1,w:Math.abs(el.x2-el.x1)||4,h:Math.abs(el.y2-el.y1)||4};
    } else if('x' in el && 'w' in el){
      r={id:el.id,type:el.type,x:el.x||0,y:el.y||0,w:el.w||0,h:el.h||0};
    }
    if(r) others.push(r);
  });
  if(!others.length) return;

  const mr=movingRect; // {x,y,w,h}
  const axes=[
    // Vertical guide axes: [movingVal, label, axisType]
    {axis:'V', mv:mr.x,            label:'left',   kind:'edge'},
    {axis:'V', mv:mr.x+mr.w/2,     label:'centerX',kind:'center'},
    {axis:'V', mv:mr.x+mr.w,       label:'right',  kind:'edge'},
    // Horizontal guide axes
    {axis:'H', mv:mr.y,            label:'top',    kind:'edge'},
    {axis:'H', mv:mr.y+mr.h/2,     label:'centerY',kind:'center'},
    {axis:'H', mv:mr.y+mr.h,       label:'bottom', kind:'edge'},
  ];

  const drawnV=new Set(), drawnH=new Set();
  const matchedOthers=new Set();

  if(!skipEdgeLines){
    axes.forEach(({axis,mv,label,kind})=>{
      others.forEach(o=>{
        const candidates=axis==='V'
          ?[o.x, o.x+o.w/2, o.x+o.w]
          :[o.y, o.y+o.h/2, o.y+o.h];
        candidates.forEach(cv=>{
          if(Math.abs(mv-cv)>SG_SNAP) return;
          const color=SG_COLORS[kind];
          const key=`${axis}:${Math.round(cv)}`;
          if(axis==='V' && !drawnV.has(key)){
            drawnV.add(key);
            const involved=[mr,...others.filter(o2=>{
              return Math.abs(o2.x-cv)<SG_SNAP||Math.abs(o2.x+o2.w/2-cv)<SG_SNAP||Math.abs(o2.x+o2.w-cv)<SG_SNAP;
            })];
            const minY=Math.min(...involved.map(r=>r.y))-8;
            const maxY=Math.max(...involved.map(r=>r.y+r.h))+8;
            _sgLine(svg, cv, Math.max(-20,minY), cv, Math.min(sz.h+20,maxY), color, kind);
          }
          if(axis==='H' && !drawnH.has(key)){
            drawnH.add(key);
            const involved=[mr,...others.filter(o2=>{
              return Math.abs(o2.y-cv)<SG_SNAP||Math.abs(o2.y+o2.h/2-cv)<SG_SNAP||Math.abs(o2.y+o2.h-cv)<SG_SNAP;
            })];
            const minX=Math.min(...involved.map(r=>r.x))-8;
            const maxX=Math.max(...involved.map(r=>r.x+r.w))+8;
            _sgLine(svg, Math.max(-20,minX), cv, Math.min(sz.w+20,maxX), cv, color, kind);
          }
          matchedOthers.add(o.id);
        });
      });
    });
  }

  // Spacing guides: compute snap + draw
  const spSnap=_drawSpacingGuides(svg, mr, others, sz);
  return spSnap; // {dx,dy} spacing snap offsets

  // Highlight matched elements
  const cvEl=document.getElementById('slideCV');
  if(cvEl){
    const scale=cvEl.offsetWidth/(sz.w||960);
    matchedOthers.forEach(id=>{
      const o=others.find(e=>e.id===id); if(!o) return;
      const h=document.createElement('div');
      h.className='sg-highlight';
      h.style.cssText=`left:${o.x*scale}px;top:${o.y*scale}px;width:${o.w*scale}px;height:${o.h*scale}px;pointer-events:none`;
      cvEl.appendChild(h);
      _sgHighlights.push(h);
    });
  }
  return spSnap||{dx:0,dy:0};
}

function _sgLine(svg, x1,y1,x2,y2, color, kind){
  const l=document.createElementNS('http://www.w3.org/2000/svg','line');
  l.setAttribute('x1',x1); l.setAttribute('y1',y1);
  l.setAttribute('x2',x2); l.setAttribute('y2',y2);
  l.setAttribute('stroke',color);
  l.setAttribute('stroke-width','1');
  l.setAttribute('vector-effect','non-scaling-stroke');
  if(kind==='spacing') l.setAttribute('stroke-dasharray','4 3');
  svg.appendChild(l);
}

function _sgLabel(svg, x, y, text){
  const fontSize=9, charW=5.5, padX=6, padY=3;
  const w=Math.max(24, Math.ceil(text.length*charW)+padX*2);
  const h=fontSize+padY*2;
  const bg=document.createElementNS('http://www.w3.org/2000/svg','rect');
  bg.setAttribute('x',x-w/2); bg.setAttribute('y',y-h/2);
  bg.setAttribute('width',w); bg.setAttribute('height',h);
  bg.setAttribute('rx',3); bg.setAttribute('fill','rgba(0,0,0,.78)');
  svg.appendChild(bg);
  const t=document.createElementNS('http://www.w3.org/2000/svg','text');
  t.setAttribute('x',x); t.setAttribute('y',y);
  t.setAttribute('text-anchor','middle');
  t.setAttribute('dominant-baseline','central');
  t.setAttribute('fill','#fff');
  t.setAttribute('font-size',fontSize);
  t.setAttribute('font-family',"'JetBrains Mono',monospace");
  t.setAttribute('font-weight','600');
  t.textContent=text;
  svg.appendChild(t);
}

/* Returns {dx,dy} snap correction for equal spacing, or {dx:0,dy:0} */
function _drawSpacingGuides(svg, mr, others, sz){
  const SP_TOL = SG_SP_TOL;
  let snapDx=0, snapDy=0;

  // ── Horizontal spacing ──
  const hSorted=[...others].sort((a,b)=>a.x-b.x);
  const existingHGaps=[];
  for(let i=0;i<hSorted.length-1;i++){
    const gap=hSorted[i+1].x-(hSorted[i].x+hSorted[i].w);
    if(gap>=0) existingHGaps.push({gap,left:hSorted[i],right:hSorted[i+1]});
  }
  const hLeft =others.filter(o=>o.x+o.w<=mr.x).sort((a,b)=>(b.x+b.w)-(a.x+a.w));
  const hRight=others.filter(o=>o.x>=mr.x+mr.w).sort((a,b)=>a.x-b.x);
  const gapToLeft =hLeft.length  ? mr.x-(hLeft[0].x+hLeft[0].w)  : null;
  const gapToRight=hRight.length ? hRight[0].x-(mr.x+mr.w)       : null;

  const hMatches=[];
  if(gapToLeft!==null&&gapToRight!==null&&Math.abs(gapToLeft-gapToRight)<=SP_TOL&&gapToLeft>=-2&&gapToRight>=-2){
    const ideal=(hLeft[0].x+hLeft[0].w+hRight[0].x-mr.w)/2;
    hMatches.push({left:hLeft[0],right:hRight[0],gapL:gapToLeft,gapR:gapToRight,kind:'between',idealX:ideal});
  }
  existingHGaps.forEach(({gap,left:eL,right:eR})=>{
    // chain-right: moving element comes after the pair — require nearest-left neighbour IS eR
    if(gapToLeft!==null&&Math.abs(gapToLeft-gap)<=SP_TOL&&gapToLeft>=-2&&hLeft.length>0&&hLeft[0].id===eR.id)
      hMatches.push({left:eL,right:eR,gapL:gap,pivot:mr,gapR:gapToLeft,kind:'chain-right',idealX:eR.x+eR.w+gap});
    // chain-left: moving element comes before the pair — require nearest-right neighbour IS eL
    if(gapToRight!==null&&Math.abs(gapToRight-gap)<=SP_TOL&&gapToRight>=-2&&hRight.length>0&&hRight[0].id===eL.id)
      hMatches.push({left:mr,gapL:gapToRight,right:eL,pivot2:eR,gapR:gap,kind:'chain-left',idealX:eL.x-gap-mr.w});
  });
  const hBest=hMatches.find(m=>m.kind==='between')||hMatches[0];
  let hDraw=null;
  if(hBest&&hBest.idealX!==undefined){
    const d=Math.round(hBest.idealX-mr.x);
    if(Math.abs(d)<=SG_SNAP){snapDx=d;hDraw=hBest;}
  }

  [hDraw].filter(Boolean).forEach(m=>{
    const mr2={...mr,x:mr.x+snapDx};
    if(m.kind==='between'){
      const L=m.left,R=m.right;
      const y1=Math.min(L.y,mr2.y,R.y),y2=Math.max(L.y+L.h,mr2.y+mr2.h,R.y+R.h);
      const midY=(y1+y2)/2;
      _sgLine(svg,L.x+L.w,midY,mr2.x,midY,SG_COLORS.spacing,'spacing');
      _sgTickH(svg,L.x+L.w,midY);_sgTickH(svg,mr2.x,midY);
      _sgLabel(svg,(L.x+L.w+mr2.x)/2,midY,Math.round(mr2.x-(L.x+L.w))+'px');
      _sgLine(svg,mr2.x+mr2.w,midY,R.x,midY,SG_COLORS.spacing,'spacing');
      _sgTickH(svg,mr2.x+mr2.w,midY);_sgTickH(svg,R.x,midY);
      _sgLabel(svg,(mr2.x+mr2.w+R.x)/2,midY,Math.round(R.x-(mr2.x+mr2.w))+'px');
    } else if(m.kind==='chain-right'){
      const y=Math.min(m.left.y,m.right.y,mr2.y)+Math.max(m.left.h,m.right.h,mr2.h)/2;
      _sgLine(svg,m.left.x+m.left.w,y,m.right.x,y,SG_COLORS.spacing,'spacing');
      _sgLine(svg,m.right.x+m.right.w,y,mr2.x,y,SG_COLORS.spacing,'spacing');
      [m.left.x+m.left.w,m.right.x,m.right.x+m.right.w,mr2.x].forEach(xp=>_sgTickH(svg,xp,y));
      _sgLabel(svg,(m.left.x+m.left.w+m.right.x)/2,y,Math.round(m.gapL)+'px');
      _sgLabel(svg,(m.right.x+m.right.w+mr2.x)/2,y,Math.round(m.gapR)+'px');
    } else if(m.kind==='chain-left'){
      const y=Math.min(mr2.y,m.right.y,m.pivot2.y)+Math.max(mr2.h,m.right.h,m.pivot2.h)/2;
      _sgLine(svg,mr2.x+mr2.w,y,m.right.x,y,SG_COLORS.spacing,'spacing');
      _sgLine(svg,m.right.x+m.right.w,y,m.pivot2.x,y,SG_COLORS.spacing,'spacing');
      [mr2.x+mr2.w,m.right.x,m.right.x+m.right.w,m.pivot2.x].forEach(xp=>_sgTickH(svg,xp,y));
      _sgLabel(svg,(mr2.x+mr2.w+m.right.x)/2,y,Math.round(m.gapL)+'px');
      _sgLabel(svg,(m.right.x+m.right.w+m.pivot2.x)/2,y,Math.round(m.gapR)+'px');
    }
  });

  // ── Vertical spacing ──
  const vSorted=[...others].sort((a,b)=>a.y-b.y);
  const existingVGaps=[];
  for(let i=0;i<vSorted.length-1;i++){
    const gap=vSorted[i+1].y-(vSorted[i].y+vSorted[i].h);
    if(gap>=0) existingVGaps.push({gap,above:vSorted[i],below:vSorted[i+1]});
  }
  const vAbove=others.filter(o=>o.y+o.h<=mr.y).sort((a,b)=>(b.y+b.h)-(a.y+a.h));
  const vBelow=others.filter(o=>o.y>=mr.y+mr.h).sort((a,b)=>a.y-b.y);
  const gapToAbove=vAbove.length ? mr.y-(vAbove[0].y+vAbove[0].h) : null;
  const gapToBelow=vBelow.length ? vBelow[0].y-(mr.y+mr.h)        : null;

  const vMatches=[];
  if(gapToAbove!==null&&gapToBelow!==null&&Math.abs(gapToAbove-gapToBelow)<=SP_TOL&&gapToAbove>=-2&&gapToBelow>=-2){
    const ideal=(vAbove[0].y+vAbove[0].h+vBelow[0].y-mr.h)/2;
    vMatches.push({above:vAbove[0],below:vBelow[0],gapA:gapToAbove,gapB:gapToBelow,kind:'between',idealY:ideal});
  }
  existingVGaps.forEach(({gap,above:eA,below:eB})=>{
    // chain-below: moving element comes below the pair — require nearest-above neighbour IS eB
    if(gapToAbove!==null&&Math.abs(gapToAbove-gap)<=SP_TOL&&gapToAbove>=-2&&vAbove.length>0&&vAbove[0].id===eB.id)
      vMatches.push({above:eA,below:eB,gapA:gap,pivot:mr,gapB:gapToAbove,kind:'chain-below',idealY:eB.y+eB.h+gap});
    // chain-above: moving element comes above the pair — require nearest-below neighbour IS eA
    if(gapToBelow!==null&&Math.abs(gapToBelow-gap)<=SP_TOL&&gapToBelow>=-2&&vBelow.length>0&&vBelow[0].id===eA.id)
      vMatches.push({above:mr,gapA:gapToBelow,below:eA,pivot2:eB,gapB:gap,kind:'chain-above',idealY:eA.y-gap-mr.h});
  });
  const vBest=vMatches.find(m=>m.kind==='between')||vMatches[0];
  let vDraw=null;
  if(vBest&&vBest.idealY!==undefined){
    const d=Math.round(vBest.idealY-mr.y);
    if(Math.abs(d)<=SG_SNAP){snapDy=d;vDraw=vBest;}
  }

  [vDraw].filter(Boolean).forEach(m=>{
    const mr2={...mr,y:mr.y+snapDy};
    if(m.kind==='between'){
      const A=m.above,B=m.below;
      const x1=Math.min(A.x,mr2.x,B.x),x2=Math.max(A.x+A.w,mr2.x+mr2.w,B.x+B.w);
      const midX=(x1+x2)/2;
      _sgLine(svg,midX,A.y+A.h,midX,mr2.y,SG_COLORS.spacing,'spacing');
      _sgTickV(svg,midX,A.y+A.h);_sgTickV(svg,midX,mr2.y);
      _sgLabel(svg,midX+18,(A.y+A.h+mr2.y)/2,Math.round(mr2.y-(A.y+A.h))+'px');
      _sgLine(svg,midX,mr2.y+mr2.h,midX,B.y,SG_COLORS.spacing,'spacing');
      _sgTickV(svg,midX,mr2.y+mr2.h);_sgTickV(svg,midX,B.y);
      _sgLabel(svg,midX+18,(mr2.y+mr2.h+B.y)/2,Math.round(B.y-(mr2.y+mr2.h))+'px');
    } else if(m.kind==='chain-below'){
      const x=Math.min(m.above.x,m.below.x,mr2.x)+Math.max(m.above.w,m.below.w,mr2.w)/2;
      _sgLine(svg,x,m.above.y+m.above.h,x,m.below.y,SG_COLORS.spacing,'spacing');
      _sgLine(svg,x,m.below.y+m.below.h,x,mr2.y,SG_COLORS.spacing,'spacing');
      [m.above.y+m.above.h,m.below.y,m.below.y+m.below.h,mr2.y].forEach(yp=>_sgTickV(svg,x,yp));
      _sgLabel(svg,x+16,(m.above.y+m.above.h+m.below.y)/2,Math.round(m.gapA)+'px');
      _sgLabel(svg,x+16,(m.below.y+m.below.h+mr2.y)/2,Math.round(m.gapB)+'px');
    } else if(m.kind==='chain-above'){
      const x=Math.min(mr2.x,m.below.x,m.pivot2.x)+Math.max(mr2.w,m.below.w,m.pivot2.w)/2;
      _sgLine(svg,x,mr2.y+mr2.h,x,m.below.y,SG_COLORS.spacing,'spacing');
      _sgLine(svg,x,m.below.y+m.below.h,x,m.pivot2.y,SG_COLORS.spacing,'spacing');
      [mr2.y+mr2.h,m.below.y,m.below.y+m.below.h,m.pivot2.y].forEach(yp=>_sgTickV(svg,x,yp));
      _sgLabel(svg,x+16,(mr2.y+mr2.h+m.below.y)/2,Math.round(m.gapA)+'px');
      _sgLabel(svg,x+16,(m.below.y+m.below.h+m.pivot2.y)/2,Math.round(m.gapB)+'px');
    }
  });

  return {dx:snapDx, dy:snapDy};
}
function _sgTickH(svg, x, y){
  _sgLine(svg, x, y-5, x, y+5, SG_COLORS.spacing, 'spacing');
}
function _sgTickV(svg, x, y){
  _sgLine(svg, x-5, y, x+5, y, SG_COLORS.spacing, 'spacing');
}

/* Helper: build a rect from any element for guide use */
function _elRect(el){
  if(!el) return null;
  if(el.type==='er-line'||el.type==='sym-arrow'){
    return{x:Math.min(el.x1,el.x2),y:Math.min(el.y1,el.y2),
           w:Math.max(4,Math.abs(el.x2-el.x1)),h:Math.max(4,Math.abs(el.y2-el.y1))};
  }
  if('x' in el) return{x:el.x||0,y:el.y||0,w:el.w||0,h:el.h||0};
  return null;
}

/* Build a bounding rect from a set of element ids */
function _groupRect(ids){
  let x1=Infinity,y1=Infinity,x2=-Infinity,y2=-Infinity;
  ids.forEach(id=>{
    const r=_elRect(getEl(id)); if(!r) return;
    x1=Math.min(x1,r.x); y1=Math.min(y1,r.y);
    x2=Math.max(x2,r.x+r.w); y2=Math.max(y2,r.y+r.h);
  });
  return isFinite(x1)?{x:x1,y:y1,w:x2-x1,h:y2-y1}:null;
}

/* ════════ TABELLE (Editor-Element) ════════ */
let _tblCur=null;   // zuletzt aktive Zelle {id,r,c}
function _tblDefault(r,c){
  return {cells:Array.from({length:r},(_,i)=>Array.from({length:c},(_,j)=>i?'':'Spalte '+(j+1))),
    header:true,striped:true,border:true,borderColor:'#3a362f',headBg:'#26221c',color:'#e4ddd0',fontSize:14,align:'left',pad:8};
}
function buildTableWidget(el,readOnly){
  const T=el.table||(el.table=_tblDefault(3,3));
  const wrap=document.createElement('div'); wrap.className='el-tbl-wrap';
  const tb=document.createElement('table'); tb.className='el-tbl'+(T.striped?' striped':'');
  tb.style.cssText=`--tb:${T.border?T.borderColor:'transparent'};--th:${T.headBg};--tc:${T.color};--tp:${T.pad}px;font-size:${T.fontSize}px;text-align:${T.align}`;
  T.cells.forEach((row,r)=>{
    const tr=tb.insertRow();
    row.forEach((txt,c)=>{
      const td=document.createElement(T.header&&r===0?'th':'td'); td.textContent=txt; tr.appendChild(td);
      if(readOnly)return;
      let pushed=false;
      td.contentEditable='true'; td.spellcheck=false;
      td.addEventListener('mousedown',ev=>{ ev.stopPropagation(); _tblCur={id:el.id,r,c}; });
      td.addEventListener('focus',()=>{ _tblCur={id:el.id,r,c}; });
      td.addEventListener('blur',()=>{ pushed=false; });
      td.addEventListener('input',()=>{
        if(!pushed){ pushHistory('Tabelle bearbeitet'); pushed=true; }
        const e=getEl(el.id); if(e&&e.table.cells[r]) e.table.cells[r][c]=td.innerText.replace(/\n$/,'');
        _tblFit(el.id);
      });
      td.addEventListener('paste',ev=>{ ev.preventDefault(); ev.stopPropagation(); document.execCommand('insertText',false,ev.clipboardData.getData('text/plain')); });
      td.addEventListener('keydown',ev=>{
        if(ev.key!=='Tab')return; ev.preventDefault(); ev.stopPropagation();
        const all=[...tb.querySelectorAll('th,td')], n=all[all.indexOf(td)+(ev.shiftKey?-1:1)]; if(n)n.focus();
      });
    });
  });
  wrap.appendChild(tb); return wrap;
}
function _tblFit(id){   // Elementhöhe an die Tabelle anpassen
  const d=document.getElementById('sel_'+id), e=getEl(id), t=d&&d.querySelector('.el-tbl'); if(!t||!e)return;
  e.h=Math.max(24,Math.ceil(t.offsetHeight)); d.style.height=e.h+'px';
}
function _tblEl(){ const e=selElId&&getEl(selElId); return e&&e.type==='table'?e:null; }
function _tblRender(e){
  const d=document.getElementById('sel_'+e.id), inn=d&&d.querySelector('.sel-in'); if(!inn)return;
  inn.replaceChildren(buildInnerContent(e,false)); _tblFit(e.id);
}
function tblOp(op){
  const e=_tblEl(); if(!e)return; const T=e.table, rows=T.cells.length, cols=T.cells[0].length;
  const cur=(_tblCur&&_tblCur.id===e.id&&_tblCur.r<rows&&_tblCur.c<cols)?_tblCur:{r:rows-1,c:cols-1};
  if((op==='delRow'&&rows<2)||(op==='delCol'&&cols<2))return;
  pushHistory('Tabelle geändert');
  if(op==='addRow')T.cells.splice(cur.r+1,0,Array(cols).fill(''));
  else if(op==='addCol')T.cells.forEach(r=>r.splice(cur.c+1,0,''));
  else if(op==='delRow')T.cells.splice(cur.r,1);
  else if(op==='delCol')T.cells.forEach(r=>r.splice(cur.c,1));
  _tblCur=null; _tblRender(e); _tblSync(e);
}
function tblSet(k,v){
  const e=_tblEl(); if(!e||(k==='fontSize'&&!(v>=8))||(k==='pad'&&!(v>=0)))return;
  pushHistoryDebounced('Tabelle geändert'); e.table[k]=v; _tblRender(e);
}
function _tblSync(e){
  const T=e.table, g=id=>document.getElementById(id);
  g('tblHead').checked=!!T.header; g('tblStripe').checked=!!T.striped; g('tblBorder').checked=!!T.border;
  g('tblBorderCol').value=T.borderColor; g('tblHeadBg').value=T.headBg; g('tblColor').value=T.color;
  g('tblFs').value=T.fontSize; g('tblPad').value=T.pad; g('tblAlign').value=T.align;
  g('tblDim').textContent=T.cells.length+' Zeilen × '+T.cells[0].length+' Spalten · Zelle anklicken, dann daneben Zeile/Spalte einfügen oder entfernen. Tab springt zur nächsten Zelle.';
}

/* ════════ AUTOSAVE-ENTWURF: beim Schließen der Seite sichern, beim erneuten Öffnen anbieten ════════ */
const _DRAFT_PFX='ft_draft_';
function draftClear(id){ try{ localStorage.removeItem(_DRAFT_PFX+id); }catch(e){} }
function _draftWrite(){
  if(!edEntry)return;
  try{
    flushEl(true);
    if(!hasChanges()){ draftClear(edEntry.id); return; }
    const v=id=>document.getElementById(id).value;
    const entry=Object.assign({},edEntry,{titel:v('sldEntryTitle').trim()||'Neuer Eintrag',datum:v('sldDate'),q:v('sldQ'),
      tags:v('sldTags').split(',').map(t=>t.trim()).filter(Boolean)});
    localStorage.setItem(_DRAFT_PFX+edEntry.id,JSON.stringify({ts:Date.now(),slideIdx:edSlideIdx,entry}));
  }catch(e){}   // z. B. Speicher voll (große Bilder) – dann bleibt nur der gespeicherte Stand
}
window.addEventListener('pagehide',_draftWrite);
window.addEventListener('beforeunload',_draftWrite);   // bewusst ohne Rückfrage
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden')_draftWrite(); });
function _draftRestore(d){
  if(!edEntry||edEntry.id!==d.entry.id)return;
  edEntry=d.entry; edSlideIdx=Math.min(d.slideIdx||0,edEntry.slides.length-1);
  selElId=null; activeRTBEl=null; _clearHistory();
  zMax=Math.max(10,...(curSlide()?.elements||[]).map(e=>e.z||0));
  document.getElementById('sldEntryTitle').value=edEntry.titel||'';
  document.getElementById('sldDate').value=edEntry.datum||'';
  document.getElementById('sldQ').value=edEntry.q||'Q2';
  document.getElementById('sldTags').value=(edEntry.tags||[]).join(', ');
  document.getElementById('edBarTitle').textContent=edEntry.titel||'Neuer Eintrag';
  populateSlideMeta(); renderSlide(); renderSpanel(); setTimeout(fitSlide,50);
}
function _draftOffer(){
  let d=null; try{ d=JSON.parse(localStorage.getItem(_DRAFT_PFX+edEntry.id)||'null'); }catch(e){}
  if(!d||!d.entry||!Array.isArray(d.entry.slides))return;
  const m=document.createElement('div'); m.className='modal-overlay'; m.style.zIndex=5000;
  const when=new Date(d.ts).toLocaleString('de-DE',{dateStyle:'medium',timeStyle:'short'});
  m.innerHTML=`<div class="modal-box"><div class="modal-title">Ungespeicherte Änderungen</div>
    <p style="color:var(--text2);font-size:13px;margin:0 0 16px">Beim letzten Verlassen dieses Eintrags (${when}) wurden deine Änderungen automatisch gesichert. Möchtest du sie beibehalten?</p>
    <div class="modal-acts" style="flex-direction:column;gap:8px"><button class="modal-btn-pri" data-a="keep">Änderungen beibehalten</button><button class="modal-btn-sec" data-a="drop">Verwerfen</button></div></div>`;
  m.addEventListener('click',ev=>{
    const a=ev.target.dataset&&ev.target.dataset.a; if(!a)return;
    if(a==='keep')_draftRestore(d); else draftClear(d.entry.id);
    m.remove();
  });
  document.body.appendChild(m);
}

/* ════════ FARBSCHEMA: Hell · Dunkel · Blau (Auswahl wird gemerkt) ════════ */
function setTheme(t){
  if(!['light','dark','blue'].includes(t)) t='blue';
  const root=document.documentElement;
  root.classList.add('theme-anim'); clearTimeout(setTheme._t); setTheme._t=setTimeout(()=>root.classList.remove('theme-anim'),380);
  root.setAttribute('data-theme',t);
  try{ localStorage.setItem('ft_theme',t); }catch(e){}
  document.querySelectorAll('[data-theme-set]').forEach(b=>{ const on=b.dataset.themeSet===t; b.classList.toggle('on',on); b.setAttribute('aria-pressed',on?'true':'false'); });
}
setTheme(document.documentElement.getAttribute('data-theme')||'dark');


/* ════════ EDITOR-SEITENLEISTEN: Docking, Einklappen, ruhige Folie ════════ */
let _cvKeep=null,_cvKeepT=0;
/* Hält die Folie auf dem Bildschirm still, während sich Leisten ändern */
function _keepStill(fn){
  const r=document.getElementById('edCvArea').getBoundingClientRect();
  _cvKeep={x:r.left+cvOffX,y:r.top+cvOffY};
  clearTimeout(_cvKeepT); _cvKeepT=setTimeout(()=>{_cvKeep=null;},420);
  fn(); requestAnimationFrame(_syncKeep);
}
function _syncKeep(){
  if(!_cvKeep)return;
  const r=document.getElementById('edCvArea').getBoundingClientRect();
  cvOffX=_cvKeep.x-r.left; cvOffY=_cvKeep.y-r.top; applyTf();
}
function toggleEdSb(){ _keepStill(()=>document.getElementById('edSb').classList.toggle('collapsed')); _dockChev(); }
function toggleSpPanel(){ _keepStill(()=>document.getElementById('spPanel').classList.toggle('collapsed')); _dockChev(); }

let _dock={ed:'left',sp:'left'};
const _DOCK_SIDES=['left','top','right','bottom'];
const _DOCK_PTS={left:['15 18 9 12 15 6','9 18 15 12 9 6'],right:['9 18 15 12 9 6','15 18 9 12 15 6'],
  top:['18 15 12 9 6 15','6 9 12 15 18 9'],bottom:['6 9 12 15 18 9','18 15 12 9 6 15']};
function _dockChev(){
  [['ed','edSb','edSbCollapseIco'],['sp','spPanel','spCollapseIco']].forEach(([k,pid,iid])=>{
    const col=document.getElementById(pid).classList.contains('collapsed'), P=_DOCK_PTS[_dock[k]];
    document.querySelectorAll('#'+iid+' polyline').forEach(p=>p.setAttribute('points',P[col?1:0]));
    document.querySelectorAll('#'+pid+' ~ .ed-sb-expand-strip polyline,#'+pid+' ~ .sp-expand-strip polyline').forEach(p=>p.setAttribute('points',P[col?1:0]));
    const st=document.querySelector('#'+pid+' ~ .ed-sb-expand-strip,#'+pid+' ~ .sp-expand-strip');
    if(st){st.title=(k==='ed'?'Seitenleiste':'Folien-Panel')+(col?' ausklappen':' einklappen'); st.setAttribute('aria-expanded',col?'false':'true');}
  });
}
function _dockSyncUI(){
  const a=document.getElementById('settingsDockEd'), b=document.getElementById('settingsDockSp');
  if(a)a.value=_dock.ed; if(b)b.value=_dock.sp;
}
function _dockApply(){
  const body=document.getElementById('edBody'); if(!body)return;
  [['ed','dkEd'],['sp','dkSp']].forEach(([k,id])=>{
    const d=document.getElementById(id), lane=body.querySelector('.dk-'+_dock[k]);
    d.dataset.side=_dock[k]; lane.appendChild(d);
  });
  _dockChev(); _dockSyncUI();
}
function setDock(k,side){
  if(!_DOCK_SIDES.includes(side)||!(k in _dock))return;
  _dock[k]=side;
  try{localStorage.setItem('ft_dock',JSON.stringify(_dock));}catch(e){}
  if(document.getElementById('editorView').classList.contains('open')) _keepStill(_dockApply); else _dockApply();
}
function initDock(){
  const body=document.getElementById('edBody'); if(!body||document.getElementById('dkEd'))return;
  try{const o=JSON.parse(localStorage.getItem('ft_dock')||'{}'); ['ed','sp'].forEach(k=>{if(_DOCK_SIDES.includes(o[k]))_dock[k]=o[k];});}catch(e){}
  const mk=(id,els)=>{const d=document.createElement('div'); d.className='dk'; d.id=id; els.forEach(e=>e&&d.appendChild(e)); return d;};
  const dkEd=mk('dkEd',[document.getElementById('edSb'),body.querySelector(':scope > .ed-sb-expand-strip')]);
  const dkSp=mk('dkSp',[document.getElementById('spPanel'),document.getElementById('spExpandStrip')]);
  _DOCK_SIDES.forEach(sd=>{const l=document.createElement('div'); l.className='dk-lane dk-'+sd; body.appendChild(l);});
  body.querySelector('.dk-left').append(dkEd,dkSp);
  _dockApply();
}
initDock();

/* ════════ RECHTSKLICK-STANDARDWERTE FÜR ALLE ELEMENTE ════════
   Kinds: r=Regler (min,max,Std) · c=Farbe · s=Ausrichtung · b=Schalter. Gilt für neu eingefügte Elemente. */
const _AL=[['left','Links'],['center','Mitte'],['right','Rechts']];
const _EL_SCH={
  title:[['fontSize','Größe','r',18,96,34],['color','Farbe','c','#e4ddd0'],['textAlign','Ausrichtung','s','left']],
  text:[['fontSize','Größe','r',10,36,14],['color','Farbe','c','#888077'],['textAlign','Ausrichtung','s','left']],
  code:[['fontSize','Größe','r',9,28,13],['color','Text','c','#7dd3fc'],['background','Hintergrund','c','#030303'],['borderRadius','Radius','r',0,30,8]],
  sql:[['fontSize','Größe','r',9,28,13],['color','Text','c','#a3e635'],['background','Hintergrund','c','#030303'],['borderRadius','Radius','r',0,30,8]],
  image:[['borderRadius','Radius','r',0,60,4],['borderWidth','Rahmen','r',0,10,0],['borderColor','Farbe','c','#888077']],
  divider:[['lineColor','Farbe','c','#e8a030'],['lineWidth','Stärke','r',1,12,2]],
  badge:[['badgeFg','Text','c','#e8a030'],['badgeBg','Füllung','c','#2a2112'],['badgeBd','Rand','c','#e8a030']],
  table:[['header','Kopfzeile','b',true],['striped','Zebra','b',true]],
  regmachine:[['fontSize','Größe','r',10,18,12]]
};
const _elDef={};
function showElStylePop(ev,type){
  ev.preventDefault(); ev.stopPropagation(); _closeAllStylePops();
  const btn=ev.currentTarget;
  let pop=document.getElementById('elStylePop');
  if(!pop){pop=document.createElement('div'); pop.id='elStylePop'; pop.className='marker-style-pop'; document.body.appendChild(pop);}
  const D=_elDef[type]||(_elDef[type]={});
  pop.innerHTML='<div class="msp-hd"><span style="flex:1">'+esc(typeLabel(type))+' · Standardwerte</span></div>';
  if(type==='table')pop.appendChild(_tblPicker());
  (_EL_SCH[type]||[]).forEach(t=>{
    const [k,lbl,kind]=t, def=kind==='r'?t[5]:t[3], cur=k in D?D[k]:def;
    const row=document.createElement('div'); row.className='msp-row'; row.innerHTML='<span class="msp-lbl">'+lbl+'</span>';
    let i;
    if(kind==='r'){
      i=document.createElement('input'); i.type='range'; i.className='msp-range'; i.min=t[3]; i.max=t[4]; i.value=cur;
      const v=document.createElement('span'); v.className='msp-val'; v.textContent=cur+'px';
      i.oninput=()=>{D[k]=+i.value; v.textContent=i.value+'px';}; row.append(i,v);
    } else if(kind==='c'){
      i=document.createElement('input'); i.type='color'; i.className='msp-color'; i.value=cur; i.oninput=()=>{D[k]=i.value;}; row.appendChild(i);
    } else if(kind==='s'){
      i=document.createElement('select'); i.className='msp-sel'; i.innerHTML=_AL.map(a=>'<option value="'+a[0]+'">'+a[1]+'</option>').join(''); i.value=cur; i.onchange=()=>{D[k]=i.value;}; row.appendChild(i);
    } else {
      i=document.createElement('input'); i.type='checkbox'; i.checked=!!cur; i.style.accentColor='var(--gold)'; i.onchange=()=>{D[k]=i.checked;}; row.appendChild(i);
    }
    pop.appendChild(row);
  });
  const hint=document.createElement('div'); hint.className='msp-val'; hint.style.cssText='text-align:left;margin-top:4px'; hint.textContent='Gilt für neu eingefügte Elemente'; pop.appendChild(hint);
  _popPosition(pop,btn);
}
/* Tabellengröße wie in Word: Raster 10 × 8, Klick fügt die Tabelle ein */
function _tblPicker(){
  const box=document.createElement('div'), lbl=document.createElement('div'), g=document.createElement('div'), cells=[];
  lbl.className='msp-val'; lbl.style.cssText='text-align:center;margin-bottom:6px'; lbl.textContent='Tabelle einfügen'; g.className='tbl-pick';
  for(let r=1;r<=8;r++)for(let c=1;c<=10;c++){const d=document.createElement('div'); d.className='tbl-pc'; d.dataset.r=r; d.dataset.c=c; cells.push(d); g.appendChild(d);}
  g.onmouseover=e=>{const t=e.target; if(!t.dataset||!t.dataset.r)return; const r=+t.dataset.r, c=+t.dataset.c;
    cells.forEach(x=>x.classList.toggle('on',+x.dataset.r<=r&&+x.dataset.c<=c)); lbl.textContent=c+' × '+r+' Tabelle';};
  g.onmouseleave=()=>{cells.forEach(x=>x.classList.remove('on')); lbl.textContent='Tabelle einfügen';};
  g.onclick=e=>{const t=e.target; if(!t.dataset||!t.dataset.r)return; _closeAllStylePops(); _insTable(+t.dataset.r,+t.dataset.c);};
  box.append(lbl,g); return box;
}
function _insTable(r,c){
  addEl('table');
  const sl=curSlide(), e=sl&&sl.elements[sl.elements.length-1]; if(!e||e.type!=='table')return;
  Object.assign(e.table=_tblDefault(r,c),_elDef.table||{});
  e.w=Math.min(slSz(sl).w-120,Math.max(420,c*96));
  const d=document.getElementById('sel_'+e.id); if(d)d.style.width=e.w+'px';
  _tblRender(e);
}
const _addElBase=addEl;
addEl=function(type){
  _addElBase(type);
  const D=_elDef[type]; if(!D||!Object.keys(D).length)return;
  const sl=curSlide(), e=sl&&sl.elements[sl.elements.length-1]; if(!e||e.type!==type)return;
  if(type==='table'&&e.table)Object.assign(e.table,D); else e.style=Object.assign(e.style||{},D);
  renderSlide(); selectEl(e.id); renderSpanel();
};

/* ════════ REGISTERMASCHINE mit Ablaufprotokoll ════════
   Akkumulator A, Register R1…Rn. Operanden: #5 = Konstante, 3 = Register R3, *3 = indirekt (Adresse steht in R3).
   Befehle: LOAD STORE ADD SUB MUL DIV MOD · JUMP JZERO JNZ JGTZ JGEZ JLTZ JLEZ · END. Labels: „name:“ oder Zeilennummer. */
const _RM_DEF='; R3 = R1 · R2 (Multiplikation durch wiederholtes Addieren)\nLOAD #0\nSTORE 3\nschleife: LOAD 2\nJZERO ende\nSUB #1\nSTORE 2\nLOAD 3\nADD 1\nSTORE 3\nJUMP schleife\nende: END';
function _rmParse(src){
  const ins=[], lab={}, err=[];
  String(src).split('\n').forEach((raw,k)=>{
    let t=raw.replace(/(;|\/\/).*$/,'').trim(); if(!t)return;
    let m=t.match(/^([A-Za-zÄÖÜäöüß_][\wÄÖÜäöüß]*)\s*:\s*(.*)$/);
    if(m){lab[m[1].toLowerCase()]=ins.length; t=m[2].trim(); if(!t)return;}
    m=t.match(/^([A-Za-z]+)\s*(.*)$/);
    if(!m){err.push('Zeile '+(k+1)+': Befehl nicht lesbar'); return;}
    ins.push({op:m[1].toUpperCase(),arg:m[2].trim(),text:t,ln:k+1});
  });
  return {ins,lab,err};
}
function _rmRun(src,init){
  const P=_rmParse(src), R={}, seen=new Set(), rows=[], err=P.err.slice(); let A=0, pc=0, msg='';
  String(init||'').replace(/R?(\d+)\s*[=:]\s*(-?\d+)/gi,(_,i,v)=>{R[+i]=+v; seen.add(+i);});
  const snap=(bz,text)=>rows.push({bz,text,A,R:Object.assign({},R)});
  const ix=a=>{const n=parseInt(String(a).replace(/^R/i,''),10); if(isNaN(n)||n<0)throw new Error('Ungültige Adresse „'+a+'“'); seen.add(n); return n;};
  const adr=a=>{if(a[0]==='*'){const t=R[ix(a.slice(1))]||0; seen.add(t); return t;} return ix(a);};
  const val=a=>{if(a[0]==='#'){const n=parseInt(a.slice(1),10); if(isNaN(n))throw new Error('Ungültige Konstante „'+a+'“'); return n;} return R[adr(a)]||0;};
  const tgt=a=>{const k=a.toLowerCase(); if(k in P.lab)return P.lab[k]; if(/^\d+$/.test(a)&&+a>=1&&+a<=P.ins.length)return +a-1; throw new Error('Unbekanntes Sprungziel „'+a+'“');};
  const J={JZERO:x=>x===0,JZ:x=>x===0,JEQ:x=>x===0,JNZ:x=>x!==0,JNE:x=>x!==0,JGTZ:x=>x>0,JGT:x=>x>0,JGEZ:x=>x>=0,JGE:x=>x>=0,JLTZ:x=>x<0,JLT:x=>x<0,JLEZ:x=>x<=0,JLE:x=>x<=0};
  snap(1,'Start');
  try{
    for(let n=0;;n++){
      if(n>=500){err.push('Abbruch nach 500 Schritten – Endlosschleife?'); break;}
      if(pc>=P.ins.length){msg='Programmende erreicht'; break;}
      const I=P.ins[pc], o=I.op, a=I.arg; let next=pc+1;
      if(o==='END'||o==='HALT'||o==='STOP'){snap(pc+1,I.text); msg='END erreicht'; break;}
      else if(o==='LOAD')A=val(a);
      else if(o==='STORE')R[adr(a)]=A;
      else if(o==='ADD')A+=val(a);
      else if(o==='SUB')A-=val(a);
      else if(o==='MUL'||o==='MULT')A*=val(a);
      else if(o==='DIV'||o==='MOD'){const d=val(a); if(d===0)throw new Error('Division durch 0 (Zeile '+I.ln+')'); A=o==='DIV'?Math.trunc(A/d):A%d;}
      else if(o==='JUMP'||o==='JMP'||o==='GOTO')next=tgt(a);
      else if(J[o])next=J[o](A)?tgt(a):pc+1;
      else throw new Error('Unbekannter Befehl „'+o+'“ (Zeile '+I.ln+')');
      snap(pc+1,I.text); pc=next;
    }
  }catch(e){err.push(e.message);}
  return {rows,regs:[...seen].sort((x,y)=>x-y),err,msg,steps:rows.length-1};
}
function _rmTable(r){
  const th=['Schritt','BZ','Befehl','A'].concat(r.regs.map(i=>'R'+i)).map((x,k)=>'<th'+(k===2?' class="l"':'')+'>'+x+'</th>').join('');
  const tr=r.rows.map((w,k)=>{
    const p=k?r.rows[k-1]:w, ch=(a,b)=>(k&&a!==b)?' class="ch"':'';
    return '<tr><td>'+k+'</td><td>'+w.bz+'</td><td class="l">'+esc(w.text)+'</td><td'+ch(w.A,p.A)+'>'+w.A+'</td>'
      +r.regs.map(i=>'<td'+ch(w.R[i]||0,p.R[i]||0)+'>'+(w.R[i]||0)+'</td>').join('')+'</tr>';
  }).join('');
  return '<table class="rm-t"><thead><tr>'+th+'</tr></thead><tbody>'+tr+'</tbody></table>';
}
function buildRegMachine(el,readOnly){
  const R=el.rm||(el.rm={prog:_RM_DEF,init:'R1=3, R2=4'}), st=el.style||{};
  const w=document.createElement('div'); w.className='rm-wrap'; w.style.fontSize=(st.fontSize||12)+'px'; w.style.color=st.color||'#e4ddd0';
  w.innerHTML='<div class="rm-top"><div class="rm-col" style="flex:1.6"><label>Programm</label><textarea class="rm-prog" spellcheck="false"></textarea></div>'
    +'<div class="rm-col" style="flex:1"><label>Startwerte</label><input class="rm-init" placeholder="R1=3, R2=4" spellcheck="false" autocomplete="off">'
    +'<div class="rm-hint">LOAD STORE ADD SUB MUL DIV MOD<br>JUMP JZERO JNZ JGTZ JGEZ JLTZ JLEZ · END<br>#5 Konstante · 3 = R3 · *3 indirekt<br>Label: <b>name:</b> · Kommentar: ;</div></div></div>'
    +'<div class="rm-st"></div><div class="rm-trace"></div>';
  const ta=w.querySelector('.rm-prog'), ini=w.querySelector('.rm-init'), tr=w.querySelector('.rm-trace'), stx=w.querySelector('.rm-st');
  ta.value=R.prog||''; ini.value=R.init||'';
  const run=()=>{
    const r=_rmRun(ta.value,ini.value); tr.innerHTML=_rmTable(r);
    stx.className='rm-st'+(r.err.length?' err':''); stx.textContent=r.err.length?r.err[0]:(r.msg+' · '+r.steps+' Schritte');
  };
  [ta,ini].forEach(i=>{
    if(readOnly){i.readOnly=true; return;}
    i.addEventListener('mousedown',e=>e.stopPropagation());
    i.addEventListener('keydown',e=>e.stopPropagation());
    i.addEventListener('input',()=>{pushHistoryDebounced('Registermaschine bearbeitet'); const a=getEl(el.id); if(a){a.rm=a.rm||{}; a.rm.prog=ta.value; a.rm.init=ini.value;} clearTimeout(i._t); i._t=setTimeout(run,180);});
  });
  run(); return w;
}

/* ════════ EDITOR v3: Kategorie-Tabs, Eintragstitel + Einstellungen in der Leiste ════════ */
const _INS_CATS=['inhalt','layout','formen','er','info']; let _insCat='inhalt';
function edTab(name){
  if(name==='ins')name=_insCat;
  const cat=_INS_CATS.includes(name), main=cat?'ins':name;
  if(cat)_insCat=name;
  ['ins','fmt'].forEach(n=>{document.getElementById('ep-'+n).style.display=n===main?'block':'none';});
  document.querySelectorAll('#edTabRow .ed-tab').forEach(b=>b.classList.toggle('act',b.dataset.t===name));
  if(cat)document.querySelectorAll('#ep-ins>[data-cat]').forEach(e=>e.classList.toggle('cat-off',e.dataset.cat!==name));
}
/* Abschnitte des Einfügen-Panels den Tabs zuordnen: Text+Code/Medien → Inhalt, Automaten+Rechnermodelle → Informatik */
function _tagInsCats(){
  const M={text:'inhalt',code:'inhalt',layout:'layout',symbole:'formen',er:'er',automaten:'info',rechner:'info'};
  let c='inhalt';
  document.querySelectorAll('#ep-ins>*').forEach(e=>{
    if(e.classList.contains('sec-hdr')){const t=e.textContent.trim().toLowerCase(); const k=Object.keys(M).find(x=>t.startsWith(x)); if(k)c=M[k];}
    e.dataset.cat=c;
  });
}
_tagInsCats(); edTab('ins');

/* Eintragstitel direkt in der Leiste bearbeiten */
function barTitleEdit(){
  const sp=document.getElementById('edBarTitle'); if(!sp||sp.dataset.editing)return;
  sp.dataset.editing='1';
  const i=document.createElement('input'); i.className='ed-bar-title ed-bar-title-inp'; i.value=edEntry.titel||''; i.placeholder='Neuer Eintrag';
  sp.style.display='none'; sp.after(i); i.focus(); i.select();
  const fin=ok=>{
    if(!sp.dataset.editing)return; delete sp.dataset.editing;
    if(ok){edEntry.titel=i.value; sp.textContent=i.value||'Neuer Eintrag'; const t=document.getElementById('sldEntryTitle'); if(t)t.value=i.value;}
    i.remove(); sp.style.display='';
  };
  i.onkeydown=e=>{e.stopPropagation(); if(e.key==='Enter')fin(true); else if(e.key==='Escape')fin(false);};
  i.onblur=()=>fin(true);
}
/* Eintrags-Einstellungen (Datum, Halbjahr, Tags …) als Popover am Zahnrad */
function toggleEntryPop(ev){
  ev.stopPropagation();
  const p=document.getElementById('entryPop'), b=document.getElementById('entryGear');
  if(p.style.display==='block'){p.style.display='none'; b.classList.remove('on'); return;}
  const r=b.getBoundingClientRect(); p.style.display='block'; b.classList.add('on');
  p.style.top=(r.bottom+8)+'px'; p.style.left=Math.max(8,Math.min(innerWidth-p.offsetWidth-8,r.left))+'px';
}
document.addEventListener('mousedown',e=>{
  const p=document.getElementById('entryPop');
  if(p&&p.style.display==='block'&&!p.contains(e.target)&&!e.target.closest('#entryGear')){p.style.display='none'; document.getElementById('entryGear').classList.remove('on');}
});

/* ════════ Journal-Ansicht: Titel und Datum per Klick bearbeiten ════════ */
function _inlineEdit(el,type,val,commit){
  if(el.dataset.ed)return; el.dataset.ed='1';
  const i=document.createElement('input'); i.type=type; i.value=val||''; i.className='e-inline-inp'+(type==='date'?' is-date':'');
  const prev=el.innerHTML; el.innerHTML=''; el.appendChild(i); i.focus();
  if(type==='date'){try{i.showPicker&&i.showPicker();}catch(_){}} else i.select();
  let done=false;
  const fin=ok=>{if(done)return; done=true; delete el.dataset.ed; if(ok&&i.value.trim()&&i.value!==val)commit(i.value.trim()); else el.innerHTML=prev;};
  i.onkeydown=ev=>{ev.stopPropagation(); if(ev.key==='Enter')fin(true); else if(ev.key==='Escape')fin(false);};
  i.onblur=()=>fin(true); if(type==='date')i.onchange=()=>fin(true);
}
function editETitle(id,el){const e=load().find(x=>x.id===id); if(e)_inlineEdit(el,'text',e.titel,v=>{e.titel=v; persist(load()); renderA(); renderL();});}
function editEDate(id,el){const e=load().find(x=>x.id===id); if(e)_inlineEdit(el,'date',e.datum,v=>{e.datum=v; persist(load()); renderA(); renderL();});}


/* Tags in der Journal-Ansicht: umbenennen (Klick), entfernen (×), hinzufügen (+ Tag, mehrere mit Komma) */
function _tagsDone(e,list){e.tags=[...new Set(list.map(t=>t.trim()).filter(Boolean))]; persist(load()); refreshAll();}
function editETag(id,ti,el){
  const e=load().find(x=>x.id===id); if(!e||!e.tags)return;
  _inlineEdit(el,'text',e.tags[ti],v=>{const l=e.tags.slice(); l[ti]=v; _tagsDone(e,l);});
  const i=el.querySelector('input'); if(i)i.classList.add('is-tag');
}
function delETag(id,ti){const e=load().find(x=>x.id===id); if(e&&e.tags)_tagsDone(e,e.tags.filter((_,k)=>k!==ti));}
function addETag(id,el){
  const e=load().find(x=>x.id===id); if(!e)return;
  _inlineEdit(el,'text','',v=>_tagsDone(e,(e.tags||[]).concat(v.split(','))));
  const i=el.querySelector('input'); if(i){i.classList.add('is-tag'); i.placeholder='Tag …';}
}


/* ════════ Folientitel (optional) + Folien-Kopf über der Folie ════════ */
/* Leer oder automatisch erzeugte „Folie N“ gelten als „kein Titel“ */
function slTitle(sl){const t=((sl&&sl.title)||'').trim(); return /^Folie \d+$/i.test(t)?'':t;}
/* Kopf (Titel, Format, Hintergrund) klebt direkt über der Folie und folgt Zoom und Verschieben */
function _posSlHdr(){
  const h=document.getElementById('slHdr'), a=document.getElementById('edCvArea'), sl=curSlide(); if(!h||!a||!sl)return;
  const wb=isWB(sl), aw=a.clientWidth, sw=wb?aw:slSz(sl).w*cvScale;
  const w=Math.min(aw-24,Math.max(940,sw)), cx=wb?aw/2:cvOffX+sw/2;
  const left=Math.max(12,Math.min(aw-w-12,cx-w/2)), top=wb?8:Math.max(8,cvOffY-h.offsetHeight-10);
  h.style.width=w+'px'; h.style.transform='translate('+left+'px,'+top+'px)';
}


/* ════════ Whiteboards: sichtbarer Ausschnitt statt 12000-px-Fläche ════════ */
function slView(sl){
  if(isWB(sl)){const b=wbBounds(sl); return {x:b.x,y:b.y,w:b.w,h:b.h};}
  const z=slSz(sl); return {x:0,y:0,w:z.w,h:z.h};
}
function wbThumbH(sl,tw){const v=slView(sl); return Math.max(Math.round(tw*.4),Math.min(Math.round(tw*.75),Math.round(tw*v.h/v.w)));}


/* Felder im Folien-Kopf (und das Titelfeld in der Leiste) verlieren den Fokus beim Klick daneben.
   Die Arbeitsfläche ruft bei mousedown preventDefault() auf (Lasso/Verschieben) – das hat den Fokuswechsel bisher verhindert. */
document.addEventListener('mousedown',e=>{
  const a=document.activeElement; if(!a||a===document.body)return;
  const hdr=a.closest&&a.closest('#slHdr');
  const away=hdr?!hdr.contains(e.target):(a.classList.contains('ed-bar-title-inp')&&e.target!==a);
  if(away)a.blur();
},true);

/* ════════ Wörter: eine Zählung für Folie und Eintrag ════════
   Zeilenumbrüche trennen Wörter; reine Satzzeichen/Pfeile zählen nicht; „Nr.2“ oder „usw.“ = 1 Wort (wie in Textverarbeitungen). */
function _wordsOf(html){
  const t=new DOMParser().parseFromString(String(html||'').replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr|\/td|\/th|\/blockquote)[^>]*>/gi,'$& '),'text/html').body.textContent||'';
  return t.split(/\s+/).filter(w=>/[\p{L}\p{N}]/u.test(w)).length;
}
function _elWords(el){
  const live=document.getElementById('sel_'+el.id)?.querySelector('.el-text');
  const html=live?live.innerHTML:el.html;
  return html?_wordsOf(html):0;
}
function updateWordCount(){
  const a=document.getElementById('edWordSlide'), b=document.getElementById('edWordEntry'); if(!a||!b||!edEntry)return;
  const cur=curSlide(), slides=edEntry.slides||[]; let sw=0, ew=0;
  slides.forEach(sl=>{const n=(sl.elements||[]).reduce((t,el)=>t+_elWords(el),0); ew+=n; if(sl===cur)sw=n;});
  a.textContent=sw.toLocaleString('de-DE'); b.textContent=ew.toLocaleString('de-DE');
  /* Anzeige bleibt kurz („Folie 120 · Eintrag 340“); ausgeschrieben steht es nur im Tooltip */
  a.parentNode.title=sw.toLocaleString('de-DE')+(sw===1?' Wort':' Wörter')+' in dieser Folie';
  b.parentNode.title=ew.toLocaleString('de-DE')+(ew===1?' Wort':' Wörter')+' im gesamten Forschungstagebucheintrag (alle Folien)';
}

/* ════════ HINTERGRUND FORMATIEREN (Folien-Kopf, rechts) ════════ */
const _BG_PRE=[{n:'Standard',a:'#0c0c0c'},{n:'Schwarz',a:'#000000'},{n:'Graphit',a:'#1c1e24'},{n:'Papier',a:'#f4efe4'},{n:'Weiß',a:'#ffffff'},
  {n:'Nachtblau',a:'#0f1b33',b:'#1d2f55',g:160},{n:'Waldgrün',a:'#0e1a14',b:'#1f3a2b',g:160},{n:'Abendrot',a:'#1a0f14',b:'#3d1c2c',g:150}];
/* strukturierte Daten; alte Folien (nur slideBg) werden abgeleitet */
function _bgOf(sl){
  if(sl.bg&&sl.bg.c1)return sl.bg;
  const v=sl.slideBg||'#0c0c0c';
  return {mode:'solid',c1:/^#[0-9a-f]{6}$/i.test(v)?v:'#0c0c0c',c2:'#1d2f55',angle:160};
}
const _bgCss=b=>b.mode==='gradient'?'linear-gradient('+b.angle+'deg,'+b.c1+','+b.c2+')':b.c1;
let _bgT=0;
function _bgEdit(mut,force){
  const sl=curSlide(); if(!sl)return;
  /* Zustand VOR der Änderung in die Edit History; Regler/Farbwähler = ein Eintrag pro Bedienung */
  if(force||!_bgT)pushHistory('Hintergrund geändert');
  clearTimeout(_bgT); _bgT=setTimeout(()=>{_bgT=0;},700);
  const b=Object.assign({},_bgOf(sl)); mut(b);
  sl.bg=b; sl.slideBg=_bgCss(b); applySlideSize(); _spRefresh();
}
function _bgFill(){
  const sl=curSlide(); if(!sl)return;
  const b=_bgOf(sl), sw=document.getElementById('slBgSw'), p=document.getElementById('bgPop');
  if(sw)sw.style.background=sl.slideBg||_bgCss(b);
  if(!p)return;
  p.classList.toggle('is-grad',b.mode==='gradient');
  p.querySelectorAll('.bg-seg button').forEach(x=>x.classList.toggle('on',x.dataset.m===b.mode));
  [['bgC1',b.c1],['bgC2',b.c2],['bgAng',b.angle]].forEach(([id,v])=>{const i=document.getElementById(id); if(i&&document.activeElement!==i)i.value=v;});
  document.getElementById('bgAngV').textContent=b.angle+'°';
}
function _bgPopBuild(){
  const p=document.createElement('div'); p.id='bgPop'; p.className='marker-style-pop bg-pop'; p.style.display='none';
  p.innerHTML='<div class="msp-hd"><span style="flex:1">Hintergrund formatieren</span></div>'
    +'<div class="bg-seg"><button type="button" data-m="solid">Einfarbig</button><button type="button" data-m="gradient">Verlauf</button></div>'
    +'<div class="bg-presets"></div>'
    +'<div class="msp-row"><span class="msp-lbl">Farbe</span><input type="color" class="msp-color" id="bgC1"></div>'
    +'<div class="msp-row bg-g"><span class="msp-lbl">Farbe 2</span><input type="color" class="msp-color" id="bgC2"></div>'
    +'<div class="msp-row bg-g"><span class="msp-lbl">Winkel</span><input type="range" class="msp-range" id="bgAng" min="0" max="360" step="5"><span class="msp-val" id="bgAngV"></span></div>'
    +'<div class="bg-foot"><button type="button" class="bg-reset">Zurücksetzen</button></div>';
  document.body.appendChild(p);
  const pre=p.querySelector('.bg-presets');
  _BG_PRE.forEach(x=>{
    const b=document.createElement('button'); b.type='button'; b.title=x.n;
    b.style.background=x.b?'linear-gradient('+(x.g||160)+'deg,'+x.a+','+x.b+')':x.a;
    b.onclick=()=>_bgEdit(o=>Object.assign(o,{mode:x.b?'gradient':'solid',c1:x.a,c2:x.b||o.c2,angle:x.g||o.angle}),true);
    pre.appendChild(b);
  });
  p.querySelectorAll('.bg-seg button').forEach(b=>b.onclick=()=>_bgEdit(o=>{o.mode=b.dataset.m;},true));
  p.querySelector('#bgC1').oninput=e=>_bgEdit(o=>{o.c1=e.target.value;});
  p.querySelector('#bgC2').oninput=e=>_bgEdit(o=>{o.c2=e.target.value;});
  p.querySelector('#bgAng').oninput=e=>_bgEdit(o=>{o.angle=+e.target.value;});
  p.querySelector('.bg-reset').onclick=()=>_bgEdit(o=>Object.assign(o,{mode:'solid',c1:'#0c0c0c'}),true);
  return p;
}
function toggleBgPop(ev){
  ev.stopPropagation();
  const p=document.getElementById('bgPop')||_bgPopBuild(), b=document.getElementById('slBgBtn');
  if(p.style.display==='block'){p.style.display='none'; b.classList.remove('on'); return;}
  _closeAllStylePops(); _bgFill();
  const r=b.getBoundingClientRect(); p.style.display='block'; b.classList.add('on');
  p.style.top=(r.bottom+8)+'px'; p.style.left=Math.max(8,Math.min(innerWidth-p.offsetWidth-8,r.right-p.offsetWidth))+'px';
}
document.addEventListener('mousedown',e=>{
  const p=document.getElementById('bgPop');
  if(p&&p.style.display==='block'&&!p.contains(e.target)&&!e.target.closest('#slBgBtn')){p.style.display='none'; document.getElementById('slBgBtn').classList.remove('on');}
},true);
