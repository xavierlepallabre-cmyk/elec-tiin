/* Élec TIIN — Machines (niveau BTS MS) : le moteur asynchrone triphasé.
   Plaque signalétique et calculs ; démarrages comparés (direct, étoile-triangle, démarreur progressif, variateur).
   Courbes de couple et de courant types, interpolées à partir des valeurs catalogue (Id/In, Cd/Cn, Cmax/Cn) :
   ordres de grandeur pédagogiques, pas un modèle de machine. Aucun résultat n'est enregistré. */
(function(){
"use strict";
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const NS="http://www.w3.org/2000/svg";
function el(tag,a,p){const e=document.createElementNS(NS,tag);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
const fr=(x,d=0)=>Number(x).toLocaleString("fr-FR",{minimumFractionDigits:d,maximumFractionDigits:d});
const R3=Math.sqrt(3);

/* ---------- moteurs (valeurs cohérentes entre elles, inspirées de catalogues) ---------- */
const MOTEURS=[
  {id:"m11",nom:"11 kW, 4 pôles",pu:11000,tensions:[400,690],courants:[20.8,12.0],cos:0.85,n:1460,kId:7.2,kCd:2.4,kCm:2.9,J:0.07,ip:"IP55",cl:"F"},
  {id:"m4",nom:"4 kW, 4 pôles",pu:4000,tensions:[230,400],courants:[14.2,8.2],cos:0.82,n:1440,kId:7.0,kCd:2.3,kCm:2.8,J:0.011,ip:"IP55",cl:"F"},
  {id:"m1",nom:"1,5 kW, 2 pôles",pu:1500,tensions:[230,400],courants:[5.4,3.1],cos:0.84,n:2850,kId:6.5,kCd:2.6,kCm:3.0,J:0.0015,ip:"IP55",cl:"F"}];
const moteur=id=>MOTEURS.find(m=>m.id===id)||MOTEURS[0];
const nsDe=m=>{const p=Math.floor(3000/m.n);return {p,ns:3000/p};};
function couplage(m,U){return U===m.tensions[0]?"triangle":U===m.tensions[1]?"étoile":"impossible";}
function grandeurs(m,U){
  const cp=couplage(m,U);if(cp==="impossible")return {cp};
  const In=m.courants[cp==="triangle"?0:1],{p,ns}=nsDe(m),g=(ns-m.n)/ns;
  const Pa=R3*U*In*m.cos,eta=m.pu/Pa,Cu=m.pu/(2*Math.PI*m.n/60);
  return {cp,In,p,ns,g,Pa,eta,Cu,Id:m.kId*In,etoile:U===m.tensions[0]};
}

/* ---------- interpolation monotone (Fritsch-Carlson) ---------- */
function pchip(xs,ys){
  const n=xs.length,h=[],d=[],m=new Array(n);
  for(let i=0;i<n-1;i++){h[i]=xs[i+1]-xs[i];d[i]=(ys[i+1]-ys[i])/h[i];}
  m[0]=d[0];m[n-1]=d[n-2];
  for(let i=1;i<n-1;i++){
    if(d[i-1]*d[i]<=0)m[i]=0;
    else{const w1=2*h[i]+h[i-1],w2=h[i]+2*h[i-1];m[i]=(w1+w2)/(w1/d[i-1]+w2/d[i]);}
  }
  return x=>{
    if(x<=xs[0])return ys[0];if(x>=xs[n-1])return ys[n-1];
    let i=0;while(x>xs[i+1])i++;
    const t=(x-xs[i])/h[i],t2=t*t,t3=t2*t;
    return (2*t3-3*t2+1)*ys[i]+(t3-2*t2+t)*h[i]*m[i]+(-2*t3+3*t2)*ys[i+1]+(t3-t2)*h[i]*m[i+1];
  };
}
function caracteristiques(m,In){
  const {ns}=nsDe(m),Cn=m.pu/(2*Math.PI*m.n/60),xn=m.n/ns,xk=1-(1-xn)*4.5;
  const C=pchip([0,0.25,xk,xn,1],[m.kCd*Cn,0.88*m.kCd*Cn,m.kCm*Cn,Cn,0]);
  const I=pchip([0,0.5,xk,xn,1],[m.kId*In,0.95*m.kId*In,0.72*m.kId*In,In,0.38*In]);
  return {ns,Cn,C:n=>C(Math.min(n,ns)/ns),I:n=>I(Math.min(n,ns)/ns)};
}

/* ---------- simulation d'un démarrage ---------- */
const MODES={direct:"Direct",etoile:"Étoile-triangle",progressif:"Démarreur progressif",variateur:"Variateur de vitesse"};
function simuler(m,o){
  const U=400,G=grandeurs(m,U),In=G.In,K=caracteristiques(m,In),ns=K.ns,Cn=K.Cn,nn=m.n;
  const J=m.J*(1+o.inertie),w=n=>n*2*Math.PI/60;
  const Cr=n=>o.charge==="constant"?o.k*Cn:o.k*Cn*Math.pow(n/nn,2);
  const dt=0.001,T=20;let n=0,t=0,pic=0,tFin=null,ech=[],cale=false,nCom=null;
  for(let i=0;t<=T;i++,t+=dt){
    let C,I;
    if(o.mode==="direct"){C=K.C(n);I=K.I(n);}
    else if(o.mode==="etoile"){
      if(t<o.tempo){C=K.C(n)/3;I=K.I(n)/3;}else{if(nCom===null)nCom=n;C=K.C(n);I=K.I(n);}
    }else if(o.mode==="progressif"){
      const k=Math.min(1,o.ilim*In/K.I(n));C=k*k*K.C(n);I=k*K.I(n);
    }else{
      const nref=Math.min(nn,nn*t/o.rampe),dref=t<o.rampe?w(nn)/o.rampe:0;
      C=Math.max(0,Math.min(1.5*Cn,Cr(n)+J*dref+J*25*(w(nref)-w(n))));
      I=In*Math.max(0.38,C/Cn);
    }
    const acc=(C-Cr(n))/J;
    let om=w(n)+acc*dt;if(om<0)om=0;n=om*60/(2*Math.PI);
    if(o.mode==="variateur")n=Math.min(n,nn);
    if(I>pic)pic=I;
    if(tFin===null&&n>=0.95*nn)tFin=t;
    if(i%20===0)ech.push([t,n,I,C]);
    if(tFin!==null&&t>tFin+1.2&&(o.mode!=="etoile"||t>o.tempo+1.2)&&(o.mode!=="variateur"||t>o.rampe+0.8))break;
  }
  const nMax=Math.max(...ech.map(e=>e[1]));
  if(tFin===null)cale=true;
  return {ech,pic,In,Cn,ns,nn,tFin,cale,nMax,nCom,Cd:o.mode==="etoile"?K.C(0)/3:o.mode==="progressif"?Math.pow(Math.min(1,o.ilim*In/K.I(0)),2)*K.C(0):o.mode==="variateur"?1.5*Cn:K.C(0),K,Cr,mode:o.mode,o};
}
function verdict(r){
  const xIn=r.pic/r.In,o=r.o,L=[];let cls="ok",titre;
  if(r.cale){
    cls="ko";
    if(r.nMax<1)titre="Le moteur ne démarre pas : il reste bloqué.";
    else titre=`Le moteur ne termine pas son démarrage : il plafonne vers ${fr(r.nMax)} tr/min.`;
    L.push(r.mode==="etoile"&&r.nCom!==null?"Même en triangle, le couple ne suffit pas.":"Le couple moteur disponible ne dépasse jamais le couple résistant de la charge à basse vitesse.");
    if(r.mode==="progressif")L.push("Le démarreur progressif réduit la tension, donc le couple (proportionnel au carré de la tension). Il convient aux pompes et ventilateurs, mal aux charges à fort couple constant : augmente la limitation de courant ou choisis un variateur.");
    L.push("Le moteur absorbe un fort courant sans tourner : le relais thermique va déclencher, sinon le bobinage chauffe.");
  }else{
    titre=`Démarrage en ${fr(r.tFin,1)} s, pointe de courant ${fr(r.pic)} A (${fr(xIn,1)} × In).`;
    if(r.tFin>10){cls="ko";L.push("Démarrage trop long : au-delà d'une dizaine de secondes à fort courant, un relais thermique de classe 10 déclenche.");}
    if(r.mode==="direct")L.push(`Le courant de démarrage vaut ${fr(xIn,1)} fois le courant nominal : chute de tension sur le réseau et à-coup mécanique sur la transmission. Le démarrage direct n'est admis que pour les petites puissances ou si le réseau le supporte.`);
    if(r.mode==="etoile"){
      L.push("En étoile, chaque enroulement reçoit 400/√3 = 230 V : courant de ligne et couple sont divisés par 3.");
      if(r.nCom!==null&&r.nCom<1){cls="ko";titre=`Bloqué en étoile, puis démarrage direct à ${fr(r.o.tempo,1)} s : pointe de ${fr(r.pic)} A (${fr(xIn,1)} × In).`;}
      if(r.nCom!==null&&r.nCom<1)L.push("En étoile, le couple de démarrage (Cd/3) est inférieur au couple résistant : le moteur est resté bloqué jusqu'à la commutation. Le passage en triangle s'est fait à l'arrêt, c'est donc un démarrage direct, avec sa pointe de courant. L'étoile-triangle suppose un démarrage à vide ou à faible charge.");
      else if(r.nCom!==null){const fin=r.nCom/r.nn;L.push(`Commutation en triangle à ${fr(r.nCom)} tr/min (${fr(fin*100)} % de la vitesse nominale). ${fin<0.85?"Trop tôt : le moteur n'a pas fini d'accélérer, la pointe de courant au passage en triangle est presque celle d'un démarrage direct.":"Le moteur était proche de sa vitesse : la pointe au passage en triangle reste modérée."}`);}
    }
    if(r.mode==="progressif")L.push(`Le démarreur réduit la tension pour limiter le courant à ${fr(o.ilim,1)} × In. Le couple diminue avec le carré de la tension : à mi-tension, il ne reste qu'un quart du couple.`);
    if(r.mode==="variateur")L.push("Le variateur fait varier la fréquence et la tension ensemble (loi U/f) : le moteur dispose de son couple nominal, et jusqu'à environ 1,5 Cn, dès l'arrêt, avec un courant proche de In. La rampe fixe la durée du démarrage.");
  }
  return {cls,titre,L};
}

/* ---------- graphiques ---------- */
function pas(max,nb){const brut=max/nb,p=Math.pow(10,Math.floor(Math.log10(brut))),r=brut/p;return (r<1.5?1:r<3?2:r<7?5:10)*p;}
function graphe(zone,{xmax,ymax,xlab,ylab,series,hl=[],vl=[],titre}){
  const W=560,H=250,g0={l:52,r:14,t:26,b:40},pw=W-g0.l-g0.r,ph=H-g0.t-g0.b;
  const X=x=>g0.l+x/xmax*pw,Y=y=>g0.t+ph-y/ymax*ph;
  const svg=el("svg",{viewBox:`0 0 ${W} ${H}`,class:"mc-graphe",role:"img","aria-label":titre||ylab});
  const px=pas(xmax,6),py=pas(ymax,5);
  for(let x=0;x<=xmax+1e-9;x+=px){el("line",{x1:X(x),y1:g0.t,x2:X(x),y2:g0.t+ph,class:"mc-grille"},svg);const t=el("text",{x:X(x),y:g0.t+ph+16,class:"mc-t","text-anchor":"middle"},svg);t.textContent=fr(x,px<1?1:0);}
  for(let y=0;y<=ymax+1e-9;y+=py){el("line",{x1:g0.l,y1:Y(y),x2:g0.l+pw,y2:Y(y),class:"mc-grille"},svg);const t=el("text",{x:g0.l-6,y:Y(y)+4,class:"mc-t","text-anchor":"end"},svg);t.textContent=fr(y,py<1?1:0);}
  el("rect",{x:g0.l,y:g0.t,width:pw,height:ph,class:"mc-cadre"},svg);
  const tx=el("text",{x:g0.l+pw,y:H-4,class:"mc-t mc-axe","text-anchor":"end"},svg);tx.textContent=xlab;
  const ty=el("text",{x:g0.l,y:14,class:"mc-t mc-axe"},svg);ty.textContent=ylab;
  hl.forEach(h=>{if(h.y>ymax)return;el("line",{x1:g0.l,y1:Y(h.y),x2:g0.l+pw,y2:Y(h.y),class:"mc-ref"},svg);const t=el("text",{x:g0.l+pw-4,y:Y(h.y)-4,class:"mc-t mc-reft","text-anchor":"end"},svg);t.textContent=h.lab;});
  vl.forEach(v=>{el("line",{x1:X(v.x),y1:g0.t,x2:X(v.x),y2:g0.t+ph,class:"mc-ref"},svg);const t=el("text",{x:X(v.x)+4,y:g0.t+12,class:"mc-t mc-reft"},svg);t.textContent=v.lab;});
  const chemins=series.map(s=>{const p=el("path",{d:"",class:"mc-s "+s.cls},svg);p.dataset.pts=JSON.stringify(s.pts.map(([x,y])=>[+X(x).toFixed(1),+Y(Math.min(y,ymax*1.02)).toFixed(1)]));return p;});
  const leg=el("g",{},svg);let lx=g0.l+8;
  series.forEach(s=>{if(!s.lab)return;el("line",{x1:lx,y1:g0.t+12,x2:lx+18,y2:g0.t+12,class:"mc-s "+s.cls},leg);const t=el("text",{x:lx+22,y:g0.t+16,class:"mc-t"},leg);t.textContent=s.lab;lx+=30+s.lab.length*6.2;});
  const curseur=el("line",{x1:0,y1:g0.t,x2:0,y2:g0.t+ph,class:"mc-curseur",visibility:"hidden"},svg);
  zone.appendChild(svg);
  const tracer=(frac=1)=>chemins.forEach(p=>{const pts=JSON.parse(p.dataset.pts),k=Math.max(1,Math.round(pts.length*frac));p.setAttribute("d","M"+pts.slice(0,k).map(q=>q.join(",")).join("L"));});
  tracer(1);
  return {tracer,curseur:x=>{if(x==null){curseur.setAttribute("visibility","hidden");return;}curseur.setAttribute("x1",X(x));curseur.setAttribute("x2",X(x));curseur.setAttribute("visibility","visible");}};
}

/* ---------- page ---------- */
const segment=(nom,titre,options,val)=>`<div class="pp-choix"><span>${titre}</span><div class="segment" role="group" aria-label="${esc(titre)}" data-nom="${nom}">${options.map(([v,l])=>`<button type="button" data-v="${v}" aria-pressed="${String(v)===String(val)}">${l}</button>`).join("")}</div></div>`;
function lier(racine,st,apres){
  racine.querySelectorAll(".segment[data-nom]").forEach(g=>g.addEventListener("click",e=>{
    const b=e.target.closest("button[data-v]");if(!b)return;
    const nom=g.dataset.nom;st[nom]=typeof st[nom]==="number"?+b.dataset.v:b.dataset.v;
    g.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));apres(nom);
  }));
}
function ouvrir(main,sous){
  const onglet=sous==="demarrages"?"demarrages":"plaque";
  main.innerHTML=`<div class="page-head"><div>
      <p class="tag"><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>Machines · <span class="pill bts-pill" style="margin:0">BTS MS</span></p>
      <h1>Le moteur asynchrone triphasé</h1>
      <p class="lead">Lire la plaque signalétique, calculer les grandeurs nominales, puis comparer les procédés de démarrage en chiffres : couple, courant, durée.</p></div></div>
    <div class="segment mc-onglets" role="tablist" style="margin-bottom:14px">
      <button type="button" role="tab" aria-pressed="${onglet==="plaque"}" onclick="location.hash='#/machines/plaque'">Plaque signalétique</button>
      <button type="button" role="tab" aria-pressed="${onglet==="demarrages"}" onclick="location.hash='#/machines/demarrages'">Démarrages comparés</button></div>
    <div id="mcZone"></div>
    <p class="astuce" style="margin-top:16px">Moteurs fictifs aux valeurs cohérentes, inspirées de catalogues constructeurs. Les courbes de couple et de courant sont des courbes types interpolées à partir de Id/In, Cd/Cn et Cmax/Cn : elles donnent des ordres de grandeur, pas les performances d'un moteur réel.</p>`;
  const zone=main.querySelector("#mcZone");
  return onglet==="plaque"?plaque(zone):demarrages(zone);
}

/* ---------- plaque signalétique et calculs ---------- */
function plaqueHTML(m){
  return `<div class="mc-plaque" role="img" aria-label="Plaque signalétique du moteur ${esc(m.nom)}">
    <div class="mc-pl-tete"><b>MOT. 3~</b><span>N° 26-${m.id.toUpperCase()}-0412</span></div>
    <div class="mc-pl-grille">
      <span>P</span><b>${fr(m.pu/1000,m.pu<10000?1:0)} kW</b>
      <span>U Δ / Y</span><b>${m.tensions[0]} / ${m.tensions[1]} V</b>
      <span>I Δ / Y</span><b>${fr(m.courants[0],1)} / ${fr(m.courants[1],1)} A</b>
      <span>cos φ</span><b>${fr(m.cos,2)}</b>
      <span>n</span><b>${m.n} tr/min</b>
      <span>f</span><b>50 Hz</b>
      <span>${m.ip}</span><b>Cl. ${m.cl} · S1</b>
    </div>
    <div class="mc-pl-pied">Catalogue : Id/In = ${fr(m.kId,1)} · Cd/Cn = ${fr(m.kCd,1)} · Cmax/Cn = ${fr(m.kCm,1)}</div></div>`;
}
function plaque(zone){
  const st={moteur:"m11",reseau:400};
  zone.innerHTML=`<div class="mc-plaque-page">
    <div class="mc-col">
      <section class="bloc">${segment("moteur","Moteur",MOTEURS.map(m=>[m.id,m.nom]),st.moteur)}${segment("reseau","Réseau triphasé (tension entre phases)",[[230,"230 V"],[400,"400 V"]],st.reseau)}</section>
      <div id="plaque"></div>
      <section class="bloc"><h2>Rappels</h2><ul class="explications">
        <li>La plus petite tension de la plaque est celle que supporte <b>un enroulement</b>. Si elle est égale à la tension entre phases du réseau : couplage <b>triangle</b>. Si c'est la plus grande qui l'est : couplage <b>étoile</b>.</li>
        <li>Le démarrage étoile-triangle n'est possible que si le moteur fonctionne <b>en triangle</b> sur le réseau.</li>
        <li>n<sub>s</sub> = 60 f / p (p : nombre de paires de pôles) · g = (n<sub>s</sub> − n) / n<sub>s</sub></li>
        <li>P<sub>a</sub> = √3 U I cos φ · η = P<sub>u</sub> / P<sub>a</sub> · C<sub>u</sub> = P<sub>u</sub> / Ω avec Ω = 2π n / 60</li></ul></section>
    </div>
    <section class="bloc mc-col"><h2>À toi de calculer</h2><div id="questions" class="mc-questions"></div>
      <div class="actions"><button type="button" class="btn" id="corrige">Afficher toute la correction</button></div></section></div>`;
  function questions(){
    const m=moteur(st.moteur),G=grandeurs(m,st.reseau),U=st.reseau;
    zone.querySelector("#plaque").innerHTML=plaqueHTML(m);
    const Q=[
      {id:"cp",t:`Couplage du moteur sur le réseau ${U} V`,choix:["étoile","triangle","impossible"],r:G.cp,
       c:G.cp==="impossible"?`Aucune des tensions de la plaque (${m.tensions.join(" / ")} V) n'est égale à ${U} V : ce moteur ne peut pas fonctionner sur ce réseau.`:`${U} V est la ${G.cp==="triangle"?"petite":"grande"} tension de la plaque : couplage ${G.cp}. Chaque enroulement reçoit ${m.tensions[0]} V.`}];
    if(G.cp!=="impossible")Q.push(
      {id:"yd",t:"Démarrage étoile-triangle possible ?",choix:["oui","non"],r:G.etoile?"oui":"non",
       c:G.etoile?"Oui : le moteur fonctionne en triangle, on peut le démarrer en étoile (chaque enroulement sous 230 V au lieu de 400 V).":"Non : le moteur fonctionne déjà en étoile. Le coupler en triangle au démarrage mettrait ses enroulements sous une tension trop élevée."},
      {id:"ns",t:"Vitesse de synchronisme n<sub>s</sub>",u:"tr/min",r:G.ns,c:`n = ${m.n} tr/min, juste sous ${fr(G.ns)} tr/min : p = ${G.p} paire${G.p>1?"s":""} de pôles, n<sub>s</sub> = 60 × 50 / ${G.p} = ${fr(G.ns)} tr/min.`},
      {id:"g",t:"Glissement g",u:"%",r:G.g*100,tol:0.05,c:`g = (${fr(G.ns)} − ${m.n}) / ${fr(G.ns)} = ${fr(G.g*100,2)} %.`},
      {id:"in",t:`Courant de ligne nominal sur ${U} V`,u:"A",r:G.In,c:`Couplage ${G.cp} : on lit le courant ${G.cp==="triangle"?"Δ":"Y"} de la plaque, ${fr(G.In,1)} A.`},
      {id:"pa",t:"Puissance absorbée P<sub>a</sub>",u:"W",r:G.Pa,c:`P<sub>a</sub> = √3 × ${U} × ${fr(G.In,1)} × ${fr(m.cos,2)} = ${fr(G.Pa)} W.`},
      {id:"eta",t:"Rendement η",u:"%",r:G.eta*100,c:`η = ${fr(m.pu)} / ${fr(G.Pa)} = ${fr(G.eta*100,1)} %. La puissance de la plaque est la puissance utile, sur l'arbre.`},
      {id:"cu",t:"Couple utile nominal C<sub>u</sub>",u:"N·m",r:G.Cu,c:`Ω = 2π × ${m.n} / 60 = ${fr(2*Math.PI*m.n/60,1)} rad/s ; C<sub>u</sub> = ${fr(m.pu)} / ${fr(2*Math.PI*m.n/60,1)} = ${fr(G.Cu,1)} N·m.`},
      {id:"id",t:"Courant de démarrage en direct",u:"A",r:G.Id,c:`I<sub>d</sub> = ${fr(m.kId,1)} × ${fr(G.In,1)} = ${fr(G.Id)} A.${G.etoile?` En étoile-triangle, il serait divisé par 3 : environ ${fr(G.Id/3)} A.`:""}`});
    const box=zone.querySelector("#questions");
    box.innerHTML=Q.map((q,i)=>`<div class="mc-q" data-q="${q.id}"><label for="q_${q.id}"><span class="mc-num">${i+1}</span><span>${q.t}</span></label>
      <div class="mc-rep">${q.choix?`<div class="segment" role="group" data-choix="${q.id}">${q.choix.map(c=>`<button type="button" data-v="${c}" aria-pressed="false">${c}</button>`).join("")}</div>`
        :`<input id="q_${q.id}" type="text" inputmode="decimal" autocomplete="off"><span class="mc-u">${q.u}</span><button type="button" class="btn" data-verif="${q.id}">Vérifier</button>`}</div>
      <p class="mc-fb" aria-live="polite"></p></div>`).join("");
    const fb=(q,ok,montrer)=>{const p=box.querySelector(`[data-q="${q.id}"] .mc-fb`);p.className="mc-fb "+(ok?"ok":"ko");p.innerHTML=(ok?"<b>Juste.</b> ":montrer?"":"<b>Pas encore.</b> ")+(ok||montrer?q.c:(q.choix?"Relis les rappels.":"Vérifie ta formule et tes unités."));};
    box.querySelectorAll("[data-choix]").forEach(g=>g.addEventListener("click",e=>{
      const b=e.target.closest("button");if(!b)return;const q=Q.find(x=>x.id===g.dataset.choix);
      g.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));fb(q,b.dataset.v===q.r);}));
    const verif=q=>{
      const v=parseFloat(box.querySelector("#q_"+q.id).value.replace(/\s/g,"").replace(",","."));
      if(!isFinite(v)){const p=box.querySelector(`[data-q="${q.id}"] .mc-fb`);p.className="mc-fb ko";p.textContent="Écris un nombre.";return;}
      const tol=q.tol!=null?Math.max(q.tol,Math.abs(q.r)*0.02):Math.abs(q.r)*0.02;fb(q,Math.abs(v-q.r)<=tol);
    };
    box.querySelectorAll("[data-verif]").forEach(b=>b.onclick=()=>verif(Q.find(x=>x.id===b.dataset.verif)));
    box.querySelectorAll("input").forEach(i=>i.addEventListener("keydown",e=>{if(e.key==="Enter")verif(Q.find(x=>"q_"+x.id===i.id));}));
    zone.querySelector("#corrige").onclick=()=>Q.forEach(q=>fb(q,false,true));
  }
  lier(zone,st,questions);questions();
  return ()=>{};
}

/* ---------- démarrages comparés ---------- */
function demarrages(zone){
  const st={moteur:"m11",mode:"direct",charge:"quadratique",k:0.8,inertie:3,tempo:4,ilim:3,rampe:4};
  let raf=null,detruit=false;
  zone.innerHTML=`<div class="sim">
    <div class="folios-zone">
      <section class="bloc"><h2>Caractéristiques couple-vitesse</h2><div id="gC"></div>
        <p class="astuce" id="lectC"></p></section>
      <section class="bloc"><h2>Le démarrage, seconde par seconde</h2><p class="mc-direct" id="direct" aria-live="off">Lance un démarrage.</p><div id="gN"></div><div id="gI"></div></section>
      <section class="bloc" aria-live="polite"><h2>Bilan</h2><div id="bilan"><p class="astuce">Choisis le moteur, la charge et le procédé, puis lance le démarrage.</p></div></section>
      <section class="bloc"><h2>Les quatre procédés avec ces réglages</h2><div id="comparatif"></div></section>
    </div>
    <div class="panneau">
      <section class="bloc"><h2>Moteur (réseau 400 V)</h2>${segment("moteur","Moteur",MOTEURS.map(m=>[m.id,m.nom]),st.moteur)}<p class="astuce" id="cpl"></p></section>
      <section class="bloc"><h2>Charge entraînée</h2>
        ${segment("charge","Type",[["quadratique","pompe, ventilateur"],["constant","convoyeur, levage"]],st.charge)}
        ${segment("k","Couple résistant à vitesse nominale",[[0.2,"20 % Cn"],[0.5,"50 % Cn"],[0.8,"80 % Cn"],[1,"100 % Cn"]],st.k)}
        ${segment("inertie","Inertie de la charge",[[1,"faible"],[3,"moyenne"],[20,"forte (volant)"]],st.inertie)}</section>
      <section class="bloc"><h2>Procédé de démarrage</h2>
        ${segment("mode","Procédé",Object.entries(MODES),st.mode)}
        <div id="reglage"></div>
        <div class="actions"><button type="button" class="btn btn-primary" id="lancer">Lancer le démarrage</button></div></section>
    </div></div>`;
  function reglage(){
    const r=zone.querySelector("#reglage");
    const curseur=(nom,lab,min,max,pasv,u)=>`<label class="mc-reglage"><span>${lab} : <b id="v_${nom}">${fr(st[nom],pasv<1?1:0)} ${u}</b></span><input type="range" min="${min}" max="${max}" step="${pasv}" value="${st[nom]}" data-r="${nom}"></label>`;
    r.innerHTML=st.mode==="etoile"?curseur("tempo","Temporisation étoile → triangle",0.5,10,0.5,"s"):
      st.mode==="progressif"?curseur("ilim","Limitation de courant",2,5,0.5,"× In"):
      st.mode==="variateur"?curseur("rampe","Rampe d'accélération",0.5,10,0.5,"s"):`<p class="astuce">Aucun réglage : le moteur est couplé directement au réseau.</p>`;
    r.querySelectorAll("[data-r]").forEach(i=>i.oninput=()=>{st[i.dataset.r]=+i.value;r.querySelector("#v_"+i.dataset.r).textContent=fr(+i.value,+i.step<1?1:0)+" "+(i.dataset.r==="ilim"?"× In":"s");caracts();});
  }
  const possible=(m,mode)=>mode!=="etoile"||grandeurs(m,400).etoile;
  function caracts(){
    const m=moteur(st.moteur),G=grandeurs(m,400),K=caracteristiques(m,G.In);
    zone.querySelector("#cpl").innerHTML=`Sur 400 V : couplage <b>${G.cp}</b>, I<sub>n</sub> = ${fr(G.In,1)} A, C<sub>n</sub> = ${fr(G.Cu,1)} N·m.${G.etoile?"":" <b>Étoile-triangle impossible</b> : le moteur fonctionne déjà en étoile."}`;
    zone.querySelectorAll('[data-nom="mode"] button[data-v="etoile"]').forEach(b=>b.disabled=!G.etoile);
    if(!possible(m,st.mode)){st.mode="direct";zone.querySelectorAll('[data-nom="mode"] button').forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.v==="direct")));reglage();}
    const Cr=n=>st.charge==="constant"?st.k*K.Cn:st.k*K.Cn*Math.pow(n/m.n,2);
    const N=[];for(let n=0;n<=K.ns;n+=K.ns/120)N.push(n);
    const series=[{pts:N.map(n=>[n,K.C(n)]),cls:"s-dir",lab:"moteur, couplage normal"}];
    if(st.mode==="etoile")series.push({pts:N.map(n=>[n,K.C(n)/3]),cls:"s-et",lab:"moteur en étoile (÷ 3)"});
    if(st.mode==="progressif")series.push({pts:N.map(n=>{const k=Math.min(1,st.ilim*G.In/K.I(n));return [n,k*k*K.C(n)];}),cls:"s-et",lab:`à ${fr(st.ilim,1)} × In`});
    if(st.mode==="variateur")series.push({pts:[[0,1.5*K.Cn],[m.n,1.5*K.Cn]],cls:"s-et",lab:"limite du variateur"});
    series.push({pts:N.map(n=>[n,Cr(n)]),cls:"s-cr",lab:"charge"});
    const gC=zone.querySelector("#gC");gC.innerHTML="";
    graphe(gC,{xmax:K.ns,ymax:Math.ceil(m.kCm*K.Cn*1.1/10)*10||10,xlab:"vitesse (tr/min)",ylab:"couple (N·m)",series,hl:[{y:K.Cn,lab:"Cn"}],titre:"Couple moteur et couple résistant en fonction de la vitesse"});
    zone.querySelector("#lectC").textContent="Le moteur accélère tant que sa courbe est au-dessus de celle de la charge. Il se stabilise là où elles se croisent.";
    comparatif();
  }
  function comparatif(){
    const m=moteur(st.moteur);
    zone.querySelector("#comparatif").innerHTML=`<div class="mc-tableau"><table><thead><tr><th>Procédé</th><th>Durée</th><th>Pointe de courant</th><th>Couple au départ</th><th>Résultat</th></tr></thead><tbody>${
      Object.entries(MODES).map(([k,lab])=>{
        if(!possible(m,k))return `<tr><td>${lab}</td><td colspan="4" class="astuce">Impossible avec ce moteur sur 400 V</td></tr>`;
        const r=simuler(m,{...st,mode:k}),v=verdict(r);
        return `<tr${k===st.mode?' class="actif"':""}><td>${lab}</td><td>${r.cale?"—":fr(r.tFin,1)+" s"}</td><td>${fr(r.pic)} A <small>(${fr(r.pic/r.In,1)} In)</small></td><td>${fr(r.Cd/r.Cn,1)} Cn</td><td class="${v.cls==="ok"?"pp-ok":"pp-ko"}">${r.cale?"ne démarre pas":r.nCom!==null&&r.nCom<1?"bloqué en étoile":v.cls==="ok"?"démarre":"trop long"}</td></tr>`;
      }).join("")}</tbody></table></div>`;
  }
  function lancer(){
    if(raf)cancelAnimationFrame(raf);
    const m=moteur(st.moteur),r=simuler(m,st),v=verdict(r),E=r.ech,tmax=E[E.length-1][0];
    const gN=zone.querySelector("#gN"),gI=zone.querySelector("#gI");gN.innerHTML="";gI.innerHTML="";
    const vl=st.mode==="etoile"&&st.tempo<=tmax?[{x:st.tempo,lab:"→ triangle"}]:[];
    const GN=graphe(gN,{xmax:tmax,ymax:Math.ceil(nsDe(m).ns/500)*500,xlab:"temps (s)",ylab:"vitesse (tr/min)",series:[{pts:E.map(e=>[e[0],e[1]]),cls:"s-dir",lab:""}],hl:[{y:m.n,lab:"n nominale"}],vl,titre:"Vitesse en fonction du temps"});
    const imax=Math.max(r.pic*1.1,r.In*2);
    const GI=graphe(gI,{xmax:tmax,ymax:Math.ceil(imax/10)*10,xlab:"temps (s)",ylab:"courant de ligne (A)",series:[{pts:E.map(e=>[e[0],e[2]]),cls:"s-i",lab:""}],hl:[{y:r.In,lab:"In"}],vl,titre:"Courant de ligne en fonction du temps"});
    zone.querySelector("#bilan").innerHTML=`<div class="verdict ${v.cls}"><b>${esc(v.titre)}</b>${v.L.map(x=>`<span>${esc(x)}</span>`).join("")}</div>`;
    const duree=Math.min(Math.max(tmax,1.5),6)*1000,t0=performance.now(),dir=zone.querySelector("#direct");
    const pas_=t=>{
      if(detruit)return;
      const f=Math.min(1,(t-t0)/duree);GN.tracer(f);GI.tracer(f);
      const e=E[Math.min(E.length-1,Math.round(f*(E.length-1)))];
      GN.curseur(e[0]);GI.curseur(e[0]);
      dir.innerHTML=`t = <b>${fr(e[0],1)} s</b> · n = <b>${fr(e[1])} tr/min</b> · I = <b>${fr(e[2])} A</b> · C = <b>${fr(e[3])} N·m</b>`;
      if(f<1)raf=requestAnimationFrame(pas_);else{raf=null;GN.curseur(null);GI.curseur(null);}
    };
    raf=requestAnimationFrame(pas_);
  }
  lier(zone,st,nom=>{if(nom==="mode")reglage();caracts();});
  zone.querySelector("#lancer").onclick=lancer;
  reglage();caracts();
  return ()=>{detruit=true;if(raf)cancelAnimationFrame(raf);};
}

window.ElecMachines={ouvrir,simuler,grandeurs,MOTEURS};
})();
