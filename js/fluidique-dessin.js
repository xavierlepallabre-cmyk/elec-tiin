/* Élec TIIN — symboles de fluidique (ISO 1219-1), dessinés en SVG.
   Coordonnées en pixels du viewBox. Les conduites portent un nom de réseau (net) pour la coloration. */
(function(){
"use strict";
const NS="http://www.w3.org/2000/svg";
function el(tag,a,p){const e=document.createElementNS(NS,tag);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
const pts=l=>l.map(p=>p[0]+","+p[1]).join(" ");

class Planche{
  constructor(svg,w,h){
    this.svg=svg;svg.setAttribute("viewBox",`0 0 ${w} ${h}`);svg.classList.add("schema","fluide");
    this.gL=el("g",{},svg);this.gS=el("g",{},svg);this.gT=el("g",{},svg);this.gZ=el("g",{},svg);
    this.lignes=[];this.distrib={};this.verins={};this.manos={};this.reglables={};this.chambres=[];
  }
  ligne(net,l,pilote){const e=el("polyline",{points:pts(l),class:pilote?"fl-pilote":"fl-ligne"},this.gL);this.lignes.push({net,e,pilote});return e;}
  point(net,x,y){const e=el("circle",{cx:x,cy:y,r:3.5,class:"fl-jonc"},this.gL);this.lignes.push({net,e,jonc:true});}
  texte(x,y,t,cls,ancre){const e=el("text",{x,y,class:cls||"fl-t","text-anchor":ancre||"start","dominant-baseline":"central"},this.gT);e.textContent=t;return e;}

  /* ---------- échappement : triangle ouvert, pointe vers l'extérieur ---------- */
  echappement(x,y){el("polygon",{points:pts([[x-6,y+4],[x+6,y+4],[x,y+12]]),class:"fl-s"},this.gS);el("line",{x1:x,y1:y,x2:x,y2:y+4,class:"fl-s"},this.gS);}
  /* ---------- source de pression pneumatique : cercle et triangle ouvert ---------- */
  source(x,y,lab){el("circle",{cx:x,cy:y,r:11,class:"fl-s fond"},this.gS);el("polygon",{points:pts([[x,y-6],[x-5,y+3],[x+5,y+3]]),class:"fl-s"},this.gS);
    if(lab)this.texte(x+16,y,lab,"fl-t petit");}
  /* ---------- manomètre ---------- */
  mano(id,x,y,lab){el("circle",{cx:x,cy:y,r:11,class:"fl-s fond"},this.gS);
    el("line",{x1:x-6,y1:y+6,x2:x+6,y2:y-6,class:"fl-s"},this.gS);el("polygon",{points:pts([[x+7,y-7],[x+1.5,y-5],[x+5,y-1.5]]),class:"fl-plein"},this.gS);
    this.manos[id]=this.texte(x+16,y,"",lab?"fl-t gras":"fl-t gras");}
  /* ---------- ressort ---------- */
  ressort(x,y,sens,long){const L=long||18,d=sens;const p=[[x,y]];for(let i=1;i<=6;i++)p.push([x+d*L*i/6,y+(i%2?-6:6)]);p.push([x+d*(L+4),y]);
    el("polyline",{points:pts(p),class:"fl-s"},this.gS);}
  /* ---------- commandes manuelles ---------- */
  bouton(x,y,sens,lab){el("line",{x1:x,y1:y,x2:x+sens*12,y2:y,class:"fl-s"},this.gS);
    el("path",{d:`M${x+sens*12} ${y-7} A7 7 0 0 ${sens>0?1:0} ${x+sens*12} ${y+7}`,class:"fl-s"},this.gS);
    el("line",{x1:x+sens*12,y1:y-7,x2:x+sens*12,y2:y+7,class:"fl-s"},this.gS);
    if(lab)this.texte(x+sens*26,y,lab,"fl-t petit",sens>0?"start":"end");}
  levier(x,y,sens,lab){el("line",{x1:x,y1:y,x2:x+sens*12,y2:y,class:"fl-s"},this.gS);el("line",{x1:x+sens*12,y1:y,x2:x+sens*22,y2:y-12,class:"fl-s"},this.gS);
    el("circle",{cx:x+sens*22,cy:y-12,r:2.5,class:"fl-plein"},this.gS);if(lab)this.texte(x+sens*28,y-12,lab,"fl-t petit",sens>0?"start":"end");}

  /* ---------- distributeur : cases côte à côte, la boîte glisse pour aligner la position active ---------- */
  distributeur(d){
    const g=el("g",{},this.gS),boite=el("g",{class:"fl-boite"},g);const s=d.s,y=d.y;
    const X0=d.x-d.ref*s;                       // bord gauche de la case 0 au repos
    const P=(k,c)=>{const p=d.ports[k];return [X0+c*s+p.f*s,p.cote==="h"?y:y+s];};
    for(let c=0;c<d.cases;c++){
      el("rect",{x:X0+c*s,y,width:s,height:s,class:"fl-s fond"},boite);
      (d.chemins[c]||[]).forEach(([a,b])=>{
        const A=P(a,c),B=P(b,c),dx=B[0]-A[0],dy=B[1]-A[1],n=Math.hypot(dx,dy),ux=dx/n,uy=dy/n;
        const a1=[A[0]+ux*3,A[1]+uy*3],b1=[B[0]-ux*3,B[1]-uy*3];
        el("line",{x1:a1[0],y1:a1[1],x2:b1[0],y2:b1[1],class:"fl-s"},boite);
        el("polygon",{points:pts([b1,[b1[0]-ux*8-uy*4,b1[1]-uy*8+ux*4],[b1[0]-ux*8+uy*4,b1[1]-uy*8-ux*4]]),class:"fl-plein"},boite);
      });
      (d.bloques[c]||[]).forEach(k=>{const p=P(k,c),dir=d.ports[k].cote==="h"?1:-1;
        el("line",{x1:p[0],y1:p[1],x2:p[0],y2:p[1]+dir*9,class:"fl-s"},boite);
        el("line",{x1:p[0]-5,y1:p[1]+dir*9,x2:p[0]+5,y2:p[1]+dir*9,class:"fl-s"},boite);});
    }
    const xg=X0,xd=X0+d.cases*s,ym=y+s/2;
    if(d.gauche==="bouton")this.boutonB(boite,xg,ym,-1);
    if(d.gauche==="levier")this.levierB(boite,xg,ym,-1);
    if(d.droite==="bouton")this.boutonB(boite,xd,ym,1);
    if(d.droite==="ressort"||d.ressortD)this.ressortB(boite,xd,ym,1);
    if(d.ressortG)this.ressortB(boite,xg,ym+11,-1);
    // repères des orifices (fixes, au niveau de la case de référence)
    Object.entries(d.ports).forEach(([k,p])=>{const q=[d.x+p.f*s,p.cote==="h"?y:y+s];
      if(p.cote==="h")this.texte(q[0]+4,y-7,k,"fl-t mini");else this.texte(q[0]-4,y+s+9,k,"fl-t mini","end");
      if(p.echap)this.echappement(q[0],q[1]);});
    if(d.lab)this.texte(d.labX??(X0-34),d.labY??(y-12),d.lab,"fl-t gras",d.labA||"end");
    if(d.cmdG)this.texte(X0-8,ym-14,d.cmdG,"fl-t mini","end");
    if(d.cmdD)this.texte(xd+8,ym-14,d.cmdD,"fl-t mini");
    this.distrib[d.id]={d,boite,pos:d.ref};
  }
  boutonB(g,x,y,sens){el("line",{x1:x,y1:y,x2:x+sens*12,y2:y,class:"fl-s"},g);
    el("path",{d:`M${x+sens*12} ${y-7} A7 7 0 0 ${sens>0?1:0} ${x+sens*12} ${y+7}`,class:"fl-s"},g);
    el("line",{x1:x+sens*12,y1:y-7,x2:x+sens*12,y2:y+7,class:"fl-s"},g);}
  levierB(g,x,y,sens){el("line",{x1:x,y1:y,x2:x+sens*12,y2:y,class:"fl-s"},g);el("line",{x1:x+sens*12,y1:y,x2:x+sens*20,y2:y-14,class:"fl-s"},g);
    el("circle",{cx:x+sens*20,cy:y-14,r:2.5,class:"fl-plein"},g);}
  ressortB(g,x,y,sens){const p=[[x,y]];for(let i=1;i<=6;i++)p.push([x+sens*3*i,y+(i%2?-6:6)]);p.push([x+sens*22,y]);el("polyline",{points:pts(p),class:"fl-s"},g);}
  positionner(id,pos){const D=this.distrib[id];if(!D)return;D.pos=pos;D.boite.setAttribute("transform",`translate(${(D.d.ref-pos)*D.d.s} 0)`);}

  /* ---------- vérin (horizontal, tige à droite ; ou vertical, tige en haut) ---------- */
  verin(v){
    const g=el("g",{},this.gS),{x,y,w,h}=v;
    if(v.vertical)g.setAttribute("transform",`rotate(-90 ${x} ${y+h})`);
    const chA=el("rect",{x:x+2,y:y+2,width:10,height:h-4,class:"fl-chambre"},g);
    const chB=el("rect",{x:x+2,y:y+2,width:10,height:h-4,class:"fl-chambre"},g);
    el("rect",{x,y,width:w,height:h,class:"fl-s"},g);
    const mob=el("g",{},g);
    el("rect",{x:x-3,y:y+3,width:7,height:h-6,class:"fl-piston"},mob);
    el("rect",{x:x+4,y:y+h/2-4,width:w+v.course,height:8,class:"fl-tige"},mob);
    let ress=null;
    if(v.simple){ress=el("polyline",{class:"fl-s"},g);el("circle",{cx:x+w-6,cy:y+6,r:2,class:"fl-plein"},g);}
    if(v.charge){const c=el("g",{},mob),cx=x+4+w+v.course+15,cy=y+h/2;
      el("rect",{x:x+4+w+v.course,y:y-14,width:30,height:h+28,rx:3,class:"fl-charge"},c);
      const t=el("text",{x:cx,y:cy,class:"fl-t gras","text-anchor":"middle","dominant-baseline":"central",transform:`rotate(90 ${cx} ${cy})`},c);t.textContent=v.charge;}
    this.verins[v.id]={v,mob,chA,chB,ress,g};
    if(v.lab)this.texte(v.labX??x,v.labY??(y-14),v.lab,"fl-t gras");
  }
  placerVerin(id,t,coulA,coulB){ // t : 0 rentré, 1 sorti
    const V=this.verins[id];if(!V)return;const {x,y,w,h,course}=V.v;
    const px=x+6+t*w*(V.v.travel||0.6);
    V.mob.setAttribute("transform",`translate(${px-x} 0)`);
    V.chA.setAttribute("width",Math.max(0,px-x-2));V.chA.style.fill=coulA;
    V.chB.setAttribute("x",px+5);V.chB.setAttribute("width",Math.max(0,x+w-px-7));V.chB.style.fill=coulB;
    if(V.ress){const a=px+6,b=x+w-3,p=[];for(let i=0;i<=8;i++)p.push([a+(b-a)*i/8,y+h/2+(i%2?-h/2+5:h/2-5)*(i%8===0?0:1)]);V.ress.setAttribute("points",pts(p));}
  }

  /* ---------- réducteur de débit unidirectionnel (vertical) : étranglement réglable + clapet en parallèle ---------- */
  reducteur(r){
    const {x,y}=r,g=this.gS,h=44;
    el("rect",{x:x-20,y,width:40,height:h,rx:3,class:"fl-cadre"},g);
    el("path",{d:`M${x-5} ${y+12} Q${x} ${y+22} ${x-5} ${y+32}M${x+5} ${y+12} Q${x} ${y+22} ${x+5} ${y+32}`,class:"fl-s"},g);
    el("line",{x1:x-9,y1:y+32,x2:x+7,y2:y+10,class:"fl-s"},g);el("polygon",{points:pts([[x+9,y+7],[x+2,y+11],[x+6,y+15]]),class:"fl-plein"},g);
    // branche du clapet anti-retour : passage libre vers la chambre (vers le haut)
    el("polyline",{points:pts([[x,y+5],[x+13,y+5],[x+13,y+39],[x,y+39]]),class:"fl-s"},g);
    el("polyline",{points:pts([[x+7,y+16],[x+13,y+24],[x+19,y+16]]),class:"fl-s"},g);
    el("circle",{cx:x+13,cy:y+20,r:4,class:"fl-s fond"},g);
    this.ligne(r.haut,[[x,y],[x,y+5]]);this.ligne(r.bas,[[x,y+39],[x,y+h]]);
    this.ligne(r.haut,[[x,y+5],[x,y+12]]);this.ligne(r.bas,[[x,y+32],[x,y+39]]);
    if(r.lab)this.texte(x+24,y+22,r.lab,"fl-t petit");
    this.reglables[r.id]=r;
  }
  /* ---------- clapet anti-retour piloté (vertical, passage libre vers le haut) ---------- */
  clapetPilote(c){
    const {x,y}=c,g=this.gS;
    el("rect",{x:x-16,y,width:32,height:40,rx:3,class:"fl-cadre"},g);
    el("polyline",{points:pts([[x-7,y+14],[x,y+23],[x+7,y+14]]),class:"fl-s"},g);
    el("circle",{cx:x,cy:y+18,r:4.5,class:"fl-s fond"},g);
    this.ligne(c.haut,[[x,y],[x,y+13]]);this.ligne(c.bas,[[x,y+23],[x,y+40]]);
    if(c.lab)this.texte(x-22,y+20,c.lab,"fl-t petit","end");
  }
  /* ---------- hydraulique : pompe, moteur, réservoir, limiteur ---------- */
  pompe(x,y){el("circle",{cx:x,cy:y,r:15,class:"fl-s fond"},this.gS);el("polygon",{points:pts([[x,y-14],[x-6,y-4],[x+6,y-4]]),class:"fl-plein"},this.gS);
    el("line",{x1:x-15,y1:y-3,x2:x-34,y2:y-3,class:"fl-s"},this.gS);el("line",{x1:x-15,y1:y+3,x2:x-34,y2:y+3,class:"fl-s"},this.gS);
    this.moteurC=el("circle",{cx:x-48,cy:y,r:14,class:"fl-s fond"},this.gS);this.texte(x-48,y+1,"M","fl-t gras","middle");}
  reservoir(x,y){el("polyline",{points:pts([[x-14,y-8],[x-14,y+4],[x+14,y+4],[x+14,y-8]]),class:"fl-s"},this.gS);}
  limiteur(l){
    const {x,y}=l,g=this.gS;
    el("rect",{x:x-14,y,width:28,height:30,class:"fl-s fond"},g);
    this.limFleche=el("g",{},g);
    el("line",{x1:x+5,y1:y+26,x2:x+5,y2:y+6,class:"fl-s"},this.limFleche);el("polygon",{points:pts([[x+5,y+4],[x+1,y+11],[x+9,y+11]]),class:"fl-plein"},this.limFleche);
    this.ressort(x+14,y+15,1,16);el("line",{x1:x+20,y1:y+24,x2:x+32,y2:y+6,class:"fl-s"},g);
    el("polyline",{points:pts([[x-14,y+15],[x-26,y+15],[x-26,y-10],[x,y-10]]),class:"fl-pilote-fixe",fill:"none"},g); // pilotage par la pression d'entrée
    if(l.lab)this.texte(x+38,y+15,l.lab,"fl-t petit");
  }
  charge(id,x,y,w,h,lab){} // réservée
  zone(x,y,w,h,label){return el("rect",{x,y,width:w,height:h,rx:8,class:"zone",tabindex:0,role:"button","aria-label":label},this.gZ);}
}
window.ElecFluide={Planche,el,pts};
})();
