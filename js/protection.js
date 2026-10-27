/* Élec TIIN — Protéger les personnes : différentiel en schéma TT, effets du courant,
   conduite à tenir face à un accident électrique (Protéger, Examiner, Faire alerter, Secourir).
   Valeurs d'ordre de grandeur, aucun résultat n'est enregistré. */
(function(){
"use strict";
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const NS="http://www.w3.org/2000/svg";
function el(tag,a,p){const e=document.createElementNS(NS,tag);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
function txt(p,x,y,t,cls,ancre){const e=el("text",{x,y,class:cls||"pp-t"},p);if(ancre)e.setAttribute("text-anchor",ancre);e.textContent=t;return e;}
const virg=n=>String(n).replace(".",",");
const fmtI=mA=>mA<=0?"0 mA":mA<1?virg(mA.toFixed(2))+" mA":mA<1000?Math.round(mA)+" mA":virg((mA/1000).toFixed(2))+" A";
const fmtV=v=>Math.round(v)+" V";
const retour=`<a class="retour" href="#/consignation">← Sécurité</a>`;
const tete=(tag,titre,lead)=>`${retour}<div class="page-head"><div><p class="tag"><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>${tag}</p><h1>${titre}</h1><p class="lead">${lead}</p></div>`;
const segment=(nom,titre,options,val)=>`<div class="pp-choix"><span>${titre}</span><div class="segment" role="group" aria-label="${esc(titre)}" data-nom="${nom}">${options.map(([v,l])=>`<button type="button" data-v="${v}" aria-pressed="${String(v)===String(val)}">${l}</button>`).join("")}</div></div>`;
function lierSegments(racine,st,apres){
  racine.querySelectorAll(".segment[data-nom]").forEach(g=>g.addEventListener("click",e=>{
    const b=e.target.closest("button[data-v]");if(!b)return;
    const nom=g.dataset.nom,brut=b.dataset.v,v=typeof st[nom]==="number"?+brut:brut==="true"?true:brut==="false"?false:brut;
    st[nom]=v;g.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));apres(nom);
  }));
}

/* ---------- effets du courant : seuils (courant alternatif 50 Hz, ordres de grandeur) ---------- */
const SEUILS=[
  {a:0.5,c:"s0",t:"Pas de sensation."},
  {a:10,c:"s1",t:"Perception, puis secousse désagréable (choc vers 8 mA)."},
  {a:30,c:"s2",t:"Contraction des muscles : la main se crispe, on ne peut plus lâcher (vers 10 à 20 mA)."},
  {a:40,c:"s3",t:"Paralysie respiratoire possible (vers 30 mA) : la victime s'asphyxie si le courant dure."},
  {a:1000,c:"s4",t:"Fibrillation ventriculaire possible (dès 40 à 80 mA) : le cœur ne pompe plus, mort en quelques minutes sans défibrillateur."},
  {a:Infinity,c:"s5",t:"Arrêt cardiaque (vers 1 A) et brûlures internes ; au-delà de 2 A, atteinte des centres nerveux."}];
const zone=mA=>SEUILS.find(s=>mA<s.a);
const LOGMIN=-1,LOGMAX=Math.log10(5000);
const pos=v=>Math.max(0,Math.min(100,(Math.log10(Math.max(v,0.1))-LOGMIN)/(LOGMAX-LOGMIN)*100));
function echelle(mA,duree,texte){
  let de=0.1;const segs=SEUILS.map(s=>{const a=Math.min(s.a,5000),h=`<i class="${s.c}" style="left:${pos(de)}%;width:${pos(a)-pos(de)}%"></i>`;de=a;return h;}).join("");
  const grad=[[0.5,"0,5 mA"],[10,"10 mA"],[30,"30 mA"],[80,"80 mA"],[1000,"1 A"]].map(([v,l])=>`<span style="left:${pos(v)}%">${l}</span>`).join("");
  const z=zone(mA);
  return `<div class="echelle" role="img" aria-label="Courant dans le corps : ${fmtI(mA)}. ${esc(z.t)}">
    <div class="barre">${segs}${mA>0?`<b class="curseur" style="left:${pos(mA)}%"></b>`:""}</div><div class="graduations">${grad}</div></div>
    <p class="zone-txt"><b>${fmtI(mA)}</b>${duree?` <span class="pill" style="margin:0">${esc(duree)}</span>`:""} — ${esc(texte||z.t)}</p>`;
}

/* ======================= simulateur du différentiel (schéma TT) ======================= */
const U0=230,RN=10,RD_RESISTIF=200;
const PEAU={seche:{r:5000,l:"sèche"},humide:{r:2000,l:"humide"},mouillee:{r:1000,l:"mouillée"}};
const EXPERIENCES=[
  ["defaut30","Défaut d'isolement, PE raccordé, DDR 30 mA : le DDR déclenche."],
  ["piege","Défaut d'isolement avec PE coupé : la masse est à 230 V et rien ne déclenche."],
  ["toucheSans","Fais toucher la masse en défaut, PE coupé et sans DDR : électrisation permanente."],
  ["direct30","Contact direct avec une phase, DDR 30 mA : il déclenche, mais la personne reçoit une secousse."],
  ["ln","Contact entre phase et neutre, sur tapis isolant : le DDR ne voit rien."],
  ["terre","DDR 500 mA, prise de terre à 500 Ω, défaut résistif : la masse reste au-dessus de 50 V."],
  ["test","Appuie sur le bouton test du DDR."]];

function ddr(main){
  const st={ddr:30,defaut:"non",pe:true,ra:100,contact:"aucun",peau:"seche",declenche:false,dernier:null,faites:new Set()};
  main.innerHTML=tete("Protéger les personnes","Le disjoncteur différentiel","Un appareil à carcasse métallique est relié à la terre par son conducteur de protection PE (schéma TT). Provoque un défaut d'isolement, coupe le PE, fais toucher la carcasse ou un fil : le simulateur calcule le courant de fuite, la tension de la masse et le courant qui traverse le corps.")+
    `<div class="etat" id="etat" role="status" aria-live="polite"></div></div>
    <div class="sim">
      <div class="folios-zone">
        <figure class="feuille" style="margin:0"><h3>Installation en schéma TT, 230 V</h3><div class="defile" id="zone"></div></figure>
        <div class="legende"><span><i style="background:var(--vif)"></i>phase sous tension</span><span><i style="background:var(--neutre)"></i>neutre</span><span><i style="background:#2E9E3E"></i>conducteur de protection PE</span><span><i style="background:var(--accent)"></i>chemin du courant de défaut</span></div>
        <section class="bloc" aria-live="polite"><h2>Ce qui se passe</h2><div id="analyse"></div></section>
        <section class="bloc"><h2>Courant dans le corps</h2><div id="corps"></div></section>
      </div>
      <div class="panneau">
        <section class="bloc"><h2>Protection</h2>
          ${segment("ddr","Différentiel Q1 (sensibilité IΔn)",[[0,"aucun"],[30,"30 mA"],[300,"300 mA"],[500,"500 mA"]],st.ddr)}
          <div class="actions"><button type="button" class="btn" id="test">Tester (T)</button><button type="button" class="btn btn-primary" id="rearmer">Réarmer Q1</button></div></section>
        <section class="bloc"><h2>Appareil</h2>
          ${segment("defaut","Isolement",[["non","sain"],["resistif","abîmé (200 Ω)"],["franc","défaut franc"]],st.defaut)}
          ${segment("pe","Conducteur PE",[[true,"raccordé"],[false,"coupé"]],st.pe)}
          ${segment("ra","Prise de terre Ra",[[20,"20 Ω"],[100,"100 Ω"],[500,"500 Ω"]],st.ra)}</section>
        <section class="bloc"><h2>Personne</h2>
          ${segment("contact","Elle touche",[["aucun","rien"],["masse","la carcasse"],["phase","un fil de phase"],["ln","phase et neutre"]],st.contact)}
          ${segment("peau","Peau",[["seche","sèche"],["humide","humide"],["mouillee","mouillée"]],st.peau)}</section>
        <section class="bloc"><h2>Mesures</h2><div id="mesures" class="pp-mesures"></div></section>
        <section class="bloc"><h2>Expériences à faire</h2><ol class="etapes" id="expes"></ol></section>
      </div>
    </div>
    <p class="astuce" style="margin-top:16px">Valeurs d'ordre de grandeur : tension simple 230 V, prise de terre du neutre Rn = 10 Ω, corps humain avec ses contacts 5 000 Ω (peau sèche), 2 000 Ω (humide) ou 1 000 Ω (mouillée). Un DDR déclenche obligatoirement à IΔn, en au plus 300 ms ; il peut déclencher dès IΔn/2. Le simulateur le fait déclencher à IΔn.</p>`;

  /* ---------- dessin ---------- */
  const svg=el("svg",{viewBox:"0 0 640 372",class:"pp-svg",role:"img","aria-label":"Transformateur, disjoncteur différentiel, appareil à carcasse métallique relié à la terre, personne"});
  main.querySelector("#zone").appendChild(svg);
  const g={};
  // sol
  el("line",{x1:20,y1:348,x2:625,y2:348,class:"pp-sol"},svg);
  for(let x=24;x<625;x+=14)el("line",{x1:x,y1:349,x2:x-8,y2:358,class:"pp-hach"},svg);
  txt(svg,600,368,"terre","pp-t petit","end");
  // transformateur
  el("circle",{cx:40,cy:80,r:19,class:"pp-symb"},svg);el("circle",{cx:62,cy:80,r:19,class:"pp-symb"},svg);
  txt(svg,51,122,"230 V","pp-t petit","middle");
  el("path",{d:"M81,72 L95,60 L180,60",class:"pp-w vif"},svg);
  g.nAmont=el("path",{d:"M81,88 L95,100 L180,100",class:"pp-w neutre"},svg);
  txt(svg,120,54,"L","pp-t gras");txt(svg,138,94,"N","pp-t gras");
  // terre du neutre
  el("path",{d:"M110,100 L110,228 M110,272 L110,348",class:"pp-w neutre"},svg);
  el("circle",{cx:110,cy:100,r:3.2,class:"pp-jonc"},svg);
  el("rect",{x:103,y:228,width:14,height:44,class:"pp-symb pp-fond"},svg);
  txt(svg,123,246,"Rn","pp-t gras");txt(svg,123,260,"terre du neutre","pp-t petit");
  // différentiel
  g.ddr=el("g",{},svg);
  el("rect",{x:178,y:28,width:110,height:118,rx:6,class:"pp-boite"},g.ddr);
  g.titreDdr=txt(g.ddr,233,22,"Q1 · DDR 30 mA","pp-t gras","middle");
  el("path",{d:"M180,60 L206,60 M238,60 L288,60",class:"pp-w vif",id:"lAmontDdr"},g.ddr);
  g.lAval1=el("path",{d:"M238,60 L288,60",class:"pp-w"},g.ddr);
  g.nAval1=el("path",{d:"M238,100 L288,100",class:"pp-w"},g.ddr);
  el("path",{d:"M180,100 L206,100",class:"pp-w neutre"},g.ddr);
  g.lameL=el("line",{x1:206,y1:60,x2:238,y2:60,class:"pp-lame"},g.ddr);
  g.lameN=el("line",{x1:206,y1:100,x2:238,y2:100,class:"pp-lame"},g.ddr);
  el("circle",{cx:206,cy:60,r:2.6,class:"pp-jonc"},g.ddr);el("circle",{cx:206,cy:100,r:2.6,class:"pp-jonc"},g.ddr);
  g.lien=el("line",{x1:222,y1:58,x2:222,y2:128,class:"pp-tirets"},g.ddr);
  el("ellipse",{cx:264,cy:80,rx:9,ry:34,class:"pp-tore"},g.ddr);
  el("line",{x1:264,y1:114,x2:264,y2:128,class:"pp-symb"},g.ddr);el("line",{x1:222,y1:128,x2:264,y2:128,class:"pp-symb"},g.ddr);
  txt(g.ddr,273,138,"tore","pp-t petit");
  g.bTest=el("g",{class:"pp-bouton",tabindex:"0",role:"button","aria-label":"Bouton test du différentiel"},g.ddr);
  el("circle",{cx:194,cy:127,r:10,class:"pp-symb pp-fond"},g.bTest);txt(g.bTest,194,131.5,"T","pp-t gras","middle");
  g.sansDdr=el("g",{},svg);
  g.lDirect=el("path",{d:"M180,60 L288,60",class:"pp-w"},g.sansDdr);g.nDirect=el("path",{d:"M180,100 L288,100",class:"pp-w"},g.sansDdr);
  txt(g.sansDdr,233,84,"pas de différentiel","pp-t petit","middle");
  // aval
  g.lAval=el("path",{d:"M288,60 L480,60 L480,150 M480,190 L480,205 L560,205 L560,100 L288,100",class:"pp-w"},svg);
  g.nAval=el("path",{d:"M480,190 L480,205 L560,205 L560,100 L288,100",class:"pp-w"},svg);
  el("rect",{x:472,y:150,width:16,height:40,class:"pp-symb pp-fond"},svg);
  txt(svg,494,172,"récepteur","pp-t petit");
  // carcasse
  g.carc=el("rect",{x:440,y:126,width:160,height:104,rx:4,class:"pp-carc"},svg);
  svg.insertBefore(g.carc,g.lAval);
  txt(svg,444,244,"carcasse","pp-t petit");
  g.uc=txt(svg,446,222,"","pp-t gras");
  // défaut d'isolement
  g.defaut=el("g",{},svg);
  el("path",{d:"M480,140 L470,146 L462,138 L454,150 L442,146",class:"pp-defaut"},g.defaut);
  g.defautT=txt(g.defaut,436,118,"défaut","pp-t petit pp-acc","end");
  // PE et prise de terre Ra
  g.pe1=el("path",{d:"M520,230 L520,246",class:"pp-pe"},svg);
  g.pe2=el("path",{d:"M520,256 L520,270 M520,306 L520,348",class:"pp-pe"},svg);
  g.coupure=el("g",{},svg);
  el("line",{x1:510,y1:246,x2:530,y2:246,class:"pp-coupe"},g.coupure);el("line",{x1:510,y1:256,x2:530,y2:256,class:"pp-coupe"},g.coupure);
  txt(g.coupure,536,255,"PE coupé","pp-t petit pp-ko");
  g.peLien=el("path",{d:"M520,246 L520,256",class:"pp-pe"},svg);
  el("rect",{x:513,y:270,width:14,height:36,class:"pp-symb pp-fond"},svg);
  txt(svg,533,286,"Ra","pp-t gras");g.raT=txt(svg,533,300,"100 Ω","pp-t petit");
  txt(svg,526,240,"PE","pp-t petit");
  // conducteurs dénudés (contact direct)
  g.denude=el("g",{},svg);
  g.fL=el("path",{d:"M330,60 L330,186",class:"pp-w"},g.denude);el("circle",{cx:330,cy:60,r:3,class:"pp-jonc"},g.denude);
  el("circle",{cx:330,cy:189,r:3.4,class:"pp-nu"},g.denude);
  g.denudeN=el("g",{},svg);
  g.fN=el("path",{d:"M352,100 L352,196",class:"pp-w"},g.denudeN);el("circle",{cx:352,cy:100,r:3,class:"pp-jonc"},g.denudeN);
  el("circle",{cx:352,cy:199,r:3.4,class:"pp-nu"},g.denudeN);
  g.denudeT=txt(svg,318,206,"fil dénudé","pp-t petit","end");
  // tapis isolant
  g.tapis=el("rect",{x:362,y:340,width:58,height:8,rx:2,class:"pp-tapis"},svg);
  // chemins du courant
  g.chemins=el("g",{},svg);
  // personne
  g.pers=el("g",{class:"pp-pers"},svg);
  el("circle",{cx:390,cy:206,r:11},g.pers);
  el("path",{d:"M390,217 L390,290 L376,346 M390,290 L404,346"},g.pers);
  g.bras=el("path",{d:""},g.pers);
  g.eclair=txt(svg,404,214,"⚡","pp-eclair");

  /* ---------- calcul ---------- */
  function calcul(){
    const Rp=PEAU[st.peau].r;let Id=0,Ib=0,Uc=0;const ch=[];
    if(st.contact==="phase"){Ib=U0/(Rp+RN);Id+=Ib;ch.push("phase");}
    if(st.contact==="ln"){Ib=U0/Rp;ch.push("ln");}
    if(st.defaut!=="non"){
      const Rd=st.defaut==="franc"?0:RD_RESISTIF,touche=st.contact==="masse";
      const Rm=st.pe&&touche?st.ra*Rp/(st.ra+Rp):st.pe?st.ra:touche?Rp:Infinity;
      if(Rm===Infinity)Uc=U0;
      else{const i=U0/(Rd+RN+Rm);Id+=i;Uc=i*Rm;if(touche)Ib=Uc/Rp;if(st.pe)ch.push("pe");if(touche)ch.push("masse");}
    }
    return {Id:Id*1000,Ib:Ib*1000,Uc,ch};
  }
  const sousTension=()=>!(st.ddr&&st.declenche);
  const duree=k=>k>=5?"moins de 40 ms":k>=2?"moins de 150 ms":"moins de 300 ms";
  function verifier(c){
    if(sousTension()&&st.ddr&&c.Id>=st.ddr){st.declenche=true;st.dernier={...c,t:duree(c.Id/st.ddr)};}
  }
  function cocher(c,av){
    const f=st.faites,tripped=st.declenche&&st.dernier;
    if(st.defaut!=="non"&&st.pe&&st.ddr===30&&tripped&&st.dernier.ch.includes("pe"))f.add("defaut30");
    if(st.defaut!=="non"&&!st.pe&&st.contact!=="masse"&&av)f.add("piege");
    if(st.defaut!=="non"&&!st.pe&&st.contact==="masse"&&!st.ddr)f.add("toucheSans");
    if(st.contact==="phase"&&st.ddr===30&&tripped)f.add("direct30");
    if(st.contact==="ln"&&av&&c.Ib>0)f.add("ln");
    if(st.ddr===500&&st.ra===500&&st.defaut==="resistif"&&st.pe&&av&&c.Uc>50)f.add("terre");
  }

  /* ---------- affichage ---------- */
  function peindre(){
    const av=sousTension(),c=av?calcul():{Id:0,Ib:0,Uc:0,ch:[]};
    const etat=main.querySelector("#etat");
    etat.dataset.s=av?(c.Ib>0.5||c.Uc>50?"defaut":"marche"):"arret";
    etat.textContent=av?(c.Ib>0.5?"Personne électrisée":c.Uc>50?"Masse dangereuse":"Sous tension"):"Q1 déclenché · hors tension";
    // dessin
    g.ddr.style.display=st.ddr?"":"none";g.sansDdr.style.display=st.ddr?"none":"";
    g.titreDdr.textContent=`Q1 · DDR ${st.ddr} mA`;
    g.lameL.setAttribute("x2",av?238:232);g.lameL.setAttribute("y2",av?60:44);
    g.lameN.setAttribute("x2",av?238:232);g.lameN.setAttribute("y2",av?100:84);
    const vif=(p,on)=>p.setAttribute("class","pp-w"+(on?" vif":""));
    const neu=(p,on)=>p.setAttribute("class","pp-w"+(on?" neutre":""));
    [g.lAval1,g.lDirect,g.lAval,g.fL].forEach(p=>vif(p,av));
    [g.nAval1,g.nDirect,g.nAval,g.fN].forEach(p=>neu(p,true));
    g.defaut.style.display=st.defaut==="non"?"none":"";
    g.defautT.textContent=st.defaut==="franc"?"défaut franc":"isolant abîmé";
    g.coupure.style.display=st.pe?"none":"";g.peLien.style.display=st.pe?"":"none";
    g.raT.textContent=st.ra+" Ω";
    const masseVive=av&&st.defaut!=="non"&&c.Uc>0;
    g.carc.setAttribute("class","pp-carc"+(masseVive&&c.Uc>50?" vive":masseVive?" tiede":""));
    g.uc.textContent=masseVive?"masse à "+fmtV(c.Uc):"";
    g.denude.style.display=st.contact==="phase"||st.contact==="ln"?"":"none";
    g.denudeN.style.display=st.contact==="ln"?"":"none";
    g.denudeT.style.display=g.denude.style.display;
    g.tapis.style.display=st.contact==="ln"?"":"none";
    g.bras.setAttribute("d",{aucun:"M375,272 L390,232 L405,272",masse:"M375,272 L390,232 L440,196",phase:"M333,189 L390,232 L405,272",ln:"M333,189 L390,232 L355,199"}[st.contact]);
    const choc=av&&c.Ib>0.5;
    g.pers.setAttribute("class","pp-pers"+(choc?" choc":""));g.eclair.style.display=choc?"":"none";
    g.chemins.innerHTML="";
    const chemin=d=>el("path",{d,class:"pp-courant"},g.chemins);
    if(av){
      if(c.ch.includes("pe"))chemin("M480,141 L442,146 L446,228 L520,228 L520,344 L114,344 L110,272");
      if(c.ch.includes("masse"))chemin("M480,141 L442,146 L440,196 L390,232 L390,290 L392,344 L114,344 L110,272");
      if(c.ch.includes("phase"))chemin("M330,62 L333,189 L390,232 L390,290 L392,344 L114,344 L110,272");
      if(c.ch.includes("ln"))chemin("M330,62 L333,189 L390,232 L355,199 L352,102");
    }
    // mesures
    const k=st.ddr?(st.ra*st.ddr/1000):null;
    main.querySelector("#mesures").innerHTML=`
      <div><span>Q1</span><b>${!st.ddr?"absent":av?"fermé":"déclenché"}</b></div>
      <div><span>Courant différentiel IΔ</span><b>${fmtI(c.Id)}</b></div>
      <div><span>Tension de la masse Uc</span><b class="${c.Uc>50?"pp-ko":""}">${st.defaut==="non"||!av?"0 V":fmtV(c.Uc)}</b></div>
      <div><span>Courant dans le corps</span><b class="${c.Ib>10?"pp-ko":""}">${fmtI(c.Ib)}</b></div>
      ${st.ddr?`<div><span>Ra × IΔn</span><b class="${k>50?"pp-ko":"pp-ok"}">${virg(+k.toFixed(1))} V ${k>50?"&gt;":"≤"} 50 V</b></div>`:""}`;
    // corps
    const z=main.querySelector("#corps");
    if(!av&&st.dernier&&st.dernier.Ib>0)z.innerHTML=echelle(st.dernier.Ib,"pendant "+st.dernier.t,"Secousse violente mais brève : coupé aussi vite, ce courant ne provoque en général pas de fibrillation (courbes de l'IEC 60479). Le danger reste la chute ou le geste réflexe.")+`<p class="astuce">Le différentiel a coupé : la personne a reçu ce courant pendant ${esc(st.dernier.t)} seulement. Il ne limite pas l'intensité, il limite la durée.</p>`;
    else z.innerHTML=echelle(c.Ib,c.Ib>0?"permanent":"")+(c.Ib>0?`<p class="astuce">Rien ne coupe : le courant dure tant que la personne reste en contact. Au-delà de 10 à 20 mA, elle ne peut plus lâcher.</p>`:"");
    main.querySelector("#analyse").innerHTML=analyse(av,c);
    cocher(c,av);
    main.querySelector("#expes").innerHTML=EXPERIENCES.map(([id,t])=>`<li class="${st.faites.has(id)?"ok":""}">${esc(t)}</li>`).join("");
    main.querySelector("#test").disabled=!st.ddr;main.querySelector("#rearmer").disabled=!st.ddr||av;
  }
  function analyse(av,c){
    const v=(cls,t,p)=>`<div class="verdict ${cls}"><b>${t}</b><span>${p}</span></div>`;
    if(!av){
      const d=st.dernier;
      if(d&&d.test)return v("ok","Q1 a déclenché : le test est réussi.","Le bouton T fait passer un petit courant par une résistance interne qui contourne le tore : le courant qui entre n'est plus égal au courant qui sort, le DDR déclenche. Le test vérifie le mécanisme du DDR, pas la prise de terre ni le conducteur PE. On le fait régulièrement, par exemple chaque mois comme le recommandent les fabricants. Réarme Q1.");
      const encore=calcul().Id>=st.ddr;
      return v("ok",`Q1 a déclenché : IΔ = ${fmtI(d.Id)} ≥ IΔn = ${st.ddr} mA.`,`Le tore compare le courant qui part par la phase et celui qui revient par le neutre. La différence est partie à la terre ${d.ch.includes("pe")?"par le PE":"à travers le corps"} : le DDR coupe ${esc(d.t)}. ${encore?"Le défaut est toujours là : si tu réarmes, Q1 redéclenche. Supprime d'abord le défaut (ou retire la main).":"La cause a disparu : tu peux réarmer."}`);
    }
    const ddrTxt=st.ddr?`le DDR ${st.ddr} mA`:"aucun différentiel";
    if(st.contact==="ln")return v("ko","Le différentiel ne voit rien.",`Le courant entre dans le corps par la phase et ressort par le neutre : tout ce qui part par L revient par N, IΔ = 0. Ni la terre ni le différentiel ne protègent contre un contact entre deux conducteurs actifs. ${fmtI(c.Ib)} traversent la personne d'une main à l'autre, à travers le thorax. Seule la mise hors tension (consignation) protège : c'est pour cela qu'on ne travaille pas sous tension sans habilitation ni procédure.`);
    if(st.contact==="phase")return v("ko","Contact direct : rien ne coupe.",`La personne touche un fil de phase et le courant rejoint la terre par ses pieds : ${fmtI(c.Ib)}. Avec ${ddrTxt}, ce courant ne suffit pas à faire déclencher. Seul un DDR 30 mA (protection complémentaire, obligatoire sur les prises de courant) coupe avant les effets les plus graves.`);
    if(st.defaut==="non")return st.contact==="masse"?v("ok","Aucun danger.","La carcasse n'est reliée à aucun conducteur actif : sa tension est nulle."):v("","Installation saine : IΔ = 0.","Le courant qui part par la phase revient entièrement par le neutre. Provoque un défaut, coupe le PE, ou fais toucher un fil pour voir ce qui se passe.");
    if(!st.pe&&st.contact!=="masse")return v("ko","Piège : la carcasse est à 230 V et rien ne déclenche.","Sans PE, le courant de défaut n'a aucun chemin vers la terre : IΔ = 0, le différentiel ne peut rien voir. L'appareil fonctionne normalement, mais le premier qui touche la carcasse sera traversé par le courant. Fais-la toucher.");
    if(st.contact==="masse")return v("ko","La personne remplace le conducteur PE.",`Le courant de défaut passe par son corps pour rejoindre la terre : ${fmtI(c.Ib)}${st.pe?" (le PE en dérive la plus grande partie)":""}. Avec ${ddrTxt}, rien ne coupe. C'est le contact indirect : la personne touche une masse mise accidentellement sous tension.`);
    const k=st.ra*st.ddr/1000;
    if(!st.ddr)return v(c.Uc>50?"ko":"","Le défaut reste en place sans rien couper.",`Le courant de défaut (${fmtI(c.Id)}) circule en permanence par le PE et la terre. Il est trop faible pour faire déclencher un disjoncteur ordinaire de 16 A, qui ne protège que contre les surintensités. La masse reste à ${fmtV(c.Uc)}${c.Uc>50?", au-dessus de la tension limite de 50 V : qui la touche est électrisé":""}. En schéma TT, le différentiel est indispensable.`);
    return v("ko",`La masse reste à ${fmtV(c.Uc)} sans déclenchement.`,`IΔ = ${fmtI(c.Id)} reste sous IΔn = ${st.ddr} mA. La prise de terre est trop résistante pour ce différentiel : Ra × IΔn = ${virg(+k.toFixed(1))} V ${k>50?"dépasse 50 V":"≤ 50 V"}. Règle du schéma TT : Ra × IΔn ≤ 50 V, pour qu'aucun défaut ne puisse laisser la masse à plus de 50 V sans déclencher. Améliore la prise de terre ou prends un DDR plus sensible.`);
  }
  function changer(){const av=sousTension();if(av)verifier(calcul());peindre();}
  lierSegments(main,st,()=>{if(!st.ddr){st.declenche=false;}changer();});
  function test(){
    if(!st.ddr)return;
    if(!sousTension()){main.querySelector("#analyse").innerHTML=`<div class="verdict"><b>Q1 est déjà ouvert.</b><span>Réarme-le d'abord : le bouton test ne fonctionne que sous tension.</span></div>`;return;}
    st.declenche=true;st.dernier={Id:st.ddr*1.5,Ib:0,Uc:0,ch:[],t:"",test:true};st.faites.add("test");peindre();
  }
  main.querySelector("#test").addEventListener("click",test);
  g.bTest.addEventListener("click",test);g.bTest.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();test();}});
  main.querySelector("#rearmer").addEventListener("click",()=>{st.declenche=false;st.dernier=null;changer();});
  changer();
  return ()=>{};
}

/* ======================= effets du courant ======================= */
function effets(main){
  const st={u:230,peau:"seche"};
  main.innerHTML=tete("Protéger les personnes","Les effets du courant","Ce qui blesse, c'est le courant qui traverse le corps. Il dépend de la tension touchée et de la résistance du corps, qui s'effondre quand la peau est mouillée. Choisis une tension et un état de peau.")+`</div>
    <div class="pp-effets">
      <section class="bloc"><h2>Le calcul</h2>
        ${segment("u","Tension touchée",[[12,"12 V"],[24,"24 V"],[48,"48 V"],[230,"230 V"],[400,"400 V"]],st.u)}
        ${segment("peau","Peau",[["seche","sèche"],["humide","humide"],["mouillee","mouillée"]],st.peau)}
        <p class="pp-formule" id="formule"></p><div id="echelle"></div><div id="tbt"></div></section>
      <section class="bloc"><h2>Ce qui aggrave</h2><ul class="explications">
        <li><b>L'intensité</b> : I = U / R. La tension seule ne dit pas tout, mais plus elle est haute, plus le courant l'est.</li>
        <li><b>La durée</b> : quelques dixièmes de seconde suffisent à déclencher une fibrillation. C'est pour cela qu'un DDR 30 mA coupe en moins de 300 ms.</li>
        <li><b>Le trajet</b> : main-main ou main-pieds, le courant traverse le thorax et le cœur.</li>
        <li><b>L'état de la peau</b> : sèche, de l'ordre de 5 000 à 100 000 Ω ; mouillée, de 500 à 1 000 Ω.</li>
        <li><b>Les conséquences retardées</b> : brûlures internes plus graves qu'elles n'en ont l'air, troubles du rythme cardiaque plusieurs heures après. Toute personne électrisée doit voir un médecin.</li></ul></section>
      <section class="bloc"><h2>À retenir</h2><ul class="explications">
        <li><b>Électrisation</b> : le courant traverse le corps. <b>Électrocution</b> : il entraîne la mort.</li>
        <li><b>Tension limite conventionnelle UL</b> : 50 V en alternatif (25 V en local mouillé), 120 V en continu. En dessous, le contact prolongé est considéré sans danger pour une personne en bonne santé.</li>
        <li><b>Contact direct</b> : on touche une partie active (fil, borne). <b>Contact indirect</b> : on touche une masse mise sous tension par un défaut.</li>
        <li><b>Arc électrique</b> : un court-circuit peut projeter du métal en fusion et brûler à distance, sans contact. Visière, gants et vêtements adaptés protègent.</li>
        <li>Le <a href="#/consignation/ddr">simulateur du différentiel</a> montre ces courants dans une installation.</li></ul></section>
    </div>`;
  function peindre(){
    const R=PEAU[st.peau].r,I=st.u/R*1000;
    main.querySelector("#formule").innerHTML=`I = U / R = ${st.u} V / ${R.toLocaleString("fr-FR")} Ω = <b>${fmtI(I)}</b>`;
    main.querySelector("#echelle").innerHTML=echelle(I);
    const UL=st.peau==="mouillee"?25:50;
    main.querySelector("#tbt").innerHTML=st.u<=UL?`<p class="verdict ok"><b>${st.u} V ≤ UL = ${UL} V</b><span>Tension de sécurité pour ce local : c'est le principe de la très basse tension de sécurité (TBTS) des circuits de commande et des outils portatifs en milieu humide.</span></p>`
      :`<p class="verdict ko"><b>${st.u} V &gt; UL = ${UL} V</b><span>Contact dangereux : seule la coupure rapide (différentiel 30 mA) ou la mise hors tension protège.</span></p>`;
  }
  lierSegments(main,st,peindre);peindre();
  return ()=>{};
}

/* ======================= accident électrique ======================= */
const ACTIONS=[
  ["couper","Couper le courant : arrêt d'urgence de la machine, puis ouvrir le sectionneur Q0"],
  ["condamner","Cadenasser Q0, signaler et faire éloigner les collègues"],
  ["tirer","Saisir la victime par le bras pour la décoller de la machine"],
  ["isolant","L'écarter avec un manche en bois sec"],
  ["examiner","L'examiner : lui parler, lui prendre la main, regarder si elle respire"],
  ["alerter","Envoyer un collègue appeler le 15 (ou 18, 112) et le numéro interne, et chercher le défibrillateur"],
  ["rcp","Faire des compressions thoraciques"],
  ["dae","Mettre en œuvre le défibrillateur (DAE) et suivre ses consignes"],
  ["pls","La mettre en position latérale de sécurité"],
  ["arroser","Arroser la brûlure à l'eau courante tempérée"],
  ["surveiller","La couvrir, lui parler et la surveiller jusqu'à l'arrivée des secours"],
  ["boire","Lui donner un verre d'eau"],
  ["poste","La laisser reprendre son poste puisqu'elle dit que ça va"],
  ["remettre","Réenclencher Q0 pour vérifier la machine"]];

function accident(main){
  let st;
  main.innerHTML=tete("Protéger les personnes","Accident électrique : que faire ?","Un collègue est resté collé à une machine sous tension. Choisis les actions dans l'ordre où tu les fais. Les gestes suivent l'ordre du sauveteur secouriste du travail : <b>Protéger, Examiner, Faire alerter, Secourir</b>.")+`
    <div class="etat" id="etat" role="status" aria-live="polite"></div></div>
    ${segment("cas","Situation",[["A","situation 1"],["B","situation 2"]],"A")}
    <div class="sim" style="margin-top:12px">
      <div class="folios-zone">
        <figure class="feuille" style="margin:0"><h3>À l'atelier</h3><div class="defile" id="zone"></div></figure>
        <section class="bloc"><h2>Ce qui se passe</h2><ul class="explications" id="journal" aria-live="polite"></ul><div id="bilan"></div></section>
      </div>
      <div class="panneau">
        <section class="bloc"><h2>Les quatre actions</h2><ol class="etapes" id="peas"></ol></section>
        <section class="bloc"><h2>Que fais-tu ?</h2><div class="actions-col" id="actions"></div></section>
        <div class="actions"><button type="button" class="btn" id="recommencer">Recommencer</button></div>
      </div>
    </div>
    <p class="astuce" style="margin-top:16px">D'après le référentiel du sauveteur secouriste du travail (INRS ED 7000). En haute tension (lignes, postes HTA), on ne s'approche jamais : on fait couper par l'exploitant et on balise à distance. Cette activité ne remplace pas la formation SST.</p>`;
  const cas={cas:"A"};
  /* ---------- dessin ---------- */
  const svg=el("svg",{viewBox:"0 0 640 300",class:"pp-svg",role:"img","aria-label":"Atelier : coffret Q0, machine, victime"});
  main.querySelector("#zone").appendChild(svg);
  const g={};
  el("line",{x1:10,y1:270,x2:630,y2:270,class:"pp-sol"},svg);
  // coffret Q0
  el("rect",{x:40,y:70,width:80,height:110,rx:6,class:"pp-boite plein"},svg);
  txt(svg,80,62,"Q0","pp-t gras","middle");
  el("circle",{cx:80,cy:120,r:20,class:"pp-symb pp-fond"},svg);
  g.levier=el("line",{x1:80,y1:120,x2:80,y2:96,class:"pp-levier"},svg);
  g.posQ0=txt(svg,80,160,"I","pp-t gras","middle");
  g.cadenas=el("g",{},svg);
  el("rect",{x:98,y:150,width:16,height:13,rx:2,class:"pp-cad"},g.cadenas);el("path",{d:"M101,150 v-5 a5,5 0 0 1 10,0 v5",class:"pp-symb"},g.cadenas);
  g.panneau=el("g",{},svg);el("rect",{x:44,y:190,width:72,height:30,rx:3,class:"pp-panneau"},g.panneau);
  txt(g.panneau,80,204,"Ne pas","pp-t petit","middle");txt(g.panneau,80,215,"manœuvrer","pp-t petit","middle");
  // câble Q0 → machine
  g.cable=el("path",{d:"M120,90 L330,90",class:"pp-w"},svg);
  // machine
  el("rect",{x:330,y:60,width:200,height:190,rx:6,class:"pp-carc"},svg);
  txt(svg,430,84,"machine","pp-t gras","middle");
  el("circle",{cx:505,cy:110,r:11,class:"pp-au"},svg);txt(svg,505,136,"AU","pp-t petit","middle");
  // victime
  g.debout=el("g",{class:"pp-pers"},svg);
  el("circle",{cx:280,cy:150,r:11},g.debout);el("path",{d:"M280,161 L282,225 L270,270 M282,225 L294,270 M281,178 L330,166 M281,178 L262,210"},g.debout);
  g.eclair=txt(svg,320,160,"⚡","pp-eclair");
  g.couche=el("g",{class:"pp-pers"},svg);
  el("circle",{cx:200,cy:258,r:11},g.couche);el("path",{d:"M211,260 L280,262 L326,266 M280,262 L322,256 M236,261 L250,246 M236,261 L262,268"},g.couche);
  g.assis=el("g",{class:"pp-pers"},svg);
  el("circle",{cx:262,cy:196,r:11},g.assis);el("path",{d:"M262,207 L262,252 L300,256 L306,270 M262,222 L290,236 M262,222 L246,248"},g.assis);
  g.brule=el("circle",{cx:292,cy:237,r:5,class:"pp-brule"},svg);
  // icônes
  g.balise=el("path",{d:"M150,270 L150,200 M150,206 L240,214 L320,206 M320,270 L320,200",class:"pp-balise"},svg);
  g.tel=el("g",{},svg);el("rect",{x:560,y:150,width:52,height:34,rx:6,class:"pp-tel"},g.tel);txt(g.tel,586,172,"15 · 112","pp-t gras","middle");
  g.dae=el("g",{},svg);el("rect",{x:170,y:216,width:40,height:28,rx:4,class:"pp-dae"},g.dae);txt(g.dae,190,234,"DAE","pp-t gras pp-blanc","middle");
  g.mains=el("g",{},svg);el("path",{d:"M246,236 L246,250 M240,236 L252,236",class:"pp-mains"},g.mains);txt(g.mains,246,226,"RCP","pp-t petit pp-acc","middle");
  g.eau=txt(svg,300,226,"💧","pp-t");

  const PEAS=[["P","Protéger","courant coupé et remise sous tension impossible"],["E","Examiner","répond-elle ? respire-t-elle ?"],["A","Faire alerter","message aux secours"],["S","Secourir","le geste adapté à son état"]];
  function init(ordre){
    st={ordre,cas:cas.cas,coupe:false,condamne:false,examine:false,alerte:false,rcp:false,dae:false,arrose:false,surveille:false,fin:false,mort:false,fautes:[],journal:[]};
    main.querySelector("#bilan").innerHTML="";peindre();
    journal("info",st.cas==="A"?"Un bruit sec : ton collègue a la main crispée sur la carcasse de la machine, il tremble et ne lâche pas. Le courant le traverse encore.":"Ton collègue pousse un cri : sa main est restée collée à la machine. Le courant le traverse encore.");
  }
  function journal(cls,t){st.journal.unshift([cls,t]);main.querySelector("#journal").innerHTML=st.journal.slice(0,8).map(([c,x])=>`<li class="${c}">${x}</li>`).join("");}
  const faute=(t,grave)=>{st.fautes.push(t);journal("ko",(grave?"<b>Danger.</b> ":"<b>Pas maintenant.</b> ")+t);};
  const ok=t=>journal("ok",t);
  const inutile=t=>journal("info",t);
  function fatal(t){st.fautes.push(t);st.fin=true;st.mort=true;journal("ko","<b>Sur-accident.</b> "+t);peindre();bilan();}
  const protege=()=>st.coupe&&st.condamne;
  function agir(id){
    if(st.fin)return;
    const A=st.cas==="A",touche=["tirer","examiner","rcp","dae","pls","arroser","surveiller","boire"];
    if(!st.coupe&&touche.includes(id)){
      if(id==="examiner")return faute("Tu allais la toucher alors qu'elle est encore sous tension. Coupe d'abord le courant, sans la toucher.",true),peindre();
      return fatal("Tu as touché une personne encore sous tension : le courant te traverse à ton tour. On ne touche jamais une victime avant d'avoir coupé le courant. C'est la première cause de victimes multiples.");
    }
    switch(id){
      case "couper":
        if(st.coupe){inutile("Le courant est déjà coupé.");break;}
        st.coupe=true;ok("Tu coupes sans toucher la victime : arrêt d'urgence, puis sectionneur Q0 ouvert. "+(A?"Ton collègue s'effondre au sol et ne bouge plus.":"Ton collègue se dégage et s'assoit par terre, la main brûlée."));break;
      case "condamner":
        if(!st.coupe){faute("Coupe d'abord le courant : chaque seconde de passage du courant aggrave l'état de la victime.");break;}
        if(st.condamne){inutile("C'est déjà fait.");break;}
        st.condamne=true;ok("Q0 est cadenassé et signalé, les curieux sont écartés : personne ne pourra remettre sous tension par erreur. La protection est durable.");break;
      case "isolant":
        if(st.coupe){inutile("Le courant est coupé : inutile de l'écarter. On ne déplace une victime que si un danger ne peut pas être supprimé.");break;}
        faute("Ici, on peut couper le courant : c'est toujours la priorité. Écarter la victime avec un objet isolant sec ne se fait qu'en basse tension, quand la coupure est impossible, et jamais en haute tension.");break;
      case "tirer":
        inutile("Le courant est coupé : inutile de la tirer. On ne déplace une victime que si un danger ne peut pas être supprimé.");break;
      case "remettre":
        if(!st.coupe){faute("La machine est encore sous tension : il faut la couper !");break;}
        faute("La machine reste consignée : elle a électrisé quelqu'un, elle doit être vérifiée avant toute remise en service.",true);break;
      case "examiner":
        if(!st.condamne){faute("Avant de t'approcher, empêche toute remise sous tension : un collègue qui ne sait rien pourrait réenclencher Q0.");break;}
        if(st.examine){inutile("Tu l'as déjà examinée.");break;}
        st.examine=true;
        ok(A?"Elle ne répond pas et ne réagit pas quand tu lui prends la main. Tu bascules sa tête en arrière : pendant 10 secondes, ni le ventre ni la poitrine ne se soulèvent, aucun souffle. <b>Elle ne respire pas : arrêt cardiaque</b>, probablement une fibrillation causée par le courant."
          :"Elle répond et respire normalement. Brûlure à la paume droite (entrée du courant) et marque sous le pied (sortie). <b>Elle dit que ça va.</b>");break;
      case "alerter":
        if(!protege()){faute("Protège d'abord : coupe et empêche la remise sous tension, sinon les secours eux-mêmes seraient en danger.");break;}
        if(!st.examine){faute("Examine-la d'abord quelques secondes : les secours ont besoin de savoir si elle répond et si elle respire.");break;}
        if(st.alerte){inutile("L'alerte est déjà donnée.");break;}
        st.alerte=true;
        ok(`Un collègue appelle le 15 (SAMU), ou le 18 ou le 112, et le numéro interne. Il donne : le lieu exact et l'accès, « électrisation sur une machine, courant coupé », ${A?"« victime inconsciente qui ne respire pas, massage en cours »":"« victime consciente, brûlure à la main et au pied »"}, et ne raccroche que quand on le lui dit. Puis il va accueillir les secours${A?" et rapporte le défibrillateur":""}.`);break;
      case "rcp":
        if(!protege()||!st.examine){faute("Protège et examine d'abord.");break;}
        if(!A){faute("Elle respire : on ne masse jamais une personne qui respire.",true);break;}
        if(!st.alerte){faute("Fais d'abord alerter et chercher le défibrillateur : le massage seul ne relance pas le cœur, il fait gagner du temps.");break;}
        if(st.rcp){inutile("Tu continues les compressions sans t'arrêter.");break;}
        st.rcp=true;ok("Compressions au centre de la poitrine, bras tendus, en enfonçant de 5 à 6 cm, environ 100 à 120 par minute. Tu ne t'arrêtes pas : le sang continue d'arriver au cerveau.");break;
      case "dae":
        if(!protege()||!st.examine){faute("Protège et examine d'abord.");break;}
        if(!A){faute("Le défibrillateur s'utilise sur une victime qui ne respire pas. Elle est consciente.");break;}
        if(!st.alerte){faute("Personne n'est allé chercher le défibrillateur : fais alerter.");break;}
        if(!st.rcp){faute("Le défibrillateur n'est pas encore là : commence les compressions en l'attendant.");break;}
        st.dae=true;st.fin=true;
        ok("Le collègue revient avec le DAE. Tu poses les électrodes sur la poitrine nue comme sur le dessin, l'appareil analyse et demande un choc : personne ne touche la victime, tu appuies. Tu reprends aussitôt les compressions jusqu'à ce que les secours prennent le relais. Défibrillée en quelques minutes, une victime de fibrillation a de vraies chances de survie.");break;
      case "pls":
        if(!st.examine){faute("Examine-la d'abord.");break;}
        if(A){faute("La position latérale de sécurité est pour une victime inconsciente <b>qui respire</b>. Elle ne respire pas : il faut masser.",true);break;}
        inutile("Elle est consciente : installe-la plutôt dans la position où elle se sent le mieux.");break;
      case "arroser":
        if(!protege()||!st.examine){faute("Protège et examine d'abord.");break;}
        if(A){faute("Pas maintenant : elle ne respire pas. La priorité est le massage et le défibrillateur.",true);break;}
        if(st.arrose){inutile("Tu continues d'arroser.");break;}
        st.arrose=true;ok("Eau courante tempérée sur la brûlure, le plus vite possible et longtemps (règle des 3 × 15 : eau vers 15 °C, à 15 cm, pendant 15 minutes). Ni glace, ni pommade, et on ne décolle rien de la peau.");break;
      case "surveiller":
        if(A){faute(st.examine?"Elle ne respire pas : la surveiller ne suffit pas, il faut masser.":"Examine-la d'abord.",true);break;}
        if(!st.examine||!st.alerte||!st.arrose){faute(!st.examine?"Examine-la d'abord.":!st.alerte?"Il faut d'abord faire alerter : une électrisation demande toujours un avis médical.":"Refroidis d'abord la brûlure.");break;}
        st.surveille=true;st.fin=true;
        ok("Tu la couvres, tu lui parles, tu surveilles sa respiration et tu signales tout changement. Les secours l'emmènent pour un bilan cardiaque : même consciente, une personne électrisée peut faire un trouble du rythme plusieurs heures après.");break;
      case "boire":
        faute("On ne donne ni à boire ni à manger à une victime : elle pourrait avoir besoin d'une intervention, ou s'étouffer.");break;
      case "poste":
        if(A){faute("Elle est inconsciente !",true);break;}
        if(!st.examine){faute("Examine-la d'abord.");break;}
        faute("Même si elle se sent bien, une personne électrisée doit être vue par un médecin : des troubles du rythme cardiaque peuvent apparaître plus tard, et les brûlures internes sont souvent plus graves qu'elles n'en ont l'air.",true);break;
    }
    peindre();if(st.fin&&!st.mort)bilan();
  }
  function bilan(){
    const n=st.fautes.length;
    main.querySelector("#bilan").innerHTML=st.mort?`<div class="verdict ko"><b>Deux victimes au lieu d'une.</b><span>Rappel : Protéger d'abord, en coupant le courant sans toucher la victime. Clique sur Recommencer.</span></div>`
      :`<div class="verdict ${n?"":"ok"}"><b>${n?`Victime prise en charge, avec ${n} faute${n>1?"s":""} en chemin.`:"Sans faute : la victime est prise en charge."}</b>
        ${n?`<ul style="margin:4px 0 0 18px">${st.fautes.map(f=>`<li>${f}</li>`).join("")}</ul>`:""}
        <span>${st.cas==="A"?"Essaie aussi la situation 2.":"Essaie aussi la situation 1."}</span></div>`;
  }
  function peindre(){
    const A=st.cas==="A",vit=!st.coupe;
    const etat=main.querySelector("#etat");
    etat.dataset.s=st.mort?"defaut":st.fin?"marche":vit?"defaut":"arret";
    etat.textContent=st.mort?"Sur-accident":st.fin?"Victime prise en charge":vit?"Victime sous tension":"Courant coupé";
    g.levier.setAttribute("x2",vit?80:100);g.levier.setAttribute("y2",vit?96:120);g.posQ0.textContent=vit?"I":"O";
    g.cable.setAttribute("class","pp-w"+(vit?" vif":""));
    g.cadenas.style.display=g.panneau.style.display=st.condamne?"":"none";
    g.balise.style.display=st.condamne?"":"none";
    g.debout.style.display=g.eclair.style.display=vit?"":"none";
    g.couche.style.display=!vit&&A?"":"none";g.assis.style.display=!vit&&!A?"":"none";
    g.brule.style.display=!vit&&!A?"":"none";
    g.tel.style.display=st.alerte?"":"none";g.dae.style.display=st.dae?"":"none";
    g.mains.style.display=st.rcp?"":"none";g.eau.style.display=st.arrose?"":"none";
    const fait=[protege(),st.examine,st.alerte,A?st.dae:st.surveille];
    main.querySelector("#peas").innerHTML=PEAS.map(([l,t,d],i)=>`<li class="${fait[i]?"ok":""}"><span><b>${t}</b> <small>— ${d}</small></span></li>`).join("");
    main.querySelector("#actions").innerHTML=st.ordre.map(([id,t])=>`<button type="button" class="btn pp-action" data-a="${id}" ${st.fin?"disabled":""}>${esc(t)}</button>`).join("");
  }
  main.querySelector("#actions").addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(b)agir(b.dataset.a);});
  const melange=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const demarrer=()=>init(melange(ACTIONS));
  lierSegments(main,cas,demarrer);
  main.querySelector("#recommencer").addEventListener("click",demarrer);
  demarrer();
  return ()=>{};
}

window.ElecProtection={ddr,effets,accident,echelle};
})();
