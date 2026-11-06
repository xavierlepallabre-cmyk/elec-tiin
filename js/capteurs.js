/* Élec TIIN — Capteurs : détecteurs tout-ou-rien.
   Câblage des détecteurs 3 fils PNP / NPN et 2 fils vers une entrée d'automate ou un relais ;
   jeu « Quel capteur ? » ; fiche comparative. Valeurs typiques de catalogue, aucun résultat enregistré. */
(function(){
"use strict";
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const NS="http://www.w3.org/2000/svg";
function el(tag,a,p){const e=document.createElementNS(NS,tag);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
function txt(p,x,y,t,cls,anc){const e=el("text",{x,y,class:cls||"cp-t"},p);if(anc)e.setAttribute("text-anchor",anc);e.textContent=t;return e;}
const fr=(x,d=0)=>Number(x).toLocaleString("fr-FR",{minimumFractionDigits:d,maximumFractionDigits:d});
const melange=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const tete=(titre,lead,retour="#/capteurs",lib="Capteurs")=>`<a class="retour" href="${retour}">← ${lib}</a>
  <div class="page-head"><div><p class="tag"><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>Capteurs</p><h1>${titre}</h1><p class="lead">${lead}</p></div>`;

/* ---------- données ---------- */
const DET={
  "ind-pnp":{nom:"Inductif 3 fils PNP",fam:"ind",sortie:"pnp",fils:3,sn:8},
  "ind-npn":{nom:"Inductif 3 fils NPN",fam:"ind",sortie:"npn",fils:3,sn:8},
  "cap-pnp":{nom:"Capacitif 3 fils PNP",fam:"cap",sortie:"pnp",fils:3,sn:8},
  "ind-2f":{nom:"Inductif 2 fils",fam:"ind",sortie:"2f",fils:2,sn:8}};
const MAT={
  acier:{nom:"acier",ind:1,cap:1,coul:"#8A94A3"},inox:{nom:"inox",ind:0.7,cap:1,coul:"#B9C1CC"},
  laiton:{nom:"laiton",ind:0.45,cap:1,coul:"#C9A43A"},alu:{nom:"aluminium",ind:0.4,cap:1,coul:"#D3D8E0"},
  plastique:{nom:"plastique",ind:0,cap:0.45,coul:"#3E8ED0"},bois:{nom:"bois sec",ind:0,cap:0.3,coul:"#A0703C"},
  eau:{nom:"eau (bidon plein)",ind:0,cap:1,coul:"#5BC0EB"}};
const NETS=[["N","non raccordé"],["P","+24 V"],["M","0 V"],["S","signal (vers le récepteur)"]];
const NOMNET={N:"non raccordé",P:"+24 V",M:"0 V",S:"signal"};
const FILS3=[["marron","Marron (BN)","#8B5A2B"],["bleu","Bleu (BU)","#2F6FD6"],["noir","Noir (BK)","#1B1F27"]];
const FILS2=[["marron","Marron (BN)","#8B5A2B"],["bleu","Bleu (BU)","#2F6FD6"]];

/* ---------- modèle ---------- */
function evaluer(st,detecte){
  const d=DET[st.det],w=st.fils,R={alim:false,led:false,S:null,cc:false,detruit:false,msg:[],residuel:false};
  const V=n=>n==="P"?24:n==="M"?0:null;
  // potentiel vers lequel le récepteur ramène le signal (charge)
  let charge=null;
  if(st.rec==="api")charge=st.com;
  else{ if(st.a1==="S"&&st.a2!=="S")charge=st.a2; else if(st.a2==="S"&&st.a1!=="S")charge=st.a1; }
  if(d.fils===3){
    if(w.marron==="P"&&w.bleu==="M")R.alim=true;
    else if(w.marron==="M"&&w.bleu==="P")R.msg.push("Polarité inversée : le détecteur est protégé contre l'inversion, mais il ne fonctionne pas.");
    else if(w.marron==="N"||w.bleu==="N")R.msg.push("Le détecteur n'est pas alimenté : le marron va au +24 V, le bleu au 0 V.");
    else R.msg.push("Alimentation incorrecte : le marron va au +24 V, le bleu au 0 V. Le noir est la sortie.");
    if(R.alim){
      R.led=detecte;
      if(detecte){
        const drive=d.sortie==="pnp"?24:0;
        if(w.noir==="S")R.S=drive;
        else if((w.noir==="M"&&drive===24)||(w.noir==="P"&&drive===0)){R.cc=true;R.led="clignote";R.msg.push("La sortie est reliée directement à "+(drive===24?"0 V":"+24 V")+" : court-circuit à chaque détection. Le détecteur se met en protection et sa LED clignote.");}
      }
      if(w.noir==="N")R.msg.push("La sortie (fil noir) n'est raccordée à rien : le détecteur fonctionne mais ne commande rien.");
    }
  }else{
    const a=w.marron,b=w.bleu,alim=[a,b].filter(x=>x==="P"||x==="M"),sig=[a,b].filter(x=>x==="S");
    if(alim.length===2&&alim[0]!==alim[1]){
      if(detecte){R.detruit=true;R.msg.push("Détecteur 2 fils branché directement entre +24 V et 0 V : à la première détection, il se ferme en court-circuit franc et il est détruit. Un détecteur 2 fils se câble toujours en série avec sa charge.");}
      else R.msg.push("Sans détection, rien ne se passe… mais un détecteur 2 fils branché directement sur l'alimentation sera détruit dès qu'il détectera.");
    }else if(alim.length===1&&sig.length===1&&charge&&charge!=="S"&&V(charge)!==V(alim[0])){
      R.alim=true;R.led=detecte;R.residuel=!detecte;
      R.S=detecte?(alim[0]==="P"?20:4):null;
      if(!detecte)R.msg.push("Au repos, un petit courant résiduel (environ 0,8 mA) traverse la charge pour alimenter le détecteur : trop faible pour activer l'entrée ou le relais, mais assez pour faire luire un voyant LED.");
    }else R.msg.push("Un détecteur 2 fils se câble en série avec la charge : un fil vers l'alimentation, l'autre vers le récepteur, qui est lui-même relié à l'autre polarité.");
  }
  // récepteur
  const VS=R.S;
  if(st.rec==="api"){
    const com=V(st.com);R.entree=VS!==null&&com!==null&&((com===0&&VS>=15)||(com===24&&VS<=9));
  }else{
    const v=n=>n==="S"?VS:V(n);const x=v(st.a1),y=v(st.a2);
    R.bobine=x!==null&&y!==null&&Math.abs(x-y)>=15;
    if(st.a1!=="S"&&st.a2!=="S"&&V(st.a1)!==null&&V(st.a2)!==null&&V(st.a1)!==V(st.a2))R.msg.push("La bobine de KA1 est câblée directement sur l'alimentation : le relais est toujours collé, le détecteur ne commande rien.");
  }
  return R;
}
function bilan(st){
  const on=evaluer(st,true),off=evaluer(st,false),d=DET[st.det];
  const sortie=r=>st.rec==="api"?r.entree:r.bobine;
  if(on.detruit)return {ok:false,t:"Détecteur détruit."};
  if(on.cc)return {ok:false,t:"Court-circuit de la sortie."};
  if(sortie(on)&&!sortie(off))return {ok:true,t:"Câblage correct : "+(st.rec==="api"?"l'entrée I0.0 suit le détecteur.":"KA1 colle quand le détecteur détecte.")};
  if(sortie(on)&&sortie(off))return {ok:false,t:"Le récepteur est toujours actif : le détecteur ne commande rien."};
  if(on.alim&&d.fils===3&&on.S!==null&&st.rec==="api"){
    return {ok:false,t:d.sortie==="pnp"?"Sortie PNP sur une entrée en logique négative : la sortie met le signal au +24 V, comme le commun. Aucune tension aux bornes de l'entrée.":"Sortie NPN sur une entrée en logique positive : la sortie met le signal au 0 V, comme le commun. Aucune tension aux bornes de l'entrée."};
  }
  if(on.alim&&on.S!==null&&st.rec==="relais")return {ok:false,t:d.sortie==="npn"?"Une sortie NPN relie le signal au 0 V : la bobine doit avoir son autre borne au +24 V.":"Une sortie PNP met le signal au +24 V : la bobine doit avoir son autre borne au 0 V."};
  return {ok:false,t:"Le récepteur ne réagit pas à la détection."};
}

/* ---------- page câblage ---------- */
function cablage(main){
  const st={det:"ind-pnp",mat:"acier",d:14,rec:"api",com:"M",a1:"S",a2:"M",fils:{marron:"N",bleu:"N",noir:"N"},detecte:false};
  main.innerHTML=tete("Câbler un détecteur","Raccorde les fils du détecteur, choisis le récepteur, puis approche l'objet. Le détecteur 3 fils PNP fournit le +24 V sur sa sortie quand il détecte, le NPN fournit le 0 V.")+
    `<div class="etat" id="etat" role="status" aria-live="polite"></div></div>
    <div class="sim">
      <div class="folios-zone">
        <figure class="feuille" style="margin:0"><h3>Détecteur, alimentation 24 V et récepteur</h3><div class="defile" id="zone"></div></figure>
        <section class="bloc"><h2>Approche l'objet</h2>
          <label class="mc-reglage"><span>Distance entre l'objet et la face sensible : <b id="vd"></b></span><input type="range" id="dist" min="0" max="25" step="0.5" value="${st.d}"></label>
          <p class="astuce" id="portee"></p></section>
        <section class="bloc" aria-live="polite"><h2>Bilan</h2><div id="bilan"></div><ul class="explications" id="msgs"></ul></section>
      </div>
      <div class="panneau">
        <section class="bloc"><h2>Détecteur</h2>
          <label class="champ">Type <select id="det" class="select">${Object.entries(DET).map(([k,v])=>`<option value="${k}">${esc(v.nom)} · portée nominale ${v.sn} mm</option>`).join("")}</select></label>
          <div id="filsZone"></div></section>
        <section class="bloc"><h2>Récepteur</h2>
          <div class="segment" role="group" aria-label="Récepteur" data-nom="rec"><button type="button" data-v="api" aria-pressed="true">Entrée d'automate</button><button type="button" data-v="relais" aria-pressed="false">Relais KA1</button></div>
          <div id="recZone"></div></section>
        <section class="bloc"><h2>Objet</h2>
          <label class="champ">Matière <select id="mat" class="select">${Object.entries(MAT).map(([k,v])=>`<option value="${k}">${esc(v.nom)}</option>`).join("")}</select></label></section>
        <div class="actions"><button type="button" class="btn" id="raz">Tout débrancher</button></div>
      </div></div>
    <p class="astuce" style="margin-top:16px">Valeurs typiques d'un détecteur M18 noyable : portée nominale 8 mm sur acier, hystérésis d'environ 10 %. Facteurs de correction usuels : inox 0,7 ; laiton 0,45 ; aluminium 0,4. Le capacitif détecte aussi les isolants, avec une portée plus faible.</p>`;
  const sel=(id,opts,val,lab)=>`<label class="champ cp-fil">${lab}<select data-f="${id}" class="select">${opts.map(([v,t])=>`<option value="${v}"${v===val?" selected":""}>${esc(t)}</option>`).join("")}</select></label>`;
  function panneauFils(){
    const d=DET[st.det],L=d.fils===3?FILS3:FILS2;
    main.querySelector("#filsZone").innerHTML=`<p class="sous-titre">Raccordement des fils</p>`+L.map(([k,lab,c])=>sel(k,NETS,st.fils[k],`<span><span class="cp-pastille" style="background:${c}"></span>${lab}${d.fils===3?(k==="noir"?" · sortie":k==="marron"?" · +":" · −"):""}</span>`)).join("");
    main.querySelectorAll("#filsZone select").forEach(s=>s.onchange=()=>{st.fils[s.dataset.f]=s.value;maj();});
  }
  function panneauRec(){
    main.querySelector("#recZone").innerHTML=st.rec==="api"
      ?`<label class="champ">Commun des entrées (COM) relié au <select id="com" class="select"><option value="M"${st.com==="M"?" selected":""}>0 V : logique positive (pour PNP)</option><option value="P"${st.com==="P"?" selected":""}>+24 V : logique négative (pour NPN)</option></select></label>`
      :`<label class="champ">Borne A1 de la bobine <select id="a1" class="select">${[["P","+24 V"],["S","signal"],["M","0 V"]].map(([v,t])=>`<option value="${v}"${v===st.a1?" selected":""}>${t}</option>`).join("")}</select></label>
        <label class="champ">Borne A2 de la bobine <select id="a2" class="select">${[["M","0 V"],["S","signal"],["P","+24 V"]].map(([v,t])=>`<option value="${v}"${v===st.a2?" selected":""}>${t}</option>`).join("")}</select></label>`;
    ["com","a1","a2"].forEach(k=>{const s=main.querySelector("#"+k);if(s)s.onchange=()=>{st[k]=s.value;maj();};});
  }
  main.querySelector("#det").onchange=e=>{st.det=e.target.value;if(DET[st.det].fils===2)delete st.fils.noir;else st.fils.noir=st.fils.noir||"N";panneauFils();maj();};
  main.querySelector("#mat").onchange=e=>{st.mat=e.target.value;maj();};
  main.querySelector("#dist").oninput=e=>{st.d=+e.target.value;maj();};
  main.querySelectorAll('[data-nom="rec"] button').forEach(b=>b.onclick=()=>{st.rec=b.dataset.v;main.querySelectorAll('[data-nom="rec"] button').forEach(x=>x.setAttribute("aria-pressed",String(x===b)));panneauRec();maj();});
  main.querySelector("#raz").onclick=()=>{Object.keys(st.fils).forEach(k=>st.fils[k]="N");panneauFils();maj();};

  /* dessin */
  const svg=el("svg",{viewBox:"0 92 650 300",class:"cp-svg",role:"img","aria-label":"Détecteur, objet, alimentation et récepteur"});
  main.querySelector("#zone").appendChild(svg);
  const X0=210,K=8;
  const g={};
  // règle
  for(let mm=0;mm<=25;mm+=5){el("line",{x1:X0+mm*K,y1:176,x2:X0+mm*K,y2:182,class:"cp-regle"},svg);txt(svg,X0+mm*K,194,mm+" mm","cp-t petit","middle");}
  el("line",{x1:X0,y1:176,x2:X0+25*K,y2:176,class:"cp-regle"},svg);
  g.zone=el("rect",{x:X0,y:106,width:0,height:64,class:"cp-zone"},svg);
  // détecteur
  el("rect",{x:60,y:118,width:140,height:40,rx:4,class:"cp-corps"},svg);
  for(let x=70;x<190;x+=7)el("line",{x1:x,y1:118,x2:x+4,y2:158,class:"cp-filet"},svg);
  el("rect",{x:200,y:118,width:10,height:40,rx:2,class:"cp-face"},svg);
  el("rect",{x:40,y:126,width:20,height:24,rx:3,class:"cp-corps"},svg);
  g.led=el("circle",{cx:50,cy:120,r:6,class:"cp-led"},svg);
  g.nomDet=txt(svg,130,108,"","cp-t gras","middle");
  // objet
  g.obj=el("rect",{x:0,y:112,width:56,height:52,rx:4,class:"cp-objet"},svg);g.objT=txt(svg,0,140,"","cp-t petit","middle");
  // alimentation et bornier
  el("rect",{x:20,y:330,width:110,height:52,rx:6,class:"cp-boite"},svg);txt(svg,75,352,"Alimentation","cp-t gras","middle");txt(svg,75,368,"24 V continu","cp-t petit","middle");
  const BX={P:110,M:170,S:230};
  g.busP=el("path",{d:`M110,330 L110,300 M110,300 L600,300`,class:"cp-bus p"},svg);
  g.busM=el("path",{d:`M60,330 L60,318 L170,318 M170,318 L600,318`,class:"cp-bus m"},svg);
  txt(svg,606,304,"+24 V","cp-t petit");txt(svg,606,322,"0 V","cp-t petit");
  g.sig=el("path",{d:`M230,282 L230,262 L470,262`,class:"cp-sig"},svg);
  Object.entries(BX).forEach(([k,x])=>{el("rect",{x:x-16,y:264,width:32,height:22,rx:3,class:"cp-borne"},svg);txt(svg,x,279,k==="P"?"+24":k==="M"?"0 V":"sig.","cp-t petit","middle");});
  el("line",{x1:110,y1:286,x2:110,y2:300,class:"cp-bus p"},svg);el("line",{x1:170,y1:286,x2:170,y2:318,class:"cp-bus m"},svg);
  g.fils=el("g",{},svg);
  // récepteur
  g.rec=el("g",{},svg);
  function dessinerRec(R){
    g.rec.innerHTML="";
    el("rect",{x:470,y:200,width:130,height:80,rx:8,class:"cp-boite"},g.rec);
    const c=(v)=>v===24?"#D21F1F":v===0?"#2F6FD6":"var(--mort)";
    if(st.rec==="api"){
      txt(g.rec,535,218,"Automate","cp-t gras","middle");txt(g.rec,535,232,"entrées 24 V","cp-t petit","middle");
      el("circle",{cx:500,cy:255,r:8,class:"cp-led"+(R.entree?" on":"")},g.rec);txt(g.rec,514,259,"I0.0","cp-t gras");
      txt(g.rec,560,259,"COM","cp-t petit");
      el("path",{d:`M585,262 L585,${st.com==="P"?300:318}`,class:"cp-bus "+(st.com==="P"?"p":"m")},g.rec);
    }else{
      txt(g.rec,535,218,"Relais KA1","cp-t gras","middle");
      el("rect",{x:500,y:232,width:30,height:22,class:"cp-bobine"+(R.bobine?" on":"")},g.rec);txt(g.rec,515,247,"A1/A2","cp-t petit","middle");
      el("circle",{cx:570,cy:243,r:8,class:"cp-led"+(R.bobine?" on":"")},g.rec);txt(g.rec,570,270,"13-14","cp-t petit","middle");
      const y=n=>n==="P"?300:n==="M"?318:262;
      el("path",{d:`M500,236 L486,236 L486,${y(st.a1)}`,class:st.a1==="S"?"cp-sig":"cp-bus "+(st.a1==="P"?"p":"m")},g.rec);
      el("path",{d:`M530,250 L546,250 L546,${y(st.a2)}`,class:st.a2==="S"?"cp-sig":"cp-bus "+(st.a2==="P"?"p":"m")},g.rec);
    }
    g.sig.setAttribute("stroke",c(R.S));
  }
  function dessinerFils(){
    g.fils.innerHTML="";
    const d=DET[st.det],L=d.fils===3?FILS3:FILS2;
    L.forEach(([k,,coul],i)=>{
      const y0=130+i*8,col=24+i*8,h=226+i*10,n=st.fils[k];
      let dpath=`M40,${y0} L${col},${y0} L${col},${h}`;
      if(n!=="N"){const x=BX[n]+(i-1)*6;dpath+=` L${x},${h} L${x},264`;}
      else dpath+=` L${col+18},${h+6}`;
      el("path",{d:dpath,class:"cp-fil",stroke:coul},g.fils);
      if(n==="N")el("circle",{cx:col+18,cy:h+6,r:2.5,fill:coul},g.fils);
    });
  }
  function maj(){
    const d=DET[st.det],m=MAT[st.mat],f=m[d.fam],Sr=d.sn*f;
    st.detecte=f>0&&(st.detecte?st.d<=Sr*1.1:st.d<=Sr);
    const R=evaluer(st,st.detecte),B=bilan(st);
    g.nomDet.textContent=d.nom;
    g.zone.setAttribute("width",Sr*K);
    g.obj.setAttribute("x",X0+st.d*K);g.obj.setAttribute("fill",m.coul);g.objT.setAttribute("x",X0+st.d*K+28);g.objT.textContent=m.nom;
    g.led.setAttribute("class","cp-led"+(R.led===true?" on":R.led==="clignote"?" clignote":""));
    dessinerFils();dessinerRec(R);
    main.querySelector("#vd").textContent=fr(st.d,1)+" mm";
    main.querySelector("#portee").innerHTML=f>0?`Portée réelle sur ${esc(m.nom)} : ${fr(d.sn,0)} mm × ${fr(f,2)} = <b>${fr(Sr,1)} mm</b>. Le détecteur s'active en dessous et ne relâche qu'au-delà de ${fr(Sr*1.1,1)} mm (hystérésis).`:`Un détecteur ${d.fam==="ind"?"inductif ne détecte que les métaux":"capacitif"} : ${esc(m.nom)} n'est pas détecté${d.fam==="ind"?". Essaie un détecteur capacitif.":"."}`;
    const actif=st.rec==="api"?R.entree:R.bobine;
    const e=main.querySelector("#etat");e.dataset.s=R.detruit||R.cc?"defaut":actif?"marche":"arret";
    e.textContent=R.detruit?"Détecteur détruit":R.cc?"Court-circuit":st.rec==="api"?(R.entree?"Entrée I0.0 à 1":"Entrée I0.0 à 0"):(R.bobine?"KA1 collé":"KA1 au repos");
    main.querySelector("#bilan").innerHTML=Object.values(st.fils).every(x=>x==="N")?`<p class="astuce">Raccorde les fils du détecteur avec les listes à droite.</p>`:`<div class="verdict ${B.ok?"ok":"ko"}"><b>${esc(B.t)}</b></div>`;
    main.querySelector("#msgs").innerHTML=R.msg.map(x=>`<li class="ko">${esc(x)}</li>`).join("")+(R.residuel&&R.alim?"":"");
  }
  panneauFils();panneauRec();maj();
  return ()=>{};
}

/* ---------- jeu « Quel capteur ? » ---------- */
const TYPES={meca:"Interrupteur de position (fin de course mécanique)",ind:"Détecteur inductif",cap:"Détecteur capacitif",barrage:"Photoélectrique en barrage",reflex:"Photoélectrique reflex",prox:"Photoélectrique de proximité",ils:"Détecteur magnétique (ILS)",us:"Détecteur à ultrasons"};
const SITUATIONS=[
  {q:"Détecter le passage de tôles d'acier sur un convoyeur, à 4 mm de la face du détecteur, dans un atelier poussiéreux.",r:["ind"],e:"Inductif : il détecte les métaux sans contact, à courte portée, et la poussière ne le gêne pas."},
  {q:"Contrôler le niveau de granulés de plastique dans une trémie, à travers la paroi en plastique.",r:["cap"],e:"Capacitif : il détecte aussi les isolants (plastique, liquide, granulés) et peut détecter à travers une paroi non métallique."},
  {q:"Détecter des cartons sur un convoyeur de 3 m de large, quelle que soit leur couleur.",r:["barrage"],e:"Photoélectrique en barrage : émetteur et récepteur face à face, c'est le système qui porte le plus loin (plusieurs dizaines de mètres)."},
  {q:"Connaître la position du piston d'un vérin pneumatique, détection à travers le tube en aluminium.",r:["ils"],e:"Détecteur magnétique (ILS ou électronique) : il détecte l'aimant intégré au piston, à travers le tube amagnétique."},
  {q:"Contrôler la fermeture d'un protecteur mobile (porte de machine), pour la sécurité des personnes.",r:["meca"],e:"Interrupteur de position à manœuvre positive d'ouverture : les contacts sont ouverts mécaniquement, même s'ils sont soudés. Un détecteur électronique seul ne convient pas pour une fonction de sécurité."},
  {q:"Mesurer en continu, sans contact, le niveau d'eau dans une cuve ouverte de 2 m de haut.",r:["us"],e:"Ultrasons : il mesure la distance par le temps de retour d'une onde sonore, sans contact, insensible à la couleur et à la transparence."},
  {q:"Détecter une pièce en aluminium à 2 mm de la face, sur un poste de montage.",r:["ind"],e:"Inductif, en tenant compte du facteur de correction : sur l'aluminium, la portée d'un M18 tombe d'environ 8 mm à 3 mm. À 2 mm, ça passe."},
  {q:"Détecter des pièces de couleurs variées à 80 mm, sans réflecteur possible derrière : une seule face accessible.",r:["prox","us"],e:"Photoélectrique de proximité (ou diffus) : émetteur et récepteur dans le même boîtier, la lumière est renvoyée par l'objet lui-même. Les ultrasons conviennent aussi."},
  {q:"Détecter des palettes sur un convoyeur ; le récepteur ne peut pas être câblé de l'autre côté, mais on peut y fixer un réflecteur.",r:["reflex"],e:"Photoélectrique reflex : émetteur et récepteur du même côté, la lumière revient par un réflecteur placé en face. Un seul câble à tirer."},
  {q:"Vérifier qu'un bidon en plastique est plein, à travers sa paroi.",r:["cap"],e:"Capacitif : l'eau a une forte permittivité, elle est très bien détectée, même à travers une paroi plastique. On règle la sensibilité pour ne pas détecter le bidon vide."},
  {q:"Détecter l'ouverture d'une trappe de visite par un contact simple, sans alimentation du capteur.",r:["meca","ils"],e:"Interrupteur de position mécanique, ou contact magnétique (ILS) : ce sont des contacts secs, sans électronique, qui ne demandent pas d'alimentation."},
  {q:"Détecter des pièces métalliques à 40 mm, dans un environnement très humide et sale.",r:["us","barrage"],e:"À 40 mm, l'inductif ne porte pas assez loin (8 à 15 mm au plus pour un M18-M30). Ultrasons, ou photoélectrique en barrage s'il reste propre : le choix dépend de l'encrassement."}
];
function choix(main){
  const total=8;let n=0,bons=0;const serie=melange(SITUATIONS).slice(0,total);
  function question(){
    const s=serie[n],opts=Object.entries(TYPES);
    main.innerHTML=`<a class="retour" href="#/capteurs">← Capteurs</a>
      <div class="jeu"><div class="progression"><span>Situation ${n+1} sur ${total}</span><span class="barre"><i style="width:${n/total*100}%"></i></span></div>
      <div class="question"><div class="corps" style="grid-column:1/-1">
        <h2>Quel capteur choisir ?</h2><p class="lead">${esc(s.q)}</p>
        <div class="choix cp-choix">${opts.map(([k,t])=>`<button type="button" data-k="${k}">${esc(t)}</button>`).join("")}</div>
        <div class="retour-jeu" hidden aria-live="polite"></div>
        <button type="button" class="btn btn-primary suite" hidden>${n+1<total?"Situation suivante":"Voir le bilan"}</button></div></div></div>`;
    const fb=main.querySelector(".retour-jeu"),suite=main.querySelector(".suite");
    main.querySelectorAll(".choix button").forEach(b=>b.onclick=()=>{
      const ok=s.r.includes(b.dataset.k);if(ok)bons++;
      main.querySelectorAll(".choix button").forEach(x=>{x.disabled=true;if(s.r.includes(x.dataset.k))x.classList.add("juste");});
      if(!ok)b.classList.add("faux");
      fb.hidden=false;fb.className="retour-jeu "+(ok?"juste":"faux");fb.innerHTML=`<b>${ok?"Bon choix.":"Ce n'est pas le meilleur choix."}</b> ${esc(s.e)}`;
      suite.hidden=false;suite.focus();});
    suite.onclick=()=>{n++;n<total?question():fin();};
  }
  function fin(){
    main.innerHTML=`<a class="retour" href="#/capteurs">← Capteurs</a><div class="jeu"><div class="bilan"><h2>${bons} bon${bons>1?"s":""} choix sur ${total}</h2>
      <p class="lead">Ce résultat n'est pas enregistré. Relis la fiche comparative pour les cas où tu as hésité.</p>
      <div class="actions"><button type="button" class="btn btn-primary" id="rejouer">Nouvelle série</button><a class="btn" href="#/capteurs/fiche">Fiche comparative</a></div></div></div>`;
    main.querySelector("#rejouer").onclick=()=>{n=0;bons=0;serie.splice(0,serie.length,...melange(SITUATIONS).slice(0,total));question();};
  }
  question();return ()=>{};
}

/* ---------- fiche comparative ---------- */
const FICHE=[
  ["Interrupteur de position","Contact mécanique actionné par l'objet (galet, levier, poussoir).","Tout objet, avec contact","Contact sec, sans alimentation ; manœuvre positive d'ouverture pour la sécurité.","Usure mécanique, il faut toucher l'objet."],
  ["Inductif","Champ magnétique alternatif perturbé par un métal.","Métaux, de 1 à 40 mm (8 mm pour un M18 noyable sur acier)","Robuste, insensible à la poussière, à l'huile et à l'eau, sans usure.","Métaux seulement, courte portée, réduite sur inox, laiton, aluminium."],
  ["Capacitif","Variation de capacité devant la face sensible.","Tous matériaux (métal, plastique, bois, liquides, poudres), jusqu'à environ 20 mm","Détecte les isolants et à travers une paroi non métallique.","Sensible à l'humidité et aux dépôts, réglage de sensibilité nécessaire."],
  ["Photoélectrique en barrage","Faisceau lumineux interrompu entre un émetteur et un récepteur séparés.","Objets opaques, jusqu'à plusieurs dizaines de mètres","La plus grande portée, fiable.","Deux appareils à câbler et à aligner."],
  ["Photoélectrique reflex","Émetteur et récepteur dans le même boîtier, lumière renvoyée par un réflecteur.","Objets opaques, jusqu'à une dizaine de mètres","Un seul câble.","Objets brillants ou transparents délicats (version polarisée)."],
  ["Photoélectrique de proximité","Lumière renvoyée par l'objet lui-même.","Objets à courte distance (quelques centimètres à 1 ou 2 m)","Une seule face accessible suffit.","Portée dépendant de la couleur et de l'état de surface."],
  ["Magnétique (ILS)","Contact actionné par un aimant (piston de vérin, porte).","Aimant, à travers une paroi amagnétique","Contact sec, simple, peu coûteux.","Il faut un aimant ; contact sensible aux surintensités."],
  ["Ultrasons","Temps de retour d'une onde sonore.","Tous objets et liquides, de quelques cm à plusieurs mètres","Insensible à la couleur et à la transparence, mesure de distance possible.","Zone aveugle près de la face, sensible aux mousses et aux turbulences."]
];
function fiche(main){
  main.innerHTML=tete("Fiche comparative des détecteurs","Principe, ce que chaque famille détecte, ses atouts et ses limites.")+`</div>
    <div class="mc-tableau cp-fiche"><table><thead><tr><th>Famille</th><th>Principe</th><th>Détecte</th><th>Atouts</th><th>Limites</th></tr></thead>
    <tbody>${FICHE.map(r=>`<tr>${r.map((c,i)=>i?`<td>${esc(c)}</td>`:`<th scope="row">${esc(c)}</th>`).join("")}</tr>`).join("")}</tbody></table></div>
    <section class="bloc" style="margin-top:16px"><h2>Couleurs des fils (détecteurs 3 fils)</h2><ul class="explications">
      <li><b>Marron (BN)</b> : +24 V. <b>Bleu (BU)</b> : 0 V. <b>Noir (BK)</b> : sortie. <b>Blanc (WH)</b> : deuxième sortie (NF) sur les modèles à 4 fils.</li>
      <li><b>PNP</b> : la sortie fournit le +24 V quand le détecteur détecte (« la sortie source le courant »). Se câble sur une entrée en logique positive, ou sur une charge reliée au 0 V.</li>
      <li><b>NPN</b> : la sortie relie le signal au 0 V quand le détecteur détecte. Se câble sur une entrée en logique négative, ou sur une charge reliée au +24 V. En Europe, le PNP est le plus courant.</li>
      <li><b>2 fils</b> : toujours en série avec la charge ; un faible courant résiduel le traverse au repos et une tension de déchet de quelques volts subsiste en détection.</li></ul></section>`;
  return ()=>{};
}

/* ---------- accueil ---------- */
function accueil(main){
  main.innerHTML=tete("Les détecteurs","Câbler un détecteur PNP, NPN ou 2 fils et voir pourquoi il commande ou non son récepteur ; choisir le bon capteur pour une situation ; retrouver l'essentiel dans une fiche.","#/atelier","Atelier")+`</div>
    <div class="niveaux">
      <a class="niveau" href="#/capteurs/cablage"><span class="num">Simulateur</span><h2>Câbler un détecteur</h2><p class="lead" style="margin:0">Fils marron, bleu, noir ; entrée d'automate en logique positive ou négative, relais ; matière et distance de l'objet.</p><span style="font-weight:600;color:var(--brand-text);font-size:14px">Ouvrir →</span></a>
      <a class="niveau" href="#/capteurs/choix"><span class="num">Jeu</span><h2>Quel capteur choisir ?</h2><p class="lead" style="margin:0">Huit situations d'atelier : choisis le détecteur adapté, avec l'explication.</p><span style="font-weight:600;color:var(--brand-text);font-size:14px">Jouer →</span></a>
      <a class="niveau" href="#/capteurs/fiche"><span class="num">Fiche</span><h2>Comparer les détecteurs</h2><p class="lead" style="margin:0">Huit familles : principe, portée, atouts, limites, couleurs des fils.</p><span style="font-weight:600;color:var(--brand-text);font-size:14px">Lire →</span></a>
    </div>`;
  return ()=>{};
}
function ouvrir(main,sous){return sous==="cablage"?cablage(main):sous==="choix"?choix(main):sous==="fiche"?fiche(main):accueil(main);}

window.ElecCapteurs={ouvrir,evaluer,bilan,DET,MAT};
})();
