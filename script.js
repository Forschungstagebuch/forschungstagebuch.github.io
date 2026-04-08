/* ─── PASSWORDS ─── */
const PW={lehrer:'info2026',admin:'admin2026'};

/* ─── DEFAULT ENTRIES (Q2) ─── */
const DEFS=[
  {id:1,q:'Q2',datum:'2026-02-10',pos:10,
   titel:'Einführung in das Entity-Relationship-Modell (ERM)',
   tags:['ER-Modell','Datenbanken','Modellierung','Entitäten'],
   body:`Wir haben ein komplett neues Themengebiet gestartet: Datenbankmodellierung! Die erste Lektion war das Entity-Relationship-Modell (ERM), entwickelt von Peter Chen in den 1970er Jahren.

Das ERM dient dazu, die Struktur von Daten grafisch darzustellen – als Bauplan für eine Datenbank, bevor man anfängt zu programmieren.

Grundbausteine:
• Entität (Entity) – ein konkretes oder abstraktes Objekt der realen Welt (z.B. Schüler, Buch, Kurs)
• Attribut – eine Eigenschaft einer Entität (z.B. Name, Geburtsdatum, Titel)
• Beziehung (Relationship) – eine Verbindung zwischen Entitäten (z.B. „besucht", „hat")

In yEd haben wir unser erstes eigenes ER-Diagramm erstellt. Symbole: Rechtecke für Entitäten, Rauten für Beziehungen, Ellipsen für Attribute.`,
   code:`-- Erste Entitäten aus unserem Modell
Entität: Schüler     → Attribute: Name, Vorname, Geburtsdatum
Entität: Kurs        → Attribute: Titel, Ort
Entität: Tutor       → Attribute: Name, Telefon
Beziehung: besucht   → Schüler ↔ Kurs
Beziehung: hat       → Schüler ↔ Tutor`},

  {id:2,q:'Q2',datum:'2026-02-10',pos:20,
   titel:'Kardinalitäten: 1:1, 1:n und m:n Beziehungen',
   tags:['ER-Modell','Kardinalitäten','1:n','m:n','Beziehungen'],
   body:`Im selben Unterrichtsblock haben wir Kardinalitäten eingeführt – eines der wichtigsten Konzepte im ER-Modell.

Kardinalitäten beschreiben, wie viele Instanzen einer Entität mit wie vielen Instanzen einer anderen in Beziehung stehen können:

1:1 (eins-zu-eins)
Jede Entität A ist mit genau einer Entität B verknüpft und umgekehrt.
→ Beispiel: Person ↔ Personalausweis

1:n (eins-zu-viele)
Eine Entität A kann mit mehreren B verknüpft sein, aber jedes B gehört zu genau einem A.
→ Beispiel: Vermieter → Ferienwohnungen

m:n (viele-zu-viele)
Mehrere A können mit mehreren B verknüpft sein.
→ Beispiel: Schüler ↔ Kurs (ein Schüler besucht mehrere Kurse, ein Kurs hat mehrere Schüler)

Die Kardinalitäten werden in yEd an den Kanten des Diagramms eingetragen (1, m, n).`,
   code:`-- Kardinalitäten im ER-Modell:
Schüler ——[besucht]—— Kurs
   m                    n

Vermieter ——[vermietet]—— Ferienwohnung
    1                           n

Person ——[hat]—— Personalausweis
  1                    1`},

  {id:3,q:'Q2',datum:'2026-02-10',pos:30,
   titel:'ER-Modell-Übungen: 8 Alltagsszenarien',
   tags:['ER-Modell','Übungen','yEd','Praxis'],
   body:`In der Stunde haben wir intensiv an Übungsaufgaben gearbeitet und für 8 verschiedene Szenarien ER-Modelle in yEd erstellt (gespeichert als .graphml-Datei).

Die 8 Szenarien:
1. Schule – Schüler, Tutor, Zeugnis, Kurs (besucht, hat, bekommt)
2. Musikbibliothek – CD, Musikstück, Komponist (IS-A: Musikstück ist enthalten auf CD)
3. Ferienwohnung – Vermieter, Mieter, Ferienwohnung mit Attributen (Schlafzimmer, Saison-Preise, Kategorie, Gemeinde)
4. Kanzlei – Anwalt, Fall, Büro, Fachgebiet, Gerichtsstandort, Aktenzeichen
5. Handel – Zulieferer, Filiale, Computer (beliefert, kann)
6. Bibliothek – Buch, Person (hat ausgeliehen)
7. Freundschaftsnetz – Person ist befreundet mit Person (rekursive Beziehung!)
8. Handwerksbetrieb – Handwerker → IS-A → Installateur (Spezialisierung), Auftrag

Besonders interessant waren:
• Rekursive Beziehungen (eine Entität steht in Beziehung zu sich selbst)
• IS-A-Beziehungen (Vererbung/Spezialisierung wie in OOP)`,
   code:`-- IS-A Beziehung (Spezialisierung)
Handwerker
  IS-A ──▷ Installateur
(Installateur ist ein spezieller Handwerker)

-- Rekursive Beziehung
Person ——[ist befreundet mit]—— Person
          m                        n

-- Attribute der Ferienwohnung
Schlafzimmer | Personenanzahl | Kategorie
Nebensaisonpreis | Hauptsaisonpreis
Gemeinde | Beschreibung`},

  {id:4,q:'Q2',datum:'2026-02-17',pos:40,
   titel:'Vom ER-Modell zur relationalen Datenbank',
   tags:['Relationale DB','Transformation','Tabellen','Primärschlüssel','Fremdschlüssel'],
   body:`Heute haben wir den nächsten Schritt gelernt: Wie kommt man vom ER-Modell zu einer echten relationalen Datenbank?

Die Transformation folgt festen Regeln:

Regel 1 – Entität → Tabelle
Jede Entität wird zu einer eigenen Tabelle. Attribute werden zu Spalten. Das Schlüsselattribut wird zum PRIMARY KEY.

Regel 2 – 1:n-Beziehung → Fremdschlüssel
Der Primärschlüssel der „1"-Seite wird als FOREIGN KEY in die Tabelle der „n"-Seite übernommen.

Regel 3 – m:n-Beziehung → eigene Tabelle
Eine m:n-Beziehung bekommt eine eigene Zwischentabelle mit den Primärschlüsseln beider Entitäten als zusammengesetztem Primärschlüssel.

Regel 4 – IS-A
Kann als gemeinsame Tabelle oder als separate Unterklassen-Tabelle umgesetzt werden.

Wir haben das Schul-Modell vollständig transformiert und die SQL-Tabellenstruktur notiert.`,
   code:`-- Entität Schüler → Tabelle
CREATE TABLE Schueler (
    id          INT PRIMARY KEY,
    name        VARCHAR(80),
    vorname     VARCHAR(80),
    geburtsdatum DATE
);

-- 1:n Beziehung: Schüler bekommt Zeugnis
CREATE TABLE Zeugnis (
    id          INT PRIMARY KEY,
    schueler_id INT REFERENCES Schueler(id),
    datum       DATE,
    note        DECIMAL(3,1)
);

-- m:n Beziehung: Schüler besucht Kurs
CREATE TABLE Schueler_Kurs (
    schueler_id INT REFERENCES Schueler(id),
    kurs_id     INT REFERENCES Kurs(id),
    PRIMARY KEY (schueler_id, kurs_id)
);`}
];

/* ─── STATE ─── */
let curRole=null, editId=null, dragSrc=null;
let activeQ={lehrer:'Q2',admin:'Q2'};
let pwVis=false;

/* ─── STORAGE ─── */
function load(){
  try{const s=localStorage.getItem('ftb_v2');if(s)return JSON.parse(s);}catch(e){}
  const d=JSON.parse(JSON.stringify(DEFS));
  localStorage.setItem('ftb_v2',JSON.stringify(d));
  return d;
}
function persist(arr){localStorage.setItem('ftb_v2',JSON.stringify(arr));}

/* ─── AUTH ─── */
function toggleEye(){
  pwVis=!pwVis;
  const f=document.getElementById('pwf');
  f.type=pwVis?'text':'password';
  document.getElementById('eyeIco').innerHTML=pwVis
    ?'<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'
    :'<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
}

function onPwIn(){
  const v=document.getElementById('pwf').value;
  const h=document.getElementById('lhint');
  if(v===PW.lehrer) h.textContent='📖 Lehrer-Zugang erkannt';
  else if(v===PW.admin) h.textContent='⚙️ Admin-Zugang erkannt';
  else h.textContent='';
}

function doLogin(){
  const v=document.getElementById('pwf').value;
  const e=document.getElementById('lerr');
  if(v===PW.lehrer){curRole='lehrer';showView('lehrerView');refreshAll();}
  else if(v===PW.admin){curRole='admin';showView('adminView');refreshAll();}
  else{
    e.textContent='❌ Falsches Passwort.';
    e.classList.remove('shake');void e.offsetWidth;e.classList.add('shake');
  }
  document.getElementById('pwf').value='';
  document.getElementById('lhint').textContent='';
}
function logout(){curRole=null;showView('loginView');}
function showView(id){
  document.querySelectorAll('.view').forEach(v=>{v.classList.remove('active');v.style.display='none';});
  const t=document.getElementById(id);
  t.style.display=(id==='loginView')?'flex':'block';
  t.classList.add('active');
}

/* ─── SEARCH ─── */
function matches(e,q){
  if(!q)return true;
  q=q.toLowerCase();
  const d=new Date(e.datum+'T00:00:00');
  const ds=d.toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'});
  const ms=d.toLocaleDateString('de-DE',{month:'2-digit',year:'numeric'});
  const ml=d.toLocaleDateString('de-DE',{month:'long',year:'numeric'}).toLowerCase();
  return e.titel.toLowerCase().includes(q)||e.body.toLowerCase().includes(q)
    ||(e.code||'').toLowerCase().includes(q)
    ||(e.tags||[]).some(t=>t.toLowerCase().includes(q))
    ||ds.includes(q)||ms.includes(q)||ml.includes(q)||e.datum.replace(/-/g,'.').includes(q);
}

/* ─── QUARTER TABS ─── */
function buildQTabs(mode){
  const all=load();
  const el=document.getElementById(mode==='lehrer'?'qtL':'qtA');
  el.innerHTML=['Q1','Q2','Q3','Q4'].map(q=>{
    const has=all.some(e=>e.q===q);
    const act=activeQ[mode]===q?'act':'';
    const dot=has?'<span class="q-dot"></span>':'';
    return `<button class="q-tab ${act}" onclick="setQ('${mode}','${q}')">${q}${dot}</button>`;
  }).join('');
}
function setQ(mode,q){
  activeQ[mode]=q;
  buildQTabs(mode);
  if(mode==='lehrer')renderL();else renderA();
}

/* ─── FORMAT ─── */
function fmtD(s){return new Date(s+'T00:00:00').toLocaleDateString('de-DE',{day:'2-digit',month:'long',year:'numeric'});}
function fmtM(s){return new Date(s+'T00:00:00').toLocaleDateString('de-DE',{month:'long',year:'numeric'});}
function esc(s){return(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

/* ─── SORTED LIST ─── */
function getList(q,srch){
  return load().filter(e=>e.q===q&&matches(e,srch))
    .sort((a,b)=>(a.pos??999)-(b.pos??999)||(new Date(b.datum)-new Date(a.datum)));
}

/* ─── CARD HTML ─── */
function cardHTML(e,num,isAdmin){
  const tags=(e.tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join('');
  const code=e.code?`<div class="code-blk">${esc(e.code)}</div>`:'';
  const adm=isAdmin?`
    <div class="dh" title="Ziehen zum Sortieren">
      <div class="dd"></div><div class="dd"></div><div class="dd"></div>
      <div class="dd"></div><div class="dd"></div><div class="dd"></div>
    </div>
    <div class="e-acts">
      <button class="ib mv" title="Nach oben" onclick="moveE(${e.id},-1)">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="18 15 12 9 6 15"/></svg>
      </button>
      <button class="ib mv" title="Nach unten" onclick="moveE(${e.id},1)">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <button class="ib ed" title="Bearbeiten" onclick="openModal(${e.id})">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </button>
      <button class="ib dl" title="Löschen" onclick="delE(${e.id})">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
      </button>
    </div>`:'';
  return `
  <div class="ec${isAdmin?' adm-pad':''}" id="ec${e.id}" draggable="${isAdmin}" data-id="${e.id}">
    ${adm}
    <div class="e-top">
      <div class="e-meta">
        <span class="e-date">${fmtD(e.datum)}</span>
        <div class="e-tags">${tags}</div>
      </div>
      <span class="e-num">#${String(num).padStart(2,'0')}</span>
    </div>
    <div class="e-title">${esc(e.titel)}</div>
    <div class="e-body">${esc(e.body)}</div>
    ${code}
  </div>`;
}

/* ─── RENDER ─── */
function renderL(){
  const q=activeQ.lehrer, s=(document.getElementById('srL').value||'');
  const list=getList(q,s);
  const c=document.getElementById('entL');
  if(!list.length){c.innerHTML=`<div class="empty"><div class="empty-i">📓</div><h3>${s?'Keine Treffer':'Noch keine Einträge für '+q}</h3><p>${s?'Andere Suchbegriffe ausprobieren.':'Noch nichts dokumentiert.'}</p></div>`;return;}
  let html='',lm='';
  list.forEach((e,i)=>{const m=fmtM(e.datum);if(m!==lm){html+=`<div class="month-sep">${m}</div>`;lm=m;}html+=cardHTML(e,i+1,false);});
  c.innerHTML=html;
}

function renderA(){
  const q=activeQ.admin, s=(document.getElementById('srA').value||'');
  const list=getList(q,s);
  const c=document.getElementById('entA');
  if(!list.length){c.innerHTML=`<div class="empty"><div class="empty-i">📓</div><h3>${s?'Keine Treffer':'Keine Einträge für '+q}</h3><p>${s?'Andere Suchbegriffe ausprobieren.':'Klicke auf "Neuer Eintrag" um zu beginnen.'}</p></div>`;return;}
  let html='',lm='';
  list.forEach((e,i)=>{const m=fmtM(e.datum);if(m!==lm){html+=`<div class="month-sep">${m}</div>`;lm=m;}html+=cardHTML(e,i+1,true);});
  c.innerHTML=html;
  initDrag();
}

/* ─── DRAG & DROP ─── */
function initDrag(){
  document.querySelectorAll('#entA .ec').forEach(card=>{
    card.addEventListener('dragstart',e=>{
      dragSrc=card;card.classList.add('dragging');
      e.dataTransfer.effectAllowed='move';
    });
    card.addEventListener('dragend',()=>{
      card.classList.remove('dragging');
      document.querySelectorAll('.ec').forEach(c=>c.classList.remove('over'));
    });
    card.addEventListener('dragover',e=>{e.preventDefault();if(card!==dragSrc)card.classList.add('over');});
    card.addEventListener('dragleave',()=>card.classList.remove('over'));
    card.addEventListener('drop',e=>{
      e.preventDefault();card.classList.remove('over');
      if(!dragSrc||dragSrc===card)return;
      swapPos(parseInt(dragSrc.dataset.id),parseInt(card.dataset.id));
    });
  });
}

function swapPos(aid,bid){
  const all=load();
  const ea=all.find(e=>e.id===aid), eb=all.find(e=>e.id===bid);
  if(!ea||!eb)return;
  const tmp=ea.pos??999; ea.pos=eb.pos??999; eb.pos=tmp;
  persist(all);renderA();renderL();
}

function moveE(id,dir){
  const q=activeQ.admin, s='';
  const list=getList(q,s);
  const idx=list.findIndex(e=>e.id===id);
  const swi=idx+dir;
  if(swi<0||swi>=list.length)return;
  swapPos(list[idx].id,list[swi].id);
}

/* ─── STATS ─── */
function updStats(){
  const all=load();
  document.getElementById('sn1').textContent=all.length;
  document.getElementById('sn2').textContent=new Set(all.map(e=>fmtM(e.datum))).size;
  document.getElementById('sn3').textContent=new Set(all.flatMap(e=>e.tags||[])).size;
}

/* ─── MODAL ─── */
function openModal(id){
  editId=id||null;
  document.getElementById('ov').classList.add('open');
  if(id){
    const e=load().find(x=>x.id===id);if(!e)return;
    document.getElementById('mh').textContent='Eintrag bearbeiten';
    document.getElementById('fDat').value=e.datum;
    document.getElementById('fQ').value=e.q||'Q2';
    document.getElementById('fTit').value=e.titel;
    document.getElementById('fTag').value=(e.tags||[]).join(', ');
    document.getElementById('fBod').value=e.body;
    document.getElementById('fCod').value=e.code||'';
  }else{
    document.getElementById('mh').textContent='Neuer Eintrag';
    document.getElementById('fDat').value=new Date().toISOString().split('T')[0];
    document.getElementById('fQ').value=activeQ.admin;
    ['fTit','fTag','fBod','fCod'].forEach(id=>document.getElementById(id).value='');
  }
}
function closeModal(){document.getElementById('ov').classList.remove('open');editId=null;}
function bgCl(e){if(e.target===document.getElementById('ov'))closeModal();}

function saveE(){
  const datum=document.getElementById('fDat').value;
  const q=document.getElementById('fQ').value;
  const titel=document.getElementById('fTit').value.trim();
  const tags=document.getElementById('fTag').value.split(',').map(t=>t.trim()).filter(Boolean);
  const body=document.getElementById('fBod').value.trim();
  const code=document.getElementById('fCod').value.trim();
  if(!datum||!titel||!body){alert('Bitte Datum, Titel und Eintrag ausfüllen.');return;}
  let all=load();
  if(editId){
    all=all.map(e=>e.id===editId?{...e,datum,q,titel,tags,body,code}:e);
  }else{
    const maxPos=Math.max(0,...all.filter(e=>e.q===q).map(e=>e.pos||0));
    const newId=Math.max(0,...all.map(e=>e.id))+1;
    all.push({id:newId,q,datum,titel,tags,body,code,pos:maxPos+10});
  }
  persist(all);closeModal();refreshAll();
}

function delE(id){
  const e=load().find(x=>x.id===id);
  if(!e||!confirm(`"${e.titel}" wirklich löschen?`))return;
  const card=document.getElementById('ec'+id);
  const go=()=>{persist(load().filter(x=>x.id!==id));refreshAll();};
  if(card){card.style.transition='all .22s ease';card.style.opacity='0';card.style.transform='translateX(18px)';setTimeout(go,230);}
  else go();
}

/* ─── BOOT ─── */
function refreshAll(){
  buildQTabs('lehrer');buildQTabs('admin');
  renderL();renderA();updStats();
}
document.addEventListener('DOMContentLoaded',()=>{load();showView('loginView');});