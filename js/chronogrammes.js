/* Élec TIIN — Chronogrammes.
   1. Enregistreur : chronogramme en direct dans les simulateurs de l'Atelier.
   2. Exercices : les entrées sont données, l'apprenti trace les sorties ; la simulation rejoue le scénario
      en temps virtuel (même moteur que l'Atelier) et corrige case par case. Aucun résultat n'est enregistré. */
(function(){
"use strict";
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const NS="http://www.w3.org/2000/svg";
function el(tag,a,p){const e=document.createElementNS(NS,tag);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
const fr=(x,d=0)=>Number(x).toLocaleString("fr-FR",{minimumFractionDigits:d,maximumFractionDigits:d});
const schema=id=>(window.ELEC_SCHEMAS||[]).find(s=>s.id===id);
const VOYANTS={H1:"voyant sens 1",H2:"voyant sens 2",H3:"voyant surcharge",H4:"voyant sous tension"};

/* ---------- signaux d'un schéma ---------- */
function signaux(sch){
  const S=[];
  for(const [id,d] of Object.entries(sch.appareils)){
    if(d.type==="poussoir"||d.type==="au")S.push({k:id,lab:id,sous:d.nom,entree:true,get:s=>!!s.app[id].appuye});
    if(d.type==="thermique")S.push({k:id,lab:id,sous:"déclenché",entree:true,get:s=>!!s.app[id].declenche});
  }
  for(const [id,d] of Object.entries(sch.appareils)){
    if(d.type!=="contacteur")continue;
    S.push({k:id,lab:id,sous:d.nom,get:s=>!!s.app[id].ferme});
    if(d.tempo)S.push({k:id+"t",lab:id+" tempo",sous:`contacts temporisés (${fr(d.tempo)} s)`,get:s=>!!(s.app[id].ferme&&s.app[id].ecoule)});
  }
  sch.charges.filter(c=>c.type==="voyant").forEach(c=>S.push({k:c.id,lab:c.id,sous:VOYANTS[c.id]||"voyant",get:s=>!!s.charges[c.id]}));
  if(sch.moteur)S.push({k:"M",lab:"M1",sous:"moteur en rotation",get:s=>!!(s.mot&&s.mot.tourne)});
  return S;
}

/* ---------- enregistreur en direct (Atelier) ---------- */
function enregistreur(zone,sim,sch){
  const S=signaux(sch),FEN=20,PAS=0.1;let ech=[],pause=false,t0=performance.now()/1000,detruit=false;
  zone.innerHTML=`<div class="cg-rec-tete"><span class="astuce">Les ${FEN} dernières secondes. Haut : appuyé, fermé, allumé, en rotation.</span>
    <span class="actions"><button type="button" class="btn" data-a="pause">Pause</button><button type="button" class="btn" data-a="effacer">Effacer</button></span></div>
    <div class="cg-rec"></div>`;
  const W=640,LAB=96,RH=26,H=S.length*RH+24,X=t=>LAB+(W-LAB-8)*(t/FEN);
  const svg=el("svg",{viewBox:`0 0 ${W} ${H}`,class:"cg-svg",role:"img","aria-label":"Chronogramme des "+FEN+" dernières secondes"});
  zone.querySelector(".cg-rec").appendChild(svg);
  for(let s=0;s<=FEN;s+=5){el("line",{x1:X(s),y1:0,x2:X(s),y2:H-20,class:"cg-grille"},svg);const t=el("text",{x:X(s),y:H-6,class:"cg-t","text-anchor":s===FEN?"end":"middle"},svg);t.textContent=s===FEN?"maintenant":"−"+(FEN-s)+" s";}
  const paths=S.map((s,i)=>{const y=i*RH+4;
    const l=el("text",{x:4,y:y+15,class:"cg-t gras"+(s.entree?" entree":"")},svg);l.textContent=s.lab;
    el("line",{x1:LAB,y1:y+RH-6,x2:W-8,y2:y+RH-6,class:"cg-base"},svg);
    return {p:el("path",{d:"",class:"cg-trace"+(s.entree?" entree":"")},svg),f:el("path",{d:"",class:"cg-rempli"+(s.entree?" entree":"")},svg),y};});
  zone.querySelector('[data-a="pause"]').onclick=e=>{pause=!pause;e.target.textContent=pause?"Reprendre":"Pause";};
  zone.querySelector('[data-a="effacer"]').onclick=()=>{ech=[];dessiner();};
  function dessiner(){
    const now=performance.now()/1000-t0;
    paths.forEach((P,i)=>{
      if(!ech.length){P.p.setAttribute("d","");P.f.setAttribute("d","");return;}
      const hy=P.y+4,by=P.y+RH-6;let d="",f="",prev=null,deb=null;
      ech.forEach(([t,v])=>{const x=Math.max(LAB,X(t-(now-FEN)));const y=v[i]?hy:by;
        if(prev===null)d=`M${x},${y}`;else if(v[i]!==prev)d+=`L${x},${prev?hy:by}L${x},${y}`;
        if(v[i]&&deb===null)deb=x;if(!v[i]&&deb!==null){f+=`M${deb},${by}L${deb},${hy}L${x},${hy}L${x},${by}Z`;deb=null;}
        prev=v[i];});
      const xe=X(FEN);d+=`L${xe},${prev?hy:by}`;if(deb!==null)f+=`M${deb},${by}L${deb},${hy}L${xe},${hy}L${xe},${by}Z`;
      P.p.setAttribute("d",d);P.f.setAttribute("d",f);
    });
  }
  const id=setInterval(()=>{
    if(detruit||pause)return;
    const t=performance.now()/1000-t0;
    ech.push([t,S.map(s=>s.get(sim))]);
    while(ech.length&&ech[0][0]<t-FEN-1)ech.shift();
    dessiner();
  },PAS*1000);
  return ()=>{detruit=true;clearInterval(id);};
}

/* ---------- simulation en temps virtuel ---------- */
const DT=0.5,TICK=0.05;
function jouer(sch,exo){
  const sim=new window.ElecSimulation(JSON.parse(JSON.stringify(sch)));
  let vt=0;sim.maintenant=()=>vt;sim.reinitialiser();
  const S=signaux(sch),n=Math.round(exo.T/DT),res={};S.forEach(s=>res[s.k]=[]);
  const evs=exo.ev.map(([t,a,app])=>({k:Math.round(t/TICK),a,app})).sort((x,y)=>x.k-y.k);
  let j=0;const kmax=Math.round(exo.T/TICK);
  for(let k=0;k<=kmax;k++){
    vt=k*TICK;
    while(j<evs.length&&evs[j].k<=k){const e=evs[j++];
      if(e.a==="appui")sim.appuyer(e.app,true);else if(e.a==="relache")sim.appuyer(e.app,false);
      else if(e.a==="declencher")sim.declencher(e.app);else if(e.a==="basculer")sim.basculer(e.app);}
    sim.resoudre();
    const c=(k*TICK-DT/2)/DT;
    if(Math.abs(c-Math.round(c))<1e-6&&Math.round(c)>=0&&Math.round(c)<n)S.forEach(s=>res[s.k][Math.round(c)]=s.get(sim));
  }
  return {res,S,n};
}

/* ---------- exercices ---------- */
const imp=(app,t,d=0.5)=>[[t,"appui",app],[t+d,"relache",app]];
const EXOS=[
  {niveau:"bacpro",schema:"direct-un-sens",titre:"Marche, arrêt, auto-maintien",T:12,
   ev:[...imp("S2",1),...imp("S1",4.5),...imp("S2",7),...imp("S1",10)],entrees:["S2","S1"],sorties:["KM1","M"],
   retenir:"Une impulsion sur S2 suffit : le contact 13-14 de KM1 maintient la bobine. Une impulsion sur S1 ouvre le circuit et KM1 retombe, jusqu'au prochain appui sur S2."},
  {niveau:"bacpro",schema:"direct-un-sens",titre:"Arrêt prioritaire",T:12,
   ev:[...imp("S2",1),[3.5,"appui","S1"],...imp("S2",5,1.5),[7.5,"relache","S1"],...imp("S2",9.5)],entrees:["S2","S1"],sorties:["KM1","M"],
   retenir:"S1 (NF) est en série avant S2 et l'auto-maintien : tant que S1 est enfoncé, appuyer sur S2 ne fait rien. L'arrêt est prioritaire sur la marche, c'est une règle de sécurité."},
  {niveau:"bacpro",schema:"deux-sens",titre:"Deux sens et verrouillage",T:12,
   ev:[...imp("S2",1),...imp("S3",3),...imp("S1",5),...imp("S3",7),...imp("S1",10)],entrees:["S2","S3","S1"],sorties:["KM1","KM2","H1","H2"],
   retenir:"Pendant le sens 1, l'appui sur S3 n'a aucun effet : le contact NF de KM1 dans la colonne de KM2 verrouille le sens 2. Il faut passer par l'arrêt S1 avant d'inverser."},
  {niveau:"bacpro",schema:"deux-sens",titre:"Surcharge et voyants",T:12,
   ev:[...imp("S2",1),[4,"declencher","F1"],...imp("S2",5.5),[7.5,"basculer","F1"],...imp("S2",9.5)],entrees:["S2","F1"],sorties:["KM1","H1","H3","H4"],
   retenir:"F1 déclenché : son contact 95-96 coupe les bobines, son contact 97-98 allume H3. Tant que F1 n'est pas réarmé, S2 est sans effet. Après réarmement, le moteur ne repart pas tout seul : il faut un nouvel appui sur S2. H4 reste allumé, la commande est sous tension."},
  {niveau:"bts",schema:"etoile-triangle",titre:"Démarrage étoile-triangle",T:10,
   ev:[...imp("S2",1)],entrees:["S2"],sorties:["KM1","KM2","KM2t","KM3","M"],
   retenir:"S2 alimente KM1 (étoile), dont le contact ferme KM2 (ligne) : le moteur démarre en étoile. La temporisation de KM2 démarre ; 5 s plus tard, son contact temporisé NF coupe KM1 et son contact NO alimente KM3 (triangle). KM1 et KM3 ne sont jamais fermés ensemble."},
  {niveau:"bts",schema:"etoile-triangle",titre:"Arrêt pendant l'étoile",T:12,
   ev:[...imp("S2",1),...imp("S1",3.5),...imp("S2",5)],entrees:["S2","S1"],sorties:["KM1","KM2","KM2t","KM3"],
   retenir:"L'arrêt pendant l'étoile fait retomber KM2 : sa temporisation est remise à zéro. Au nouvel appui sur S2, elle repart de zéro, et le triangle arrive 5 s après ce nouvel appui."},
  {niveau:"bts",schema:"etoile-triangle",titre:"Surcharge en triangle",T:18,
   ev:[...imp("S2",1),[8.5,"declencher","F1"],...imp("S2",10),[11,"basculer","F1"],...imp("S2",12.5)],entrees:["S2","F1"],sorties:["KM1","KM2","KM3","M"],
   retenir:"F1 coupe toutes les bobines. Un appui sur S2 pendant que F1 est déclenché est sans effet. Après réarmement, tout recommence par l'étoile : le démarrage complet est rejoué, temporisation comprise."},
  {niveau:"bts",schema:"deux-sens",titre:"Inversion et impulsions brèves",T:12,
   ev:[...imp("S3",1,0.5),...imp("S2",2.5),...imp("S1",4,0.5),...imp("S2",4.5),...imp("S3",6.5),...imp("S1",8.5),...imp("S3",10)],entrees:["S3","S2","S1"],sorties:["KM1","KM2","H1","H2"],
   retenir:"Chaque sens ne démarre que depuis l'arrêt. Un appui sur S2 ou S3 pendant la marche dans l'autre sens est ignoré. Lis les instants : un appui de 0,5 s sur S1 suivi immédiatement d'un appui sur S2 suffit à inverser."}
];

function liste(main){
  const bts=document.documentElement.dataset.niveau==="bts";
  main.innerHTML=`<a class="retour" href="#/atelier">← Atelier</a>
    <div class="page-head"><div><p class="tag"><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>Chronogrammes</p>
      <h1>Lire et tracer des chronogrammes</h1>
      <p class="lead">Les actions sur les boutons sont données. Trace l'état des contacteurs, des voyants et du moteur, case par case, puis compare avec la simulation. Une case vaut une demi-seconde.</p></div></div>
    <div class="niveaux">${EXOS.map((e,i)=>`<a class="niveau${e.niveau==="bts"?" bts-seul":""}" href="#/chronogrammes/${i+1}">
      <span class="num">Chronogramme ${i+1} ${e.niveau==="bts"?'<span class="pill bts-pill" style="margin:0 0 0 6px">BTS</span>':""}</span><h2>${esc(e.titre)}</h2>
      <p class="lead" style="margin:0">${esc(schema(e.schema).titre)} · à tracer : ${e.sorties.map(s=>s==="M"?"moteur":s==="KM2t"?"KM2 temporisé":s).join(", ")}</p>
      <span style="font-weight:600;color:var(--brand-text);font-size:14px">Tracer →</span></a>`).join("")}</div>
    ${bts?"":`<p class="astuce" style="margin-top:12px">Active le mode BTS pour les chronogrammes avec temporisation (étoile-triangle).</p>`}
    <p class="astuce" style="margin-top:8px">Dans chaque simulateur de l'Atelier, l'enregistreur trace aussi le chronogramme en direct.</p>`;
  return ()=>{};
}

function ouvrir(main,num){
  const exo=EXOS[num-1];
  if(!exo){main.innerHTML=`<p class="lead">Ce chronogramme n'existe pas. <a href="#/chronogrammes">Retour</a></p>`;return ()=>{};}
  const sch=schema(exo.schema),sol=jouer(sch,exo),n=sol.n,S=sol.S;
  const sig=k=>S.find(s=>s.k===k);
  const rep={};exo.sorties.forEach(k=>rep[k]=new Array(n).fill(false));
  let corrige=false;
  main.innerHTML=`<a class="retour" href="#/chronogrammes">← Chronogrammes</a>
    <div class="page-head"><div><p class="tag">${esc(sch.titre)}${exo.niveau==="bts"?' · <span class="pill bts-pill" style="margin:0">BTS</span>':""}</p>
      <h1>Chronogramme ${num} : ${esc(exo.titre)}</h1>
      <p class="lead">Les lignes grises sont données. Pour chaque ligne orange, touche ou fais glisser sur les cases où l'élément est <b>fermé, allumé ou en rotation</b>. Une case = 0,5 s.</p></div>
      <a class="btn" href="#/atelier/${exo.schema}">Ouvrir le schéma</a></div>
    <section class="bloc"><div class="cg-zone"><div class="cg" id="grille" style="--n:${n}"></div></div>
      <div class="actions" style="margin-top:6px"><button type="button" class="btn btn-primary" id="verifier">Vérifier avec la simulation</button><button type="button" class="btn" id="effacer">Effacer mes tracés</button><button type="button" class="btn" id="solution">Voir la solution</button></div>
      <div id="resultat" aria-live="polite"></div></section>`;
  const g=main.querySelector("#grille");
  function rendre(){
    let h=`<div class="cg-lab"></div>`;
    for(let c=0;c<n;c++)h+=`<div class="cg-temps">${c%2===0?fr(c*DT):""}</div>`;
    exo.entrees.forEach(k=>{const s=sig(k);h+=`<div class="cg-lab entree"><b>${esc(s.lab)}</b><small>${esc(s.sous)}</small></div>`;
      for(let c=0;c<n;c++)h+=`<div class="cg-c entree${sol.res[k][c]?" on":""}"></div>`;});
    exo.sorties.forEach(k=>{const s=sig(k);h+=`<div class="cg-lab sortie"><b>${esc(s.lab)}</b><small>${esc(s.sous)}</small></div>`;
      for(let c=0;c<n;c++){const v=rep[k][c],ok=sol.res[k][c];
        h+=`<button type="button" class="cg-c sortie${v?" on":""}${corrige?(v===ok?" juste":" faux")+(ok?" v1":" v0"):""}" data-k="${k}" data-c="${c}" aria-pressed="${v}" aria-label="${esc(s.lab)}, de ${fr(c*DT,1)} à ${fr((c+1)*DT,1)} s"></button>`;}});
    g.innerHTML=h;
  }
  let peinture=null;
  g.addEventListener("pointerdown",e=>{const b=e.target.closest(".cg-c.sortie");if(!b)return;e.preventDefault();
    const k=b.dataset.k,c=+b.dataset.c;peinture={k,v:!rep[k][c]};rep[k][c]=peinture.v;corrige=false;rendre();});
  g.addEventListener("pointermove",e=>{if(!peinture)return;const b=document.elementFromPoint(e.clientX,e.clientY);
    if(!b||!b.classList||!b.classList.contains("sortie")||b.dataset.k!==peinture.k)return;const c=+b.dataset.c;
    if(rep[peinture.k][c]!==peinture.v){rep[peinture.k][c]=peinture.v;b.classList.toggle("on",peinture.v);b.setAttribute("aria-pressed",String(peinture.v));}});
  const fin=()=>{peinture=null;};
  window.addEventListener("pointerup",fin);window.addEventListener("pointercancel",fin);
  g.addEventListener("keydown",e=>{const b=e.target.closest(".cg-c.sortie");if(!b||(e.key!==" "&&e.key!=="Enter"))return;e.preventDefault();
    const k=b.dataset.k,c=+b.dataset.c;rep[k][c]=!rep[k][c];corrige=false;rendre();
    const nb=g.querySelector(`[data-k="${k}"][data-c="${c}"]`);if(nb)nb.focus();});
  g.style.touchAction="none";
  function verifier(montrer){
    if(montrer)exo.sorties.forEach(k=>rep[k]=sol.res[k].slice());
    corrige=true;rendre();
    let tot=0,ok=0;const fautes=[];
    exo.sorties.forEach(k=>{let f=0;for(let c=0;c<n;c++){tot++;if(rep[k][c]===sol.res[k][c])ok++;else f++;}if(f)fautes.push(sig(k).lab);});
    const r=main.querySelector("#resultat");
    r.innerHTML=`<div class="verdict ${ok===tot?"ok":"ko"}" style="margin-top:10px"><b>${montrer?"Solution affichée.":ok===tot?"Chronogramme juste.":`${ok} cases justes sur ${tot}.`}</b>
      ${!montrer&&fautes.length?`<span>À reprendre : ${fautes.map(esc).join(", ")}. Les cases en rouge sont fausses ; le trait pointillé indique l'état simulé.</span>`:""}
      <span><b>À retenir :</b> ${esc(exo.retenir)}</span><span class="astuce">Ce résultat n'est pas enregistré.</span></div>`;
  }
  main.querySelector("#verifier").onclick=()=>verifier(false);
  main.querySelector("#solution").onclick=()=>verifier(true);
  main.querySelector("#effacer").onclick=()=>{exo.sorties.forEach(k=>rep[k].fill(false));corrige=false;rendre();main.querySelector("#resultat").innerHTML="";};
  rendre();
  return ()=>{window.removeEventListener("pointerup",fin);window.removeEventListener("pointercancel",fin);};
}

window.ElecChrono={enregistreur,liste,ouvrir,jouer,EXOS,signaux};
})();
