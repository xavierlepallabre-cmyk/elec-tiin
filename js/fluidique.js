/* Élec TIIN — Fluidique : simulateurs pneumatiques et hydrauliques.
   Les conduites sont classées en « sous pression » (reliées à la source), « à l'échappement »
   (reliées à l'atmosphère ou au réservoir) ou « isolées ». Une chambre isolée qui porte une charge
   garde une pression piégée. */
(function(){
"use strict";
const F=()=>window.ElecFluide;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const circuits=()=>window.ELEC_FLUIDIQUE||[];

function liste(main){
  main.innerHTML=`
    <div class="page-head"><div>
      <p class="tag"><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>Fluidique</p>
      <h1>Pneumatique et hydraulique</h1>
      <p class="lead">Manœuvre les distributeurs et règle les composants. Les conduites sous pression passent en bleu, la tige du vérin suit. Symboles ISO 1219-1, repérage des orifices ISO 5599.</p>
    </div></div>
    <div class="cartes" id="cartes"></div>`;
  const z=main.querySelector("#cartes");
  circuits().forEach(c=>{
    const a=document.createElement("a");a.className="carte";a.href="#/fluidique/"+c.id;
    a.innerHTML=`<div class="apercu"></div><div class="corps"><span class="chip" style="justify-self:start">${c.type==="pneu"?"Pneumatique":"Hydraulique"}</span><h2>${esc(c.titre)}</h2><p class="lead" style="margin:0">${esc(c.resume)}</p>
      <div class="chips">${c.notions.map(n=>`<span class="chip">${esc(n)}</span>`).join("")}</div><span class="ouvrir">Ouvrir le simulateur →</span></div>`;
    const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.setAttribute("aria-hidden","true");
    const P=new (F().Planche)(svg,c.vue[0],c.vue[1]);c.dessin(P);
    Object.keys(P.verins).forEach(id=>P.placerVerin(id,0,"transparent","transparent"));
    a.querySelector(".apercu").appendChild(svg);z.appendChild(a);
  });
  return ()=>{};
}

function ouvrir(main,id){
  const c=circuits().find(x=>x.id===id);
  if(!c){main.innerHTML=`<p class="lead">Ce circuit n'existe pas. <a href="#/fluidique">Retour</a></p>`;return ()=>{};}
  const st={pos:{},t:{},vanneOuverte:true,pompe:false,reglages:{},options:{},appuis:{},grille:false};
  let P,detruit=false,raf=null,dernier=performance.now(),cls={},hydro={};
  (c.reglages||[]).forEach(r=>st.reglages[r.id]=r.val);
  (c.options||[]).forEach(o=>st.options[o.id]=o.val);

  main.innerHTML=`
    <a class="retour" href="#/fluidique">← Fluidique</a>
    <div class="page-head"><div><p class="tag">${c.type==="pneu"?"Pneumatique":"Hydraulique"}</p><h1>${esc(c.titre)}</h1><p class="lead">${esc(c.resume)}</p></div>
      <div class="etat" id="etat" data-s="arret" role="status" aria-live="polite"></div></div>
    <div class="sim">
      <div class="folios-zone"><figure class="feuille" style="margin:0"><h3>Schéma ${c.type==="pneu"?"pneumatique":"hydraulique"}</h3><div class="defile" id="planche"></div></figure>
        <div class="legende"><span><i style="background:var(--neutre)"></i>sous pression</span><span><i style="background:#8E44AD"></i>pression piégée</span><span><i style="background:var(--mort)"></i>échappement ou réservoir</span></div></div>
      <div class="panneau">
        <section class="bloc" aria-label="Commandes"><h2>Commandes</h2><div class="actions-col" id="cmd"></div></section>
        ${(c.reglages||[]).length||(c.options||[]).length?`<section class="bloc" aria-label="Réglages"><h2>Réglages</h2><div class="actions-col" id="regl"></div></section>`:""}
        <section class="bloc" aria-label="Ce qui se passe"><h2>Ce qui se passe</h2><ul class="explications" id="expl" aria-live="polite"></ul></section>
      </div>
    </div>`;
  const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.setAttribute("role","img");svg.setAttribute("aria-label","Schéma "+c.titre);
  main.querySelector("#planche").appendChild(svg);
  P=new (F().Planche)(svg,c.vue[0],c.vue[1]);c.dessin(P);
  Object.entries(P.distrib).forEach(([k,D])=>st.pos[k]=D.d.ref);
  (c.verins||[]).forEach(v=>st.t[v.id]=0);

  /* ---------- commandes ---------- */
  const zc=main.querySelector("#cmd");
  function maintenir(el,cm){
    const bas=e=>{e.preventDefault();el.classList.add("appuye");st.pos[cm.dist]=cm.pos;maj();};
    const haut=()=>{if(!el.classList.contains("appuye"))return;el.classList.remove("appuye");st.pos[cm.dist]=cm.repos;maj();};
    el.addEventListener("pointerdown",bas);el.addEventListener("pointerup",haut);el.addEventListener("pointerleave",haut);el.addEventListener("pointercancel",haut);
    el.addEventListener("keydown",e=>{if((e.key===" "||e.key==="Enter")&&!e.repeat)bas(e);});el.addEventListener("keyup",e=>{if(e.key===" "||e.key==="Enter")haut();});
  }
  (c.commandes||[]).forEach(cm=>{
    if(cm.type==="maintenu"){const b=document.createElement("button");b.type="button";b.className="bp marche";b.textContent=cm.titre;maintenir(b,cm);zc.appendChild(b);}
    if(cm.type==="impulsion"){const b=document.createElement("button");b.type="button";b.className="bp marche";b.textContent=cm.titre;
      b.onclick=()=>{st.pos[cm.dist]=cm.pos;maj();};zc.appendChild(b);}
    if(cm.type==="levier"){const l=document.createElement("div");l.className="choix-ligne";
      [[cm.gauche,cm.posG],[cm.droite,cm.posD]].forEach(([t,p])=>{const b=document.createElement("button");b.type="button";b.className="bp marche";b.textContent=t+" (maintenir)";
        maintenir(b,{dist:cm.dist,pos:p,repos:cm.repos});l.appendChild(b);});zc.appendChild(l);}
  });
  (c.zones||[]).forEach(([x,y,w,h,label,cid])=>{const cm=c.commandes.find(k=>k.id===cid);const z=P.zone(x,y,w,h,label);
    if(cm.type==="impulsion")z.addEventListener("click",()=>{st.pos[cm.dist]=cm.pos;maj();});else maintenir(z,cm);});
  if(c.vanne){const b=document.createElement("button");b.type="button";b.className="btn";b.id="vanne";
    b.onclick=()=>{st.vanneOuverte=!st.vanneOuverte;st.pos.V0=st.vanneOuverte?0:1;maj();};zc.appendChild(b);}
  if(c.pompe){const b=document.createElement("button");b.type="button";b.className="btn";b.id="pompe";
    b.onclick=()=>{st.pompe=!st.pompe;maj();};zc.appendChild(b);}
  const zr=main.querySelector("#regl");
  (c.reglages||[]).forEach(r=>{const d=document.createElement("label");d.className="reglage";
    d.innerHTML=`<span>${esc(r.titre)} <b id="v_${r.id}">${st.reglages[r.id]} ${r.unite||"%"}</b></span><input type="range" id="r_${r.id}" min="${r.min}" max="${r.max}" step="${r.unite?5:5}" value="${st.reglages[r.id]}">`;
    d.querySelector("input").oninput=e=>{st.reglages[r.id]=+e.target.value;d.querySelector("b").textContent=st.reglages[r.id]+" "+(r.unite||"%");maj();};zr.appendChild(d);});
  (c.options||[]).forEach(o=>{const d=document.createElement("label");d.className="option";
    d.innerHTML=`<input type="checkbox" id="o_${o.id}"${st.options[o.id]?" checked":""}> ${esc(o.titre)}`;
    d.querySelector("input").onchange=e=>{st.options[o.id]=e.target.checked;maj();};zr.appendChild(d);});
  if(zr&&c.type==="hydro"){const r=document.createElement("button");r.type="button";r.className="btn";r.textContent="Remettre la charge en bas";
    r.onclick=()=>{st.t["1A"]=0;st.grille=false;maj();};zr.appendChild(r);}

  /* ---------- réseaux ---------- */
  function classer(){
    const parent={},tr=n=>{if(!(n in parent))parent[n]=n;while(parent[n]!==n){parent[n]=parent[parent[n]];n=parent[n];}return n;};
    const un=(a,b)=>{a=tr(a);b=tr(b);if(a!==b)parent[a]=b;};
    P.lignes.forEach(l=>tr(l.net));
    Object.values(P.distrib).forEach(D=>{const pos=st.pos[D.d.id];(D.d.chemins[pos]||[]).forEach(([a,b])=>un(D.d.ports[a].net,D.d.ports[b].net));});
    (c.liaisons||[]).forEach(([a,b])=>un(a,b));
    const actif=n=>c.type==="hydro"?st.pompe:true;
    const calc=()=>{const k={};const grp={};
      Object.keys(parent).forEach(n=>{const r=tr(n);(grp[r]=grp[r]||[]).push(n);});
      for(const r in grp){const ns=grp[r];const p=ns.some(n=>c.sources.includes(n)&&actif(n));const e=ns.some(n=>c.echap.includes(n));
        ns.forEach(n=>k[n]=p?"P":e?"E":"I");}
      return k;};
    let k=calc();
    if(c.type==="hydro"){ // clapet anti-retour piloté : passage libre nA→cA, retour seulement si le pilotage (nB) est sous pression
      const ouvert=!st.options.clapet||k.nA==="P"||k.nB==="P";
      if(ouvert){un("cA","nA");k=calc();}
    }
    return k;
  }

  /* ---------- dynamique ---------- */
  function vitesse(v,dt){
    const t=st.t[v.id];let vit=0;
    if(v.type==="simple"){if(cls[v.A]==="P")vit=1/0.5;else if(cls[v.A]==="E")vit=-1/0.6;}
    if(v.type==="double"){
      const A=cls[v.A],B=cls[v.B];
      if(A==="P"&&B==="E")vit=1/(0.9/((v.regB?st.reglages[v.regB]:100)/100));
      else if(B==="P"&&A==="E")vit=-1/(0.9/((v.regA?st.reglages[v.regA]:100)/100));
    }
    if(v.type==="hydro"){
      const M=[];const pc=50,tar=st.reglages.tarage,A=cls.cA,B=cls.nB;let mano=0,piege=false;
      if(st.grille){M.push(["Il faut toujours garder la charge sous contrôle. Remets la charge en bas pour recommencer.","ko"]);}
      if(st.pompe&&A==="P"&&B==="E"){
        if(tar<pc){mano=tar;M.push([`Le limiteur est taré à ${tar} bar, moins que les ${pc} bar nécessaires pour soulever la charge : il s'ouvre et renvoie toute l'huile au réservoir. Le vérin ne bouge pas.`,"ko"]);}
        else if(t<1){vit=1/3;mano=pc;M.push([`Levier sur « Monter » : P relié à A. L'huile passe librement le clapet 1V2 et soulève la charge. Il faut ${pc} bar pour la porter.`,"ok"]);}
        else{mano=tar;M.push([`Vérin en fin de course : l'huile ne peut plus avancer, la pression monte jusqu'au tarage (${tar} bar) et le limiteur s'ouvre vers le réservoir. L'huile s'échauffe : on ne laisse pas une centrale tourner ainsi.`,""]);}
      }
      else if(st.pompe&&B==="P"&&A==="E"){vit=-1/3;mano=15;M.push(["Levier sur « Descendre » : P relié à B. La pression dans B pilote l'ouverture du clapet 1V2 : l'huile de la chambre A retourne au réservoir et la charge descend sous contrôle.","ok"]);}
      else if(A==="E"&&!st.pompe){vit=-1/1.2;M.push(["Sans pompe et sans clapet piloté, le levier sur « Descendre » relie A au réservoir : la charge tombe sous son propre poids. Danger !","ko"]);}
      else if(A==="I"){
        if(st.options.clapet){piege=t>0.01;M.push([st.pompe?"Levier au centre : tous les orifices sont fermés. Le clapet 1V2 bloque la chambre A : la charge tient en position.":"Pompe arrêtée : le clapet 1V2 maintient la charge en hauteur.",""]);
          if(piege)M.push([`Pression piégée d'environ ${pc} bar dans la chambre A et la conduite jusqu'au clapet, et énergie potentielle de la charge. Avant d'intervenir : descendre la charge ou la caler mécaniquement, puis décomprimer.`,"ko"]);}
        else if(t>0){vit=-1/25;M.push(["Sans clapet piloté, la chambre A n'est retenue que par le tiroir du distributeur, qui n'est jamais parfaitement étanche : la charge descend lentement. C'est le rôle du clapet piloté d'empêcher cette dérive.","ko"]);}
        if(st.pompe){mano=tar;M.push([`La pompe débite toujours : centre fermé, l'huile ne peut passer que par le limiteur, à ${tar} bar.`,""]);}
      }
      if(!st.pompe&&!M.length)M.push(["Centrale arrêtée.",""]);
      hydro={messages:M,mano,piege};
    }
    st.t[v.id]=Math.min(1,Math.max(0,t+vit*dt));
    return vit;
  }

  /* ---------- rendu ---------- */
  function couleur(n){const k=cls[n];if(k==="P")return "var(--neutre)";if(k==="I"&&hydro.piege&&(n==="cA"))return "#8E44AD";return "var(--mort)";}
  function peindre(){
    P.lignes.forEach(l=>{const col=couleur(l.net);if(l.jonc)l.e.style.fill=col;else l.e.style.stroke=col;});
    Object.entries(st.pos).forEach(([k,p])=>P.positionner(k,p));
    (c.verins||[]).forEach(v=>{
      const ca=cls[v.A]==="P"?"#1F62D155":(couleur(v.A)==="#8E44AD"?"#8E44AD55":"transparent"),cb=v.B&&cls[v.B]==="P"?"#1F62D155":"transparent";
      P.placerVerin(v.id,st.t[v.id],ca,cb);});
    Object.entries(c.manos||{}).forEach(([m,n])=>{const t=P.manos[m];if(!t)return;
      t.textContent=c.type==="hydro"?`${Math.round(hydro.mano||0)} bar`:(cls[n]==="P"?"6 bar":"0 bar");});
    if(P.moteurC)P.moteurC.classList.toggle("on",st.pompe);
    if(P.limFleche&&c.type==="hydro"){const ouvre=st.pompe&&(hydro.mano||0)>=st.reglages.tarage;P.limFleche.setAttribute("transform",ouvre?"translate(-5 0)":"");P.limFleche.classList.toggle("ouvert",ouvre);}
    // état
    const v=(c.verins||[])[0],t=st.t[v.id],e=main.querySelector("#etat");
    const mv=Math.abs(st.vit||0)>1e-6;
    e.dataset.s=mv?"marche":"arret";
    e.textContent=mv?(st.vit>0?(c.type==="hydro"?"Charge en montée":"Tige en sortie"):(c.type==="hydro"?"Charge en descente":"Tige en rentrée")):t>=0.999?(c.type==="hydro"?"Charge en haut":"Tige sortie"):t<=0.001?(c.type==="hydro"?"Charge en bas":"Tige rentrée"):(c.type==="hydro"?"Charge maintenue":"Tige à l'arrêt");
    const vb=main.querySelector("#vanne");if(vb)vb.textContent=st.vanneOuverte?"Fermer la vanne 0V1 (couper l'air)":"Ouvrir la vanne 0V1";
    const pb=main.querySelector("#pompe");if(pb){pb.textContent=st.pompe?"Arrêter la centrale":"Démarrer la centrale";pb.classList.toggle("btn-primary",!st.pompe);}
    const L=c.explications({cls,vanneOuverte:st.vanneOuverte,reglages:st.reglages,pos:st.pos,hydro});
    const html=L.map(([t,k])=>`<li${k?` class="${k}"`:""}>${esc(t)}</li>`).join("");
    const ul=main.querySelector("#expl");if(ul.innerHTML!==html)ul.innerHTML=html;
  }
  function boucle(now){
    if(detruit)return;
    const dt=Math.min(0.05,(now-dernier)/1000);dernier=now;
    cls=classer();
    let dv=0;(c.verins||[]).forEach(v=>{const t0=st.t[v.id];vitesse(v,dt);dv=st.t[v.id]-t0;});st.vit=dt>0?dv/dt:0;
    peindre();
    raf=requestAnimationFrame(boucle);
  }
  function maj(){cls=classer();peindre();}
  raf=requestAnimationFrame(boucle);
  return ()=>{detruit=true;if(raf)cancelAnimationFrame(raf);};
}
window.ElecFluidique={liste,ouvrir};
})();
