/* Élec TIIN — Dépannage : trouver une panne cachée avec un multimètre virtuel.
   Le schéma montre l'état « vu de l'extérieur » (contacteurs collés ou non, moteur, voyants) ;
   la panne n'est visible qu'à la mesure. Aucun résultat n'est enregistré. */
(function(){
"use strict";
const D=window.ElecDessin;
const DATA=()=>window.ELEC_DEPANNAGE;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const schemaBase=id=>window.ELEC_SCHEMAS.find(s=>s.id===id);
const PHASES3=["L1","L2","L3"];

/* ---------- libellés ---------- */
function libContact(c){
  const b=c.b?c.b.join("-"):"";
  if(c.type==="kmp")return `${c.app} pôle ${b}`;
  if(c.type==="sectfus")return `${c.app} pôle (fusible) ${["L1","L2","L3"][[0,0.8,1.6].indexOf(c.x)]||""}`.trim();
  if(c.type==="disj"||c.type==="disjs"||c.type==="isect"||c.type==="sect")return `${c.app} pôle ${b}`.trim();
  const t=c.mode==="tno"||c.mode==="tnf"?" temporisé":"";
  return `${c.app} contact${t} ${b}`.trim();
}
function chargesDessinees(sch){
  const L=[];
  sch.folios.forEach((f,fi)=>(f.dessin||[]).forEach(d=>{
    if(d[0]==="bobine"||d[0]==="voyant")L.push({type:d[0],id:d[1],x:d[2],y:d[3],a:d[4],b:d[5],lab:d[6],f:fi});
  }));
  return L;
}

/* ---------- liste ---------- */
function liste(main){
  const P=DATA().pannes;
  const groupes=["direct-un-sens","deux-sens","etoile-triangle"].map(id=>({sch:schemaBase(id),pannes:P.filter(p=>p.schema===id)}));
  main.innerHTML=`
    <div class="page-head"><div>
      <p class="tag"><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>Dépannage</p>
      <h1>Trouver la panne</h1>
      <p class="lead">Une panne est cachée dans un schéma de l'Atelier. Fais fonctionner l'installation, mesure avec le multimètre, puis désigne l'élément défaillant. Plusieurs pannes donnent le même symptôme : seule la mesure permet de conclure.</p>
    </div><button type="button" class="btn btn-primary" id="hasard">Panne au hasard</button></div>
    <section class="bloc" style="margin-bottom:16px"><h2>La méthode</h2>
      <ol class="etapes-fl">${DATA().methode.map(([t,x],i)=>`<li><span class="n">${i+1}</span><div><b>${esc(t)}</b><p>${esc(x)}</p></div></li>`).join("")}</ol></section>
    ${groupes.map(g=>`<section style="margin-bottom:18px"><h2 style="margin-bottom:10px">${esc(g.sch.titre)}</h2>
      <div class="niveaux">${g.pannes.map((p,i)=>`<a class="niveau" href="#/depannage/${p.id}"><span class="num">Panne ${i+1}</span><p style="margin:0">${esc(p.symptome)}</p><span style="font-weight:600;color:var(--brand-text);font-size:14px">Diagnostiquer →</span></a>`).join("")}</div></section>`).join("")}`;
  main.querySelector("#hasard").onclick=()=>{location.hash="#/depannage/"+P[Math.floor(Math.random()*P.length)].id;};
  return ()=>{};
}

/* ---------- une panne ---------- */
function ouvrir(main,pid){
  const panne=DATA().pannes.find(p=>p.id===pid);
  if(!panne){main.innerHTML=`<p class="lead">Cette panne n'existe pas. <a href="#/depannage">Retour au Dépannage</a></p>`;return ()=>{};}
  const sch=JSON.parse(JSON.stringify(schemaBase(panne.schema)));
  const R=DATA().resistances[panne.schema];
  const charges=chargesDessinees(sch);
  let sim,feuilles=[],detruit=false,minuteur=null,aide=false;
  const mm={mode:"V",rouge:null,noire:null,journal:[],nb:0};
  let essais=0,trouve=false;
  const maintenus={};

  main.innerHTML=`
    <a class="retour" href="#/depannage">← Dépannage</a>
    <div class="page-head"><div>
      <p class="tag">${esc(sch.titre)}</p>
      <h1>Diagnostic de panne</h1>
    </div><div class="etat" id="etat" data-s="arret" role="status" aria-live="polite"></div></div>
    <div class="sim">
      <div class="folios-zone">
        <p class="consigne"><b>Symptôme signalé :</b> ${esc(panne.symptome)}</p>
        <div class="folios pile" id="folios"></div>
      </div>
      <div class="panneau">
        <section class="bloc" aria-label="Pupitre"><h2>Pupitre</h2>
          <div class="poussoirs-dep" id="poussoirs"></div>
          <div class="appareils" id="appareils"></div>
          <label class="option"><input type="checkbox" id="aide"> Afficher les tensions sur le schéma (aide)</label>
        </section>
        <section class="bloc mm" aria-label="Multimètre"><h2>Multimètre</h2>
          <div class="mm-ecran" id="ecran" aria-live="polite">— — —</div>
          <div class="segment" role="group" aria-label="Calibre"><button type="button" data-m="V" aria-pressed="true">V~ tension</button><button type="button" data-m="R" aria-pressed="false">Ω résistance</button></div>
          <div class="mm-pointes"><span><i class="pt rouge"></i><b id="pRouge">—</b></span><span><i class="pt noire"></i><b id="pNoire">—</b></span></div>
          <p class="astuce" id="mmAide">Touche deux bornes du schéma (points orange) : la première reçoit la pointe rouge, la seconde la pointe noire.</p>
          <ul class="mm-journal" id="mmJournal"></ul>
        </section>
        <section class="bloc" aria-label="Diagnostic"><h2>Diagnostic</h2>
          <label class="sous-titre" for="choixElement">Élément défaillant</label>
          <select id="choixElement" class="select"></select>
          <button type="button" class="btn btn-primary" id="valider">Valider le diagnostic</button>
          <div class="verdict" id="verdict" hidden aria-live="polite"></div>
        </section>
        <div class="actions"><button type="button" class="btn" id="recommencer">Remettre l'installation au repos</button></div>
      </div>
    </div>`;

  /* ---------- construction ---------- */
  function construire(){
    if(minuteur){clearInterval(minuteur);minuteur=null;}
    sim=new window.ElecSimulation(sch);sim.definirPannes(panne.defaut);
    for(const k in maintenus)delete maintenus[k];
    const zone=main.querySelector("#folios");zone.innerHTML="";feuilles=[];
    sch.folios.forEach((f,fi)=>{
      const box=document.createElement("figure");box.className="feuille";box.style.margin="0";
      box.innerHTML=`<h3>${esc(f.titre)}</h3><div class="defile"></div>`;
      const svg=document.createElementNS(D.NS,"svg");svg.setAttribute("role","img");svg.setAttribute("aria-label","Schéma : "+f.titre);
      box.querySelector(".defile").appendChild(svg);zone.appendChild(box);
      const F=D.construire(svg,f);feuilles.push(F);
      (f.zones||[]).forEach(([app,x1,y1,x2,y2,label])=>brancher(F.zone(x1,y1,x2,y2,label),app));
      // points de mesure
      F.points=[];const gP=D.el("g",{class:"mm-points"},F.svg);
      const ajouter=(x,y,net,lab)=>{
        const ex=F.points.find(p=>p.net===net&&Math.hypot(p.x-x,p.y-y)<0.2);
        if(ex){ex.lab+=" / "+lab;ex.c.setAttribute("aria-label","Borne "+ex.lab);return;}
        const c=D.el("circle",{cx:F.X(x),cy:F.Y(y),r:7,class:"mm-pt",tabindex:0,role:"button","aria-label":"Borne "+lab},gP);
        const p={x,y,net,lab,c,F};F.points.push(p);
        const choisir=e=>{e.stopPropagation();pointe(p);};
        c.addEventListener("click",choisir);c.addEventListener("keydown",e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();choisir(e);}});
      };
      (f.contacts||[]).forEach(c=>{if(c.rot)return;const H=c.type==="sectfus"?1.4:1.2;
        ajouter(c.x,c.y,c.haut,`${c.app} ${c.b?c.b[0]:"amont"}`);ajouter(c.x,c.y-H,c.bas,`${c.app} ${c.b?c.b[1]:"aval"}`);});
      charges.filter(ch=>ch.f===fi).forEach(ch=>{const t=ch.type==="bobine"?["A1","A2"]:["X1","X2"];
        ajouter(ch.x,ch.y,ch.a,`${ch.lab} ${t[0]}`);ajouter(ch.x,ch.y-1.2,ch.b,`${ch.lab} ${t[1]}`);});
    });
    mm.rouge=mm.noire=null;
    rendre();
  }

  /* ---------- interactions ---------- */
  function brancher(el,app){
    const def=sch.appareils[app];if(!def)return;
    if(def.type==="poussoir"){
      const bas=e=>{e.preventDefault();el.classList.add("appuye");if(sim.appuyer(app,true))rendre();};
      const haut=()=>{el.classList.remove("appuye");if(maintenus[app])return;if(sim.appuyer(app,false))rendre();};
      el.addEventListener("pointerdown",bas);el.addEventListener("pointerup",haut);el.addEventListener("pointerleave",haut);el.addEventListener("pointercancel",haut);
    } else el.addEventListener("click",()=>{sim.basculer(app);rendre();});
  }
  function pupitre(){
    const zP=main.querySelector("#poussoirs");zP.innerHTML="";
    sch.pupitre.poussoirs.forEach(p=>{
      const l=document.createElement("div");l.className="pous-ligne";
      const b=document.createElement("button");b.type="button";b.className="bp "+(p.style||"marche");b.textContent=p.titre;brancher(b,p.app);
      const m=document.createElement("button");m.type="button";m.className="btn maintien";m.setAttribute("aria-pressed","false");
      m.textContent="Maintenir";m.title="Un collègue maintient le bouton appuyé pendant que tu mesures";
      m.onclick=()=>{maintenus[p.app]=!maintenus[p.app];m.setAttribute("aria-pressed",String(!!maintenus[p.app]));m.textContent=maintenus[p.app]?"Maintenu":"Maintenir";
        b.classList.toggle("appuye",!!maintenus[p.app]);sim.appuyer(p.app,!!maintenus[p.app]);rendre();};
      l.append(b,m);zP.appendChild(l);
    });
    const zA=main.querySelector("#appareils");zA.innerHTML="";
    const apps=Object.entries(sch.appareils).filter(([k,d])=>d.type==="manuel"||d.type==="au"||d.type==="thermique").map(([k])=>k);
    apps.forEach(k=>{const b=document.createElement("button");b.type="button";b.className="app-btn";b.dataset.app=k;
      b.innerHTML=`<span><b>${esc(k)}</b><br><small>${esc(sch.appareils[k].nom)}</small></span><span class="pos"></span>`;
      b.onclick=()=>{sim.basculer(k);rendre();};zA.appendChild(b);});
  }

  /* ---------- multimètre ---------- */
  const liens=()=>{ // récepteurs et enroulements : passages possibles pour le potentiel et l'ohmmètre
    const L=[];const coupees=sim.pannes.coupees;
    sch.charges.forEach(c=>{if(!coupees.has(c.id))L.push({a:c.a,b:c.b,r:c.type==="transfo"?R.transfo:c.type==="voyant"?R.voyant:R.bobine});});
    const m=sch.moteur;
    if(m&&m.type==="direct"){const b=m.bornes;L.push({a:b[0],b:b[1],r:R.enroulement},{a:b[1],b:b[2],r:R.enroulement},{a:b[0],b:b[2],r:R.enroulement});}
    if(m&&m.type==="etoile-triangle"){const b=m.bornes;[["U1","U2"],["V1","V2"],["W1","W2"]].forEach(([x,y])=>L.push({a:b[x],b:b[y],r:R.enroulement}));}
    return L;
  };
  function potentiel(net){
    const t=sim.trouve,s0=sim.sourcesDe(net);
    if(s0.length)return s0;
    const L=liens(),vus=new Set([t(net)]);let front=[t(net)];
    for(let d=0;d<4&&front.length;d++){
      const suiv=[];
      for(const e of front)for(const l of L){
        const ea=t(l.a),eb=t(l.b),o=ea===e?eb:eb===e?ea:null;
        if(o===null||vus.has(o))continue;vus.add(o);
        const s=sim.srcComp[o]||[];if(s.length)return s;suiv.push(o);
      }
      front=suiv;
    }
    return [];
  }
  function tension(a,b){
    const pa=potentiel(a.net),pb=potentiel(b.net);
    if(!pa.length||!pb.length)return 0;
    const na=pa.map(s=>s.nom),nb=pb.map(s=>s.nom);
    if(na.some(n=>nb.includes(n)))return 0;
    const x=na[0],y=nb[0],tbt=n=>n==="24V"||n==="0V";
    if(tbt(x)!==tbt(y))return 0; // circuits séparés par le transformateur
    if(tbt(x))return 24;
    if(PHASES3.includes(x)&&PHASES3.includes(y))return 400;
    return 230;
  }
  function resistance(a,b){
    const vif=n=>potentiel(n).some(s=>s.type==="phase");
    if(vif(a.net)||vif(b.net))return null;
    const t=sim.trouve,ea=t(a.net),eb=t(b.net);
    if(ea===eb)return 0.1;
    const L=liens();const dist=new Map([[ea,0]]);let front=[ea];
    for(let d=0;d<3&&front.length;d++){
      const suiv=[];
      for(const e of front)for(const l of L){
        const x=t(l.a),y=t(l.b),o=x===e?y:y===e?x:null;
        if(o===null)continue;const v=dist.get(e)+l.r;
        if(!dist.has(o)||dist.get(o)>v){dist.set(o,v);suiv.push(o);}
      }
      front=suiv;
    }
    return dist.has(eb)?dist.get(eb):Infinity;
  }
  const fmtV=v=>v===0?"0,0 V":v+" V";
  const fmtR=r=>r===Infinity?"OL":r<1?r.toFixed(1).replace(".",",")+" Ω":r<1000?Math.round(r)+" Ω":(r/1000).toFixed(1).replace(".",",")+" kΩ";
  function pointe(p){
    if(!mm.rouge||mm.noire){mm.rouge=p;mm.noire=null;}else mm.noire=p;
    if(mm.rouge&&mm.noire)mesurer();
    rendre();
  }
  function mesurer(){
    const a=mm.rouge,b=mm.noire;let txt,cls="";
    if(mm.mode==="V"){txt=fmtV(tension(a,b));}
    else{const r=resistance(a,b);
      if(r===null){txt="Refusé";cls="ko";
        note("Mesure de résistance sur un circuit sous tension : interdit. Tu risques l'électrisation et la destruction de l'appareil. Coupe l'alimentation de ce circuit d'abord.");}
      else txt=fmtR(r);}
    mm.nb++;mm.affiche=txt;
    mm.journal.unshift([`${mm.mode==="V"?"V":"Ω"} · ${a.lab} → ${b.lab}`,txt,cls]);if(mm.journal.length>6)mm.journal.pop();
  }
  let message=null;
  function note(t){message=t;}

  /* ---------- diagnostic ---------- */
  function remplirChoix(){
    const s=main.querySelector("#choixElement");
    s.innerHTML=`<option value="">Choisis un élément…</option>`+sch.folios.map((f,fi)=>{
      const opts=[...(f.contacts||[]).filter(c=>!c.rot).map(c=>[c.id,libContact(c)]),
        ...charges.filter(ch=>ch.f===fi).map(ch=>[ch.id,(ch.type==="bobine"?"Bobine ":"Voyant ")+ch.lab])];
      opts.sort((x,y)=>x[1].localeCompare(y[1],"fr",{numeric:true}));
      return `<optgroup label="${esc(f.titre)}">${opts.map(([v,t])=>`<option value="${esc(v)}">${esc(t)}</option>`).join("")}</optgroup>`;
    }).join("");
  }
  main.querySelector("#valider").onclick=()=>{
    const v=main.querySelector("#choixElement").value,ver=main.querySelector("#verdict");
    if(!v){ver.hidden=false;ver.className="verdict ko";ver.innerHTML="<b>Choisis d'abord un élément dans la liste.</b>";return;}
    essais++;ver.hidden=false;
    const lib=main.querySelector("#choixElement").selectedOptions[0].textContent;
    if(panne.cibles.includes(v)){
      trouve=true;ver.className="verdict ok";
      ver.innerHTML=`<b>Bien trouvé : ${esc(lib)}.</b><span>${esc(panne.explication)}</span><span class="astuce">${mm.nb} mesure${mm.nb>1?"s":""}, ${essais} essai${essais>1?"s":""} de diagnostic. Ce résultat n'est pas enregistré.</span>
        <a class="btn btn-primary" href="#/depannage">Autre panne</a>`;
    } else {
      ver.className="verdict ko";
      ver.innerHTML=`<b>${esc(lib)} n'est pas en défaut.</b><span>${mm.nb?"Reprends tes mesures : un élément sain affiche 0 V s'il est fermé et la tension du circuit s'il est ouvert.":"Tu n'as fait aucune mesure : on ne remplace pas une pièce sans l'avoir vérifiée."}</span>
        ${essais>=2?`<button type="button" class="btn" id="solution">Voir la solution</button>`:""}`;
      const s=ver.querySelector("#solution");if(s)s.onclick=()=>{ver.innerHTML+=`<span><b>Solution :</b> ${esc(panne.explication)}</span>`;s.remove();};
    }
  };

  /* ---------- rendu ---------- */
  function rendre(){
    if(detruit)return;
    feuilles.forEach(F=>{
      window.ElecAtelier.peindre(F,sim,sch,false);
      // les contacts sont dessinés dans l'état de leur appareil : la panne ne se voit pas
      Object.values(F.contacts).forEach(c=>c.maj(sim.fermeNominal(c.spec),aide?c.lame.style.stroke:"var(--mort)"));
      if(!aide){F.fils.forEach(f=>f.e.style.stroke="var(--mort)");F.joncs.forEach(j=>j.e.style.fill="var(--mort)");}
      F.points.forEach(p=>{p.c.classList.toggle("rouge",mm.rouge===p);p.c.classList.toggle("noire",mm.noire===p);});
    });
    main.querySelectorAll(".app-btn").forEach(b=>{const a=sim.app[b.dataset.app];
      const [t,p]=a.type==="manuel"?(a.declenche?["déclenché","defaut"]:a.ferme?["fermé","ferme"]:["ouvert","ouvert"]):a.type==="au"?(a.appuye?["enfoncé","au"]:["déverrouillé","ferme"]):(a.declenche?["déclenché","defaut"]:["armé","arme"]);
      b.dataset.pos=p;b.querySelector(".pos").textContent=t;});
    const m=sim.mot||{},e=main.querySelector("#etat");
    if(m.tourne){e.dataset.s="marche";e.textContent=m.couplage?"Marche en "+m.couplage:"Moteur en marche";}
    else{e.dataset.s="arret";e.textContent="Moteur à l'arrêt";}
    main.querySelector("#ecran").textContent=mm.rouge&&mm.noire?mm.affiche:"— — —";
    main.querySelector("#ecran").classList.toggle("refuse",mm.affiche==="Refusé"&&!!mm.noire);
    main.querySelector("#pRouge").textContent=mm.rouge?mm.rouge.lab:"—";
    main.querySelector("#pNoire").textContent=mm.noire?mm.noire.lab:"—";
    main.querySelector("#mmJournal").innerHTML=mm.journal.map(([t,v,c])=>`<li${c?` class="${c}"`:""}><span>${esc(t)}</span><b>${esc(v)}</b></li>`).join("");
    main.querySelector("#mmAide").textContent=message||(mm.mode==="V"
      ?"Mesure de tension : installation sous tension, habilitation BR ou BE mesurage et EPI (gants isolants, écran facial). Touche deux bornes : pointe rouge, puis pointe noire."
      :"Mesure de résistance : uniquement hors tension. Coupe l'alimentation du circuit, puis touche deux bornes.");
    message=null;
    if(sim.echeance!=null&&!minuteur)minuteur=setInterval(()=>{if(detruit)return;sim.resoudre();rendre();if(sim.echeance==null){clearInterval(minuteur);minuteur=null;}},150);
  }

  main.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{mm.mode=b.dataset.m;
    main.querySelectorAll("[data-m]").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));
    if(mm.rouge&&mm.noire)mesurer();rendre();});
  main.querySelector("#aide").onchange=e=>{aide=e.target.checked;rendre();};
  main.querySelector("#recommencer").onclick=()=>{construire();pupitre();rendre();};
  construire();pupitre();remplirChoix();rendre();
  return ()=>{detruit=true;if(minuteur)clearInterval(minuteur);};
}

window.ElecDepannage={liste,ouvrir};
})();
