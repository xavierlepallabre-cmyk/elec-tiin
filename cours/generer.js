/* Élec TIIN — générateur des schémas de cours en SVG noir et blanc.
   1. Construit chaque schéma avec la bibliothèque de l'application (js/dessin.js).
   2. Contrôle la cohérence du dessin (validateur dessin–logique) :
      bornes raccordées, extrémités libres, contact entre conducteurs de repères différents,
      jonctions manquantes ou inutiles, conducteur dessiné en plusieurs morceaux.
   3. Pour les vues d'états, calcule chaque état avec le moteur de simulation (js/moteur.js),
      vérifie l'état attendu des récepteurs et l'écrit sous la vue.
   Utilisation : python tools/generer_schemas.py (écrit cours/svg/*.svg). */
(function(){
"use strict";
const D=window.ElecDessin,X=window.ElecExport,NS=D.NS,S=D.ECHELLE;
const TOL=0.02; // cm
const EPAIS="4.4";

/* ---------- géométrie ---------- */
const proche=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1])<TOL;
function surSegment(p,a,b){
  const dx=b[0]-a[0],dy=b[1]-a[1],l2=dx*dx+dy*dy;
  let t=l2?((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l2:0;t=Math.max(0,Math.min(1,t));
  return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)<TOL;
}
const touche=(p,pts)=>pts.some((a,i)=>i<pts.length-1&&surSegment(p,a,pts[i+1]));
/* branches d'un tracé en p : 1 par extrémité, 2 par point intérieur ou angle */
function branches(p,pts){
  let n=0;
  for(let i=0;i<pts.length-1;i++){
    const a=pts[i],b=pts[i+1];
    if(!surSegment(p,a,b))continue;
    n+=(proche(p,a)||proche(p,b))?1:2;
  }
  return n;
}

/* ---------- construction suivie (composants et conducteurs) ---------- */
function construireSuivi(svg,folio){
  const F=new D.Feuille(svg,folio.vue);
  const cm=e=>e.getAttribute("points").trim().split(/\s+/).map(s=>{const [x,y]=s.split(",").map(Number);return [x/S+folio.vue[0],folio.vue[1]-y/S];});
  const comps=[],fils=[];
  const suivre=(nom,bornes,fn)=>{const n=F.fils.length;fn();comps.push({nom,bornes,fils:F.fils.slice(n).map(f=>({net:f.net,pts:cm(f.e)}))});};
  (folio.fils||[]).forEach(f=>{F.fil(f[0],f[1]);fils.push({net:f[0],pts:f[1]});});
  (folio.joncs||[]).forEach(j=>F.jonc(j[0],j[1],j[2]));
  (folio.contacts||[]).forEach(c=>{
    const H=c.type==="sectfus"?1.4:1.2;
    suivre("contact "+c.id,[[c.x,c.y,c.haut],[c.x,c.y-H,c.bas]],()=>F.contact(c));
  });
  (folio.dessin||[]).forEach(cmd=>{
    const [nom,...a]=cmd;
    if(typeof F[nom]!=="function")throw new Error("Commande de dessin inconnue : "+nom);
    if(nom==="fil"){F.fil(a[0],a[1]);fils.push({net:a[0],pts:a[1]});return;}
    if(nom==="bobine"||nom==="voyant")return suivre(nom+" "+a[0],[[a[1],a[2],a[3]],[a[1],a[2]-1.2,a[4]]],()=>F[nom](...a));
    if(nom==="fusible")return suivre("fusible "+(a[4]||""),[[a[0],a[1],a[2]],[a[0],a[1]-1.2,a[3]]],()=>F[nom](...a));
    F[nom](...a);
  });
  return {F,comps,fils};
}

/* ---------- validateur dessin–logique ---------- */
function valider(def,suivi){
  const err=[],{comps,fils}=suivi,folio=def.folio;
  const f2=v=>v.toFixed(2).replace(".",",");
  const ou=p=>`(${f2(p[0])} ; ${f2(p[1])})`;
  const libres=folio.libres||[];
  const tousFils=fils.map((w,i)=>({net:w.net,pts:w.pts,qui:"fil "+i})).concat(...comps.map(c=>c.fils.map(f=>({net:f.net,pts:f.pts,qui:c.nom}))));
  const bornes=[].concat(...comps.map(c=>c.bornes.map(b=>({p:[b[0],b[1]],net:b[2],qui:c.nom}))));
  // 1. bornes des appareils
  bornes.forEach(b=>{
    if(!fils.some(w=>w.net===b.net&&touche(b.p,w.pts)))err.push(`${b.qui} : borne ${ou(b.p)} non raccordée au conducteur « ${b.net} ».`);
    tousFils.filter(w=>w.net!==b.net&&w.qui!==b.qui&&touche(b.p,w.pts)).forEach(w=>err.push(`${b.qui} : borne ${ou(b.p)} touche le conducteur « ${w.net} » (${w.qui}).`));
  });
  // 2. extrémités libres
  fils.forEach((w,i)=>[w.pts[0],w.pts[w.pts.length-1]].forEach(e=>{
    const ok=bornes.some(b=>b.net===w.net&&proche(b.p,e))||fils.some((v,j)=>j!==i&&v.net===w.net&&touche(e,v.pts))||libres.some(l=>proche(l,e));
    if(!ok)err.push(`Conducteur « ${w.net} » : extrémité libre en ${ou(e)}.`);
  }));
  // 3. contact entre conducteurs de repères différents
  fils.forEach((w,i)=>w.pts.forEach(v=>tousFils.forEach(u=>{
    if(u.net!==w.net&&u.qui!=="fil "+i&&touche(v,u.pts))err.push(`Conducteurs « ${w.net} » et « ${u.net} » reliés en ${ou(v)} (${u.qui}).`);
  })));
  // 4. jonctions : obligatoires dès trois branches, inutiles en dessous
  const pts=[];
  fils.forEach(w=>w.pts.forEach(p=>{if(!pts.some(q=>q.net===w.net&&proche(q.p,p)))pts.push({p,net:w.net});}));
  const joncs=(folio.joncs||[]).map(j=>({net:j[0],p:[j[1],j[2]]}));
  pts.forEach(({p,net})=>{
    const n=fils.filter(w=>w.net===net).reduce((s,w)=>s+branches(p,w.pts),0)+bornes.filter(b=>b.net===net&&proche(b.p,p)).length;
    const j=joncs.some(k=>proche(k.p,p));
    if(n>=3&&!j)err.push(`Conducteur « ${net} » : jonction manquante en ${ou(p)} (${n} branches).`);
  });
  joncs.forEach(k=>{
    const n=fils.filter(w=>w.net===k.net).reduce((s,w)=>s+branches(k.p,w.pts),0)+bornes.filter(b=>b.net===k.net&&proche(b.p,k.p)).length;
    if(n<3)err.push(`Point de jonction « ${k.net} » en ${ou(k.p)} : ${n} branche(s), il est inutile ou mal placé.`);
  });
  // 5. chaque conducteur forme un seul morceau
  const nets=[...new Set(tousFils.map(w=>w.net))];
  nets.forEach(net=>{
    const L=tousFils.filter(w=>w.net===net),par=L.map((_,i)=>i);
    const r=i=>{while(par[i]!==i)i=par[i]=par[par[i]];return i;};
    for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++)
      if(L[i].pts.some(p=>touche(p,L[j].pts))||L[j].pts.some(p=>touche(p,L[i].pts)))par[r(i)]=r(j);
    const g=new Set(L.map((_,i)=>r(i))).size;
    if(g>1)err.push(`Conducteur « ${net} » dessiné en ${g} morceaux séparés.`);
  });
  return err.map(e=>def.id+" — "+e);
}

/* ---------- peinture d'un état ---------- */
function peindreEtat(F,sim,schema){
  const vif=n=>sim.etatNet(n).cls==="vif";
  F.fils.forEach(f=>{if(vif(f.net))f.e.style.strokeWidth=EPAIS;});
  Object.values(F.contacts).forEach(c=>{
    const fe=sim.ferme(c.spec);
    c.maj(fe,"var(--mort)");
    if(fe&&vif(c.spec.haut))c.lame.style.strokeWidth=EPAIS;
  });
  for(const [id,ch] of Object.entries(F.charges)){
    const on=!!sim.charges[id];
    if(ch.type==="bobine")ch.e.classList.toggle("active",on);
    if(ch.type==="voyant"){ch.e.classList.toggle("allume",on);ch.e.dataset.t=ch.teinte;}
  }
}
function auRepos(F){Object.values(F.contacts).forEach(c=>c.maj(c.spec.mode==="nf"||c.spec.mode==="tnf","var(--mort)"));}

function resume(def,sim){
  const L=[];
  for(const ch of def.logique.charges){
    const on=!!sim.charges[ch.id];
    const app=Object.entries(def.logique.appareils).find(([k,a])=>a.bobine===ch.id);
    if(ch.type==="bobine")L.push(`${app?app[0]:ch.id} ${on?"enclenché":"au repos"}`);
    if(ch.type==="voyant")L.push(`${ch.id} ${on?"allumé":"éteint"}`);
  }
  return L.join(" · ");
}

/* ---------- montage de plusieurs vues dans un seul SVG ---------- */
function composer(def,vues){
  const parser=new DOMParser();
  const docs=vues.map(v=>parser.parseFromString(v.svg,"image/svg+xml").documentElement);
  const tailles=docs.map(d=>d.getAttribute("viewBox").split(/\s+/).map(Number));
  const cw=Math.max(...tailles.map(t=>t[2])),chh=Math.max(...tailles.map(t=>t[3]));
  const col=def.colonnes||vues.length,lig=Math.ceil(vues.length/col);
  const gx=26,cap=58,gy=24,leg=def.legende?40:0;
  const W=col*cw+(col-1)*gx,H=lig*(chh+cap)+(lig-1)*gy+leg;
  const out=document.createElementNS(NS,"svg");
  out.setAttribute("xmlns",NS);out.setAttribute("version","1.1");
  out.setAttribute("viewBox",`0 0 ${W} ${H}`);
  out.setAttribute("width",(W/S*10).toFixed(1)+"mm");out.setAttribute("height",(H/S*10).toFixed(1)+"mm");
  const t=document.createElementNS(NS,"title");t.textContent=def.titre;out.appendChild(t);
  const ds=document.createElementNS(NS,"desc");ds.textContent=def.id+" — © 2026 Xavier Le Pallabre — Élec TIIN — CC BY-NC-SA 4.0. Échelle 1:1.";out.appendChild(ds);
  const texte=(x,y,s,taille,gras,ancre)=>{
    const e=document.createElementNS(NS,"text");
    for(const [k,v] of Object.entries({x,y,"font-size":taille,"font-family":"Lexend, Arial, Helvetica, sans-serif",fill:"#000000","text-anchor":ancre||"middle"}))e.setAttribute(k,v);
    if(gras)e.setAttribute("font-weight","700");
    e.textContent=s;out.appendChild(e);
  };
  docs.forEach((d,i)=>{
    const c=i%col,l=Math.floor(i/col),x0=c*(cw+gx),y0=l*(chh+cap+gy),tv=tailles[i];
    const n=document.createElementNS(NS,"svg");
    for(const a of ["viewBox"])n.setAttribute(a,d.getAttribute(a));
    n.setAttribute("x",x0+(cw-tv[2])/2);n.setAttribute("y",y0);n.setAttribute("width",tv[2]);n.setAttribute("height",tv[3]);
    [...d.childNodes].forEach(k=>{if(k.nodeType===1&&(k.tagName==="title"||k.tagName==="desc"))return;n.appendChild(document.importNode(k,true));});
    out.appendChild(n);
    texte(x0+cw/2,y0+chh+18,vues[i].titre,13,true);
    texte(x0+cw/2,y0+chh+36,vues[i].resume,11);
    if(vues[i].note)texte(x0+cw/2,y0+chh+52,vues[i].note,11);
  });
  if(def.legende)texte(0,H-12,def.legende,11,false,"start");
  return '<?xml version="1.0" encoding="UTF-8"?>\n'+new XMLSerializer().serializeToString(out);
}

/* ---------- génération ---------- */
function generer(){
  const fichiers=[],erreurs=[],bilan=[];
  const zone=document.getElementById("travail");
  const nouveau=()=>{const s=document.createElementNS(NS,"svg");zone.appendChild(s);return s;};
  for(const def of window.COURS_SCHEMAS){
    // contrôle du dessin
    const s0=nouveau(),suivi=construireSuivi(s0,def.folio);
    if(def.controle!==false)erreurs.push(...valider(def,suivi));
    if(!def.etats){
      auRepos(suivi.F);
      fichiers.push({nom:def.id+".svg",svg:X.svgAutonome(s0,{noir:true,titre:def.titre,description:def.id+" — contacts au repos"})});
      bilan.push(def.id+" : schéma au repos");
      continue;
    }
    const schema=Object.assign({folios:[{contacts:def.folio.contacts}]},def.logique);
    const sim=new window.ElecSimulation(schema);
    if(def.pannes)sim.definirPannes(def.pannes);
    const vues=[];
    for(const e of def.etats){
      e.actions.forEach(([a,id,v])=>{if(a==="appuyer")sim.appuyer(id,v);else sim[a](id);});
      for(const [k,v] of Object.entries(e.attendu||{}))
        if(!!sim.charges[k]!==v)erreurs.push(`${def.id} — « ${e.titre} » : ${k} devrait être ${v?"alimenté":"hors tension"}.`);
      const s=nouveau(),F=construireSuivi(s,def.folio).F;
      peindreEtat(F,sim,schema);
      vues.push({titre:e.titre,resume:resume(def,sim),note:e.note,svg:X.svgAutonome(s,{noir:true})});
    }
    fichiers.push({nom:def.id+".svg",svg:composer(def,vues)});
    bilan.push(`${def.id} : ${vues.length} états calculés`);
  }
  zone.innerHTML="";
  return {fichiers,erreurs,bilan};
}
window.genererSchemasCours=generer;
window.validerSchemaCours=(def)=>{const s=document.createElementNS(NS,"svg");document.getElementById("travail").appendChild(s);const r=valider(def,construireSuivi(s,def.folio));s.remove();return r;};
})();
