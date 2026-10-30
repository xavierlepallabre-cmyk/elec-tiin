/* Élec TIIN — bibliothèque de dessin des schémas (symboles de style IEC 60617).
   Mêmes symboles et mêmes proportions que les macros LaTeX symboles-electriques.tex :
   coordonnées en centimètres, y vers le haut, un contact mesure 1,2 cm de haut. */
(function(){
"use strict";
const NS="http://www.w3.org/2000/svg";
const ECHELLE=46; // pixels SVG par centimètre

function el(tag,attrs,parent){
  const e=document.createElementNS(NS,tag);
  if(attrs)for(const k in attrs)e.setAttribute(k,attrs[k]);
  if(parent)parent.appendChild(e);
  return e;
}

/* Point milieu de la lame (position ouverte) : départ des liaisons mécaniques. */
function milieuLame(c){
  const loc={nf:[0.2,-0.55],sectfus:[-0.2,-0.715]}[c.type]||[-0.16,-0.58];
  return monde(c,loc[0],loc[1]);
}
/* Coordonnées locales d'un contact -> coordonnées du schéma (rotation de 90° possible). */
function monde(c,lx,ly){
  return c.rot===90?[c.x-ly,c.y+lx]:[c.x+lx,c.y+ly];
}

class Feuille{
  /* vue = [xmin, ymax, xmax, ymin] en cm */
  constructor(svg,vue){
    this.svg=svg; this.v=vue; this.S=ECHELLE;
    const w=(vue[2]-vue[0])*this.S, h=(vue[1]-vue[3])*this.S;
    svg.setAttribute("viewBox",`0 0 ${w.toFixed(0)} ${h.toFixed(0)}`);
    svg.classList.add("schema");
    this.gFils=el("g",{class:"c-fils"},svg);
    this.gSymb=el("g",{class:"c-symb"},svg);
    this.gDyn=el("g",{class:"c-dyn"},svg);
    this.gTxt=el("g",{class:"c-txt"},svg);
    this.gZones=el("g",{class:"c-zones"},svg);
    this.fils=[]; this.joncs=[]; this.contacts={}; this.charges={}; this.reperes={};
  }
  X(x){return +((x-this.v[0])*this.S).toFixed(1)}
  Y(y){return +((this.v[1]-y)*this.S).toFixed(1)}
  pts(l){return l.map(p=>this.X(p[0])+","+this.Y(p[1])).join(" ")}
  ref(p){ // [x,y] ou identifiant de contact
    if(typeof p==="string"){const c=this.contacts[p];if(!c)throw new Error("Contact inconnu : "+p);return milieuLame(c.spec);}
    return p;
  }

  /* ---------- conducteurs ---------- */
  fil(net,l,parent){const e=el("polyline",{points:this.pts(l),class:"fil"},parent||this.gFils);this.fils.push({net,e});return e;}
  jonc(net,x,y){const e=el("circle",{cx:this.X(x),cy:this.Y(y),r:3.6,class:"jonc"},this.gFils);this.joncs.push({net,e});}

  /* ---------- traits fixes ---------- */
  trait(l,cls){return el("polyline",{points:this.pts(l),class:cls||"symb"},this.gSymb);}
  tirets(l){return this.trait(l,"tirets");}
  chemin(d){return el("path",{d,class:"symb"},this.gSymb);}
  texte(x,y,s,cls,ancre){
    const t=el("text",{x:this.X(x),y:this.Y(y),class:cls||"",
      "text-anchor":ancre==="fin"?"end":ancre==="milieu"?"middle":"start","dominant-baseline":"central"},this.gTxt);
    t.textContent=s; return t;
  }
  rep(x,y,s,sous,ancre){ // repère d'appareil en gras, avec fonction en dessous
    const t=this.texte(x,y+(sous?0.13:0),s,"rep",ancre);
    if(sous)this.texte(x,y-0.2,sous,"sous",ancre);
    return t;
  }

  /* ---------- contacts (partie mobile animée) ---------- */
  contact(spec){
    const c={spec}; const S=this; const L=(lx,ly)=>monde(spec,lx,ly);
    const H=spec.type==="sectfus"?1.4:1.2;
    const fixe = spec.type==="nf"?[[0,0],[0,-0.4],[0.36,-0.4]]
               : spec.type==="isect"?[[0,0],[0,-0.34]]
               : spec.type==="sectfus"?[[0,0],[0,-0.35]]:[[0,0],[0,-0.4]];
    const pivot = spec.type==="sectfus"?-1.05:-0.8;
    S.fil(spec.haut,fixe.map(p=>L(p[0],p[1])));
    S.fil(spec.bas,[L(0,-H),L(0,pivot)]);
    const P=(lx,ly)=>{const m=L(lx,ly);return S.X(m[0])+" "+S.Y(m[1]);};
    // marques de fonction
    if(spec.type==="kmp") S.chemin(`M${P(0,-0.22)} A${0.1*S.S} ${0.1*S.S} 0 0 ${spec.rot===90?1:0} ${P(0,-0.42)}`);
    if(spec.type==="disj"||spec.type==="disjs") S.chemin(`M${P(-0.08,-0.32)}L${P(0.08,-0.48)}M${P(-0.08,-0.48)}L${P(0.08,-0.32)}`);
    if(spec.type==="disjs") S.chemin(`M${P(-0.1,-0.2)}L${P(0.1,-0.2)}`);
    if(spec.type==="sect") S.chemin(`M${P(-0.1,-0.4)}L${P(0.1,-0.4)}`);
    if(spec.type==="sectfus") S.chemin(`M${P(-0.1,-0.35)}L${P(0.1,-0.35)}`);
    if(spec.type==="isect"){S.chemin(`M${P(-0.1,-0.22)}L${P(0.1,-0.22)}`);
      const m=L(0,-0.4); el("circle",{cx:S.X(m[0]),cy:S.Y(m[1]),r:0.06*S.S,class:"symb"},S.gSymb);}
    // repères de bornes
    if(spec.b&&!spec.rot){
      const [x,y]=[spec.x,spec.y]; const pos=spec.bpos||(spec.type==="nf"?"g":"d");
      if(pos==="p"){S.texte(x-0.06,y-0.1,spec.b[0],"born","fin");S.texte(x+0.06,y-H+0.12,spec.b[1],"born");}
      else if(pos==="g"){S.texte(x-0.06,y-0.22,spec.b[0],"born","fin");S.texte(x-0.06,y-0.98,spec.b[1],"born","fin");}
      else {S.texte(x+0.06,y-0.22,spec.b[0],"born");S.texte(x+0.06,y-0.98,spec.b[1],"born");}
    }
    c.lame=el("line",{class:"lame"},S.gDyn);
    if(spec.type==="sectfus") c.fus=el("polygon",{class:"fusible"},S.gDyn);
    c.maj=(ferme,couleurLame,fondu)=>{
      let tip;
      if(spec.type==="nf") tip= ferme?[0.42,-0.27]:[-0.22,-0.36];
      else if(spec.type==="sectfus") tip= ferme?[0,-0.35]:[-0.4,-0.38];
      else tip= ferme?[0,-0.4]:[-0.32,-0.36];
      const a=L(0,pivot), b=L(tip[0],tip[1]);
      c.lame.setAttribute("x1",S.X(a[0]));c.lame.setAttribute("y1",S.Y(a[1]));
      c.lame.setAttribute("x2",S.X(b[0]));c.lame.setAttribute("y2",S.Y(b[1]));
      c.lame.style.stroke=couleurLame;
      if(c.fus){ // fusible porté par la lame
        const ax=S.X(a[0]),ay=S.Y(a[1]),bx=S.X(b[0]),by=S.Y(b[1]);
        const mx=(ax+bx)/2,my=(ay+by)/2,dx=bx-ax,dy=by-ay,n=Math.hypot(dx,dy)||1;
        const ux=dx/n,uy=dy/n,hl=0.21*S.S,hw=0.065*S.S;
        const q=[[mx-ux*hl-uy*hw,my-uy*hl+ux*hw],[mx+ux*hl-uy*hw,my+uy*hl+ux*hw],[mx+ux*hl+uy*hw,my+uy*hl-ux*hw],[mx-ux*hl+uy*hw,my-uy*hl-ux*hw]];
        c.fus.setAttribute("points",q.map(p=>p[0].toFixed(1)+","+p[1].toFixed(1)).join(" "));
        c.fus.classList.toggle("fondu",!!fondu);
      }
    };
    this.contacts[spec.id]=c; return c;
  }

  /* ---------- liaisons mécaniques et organes de commande ---------- */
  lien(de,xFin,rep,sous){const p=this.ref(de);this.tirets([p,[xFin,p[1]]]);if(rep)this.rep(xFin-0.07,p[1],rep,sous,"fin");}
  poussoir(de,xFin,rep,sous){ // commande par poussée (CEI 60617 02-13-05) : crochet ouvert vers le contact
    const p=this.ref(de),y=p[1],d=p[0]>=xFin?0.11:-0.11;this.tirets([p,[xFin,y]]);
    this.trait([[xFin+d,y+0.16],[xFin,y+0.16],[xFin,y-0.16],[xFin+d,y-0.16]]);
    if(rep)this.rep(xFin-0.08,p[1],rep,sous,"fin");
  }
  coupDePoing(de,xFin,rep,sous){ // arrêt d'urgence vertical : tête « coup de poing » et accrochage
    const p=this.ref(de),y=p[1],S=this.S;this.tirets([p,[xFin,y]]);
    this.chemin(`M${this.X(xFin)} ${this.Y(y+0.2)} A${0.2*S} ${0.2*S} 0 0 0 ${this.X(xFin)} ${this.Y(y-0.2)} Z`);
    const m=(p[0]+xFin)/2;this.trait([[m-0.08,y+0.12],[m+0.04,y],[m-0.08,y-0.12]]);
    if(rep)this.rep(xFin-0.28,y,rep,sous,"fin");
  }
  lienTempo(de,dx,rep){ // deux traits parallèles terminés par un arc ouvert vers le contact
    const p=this.ref(de),x=p[0],y=p[1];
    this.trait([[x,y+0.055],[x-dx-0.1,y+0.055]]);this.trait([[x,y-0.055],[x-dx-0.1,y-0.055]]);
    const c=[x-dx+0.2,y],r=0.32,a1=140*Math.PI/180,a2=220*Math.PI/180;
    const p1=[c[0]+r*Math.cos(a1),c[1]+r*Math.sin(a1)],p2=[c[0]+r*Math.cos(a2),c[1]+r*Math.sin(a2)];
    this.chemin(`M${this.X(p1[0])} ${this.Y(p1[1])} A${r*this.S} ${r*this.S} 0 0 0 ${this.X(p2[0])} ${this.Y(p2[1])}`);
    if(rep)this.rep(x-dx-0.18,y,rep,null,"fin");
  }
  lienTherm(de,dx,rep){ // liaison terminée par le crochet de commande thermique
    const p=this.ref(de),x=p[0]-dx,y=p[1];
    this.trait([p,[x,y]]);
    this.trait([[x-0.13,y+0.23],[x-0.13,y+0.17],[x,y+0.17],[x,y-0.17],[x-0.13,y-0.17],[x-0.13,y-0.23]]);
    if(rep)this.rep(x-0.2,y,rep,null,"fin");
  }
  lienMT(de,rep,sous){ // déclenchement magnéto-thermique : créneau thermique + case « I > »
    const p=this.ref(de),x=p[0],y=p[1];
    this.tirets([[x,y],[x-0.25,y]]);
    this.trait([[x-0.25,y],[x-0.33,y],[x-0.33,y+0.17],[x-0.57,y+0.17],[x-0.57,y],[x-0.65,y]]);
    this.tirets([[x-0.65,y],[x-0.8,y]]);
    el("rect",{x:this.X(x-1.26),y:this.Y(y+0.15),width:0.46*this.S,height:0.3*this.S,class:"symb"},this.gSymb);
    this.texte(x-1.03,y,"I >","born gras","milieu");
    this.tirets([[x-1.26,y],[x-1.41,y]]);
    if(rep)this.rep(x-1.48,y,rep,sous,"fin");
  }
  verrou(a,b){
    const p=this.ref(a),q=this.ref(b);this.tirets([p,q]);
    const m=[(p[0]+q[0])/2,(p[1]+q[1])/2];
    el("polygon",{points:this.pts([[m[0]-0.13,m[1]+0.11],[m[0]+0.13,m[1]+0.11],[m[0],m[1]-0.11]]),class:"symb plein-fond"},this.gSymb);
  }
  cadenas(x,y){
    el("rect",{x:this.X(x-0.13),y:this.Y(y+0.08),width:0.26*this.S,height:0.2*this.S,class:"symb"},this.gSymb);
    this.chemin(`M${this.X(x-0.08)} ${this.Y(y+0.08)}v${-0.06*this.S}a${0.08*this.S} ${0.08*this.S} 0 0 1 ${0.16*this.S} 0v${0.06*this.S}`);
  }
  terre(x,y){this.chemin(`M${this.X(x-0.2)} ${this.Y(y)}H${this.X(x+0.2)}M${this.X(x-0.13)} ${this.Y(y-0.08)}H${this.X(x+0.13)}M${this.X(x-0.06)} ${this.Y(y-0.16)}H${this.X(x+0.06)}`);}
  borne(x,y,lab,cote){
    el("circle",{cx:this.X(x),cy:this.Y(y),r:3.4,class:"borne"},this.gTxt);
    if(lab){if(cote==="g")this.texte(x-0.1,y,lab,"petit","fin");else if(cote==="h")this.texte(x,y+0.2,lab,"petit","milieu");else this.texte(x+0.1,y+0.15,lab,"petit");}
  }
  fleche(x1,x2,y,lab){ // pointe d'arrivée d'alimentation (le conducteur est un fil)
    el("polygon",{points:this.pts([[x2,y],[x2-0.2,y+0.08],[x2-0.2,y-0.08]]),class:"symb plein"},this.gSymb);
    if(lab)this.texte(x1-0.08,y,lab,"petit","fin");
  }
  point(x,y){el("circle",{cx:this.X(x),cy:this.Y(y),r:3.6,class:"plein"},this.gSymb);}
  au(x,y){ // commande « coup de poing » à accrochage d'un arrêt d'urgence horizontal placé en (x,y)
    this.tirets([[x+0.56,y+0.17],[x+0.56,y-0.55]]);
    this.chemin(`M${this.X(x+0.36)} ${this.Y(y-0.55)} A${0.2*this.S} ${0.2*this.S} 0 0 0 ${this.X(x+0.76)} ${this.Y(y-0.55)} Z`);
    this.trait([[x+0.45,y-0.28],[x+0.56,y-0.2],[x+0.67,y-0.28]]);
    this.rep(x+0.56,y-0.98,"AU","arrêt d'urgence","milieu");
  }
  cadre(x1,y1,x2,y2){el("rect",{x:this.X(x1),y:this.Y(y1),width:(x2-x1)*this.S,height:(y1-y2)*this.S,class:"symb"},this.gSymb);}
  /* élément thermique de puissance (le conducteur forme un créneau) */
  thermique(net,x,y){this.fil(net,[[x,y],[x,y-0.1],[x+0.42,y-0.1],[x+0.42,y-0.46],[x,y-0.46],[x,y-0.56]]);}

  /* ---------- récepteurs (état affiché) ---------- */
  bobine(id,x,y,a,b,lab){
    this.fil(a,[[x,y],[x,y-0.3]]);this.fil(b,[[x,y-0.9],[x,y-1.2]]);
    const r=el("rect",{x:this.X(x-0.42),y:this.Y(y-0.3),width:0.84*this.S,height:0.6*this.S,class:"bobine"},this.gSymb);
    this.texte(x,y-0.6,lab,"rep rep-bob","milieu");
    this.texte(x+0.06,y-0.15,"A1","born");this.texte(x+0.06,y-1.05,"A2","born");
    const t=this.texte(x+0.5,y-0.6,"","tempo");
    this.charges[id]={type:"bobine",e:r,tempo:t};
  }
  voyant(id,x,y,a,b,lab,teinte){
    this.fil(a,[[x,y],[x,y-0.35]]);this.fil(b,[[x,y-0.85],[x,y-1.2]]);
    const cx=this.X(x),cy=this.Y(y-0.6),r=0.25*this.S;
    const halo=el("circle",{cx,cy,r:r*1.75,class:"halo"},this.gSymb);
    const c=el("circle",{cx,cy,r,class:"voyant"},this.gSymb);
    const k=r*0.707;
    el("path",{d:`M${cx-k} ${cy-k}L${cx+k} ${cy+k}M${cx-k} ${cy+k}L${cx+k} ${cy-k}`,class:"symb"},this.gSymb);
    this.rep(x+0.32,y-0.6,lab,null);
    this.texte(x+0.06,y-0.15,"X1","born");this.texte(x+0.06,y-1.05,"X2","born");
    this.charges[id]={type:"voyant",e:c,halo,teinte:teinte||"vert"};
  }
  /* dipôle de longueur 1,2 cm, vertical vers le bas (orient « v ») ou horizontal vers la droite (« h »).
     type : R (résistance), L (bobinage), V, A, Ω, MΩ, W (appareils de mesure), G~ / G= (générateur) */
  dipole(type,x,y,a,b,rep,sous,orient){
    const h=orient==="h",P=(t,n)=>h?[x+t,y+n]:[x+n,y-t],S=this.S;
    const mes=/^(V|A|Ω|MΩ|W|G~|G=)$/.test(type),l=mes?0.3:type==="L"?0.2:/^D/.test(type)?0.4:0.25;
    this.fil(a,[P(0,0),P(l,0)]);this.fil(b,[P(1.2-l,0),P(1.2,0)]);
    if(type==="R"){const p=P(0.25,-0.12),q=P(0.95,0.12);this.cadre(Math.min(p[0],q[0]),Math.max(p[1],q[1]),Math.max(p[0],q[0]),Math.min(p[1],q[1]));}
    else if(type==="L"){
      let d="M"+this.X(P(0.2,0)[0])+" "+this.Y(P(0.2,0)[1]);
      for(let i=0;i<4;i++){const e=P(0.4+0.2*i,0);d+=` A${0.1*S} ${0.1*S} 0 0 ${h?1:0} ${this.X(e[0])} ${this.Y(e[1])}`;}
      this.chemin(d);
    } else if(/^D/.test(type)){ // diode : « D » anode au début, « D- » cathode au début
      const [b,t]=type==="D"?[0.4,0.8]:[0.8,0.4];
      el("polygon",{points:this.pts([P(b,-0.18),P(b,0.18),P(t,0)]),class:"symb plein"},this.gSymb);
      this.trait([P(t,-0.18),P(t,0.18)]);
    } else if(mes){
      const c=P(0.6,0);el("circle",{cx:this.X(c[0]),cy:this.Y(c[1]),r:0.3*S,class:"symb plein-fond"},this.gSymb);
      this.texte(c[0],c[1],type==="G~"?"~":type==="G="?"=":type,type.length>1&&!/^G/.test(type)?"rep rep-bob":"rep","milieu");
    }
    if(rep){
      if(h){this.texte(x+0.6,y+(mes?0.5:0.35),rep,"rep","milieu");if(sous)this.texte(x+0.6,y-(mes?0.5:0.35),sous,"sous","milieu");}
      else this.rep(x-(mes?0.42:0.26),y-0.6,rep,sous,"fin");
    }
  }
  /* point de raccordement d'un appareil (borne repérée), suivi par le contrôle des schémas */
  raccord(x,y,net,lab,cote){this.borne(x,y,lab,cote);}
  boite(x1,y1,x2,y2,titre,sous){
    el("rect",{x:this.X(x1),y:this.Y(y1),width:(x2-x1)*this.S,height:(y1-y2)*this.S,class:"symb"},this.gSymb);
    if(titre)this.texte((x1+x2)/2,y1-0.28,titre,"gras","milieu");
    if(sous)this.texte((x1+x2)/2,y1-0.58,sous,"sous","milieu");
  }
  barrette(x1,y1,x2,y2){ // barrette de couplage d'une plaque à bornes
    const a=Math.min(x1,x2)-0.1,b=Math.max(x1,x2)+0.1,c=Math.max(y1,y2)+0.1,d=Math.min(y1,y2)-0.1;
    el("rect",{x:this.X(a),y:this.Y(c),width:(b-a)*this.S,height:(c-d)*this.S,rx:0.08*this.S,class:"plein"},this.gSymb);
  }
  fleche2(x1,y1,x2,y2){ // flèche (curseur de potentiomètre, sens d'un courant)
    this.trait([[x1,y1],[x2,y2]]);
    const a=Math.atan2(y2-y1,x2-x1),l=0.18,o=0.07;
    el("polygon",{points:this.pts([[x2,y2],[x2-l*Math.cos(a)+o*Math.sin(a),y2-l*Math.sin(a)-o*Math.cos(a)],[x2-l*Math.cos(a)-o*Math.sin(a),y2-l*Math.sin(a)+o*Math.cos(a)]]),class:"plein"},this.gSymb);
  }
  cercle(x,y,r,cls){return el("circle",{cx:this.X(x),cy:this.Y(y),r:r*this.S,class:cls||"symb"},this.gSymb);}
  losange(x,y,r){this.trait([[x,y+r],[x+r,y],[x,y-r],[x-r,y],[x,y+r]]);}
  fusible(x,y,a,b,rep){ // fusible en ligne (FU), bornes en (x,y) et (x,y-1,2)
    this.fil(a,[[x,y],[x,y-0.6]]);this.fil(b,[[x,y-0.6],[x,y-1.2]]);
    this.cadre(x-0.12,y-0.25,x+0.12,y-0.95);
    if(rep)this.rep(x-0.24,y-0.6,rep,null,"fin");
  }
  transfo(id,x,y){ // centre du primaire, secondaire 0,5 cm dessous
    const p=el("circle",{cx:this.X(x),cy:this.Y(y),r:0.35*this.S,class:"symb"},this.gSymb);
    const s=el("circle",{cx:this.X(x),cy:this.Y(y-0.5),r:0.35*this.S,class:"symb"},this.gSymb);
    this.charges[id]={type:"transfo",e:[p,s]};
  }
  moteur(x,y,r){
    const g=el("g",{class:"moteur"},this.gSymb);
    el("circle",{cx:this.X(x),cy:this.Y(y),r:r*this.S,class:"symb plein-fond"},g);
    const rot=el("g",{class:"rotor"},g);
    el("circle",{cx:this.X(x),cy:this.Y(y),r:r*0.74*this.S,class:"rotor-trait"},rot);
    const R=r*0.74*this.S,cx=this.X(x),cy=this.Y(y);
    el("polygon",{points:`${cx+R},${cy-7} ${cx+R+6},${cy+3} ${cx+R-6},${cy+3}`,class:"rotor-pointe"},rot);
    el("polygon",{points:`${cx-R},${cy+7} ${cx-R-6},${cy-3} ${cx-R+6},${cy-3}`,class:"rotor-pointe"},rot);
    this.texte(x,y+0.2,"M","rep rep-m","milieu");
    this.texte(x,y-0.25,"3~","rep rep-m2","milieu");
    const info=this.texte(x,y-r*0.66,"","info-moteur","milieu");
    this.moteurG={g,rot,info};
  }

  /* ---------- emplacement à compléter (Défis) ---------- */
  trou(x1,y1,x2,y2,lettre,vide){
    this.trous=this.trous||{};
    const r=el("rect",{x:this.X(x1),y:this.Y(y1),width:(x2-x1)*this.S,height:(y1-y2)*this.S,rx:8,class:"trou"+(vide?" vide":"")},this.gTxt);
    const cx=this.X(x1)+2,cy=this.Y(y1)+2;
    el("circle",{cx,cy,r:11,class:"trou-pastille"},this.gTxt);
    const t=el("text",{x:cx,y:cy,class:"trou-lettre","text-anchor":"middle","dominant-baseline":"central"},this.gTxt);t.textContent=lettre;
    if(vide){const q=el("text",{x:(this.X(x1)+this.X(x2))/2,y:(this.Y(y1)+this.Y(y2))/2,class:"trou-q","text-anchor":"middle","dominant-baseline":"central"},this.gTxt);q.textContent="?";}
    this.trous[lettre]=r; return r;
  }

  /* ---------- zone tactile ---------- */
  zone(x1,y1,x2,y2,label){
    return el("rect",{x:this.X(x1),y:this.Y(y1),width:(x2-x1)*this.S,height:(y1-y2)*this.S,rx:6,
      class:"zone",tabindex:0,role:"button","aria-label":label},this.gZones);
  }
}

/* Construit une feuille à partir de sa description (folio d'un schéma). */
function construire(svg,folio){
  const F=new Feuille(svg,folio.vue);
  (folio.fils||[]).forEach(f=>F.fil(f[0],f[1]));
  (folio.joncs||[]).forEach(j=>F.jonc(j[0],j[1],j[2]));
  (folio.contacts||[]).forEach(c=>F.contact(c));
  (folio.dessin||[]).forEach(cmd=>{
    const [nom,...args]=cmd;
    if(typeof F[nom]!=="function")throw new Error("Commande de dessin inconnue : "+nom);
    F[nom](...args);
  });
  return F;
}

window.ElecDessin={Feuille,construire,milieuLame,el,NS,ECHELLE};
})();
