/* Élec TIIN — Export des schémas et des symboles en fichiers autonomes (SVG ou PNG).
   Le dessin à l'écran tire ses couleurs de la feuille de style (variables CSS, thème clair ou sombre).
   Pour l'export, on fige les styles calculés en attributs, toujours avec la palette du thème clair :
   le fichier s'affiche alors à l'identique dans un navigateur, Inkscape, LibreOffice ou LaTeX.
   Option « noir et blanc » : traits et textes en noir, fonds en blanc, remplissages clairs en gris,
   sans filtre global (le rendu reste vectoriel et net à la photocopie). */
(function(){
"use strict";
const NS="http://www.w3.org/2000/svg";
const ECHELLE=46; // unités SVG par centimètre (identique à dessin.js)
const LICENCE="© 2026 Xavier Le Pallabre — Élec TIIN — CC BY-NC-SA 4.0";
const POLICE="Lexend, Arial, Helvetica, sans-serif";

/* propriétés figées sur chaque élément */
const PROPS=["fill","fill-opacity","stroke","stroke-width","stroke-dasharray","stroke-linecap","stroke-linejoin","stroke-opacity","opacity","paint-order"];
const PROPS_TEXTE=["font-size","font-weight","font-style","text-anchor","dominant-baseline"];
const DEFAUTS={"fill-opacity":"1","stroke-opacity":"1","opacity":"1","stroke-dasharray":"none","stroke-linecap":"butt","stroke-linejoin":"miter","paint-order":"normal","font-style":"normal","dominant-baseline":"auto","text-anchor":"start"};

/* ---------- couleurs ---------- */
function rgba(c){
  const m=/rgba?\(([^)]+)\)/.exec(c||"");
  if(!m)return null;
  const p=m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
  return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1};
}
const hex2=n=>Math.round(n).toString(16).padStart(2,"0");
const hex=c=>"#"+hex2(c.r)+hex2(c.g)+hex2(c.b);
function luminance(c){
  const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);};
  return 0.2126*f(c.r)+0.7152*f(c.g)+0.0722*f(c.b);
}
/* Renvoie [couleur, opacité] ou null (aucune peinture).
   En noir et blanc, seuls les « fonds » (bobine, voyant, fusible, fond de symbole) peuvent être gris :
   gris s'ils sont colorés (alimenté, allumé, fondu), blanc sinon. Tout le reste est noir ou blanc. */
function peinture(val,noir,estFond){
  if(!val||val==="none")return null;
  const c=rgba(val);
  if(!c)return [val,1];
  if(c.a===0)return null;
  if(!noir)return [hex(c),c.a];
  if(c.a<1)return null;                                   // halos et surbrillances : supprimés
  const L=luminance(c);
  if(L>0.92)return ["#ffffff",1];
  return estFond?["#c4c4c4",1]:["#000000",1];
}
const FONDS=["bobine","voyant","fusible","plein-fond","borne"];

/* ---------- copie figée d'un SVG vivant ---------- */
function figer(src,dst,noir){
  const cs=getComputedStyle(src);
  const cl=src.classList;
  if(cl&&(cl.contains("c-zones")||cl.contains("zone")||cl.contains("trou"))){dst.remove();return;} // zones cliquables
  if(cs.display==="none"||cs.visibility==="hidden"||+cs.opacity===0){dst.remove();return;}
  const tag=src.tagName.toLowerCase();
  if(tag!=="svg"&&tag!=="g"||src.childElementCount===0){
    for(const p of PROPS){
      let v=cs.getPropertyValue(p);
      if(p==="fill"||p==="stroke"){
        const r=peinture(v,noir,p==="fill"&&FONDS.some(k=>src.classList.contains(k)));
        if(!r){dst.setAttribute(p,"none");continue;}
        dst.setAttribute(p,r[0]);
        if(r[1]<1)dst.setAttribute(p+"-opacity",String(+r[1].toFixed(3)));
        continue;
      }
      if(p==="fill-opacity"||p==="stroke-opacity"){if(dst.hasAttribute(p))continue;}
      if(p==="stroke-width")v=String(parseFloat(v));
      if(p==="stroke-dasharray"&&v!=="none")v=v.replace(/px/g,"").replace(/,\s*/g," ");
      if(v&&v!==DEFAUTS[p])dst.setAttribute(p,v);
    }
    if(tag!=="text"&&tag!=="tspan"&&tag!=="g"&&tag!=="svg"&&dst.getAttribute("fill")==="none"&&dst.getAttribute("stroke")==="none"){dst.remove();return;} // élément invisible (halo éteint)
    if(tag==="text"||tag==="tspan"){
      for(const p of PROPS_TEXTE){
        let v=cs.getPropertyValue(p);
        if(p==="font-size")v=String(parseFloat(v));
        if(p==="font-weight"&&(v==="400"||v==="normal"))continue;
        if(v&&v!==DEFAUTS[p])dst.setAttribute(p,v);
      }
      dst.setAttribute("font-family",POLICE);
    }
  }
  for(const a of ["class","style","tabindex","role","aria-label","aria-hidden","aria-pressed","data-t","data-i"])dst.removeAttribute(a);
  const s=[...src.children],d=[...dst.children];
  s.forEach((e,i)=>figer(e,d[i],noir));
}

/* Neutralise transitions et animations, force le thème clair le temps de lire les styles. */
function avecThemeClair(fn){
  const r=document.documentElement,avant=r.getAttribute("data-theme");
  const st=document.createElement("style");
  st.textContent="*,*::before,*::after{transition:none!important;animation:none!important}";
  document.head.appendChild(st);
  r.setAttribute("data-theme","light");
  void r.offsetHeight;
  try{return fn();}
  finally{
    if(avant===null)r.removeAttribute("data-theme");else r.setAttribute("data-theme",avant);
    void r.offsetHeight;st.remove();
  }
}

/* svgVivant : élément <svg> présent dans le document. Renvoie le texte d'un fichier SVG autonome. */
function svgAutonome(svgVivant,opt){
  opt=opt||{};
  return avecThemeClair(()=>{
    const clone=svgVivant.cloneNode(true);
    figer(svgVivant,clone,!!opt.noir);
    clone.querySelectorAll("text").forEach(e=>{if(!e.textContent.trim())e.remove();}); // étiquettes dynamiques vides
    // retire les groupes vides laissés par le nettoyage
    clone.querySelectorAll("g").forEach(g=>{if(!g.childElementCount)g.remove();});
    const vb=(svgVivant.getAttribute("viewBox")||"0 0 100 100").split(/\s+/).map(Number);
    const mm=v=>(v/ECHELLE*10).toFixed(1)+"mm";
    for(const a of ["class","style","role","aria-label","aria-hidden","preserveAspectRatio","width","height"])clone.removeAttribute(a);
    clone.setAttribute("xmlns",NS);
    clone.setAttribute("version","1.1");
    clone.setAttribute("width",mm(vb[2]));clone.setAttribute("height",mm(vb[3]));
    clone.setAttribute("viewBox",vb.join(" "));
    const t=document.createElementNS(NS,"title");t.textContent=opt.titre||"Schéma Élec TIIN";
    const d=document.createElementNS(NS,"desc");
    d.textContent=(opt.description?opt.description+" — ":"")+LICENCE+". Échelle 1:1 (1 cm du schéma = 1 cm imprimé).";
    clone.insertBefore(d,clone.firstChild);clone.insertBefore(t,clone.firstChild);
    if(opt.fond){
      const r=document.createElementNS(NS,"rect");
      r.setAttribute("x",vb[0]);r.setAttribute("y",vb[1]);r.setAttribute("width",vb[2]);r.setAttribute("height",vb[3]);r.setAttribute("fill","#ffffff");
      clone.insertBefore(r,d.nextSibling);
    }
    if(opt.police){
      const s=document.createElementNS(NS,"style");s.textContent=opt.police;
      clone.insertBefore(s,clone.firstChild);
    }
    return '<?xml version="1.0" encoding="UTF-8"?>\n'+new XMLSerializer().serializeToString(clone);
  });
}

/* ---------- téléchargements ---------- */
function telecharger(blob,nom){
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=nom;a.rel="noopener";
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),4000);
}
function telechargerSVG(texte,nom){telecharger(new Blob([texte],{type:"image/svg+xml;charset=utf-8"}),nom+".svg");}

/* Police Lexend embarquée pour le rendu PNG (une image SVG ne voit pas les polices de la page). */
let policeB64=null;
async function policeEmbarquee(){
  if(policeB64!==null)return policeB64;
  const graisses=[[400,"lexend-0"],[600,"lexend-2"],[700,"lexend-3"]];
  try{
    const regles=await Promise.all(graisses.map(async([w,f])=>{
      const b=await (await fetch("assets/fonts/"+f+".ttf")).blob();
      const u=await new Promise((ok,ko)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=ko;r.readAsDataURL(b);});
      return `@font-face{font-family:'Lexend';font-weight:${w};src:url(${u}) format('truetype')}`;
    }));
    policeB64=regles.join("");
  }catch(e){policeB64="";}
  return policeB64;
}

/* Rendu PNG à la résolution demandée (300 ppp par défaut), fond blanc. */
async function pngDepuis(svgVivant,opt){
  const police=await policeEmbarquee();
  const texte=svgAutonome(svgVivant,Object.assign({},opt,{fond:true,police}));
  const vb=(svgVivant.getAttribute("viewBox")||"0 0 100 100").split(/\s+/).map(Number);
  const ppp=opt.ppp||300,k=ppp/2.54/ECHELLE;
  const w=Math.round(vb[2]*k),h=Math.round(vb[3]*k);
  const url=URL.createObjectURL(new Blob([texte],{type:"image/svg+xml;charset=utf-8"}));
  try{
    const img=new Image();img.decoding="sync";
    await new Promise((ok,ko)=>{img.onload=ok;img.onerror=()=>ko(new Error("rendu SVG impossible"));img.src=url;});
    const cv=document.createElement("canvas");cv.width=w;cv.height=h;
    const cx=cv.getContext("2d");cx.fillStyle="#fff";cx.fillRect(0,0,w,h);cx.drawImage(img,0,0,w,h);
    return await new Promise(ok=>cv.toBlob(ok,"image/png"));
  }finally{URL.revokeObjectURL(url);}
}
async function telechargerPNG(svgVivant,nom,opt){telecharger(await pngDepuis(svgVivant,opt||{}),nom+".png");}

/* Construit un SVG hors écran (attaché au document pour que la feuille de style s'applique). */
function horsEcran(construire){
  const box=document.createElement("div");
  box.setAttribute("aria-hidden","true");
  box.style.cssText="position:fixed;left:-10000px;top:0;width:800px;pointer-events:none";
  const svg=document.createElementNS(NS,"svg");
  box.appendChild(svg);document.body.appendChild(box);
  construire(svg);
  return {svg,fin:()=>box.remove()};
}

const slug=s=>String(s).normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

/* Lance un export : source() renvoie {svg, fin?}. Renvoie true si le fichier a été produit. */
async function exporter(source,format,nom,opt,btn){
  const s=source();
  if(btn)btn.disabled=true;
  try{
    if(format==="png")await telechargerPNG(s.svg,nom,opt);
    else telechargerSVG(svgAutonome(s.svg,opt),nom);
    return true;
  }catch(e){
    console.error(e);
    return false;
  }finally{
    if(s.fin)s.fin();
    if(btn)btn.disabled=false;
  }
}

window.ElecExport={svgAutonome,pngDepuis,telechargerSVG,telechargerPNG,horsEcran,exporter,slug,ECHELLE};
})();
