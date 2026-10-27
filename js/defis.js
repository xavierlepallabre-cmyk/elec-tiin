/* Élec TIIN — Défis : compléter un schéma à trous, puis le tester.
   La simulation joue le résultat, même faux : l'apprenti voit la conséquence d'une mauvaise pièce.
   Aucun résultat n'est enregistré. */
(function(){
"use strict";
const D=window.ElecDessin;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const melange=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const DATA=()=>window.ELEC_DEFIS;
const copie=o=>JSON.parse(JSON.stringify(o));
const schemaBase=id=>window.ELEC_SCHEMAS.find(s=>s.id===id);

/* ---------- étapes du test automatique ---------- */
const fondu=s=>!!(s.app.Q1&&s.app.Q1.declenche&&s.court);
const repos=s=>!Object.values(s.app).some(a=>a.type==="contacteur"&&a.ferme);
const COURT="Court-circuit : KM1 et KM2 se sont enclenchés ensemble, les fusibles de Q1 ont fondu.";
const sens=(n,m,s)=>m.tourne&&m.sens===n&&!fondu(s);
const ETAPES={
  repos:{txt:"Mise sous tension, sans toucher aux boutons",act:()=>{},ok:(m,s)=>!m.tourne&&repos(s),
    ko:(m,s)=>m.tourne?"Le moteur démarre tout seul, sans appui sur Marche.":"Un contacteur s'enclenche tout seul, sans appui sur Marche."},
  s2:{txt:"Appui sur S2 (Marche)",act:s=>s.appuyer("S2",true),ok:m=>m.tourne,ko:"Le moteur ne démarre pas quand on appuie sur S2."},
  relache:{txt:"On relâche S2",act:s=>s.appuyer("S2",false),ok:m=>m.tourne,ko:"Le moteur s'arrête dès qu'on relâche S2 : rien ne maintient la bobine de KM1."},
  surcharge:{txt:"Surcharge du moteur",act:(s,ctx)=>ctx.surcharge(),ok:(m,s)=>!m.tourne&&!s.grille,ko:"Rien n'a coupé la surcharge : le moteur a grillé."},
  rearme:{txt:"Réarmement de Q1, puis nouvel appui sur S2",act:s=>{if(s.app.Q1.declenche)s.basculer("Q1");s.appuyer("S2",true);s.appuyer("S2",false);},ok:m=>m.tourne,ko:"Le moteur ne redémarre pas après le réarmement."},
  s1:{txt:"Appui sur S1 (Arrêt)",act:s=>s.appuyer("S1",true),ok:m=>!m.tourne,ko:"Le moteur ne s'arrête pas quand on appuie sur S1."},
  relache1:{txt:"On relâche S1",act:s=>s.appuyer("S1",false),ok:m=>!m.tourne,ko:"Le moteur redémarre quand on relâche S1."},
  /* deux sens de marche */
  s2sens1:{txt:"Appui sur S2 (sens 1)",act:s=>s.appuyer("S2",true),ok:(m,s)=>sens(1,m,s),ko:"Le moteur ne démarre pas en sens 1 quand on appuie sur S2."},
  relache2s1:{txt:"On relâche S2",act:s=>s.appuyer("S2",false),ok:(m,s)=>sens(1,m,s),ko:"Le moteur s'arrête quand on relâche S2."},
  s3pendant1:{txt:"Appui sur S3 pendant la marche en sens 1",act:s=>s.appuyer("S3",true),ok:(m,s)=>sens(1,m,s),
    ko:(m,s)=>fondu(s)?COURT:"Le moteur a changé d'état sans passer par l'arrêt."},
  relache3s1:{txt:"On relâche S3",act:s=>s.appuyer("S3",false),ok:(m,s)=>sens(1,m,s),ko:"Le moteur ne tourne plus en sens 1."},
  s3sens2:{txt:"Appui sur S3 (sens 2)",act:s=>s.appuyer("S3",true),ok:(m,s)=>sens(2,m,s),ko:"Le moteur ne démarre pas en sens 2 quand on appuie sur S3."},
  relache3s2:{txt:"On relâche S3",act:s=>s.appuyer("S3",false),ok:(m,s)=>sens(2,m,s),ko:"Le moteur s'arrête quand on relâche S3."},
  s2pendant2:{txt:"Appui sur S2 pendant la marche en sens 2",act:s=>s.appuyer("S2",true),ok:(m,s)=>sens(2,m,s),
    ko:(m,s)=>fondu(s)?COURT:"Le moteur a changé d'état sans passer par l'arrêt."},
  relache2s2:{txt:"On relâche S2",act:s=>s.appuyer("S2",false),ok:(m,s)=>sens(2,m,s),ko:"Le moteur ne tourne plus en sens 2."},
  /* étoile-triangle */
  s2etoile:{txt:"Appui sur S2 (Marche) : démarrage en étoile",act:s=>s.appuyer("S2",true),ok:m=>m.tourne&&m.couplage==="étoile",ko:"Le moteur ne démarre pas en étoile."},
  relacheEtoile:{txt:"On relâche S2 : l'étoile se maintient",act:s=>s.appuyer("S2",false),ok:m=>m.tourne&&m.couplage==="étoile",ko:"Le démarrage en étoile ne se maintient pas."},
  attenteTriangle:{txt:"Fin de la temporisation : passage en triangle",act:()=>{},duree:5600,ok:m=>m.tourne&&m.couplage==="triangle",
    ko:m=>m.tourne?"Le moteur reste en étoile : il ne passe jamais en triangle.":"À la fin de la temporisation, le moteur s'arrête au lieu de passer en triangle."}
};

/* ---------- schéma du niveau avec les pièces choisies (emplacement vide = circuit ouvert) ---------- */
function schemaPour(niveau,choix){
  const base=schemaBase(niveau.base);
  const sch={id:"defi",appareils:copie(base.appareils),sources:copie(base.sources),charges:copie(base.charges),
    protections:copie(base.protections),moteur:copie(base.moteur),liaisons:[]};
  sch.appareils.KX={type:"contacteur",nom:"Contacteur sans bobine",bobine:"aucune"};
  sch.folios=base.folios.map(f=>Object.assign(copie({titre:f.titre,vue:f.vue,fils:f.fils,joncs:f.joncs,contacts:f.contacts,dessin:f.dessin}),{zones:[]}));
  niveau.trous.forEach(([l,t])=>{
    const T=DATA().trous[t],f=sch.folios[T.f];
    const rc=new Set(T.retireContacts),rd=new Set(T.retireDessin.map(x=>JSON.stringify(x)));
    f.contacts=f.contacts.filter(c=>!rc.has(c.id));
    f.dessin=f.dessin.filter(d=>!rd.has(JSON.stringify(d)));
  });
  niveau.trous.forEach(([l,t])=>{
    const T=DATA().trous[t],f=sch.folios[T.f],p=choix[l]&&DATA().pieces[choix[l]];
    if(p){f.contacts.push(...copie(p.contacts||[]));f.dessin.push(...copie(p.dessin||[]));sch.liaisons.push(...copie(p.liaisons||[]));}
    const c=T.cadre;f.dessin.push(["trou",c[0],c[1],c[2],c[3],l,!p]);
  });
  return sch;
}

function apercuPiece(p){
  const svg=document.createElementNS(D.NS,"svg");svg.setAttribute("aria-hidden","true");
  const sym=window.ELEC_SYMBOLES.find(s=>s.id===p.apercu);
  const spec=sym?sym.f:{vue:[-0.7,0.35,0.7,-1.55],dessin:[["fil","x",[[0,0],[0,-1.2]]]]};
  const G=D.construire(svg,spec);Object.values(G.contacts).forEach(c=>c.maj(c.spec.mode==="nf","var(--mort)"));
  return svg;
}

/* ---------- liste des défis ---------- */
function liste(main){
  const N=DATA().niveaux;
  main.innerHTML=`
    <div class="page-head"><div>
      <p class="tag"><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>Défis</p>
      <h1>Schémas à trous</h1>
      <p class="lead">Il manque des appareils dans les schémas de l'Atelier. Choisis les bonnes pièces, puis lance le test : la simulation montre ce qui se passe, même quand c'est faux.</p>
    </div></div>
    <div class="niveaux">${N.map((n,i)=>`<a class="niveau" href="#/defis/${i+1}"><span class="num">Défi ${i+1} · ${n.trous.length} emplacement${n.trous.length>1?"s":""}</span><h2>${esc(n.titre)}</h2><span class="chips"><span class="chip">${esc(schemaBase(n.base).titre)}</span></span><p class="lead" style="margin:0">${esc(n.resume)}</p><span style="font-weight:600;color:var(--brand-text);font-size:14px">Commencer →</span></a>`).join("")}</div>`;
  return ()=>{};
}

/* ---------- un défi ---------- */
function ouvrir(main,num){
  const N=DATA().niveaux,niveau=N[num-1];
  if(!niveau){main.innerHTML=`<p class="lead">Ce défi n'existe pas. <a href="#/defis">Retour aux Défis</a></p>`;return ()=>{};}
  const base=schemaBase(niveau.base);
  const choix={};let actif=niveau.trous[0][0],sim=null,sch=null,feuilles=[],detruit=false,enTest=false,minuteur=null;
  const ordre={};niveau.trous.forEach(([l,t,ps])=>ordre[l]=melange(ps));
  const folios=[...new Set(niveau.trous.map(([l,t])=>DATA().trous[t].f))];

  main.innerHTML=`
    <a class="retour" href="#/defis">← Défis</a>
    <div class="page-head"><div>
      <p class="tag">Défi ${num} sur ${N.length} · ${esc(base.titre)}</p>
      <h1>${esc(niveau.titre)}</h1>
    </div><div class="etat" id="etat" data-s="arret" role="status" aria-live="polite">Moteur à l'arrêt</div></div>
    <div class="sim">
      <div class="folios-zone">
        <p class="consigne">${esc(niveau.consigne)}</p>
        <div class="folios pile" id="folios"></div>
      </div>
      <div class="panneau">
        <section class="bloc" aria-label="Emplacements">
          <h2>Emplacements</h2>
          <div class="emplacements" id="emplacements"></div>
          <h2 id="titrePieces"></h2>
          <div class="pieces" id="pieces"></div>
          <button type="button" class="btn btn-primary" id="tester" disabled>Tester le schéma</button>
        </section>
        <section class="bloc" aria-label="Résultat du test" id="blocTest" hidden>
          <h2>Test du schéma</h2>
          <ol class="etapes" id="etapes"></ol>
          <div class="verdict" id="verdict" hidden aria-live="polite"></div>
        </section>
        <section class="bloc" aria-label="Essai à la main">
          <h2>Essayer à la main</h2>
          <div class="poussoirs" id="mains"></div>
          <div class="actions"><button type="button" class="btn btn-danger" id="bSurcharge">Surcharge moteur</button><button type="button" class="btn" id="bReset">Remettre en route</button></div>
        </section>
      </div>
    </div>`;
  const zoneF=main.querySelector("#folios");

  function reconstruire(){
    if(minuteur){clearInterval(minuteur);minuteur=null;}
    sch=schemaPour(niveau,choix);
    sim=new window.ElecSimulation(sch);sim.grille=false;
    zoneF.innerHTML="";feuilles=[];
    sch.folios.forEach((f,i)=>{
      // folio affiché en premier : celui qui contient les emplacements
      const box=document.createElement("figure");box.className="feuille";box.style.margin="0";
      box.style.order=folios.includes(i)?"0":"1";
      box.innerHTML=`<h3>${esc(f.titre)}</h3><div class="defile"></div>`;
      const svg=document.createElementNS(D.NS,"svg");svg.setAttribute("role","img");svg.setAttribute("aria-label","Schéma à compléter : "+f.titre);
      box.querySelector(".defile").appendChild(svg);zoneF.appendChild(box);
      const F=D.construire(svg,f);feuilles.push(F);
    });
    niveau.trous.forEach(([l,t])=>{
      const T=DATA().trous[t],c=T.cadre;
      const z=feuilles[T.f].zone(c[0],c[1],c[2],c[3],"Emplacement "+l);
      const choisir=()=>{actif=l;panneau();};
      z.addEventListener("click",choisir);
      z.addEventListener("keydown",e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();choisir();}});
    });
    peindre();
  }
  function peindre(){
    if(detruit)return;
    feuilles.forEach(F=>{
      window.ElecAtelier.peindre(F,sim,sch,false);
      Object.entries(F.trous||{}).forEach(([l,r])=>r.classList.toggle("actif",l===actif));
    });
    const m=sim.mot||{},e=main.querySelector("#etat");
    if(sim.grille){e.dataset.s="defaut";e.textContent="Moteur grillé";}
    else if(sim.instable){e.dataset.s="defaut";e.textContent="Un contacteur bat";}
    else if(sim.court&&sim.app[sim.court.app].declenche){e.dataset.s="defaut";e.textContent="Court-circuit";}
    else if(m.tourne){e.dataset.s="marche";e.textContent=m.couplage?"Marche en "+m.couplage:(sch.moteur.afficheSens?"Marche sens "+m.sens:"Moteur en marche");}
    else if(Object.values(sim.app).some(a=>a.declenche)){e.dataset.s="defaut";e.textContent="Défaut";}
    else {e.dataset.s="arret";e.textContent="Moteur à l'arrêt";}
    if(sim.echeance!=null&&!minuteur&&!enTest)minuteur=setInterval(()=>{if(detruit)return;sim.resoudre();peindre();if(sim.echeance==null){clearInterval(minuteur);minuteur=null;}},100);
  }

  function panneau(){
    const zE=main.querySelector("#emplacements");
    zE.innerHTML=niveau.trous.map(([l])=>`<button type="button" data-l="${l}" aria-pressed="${l===actif}"><span class="l">${l}</span><span class="v">${choix[l]?esc(DATA().pieces[choix[l]].titre):"vide"}</span></button>`).join("");
    zE.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{actif=b.dataset.l;panneau();}));
    main.querySelector("#titrePieces").textContent="Pièces pour l'emplacement "+actif;
    const zP=main.querySelector("#pieces");zP.innerHTML="";
    ordre[actif].forEach(id=>{
      const p=DATA().pieces[id];
      const b=document.createElement("button");b.type="button";b.className="piece";b.setAttribute("aria-pressed",String(choix[actif]===id));
      b.appendChild(apercuPiece(p));
      const t=document.createElement("span");t.textContent=p.titre;b.appendChild(t);
      b.addEventListener("click",()=>{
        if(enTest)return;
        choix[actif]=id;
        const suivant=niveau.trous.find(([l])=>!choix[l]);if(suivant)actif=suivant[0];
        main.querySelector("#blocTest").hidden=true;
        reconstruire();panneau();
      });
      zP.appendChild(b);
    });
    main.querySelector("#tester").disabled=!niveau.trous.every(([l])=>choix[l])||enTest;
    feuilles.forEach(F=>Object.entries(F.trous||{}).forEach(([l,r])=>r.classList.toggle("actif",l===actif)));
  }

  /* surcharge : déclenchement du relais thermique ou du disjoncteur-moteur ; sans protection, le moteur grille */
  function surcharge(){
    if(sch.appareils.F1&&sch.appareils.F1.type==="thermique"){sim.declencher("F1");return;}
    const trouQ1=niveau.trous.find(([l,t])=>t==="Q1");
    const protege=!trouQ1||!!(DATA().pieces[choix[trouQ1[0]]]||{}).protege;
    if(protege&&sim.app.Q1.ferme){sim.declencher("Q1");return;}
    if(sim.mot&&sim.mot.tourne)sim.grille=true;
  }

  /* test automatique animé */
  main.querySelector("#tester").addEventListener("click",()=>{
    if(enTest)return;
    reconstruire();enTest=true;panneau();
    const bloc=main.querySelector("#blocTest"),ol=main.querySelector("#etapes"),ver=main.querySelector("#verdict");
    bloc.hidden=false;ver.hidden=true;
    ol.innerHTML=niveau.etapes.map(k=>`<li>${esc(ETAPES[k].txt)}</li>`).join("");
    bloc.scrollIntoView({block:"nearest",behavior:"smooth"});
    const lis=ol.querySelectorAll("li");let i=0,echec=null;
    const pas=()=>{
      if(detruit)return;
      if(i>=niveau.etapes.length||echec){fin(echec);return;}
      const E=ETAPES[niveau.etapes[i]];lis[i].className="encours";
      E.act(sim,{surcharge});
      peindre();
      const duree=E.duree||550,t0=performance.now();
      const suivi=setInterval(()=>{if(detruit){clearInterval(suivi);return;}sim.resoudre();peindre();
        if(performance.now()-t0<duree)return;
        clearInterval(suivi);
        const m=sim.grille?{tourne:false}:(sim.mot||{});
        if(sim.instable)echec="Un contacteur s'enclenche et retombe sans arrêt : il bat (pompage).";
        else if(!E.ok(m,sim))echec=typeof E.ko==="function"?E.ko(m,sim):E.ko;
        lis[i].className=echec?"ko":"ok";
        i++;setTimeout(pas,echec?0:450);
      },100);
    };
    setTimeout(pas,300);
  });
  function fin(echec){
    enTest=false;
    const ver=main.querySelector("#verdict");ver.hidden=false;
    const fautes=niveau.trous.filter(([l])=>!DATA().bonnes.includes(choix[l]));
    if(!echec&&!fautes.length){
      ver.className="verdict ok";
      ver.innerHTML=`<b>Défi réussi.</b>${niveau.trous.map(([l,t])=>`<span><b>${l}</b> · ${esc(DATA().trous[t].role)}</span>`).join("")}
        ${num<N.length?`<a class="btn btn-primary" href="#/defis/${num+1}">Défi suivant</a>`:`<a class="btn btn-primary" href="#/defis">Retour aux Défis</a>`}`;
    } else {
      ver.className="verdict ko";
      ver.innerHTML=`<b>${esc(echec||"Le schéma fonctionne pour ce test, mais une pièce n'est pas celle attendue.")}</b>`+
        fautes.map(([l])=>`<span><b>${l}</b> · ${esc(DATA().pieces[choix[l]].pourquoi||"")}</span>`).join("")+
        `<span>Change la pièce fautive, puis relance le test.</span>`;
    }
    panneau();peindre();
  }

  /* essai à la main : boutons du pupitre du schéma */
  const zM=main.querySelector("#mains");
  base.pupitre.poussoirs.forEach(p=>{
    const b=document.createElement("button");b.type="button";b.className="bp "+(p.style||"marche");b.textContent=p.titre;zM.appendChild(b);
    const bas=e=>{e.preventDefault();if(enTest)return;b.classList.add("appuye");sim.appuyer(p.app,true);peindre();};
    const haut=()=>{b.classList.remove("appuye");if(enTest)return;sim.appuyer(p.app,false);peindre();};
    b.addEventListener("pointerdown",bas);b.addEventListener("pointerup",haut);b.addEventListener("pointerleave",haut);b.addEventListener("pointercancel",haut);
    b.addEventListener("keydown",e=>{if((e.key===" "||e.key==="Enter")&&!e.repeat)bas(e);});
    b.addEventListener("keyup",e=>{if(e.key===" "||e.key==="Enter")haut();});
  });
  main.querySelector("#bSurcharge").addEventListener("click",()=>{if(enTest)return;surcharge();sim.resoudre();peindre();});
  main.querySelector("#bReset").addEventListener("click",()=>{if(enTest)return;reconstruire();});

  reconstruire();panneau();
  return ()=>{detruit=true;if(minuteur)clearInterval(minuteur);};
}

window.ElecDefis={liste,ouvrir};
})();
