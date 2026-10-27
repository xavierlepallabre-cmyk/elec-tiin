/* Élec TIIN — Consignation (NF C 18-510) : procédure guidée, mode erreurs, rôles, fluides.
   Le schéma réutilise la bibliothèque de dessin et le moteur de simulation de l'Atelier.
   Aucun résultat n'est enregistré. */
(function(){
"use strict";
const D=window.ElecDessin;
const C=()=>window.ELEC_CONSIGNATION;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const melange=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const tete=(titre,lead,retour)=>`${retour?`<a class="retour" href="${retour}">← Consignation</a>`:""}
  <div class="page-head"><div>${retour?"":`<p class="tag"><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>Consignation</p>`}
  <h1>${esc(titre)}</h1>${lead?`<p class="lead">${lead}</p>`:""}</div>`;

/* ======================= accueil ======================= */
function accueil(main){
  const cartes=[
    ["guidee","Procédure guidée","Consigne la pompe P2 étape par étape : séparation, condamnation, identification, VAT, MALT-CC, puis déconsignation.","Pas à pas"],
    ["erreurs","Mode erreurs","Ordre libre. Une fois les travaux lancés, un opérateur et un essai du groupe électrogène mettent ta consignation à l'épreuve.","Mise à l'épreuve"],
    ["roles","Rôles et habilitations","Qui consigne, qui dirige les travaux, que signifient B0, B2, BC, BR… avec un quiz de sept questions.","NF C 18-510"],
    ["fluides","Consignation des fluides","Vannes, purges, joint plein : comment isoler une conduite sous pression, avec un schéma interactif.","INRS ED 6109"]
  ];
  main.innerHTML=tete("Consigner en sécurité","Avant de travailler sur un équipement, on le met en sécurité de façon sûre et vérifiée : c'est la consignation. Ici, la NF C 18-510 appliquée à une pompe secourue par un groupe électrogène, et les principes pour les fluides.")+`</div>
    <div class="niveaux">${cartes.map(([id,t,r,n])=>`<a class="niveau" href="#/consignation/${id}"><span class="num">${esc(n)}</span><h2>${esc(t)}</h2><p class="lead" style="margin:0">${esc(r)}</p><span style="font-weight:600;color:var(--brand-text);font-size:14px">Ouvrir →</span></a>`).join("")}</div>
    <p class="astuce" style="margin-top:16px">Références : NF C 18-510 (2012, amendements A1 de 2020 et A2 de 2023) ; INRS ED 6109 « Consignations et déconsignations », 3e édition, 2020. Ces activités entraînent au raisonnement : elles ne remplacent ni la formation à l'habilitation, ni la procédure de ton entreprise.</p>`;
  return ()=>{};
}

/* ======================= scène électrique ======================= */
function scene(main,mode){
  const guide=mode==="guidee";
  const sch=C().schema;
  let sim,F,st,detruit=false,occupe=false;
  const vivant=n=>sim.sourcesDe(n).some(s=>s.type==="phase");
  const ligneVive=()=>["n1","n2","n3"].some(vivant);
  const ferme=q=>sim.app[q].ferme;

  main.innerHTML=tete(guide?"Procédure guidée":"Mode erreurs",
    guide?"Le chargé de travaux (B2) doit remplacer le moteur M2 de la pompe P2. Tu es <b>chargé de consignation (BC)</b> : consigne le départ, remets l'attestation, puis déconsigne à la fin du travail."
         :"Même situation, mais dans l'ordre que tu veux. Quand tu autorises les travaux, la journée continue : un opérateur et un essai du groupe électrogène vont tester ta consignation.","#/consignation")+
    `<div class="etat" id="etat" data-s="arret" role="status" aria-live="polite"></div></div>
    <div class="sim">
      <div class="folios-zone">
        ${guide?`<div class="consigne" id="consigne"></div>`:""}
        <figure class="feuille" style="margin:0"><h3>Installation : pompes P1 et P2</h3><div class="defile" id="defile"></div></figure>
        <section class="bloc" aria-label="Journal"><h2>Ce qui se passe</h2><ul class="explications" id="journal" aria-live="polite"></ul><div id="vatTab"></div></section>
      </div>
      <div class="panneau">
        ${guide?`<section class="bloc"><h2>Étapes</h2><ol class="etapes" id="etapes"></ol></section>`:""}
        <section class="bloc" aria-label="Appareils">
          <h2>Appareils de séparation</h2>
          <div class="app-lignes" id="appareils"></div>
        </section>
        <section class="bloc" aria-label="Au lieu de travail">
          <h2>Au lieu de travail</h2>
          <div class="actions-col" id="lieuActions"></div>
        </section>
        <section class="bloc" aria-label="Documents">
          <h2>Documents</h2>
          <div class="actions-col" id="docs"></div>
        </section>
        <div class="actions"><button type="button" class="btn" id="recommencer">Recommencer</button></div>
      </div>
    </div>`;

  /* ---------- dessin ---------- */
  function construire(){
    sim=new window.ElecSimulation(JSON.parse(JSON.stringify(sch)));
    st={cad:{Q1:false,Q2:false,Q3:false},vat:{ok:false,testAvant:false,testApres:false,mesure:null,echecTest:false},
        etape:0,ident:null,attest:null,maltValide:false,arc:false,phase:"consignation",avis:false,incidents:[],evenements:[],journal:[],fin:false};
    const zone=main.querySelector("#defile");zone.innerHTML="";
    const svg=document.createElementNS(D.NS,"svg");svg.setAttribute("role","img");svg.setAttribute("aria-label","Installation : tableau normal, groupe électrogène, pompes P1 et P2");
    zone.appendChild(svg);
    F=D.construire(svg,sch.folios[0]);
    const X=x=>F.X(x),Y=y=>F.Y(y),el=D.el;
    // lieu de travail
    const L=C().lieu;
    F.lieuR=el("rect",{x:X(L[0]),y:Y(L[1]),width:(L[2]-L[0])*F.S,height:(L[1]-L[3])*F.S,rx:10,class:"lieu"},F.gFils);
    F.lieuT=el("text",{x:X(L[0])+8,y:Y(L[1])+14,class:"lieu-txt"},F.gTxt);F.lieuT.textContent="Lieu de travail";
    // groupe électrogène
    const g=C().dessinGE;
    F.geC=el("circle",{cx:X(g.x),cy:Y(g.y),r:g.r*F.S,class:"symb plein-fond ge"},F.gSymb);
    F.texte(g.x,g.y+0.15,"G","rep","milieu");F.texte(g.x,g.y-0.22,"3~","rep rep-m2","milieu");
    F.rep(g.x+0.75,g.y+0.12,"GE","groupe électrogène");
    F.geEtat=F.texte(g.x+0.75,g.y-0.42,"","note");
    // MALT-CC (visible quand posée)
    const m=C().malt;F.malt=el("g",{class:"malt"},F.gDyn);
    el("polyline",{points:F.pts([[m.terre[0],m.terre[1]],[m.terre[0],m.y],[m.x[2],m.y]]),class:"malt-trait"},F.malt);
    m.x.forEach(x=>el("circle",{cx:X(x),cy:Y(m.y),r:4.2,class:"malt-pince"},F.malt));
    el("path",{d:`M${X(m.terre[0]-0.2)} ${Y(m.terre[1])}H${X(m.terre[0]+0.2)}M${X(m.terre[0]-0.13)} ${Y(m.terre[1]-0.08)}H${X(m.terre[0]+0.13)}M${X(m.terre[0]-0.06)} ${Y(m.terre[1]-0.16)}H${X(m.terre[0]+0.06)}`,class:"malt-trait"},F.malt);
    const tm=el("text",{x:X(m.terre[0])-6,y:Y(m.y),class:"malt-txt","text-anchor":"end","dominant-baseline":"central"},F.malt);tm.textContent="MALT-CC";
    // cadenas et pancartes
    F.cad={};
    for(const [q,p] of Object.entries(C().cadenas)){
      const gq=el("g",{class:"cad"},F.gDyn);
      el("rect",{x:X(p[0]),y:Y(p[1]+0.12),width:0.3*F.S,height:0.24*F.S,rx:2,class:"cad-corps"},gq);
      el("path",{d:`M${X(p[0]+0.05)} ${Y(p[1]+0.12)}v${-0.08*F.S}a${0.1*F.S} ${0.1*F.S} 0 0 1 ${0.2*F.S} 0v${0.08*F.S}`,class:"cad-anse"},gq);
      el("rect",{x:X(p[0]+0.36),y:Y(p[1]+0.17),width:1.4*F.S,height:0.34*F.S,rx:3,class:"cad-tag"},gq);
      const t=el("text",{x:X(p[0]+1.06),y:Y(p[1]),class:"cad-tag-txt","text-anchor":"middle","dominant-baseline":"central"},gq);t.textContent="CONSIGNÉ";
      F.cad[q]=gq;
    }
    // zones tactiles
    for(const [k,z] of Object.entries(C().zones)){
      const r=F.zone(z[0],z[1],z[2],z[3],k.startsWith("Q")?"Manœuvrer "+k:"Moteur "+k);
      const act=()=>{if(k.startsWith("Q"))faire("man:"+k);else if(k==="M2")faire("ident");else note("M1 entraîne la pompe P1 : ce n'est pas l'équipement sur lequel on travaille.","ko");};
      r.addEventListener("click",act);r.addEventListener("keydown",e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();act();}});
    }
    note(guide?"Commence par la séparation : ouvre les appareils qui alimentent M2.":"Consigne le départ P2 dans l'ordre que tu choisis, puis autorise les travaux.","");
    rendre();
  }

  /* ---------- journal ---------- */
  function note(t,cls){st.journal.unshift([t,cls||""]);if(st.journal.length>8)st.journal.pop();}

  /* ---------- étapes de la procédure guidée ---------- */
  const ETAPES=[
    {t:"Séparation",c:"Ouvre tous les appareils qui alimentent M2. Regarde bien le schéma : la pompe P2 a deux sources.",ok:()=>!ferme("Q2")&&!ferme("Q3"),
     permis:k=>k==="man:Q2"||k==="man:Q3"||(k==="man:Q1"?"Q1 alimente la pompe P1 : ce n'est pas l'ouvrage à consigner. Couper P1 n'apporte aucune sécurité pour M2.":
       k.startsWith("cad:")&&!ferme("Q2")?"Avant de condamner, termine la séparation : M2 a une deuxième source. Suis les conducteurs du câble P2 jusqu'en haut du schéma.":null)},
    {t:"Condamnation",c:"Cadenasse Q2 et Q3 en position ouverte. La pancarte « Consigné » prévient que personne ne doit les manœuvrer.",ok:()=>st.cad.Q2&&st.cad.Q3,
     permis:k=>k==="cad:Q2"||k==="cad:Q3"},
    {t:"Identification",c:"Va au lieu de travail et vérifie que l'équipement devant toi est bien celui que tu as consigné : touche le moteur M2.",ok:()=>st.ident===true,
     permis:k=>k==="ident"},
    {t:"Vérification d'absence de tension",c:"Lance l'autotest du VAT, vérifie l'absence de tension aux bornes de M2, puis relance l'autotest.",
     ok:()=>st.vat.testAvant&&st.vat.mesure&&st.vat.mesure.fiable&&!st.vat.mesure.reel&&st.vat.testApres,
     permis:k=>{
       if(k==="vat:piles")return true;
       if(k==="vat:test")return true;
       if(k==="vat:mesure")return st.vat.testAvant?true:"Avant de mesurer, lance l'autotest du VAT : un VAT en panne afficherait « absence de tension » même sous tension.";
       return null;}},
    {t:"Mise à la terre et en court-circuit",c:"Pose la MALT-CC aux bornes de M2, tout de suite après la VAT. Elle protège en cas de retour de tension.",ok:()=>sim.app.MALT.ferme,
     permis:k=>k==="malt"},
    {t:"Attestation de consignation",c:"Remets l'attestation de consignation pour travaux à la bonne personne.",ok:()=>st.attest==="B2",
     permis:k=>k.startsWith("att:")},
    {t:"Travaux",c:"La consignation est terminée. Lance la journée de travail et observe ce qui arrive.",ok:()=>st.phase!=="consignation"&&st.phase!=="travaux",
     permis:k=>k==="travaux"},
    {t:"Avis de fin de travail",c:"Le travail est terminé. Avant toute déconsignation, le chargé de travaux te remet l'avis de fin de travail.",ok:()=>st.avis,
     permis:k=>k==="avis"||(k==="malt"?"Attends l'avis de fin de travail : tant qu'il n'est pas remis, des personnes peuvent encore travailler sur M2.":null)},
    {t:"Retrait de la MALT-CC",c:"Retire la MALT-CC en premier.",ok:()=>!sim.app.MALT.ferme,
     permis:k=>k==="malt"||(k.startsWith("cad:")?"Retire d'abord la MALT-CC : on enlève les dispositifs du lieu de travail avant de lever les condamnations.":null)},
    {t:"Retrait des condamnations",c:"Retire les cadenas et les pancartes de Q2 et Q3.",ok:()=>!st.cad.Q2&&!st.cad.Q3,
     permis:k=>k==="cad:Q2"||k==="cad:Q3"},
    {t:"Remise sous tension",c:"Referme Q2 et Q3. La pompe P2 peut redémarrer.",ok:()=>ferme("Q2")&&ferme("Q3"),
     permis:k=>k==="man:Q2"||k==="man:Q3"}
  ];
  // la progression ne recule jamais : retirer la MALT-CC en fin de procédure ne ramène pas à l'étape 5
  function avancer(){while(st.etape<ETAPES.length&&ETAPES[st.etape].ok())st.etape++;}
  const etapeCourante=()=>{avancer();return st.etape>=ETAPES.length?-1:st.etape;};

  /* ---------- actions ---------- */
  function faire(k){
    if(occupe||detruit)return;
    if(st.fin&&!guide){note("La journée est terminée. Touche « Recommencer » pour une nouvelle consignation.","");rendre();return;}
    if(guide){
      const i=etapeCourante();
      if(i<0){note("La procédure est terminée. Bravo !","ok");rendre();return;}
      const p=ETAPES[i].permis(k);
      if(p!==true){note(typeof p==="string"?p:`Ce n'est pas encore le moment. Étape en cours : ${ETAPES[i].t.toLowerCase()}.`,"ko");rendre();return;}
    }
    const [a,arg]=k.split(":");
    if(a==="man")manoeuvre(arg);
    else if(a==="cad")cadenas(arg);
    else if(a==="ident")identifier();
    else if(a==="vat")vat(arg);
    else if(a==="malt")malt();
    else if(a==="att")attestation(arg);
    else if(a==="avis"){st.avis=true;note("Le chargé de travaux te remet l'avis de fin de travail : le travail est terminé et l'équipe a quitté M2. Tu peux déconsigner.","ok");}
    else if(a==="travaux"){travaux();return;}
    sim.resoudre();rendre();
    if(guide){const i=etapeCourante();if(i<0)note("Procédure terminée : la pompe P2 est de nouveau en service. Tu as respecté l'ordre de la consignation et de la déconsignation.","ok");}
  }
  function manoeuvre(q){
    if(st.cad[q]){note(`${q} est condamné : on ne le manœuvre pas tant que le cadenas est en place.`,"ko");return;}
    const a=sim.app[q];
    if(a.declenche){a.declenche=false;a.ferme=true;sim.court=null;note(`${q} réarmé et refermé.`,"");return;}
    a.ferme=!a.ferme;
    note(`${q} ${a.ferme?"fermé":"ouvert"}.`+(!a.ferme&&q==="Q1"?" La pompe P1 s'arrête.":""),"");
  }
  function cadenas(q){
    if(st.cad[q]){st.cad[q]=false;note(`Cadenas et pancarte retirés de ${q}.`,"");return;}
    if(ferme(q)){note(`${q} est fermé : un appareil se condamne en position d'ouverture seulement. Ouvre-le d'abord.`,"ko");return;}
    st.cad[q]=true;note(`${q} condamné : cadenas posé et pancarte « Consigné, ne pas manœuvrer ».`,"ok");
  }
  function identifier(){
    const cons=["Q1","Q2","Q3"].filter(q=>!ferme(q));
    const bon=cons.includes("Q2")&&cons.includes("Q3");
    st.ident=bon;
    note(`Au lieu de travail : plaque « M2 — pompe P2 », câble repéré P2. Il est alimenté par Q2 et, en secours, par Q3. Appareils ouverts : ${cons.length?cons.join(", "):"aucun"}. `+
      (bon?"L'équipement correspond à la consignation.":"L'équipement ne correspond pas à ce qui est séparé : ta consignation ne protège pas M2."),bon?"ok":"ko");
  }
  function vat(arg){
    const v=st.vat;
    if(arg==="piles"){v.ok=true;v.echecTest=false;v.testAvant=false;note("Piles remplacées. Relance l'autotest avant de t'en servir.","");return;}
    if(arg==="test"){
      if(!v.ok){v.echecTest=true;note("Autotest du VAT : échec, le voyant de test ne s'allume pas. Le VAT est hors service : ne l'utilise pas, remplace ses piles.","ko");return;}
      if(v.mesure&&v.testAvant){v.testApres=true;note("Autotest réussi après la mesure : le VAT fonctionnait pendant la vérification, la mesure est fiable.","ok");}
      else {v.testAvant=true;note("Autotest réussi : le VAT fonctionne. Tu peux mesurer aux bornes de M2.","ok");}
      return;
    }
    if(arg==="mesure"){
      const nets=["n1","n2","n3"],noms=["U","V","W"];
      const vif=nets.map(vivant);
      const paires=[[0,1],[1,2],[0,2],[0,"PE"],[1,"PE"],[2,"PE"]];
      const lect=paires.map(([a,b])=>{const t=vif[a]||(b!=="PE"&&vif[b]);return [`${noms[a]}–${b==="PE"?"PE":noms[b]}`,v.ok?t:false];});
      const reel=vif.some(x=>x);
      v.mesure={lecture:lect,reel,fiable:v.ok&&v.testAvant,affiche:lect.some(x=>x[1])};
      v.testApres=false;
      if(!v.ok)note("Le VAT n'indique aucune tension… mais aucun autotest n'a été fait et il est en panne : cette mesure ne prouve rien.","ko");
      else if(reel)note("Le VAT indique une tension aux bornes de M2 : l'équipement n'est pas consigné. Ne touche à rien !","ko");
      else note(v.testAvant?"Absence de tension sur les six mesures. Relance l'autotest pour confirmer que le VAT fonctionnait.":"Absence de tension… mais l'autotest n'a pas été fait avant : la mesure n'est pas fiable.",v.testAvant?"ok":"ko");
    }
  }
  function malt(){
    const a=sim.app.MALT;
    if(a.ferme){a.ferme=false;note("MALT-CC retirée des bornes de M2.","");return;}
    const vif=ligneVive();
    a.ferme=true;sim.resoudre();
    const m=st.vat.mesure;
    st.maltValide=!vif&&!!m&&m.fiable&&!m.reel;
    if(vif){st.arc=true;st.incidents.push("arc");
      note(`Tu as posé la MALT-CC sur un équipement sous tension : court-circuit franc, arc électrique devant toi. ${sim.court?sim.court.texte:""} Risque de brûlures graves.`,"ko");}
    else note("MALT-CC posée : les trois conducteurs sont reliés entre eux et à la terre au plus près du lieu de travail.","ok");
  }
  function attestation(dest){
    st.attest=dest;
    const msg={B2:["Attestation remise au chargé de travaux (B2). Il délimite la zone et autorise son équipe à commencer.","ok"],
      B1:["L'exécutant (B1) ne reçoit pas l'attestation : c'est le chargé de travaux qui la reçoit et qui autorise le début des travaux.","ko"],
      OP:["L'opérateur de conduite n'est pas le destinataire : l'attestation va au chargé de travaux (B2), qui dirige l'intervention.","ko"]}[dest];
    note(msg[0],msg[1]);
  }

  /* ---------- journée de travail : événements ---------- */
  function travaux(){
    if(st.phase!=="consignation")return;
    st.phase="travaux";occupe=true;rendre();
    const evts=[
      ()=>{ // début
        if(ligneVive()){st.incidents.push("debut");return ["Les travaux commencent : M2 est encore sous tension. L'électricien qui débranche le moteur est électrisé.","ko"];}
        return ["Les travaux commencent : M2 est hors tension.", "ok"];
      },
      ()=>{ // opérateur
        const t0="9 h 30 · Un opérateur veut redémarrer la pompe P2. Il tente de refermer Q2. ";
        if(st.cad.Q2)return [t0+"Le cadenas l'en empêche, et la pancarte lui indique qu'une intervention est en cours.","ok"];
        if(ferme("Q2"))return [t0+"Q2 était déjà fermé.",ligneVive()?"ko":""];
        sim.app.Q2.ferme=true;sim.app.Q2.declenche=false;return impact(t0+"Rien ne l'en empêche : Q2 se referme. ");
      },
      ()=>{ // essai du groupe
        const t0="11 h · Essai mensuel du groupe électrogène. Le technicien referme Q3 s'il est ouvert, puis démarre le groupe. ";
        let t=t0;
        if(st.cad.Q3)t+="Q3 est condamné : il reste ouvert. ";
        else if(!ferme("Q3")){sim.app.Q3.ferme=true;sim.app.Q3.declenche=false;t+="Q3 n'est pas condamné : il le referme. ";}
        sim.app.GE.ferme=true;
        const r=impact(t+"Le groupe démarre. ");
        return r;
      },
      ()=>{sim.app.GE.ferme=false;sim.resoudre();return ["12 h · Fin de l'essai : le groupe s'arrête. Le moteur M2 est remplacé.",""];}
    ];
    function impact(t){
      const avant=sim.court;sim.resoudre();
      if(sim.court&&sim.court!==avant&&sim.app.MALT.ferme){st.incidents.push("malt");
        return [t+`La tension revient sur M2, mais la MALT-CC la met en court-circuit : ${sim.court.texte} L'équipe n'a rien senti. Ta consignation était pourtant incomplète.`,"ko"];}
      if(ligneVive()){st.incidents.push("retour");return [t+"La tension revient sur M2 pendant le travail : électrisation de l'électricien.","ko"];}
      return [t+"M2 reste hors tension.","ok"];
    }
    let i=0;
    const pas=()=>{
      if(detruit)return;
      if(i>=evts.length){occupe=false;st.phase=guide?"fin-travaux":"bilan";st.fin=!guide;if(!guide)note("Fin de la journée : lis le bilan de ta consignation.","");rendre();return;}
      const [t,c]=evts[i++]();sim.resoudre();note(t,c);rendre();setTimeout(pas,1300);
    };
    setTimeout(pas,300);
  }

  /* ---------- bilan du mode erreurs ---------- */
  function bilan(){
    const v=st.vat,m=v.mesure;
    const lignes=[
      ["Séparation de toutes les sources (Q2 et Q3)",st.sepOk,st.sepOk?"":"M2 a deux sources : le réseau normal par Q2 et le groupe électrogène par Q3. Les deux doivent être ouvertes."],
      ["Condamnation en position ouverte",st.cadOk,st.cadOk?"":"Sans cadenas, n'importe qui peut refermer l'appareil sans savoir qu'on travaille en aval."],
      ["Identification au lieu de travail",st.ident===true,st.ident===true?"":"Il faut vérifier, devant l'équipement, que c'est bien celui qui a été consigné (plaque, repère du câble)."],
      ["Autotest du VAT, mesure, autotest à nouveau",st.vatOk,st.vatOk?"":"On lance l'autotest intégré du VAT avant et après la mesure. Un VAT en panne indique toujours « absence de tension »."],
      ["MALT-CC posée après la VAT",st.maltValide,st.maltValide?"":(st.arc?"Posée sous tension : c'est un court-circuit direct devant soi.":"La MALT-CC protège en cas de retour de tension. Elle se pose juste après une VAT qui confirme l'absence de tension.")],
      ["Attestation remise au chargé de travaux (B2)",st.attest==="B2",st.attest==="B2"?"":"L'attestation de consignation pour travaux va au chargé de travaux, qui autorise ensuite son équipe."]
    ];
    const blesse=st.incidents.includes("debut")||st.incidents.includes("retour")||st.incidents.includes("arc");
    const sauve=!blesse&&st.incidents.includes("malt");
    const tout=lignes.every(l=>l[1]);
    const titre=blesse?"Accident : l'équipe a été exposée à la tension.":sauve?"Personne n'a été blessé, mais seulement grâce à la MALT-CC.":tout?"Consignation correcte : l'équipe a travaillé en sécurité toute la journée.":"Personne n'a été blessé, mais ta consignation a des failles.";
    return `<div class="verdict ${blesse?"ko":tout?"ok":"ko"}"><b>${esc(titre)}</b>
      <ol class="etapes" style="margin-top:4px">${lignes.map(([t,ok,e])=>`<li class="${ok?"ok":"ko"}"><span>${esc(t)}${e?`<br><small>${esc(e)}</small>`:""}</span></li>`).join("")}</ol></div>`;
  }

  /* ---------- rendu ---------- */
  function rendre(){
    if(detruit)return;
    // mémorise l'état de la consignation au lancement des travaux (pour le bilan)
    if(st.phase==="consignation"){
      st.sepOk=!ferme("Q2")&&!ferme("Q3");st.cadOk=st.cad.Q2&&st.cad.Q3;
      const m=st.vat.mesure;st.vatOk=st.vat.testAvant&&!!m&&m.fiable&&!m.reel&&st.vat.testApres;
    }
    window.ElecAtelier.peindre(F,sim,sim.sch,false);
    const vif=ligneVive(),mlt=sim.app.MALT.ferme;
    F.lieuR.setAttribute("class","lieu"+(vif?" vif":mlt?" sur":""));
    F.lieuT.textContent=vif?"Lieu de travail · SOUS TENSION":mlt?"Lieu de travail · consigné, à la terre":"Lieu de travail";
    F.malt.style.display=mlt?"":"none";
    for(const q in F.cad)F.cad[q].style.display=st.cad[q]?"":"none";
    F.geC.classList.toggle("on",!!sim.app.GE.ferme);F.geEtat.textContent=sim.app.GE.ferme?"en marche":"à l'arrêt";
    const e=main.querySelector("#etat");
    e.dataset.s=vif?"defaut":mlt?"marche":"arret";
    e.textContent=vif?"M2 sous tension":mlt?"M2 consigné":"M2 hors tension";
    // appareils
    main.querySelector("#appareils").innerHTML=["Q2","Q3","Q1"].map(q=>{
      const a=sim.app[q],pos=a.declenche?"déclenché":a.ferme?"fermé":"ouvert";
      return `<div class="app-ligne"><div><b>${q}</b> <small>${esc(sch.appareils[q].nom)}</small><br><span class="pill ${a.ferme?"p-ferme":"p-ouvert"}">${pos}</span>${st.cad[q]?' <span class="pill p-cad">cadenassé</span>':""}</div>
        <div class="app-btns"><button type="button" class="btn" data-k="man:${q}">${a.ferme?"Ouvrir":a.declenche?"Réarmer":"Fermer"}</button><button type="button" class="btn" data-k="cad:${q}">${st.cad[q]?"Retirer le cadenas":"Cadenasser"}</button></div></div>`;}).join("");
    // lieu de travail
    const v=st.vat;
    main.querySelector("#lieuActions").innerHTML=`
      <button type="button" class="btn" data-k="ident">Identifier l'équipement (moteur M2)</button>
      <div class="sous-bloc"><span class="sous-titre">Vérificateur d'absence de tension (VAT)</span>
        <button type="button" class="btn" data-k="vat:test">Lancer l'autotest du VAT</button>
        ${v.echecTest?`<button type="button" class="btn btn-danger" data-k="vat:piles">Remplacer les piles du VAT</button>`:""}
        <button type="button" class="btn" data-k="vat:mesure">Mesurer aux bornes de M2</button></div>
      <button type="button" class="btn" data-k="malt">${sim.app.MALT.ferme?"Retirer la MALT-CC":"Poser la MALT-CC aux bornes de M2"}</button>`;
    // documents
    const z=main.querySelector("#docs");
    if(st.phase==="consignation")z.innerHTML=`<span class="sous-titre">Remettre l'attestation de consignation à…</span>
      <div class="choix-ligne">${[["B2","Chargé de travaux (B2)"],["B1","Exécutant (B1)"],["OP","Opérateur de conduite"]].map(([k,t])=>`<button type="button" class="btn${st.attest===k?" choisi":""}" data-k="att:${k}">${t}</button>`).join("")}</div>
      <button type="button" class="btn btn-primary" data-k="travaux">Autoriser le début des travaux</button>`;
    else if(st.phase==="travaux")z.innerHTML=`<p class="astuce">Journée de travail en cours…</p>`;
    else if(guide)z.innerHTML=`<button type="button" class="btn btn-primary" data-k="avis"${st.avis?" disabled":""}>${st.avis?"Avis de fin de travail reçu":"Recevoir l'avis de fin de travail"}</button>`;
    else z.innerHTML=bilan();
    main.querySelectorAll("[data-k]").forEach(b=>b.addEventListener("click",()=>faire(b.dataset.k)));
    // journal et VAT
    main.querySelector("#journal").innerHTML=st.journal.map(([t,c])=>`<li${c?` class="${c}"`:""}>${esc(t)}</li>`).join("");
    const m=v.mesure;
    main.querySelector("#vatTab").innerHTML=m?`<div class="vat"><span class="sous-titre">Dernière mesure du VAT aux bornes de M2${m.fiable?"":" · non fiable"}</span>
      <div class="vat-grille">${m.lecture.map(([p,t])=>`<span class="${t?"vat-on":"vat-off"}">${p}<b>${t?"tension":"absence"}</b></span>`).join("")}</div></div>`:"";
    // guidage
    if(guide){
      const i=etapeCourante();
      main.querySelector("#consigne").innerHTML=i<0?"<b>Procédure terminée.</b> La pompe P2 est de nouveau en service.":`<b>Étape ${i+1} · ${esc(ETAPES[i].t)}</b><br>${esc(ETAPES[i].c)}`;
      main.querySelector("#etapes").innerHTML=ETAPES.map((E,j)=>`<li class="${j<i||i<0?"ok":j===i?"encours":""}">${esc(E.t)}</li>`).join("");
    }
  }

  main.querySelector("#recommencer").addEventListener("click",()=>{if(occupe)return;construire();});
  construire();
  return ()=>{detruit=true;};
}

/* ======================= rôles et habilitations ======================= */
function roles(main){
  const R=C();
  main.innerHTML=tete("Rôles et habilitations","L'habilitation est délivrée par l'employeur, après une formation, pour des tâches précises. Elle est inscrite sur un titre d'habilitation que l'on garde sur soi.","#/consignation")+`</div>
    <section class="bloc" style="margin-bottom:16px"><h2>Le circuit des documents</h2>
      <ol class="flux">
        <li><b>Chargé d'exploitation</b><span>accorde le retrait de l'exploitation</span></li>
        <li><b>Chargé de consignation (BC)</b><span>consigne, puis remet l'attestation de consignation</span></li>
        <li><b>Chargé de travaux (B2)</b><span>autorise son équipe, dirige les travaux</span></li>
        <li><b>Chargé de travaux (B2)</b><span>remet l'avis de fin de travail</span></li>
        <li><b>Chargé de consignation (BC)</b><span>déconsigne, l'ouvrage retourne à l'exploitation</span></li>
      </ol></section>
    <div class="imagier roles-grille" style="margin-bottom:16px">${R.roles.map(r=>`<article class="fiche"><div class="txt"><div class="ligne"><h3>${esc(r.titre)}</h3>${r.sym?`<span class="repere">${esc(r.sym)}</span>`:""}</div><p>${esc(r.txt)}</p></div></article>`).join("")}</div>
    <section class="bloc" style="margin-bottom:16px"><h2>Lire un symbole d'habilitation</h2>
      <p class="astuce">Exemple : <b>B1V</b> = basse tension · exécutant · au voisinage. <b>H0V</b> = haute tension · non-électricien · au voisinage.</p>
      <div class="lettres">${R.lettres.map(([l,t])=>`<div><b>${esc(l)}</b><span>${esc(t)}</span></div>`).join("")}</div></section>
    <section class="bloc"><h2>Quiz : qui fait quoi ?</h2><div id="quiz"></div></section>`;
  const Q=melange(R.quiz);let n=0,bons=0;const zq=main.querySelector("#quiz");
  function question(){
    if(n>=Q.length){zq.innerHTML=`<div class="bilan"><p class="gros">${bons} / ${Q.length}</p><p>${bons>=6?"Les rôles sont clairs pour toi.":"Relis les fiches des rôles, puis recommence le quiz."}</p><p class="astuce">Ce résultat n'est pas enregistré.</p><button type="button" class="btn btn-primary" id="qz">Recommencer le quiz</button></div>`;
      zq.querySelector("#qz").onclick=()=>{n=0;bons=0;question();};return;}
    const q=Q[n],opts=melange([q.r,...q.f]);
    zq.innerHTML=`<div class="progression"><span>Question ${n+1} sur ${Q.length}</span><span class="barre"><i style="width:${n/Q.length*100}%"></i></span></div>
      <h3 style="margin:10px 0">${esc(q.q)}</h3><div class="choix">${opts.map(o=>`<button type="button">${esc(o)}</button>`).join("")}</div>
      <div class="retour-jeu" hidden></div><button type="button" class="btn btn-primary suite" hidden style="margin-top:10px">${n+1<Q.length?"Question suivante":"Voir le bilan"}</button>`;
    zq.querySelectorAll(".choix button").forEach(b=>b.onclick=()=>{
      const ok=b.textContent===q.r;if(ok)bons++;
      zq.querySelectorAll(".choix button").forEach(x=>{x.disabled=true;if(x.textContent===q.r)x.classList.add("juste");});
      if(!ok)b.classList.add("faux");
      const fb=zq.querySelector(".retour-jeu");fb.hidden=false;fb.className="retour-jeu "+(ok?"juste":"faux");
      fb.innerHTML=`<b>${ok?"Exact.":"Ce n'est pas ça."}</b> ${esc(q.e)}`;
      const s=zq.querySelector(".suite");s.hidden=false;s.onclick=()=>{n++;question();};s.focus();
    });
  }
  question();
  return ()=>{};
}

/* ======================= fluides ======================= */
function fluides(main){
  const Fd=C().fluides;let niv="R0",fuite=false;
  main.innerHTML=tete("Consignation des fluides","Eau, vapeur, air comprimé, huile, gaz : un fluide sous pression peut blesser, brûler ou contaminer. La démarche ressemble à la consignation électrique, avec une étape en plus : dissiper l'énergie et le fluide restants.","#/consignation")+`</div>
    <section class="bloc" style="margin-bottom:16px"><h2>Les quatre opérations (INRS ED 6109)</h2>
      <ol class="etapes-fl">${Fd.etapes.map(([t,x],i)=>`<li><span class="n">${i+1}</span><div><b>${esc(t)}</b><p>${esc(x)}</p></div></li>`).join("")}</ol>
      <p class="astuce">L'ordre peut être adapté après analyse des risques, selon l'installation. Seul le chargé de consignation peut déclarer l'équipement déconsigné.</p></section>
    <section class="bloc" style="margin-bottom:16px"><h2>Choisir le bon isolement</h2>
      <div class="filtres" role="group" aria-label="Niveau d'isolement">${Fd.niveaux.map(n=>`<button type="button" data-n="${n.id}" aria-pressed="${n.id===niv}">${esc(n.titre)}</button>`).join("")}</div>
      <div class="feuille" style="padding:8px"><svg id="conduite" viewBox="0 40 640 180" role="img" aria-label="Conduite isolée"></svg></div>
      <div class="actions" style="margin-top:10px"><button type="button" class="btn btn-danger" id="fuite">Simuler une fuite de la vanne amont</button></div>
      <div class="verdict" id="verdictFl"></div></section>
    <section class="bloc"><h2>Sur un site nucléaire</h2><p>${esc(Fd.nucleaire)}</p></section>`;
  const svg=main.querySelector("#conduite"),NS=D.NS;
  const el=(t,a)=>D.el(t,a,svg);
  function dessiner(){
    svg.innerHTML="";
    const n=Fd.niveaux.find(x=>x.id===niv);
    const purge=niv!=="R0",v2=niv==="R1",joint=niv==="R2",demonte=niv==="R3";
    // états des tronçons
    const B=fuite?(purge?"purge":"plein"):"vide";       // entre V1 et l'aval
    const Cq=fuite&&!purge?"plein":"vide";                // vers l'équipement
    const col=s=>s==="plein"?"var(--neutre)":s==="purge"?"var(--neutre)":"var(--paper)";
    // source
    el("rect",{x:14,y:70,width:80,height:70,rx:8,class:"fl-cuve"});
    el("text",{x:54,y:100,"text-anchor":"middle",class:"fl-txt"}).textContent="Réseau";
    el("text",{x:54,y:118,"text-anchor":"middle",class:"fl-txt"}).textContent="6 bar";
    // tronçon A (toujours sous pression)
    el("rect",{x:94,y:96,width:96,height:18,class:"fl-tube",style:"fill:var(--neutre)"});
    // V1
    vanne(200,105,"V1",true,fuite);
    // tronçon B
    const finB=demonte?380:(joint?400:400);
    el("rect",{x:218,y:96,width:(demonte?370:finB)-218,height:18,class:"fl-tube",style:`fill:${col(B)}`});
    if(purge){ // purge intermédiaire ouverte
      el("rect",{x:286,y:114,width:12,height:46,class:"fl-tube",style:`fill:${col(B==="purge"?"plein":"vide")}`});
      vanneV(292,168,"Purge ouverte");
      if(B==="purge")el("path",{d:"M292 186 q-4 12 0 22 M286 190 q-6 10 -2 20 M298 190 q6 10 2 20",class:"fl-goutte"});
    }
    if(v2)vanne(410,105,"V2",true,false);
    if(joint){el("rect",{x:401,y:84,width:9,height:42,class:"fl-joint"});el("rect",{x:398,y:58,width:15,height:28,rx:3,class:"fl-joint"});
      el("text",{x:405,y:52,"text-anchor":"middle",class:"fl-txt petit"}).textContent="joint plein";}
    if(demonte){el("text",{x:420,y:86,"text-anchor":"middle",class:"fl-txt petit"}).textContent="tronçon déposé";
      el("path",{d:"M372 92v26M468 92v26",class:"fl-bride"});}
    // tronçon C vers l'équipement
    const dC=demonte?470:(v2?428:410);
    el("rect",{x:dC,y:96,width:520-dC,height:18,class:"fl-tube",style:`fill:${col(Cq)}`});
    // équipement et zone de travail
    el("rect",{x:520,y:62,width:100,height:86,rx:10,class:"fl-equip"+(Cq==="plein"?" danger":"")});
    el("text",{x:570,y:98,"text-anchor":"middle",class:"fl-txt"}).textContent="Équipement";
    el("text",{x:570,y:116,"text-anchor":"middle",class:"fl-txt petit"}).textContent=Cq==="plein"?"SOUS PRESSION":"zone de travail";
    const v=main.querySelector("#verdictFl");
    const danger=Cq==="plein";
    v.className="verdict "+(fuite?(danger?"ko":"ok"):"");
    v.innerHTML=`<b>${esc(n.titre)} · ${esc(n.verdict)}</b><span>${esc(n.txt)}</span>${fuite?`<span><b>${danger?"Avec la fuite, le fluide sous pression atteint la zone de travail.":"Avec la fuite, la zone de travail reste hors pression."}</b></span>`:""}`;
    main.querySelector("#fuite").textContent=fuite?"Arrêter la fuite":"Simuler une fuite de la vanne amont";
  }
  function vanne(x,y,lab,fermee,fuit){ // vanne en « nœud papillon », cadenas si fermée
    el("path",{d:`M${x-16} ${y-14}L${x+16} ${y+14}V${y-14}L${x-16} ${y+14}Z`,class:"fl-vanne"+(fermee?" fermee":"")});
    el("line",{x1:x,y1:y,x2:x,y2:y-28,class:"fl-tige"});el("line",{x1:x-10,y1:y-28,x2:x+10,y2:y-28,class:"fl-tige"});
    el("text",{x:x,y:y+34,"text-anchor":"middle",class:"fl-txt petit"}).textContent=lab+(fermee?" fermée, cadenassée":"");
    if(fuit)el("path",{d:`M${x+18} ${y-4}l10 -6M${x+18} ${y+4}l10 6`,class:"fl-goutte"});
  }
  function vanneV(x,y,lab){
    el("path",{d:`M${x-12} ${y-10}L${x+12} ${y+10}H${x-12}L${x+12} ${y-10}Z`,class:"fl-vanne"});
    el("text",{x:x+18,y:y+4,class:"fl-txt petit"}).textContent=lab+", cadenassée";
  }
  main.querySelectorAll("[data-n]").forEach(b=>b.onclick=()=>{niv=b.dataset.n;main.querySelectorAll("[data-n]").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));dessiner();});
  main.querySelector("#fuite").onclick=()=>{fuite=!fuite;dessiner();};
  dessiner();
  return ()=>{};
}

window.ElecConsignation={accueil,scene,roles,fluides};
})();
