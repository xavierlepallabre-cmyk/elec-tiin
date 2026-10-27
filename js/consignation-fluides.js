/* Élec TIIN — Consignation des énergies d'une presse hydraulique (INRS ED 6109).
   Trois énergies : électrique (moteur de pompe), hydraulique (pompe et accumulateur),
   potentielle (outil en position haute, retenu par la pression de la chambre A et le clapet piloté).
   Aucun résultat n'est enregistré. */
(function(){
"use strict";
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const P_SERVICE=120,P_CHARGE=50,T_BEQ=0.93;

function scene(main,mode){
  const guide=mode==="guidee";
  const Fl=window.ElecFluide;let P,st,detruit=false,raf=null,dernier=performance.now(),occupe=false;

  main.innerHTML=`<a class="retour" href="#/consignation">← Sécurité</a>
    <div class="page-head"><div><p class="tag">Énergies fluides et mécaniques</p><h1>Presse hydraulique · ${guide?"procédure guidée":"mode erreurs"}</h1>
      <p class="lead">${guide?"Le chargé de travaux doit changer l'outillage <b>sous l'outil de la presse</b>, resté en position haute. Tu es chargé de consignation : maîtrise l'énergie électrique du moteur de pompe, la pression de la pompe et de l'accumulateur, et le poids de l'outil.":"Même intervention, dans l'ordre que tu veux. Quand tu autorises les travaux, un opérateur, un collègue et l'usure d'un clapet mettent ta consignation à l'épreuve."}</p></div>
      <div class="etat" id="etat" role="status" aria-live="polite"></div></div>
    <div class="sim">
      <div class="folios-zone">
        ${guide?`<div class="consigne" id="consigne"></div>`:""}
        <figure class="feuille" style="margin:0"><h3>Presse : circuit hydraulique</h3><div class="defile" id="planche"></div></figure>
        <div class="legende"><span><i style="background:var(--neutre)"></i>sous pression</span><span><i style="background:#8E44AD"></i>pression piégée</span><span><i style="background:var(--mort)"></i>sans pression</span></div>
        <section class="bloc" aria-label="Journal"><h2>Ce qui se passe</h2><ul class="explications" id="journal" aria-live="polite"></ul></section>
      </div>
      <div class="panneau">
        ${guide?`<section class="bloc"><h2>Étapes</h2><ol class="etapes" id="etapes"></ol></section>`:""}
        <section class="bloc"><h2>Énergie électrique</h2><div class="app-lignes" id="elec"></div></section>
        <section class="bloc"><h2>Circuit hydraulique</h2><div class="app-lignes" id="hydro"></div></section>
        <section class="bloc"><h2>Outil et vérifications</h2><div class="actions-col" id="outil"></div></section>
        <section class="bloc"><h2>Documents</h2><div class="actions-col" id="docs"></div></section>
        <div class="actions"><button type="button" class="btn" id="recommencer">Recommencer</button></div>
      </div>
    </div>`;

  /* ---------- dessin ---------- */
  function dessiner(){
    const zone=main.querySelector("#planche");zone.innerHTML="";
    const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.setAttribute("role","img");svg.setAttribute("aria-label","Circuit hydraulique de la presse");
    zone.appendChild(svg);P=new Fl.Planche(svg,560,565);const el=Fl.el,pts=Fl.pts;
    // vérin vertical et outil
    P.verin({id:"1A",vertical:true,x:200,y:250,w:140,h:40,course:5,charge:"outil",travel:0.6,lab:"1A",labX:112,labY:240});
    P.texte(112,258,"presse","fl-t petit");
    // béquille de sécurité (dessinée quand elle est posée)
    P.beq=el("g",{class:"beq"},P.gS);
    el("rect",{x:132,y:57,width:16,height:93,class:"fl-beq"},P.beq);
    for(let y=62;y<146;y+=10)el("line",{x1:132,y1:y+8,x2:148,y2:y,class:"fl-s"},P.beq);
    el("rect",{x:126,y:150,width:28,height:6,class:"fl-plein"},P.beq);
    P.beqT=P.texte(110,100,"béquille","fl-t petit","end");
    // chambre A, manomètre M2, purge VP, clapet piloté
    P.ligne("cA",[[200,287],[250,287],[250,300]]);
    P.ligne("cA",[[225,287],[225,273]]);P.point("cA",225,287);P.mano("M2",225,262);
    P.ligne("cA",[[214,287],[214,302]]);P.point("cA",214,287);
    vanne(P,"VP",214,302,true);P.ligne("tVP",[[214,326],[214,342]]);P.reservoir(214,350);P.texte(204,314,"VP","fl-t gras","end");
    P.clapetPilote({x:250,y:300,haut:"cA",bas:"nA",lab:""});P.texte(270,304,"1V2","fl-t petit");
    P.ligne("nA",[[250,340],[250,370]]);
    P.ligne("nB",[[200,160],[310,160],[310,355],[268.4,355],[268.4,370]]);
    P.ligne("nB",[[310,320],[266,320]],true);P.point("nB",310,320);
    // distributeur 4/3 centre fermé à levier
    P.distributeur({id:"1V1",x:236.2,y:370,s:46,cases:3,ref:1,
      ports:{"A":{cote:"h",f:.3,net:"nA"},"B":{cote:"h",f:.7,net:"nB"},"P":{cote:"b",f:.3,net:"p"},"T":{cote:"b",f:.7,net:"t"}},
      chemins:{0:[["P","A"],["B","T"]],1:[],2:[["P","B"],["A","T"]]},bloques:{1:["A","B","P","T"]},
      gauche:"levier",ressortG:true,ressortD:true,lab:"1V1",labX:356,labY:362,labA:"start"});
    P.ligne("t",[[268.4,416],[268.4,520]]);P.reservoir(268.4,528);
    P.ligne("p",[[250,416],[250,450]]);P.point("p",250,450);
    // centrale : pompe, moteur, limiteur, vanne d'isolement V0
    P.pompe(150,505);P.ligne("asp",[[150,520],[150,530]]);P.reservoir(150,538);
    P.ligne("pp",[[150,490],[150,450],[176,450]]);P.ligne("pp",[[150,450],[46,450],[46,466]]);P.point("pp",150,450);
    P.limiteur({x:46,y:466,lab:""});P.ligne("tl",[[46,496],[46,520]]);P.reservoir(46,528);
    vanneH(P,"V0",176,450);P.texte(191,472,"V0","fl-t gras","middle");
    P.ligne("p",[[206,450],[480,450]]);
    // accumulateur, purge VD, manomètre M1
    P.ligne("p",[[400,450],[400,430]]);P.point("p",400,450);
    el("rect",{x:388,y:378,width:24,height:52,rx:12,class:"fl-s fond"},P.gS);el("line",{x1:388,y1:400,x2:412,y2:400,class:"fl-s"},P.gS);
    el("polygon",{points:pts([[400,384],[395,393],[405,393]]),class:"fl-s"},P.gS);
    P.accu=el("rect",{x:390,y:401,width:20,height:27,rx:6,class:"fl-chambre"},P.gS);
    P.texte(418,392,"accumulateur","fl-t petit");
    P.ligne("p",[[440,450],[440,466]]);P.point("p",440,450);vanne(P,"VD",440,466,true);P.ligne("tVD",[[440,490],[440,520]]);P.reservoir(440,528);P.texte(462,470,"VD","fl-t gras");
    P.mano("M1",491,450);
    // cadenas
    P.cad={};[["V0",210,424],["VD",458,494],["VP",230,328]].forEach(([k,x,y])=>{const g=el("g",{class:"cad"},P.gT);
      el("rect",{x,y,width:13,height:11,rx:2,class:"cad-corps"},g);el("path",{d:`M${x+3} ${y}v-4a3.5 3.5 0 0 1 7 0v4`,class:"cad-anse"},g);P.cad[k]=g;});
    P.texte(150,548,"M · moteur de pompe (sectionneur QM)","fl-t petit","middle");
  }
  function vanne(P,id,x,y,vert){ // vanne 2/2 manuelle verticale (robinet), triangles pleins quand fermée
    const el=Fl.el,g=el("g",{},P.gS);
    const a=el("polygon",{points:Fl.pts([[x-8,y],[x+8,y],[x,y+12]]),class:"fl-vanne"},g);
    const b=el("polygon",{points:Fl.pts([[x-8,y+24],[x+8,y+24],[x,y+12]]),class:"fl-vanne"},g);
    el("line",{x1:x,y1:y+12,x2:x+14,y2:y+12,class:"fl-s"},g);el("line",{x1:x+14,y1:y+8,x2:x+14,y2:y+16,class:"fl-s"},g);
    P[id]={g,a,b};
  }
  function vanneH(P,id,x,y){ // vanne 2/2 horizontale
    const el=Fl.el,g=el("g",{},P.gS);
    const a=el("polygon",{points:Fl.pts([[x,y-8],[x,y+8],[x+15,y]]),class:"fl-vanne"},g);
    const b=el("polygon",{points:Fl.pts([[x+30,y-8],[x+30,y+8],[x+15,y]]),class:"fl-vanne"},g);
    el("line",{x1:x+15,y1:y,x2:x+15,y2:y-14,class:"fl-s"},g);el("line",{x1:x+11,y1:y-14,x2:x+19,y2:y-14,class:"fl-s"},g);
    P[id]={g,a,b};
  }

  /* ---------- état ---------- */
  function init(){
    st={qm:true,qmCad:false,pompe:true,v0:true,v0Cad:false,vd:false,vdCad:false,vp:false,vpCad:false,beq:false,
        t:1,pAccu:P_SERVICE,pA:P_CHARGE,levier:1,fuite:false,verifie:false,essaiDem:null,essaiLev:null,attest:null,
        phase:"consignation",avis:false,etape:0,incidents:[],journal:[],fin:false,chute:false};
    dessiner();note(guide?"Commence par mettre l'outil en sécurité mécanique : il est en position haute, au-dessus de la zone de travail.":"Consigne la presse dans l'ordre que tu choisis, puis autorise les travaux.","");rendre();
  }
  function note(t,c){st.journal.unshift([t,c||""]);if(st.journal.length>9)st.journal.pop();}
  const pP=()=>st.pompe&&st.v0?P_SERVICE:st.pAccu;     // pression disponible côté distributeur

  /* ---------- étapes guidées ---------- */
  const E=[
    {t:"Mise en sécurité mécanique",c:"L'outil est en haut, retenu seulement par l'huile de la chambre A. Pose la béquille de sécurité sous l'outil avant toute autre opération.",ok:()=>st.beq,permis:k=>k==="beq"},
    {t:"Séparation des énergies",c:"Arrête la centrale, ouvre le sectionneur QM du moteur de pompe et ferme la vanne d'isolement V0.",ok:()=>!st.pompe&&!st.qm&&!st.v0,
     permis:k=>["pompe","qm","v0"].includes(k)||(k==="vd"||k==="vp"?"Termine d'abord la séparation : tant que la pompe peut débiter, purger ne sert à rien.":null)},
    {t:"Condamnation",c:"Cadenasse QM en position ouverte et V0 en position fermée.",ok:()=>st.qmCad&&st.v0Cad,permis:k=>k==="cad:qm"||k==="cad:v0"},
    {t:"Dissipation des énergies",c:"La pompe est séparée, mais l'accumulateur garde 120 bar et la chambre A 50 bar. Ouvre la purge VD de l'accumulateur, puis la purge VP de la chambre : l'outil se pose sur la béquille.",
     ok:()=>st.vd&&st.vp&&st.pAccu<1,permis:k=>k==="vd"||k==="vp"},
    {t:"Condamnation des purges",c:"Cadenasse les purges VD et VP en position ouverte : personne ne doit les refermer pendant l'intervention.",ok:()=>st.vdCad&&st.vpCad,permis:k=>k==="cad:vd"||k==="cad:vp"},
    {t:"Vérification",c:"Contrôle les deux manomètres, fais un essai de démarrage de la centrale et un essai de manœuvre du levier : rien ne doit se passer.",
     ok:()=>st.verifie&&st.essaiDem===false&&st.essaiLev===false,permis:k=>k==="verif"||k==="essaiDem"||k==="essaiLev"},
    {t:"Attestation",c:"Remets l'attestation de consignation au chargé de travaux.",ok:()=>st.attest==="B2",permis:k=>k.startsWith("att:")},
    {t:"Travaux",c:"Lance la journée de travail et observe.",ok:()=>st.phase!=="consignation"&&st.phase!=="travaux",permis:k=>k==="travaux"},
    {t:"Avis de fin de travail",c:"Reçois l'avis de fin de travail avant de déconsigner.",ok:()=>st.avis,permis:k=>k==="avis"},
    {t:"Fermeture des purges",c:"Retire les cadenas de VD et VP, puis referme les deux purges.",ok:()=>!st.vd&&!st.vp&&!st.vdCad&&!st.vpCad,
     permis:k=>["cad:vd","cad:vp","vd","vp"].includes(k)||(k==="cad:qm"||k==="cad:v0"?"Referme d'abord les purges : sinon, à la remise en pression, l'huile partirait directement au réservoir.":null)},
    {t:"Réalimentation",c:"Retire les cadenas de QM et V0, ferme QM, ouvre V0 et démarre la centrale.",ok:()=>st.qm&&st.v0&&st.pompe&&!st.qmCad&&!st.v0Cad,
     permis:k=>["cad:qm","cad:v0","qm","v0","pompe"].includes(k)||(k==="beq"?"Ne retire pas la béquille maintenant : l'outil repose dessus. Il faut d'abord reprendre sa charge en pression.":null)},
    {t:"Reprise de la charge",c:"Monte l'outil avec le levier pour qu'il ne repose plus sur la béquille.",ok:()=>st.t>T_BEQ+0.03,permis:k=>k==="lev:0"||k==="lev:1"},
    {t:"Retrait de la béquille",c:"La béquille ne porte plus rien : retire-la. La presse peut reprendre la production.",ok:()=>!st.beq,permis:k=>k==="beq"}
  ];
  function avancer(){while(st.etape<E.length&&E[st.etape].ok())st.etape++;}

  /* ---------- actions ---------- */
  function faire(k){
    if(occupe||detruit)return;
    if(st.fin&&!guide){note("La journée est terminée. Touche « Recommencer ».","");rendre();return;}
    if(guide){avancer();const e=E[st.etape];
      if(!e){note("Procédure terminée.","ok");rendre();return;}
      const p=e.permis(k);
      if(p!==true){note(typeof p==="string"?p:`Pas encore : étape en cours, ${e.t.toLowerCase()}.`,"ko");rendre();return;}}
    const [a,b]=k.split(":");
    if(a==="beq"){
      if(st.beq){if(st.t<=T_BEQ+0.005){note("Impossible de retirer la béquille : l'outil repose dessus. Reprends d'abord la charge en pression.","ko");}else{st.beq=false;note("Béquille retirée.","");}}
      else if(st.t<T_BEQ){note("L'outil est déjà plus bas que la béquille : elle ne peut plus être mise en place.","ko");}
      else{st.beq=true;note("Béquille de sécurité posée sous l'outil : si l'outil descend, il s'arrêtera dessus.","ok");}}
    else if(a==="pompe"){
      if(!st.pompe&&!st.qm){note("La centrale ne démarre pas : le sectionneur QM est ouvert.","");}
      else{st.pompe=!st.pompe;note(st.pompe?"Centrale démarrée.":"Centrale arrêtée par le bouton d'arrêt. Attention, un arrêt n'est pas une séparation : elle peut redémarrer.","");}}
    else if(a==="qm"){if(st.qmCad){note("QM est condamné : retire d'abord le cadenas.","ko");}else{st.qm=!st.qm;if(!st.qm)st.pompe=false;note(st.qm?"QM fermé : le moteur de pompe peut être démarré.":"QM ouvert : le moteur de pompe est séparé du réseau électrique.","");}}
    else if(a==="v0"){if(st.v0Cad){note("V0 est condamnée : retire d'abord le cadenas.","ko");}else{st.v0=!st.v0;note(st.v0?"V0 ouverte : la pompe alimente le circuit.":"V0 fermée : la pompe est séparée du circuit. L'accumulateur, lui, est en aval de V0 : il garde sa pression.","");}}
    else if(a==="vd"){if(st.vdCad){note("VD est condamnée ouverte : retire d'abord le cadenas.","ko");}else{st.vd=!st.vd;note(st.vd?"Purge VD ouverte : l'accumulateur se vide au réservoir.":"Purge VD fermée.","");}}
    else if(a==="vp"){if(st.vpCad){note("VP est condamnée ouverte : retire d'abord le cadenas.","ko");}else{st.vp=!st.vp;
      if(st.vp){if(st.beq)note("Purge VP ouverte : la chambre A se vide, l'outil descend de quelques millimètres et se pose sur la béquille.","ok");
        else{note("Purge VP ouverte sans béquille : plus rien ne retient l'outil, il tombe en position basse !","ko");st.chute=true;st.incidents.push("chute-prepa");}}
      else note("Purge VP fermée.","");}}
    else if(a==="cad"){const nom={qm:"QM",v0:"V0",vd:"VD",vp:"VP"}[b],cle=b+"Cad";
      if(st[cle]){st[cle]=false;note(`Cadenas retiré de ${nom}.`,"");}
      else{const bonne={qm:!st.qm,v0:!st.v0,vd:st.vd,vp:st.vp}[b];
        if(!bonne)note(b==="qm"?"QM se condamne en position ouverte : ouvre-le d'abord.":b==="v0"?"V0 se condamne fermée : ferme-la d'abord.":`${nom} est une purge : elle se condamne ouverte.`,"ko");
        else{st[cle]=true;note(`${nom} condamné${b==="v0"||b==="vd"||b==="vp"?"e":""} : cadenas et pancarte posés.`,"ok");}}}
    else if(a==="verif"){st.verifie=true;const m1=Math.round(pP()),m2=Math.round(st.pA);
      note(`Manomètre M1 (circuit et accumulateur) : ${m1} bar. Manomètre M2 (chambre A) : ${m2} bar.`+(m1||m2?" Il reste de la pression : la dissipation n'est pas terminée.":" Plus aucune pression dans le circuit."),m1||m2?"ko":"ok");}
    else if(a==="essaiDem"){const dem=st.qm;st.essaiDem=dem;if(dem){st.pompe=true;note("Essai de démarrage : la centrale démarre ! La séparation électrique n'est pas faite.","ko");}else note("Essai de démarrage : rien ne se passe. La séparation électrique est vérifiée.","ok");}
    else if(a==="essaiLev"){const avant=st.t;st.levier=2;actualiser(0.6);st.levier=1;const bouge=Math.abs(st.t-avant)>0.005;st.essaiLev=bouge;
      note(bouge?"Essai de manœuvre : l'outil a bougé ! Il reste une énergie hydraulique dans le circuit.":"Essai de manœuvre du levier : rien ne bouge. Le circuit est sans énergie.",bouge?"ko":"ok");}
    else if(a==="lev"){st.levier=+b;return;}
    else if(a==="att"){st.attest=b;note(b==="B2"?"Attestation remise au chargé de travaux. Il autorise son équipe à intervenir sous l'outil.":"L'attestation va au chargé de travaux, qui dirige l'intervention et autorise son équipe.",b==="B2"?"ok":"ko");}
    else if(a==="avis"){st.avis=true;note("Avis de fin de travail reçu : l'équipe a terminé et a quitté la zone sous l'outil.","ok");}
    else if(a==="travaux"){travaux();return;}
    rendre();
  }

  /* ---------- physique simplifiée ---------- */
  function actualiser(dt){
    if(st.pompe&&!st.qm)st.pompe=false;
    if(st.pompe&&st.v0)st.pAccu=P_SERVICE;
    if(st.vd)st.pAccu=Math.max(0,st.pAccu-P_SERVICE*dt/0.8);
    const p=pP(),bas=st.beq?T_BEQ:0;
    // chambre A : purgée, ou retenue par le clapet piloté
    if(st.vp){if(st.t>bas){st.t=Math.max(bas,st.t-dt*(st.beq?0.5:2.5));}st.pA=st.beq||st.t<=0?0:P_CHARGE;if(st.t<=bas)st.pA=0;}
    else{
      if(st.levier===0&&p>=P_CHARGE&&st.t<1){st.t=Math.min(1,st.t+dt/3);if(!(st.pompe&&st.v0))st.pAccu=Math.max(0,st.pAccu-40*dt/3);}
      else if(st.levier===2&&p>10&&st.t>bas){st.t=Math.max(bas,st.t-dt/3);if(!(st.pompe&&st.v0))st.pAccu=Math.max(0,st.pAccu-25*dt/3);}
      else if(st.fuite&&st.t>bas)st.t=Math.max(bas,st.t-dt/4);
      st.pA=st.t>bas+0.001||(st.t>0&&!st.beq)?P_CHARGE:0;
      if(st.levier===0&&st.t>=T_BEQ)st.pA=P_CHARGE;
    }
  }

  /* ---------- journée de travail ---------- */
  function travaux(){
    if(st.phase!=="consignation")return;st.phase="travaux";occupe=true;
    const sous=()=>st.t>(st.beq?T_BEQ:0)+0.002; // l'outil n'est pas posé sur un appui sûr
    const bilanMvt=(t0,txt)=>{
      if(st.t<t0-0.003){if(st.beq&&st.t>=T_BEQ-0.001){return [txt+" L'outil descend et s'arrête sur la béquille : l'équipe est protégée, mais la consignation était incomplète.","ko"];}
        st.incidents.push("ecrasement");return [txt+" L'outil descend sur la zone de travail : écrasement.","ko"];}
      return [txt+" L'outil ne bouge pas.","ok"];};
    const ev=[
      ()=>{if(st.chute)return ["Les travaux commencent après la chute de l'outil pendant la préparation.","ko"];
        if(st.pompe)return ["Les travaux commencent alors que la centrale tourne encore !","ko"];
        return ["8 h · Les travaux commencent sous l'outil.","ok"];},
      ()=>{const t0="9 h 30 · Un opérateur veut relancer la production et appuie sur le bouton de marche de la centrale. ";
        if(!st.qm)return [t0+(st.qmCad?"QM est condamné ouvert : rien ne démarre.":"QM est ouvert : rien ne démarre. Sans cadenas, il aurait pu le refermer."),st.qmCad?"ok":""];
        st.pompe=true;actualiser(0.05);return [t0+(st.v0?"La pompe redémarre et remet le circuit en pression.":"La pompe redémarre, mais V0 fermée isole le circuit."),st.v0?"ko":""];},
      ()=>{const t0="10 h 30 · Pour dégager une pièce, un collègue pousse le levier du distributeur sur « Descendre ». ",tt=st.t;
        st.levier=2;for(let i=0;i<30;i++)actualiser(0.1);st.levier=1;
        const p=pP();return bilanMvt(tt,t0+(p>10?`Il reste ${Math.round(p)} bar ${st.pompe&&st.v0?"fournis par la pompe":"dans l'accumulateur"} : le clapet piloté s'ouvre.`:"Le circuit est sans pression."));},
      ()=>{const t0="11 h 30 · Le joint du clapet piloté 1V2, usé, se met à fuir. ",tt=st.t;st.fuite=true;for(let i=0;i<40;i++)actualiser(0.1);st.fuite=false;
        if(st.vp&&!st.beq)return [t0+"La chambre A est déjà vide : l'outil est en bas depuis la préparation.","ko"];
        if(!st.beq&&tt<=0.002)return [t0+"L'outil est déjà descendu en position basse.",""];
        return bilanMvt(tt,t0+(st.pA>0||tt>(st.beq?T_BEQ:0)+0.002?"La chambre A perd son huile.":"La chambre A est déjà vide et l'outil repose sur la béquille."));},
      ()=>["12 h · L'outillage est changé. Fin des travaux.",""]
    ];
    let i=0;const pas=()=>{if(detruit)return;
      if(i>=ev.length){occupe=false;st.phase=guide?"fin-travaux":"bilan";st.fin=!guide;rendre();return;}
      const [t,c]=ev[i++]();note(t,c);rendre();setTimeout(pas,1300);};
    rendre();setTimeout(pas,300);
  }
  function bilan(){
    const L=[
      ["Béquille de sécurité posée",st.b_beq,"L'outil en hauteur est une énergie potentielle : on le cale mécaniquement avant d'intervenir dessous."],
      ["Séparation électrique (QM ouvert et condamné)",st.b_qm,"Un arrêt par bouton n'est pas une séparation : n'importe qui peut redémarrer la centrale."],
      ["Séparation hydraulique (V0 fermée et condamnée)",st.b_v0,"Sans V0 fermée, une pompe qui redémarre remet le circuit en pression."],
      ["Accumulateur purgé, VD condamnée ouverte",st.b_vd,"L'accumulateur est en aval de V0 : pompe arrêtée, il garde 120 bar et peut encore faire bouger l'outil."],
      ["Chambre du vérin décompressée, VP condamnée ouverte",st.b_vp,"La chambre A garde une pression piégée tant qu'elle n'est pas purgée ; on la purge seulement quand l'outil est calé."],
      ["Vérification (manomètres, essai de démarrage, essai du levier)",st.b_verif,"On ne se contente pas d'avoir fait les gestes : on vérifie l'absence d'énergie avant de donner l'accès."],
      ["Attestation remise au chargé de travaux",st.attest==="B2","L'attestation de consignation va au chargé de travaux."]
    ];
    const acc=st.incidents.length>0,tout=L.every(l=>l[1]);
    const titre=acc?(st.incidents.includes("chute-prepa")?"Accident : l'outil est tombé pendant la préparation.":"Accident : l'outil est descendu sur l'équipe."):tout?"Consignation complète : l'équipe a travaillé en sécurité.":"Personne n'a été blessé, mais ta consignation a des failles.";
    return `<div class="verdict ${acc||!tout?"ko":"ok"}"><b>${esc(titre)}</b><ol class="etapes" style="margin-top:4px">${L.map(([t,ok,e])=>`<li class="${ok?"ok":"ko"}"><span>${esc(t)}${ok?"":`<br><small>${esc(e)}</small>`}</span></li>`).join("")}</ol></div>`;
  }

  /* ---------- rendu ---------- */
  function ligneApp(nom,sous,pos,cadOk,k,lib){
    return `<div class="app-ligne"><div><b>${nom}</b> <small>${esc(sous)}</small><br><span class="pill ${pos[1]}">${pos[0]}</span>${cadOk?' <span class="pill p-cad">cadenassé</span>':""}</div>
      <div class="app-btns">${lib.map(([kk,t])=>`<button type="button" class="btn" data-k="${kk}">${t}</button>`).join("")}</div></div>`;
  }
  function rendre(){
    if(detruit)return;
    if(st.phase==="consignation"){st.b_beq=st.beq;st.b_qm=!st.qm&&st.qmCad;st.b_v0=!st.v0&&st.v0Cad;st.b_vd=st.vd&&st.vdCad&&st.pAccu<1;st.b_vp=st.vp&&st.vpCad&&st.beq;
      st.b_verif=st.verifie&&st.essaiDem===false&&st.essaiLev===false;}
    if(guide)avancer();
    // schéma
    const p=pP(),bleu="var(--neutre)",gris="var(--mort)",violet="#8E44AD";
    const coul={pp:st.pompe?bleu:gris,p:p>0.5?bleu:gris,nA:st.levier===0&&p>0.5?bleu:gris,nB:st.levier===2&&p>0.5?bleu:gris,
      cA:st.pA>0?(st.levier===0&&p>0.5?bleu:violet):gris,t:gris,tl:st.pompe&&!st.v0?bleu:gris,tVD:st.vd&&st.pAccu>0.5?bleu:gris,tVP:gris,asp:gris};
    P.lignes.forEach(l=>{const c=coul[l.net]||gris;if(l.jonc)l.e.style.fill=c;else l.e.style.stroke=c;});
    P.positionner("1V1",st.levier);
    P.placerVerin("1A",st.t,st.pA>0?"#8E44AD44":"transparent","transparent");
    P.manos.M1.textContent=Math.round(p)+" bar";P.manos.M2.textContent=Math.round(st.pA)+" bar";
    P.accu.style.fill=st.pAccu>0.5?"#1F62D155":"transparent";
    P.moteurC.classList.toggle("on",st.pompe);
    const vt=(o,ouv)=>{o.a.classList.toggle("fermee",!ouv);o.b.classList.toggle("fermee",!ouv);};
    vt(P.V0,st.v0);vt(P.VD,st.vd);vt(P.VP,st.vp);
    P.cad.V0.style.display=st.v0Cad?"":"none";P.cad.VD.style.display=st.vdCad?"":"none";P.cad.VP.style.display=st.vpCad?"":"none";
    P.beq.style.display=st.beq?"":"none";P.beqT.style.display=st.beq?"":"none";
    if(P.limFleche){const o=st.pompe&&!st.v0;P.limFleche.setAttribute("transform",o?"translate(-5 0)":"");P.limFleche.classList.toggle("ouvert",o);}
    // état
    const e=main.querySelector("#etat"),energie=p>0.5||st.pA>0||st.pompe;
    e.dataset.s=st.incidents.length?"defaut":energie?"defaut":"marche";
    e.textContent=st.incidents.length?"Accident":st.pompe?"Centrale en marche":p>0.5?"Circuit sous pression":st.pA>0?"Pression piégée":"Presse sans énergie";
    // panneaux
    main.querySelector("#elec").innerHTML=ligneApp("QM","sectionneur du moteur de pompe",st.qm?["fermé","p-ferme"]:["ouvert","p-ouvert"],st.qmCad,"qm",[["qm",st.qm?"Ouvrir":"Fermer"],["cad:qm",st.qmCad?"Retirer le cadenas":"Cadenasser"]])+
      ligneApp("Centrale","marche / arrêt",st.pompe?["en marche","p-ferme"]:["arrêtée","p-ouvert"],false,"pompe",[["pompe",st.pompe?"Arrêter":"Démarrer"]]);
    main.querySelector("#hydro").innerHTML=
      ligneApp("V0","vanne d'isolement de la pompe",st.v0?["ouverte","p-ferme"]:["fermée","p-ouvert"],st.v0Cad,"v0",[["v0",st.v0?"Fermer":"Ouvrir"],["cad:v0",st.v0Cad?"Retirer le cadenas":"Cadenasser"]])+
      ligneApp("VD","purge de l'accumulateur",st.vd?["ouverte","p-ouvert"]:["fermée","p-ferme"],st.vdCad,"vd",[["vd",st.vd?"Fermer":"Ouvrir"],["cad:vd",st.vdCad?"Retirer le cadenas":"Cadenasser"]])+
      ligneApp("VP","purge de la chambre du vérin",st.vp?["ouverte","p-ouvert"]:["fermée","p-ferme"],st.vpCad,"vp",[["vp",st.vp?"Fermer":"Ouvrir"],["cad:vp",st.vpCad?"Retirer le cadenas":"Cadenasser"]]);
    main.querySelector("#outil").innerHTML=`
      <button type="button" class="btn" data-k="beq">${st.beq?"Retirer la béquille":"Poser la béquille de sécurité"}</button>
      <div class="choix-ligne"><button type="button" class="bp marche" data-lev="0">Monter (maintenir)</button><button type="button" class="bp marche" data-lev="2">Descendre (maintenir)</button></div>
      <div class="sous-bloc"><span class="sous-titre">Vérifications</span>
        <button type="button" class="btn" data-k="verif">Lire les manomètres M1 et M2</button>
        <button type="button" class="btn" data-k="essaiDem">Essai de démarrage de la centrale</button>
        <button type="button" class="btn" data-k="essaiLev">Essai de manœuvre du levier</button></div>`;
    const z=main.querySelector("#docs");
    if(st.phase==="consignation")z.innerHTML=`<span class="sous-titre">Remettre l'attestation de consignation à…</span>
      <div class="choix-ligne">${[["B2","Chargé de travaux"],["OP","Opérateur de la presse"]].map(([k,t])=>`<button type="button" class="btn${st.attest===k?" choisi":""}" data-k="att:${k}">${t}</button>`).join("")}</div>
      <button type="button" class="btn btn-primary" data-k="travaux">Autoriser le début des travaux</button>`;
    else if(st.phase==="travaux")z.innerHTML=`<p class="astuce">Journée de travail en cours…</p>`;
    else if(guide)z.innerHTML=`<button type="button" class="btn btn-primary" data-k="avis"${st.avis?" disabled":""}>${st.avis?"Avis de fin de travail reçu":"Recevoir l'avis de fin de travail"}</button>`;
    else z.innerHTML=bilan();
    main.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>faire(b.dataset.k));
    main.querySelectorAll("[data-lev]").forEach(b=>{
      const bas=ev=>{ev.preventDefault();if(occupe)return;const k="lev:"+b.dataset.lev;
        if(guide){avancer();const et=E[st.etape];const pm=et?et.permis(k):true;if(et&&pm!==true){note(typeof pm==="string"?pm:"Le levier n'est pas utile à cette étape.","ko");rendre();return;}}
        st.levier=+b.dataset.lev;b.classList.add("appuye");};
      const haut=()=>{if(!b.classList.contains("appuye"))return;b.classList.remove("appuye");st.levier=1;rendre();};
      b.addEventListener("pointerdown",bas);b.addEventListener("pointerup",haut);b.addEventListener("pointerleave",haut);b.addEventListener("pointercancel",haut);});
    main.querySelector("#journal").innerHTML=st.journal.map(([t,c])=>`<li${c?` class="${c}"`:""}>${esc(t)}</li>`).join("");
    if(guide){const i=st.etape;
      main.querySelector("#consigne").innerHTML=i>=E.length?"<b>Procédure terminée.</b> La presse est remise en service, la béquille est rangée.":`<b>Étape ${i+1} · ${esc(E[i].t)}</b><br>${esc(E[i].c)}`;
      main.querySelector("#etapes").innerHTML=E.map((x,j)=>`<li class="${j<i?"ok":j===i?"encours":""}">${esc(x.t)}</li>`).join("");}
  }
  function boucle(now){
    if(detruit)return;const dt=Math.min(0.05,(now-dernier)/1000);dernier=now;
    if(!occupe){const avant=JSON.stringify([st.t.toFixed(3),Math.round(st.pAccu),st.pA,st.pompe]);actualiser(dt);
      const apres=JSON.stringify([st.t.toFixed(3),Math.round(st.pAccu),st.pA,st.pompe]);
      if(avant!==apres||st.levier!==1)rendreLeger();}
    raf=requestAnimationFrame(boucle);
  }
  function rendreLeger(){ // évite de reconstruire les panneaux (boutons maintenus) pendant un mouvement
    const p=pP();
    P.placerVerin("1A",st.t,st.pA>0?"#8E44AD44":"transparent","transparent");
    P.manos.M1.textContent=Math.round(p)+" bar";P.manos.M2.textContent=Math.round(st.pA)+" bar";
    P.accu.style.fill=st.pAccu>0.5?"#1F62D155":"transparent";
    P.positionner("1V1",st.levier);
    const bleu="var(--neutre)",gris="var(--mort)",violet="#8E44AD";
    const coul={pp:st.pompe?bleu:gris,p:p>0.5?bleu:gris,nA:st.levier===0&&p>0.5?bleu:gris,nB:st.levier===2&&p>0.5?bleu:gris,
      cA:st.pA>0?(st.levier===0&&p>0.5?bleu:violet):gris,tVD:st.vd&&st.pAccu>0.5?bleu:gris,tl:st.pompe&&!st.v0?bleu:gris};
    P.lignes.forEach(l=>{const c=coul[l.net]||gris;if(l.jonc)l.e.style.fill=c;else l.e.style.stroke=c;});
    if(st.levier===1&&guide){const avant=st.etape;avancer();if(st.etape!==avant)rendre();}
    if(st.levier===1&&!guide)rendre();
  }
  main.querySelector("#recommencer").onclick=()=>{if(occupe)return;init();};
  init();raf=requestAnimationFrame(boucle);
  return ()=>{detruit=true;if(raf)cancelAnimationFrame(raf);};
}
window.ElecConsFluides={scene};
})();
