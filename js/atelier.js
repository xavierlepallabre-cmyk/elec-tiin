/* Élec TIIN — Atelier : liste des schémas et simulateur. */
(function(){
"use strict";
const D=window.ElecDessin;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const schemas=()=>window.ELEC_SCHEMAS||[];

/* ---------- liste ---------- */
function liste(main){
  main.innerHTML=`
    <div class="page-head"><div>
      <p class="tag"><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>Atelier</p>
      <h1>Simulateurs de schémas</h1>
      <p class="lead">Choisis un schéma, puis manœuvre les appareils. Les conducteurs sous tension passent en rouge, le 0 V et le neutre en bleu.</p>
    </div></div>
    <div class="cartes" id="cartes"></div>`;
  const zone=main.querySelector("#cartes");
  schemas().forEach(s=>{
    const a=document.createElement("a");
    a.className="carte";a.href="#/atelier/"+s.id;
    a.innerHTML=`<div class="apercu"></div><div class="corps"><h2>${esc(s.titre)}</h2><p class="lead" style="margin:0">${esc(s.resume)}</p>
      <div class="chips">${s.notions.map(n=>`<span class="chip">${esc(n)}</span>`).join("")}</div><span class="ouvrir">Ouvrir le simulateur →</span></div>`;
    const svg=document.createElementNS(D.NS,"svg");
    svg.setAttribute("aria-hidden","true");
    // aperçu statique du dernier folio, contacts au repos
    const f=s.folios[s.folios.length-1];
    const F=D.construire(svg,f);
    svg.setAttribute("preserveAspectRatio","xMidYMid meet");
    a.querySelector(".apercu").appendChild(svg);
    Object.values(F.contacts).forEach(c=>c.maj(c.spec.mode==="nf"||c.spec.mode==="tnf","var(--mort)"));
    zone.appendChild(a);
  });
  const v=document.createElement("div");
  v.className="carte a-venir";
  v.innerHTML=`<h2>Prochains schémas</h2><p class="lead" style="margin:0">Chaque nouveau schéma s'ajoute par un fichier de description, sans modifier le simulateur.</p>`;
  zone.appendChild(v);
  return ()=>{};
}

/* ---------- peinture d'une feuille selon l'état de la simulation (partagée avec les Défis) ---------- */
function couleurNet(sim,net,phases){
  const e=sim.etatNet(net);
  if(e.cls==="vif")return phases&&e.phase?`var(--ph-${e.phase})`:"var(--vif)";
  return e.cls==="neutre"?"var(--neutre)":"var(--mort)";
}
function peindre(F,sim,sch,phases){
  const couleur=n=>couleurNet(sim,n,phases);
  F.fils.forEach(f=>f.e.style.stroke=couleur(f.net));
  F.joncs.forEach(j=>j.e.style.fill=couleur(j.net));
  Object.values(F.contacts).forEach(c=>{
    const s=c.spec,f=sim.ferme(s);
    const fondu=sim.app[s.app].declenche&&s.type==="sectfus";
    c.maj(f,couleur(f?s.haut:s.bas),fondu);
  });
  for(const [id,ch] of Object.entries(F.charges)){
    const on=!!sim.charges[id];
    if(ch.type==="bobine"){
      ch.e.classList.toggle("active",on);
      const app=Object.entries(sch.appareils).find(([k,d])=>d.bobine===id);
      let t="";
      if(app&&app[1].tempo){const a=sim.app[app[0]];
        if(a.ferme&&!a.ecoule&&a.t0!==null){const r=Math.max(0,app[1].tempo-(sim.maintenant()-a.t0));t="⏱ "+r.toFixed(1).replace(".",",")+" s";}}
      if(sim.instable&&app)t="bat !";
      ch.tempo.textContent=t;
    }
    if(ch.type==="voyant"){ch.e.classList.toggle("allume",on);ch.e.dataset.t=ch.teinte;ch.halo.classList.toggle("allume",on);ch.halo.dataset.t=ch.teinte;}
    if(ch.type==="transfo")ch.e.forEach(c=>c.classList.toggle("transfo-on",on));
  }
  if(F.moteurG){
    const m=sim.mot||{};
    F.moteurG.g.classList.toggle("tourne",!!m.tourne&&!sim.grille);
    F.moteurG.g.classList.toggle("sens2",m.sens===2);
    F.moteurG.g.classList.toggle("etoile",m.couplage==="étoile");
    F.moteurG.g.classList.toggle("grille",!!sim.grille);
    F.moteurG.info.textContent=sim.grille?"grillé":m.tourne?(m.couplage||(sch.moteur.afficheSens?"sens "+m.sens:"")):"";
  }
}

/* ---------- simulateur ---------- */
function ouvrir(main,id){
  const sch=schemas().find(s=>s.id===id);
  if(!sch){main.innerHTML=`<p class="lead">Ce schéma n'existe pas. <a href="#/atelier">Retour à l'Atelier</a></p>`;return ()=>{};}
  const sim=new window.ElecSimulation(sch);
  let phases=false, vue="tous", timer=null, detruit=false;
  const multi=sch.folios.length>1;

  main.innerHTML=`
    <a class="retour" href="#/atelier">← Atelier</a>
    <div class="page-head"><div>
      <h1>${esc(sch.titre)}</h1>
      <p class="lead">${esc(sch.resume)}</p>
    </div><div class="etat" id="etat" data-s="arret" role="status" aria-live="polite">Moteur à l'arrêt</div></div>
    <div class="sim">
      <div class="folios-zone">
        ${multi?`<div class="segment" role="group" aria-label="Folios affichés"><button type="button" data-vue="tous" aria-pressed="true">Les deux</button>${sch.folios.map((f,i)=>`<button type="button" data-vue="${i}" aria-pressed="false">${esc(f.titre)}</button>`).join("")}</div>`:""}
        <div class="folios" id="folios"></div>
      </div>
      <div class="panneau">
        <section class="bloc" aria-label="Pupitre">
          <h2>Pupitre</h2>
          <div class="poussoirs" id="poussoirs"></div>
          <div class="appareils" id="appareils"></div>
        </section>
        <section class="bloc" aria-label="Explications">
          <h2>Ce qui se passe</h2>
          <ul class="explications" id="explications" aria-live="polite"></ul>
        </section>
        <section class="bloc" aria-label="Défauts et options">
          <h2>Défauts et options</h2>
          <div class="actions" id="defauts"></div>
          <label class="option"><input type="checkbox" id="optPhases"> Repérer les phases L1, L2, L3</label>
          <div class="legende" id="legende"></div>
          <p class="astuce">Tu peux aussi toucher les appareils directement sur le schéma.</p>
        </section>
      </div>
    </div>`;

  /* folios */
  const feuilles=[];
  const zoneF=main.querySelector("#folios");
  sch.folios.forEach((f,i)=>{
    const box=document.createElement("figure");box.className="feuille";box.style.margin="0";box.dataset.i=i;
    box.innerHTML=`<h3>${esc(f.titre)}</h3><div class="defile"></div>`;
    const svg=document.createElementNS(D.NS,"svg");
    svg.setAttribute("role","img");svg.setAttribute("aria-label","Schéma : "+f.titre);
    box.querySelector(".defile").appendChild(svg);
    zoneF.appendChild(box);
    const F=D.construire(svg,f);
    (f.zones||[]).forEach(([app,x1,y1,x2,y2,label])=>branche(F.zone(x1,y1,x2,y2,label),app,true));
    feuilles.push(F);
  });
  main.querySelectorAll(".segment button").forEach(b=>b.addEventListener("click",()=>{
    vue=b.dataset.vue;
    main.querySelectorAll(".segment button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));
    zoneF.querySelectorAll(".feuille").forEach(fe=>fe.hidden=!(vue==="tous"||fe.dataset.i===vue));
  }));

  /* pupitre */
  const zP=main.querySelector("#poussoirs");
  sch.pupitre.poussoirs.forEach(p=>{
    const b=document.createElement("button");b.type="button";b.className="bp "+(p.style||"marche");b.textContent=p.titre;
    branche(b,p.app,false);zP.appendChild(b);
  });
  const zA=main.querySelector("#appareils"),btnApp={};
  sch.pupitre.appareils.forEach(p=>{
    const b=document.createElement("button");b.type="button";b.className="app-btn";
    b.innerHTML=`<span><b>${esc(p.app)}</b><br><small>${esc(p.sous)}</small></span><span class="pos"></span>`;
    b.addEventListener("click",()=>{sim.basculer(p.app);rendre();});
    zA.appendChild(b);btnApp[p.app]=b;
  });
  const zD=main.querySelector("#defauts");
  sch.defauts.forEach(d=>{
    const b=document.createElement("button");b.type="button";b.className="btn btn-danger";b.textContent=d.titre;
    b.addEventListener("click",()=>{sim.declencher(d.app);rendre();});zD.appendChild(b);
  });
  const rz=document.createElement("button");rz.type="button";rz.className="btn";rz.textContent="Remettre à zéro";
  rz.addEventListener("click",()=>{sim.reinitialiser();rendre();});zD.appendChild(rz);
  main.querySelector("#optPhases").addEventListener("change",e=>{phases=e.target.checked;legende();rendre();});
  function legende(){
    main.querySelector("#legende").innerHTML=phases
      ?`<span><i style="background:var(--ph-L1)"></i>L1</span><span><i style="background:var(--ph-L2)"></i>L2</span><span><i style="background:var(--ph-L3)"></i>L3</span><span><i style="background:var(--neutre)"></i>neutre / 0 V</span><span><i style="background:var(--mort)"></i>hors tension</span>`
      :`<span><i style="background:var(--vif)"></i>sous tension</span><span><i style="background:var(--neutre)"></i>neutre / 0 V</span><span><i style="background:var(--mort)"></i>hors tension</span>`;
  }
  legende();

  /* ---------- interactions ---------- */
  function branche(el,app,surSchema){
    const def=sch.appareils[app]; if(!def)return;
    if(def.type==="poussoir"){
      const bas=e=>{e.preventDefault();el.classList.add("appuye");if(sim.appuyer(app,true))rendre();};
      const haut=()=>{el.classList.remove("appuye");if(sim.appuyer(app,false))rendre();};
      el.addEventListener("pointerdown",bas);el.addEventListener("pointerup",haut);
      el.addEventListener("pointerleave",haut);el.addEventListener("pointercancel",haut);
      el.addEventListener("contextmenu",e=>e.preventDefault());
      el.addEventListener("keydown",e=>{if((e.key===" "||e.key==="Enter")&&!e.repeat){e.preventDefault();el.classList.add("appuye");if(sim.appuyer(app,true))rendre();}});
      el.addEventListener("keyup",e=>{if(e.key===" "||e.key==="Enter"){el.classList.remove("appuye");if(sim.appuyer(app,false))rendre();}});
    } else {
      el.addEventListener("click",()=>{sim.basculer(app);rendre();});
      if(surSchema)el.addEventListener("keydown",e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();sim.basculer(app);rendre();}});
    }
  }

  /* ---------- rendu ---------- */
  function libelle(app){
    const a=sim.app[app],def=sch.appareils[app];
    if(a.type==="manuel")return a.declenche?[def.declencheLib||"déclenché","defaut"]:a.ferme?["fermé","ferme"]:["ouvert","ouvert"];
    if(a.type==="au")return a.appuye?["enfoncé","au"]:["déverrouillé","ferme"];
    if(a.type==="thermique")return a.declenche?["déclenché","defaut"]:["armé","arme"];
    return ["",""];
  }
  function rendre(){
    if(detruit)return;
    feuilles.forEach(F=>peindre(F,sim,sch,phases));
    // pupitre
    for(const [app,b] of Object.entries(btnApp)){const [t,p]=libelle(app);b.dataset.pos=p;b.querySelector(".pos").textContent=t;}
    // état général
    const m=sim.mot||{},e=main.querySelector("#etat");
    const defaut=Object.values(sim.app).some(a=>a.declenche);
    if(m.tourne){e.dataset.s="marche";e.textContent=m.couplage?"Marche en "+m.couplage:(sch.moteur.afficheSens?"Marche sens "+m.sens:"Moteur en marche");}
    else if(defaut){e.dataset.s="defaut";e.textContent="Défaut";}
    else {e.dataset.s="arret";e.textContent="Moteur à l'arrêt";}
    // explications
    let L=sch.explications(sim.aide());
    if(sim.court&&sim.app[sim.court.app].declenche)L=[[sim.court.texte,"ko"],...L.filter(x=>x[0]!==sim.court.texte)];
    const ul=main.querySelector("#explications");ul.innerHTML="";
    L.forEach(([t,c])=>{const li=document.createElement("li");li.textContent=t;if(c)li.className=c;ul.appendChild(li);});
    // temporisation en cours
    if(sim.echeance!=null&&!timer)timer=setInterval(()=>{if(detruit)return;sim.resoudre();rendre();if(sim.echeance==null){clearInterval(timer);timer=null;}},100);
  }
  rendre();
  return ()=>{detruit=true;if(timer)clearInterval(timer);};
}

window.ElecAtelier={liste,ouvrir,peindre};
})();
