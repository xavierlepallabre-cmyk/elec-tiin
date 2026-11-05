/* Élec TIIN — Dépannage niveau BTS MS : départ moteur en puissance.
   Chaîne par phase : arrivée (DDR 300 mA amont) → Q1 → KM1 → F1 → bornier X1 → câble → boîte à bornes → moteur (étoile).
   Instruments : voltmètre, pince ampèremétrique (dont courant de fuite sur les trois conducteurs), mégohmmètre 500 V, ohmmètre.
   Valeurs d'ordre de grandeur, temps accéléré pour les déclenchements thermiques. Aucun résultat n'est enregistré. */
(function(){
"use strict";
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const NS="http://www.w3.org/2000/svg";
function el(tag,a,p){const e=document.createElementNS(NS,tag);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
function txt(p,x,y,t,cls,anc){const e=el("text",{x,y,class:cls||"db-t"},p);if(anc)e.setAttribute("text-anchor",anc);e.textContent=t;return e;}
const fr=(x,d=0)=>Number(x).toLocaleString("fr-FR",{minimumFractionDigits:d,maximumFractionDigits:d});
const PH=["L1","L2","L3"],BORNE=["U1","V1","W1"];
const POS=["A","B","C","D","E","M"];
const LIB_POS={A:"Q1 amont",B:"Q1 aval / KM1 amont",C:"KM1 aval / F1 amont",D:"F1 aval (bornier X1)",E:"boîte à bornes, câble",M:"moteur"};
const MOT={pu:4000,In:8.2,Id:57.4,Icharge:7.4,rw:1.5,reglage:8.2,plage:"5,5 – 8,5 A"};
const R_EL={Q:0.012,K:0.006,F:0.008,L:0.15,X:0.002};
const ISO_DEF={cable:1500,moteur:600,base:5000};

/* ---------- pannes ---------- */
const ELEMENTS=[["Q1","Q1 (disjoncteur-moteur)"],["K0","KM1 pôle L1"],["K1","KM1 pôle L2"],["K2","KM1 pôle L3"],["Freg","F1 : réglage"],["F0","F1 : connexion L1"],["F1","F1 : connexion L2"],["F2","F1 : connexion L3"],["cable","Câble moteur"],["moteur","Moteur M1"]];
const ACTIONS=[["kmremp","Remplacer le contacteur KM1 (ou ses contacts)"],["regler","Régler F1 sur le courant nominal du moteur"],["connexion","Refaire la connexion : nettoyer, remplacer la cosse, serrer au couple"],["cable","Remplacer le câble"],["etuver","Étuver (sécher) le moteur puis recontrôler l'isolement"],["rebobiner","Faire rebobiner ou remplacer le moteur"],["q1remp","Remplacer Q1"]];
const PANNES=[
  {symptome:"Après un nettoyage de l'atelier au jet d'eau, le chef d'équipe demande un contrôle d'isolement du départ M1 avant de le remettre en service.",
   defaut:{iso:{moteur1:0.4}},cible:{el:"moteur",act:"etuver"},
   explication:"Isolement du moteur : 0,4 MΩ entre l'enroulement V et la masse, sous 500 V. C'est en dessous de 1 MΩ, valeur minimale usuelle pour un circuit 400 V : le moteur a pris l'humidité. Le câble seul (boîte à bornes ouverte) est sain. On étuve le moteur, puis on recontrôle : la valeur doit remonter. Si elle ne remonte pas, le bobinage est à refaire."},
  {symptome:"Le différentiel 300 mA de l'armoire déclenche dès que KM1 colle. Le moteur ne démarre pas.",
   defaut:{iso:{cable2:0.0002}},cible:{el:"cable",act:"cable"},
   explication:"Défaut franc entre le conducteur L3 du câble et la masse (câble écrasé dans le chemin de câbles). Le défaut est en aval de KM1 : il n'apparaît que quand KM1 ferme. Au mégohmmètre depuis le bornier X1 : 0,00 MΩ. Boîte à bornes ouverte : le câble seul reste à 0,00 MΩ, le moteur seul est sain (plusieurs centaines de MΩ). Le câble est à remplacer."},
  {symptome:"Le différentiel 300 mA de l'armoire déclenche dès que KM1 colle. Le moteur ne démarre pas.",
   defaut:{iso:{moteur0:0.00015}},cible:{el:"moteur",act:"rebobiner"},
   explication:"Enroulement U à la masse (isolant claqué dans le moteur). Même symptôme qu'un câble abîmé : seule la séparation permet de conclure. Boîte à bornes ouverte, le câble est sain et le moteur seul affiche 0,00 MΩ. Le moteur est à rebobiner ou à remplacer."},
  {symptome:"F1 déclenche après une vingtaine de minutes de marche. La machine n'est pas surchargée, mais le moteur chauffe anormalement.",
   defaut:{rw:[0.95,1.5,1.5],w:[1.33,1,1]},cible:{el:"moteur",act:"rebobiner"},
   explication:"Spires en court-circuit dans l'enroulement U. À la pince : environ 9,8 A sur L1 contre 7,4 A sur L2 et L3 ; ce déséquilibre dépasse le réglage de F1. À l'ohmmètre, aux bornes du moteur : U1-V1 et W1-U1 plus faibles que V1-W1. L'isolement à la masse est bon. Le moteur est à rebobiner ou à remplacer."},
  {symptome:"Au démarrage, le moteur ronfle sans tourner, puis F1 déclenche au bout de quelques secondes.",
   defaut:{ouverts:["K1"]},cible:{el:"K1",act:"kmremp"},
   explication:"Le pôle L2 de KM1 ne ferme plus (contact brûlé). À la pince, en démarrage : 0 A sur L2, environ 50 A sur L1 et L3. Au voltmètre, KM1 collé : environ 350 V aux bornes du pôle L2 et quelques dixièmes de volt aux bornes des deux autres. Hors tension, l'ohmmètre ne peut pas tester un contact de contacteur au repos : c'est la mesure sous tension qui conclut."},
  {symptome:"Au démarrage, le moteur ronfle sans tourner, puis F1 déclenche au bout de quelques secondes.",
   defaut:{ouverts:["L0"]},cible:{el:"cable",act:"cable"},
   explication:"Conducteur L1 du câble coupé. Piège de la mesure de tension : le moteur réalimente le conducteur coupé par ses enroulements, on mesure de la tension en L1 à la boîte à bornes. La pince montre 0 A sur L1. Hors tension, boîte à bornes ouverte, l'ohmmètre entre le bornier X1 L1 et le bout de câble L1 affiche OL. Le câble est à remplacer."},
  {symptome:"Odeur de chaud dans l'armoire. La borne de F1 côté moteur, sur L3, a noirci. Le moteur fonctionne normalement.",
   defaut:{rF:{2:0.6}},cible:{el:"F2",act:"connexion"},
   explication:"Connexion desserrée sur la borne aval L3 de F1 : environ 0,6 Ω au lieu de quelques milliohms. En marche, la tension aux bornes de F1 sur L3 vaut environ 4,4 V (0,6 Ω × 7,4 A), soit plus de 30 W dissipés dans une seule borne ; sur L1 et L2, quelques centièmes de volt. On refait la connexion (cosse remplacée, serrage au couple prescrit) et on vérifie que la borne de F1 n'est pas abîmée."},
  {symptome:"F1 déclenche après quelques minutes de marche, alors que la machine tourne normalement et que le moteur est à peine tiède.",
   defaut:{reglage:6.0},cible:{el:"Freg",act:"regler"},
   explication:"F1 est réglé sur 6,0 A, alors que le moteur absorbe 7,4 A en marche normale et que son courant nominal est 8,2 A. La pince montre trois courants équilibrés, inférieurs à In : le moteur est sain. On règle F1 sur le courant nominal de la plaque, 8,2 A."}
];

/* ---------- moteur de calcul ---------- */
const cplx=(m,a)=>[m*Math.cos(a),m*Math.sin(a)];
const PHASOR=[0,1,2].map(i=>cplx(400/Math.sqrt(3),-i*2*Math.PI/3));
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]],mod=a=>Math.hypot(a[0],a[1]);

function Modele(defaut){
  const d=defaut||{};
  const st={q1:false,cad:false,q1Decl:false,ddr:true,f1:true,km:false,boite:true,acc:0,
    ouverts:new Set(d.ouverts||[]),rw:(d.rw||[MOT.rw,MOT.rw,MOT.rw]).slice(),w:(d.w||[1,1,1]).slice(),
    rF:Object.assign({},d.rF||{}),reglage:d.reglage||MOT.reglage,iso:Object.assign({},d.iso||{})};
  const N=(p,i)=>p+i;
  function series(){
    const L=[];
    for(let i=0;i<3;i++){
      if(st.q1&&!st.q1Decl&&!st.ouverts.has("Q"+i))L.push([N("A",i),N("B",i),R_EL.Q,"Q"+i]);
      if(st.km&&!st.ouverts.has("K"+i))L.push([N("B",i),N("C",i),R_EL.K,"K"+i]);
      if(!st.ouverts.has("F"+i))L.push([N("C",i),N("D",i),R_EL.F+(st.rF[i]||0),"F"+i]);
      if(!st.ouverts.has("L"+i))L.push([N("D",i),N("E",i),R_EL.L,"L"+i]);
      if(st.boite)L.push([N("E",i),N("M",i),R_EL.X,"X"+i]);
    }
    return L;
  }
  function groupes(){
    const par={};const f=x=>{while(par[x]!==undefined&&par[x]!==x)x=par[x];return x;};
    POS.forEach(p=>[0,1,2].forEach(i=>par[N(p,i)]=N(p,i)));
    series().forEach(([a,b])=>{const ra=f(a),rb=f(b);if(ra!==rb)par[ra]=rb;});
    return f;
  }
  function etat(){
    const g=groupes(),phaseDe={};
    if(st.ddr)for(let i=0;i<3;i++)phaseDe[g(N("A",i))]=i;
    const fedM=[0,1,2].map(i=>phaseDe[g(N("M",i))]);
    const nFed=fedM.filter(x=>x!==undefined).length;
    let S=null;
    if(nFed>=2){const v=fedM.filter(x=>x!==undefined).map(i=>PHASOR[i]);S=[v.reduce((s,x)=>s+x[0],0)/v.length,v.reduce((s,x)=>s+x[1],0)/v.length];}
    else if(nFed===1)S=PHASOR[fedM.find(x=>x!==undefined)];
    const potGroupe={};
    for(const k in phaseDe)potGroupe[k]=PHASOR[phaseDe[k]];
    if(S)for(let i=0;i<3;i++){const r=g(N("M",i));if(potGroupe[r]===undefined)potGroupe[r]=S;}
    const pot=n=>n==="PE"?[0,0]:(potGroupe[g(n)]||null);
    // courants
    let I=[0,0,0],marche="arret";
    if(st.km&&nFed===3){I=st.w.map(x=>MOT.Icharge*x);marche="tourne";}
    else if(st.km&&nFed===2){I=fedM.map(x=>x!==undefined?0.87*MOT.Id:0);marche="bloque";}
    // fuites vers la masse (défauts d'isolement)
    let fuite=0;
    for(const k in st.iso){const m=k.match(/^(cable|moteur)(\d)$/);if(!m)continue;const i=+m[2];
      const p=m[1]==="cable"?pot(N("D",i))||pot(N("E",i)):pot(N("M",i));
      if(p)fuite+=mod(p)*(m[1]==="moteur"&&marche==="tourne"?0.5:1)/(st.iso[k]*1e6);}
    return {g,pot,I,marche,fuite,nFed,phaseDe};
  }
  /* commande et protections (appelé à chaque pas) */
  function evoluer(dt){
    const msgs=[];
    if(st.km&&(!st.q1||st.q1Decl||!st.ddr||!st.f1))st.km=false;
    let e=etat();
    if(e.fuite>=0.3&&st.ddr){st.ddr=false;st.km=false;msgs.push(`Le différentiel 300 mA de l'armoire déclenche : courant de fuite ${fr(e.fuite,2)} A vers la terre.`);e=etat();}
    const surcharge=Math.max(...e.I)>st.reglage*1.05;
    if(surcharge){st.acc+=dt;const lim=e.marche==="bloque"?4:9;
      if(st.acc>=lim&&st.f1){st.f1=false;st.km=false;st.acc=0;msgs.push(e.marche==="bloque"?"F1 déclenche : le moteur bloqué absorbe un courant très supérieur à son réglage.":`F1 déclenche (temps accéléré) : un courant dépasse son réglage de ${fr(st.reglage,1)} A.`);}}
    else st.acc=Math.max(0,st.acc-dt*2);
    return msgs;
  }
  /* mesures */
  function chemin(i,pa,pb){ // résistance série entre deux positions d'une même phase
    const ia=POS.indexOf(pa),ib=POS.indexOf(pb),lo=Math.min(ia,ib),hi=Math.max(ia,ib),cles=["Q","K","F","L","X"];let r=0;
    for(let k=lo;k<hi;k++){const c=cles[k];r+=c==="F"?R_EL.F+(st.rF[i]||0):R_EL[c];}
    return r;
  }
  function tension(a,b){
    const e=etat(),pa=e.pot(a),pb=e.pot(b);
    if(!pa&&!pb)return 0;
    if(!pa||!pb)return (a==="PE"||b==="PE")?"flottant":"flottant";
    if(a!=="PE"&&b!=="PE"&&a[1]===b[1]&&e.g(a)===e.g(b)){const i=+a[1];return e.I[i]*chemin(i,a[0],b[0]);}
    return mod(sub(pa,pb));
  }
  function vivant(n,e){const p=e.pot(n);return n!=="PE"&&!!p&&mod(p)>1;}
  function groupeIso(n,g){ // nœuds reliés par conducteurs et enroulements
    const set=new Set();if(n==="PE")return set;
    const tous=[];POS.forEach(p=>[0,1,2].forEach(i=>tous.push(N(p,i))));
    const r0=g(n);tous.forEach(x=>{if(g(x)===r0)set.add(x);});
    if([...set].some(x=>x[0]==="M"))tous.forEach(x=>{if(x[0]==="M"){const r=g(x);tous.forEach(y=>{if(g(y)===r)set.add(y);});}});
    return set;
  }
  function megger(a,b){
    const e=etat();
    if((a!=="PE"&&[...groupeIso(a,e.g)].some(x=>vivant(x,e)))||(b!=="PE"&&[...groupeIso(b,e.g)].some(x=>vivant(x,e))))return {refus:true};
    if(a==="PE"&&b==="PE")return {v:0};
    const pt=a==="PE"?b:a;
    if(a!=="PE"&&b!=="PE"){const G=groupeIso(a,e.g);return G.has(b)?{v:0,relies:true}:{v:Infinity};}
    const G=groupeIso(pt,e.g);let inv=1/ISO_DEF.base;
    for(let i=0;i<3;i++){
      if(G.has(N("D",i))||G.has(N("E",i)))inv+=1/(st.iso["cable"+i]||ISO_DEF.cable);
      if(G.has(N("M",i)))inv+=1/(st.iso["moteur"+i]||ISO_DEF.moteur);
    }
    return {v:1/inv};
  }
  function ohm(a,b){
    const e=etat();
    if([a,b].some(n=>vivant(n,e))||[a,b].some(n=>n!=="PE"&&[...groupeIso(n,e.g)].some(x=>vivant(x,e))))return {refus:true};
    if(a===b)return {v:0};
    const R=[];series().forEach(([x,y,r])=>R.push([x,y,r]));
    for(let i=0;i<3;i++)R.push([N("M",i),"S",st.rw[i]]);
    for(const k in st.iso){const m=k.match(/^(cable|moteur)(\d)$/);if(!m)continue;const ohms=st.iso[k]*1e6;if(ohms<1e5)R.push([m[1]==="cable"?N("E",+m[2]):N("M",+m[2]),"PE",ohms]);}
    // nœuds atteignables depuis a
    const adj={};R.forEach(([x,y])=>{(adj[x]=adj[x]||[]).push(y);(adj[y]=adj[y]||[]).push(x);});
    const vus=new Set([a]),f=[a];while(f.length){const x=f.pop();(adj[x]||[]).forEach(y=>{if(!vus.has(y)){vus.add(y);f.push(y);}});}
    if(!vus.has(b))return {v:Infinity};
    const nodes=[...vus].filter(x=>x!==b),idx={};nodes.forEach((x,k)=>idx[x]=k);
    const n=nodes.length,M=Array.from({length:n},()=>new Array(n+1).fill(0));
    R.forEach(([x,y,r])=>{if(!vus.has(x))return;const gc=1/r;
      if(x!==b){M[idx[x]][idx[x]]+=gc;if(y!==b)M[idx[x]][idx[y]]-=gc;}
      if(y!==b){M[idx[y]][idx[y]]+=gc;if(x!==b)M[idx[y]][idx[x]]-=gc;}});
    M[idx[a]][n]=1;
    for(let c=0;c<n;c++){let p=c;for(let r=c+1;r<n;r++)if(Math.abs(M[r][c])>Math.abs(M[p][c]))p=r;[M[c],M[p]]=[M[p],M[c]];
      for(let r=0;r<n;r++){if(r===c)continue;const k=M[r][c]/M[c][c];if(k)for(let q=c;q<=n;q++)M[r][q]-=k*M[c][q];}}
    return {v:M[idx[a]][n]/M[idx[a]][idx[a]]};
  }
  return {st,etat,evoluer,tension,megger,ohm,vivant};
}

/* ---------- formats ---------- */
const fmtV=v=>v==="flottant"?null:v<1?fr(v,2)+" V":v<10?fr(v,1)+" V":fr(v)+" V";
const fmtMO=v=>v===Infinity||v>999?"> 999 MΩ":v<0.01?"0,00 MΩ":v<10?fr(v,2)+" MΩ":fr(v)+" MΩ";
const fmtR=v=>v===Infinity?"OL":v<10?fr(v,3)+" Ω":v<1000?fr(v,1)+" Ω":fr(v/1000,1)+" kΩ";
const fmtA=v=>v<0.01?fr(v*1000,1)+" mA":v<1?fr(v*1000)+" mA":fr(v,1)+" A";
const libNoeud=n=>n==="PE"?"PE (masse)":n[0]==="M"?`Moteur ${BORNE[+n[1]]}`:`${LIB_POS[n[0]]} ${PH[+n[1]]}`;

/* ---------- pages ---------- */
function liste(main){
  main.innerHTML=`<a class="retour" href="#/depannage">← Dépannage</a>
    <div class="page-head"><div><p class="tag"><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>Dépannage · <span class="pill bts-pill" style="margin:0">BTS MS</span></p>
      <h1>Dépannage d'un départ moteur</h1>
      <p class="lead">Un moteur de 4 kW alimenté par Q1, KM1, F1 et un câble de 25 m. Mesure sous tension (voltmètre, pince) et hors tension (mégohmmètre 500 V, ohmmètre), sépare le câble du moteur à la boîte à bornes, puis désigne l'élément défaillant <b>et</b> l'action corrective.</p></div></div>
    <section class="bloc dep-numero" style="margin-bottom:16px"><h2>Panne donnée par l'enseignant</h2>
      <form id="formNumero" class="dep-numero-form" novalidate><label for="numPanne">Numéro de panne</label>
        <input id="numPanne" type="number" inputmode="numeric" min="1" max="${PANNES.length}" placeholder="1 à ${PANNES.length}">
        <button type="submit" class="btn btn-primary">Commencer le diagnostic</button></form>
      <p class="astuce" id="numErreur" aria-live="polite">Saisis le numéro donné par ton enseignant.</p></section>
    <section class="bloc" style="margin-bottom:16px"><h2>La méthode</h2><ol class="etapes-fl">
      <li><span class="n">1</span><div><b>Constater et questionner</b><p>Fais fonctionner, observe, relève l'état de Q1, F1 et du différentiel amont. Lis la plaque et le réglage de F1.</p></div></li>
      <li><span class="n">2</span><div><b>Mesurer sous tension</b><p>Pince ampèremétrique sur chaque phase (équilibre, valeur par rapport à In), puis sur les trois conducteurs ensemble (courant de fuite). Voltmètre aux bornes des appareils fermés : quelques centièmes de volt s'ils sont sains.</p></div></li>
      <li><span class="n">3</span><div><b>Consigner, puis mesurer hors tension</b><p>Mégohmmètre 500 V entre chaque conducteur et la masse : au moins 1 MΩ pour un circuit 400 V. Pour localiser, ouvre la boîte à bornes et mesure le câble et le moteur séparément. Ohmmètre : continuité des conducteurs, équilibre des enroulements.</p></div></li>
      <li><span class="n">4</span><div><b>Conclure et agir</b><p>Désigne l'élément défaillant et l'action corrective. Une mesure doit justifier chaque conclusion.</p></div></li></ol></section>
    <div class="niveaux">${PANNES.map((p,i)=>`<a class="niveau" href="#/depannage/bts/${i+1}"><span class="num">Panne BTS ${i+1}</span><p style="margin:0">${esc(p.symptome)}</p><span style="font-weight:600;color:var(--brand-text);font-size:14px">Diagnostiquer →</span></a>`).join("")}</div>
    <p class="astuce" style="margin-top:8px">Enseignant : <a href="#/depannage/bts-corrige">corrigé des ${PANNES.length} pannes BTS</a>.</p>`;
  main.querySelector("#formNumero").onsubmit=e=>{e.preventDefault();const n=+main.querySelector("#numPanne").value;
    if(Number.isInteger(n)&&n>=1&&n<=PANNES.length)location.hash="#/depannage/bts/"+n;
    else{const m=main.querySelector("#numErreur");m.textContent=`Ce numéro n'existe pas : choisis un nombre entre 1 et ${PANNES.length}.`;m.classList.add("pp-ko");}};
  return ()=>{};
}
function corrige(main){
  const L=k=>(ELEMENTS.find(x=>x[0]===k)||ACTIONS.find(x=>x[0]===k)||[,k])[1];
  main.innerHTML=`<a class="retour" href="#/depannage/bts">← Dépannage BTS</a>
    <div class="page-head"><div><p class="tag">Réservé à l'enseignant</p><h1>Corrigé des pannes BTS</h1>
      <p class="lead">Donne un numéro à l'étudiant : il le saisit dans « Panne donnée par l'enseignant ». Ce corrigé n'est pas protégé : ne l'affiche pas devant la classe.</p></div>
      <button type="button" class="btn" onclick="window.print()">Imprimer</button></div>
    <div class="dep-corrige">${PANNES.map((p,i)=>`<article class="bloc"><h2>Panne BTS ${i+1}</h2>
      <p><b>Symptôme :</b> ${esc(p.symptome)}</p><p><b>Élément défaillant :</b> ${esc(L(p.cible.el))}</p><p><b>Action :</b> ${esc(L(p.cible.act))}</p>
      <p class="astuce">${esc(p.explication)}</p></article>`).join("")}</div>`;
  return ()=>{};
}

function ouvrir(main,numero){
  const panne=PANNES[numero-1];
  if(!panne){main.innerHTML=`<p class="lead">Cette panne n'existe pas. <a href="#/depannage/bts">Retour au dépannage BTS</a></p>`;return ()=>{};}
  let Mo,detruit=false,minuteur=null,nb=0,essais=0;const mm={mode:"V",a:null,b:null,affiche:"— — —",cls:"",journal:[]};
  main.innerHTML=`<a class="retour" href="#/depannage/bts">← Dépannage BTS</a>
    <div class="page-head"><div><p class="tag">Départ moteur M1 · 4 kW · <span class="pill bts-pill" style="margin:0">BTS MS</span></p><h1>Diagnostic de panne BTS n° ${numero}</h1></div>
      <div class="etat" id="etat" role="status" aria-live="polite"></div></div>
    <div class="sim">
      <div class="folios-zone">
        <p class="consigne"><b>Symptôme signalé :</b> ${esc(panne.symptome)}</p>
        <figure class="feuille" style="margin:0"><h3>Départ moteur M1 : circuit de puissance</h3><div class="defile" id="zone"></div></figure>
        <section class="bloc"><h2>Ce qui se passe</h2><ul class="explications" id="journal" aria-live="polite"></ul></section>
      </div>
      <div class="panneau">
        <section class="bloc"><h2>Installation</h2>
          <div class="app-lignes">
            <div class="app-ligne"><span><b>Différentiel amont</b><br><small>300 mA, tableau d'atelier</small></span><button type="button" class="btn" id="bDdr"></button></div>
            <div class="app-ligne"><span><b>Q1</b><br><small>disjoncteur-moteur</small></span><span class="actions"><button type="button" class="btn" id="bQ1"></button><button type="button" class="btn" id="bCad"></button></span></div>
            <div class="app-ligne"><span><b>F1</b><br><small>relais thermique · plage ${MOT.plage} · réglage <b id="reg"></b></small></span><button type="button" class="btn" id="bF1"></button></div>
            <div class="app-ligne"><span><b>Boîte à bornes</b><br><small>câble et moteur</small></span><button type="button" class="btn" id="bBoite"></button></div>
          </div>
          <div class="poussoirs"><button type="button" class="bp marche" id="bMarche">Marche</button><button type="button" class="bp arret" id="bArret">Arrêt</button></div>
          <p class="astuce">Plaque du moteur : 4 kW · 230/400 V · 14,2/8,2 A · couplage étoile sur 400 V · Id/In = 7. Déclenchements thermiques en temps accéléré.</p></section>
        <section class="bloc mm"><h2>Instruments</h2>
          <div class="segment" role="group" aria-label="Instrument" id="instr">
            <button type="button" data-m="V" aria-pressed="true">Voltmètre</button><button type="button" data-m="A" aria-pressed="false">Pince</button><button type="button" data-m="MO" aria-pressed="false">Mégohmmètre</button><button type="button" data-m="R" aria-pressed="false">Ohmmètre</button></div>
          <div class="mm-ecran" id="ecran">— — —</div>
          <div class="mm-pointes" id="pointes"></div>
          <div class="actions" id="actPince"></div>
          <p class="astuce" id="aide"></p>
          <ul class="mm-journal" id="mmJournal"></ul></section>
        <section class="bloc"><h2>Diagnostic</h2>
          <label class="sous-titre" for="choixEl">Élément défaillant</label>
          <select id="choixEl" class="select"><option value="">Choisis un élément…</option>${ELEMENTS.map(([v,t])=>`<option value="${v}">${esc(t)}</option>`).join("")}</select>
          <label class="sous-titre" for="choixAct">Action corrective</label>
          <select id="choixAct" class="select"><option value="">Choisis une action…</option>${ACTIONS.map(([v,t])=>`<option value="${v}">${esc(t)}</option>`).join("")}</select>
          <button type="button" class="btn btn-primary" id="valider">Valider le diagnostic</button>
          <div class="verdict" id="verdict" hidden aria-live="polite"></div></section>
        <div class="actions"><button type="button" class="btn" id="reset">Remettre l'installation au repos</button></div>
      </div></div>`;

  /* ---------- dessin ---------- */
  const svg=el("svg",{viewBox:"0 0 560 600",class:"db-svg schema",role:"img","aria-label":"Circuit de puissance du départ moteur"});
  main.querySelector("#zone").appendChild(svg);
  const XS=[220,280,340],Y={A:58,B:150,C:250,D:330,E:440,M:478};
  const G={seg:[],pts:[],poles:{}};
  const gF=el("g",{},svg),gB=el("g",{},svg),gP=el("g",{},svg),gT=el("g",{},svg);
  txt(gT,280,20,"Arrivée 400 V triphasé (différentiel 300 mA en amont)","db-t petit","middle");
  PH.forEach((p,i)=>txt(gT,XS[i],40,p,"db-t gras","middle"));
  // boîtes d'appareils
  const boite=(y1,y2,lab,sous)=>{el("rect",{x:190,y:y1,width:180,height:y2-y1,rx:6,class:"db-boite"},gB);txt(gT,182,y1+(y2-y1)/2,lab,"db-t gras","end");if(sous)txt(gT,182,y1+(y2-y1)/2+14,sous,"db-t petit","end");};
  boite(72,136,"Q1","disj.-moteur");boite(166,236,"KM1","contacteur");boite(264,316,"F1","relais therm.");
  el("rect",{x:190,y:452,width:180,height:40,rx:6,class:"db-boite tirets"},gB);txt(gT,182,478,"Boîte à bornes","db-t gras","end");
  txt(gT,182,392,"Câble 4G2,5 · 25 m","db-t petit","end");
  // segments (conducteurs) par nœud
  const seg=(i,pos,d)=>{const p=el("path",{d,class:"db-fil"},gF);G.seg.push({i,pos,p});};
  [0,1,2].forEach(i=>{const x=XS[i];
    seg(i,"A",`M${x},46 L${x},88`);seg(i,"B",`M${x},120 L${x},182`);seg(i,"C",`M${x},220 L${x},278`);
    seg(i,"D",`M${x},302 L${x},${330}`);seg(i,"D",`M${x},330 C${x-30},360 ${x+30},400 ${x},425`);seg(i,"E",`M${x},425 L${x},462`);seg(i,"M",`M${x},470 L${x},${500+i*0}`);
    // pôles
    G.poles["Q"+i]=el("line",{x1:x,y1:88,x2:x,y2:120,class:"db-pole"},gP);
    G.poles["K"+i]=el("line",{x1:x,y1:182,x2:x,y2:220,class:"db-pole"},gP);
    el("path",{d:`M${x},278 h-8 v8 h16 v8 h-8 v8`,class:"db-bilame"},gP);
    G.poles["F"+i]=el("circle",{cx:x+12,cy:302,r:4,class:"db-borne"},gP);
    G.poles["X"+i]=el("line",{x1:x,y1:462,x2:x,y2:470,class:"db-pole"},gP);
  });
  // moteur
  el("path",{d:`M${XS[0]},500 L262,528 M${XS[1]},500 L280,528 M${XS[2]},500 L298,528`,class:"db-fil",id:"mFils"},gF);
  el("circle",{cx:280,cy:556,r:34,class:"db-moteur"},gB);txt(gT,280,553,"M1","db-t gras","middle");txt(gT,280,568,"3~ · étoile","db-t petit","middle");
  G.rotor=txt(gT,330,532,"","db-t petit");
  // PE
  el("path",{d:"M314,556 L520,556 L520,300",class:"db-pe"},gF);el("path",{d:"M376,472 L520,472",class:"db-pe"},gF);
  txt(gT,526,296,"PE","db-t gras");txt(gT,526,312,"terre","db-t petit");
  // points de mesure
  const point=(x,y,n)=>{const c=el("circle",{cx:x,cy:y,r:8,class:"mm-pt",tabindex:0,role:"button","aria-label":libNoeud(n)},gT);
    const f=e=>{e.preventDefault();clic(n);};c.addEventListener("click",f);c.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" ")f(e);});G.pts.push({n,c});};
  [0,1,2].forEach(i=>{const x=XS[i];point(x,Y.A,"A"+i);point(x,Y.B,"B"+i);point(x,Y.C,"C"+i);point(x,Y.D,"D"+i);point(x,Y.E,"E"+i);point(x,Y.M+8,"M"+i);});
  point(520,400,"PE");
  G.lab=el("g",{},gT);
  txt(G.lab,400,Y.A+4,"Q1 amont","db-t petit");txt(G.lab,400,Y.B+4,"Q1 aval · KM1 amont","db-t petit");txt(G.lab,400,Y.C+4,"KM1 aval · F1 amont","db-t petit");
  txt(G.lab,400,Y.D+4,"F1 aval · bornier X1","db-t petit");txt(G.lab,380,Y.E+4,"bout de câble","db-t petit");txt(G.lab,380,Y.M+12,"U1 V1 W1","db-t petit");

  /* ---------- interactions ---------- */
  function journal(t,cls){const j=main.querySelector("#journal");const li=document.createElement("li");if(cls)li.className=cls;li.innerHTML=t;j.prepend(li);while(j.children.length>6)j.lastChild.remove();}
  function construire(){Mo=Modele(panne.defaut);mm.a=mm.b=null;mm.affiche="— — —";mm.cls="";main.querySelector("#journal").innerHTML="";journal("Installation au repos : Q1 ouvert, moteur à l'arrêt.");rendre();}
  const S=()=>Mo.st;
  main.querySelector("#bDdr").onclick=()=>{if(S().ddr){journal("Le différentiel est déjà enclenché.");return;}S().ddr=true;journal("Différentiel réarmé.");pas_(0);};
  main.querySelector("#bQ1").onclick=()=>{const s=S();
    if(!s.q1&&s.cad){journal("Q1 est cadenassé : retire d'abord ton cadenas.","ko");return;}
    if(!s.q1&&!s.boite){journal("Danger : la boîte à bornes est ouverte. Referme-la avant de remettre sous tension.","ko");return;}
    if(s.q1Decl){s.q1Decl=false;s.q1=false;}
    s.q1=!s.q1;journal(s.q1?"Q1 fermé.":"Q1 ouvert.");pas_(0);};
  main.querySelector("#bCad").onclick=()=>{const s=S();if(s.q1&&!s.cad){journal("Ouvre Q1 avant de le cadenasser.","ko");return;}s.cad=!s.cad;journal(s.cad?"Q1 ouvert et cadenassé : le départ est séparé et condamné. Pense à vérifier l'absence de tension avant d'intervenir.":"Cadenas retiré.");rendre();};
  main.querySelector("#bF1").onclick=()=>{const s=S();if(s.f1){journal("F1 n'a pas déclenché.");return;}s.f1=true;journal("F1 réarmé.");rendre();};
  main.querySelector("#bBoite").onclick=()=>{const s=S();
    if(s.boite){if(s.q1){journal("Danger : on n'ouvre pas une boîte à bornes sous tension. Ouvre et cadenasse Q1 d'abord.","ko");return;}
      if(!s.cad)journal("Boîte à bornes ouverte sans consignation de Q1 : en entreprise, c'est interdit. Cadenasse Q1.","ko");}
    s.boite=!s.boite;journal(s.boite?"Câble raccordé au moteur, boîte à bornes refermée.":"Boîte à bornes ouverte, câble déconnecté du moteur : tu peux mesurer le câble et le moteur séparément.");mm.a=mm.b=null;rendre();};
  main.querySelector("#bMarche").onclick=()=>{const s=S();if(!s.q1||s.q1Decl||!s.ddr||!s.f1){journal("KM1 ne colle pas : la commande n'est pas alimentée ou une protection est ouverte.");return;}s.km=true;s.acc=0;journal("KM1 colle.");pas_(0);};
  main.querySelector("#bArret").onclick=()=>{if(S().km){S().km=false;journal("KM1 retombe.");}pas_(0);};
  main.querySelector("#reset").onclick=construire;
  main.querySelectorAll("#instr button").forEach(b=>b.onclick=()=>{mm.mode=b.dataset.m;mm.a=mm.b=null;mm.affiche="— — —";mm.cls="";
    main.querySelectorAll("#instr button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));rendre();});
  function clic(n){
    if(mm.mode==="A"){if(n==="PE"){mesureTxt("Pince sur le PE","0 mA (aucun courant de défaut ne circule ici sans défaut franc)","");return;}
      const e=Mo.etat(),i=+n[1];const I=Mo.vivant(n,e)||e.I[i]>0?e.I[i]:0;mesureTxt(`Pince · ${PH[i]} (${LIB_POS[n[0]]})`,fmtA(I),"");return;}
    if(!mm.a||mm.b){mm.a=n;mm.b=null;rendre();return;}
    mm.b=n;mesurer();
  }
  function mesureTxt(t,v,cls){nb++;mm.affiche=v;mm.cls=cls;mm.journal.unshift([t,v,cls]);if(mm.journal.length>7)mm.journal.pop();rendre();}
  let note="";
  function mesurer(){
    const a=mm.a,b=mm.b,t=`${{V:"V",MO:"MΩ",R:"Ω"}[mm.mode]} · ${libNoeud(a)} → ${libNoeud(b)}`;note="";
    if(mm.mode==="V"){const v=Mo.tension(a,b);
      if(v==="flottant"){note="Valeur instable : un des points n'est relié à aucune source. Tension fantôme sans signification.";mesureTxt(t,fr(3+Math.random()*40,1)+" V ?","instable");}
      else mesureTxt(t,fmtV(v),"");}
    else if(mm.mode==="MO"){const r=Mo.megger(a,b);
      if(r.refus){note="Le mégohmmètre détecte une tension et refuse la mesure. On mesure l'isolement hors tension, installation consignée. Sous tension, l'appareil peut être détruit et la mesure n'a pas de sens.";mesureTxt(t,"Tension !","ko");}
      else{if(r.relies)note="Les deux points sont reliés par des conducteurs ou par les enroulements du moteur : la mesure d'isolement entre eux n'a pas de sens.";
        else if(a!=="PE"&&b!=="PE")note="";else note=r.v<1?"En dessous de 1 MΩ sous 500 V : isolement insuffisant pour un circuit 400 V.":"Isolement correct (au moins 1 MΩ sous 500 V pour un circuit 400 V).";
        mesureTxt(t+" (500 V)",fmtMO(r.v),r.v<1&&(a==="PE"||b==="PE")?"ko":"");}}
    else{const r=Mo.ohm(a,b);
      if(r.refus){note="Mesure de résistance sous tension : interdit. Consigne le départ d'abord.";mesureTxt(t,"Refusé","ko");}
      else mesureTxt(t,fmtR(r.v),"");}
  }
  main.querySelector("#valider").onclick=()=>{
    const e=main.querySelector("#choixEl").value,a=main.querySelector("#choixAct").value,ver=main.querySelector("#verdict");ver.hidden=false;
    if(!e||!a){ver.className="verdict ko";ver.innerHTML="<b>Choisis un élément et une action.</b>";return;}
    essais++;const okE=e===panne.cible.el,okA=a===panne.cible.act;
    if(okE&&okA){ver.className="verdict ok";ver.innerHTML=`<b>Diagnostic juste.</b><span>${esc(panne.explication)}</span><span class="astuce">${nb} mesure${nb>1?"s":""}, ${essais} essai${essais>1?"s":""}. Ce résultat n'est pas enregistré.</span><a class="btn btn-primary" href="#/depannage/bts">Autre panne</a>`;}
    else{ver.className="verdict ko";ver.innerHTML=`<b>${okE?"Bon élément, mais l'action ne convient pas.":"Ce n'est pas l'élément défaillant."}</b><span>${okE?"Demande-toi ce que la mesure a révélé : défaut réparable (humidité, serrage, réglage) ou composant détruit ?":nb?"Reprends tes mesures : chaque conclusion doit s'appuyer sur une valeur.":"Tu n'as fait aucune mesure."}</span>${essais>=2?`<button type="button" class="btn" id="sol">Voir la solution</button>`:""}`;
      const s=ver.querySelector("#sol");if(s)s.onclick=()=>{ver.insertAdjacentHTML("beforeend",`<span><b>Solution :</b> ${esc(panne.explication)}</span>`);s.remove();};}
  };

  /* ---------- rendu ---------- */
  function rendre(){
    if(detruit)return;const s=S(),e=Mo.etat();
    G.seg.forEach(({i,pos,p})=>{const n=pos+i,pt=e.pot(n);p.setAttribute("class","db-fil"+(pt&&mod(pt)>1?" vif":""));});
    const ouvert=(k,closed,x,y1,y2)=>{const l=G.poles[k];l.setAttribute("x2",closed?x:x+14);l.setAttribute("y1",y1);l.setAttribute("y2",y2);};
    [0,1,2].forEach(i=>{const x=XS[i];
      const q=s.q1&&!s.q1Decl;ouvert("Q"+i,q,x,88,q?120:110);
      ouvert("K"+i,s.km,x,182,s.km?220:208);
      G.poles["X"+i].style.display=s.boite?"":"none";});
    G.lab.style.display="";
    const etat=main.querySelector("#etat");
    etat.dataset.s=e.marche==="tourne"?"marche":e.marche==="bloque"||!s.ddr||!s.f1?"defaut":"arret";
    etat.textContent=!s.ddr?"Différentiel déclenché":!s.f1?"F1 déclenché":e.marche==="tourne"?"Moteur en marche":e.marche==="bloque"?"Moteur bloqué, il ronfle":s.cad?"Départ consigné":"Moteur à l'arrêt";
    G.rotor.textContent=e.marche==="tourne"?"tourne":e.marche==="bloque"?"ronfle":"";
    main.querySelector("#bDdr").textContent=s.ddr?"Enclenché":"Réarmer";
    main.querySelector("#bQ1").textContent=s.q1?"Ouvrir":"Fermer";
    main.querySelector("#bCad").textContent=s.cad?"Retirer le cadenas":"Cadenasser";
    main.querySelector("#bF1").textContent=s.f1?"Armé":"Réarmer";
    main.querySelector("#bBoite").textContent=s.boite?"Ouvrir (déconnecter)":"Raccorder";
    main.querySelector("#reg").textContent=fr(s.reglage,1)+" A";
    main.querySelector("#ecran").textContent=mm.affiche;main.querySelector("#ecran").className="mm-ecran"+(mm.cls==="instable"?" instable":mm.cls==="ko"?" refuse":"");
    G.pts.forEach(({n,c})=>{c.classList.toggle("rouge",mm.a===n);c.classList.toggle("noire",mm.b===n);});
    main.querySelector("#pointes").innerHTML=mm.mode==="A"?`<span>Pince : touche un point de mesure pour enserrer le conducteur de cette phase.</span>`:
      `<span><i class="pt rouge"></i><b>${mm.a?esc(libNoeud(mm.a)):"—"}</b></span><span><i class="pt noire"></i><b>${mm.b?esc(libNoeud(mm.b)):"—"}</b></span>`;
    const ap=main.querySelector("#actPince");
    if(ap.dataset.m!==mm.mode){ap.dataset.m=mm.mode;ap.innerHTML=mm.mode==="A"?`<button type="button" class="btn" id="pince3">Pince sur les 3 phases ensemble (courant de fuite)</button>`:"";
    const p3=main.querySelector("#pince3");if(p3)p3.onclick=()=>{const e2=Mo.etat();mesureTxt("Pince · L1 + L2 + L3 (fuite)",fmtA(e2.fuite),"");note="La pince qui enserre les trois phases mesure leur somme : sans défaut, elle est nulle. Une valeur mesure le courant qui s'échappe vers la terre.";rendre();};}
    main.querySelector("#aide").textContent=note||{V:"Voltmètre : sous tension, avec EPI et habilitation adaptée. Touche deux points (rouge puis noire).",A:"Pince ampèremétrique : sous tension, en marche. Compare chaque courant au courant nominal (8,2 A) et au réglage de F1.",MO:"Mégohmmètre 500 V : départ consigné. Mesure entre un conducteur et le PE. Pour localiser, ouvre la boîte à bornes.",R:"Ohmmètre : hors tension. Continuité des conducteurs, résistance des enroulements entre bornes du moteur."}[mm.mode];
    main.querySelector("#mmJournal").innerHTML=mm.journal.map(([t,v,c])=>`<li${c?` class="${c}"`:""}><span>${esc(t)}</span><b>${esc(v)}</b></li>`).join("");
  }
  function pas_(dt){const msgs=Mo.evoluer(dt);msgs.forEach(m=>journal(m,"ko"));rendre();}
  minuteur=setInterval(()=>{if(!detruit)pas_(0.25);},250);
  construire();
  return ()=>{detruit=true;clearInterval(minuteur);};
}

window.ElecDepBTS={liste,ouvrir,corrige,Modele,PANNES};
})();
