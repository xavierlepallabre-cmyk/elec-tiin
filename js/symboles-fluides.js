/* Élec TIIN — imagier des symboles de fluidique (ISO 1219-1, repérage ISO 5599 / ISO 1219-2).
   Chaque symbole porte le numéro de la liste de production de l'enseignant (n).
   Dessins en SVG, mêmes classes que l'imagier électrique pour l'export SVG/PNG. */
(function(){
"use strict";
const NS="http://www.w3.org/2000/svg";
function el(tag,a,p){const e=document.createElementNS(NS,tag);for(const k in a)if(a[k]!==undefined)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
const P=l=>l.map(p=>p[0].toFixed(1)+","+p[1].toFixed(1)).join(" ");

/* ======================= primitives ======================= */
const L=(g,pts,cls)=>el("polyline",{points:P(pts),class:cls||"sf"},g);
const Pg=(g,pts,cls)=>el("polygon",{points:P(pts),class:cls||"sf"},g);
const R=(g,x,y,w,h,cls,rx)=>el("rect",{x,y,width:w,height:h,rx,class:cls||"sf"},g);
const C=(g,cx,cy,r,cls)=>el("circle",{cx,cy,r,class:cls||"sf"},g);
const Pa=(g,d,cls)=>el("path",{d,class:cls||"sf"},g);
function T(g,x,y,t,cls,anc){const e=el("text",{x,y,class:cls||"sf-t","text-anchor":anc||"middle","dominant-baseline":"central"},g);e.textContent=t;return e;}
/* pointe de flèche pleine en (x,y), orientée selon l'angle a (radians) */
function tete(g,x,y,a,s=6,plein=true){const b=a+Math.PI;
  Pg(g,[[x,y],[x+s*Math.cos(b+0.4),y+s*Math.sin(b+0.4)],[x+s*Math.cos(b-0.4),y+s*Math.sin(b-0.4)]],plein?"sf-plein":"sf fond");}
function fleche(g,x1,y1,x2,y2,s){L(g,[[x1,y1],[x2,y2]]);tete(g,x2,y2,Math.atan2(y2-y1,x2-x1),s||6);}
/* triangle d'énergie : plein = hydraulique, vide = pneumatique ; pointe vers dir */
function triangle(g,x,y,dir,plein,s=7){const a={h:-Math.PI/2,b:Math.PI/2,g:Math.PI,d:0}[dir];
  const p=[[x+s*Math.cos(a),y+s*Math.sin(a)],[x+s*Math.cos(a+2.3),y+s*Math.sin(a+2.3)],[x+s*Math.cos(a-2.3),y+s*Math.sin(a-2.3)]];
  Pg(g,p,plein?"sf-plein":"sf fond");}
/* flèche de réglage traversante */
function reglable(g,cx,cy,r){fleche(g,cx-r,cy+r,cx+r,cy-r,6);}
/* ressort horizontal (dir ±1) ou vertical */
function ressort(g,x,y,dir,len=20){const p=[[x,y]];for(let i=1;i<=6;i++)p.push([x+dir*len*i/7,y+(i%2?-5:5)]);p.push([x+dir*len,y]);L(g,p);}
function ressortV(g,x,y,dir,len=18){const p=[[x,y]];for(let i=1;i<=6;i++)p.push([x+(i%2?-5:5),y+dir*len*i/7]);p.push([x,y+dir*len]);L(g,p);}
function losange(g,cx,cy,r){Pg(g,[[cx,cy-r],[cx+r,cy],[cx,cy+r],[cx-r,cy]],"sf fond");}
function cadreMixte(g,x,y,w,h){R(g,x,y,w,h,"sf-cadre");}
function cadenas(g,x,y){R(g,x-6,y,12,10,"sf fond",1.5);Pa(g,`M${x-3.5} ${y} v-4 a3.5 3.5 0 0 1 7 0 v4`);}
/* clapet anti-retour : siège en V et bille ; sens de passage vers dir */
function clapet(g,x,y,dir="h",ressortOn=false){
  if(dir==="h"){C(g,x-3,y,5,"sf fond");L(g,[[x+4,y-8],[x-1,y],[x+4,y+8]]);if(ressortOn)ressort(g,x-8,y,-1,12);}
  else{C(g,x,y+3,5,"sf fond");L(g,[[x-8,y-4],[x,y+1],[x+8,y-4]]);if(ressortOn)ressortV(g,x,y+8,1,10);}
}
/* étrangleur (deux arcs) sur une conduite verticale */
function etrangleur(g,x,y,h=22){Pa(g,`M${x-6} ${y} Q${x-1} ${y+h/2} ${x-6} ${y+h}M${x+6} ${y} Q${x+1} ${y+h/2} ${x+6} ${y+h}`);}

/* ---------- distributeurs : cases et contenus ---------- */
const S=32; // côté d'une case
/* positions des orifices (fraction de la case) */
const PORTS={
  "2":{h:[0.5],b:[0.5]},
  "3":{h:[0.3],b:[0.3,0.7]},
  "4":{h:[0.3,0.7],b:[0.3,0.7]},
  "5":{h:[0.3,0.7],b:[0.18,0.5,0.82]}};
/* contenu d'une case : liste d'opérations sur orifices h0,h1,b0,b1,b2 */
function caseDistrib(g,x,y,typ,ops){
  R(g,x,y,S,S,"sf fond");
  const pos=k=>{const c=k[0],i=+k[1];return [x+S*PORTS[typ][c][i],c==="h"?y:y+S];};
  ops.forEach(o=>{
    if(o[0]==="f"){const a=pos(o[1]),b=pos(o[2]);const ya=a[1]===y?y+3:y+S-3,yb=b[1]===y?y+3:y+S-3;fleche(g,a[0],ya,b[0],yb,5);}
    else if(o[0]==="t"){const a=pos(o[1]);const dy=a[1]===y?1:-1;L(g,[[a[0],a[1]],[a[0],a[1]+dy*8]]);L(g,[[a[0]-4,a[1]+dy*8],[a[0]+4,a[1]+dy*8]]);}
    else if(o[0]==="l"){const pts=o.slice(1).map(k=>Array.isArray(k)?[x+S*k[0],y+S*k[1]]:pos(k));L(g,pts);}
    else if(o[0]==="j"){C(g,x+S*o[1],y+S*o[2],2.2,"sf-plein");}
  });
}
/* distributeur complet : cases (gauche→droite), case raccordée (indice), commandes, libellés d'orifices */
function distrib(g,x,y,{typ,cases,raccord,gauche,droite,labels}){
  cases.forEach((c,i)=>caseDistrib(g,x+i*S,y,typ,c));
  const xr=x+raccord*S;
  PORTS[typ].h.forEach((f,i)=>{L(g,[[xr+S*f,y],[xr+S*f,y-10]]);if(labels&&labels.h)T(g,xr+S*f,y-17,labels.h[i],"sf-t mini");});
  PORTS[typ].b.forEach((f,i)=>{L(g,[[xr+S*f,y+S],[xr+S*f,y+S+10]]);if(labels&&labels.b)T(g,xr+S*f,y+S+17,labels.b[i],"sf-t mini");});
  const pose=(lst,xe,sg)=>{const a=[].concat(lst),off=a.length===1?[0]:[-7,8];a.forEach((c,k)=>commande(g,xe,y+S/2+off[k],sg,c));};
  if(gauche)pose(gauche,x,-1);if(droite)pose(droite,x+cases.length*S,1);
}
/* commandes de distributeur, dessinées depuis le bord (x,y) vers l'extérieur (sens ±1) */
function commande(g,x,y,s,type){
  const X=d=>x+s*d;
  switch(type){
    case "manuel":L(g,[[x,y],[X(10),y]]);L(g,[[X(10),y-6],[X(10),y+6]]);break;
    case "bouton":L(g,[[x,y],[X(9),y]]);L(g,[[X(9),y-6],[X(9),y+6]]);Pa(g,`M${X(9)} ${y-6} A6 6 0 0 ${s>0?1:0} ${X(9)} ${y+6}`);break;
    case "levier":L(g,[[x,y],[X(9),y]]);L(g,[[X(9),y],[X(17),y-11]]);C(g,X(17),y-11,2,"sf-plein");break;
    case "levierCran":L(g,[[x,y],[X(9),y]]);L(g,[[X(9),y],[X(17),y-11]]);C(g,X(17),y-11,2,"sf-plein");
      R(g,s>0?x+1:x-17,y-21,16,5,"sf fond");L(g,[[X(5),y-21],[X(7),y-18],[X(9),y-21]]);L(g,[[X(11),y-21],[X(13),y-18],[X(15),y-21]]);break;
    case "pedale":L(g,[[x,y],[X(8),y]]);L(g,[[X(8),y-6],[X(8),y+6]]);L(g,[[X(8),y+6],[X(18),y-4]]);break;
    case "poussoir":L(g,[[x,y],[X(9),y]]);R(g,s>0?X(9):X(15),y-4,6,8,"sf fond");break;
    case "galet":L(g,[[x,y],[X(10),y]]);C(g,X(15),y,5,"sf fond");break;
    case "galetEsc":L(g,[[x,y],[X(8),y]]);L(g,[[X(8),y],[X(14),y-5]]);C(g,X(18),y-8,4.5,"sf fond");fleche(g,X(10),y-17,X(22),y-17,4);break;
    case "ressort":ressort(g,x,y,s,18);break;
    case "pilote":L(g,[[X(4),y],[X(18),y]],"sf-pil");triangle(g,X(4),y,s>0?"g":"d",false,5);break;
    case "piloteHyd":L(g,[[X(4),y],[X(18),y]],"sf-pil");triangle(g,X(4),y,s>0?"g":"d",true,5);break;
    case "electro":R(g,s>0?x:x-10,y-7,10,14,"sf fond");L(g,[[s>0?x:x-10,y+7],[s>0?x+10:x,y-7]]);break;
    case "electroPilote":R(g,s>0?x:x-9,y-7,9,14,"sf fond");triangle(g,X(4.5),y,s>0?"g":"d",false,3.5);
      R(g,s>0?X(9):X(19),y-7,10,14,"sf fond");L(g,[[s>0?X(9):X(19),y+7],[s>0?X(19):X(9),y-7]]);
      L(g,[[X(14),y-7],[X(14),y-14]]);L(g,[[X(10),y-14],[X(18),y-14]]);break;
    case "electroHyd":R(g,s>0?x:x-9,y-7,9,14,"sf fond");triangle(g,X(4.5),y,s>0?"g":"d",true,3.5);
      R(g,s>0?X(9):X(19),y-7,10,14,"sf fond");L(g,[[s>0?X(9):X(19),y+7],[s>0?X(19):X(9),y-7]]);break;
    case "cran":R(g,s>0?x:x-18,y-14,18,6,"sf fond");L(g,[[X(4),y-14],[X(6),y-10],[X(8),y-14]]);L(g,[[X(10),y-14],[X(12),y-10],[X(14),y-14]]);L(g,[[x,y],[X(9),y]]);L(g,[[X(9),y-6],[X(9),y+6]]);break;
  }
}

/* ---------- appareils réutilisés ---------- */
function rond(g,cx,cy,r=15){C(g,cx,cy,r,"sf fond");}
function pompe(g,cx,cy,{plein=true,variable=false,deux=false,moteur=false,arbre=true}={}){
  rond(g,cx,cy);const r=15;
  const tri=(dir)=>{const s=dir==="h"?-1:1,inv=moteur;const y0=cy+s*r;
    if(!inv)Pg(g,[[cx,y0],[cx-6,y0-s*9],[cx+6,y0-s*9]],plein?"sf-plein":"sf fond");
    else Pg(g,[[cx,y0-s*9],[cx-6,y0],[cx+6,y0]],plein?"sf-plein":"sf fond");};
  tri("h");if(deux)tri("b");
  if(variable)reglable(g,cx,cy,17);
  L(g,[[cx,cy-r],[cx,cy-r-12]]);if(!deux&&!moteur)L(g,[[cx,cy+r],[cx,cy+r+12]]);else L(g,[[cx,cy+r],[cx,cy+r+12]]);
  if(arbre){L(g,[[cx-r,cy-2],[cx-r-14,cy-2]]);L(g,[[cx-r,cy+2],[cx-r-14,cy+2]]);Pa(g,`M${cx-r-10} ${cy-8} a6 6 0 1 0 0 16`);tete(g,cx-r-10,cy+8,0,4);}
}
function moteurElec(g,cx,cy){rond(g,cx,cy,15);T(g,cx,cy+1,"M","sf-t gros");}
function verin(g,x,y,{w=80,h=26,tige=1,ressortOn=false,ports=2,course=0.45,amort=false,aimant=false,tandem=false,traversante=false}={}){
  R(g,x,y,w,h,"sf fond");
  const xp=x+6+course*(w-30);
  if(tandem){L(g,[[x+w/2,y],[x+w/2,y+h]]);R(g,x+w/2-18,y+2,5,h-4,"sf-plein");}
  R(g,xp,y+2,5,h-4,aimant?"sf-aimant":"sf-plein");
  if(tige){L(g,[[xp+5,y+h/2-3],[x+w+22,y+h/2-3]]);L(g,[[xp+5,y+h/2+3],[x+w+22,y+h/2+3]]);L(g,[[x+w+22,y+h/2-3],[x+w+22,y+h/2+3]]);}
  if(traversante){L(g,[[xp,y+h/2-3],[x-18,y+h/2-3]]);L(g,[[xp,y+h/2+3],[x-18,y+h/2+3]]);L(g,[[x-18,y+h/2-3],[x-18,y+h/2+3]]);}
  if(ressortOn){const p=[];const a=xp+6,b=x+w-2;for(let i=0;i<=8;i++)p.push([a+(b-a)*i/8,y+h/2+(i%8===0?0:(i%2?-h/2+5:h/2-5))]);L(g,p);}
  const pa=x+10,pb=x+w-10;
  if(ports>=1)L(g,[[pa,y+h],[pa,y+h+12]]);
  if(ports>=2)L(g,[[pb,y+h],[pb,y+h+12]]);
  if(amort){R(g,x+1,y+h/2-5,7,10,"sf fond");R(g,x+w-8,y+h/2-5,7,10,"sf fond");reglable(g,x+5,y-6,6);reglable(g,x+w-5,y-6,6);}
  return {xp};
}
function manometre(g,cx,cy){rond(g,cx,cy,12);fleche(g,cx-7,cy+7,cx+7,cy-7,5);L(g,[[cx,cy+12],[cx,cy+24]]);}
function reservoir(g,x,y,w=40,h=18){L(g,[[x,y],[x,y+h],[x+w,y+h],[x+w,y]]);}
/* valve de pression générique (case carrée), flèche décalée (NF) ou alignée (NO) */
function valvePression(g,x,y,{no=false,pilEntree=true,drain=false,ech=false}={}){
  const s=34;R(g,x,y,s,s,"sf fond");
  L(g,[[x-14,y+s/2],[x,y+s/2]]);L(g,[[x+s,y+s/2],[x+s+14,y+s/2]]);
  if(no)fleche(g,x+3,y+s/2,x+s-3,y+s/2,5);else fleche(g,x+4,y+s/2+9,x+s-4,y+s/2+9,5);
  ressortV(g,x+s/2,y,-1,14);reglable(g,x+s/2,y-8,9);
  const px=pilEntree?x-8:x+s+8;
  L(g,[[px,y+s/2],[px,y+s+10],[x+s/2,y+s+10],[x+s/2,y+s]],"sf-pil");
  if(drain)L(g,[[x+s-6,y],[x+s-6,y-12],[x+s+16,y-12]],"sf-drain");
  if(ech){L(g,[[x+s/2+8,y+s],[x+s/2+8,y+s+20]]);triangle(g,x+s/2+8,y+s+26,"b",false,5);}
}

/* ======================= catalogue ======================= */
const CATS=[
  {id:"base",nom:"Symboles de base"},
  {id:"air",nom:"Production et conditionnement de l'air"},
  {id:"huile",nom:"Production et conditionnement de l'huile"},
  {id:"mesure",nom:"Mesure et détection"},
  {id:"distrib",nom:"Distributeurs"},
  {id:"commande",nom:"Commandes des distributeurs"},
  {id:"clapet",nom:"Clapets et fonctions logiques"},
  {id:"pression",nom:"Valves de pression"},
  {id:"debit",nom:"Valves de débit"},
  {id:"action",nom:"Actionneurs et effecteurs"},
  {id:"capteur",nom:"Capteurs sur vérin"},
  {id:"consig",nom:"Vannes de consignation"}];
const Z=(n,id,nom,cat,corpus,fonction,vb,d)=>({n,id,nom,cat,corpus,fonction,vb,d});
const SYM=[
  /* ---- symboles de base ---- */
  Z(1,"conduite","Conduite de travail","base","Commun","Trait plein : conduite principale qui transporte l'énergie (pression ou retour).","0 0 140 50",g=>{L(g,[[15,25],[125,25]]);}),
  Z(2,"pilotage","Conduite de pilotage","base","Commun","Tirets longs : conduite de commande qui transmet un signal de pression à un appareil.","0 0 140 50",g=>{L(g,[[15,25],[125,25]],"sf-pil");}),
  Z(3,"drain","Conduite de fuite (drain)","base","HYD","Tirets courts : ramène au réservoir l'huile de fuite interne d'un appareil (orifice L ou Y).","0 0 140 50",g=>{L(g,[[15,25],[125,25]],"sf-drain");}),
  Z(4,"jonction","Jonction et croisement","base","Commun","À gauche, deux conduites raccordées (point de jonction). À droite, deux conduites qui se croisent sans être raccordées.","0 0 150 80",g=>{L(g,[[10,40],[65,40]]);L(g,[[37,12],[37,40]]);C(g,37,40,3,"sf-plein");L(g,[[85,40],[140,40]]);L(g,[[112,12],[112,68]]);}),
  Z(5,"flexible","Conduite flexible","base","Commun","Arc entre deux raccords : flexible qui relie des éléments mobiles. À inspecter régulièrement (marquage, date, état).","0 0 140 60",g=>{L(g,[[10,40],[30,40]]);Pa(g,"M30 40 Q70 0 110 40");L(g,[[110,40],[130,40]]);C(g,30,40,2.5,"sf-plein");C(g,110,40,2.5,"sf-plein");}),
  Z(6,"raccordRapide","Raccord rapide (sans et avec clapet)","base","Commun","À gauche, raccord rapide accouplé sans clapet. À droite, avec clapets : chaque moitié se ferme seule quand on désaccouple, sans perte de fluide.","0 0 160 60",g=>{
    L(g,[[8,30],[30,30]]);L(g,[[30,22],[30,38]]);L(g,[[36,22],[36,38]]);L(g,[[36,30],[60,30]]);L(g,[[26,22],[30,22]]);L(g,[[26,38],[30,38]]);L(g,[[36,22],[40,22]]);L(g,[[36,38],[40,38]]);
    L(g,[[80,30],[100,30]]);L(g,[[110,22],[110,38]]);L(g,[[116,22],[116,38]]);L(g,[[126,30],[152,30]]);clapet(g,103,30,"h");Pg(g,[[123,30],[119,25],[119,35]],"sf fond");C(g,122,30,4,"sf fond");}),
  Z(7,"bouchon","Orifice obturé (bouchon)","base","Commun","Orifice fermé par un bouchon : il n'est pas utilisé dans ce montage.","0 0 140 60",g=>{L(g,[[20,30],[90,30]]);L(g,[[90,20],[90,40]]);}),
  Z(8,"priseMesure","Prise de pression (point de mesure)","base","Commun","Point où l'on raccorde un manomètre de contrôle, souvent par un raccord rapide à clapet (Minimess).","0 0 140 70",g=>{L(g,[[15,45],[125,45]]);L(g,[[70,45],[70,25]]);C(g,70,18,7,"sf fond");L(g,[[65,13],[75,23]]);L(g,[[75,13],[65,23]]);}),
  Z(9,"echappement","Échappement direct","base","PNEU","Triangle vide : l'air est rejeté directement à l'atmosphère, sans raccord.","0 0 140 70",g=>{L(g,[[70,12],[70,40]]);triangle(g,70,50,"b",false,9);}),
  Z(10,"silencieux","Silencieux d'échappement","base","PNEU","Réduit le bruit de l'air rejeté à l'échappement. Encrassé, il freine l'échappement et ralentit le vérin.","0 0 140 80",g=>{L(g,[[70,10],[70,34]]);R(g,58,34,24,30,"sf fond");for(let i=0;i<4;i++)L(g,[[58,40+i*6],[82,46+i*6]]);}),
  Z(11,"sourcePneu","Source de pression pneumatique","base","PNEU","Cercle et triangle vide : arrivée d'air comprimé du réseau.","0 0 140 70",g=>{C(g,70,35,14,"sf fond");triangle(g,70,35,"h",false,8);L(g,[[84,35],[125,35]]);}),
  Z(12,"sourceHyd","Source de pression hydraulique","base","HYD","Cercle et triangle plein : alimentation en huile sous pression (centrale).","0 0 140 70",g=>{C(g,70,35,14,"sf fond");triangle(g,70,35,"h",true,8);L(g,[[84,35],[125,35]]);}),
  Z(13,"reservoir","Réservoir à l'air libre","base","HYD","À gauche, retour au-dessus du niveau d'huile ; à droite, retour sous le niveau (pas d'émulsion, pas d'aspiration d'air).","0 0 160 80",g=>{reservoir(g,15,40,50,22);L(g,[[40,10],[40,40]]);reservoir(g,95,40,50,22);L(g,[[120,10],[120,58]]);}),
  Z(14,"moteurElec","Moteur électrique","base","Commun","Entraîne la pompe ou le compresseur. Sa consignation électrique précède celle des énergies fluides.","0 0 140 70",g=>{moteurElec(g,70,35);L(g,[[85,33],[115,33]]);L(g,[[85,37],[115,37]]);}),
  /* ---- air ---- */
  Z(15,"compresseur","Compresseur à cylindrée fixe","air","PNEU","Transforme l'énergie mécanique en air comprimé. Triangle vide tourné vers l'extérieur : il refoule de l'air.","0 0 140 90",g=>{pompe(g,85,50,{plein:false});}),
  Z(16,"reservoirAir","Réservoir d'air (tampon)","air","PNEU","Stocke l'air comprimé, régule la pression et refroidit l'air ; les condensats s'y accumulent et se purgent par le bas.","0 0 160 70",g=>{L(g,[[10,35],[30,35]]);R(g,30,20,100,30,"sf fond",15);L(g,[[130,35],[150,35]]);}),
  Z(17,"refroidisseur","Refroidisseur (après-refroidisseur)","air","Commun","Abaisse la température de l'air ou de l'huile. Flèches vers l'extérieur : la chaleur est évacuée.","0 0 140 90",g=>{L(g,[[15,45],[50,45]]);losange(g,70,45,20);L(g,[[90,45],[125,45]]);L(g,[[70,25],[70,65]]);triangle(g,70,18,"h",true,5);triangle(g,70,72,"b",true,5);}),
  Z(18,"secheurFrigo","Sécheur frigorifique","air","PNEU","Refroidit l'air vers +3 °C pour condenser l'eau, purgée automatiquement. Dessin simplifié.","0 0 140 90",g=>{L(g,[[15,45],[50,45]]);losange(g,70,45,20);L(g,[[90,45],[125,45]]);L(g,[[52,45],[88,45]]);triangle(g,70,56,"b",true,5);L(g,[[70,65],[70,80]]);T(g,104,20,"*","sf-t gros");}),
  Z(19,"secheurAds","Sécheur par adsorption","air","PNEU","Un dessiccant retient la vapeur d'eau : air très sec (point de rosée négatif). Dessin simplifié.","0 0 140 90",g=>{L(g,[[15,45],[50,45]]);losange(g,70,45,20);L(g,[[90,45],[125,45]]);L(g,[[52,45],[88,45]]);for(let i=0;i<3;i++)C(g,62+i*8,53,1.6,"sf-plein");}),
  Z(20,"filtre","Filtre simple","air","Commun","L'élément filtrant (tirets) retient les particules solides.","0 0 140 90",g=>{L(g,[[15,45],[50,45]]);losange(g,70,45,20);L(g,[[90,45],[125,45]]);L(g,[[70,25],[70,65]],"sf-pil");}),
  Z(21,"filtrePurgeMan","Filtre avec purge manuelle","air","PNEU","Filtre et séparateur d'eau ; le technicien purge les condensats à la main.","0 0 140 100",g=>{L(g,[[15,40],[50,40]]);losange(g,70,40,20);L(g,[[90,40],[125,40]]);L(g,[[70,20],[70,52]],"sf-pil");L(g,[[58,52],[82,52]]);L(g,[[70,60],[70,74]]);commande(g,70,74,1,"manuel");triangle(g,70,82,"b",false,5);}),
  Z(22,"filtrePurgeAuto","Filtre avec purge automatique","air","PNEU","Un flotteur ouvre la purge dès que les condensats atteignent un niveau.","0 0 140 100",g=>{L(g,[[15,40],[50,40]]);losange(g,70,40,20);L(g,[[90,40],[125,40]]);L(g,[[70,20],[70,52]],"sf-pil");L(g,[[58,52],[82,52]]);C(g,70,56,3,"sf fond");L(g,[[70,60],[70,76]]);triangle(g,70,82,"b",false,5);}),
  Z(23,"purgeur","Purgeur de condensats automatique","air","PNEU","Placé au point bas du réseau ou sous le réservoir : évacue l'eau condensée sans intervention.","0 0 140 100",g=>{L(g,[[70,8],[70,20]]);losange(g,70,40,20);L(g,[[58,46],[82,46]]);C(g,70,52,3,"sf fond");L(g,[[70,60],[70,76]]);triangle(g,70,82,"b",false,5);}),
  Z(24,"coalescent","Filtre coalescent / séparateur d'huile","air","PNEU","Retient les fines gouttelettes d'huile et d'eau (air de qualité instrument). Purge automatique.","0 0 140 100",g=>{L(g,[[15,40],[50,40]]);losange(g,70,40,20);L(g,[[90,40],[125,40]]);L(g,[[64,24],[64,54]],"sf-pil");L(g,[[76,24],[76,54]],"sf-pil");C(g,70,54,3,"sf fond");L(g,[[70,60],[70,76]]);triangle(g,70,82,"b",false,5);}),
  Z(25,"regulSans","Mano-régulateur sans échappement","air","PNEU","Abaisse et stabilise la pression de sortie. Sans orifice d'échappement : la pression aval ne baisse pas si on desserre.","0 0 150 100",g=>{valvePression(g,58,40,{no:true,pilEntree:false});}),
  Z(26,"regulAvec","Mano-régulateur avec échappement","air","PNEU","Avec échappement (relieving) : si la pression aval dépasse le réglage, l'excédent part à l'échappement.","0 0 150 110",g=>{valvePression(g,58,34,{no:true,pilEntree:false,ech:true});}),
  Z(27,"lubrificateur","Lubrificateur","air","PNEU","Ajoute un brouillard d'huile à l'air pour les appareils qui en ont besoin. Beaucoup de composants modernes fonctionnent sans.","0 0 140 90",g=>{L(g,[[15,45],[50,45]]);losange(g,70,45,20);L(g,[[90,45],[125,45]]);L(g,[[70,25],[70,65]]);Pg(g,[[70,52],[66,58],[74,58]],"sf-plein");}),
  Z(28,"frlDetail","Unité FRL : symbole détaillé","air","PNEU","Filtre, régulateur avec manomètre, lubrificateur : l'air est préparé à l'entrée de la machine.","0 0 230 110",g=>{
    cadreMixte(g,8,14,214,86);L(g,[[0,60],[20,60]]);losange(g,38,60,17);L(g,[[38,43],[38,77]],"sf-pil");L(g,[[55,60],[82,60]]);
    R(g,82,47,28,28,"sf fond");fleche(g,85,61,107,61,5);ressortV(g,96,47,-1,12);reglable(g,96,40,7);L(g,[[110,60],[150,60]]);L(g,[[128,60],[128,75],[96,75]],"sf-pil");
    manometre(g,128,32);L(g,[[128,44],[128,60]]);losange(g,170,60,17);L(g,[[170,43],[170,77]]);Pg(g,[[170,64],[167,69],[173,69]],"sf-plein");L(g,[[187,60],[230,60]]);}),
  Z(29,"frlSimple","Unité FRL : symbole simplifié","air","PNEU","Représentation compacte de l'ensemble filtre, régulateur, lubrificateur.","0 0 150 90",g=>{L(g,[[10,45],[45,45]]);R(g,45,20,60,50,"sf fond");L(g,[[105,45],[140,45]]);losange(g,62,45,10);L(g,[[62,35],[62,55]],"sf-pil");fleche(g,82,60,82,30,5);Pg(g,[[94,43],[91,48],[97,48]],"sf-plein");}),
  Z(30,"vanne32","Vanne de sectionnement 3/2 cadenassable","air","PNEU","Coupe l'arrivée d'air ET met le circuit aval à l'échappement : c'est l'appareil de consignation pneumatique.","0 0 160 110",g=>{
    distrib(g,50,40,{typ:"3",cases:[[["f","b0","h0"],["t","b1"]],[["f","h0","b1"],["t","b0"]]],raccord:1,gauche:"levier",droite:"ressort",labels:{h:["2"],b:["1","3"]}});
    triangle(g,50+S+S*0.7,40+S+16,"b",false,5);cadenas(g,22,64);}),
  Z(31,"demarreurProg","Démarreur progressif","air","PNEU","Remplit lentement le circuit à la mise en service, puis s'ouvre en grand : évite les mouvements brusques des vérins.","0 0 170 110",g=>{
    cadreMixte(g,20,14,130,86);L(g,[[0,72],[50,72]]);R(g,50,58,28,28,"sf fond");fleche(g,53,72,75,72,4);
    L(g,[[78,72],[170,72]]);L(g,[[50,72],[40,72],[40,30],[110,30],[110,72]]);etrangleur(g,75,19,22);
    R(g,96,40,28,24,"sf fond");L(g,[[100,52],[120,52]]);L(g,[[124,52],[134,52]],"sf-pil");}),
  /* ---- huile ---- */
  Z(32,"pompeFixe","Pompe à cylindrée fixe, un sens","huile","HYD","Transforme l'énergie mécanique en débit d'huile ; le débit est fixé par la vitesse de rotation.","0 0 140 90",g=>{pompe(g,85,50);}),
  Z(33,"pompeVar","Pompe à cylindrée variable","huile","HYD","La cylindrée se règle (flèche) : le débit varie sans changer de vitesse de rotation.","0 0 140 90",g=>{pompe(g,85,50,{variable:true});}),
  Z(34,"pompeMoteur","Pompe / moteur réversible","huile","HYD","Peut fonctionner en pompe ou en moteur, dans les deux sens de débit.","0 0 140 100",g=>{pompe(g,85,50,{deux:true});}),
  Z(35,"motopompe","Groupe motopompe","huile","HYD","Moteur électrique et pompe accouplés : le cœur de la centrale hydraulique.","0 0 170 90",g=>{moteurElec(g,40,50);L(g,[[55,48],[95,48]]);L(g,[[55,52],[95,52]]);pompe(g,110,50,{arbre:false});}),
  Z(36,"crepine","Crépine d'aspiration","huile","HYD","Filtre grossier immergé à l'entrée d'aspiration de la pompe, sous le niveau d'huile.","0 0 140 100",g=>{reservoir(g,40,40,60,40);L(g,[[70,8],[70,52]]);losange(g,70,64,11);L(g,[[70,53],[70,75]],"sf-pil");}),
  Z(37,"filtreColmat","Filtre avec indicateur de colmatage","huile","HYD","Un indicateur signale l'encrassement de l'élément : on le remplace avant qu'il ne bloque.","0 0 150 100",g=>{L(g,[[10,50],[50,50]]);losange(g,70,50,20);L(g,[[70,30],[70,70]],"sf-pil");L(g,[[90,50],[140,50]]);C(g,115,25,9,"sf fond");fleche(g,110,30,120,20,4);L(g,[[115,34],[115,50]]);}),
  Z(38,"filtreBypass","Filtre avec clapet de dérivation","huile","HYD","Si le filtre se colmate, le clapet by-pass s'ouvre : l'huile passe non filtrée, mais le circuit est protégé.","0 0 150 110",g=>{L(g,[[10,60],[50,60]]);losange(g,75,60,20);L(g,[[75,40],[75,80]],"sf-pil");L(g,[[95,60],[140,60]]);L(g,[[35,60],[35,22],[115,22],[115,60]]);clapet(g,75,22,"h",true);}),
  Z(39,"echangeur","Refroidisseur / échangeur","huile","HYD","Évacue la chaleur de l'huile (eau ou air) : une huile trop chaude perd sa viscosité et use le circuit.","0 0 140 90",g=>{L(g,[[15,45],[50,45]]);losange(g,70,45,20);L(g,[[90,45],[125,45]]);L(g,[[70,25],[70,65]]);triangle(g,70,18,"h",true,5);triangle(g,70,72,"b",true,5);}),
  Z(40,"rechauffeur","Réchauffeur","huile","HYD","Chauffe l'huile au démarrage par temps froid. Flèches vers l'intérieur : apport de chaleur.","0 0 140 90",g=>{L(g,[[15,45],[50,45]]);losange(g,70,45,20);L(g,[[90,45],[125,45]]);L(g,[[70,8],[70,82]]);triangle(g,70,16,"b",true,5);triangle(g,70,74,"h",true,5);}),
  Z(41,"niveau","Indicateur de niveau","huile","HYD","Permet de contrôler le niveau d'huile dans le réservoir sans l'ouvrir.","0 0 140 100",g=>{reservoir(g,30,30,70,50);L(g,[[34,52],[96,52]],"sf-drain");R(g,108,36,12,40,"sf fond");L(g,[[100,44],[108,44]]);L(g,[[100,72],[108,72]]);L(g,[[110,52],[118,52]]);}),
  Z(42,"reniflard","Reniflard (bouchon filtre à air)","huile","HYD","Laisse respirer le réservoir quand le niveau varie, en filtrant l'air entrant.","0 0 140 100",g=>{reservoir(g,30,50,80,40);L(g,[[70,50],[70,38]]);losange(g,70,26,11);L(g,[[70,15],[70,37]],"sf-pil");}),
  Z(43,"accumulateur","Accumulateur à vessie","huile","HYD","Stocke de l'énergie hydraulique grâce à un gaz (azote) comprimé dans une vessie. Il reste sous pression moteur arrêté : à décharger avant toute intervention.","0 0 140 110",g=>{R(g,52,14,36,64,"sf fond",18);L(g,[[52,46],[88,46]]);Pg(g,[[70,40],[65,30],[75,30]],"sf-plein");L(g,[[70,78],[70,100]]);}),
  Z(44,"blocSecu","Bloc de sécurité d'accumulateur","huile","HYD","Regroupe la vanne d'isolement (cadenassable), la vanne de décharge vers le réservoir et un limiteur de pression : indispensable pour consigner un accumulateur.","0 0 220 150",g=>{
    cadreMixte(g,30,10,170,126);R(g,170,20,24,42,"sf fond",12);L(g,[[170,40],[194,40]]);L(g,[[182,62],[182,74]]);
    L(g,[[0,74],[95,74]]);R(g,95,62,24,24,"sf fond");fleche(g,98,74,116,74,4);L(g,[[119,74],[182,74]]);commande(g,107,62,-1,"levier");cadenas(g,107,40);
    L(g,[[60,74],[60,76]]);distrib(g,45,86,{typ:"2",cases:[[["t","b0"],["t","h0"]]],raccord:0,gauche:"manuel"});reservoir(g,48,128,24,8);
    L(g,[[150,74],[150,92]]);R(g,140,92,20,20,"sf fond");fleche(g,143,106,157,106,4);ressortV(g,150,92,-1,8);L(g,[[150,112],[150,126]]);reservoir(g,138,126,24,6);}),
  /* ---- mesure ---- */
  Z(45,"manometre","Manomètre","mesure","Commun","Mesure la pression relative en un point du circuit. Avant une intervention, il doit indiquer 0.","0 0 140 80",g=>{rond(g,70,30,14);fleche(g,62,38,78,22,5);L(g,[[70,44],[70,70]]);}),
  Z(46,"manoDiff","Manomètre différentiel","mesure","Commun","Mesure l'écart de pression entre deux points, par exemple de part et d'autre d'un filtre pour suivre son colmatage.","0 0 140 90",g=>{rond(g,70,34,14);fleche(g,62,42,78,26,5);L(g,[[60,44],[50,60],[50,80]]);L(g,[[80,44],[90,60],[90,80]]);}),
  Z(47,"pressostat","Pressostat","mesure","Commun","Ouvre ou ferme un contact électrique quand la pression atteint le seuil réglé.","0 0 150 100",g=>{R(g,50,30,34,34,"sf fond");L(g,[[67,64],[67,90]],"sf-pil");ressortV(g,67,30,-1,12);reglable(g,67,22,8);L(g,[[56,47],[66,47]]);L(g,[[66,47],[76,40]]);L(g,[[76,47],[84,47]]);L(g,[[84,47],[110,47]]);L(g,[[110,47],[110,40]]);L(g,[[110,40],[122,40]]);}),
  Z(48,"debitmetre","Débitmètre","mesure","Commun","Mesure le débit traversant la conduite (débit qui fixe la vitesse des actionneurs).","0 0 140 80",g=>{L(g,[[15,40],[56,40]]);rond(g,70,40,14);L(g,[[84,40],[125,40]]);L(g,[[70,28],[70,52]]);Pg(g,[[70,30],[66,38],[74,38]],"sf-plein");}),
  Z(49,"thermometre","Thermomètre","mesure","HYD","Mesure la température de l'huile (en service courant, autour de 40 à 60 °C).","0 0 140 80",g=>{rond(g,70,32,14);L(g,[[70,22],[70,38]]);C(g,70,40,3,"sf-plein");L(g,[[70,46],[70,70]]);}),
  /* ---- distributeurs ---- */
  Z(50,"d22","Distributeur 2/2 NF et NO","distrib","Commun","Deux orifices, deux positions : il ouvre ou ferme le passage. NF : fermé au repos ; NO : ouvert au repos.","0 0 200 90",g=>{
    distrib(g,24,30,{typ:"2",cases:[[["f","b0","h0"]],[["t","b0"],["t","h0"]]],raccord:1,gauche:"bouton",droite:"ressort"});T(g,54,80,"NF","sf-t mini");
    distrib(g,124,30,{typ:"2",cases:[[["t","b0"],["t","h0"]],[["f","b0","h0"]]],raccord:1,gauche:"bouton",droite:"ressort"});T(g,154,80,"NO","sf-t mini");}),
  Z(51,"d32","Distributeur 3/2 NF et NO","distrib","PNEU","Trois orifices (1 alimentation, 2 utilisation, 3 échappement), deux positions. Commande un vérin simple effet.","0 0 220 104",g=>{
    distrib(g,24,34,{typ:"3",cases:[[["f","b0","h0"],["t","b1"]],[["f","h0","b1"],["t","b0"]]],raccord:1,gauche:"bouton",droite:"ressort",labels:{h:["2"],b:["1","3"]}});T(g,40,92,"NF","sf-t mini");
    distrib(g,134,34,{typ:"3",cases:[[["f","h0","b1"],["t","b0"]],[["f","b0","h0"],["t","b1"]]],raccord:1,gauche:"bouton",droite:"ressort",labels:{h:["2"],b:["1","3"]}});T(g,150,92,"NO","sf-t mini");}),
  Z(52,"d52m","Distributeur 5/2 monostable","distrib","PNEU","Commande un vérin double effet. Monostable : il revient en position repos (ressort) dès que la commande cesse.","0 0 170 100",g=>{
    distrib(g,40,34,{typ:"5",cases:[[["f","b1","h0"],["f","h1","b2"],["t","b0"]],[["f","b1","h1"],["f","h0","b0"],["t","b2"]]],raccord:1,gauche:"pilote",droite:"ressort",labels:{h:["4","2"],b:["5","1","3"]}});T(g,30,24,"14","sf-t mini");}),
  Z(53,"d52b","Distributeur 5/2 bistable","distrib","PNEU","Deux pilotages (14 et 12), pas de ressort : il garde sa dernière position, c'est l'effet mémoire.","0 0 170 100",g=>{
    distrib(g,40,34,{typ:"5",cases:[[["f","b1","h0"],["f","h1","b2"],["t","b0"]],[["f","b1","h1"],["f","h0","b0"],["t","b2"]]],raccord:1,gauche:"pilote",droite:"pilote",labels:{h:["4","2"],b:["5","1","3"]}});T(g,30,24,"14","sf-t mini");T(g,110,24,"12","sf-t mini");}),
  Z(54,"d53f","Distributeur 5/3 centre fermé","distrib","PNEU","Position centrale : tous les orifices bloqués. Le vérin s'arrête et reste immobilisé (tant qu'il n'y a pas de fuite).","0 0 200 100",g=>{
    distrib(g,40,34,{typ:"5",cases:[[["f","b1","h0"],["f","h1","b2"],["t","b0"]],[["t","h0"],["t","h1"],["t","b0"],["t","b1"],["t","b2"]],[["f","b1","h1"],["f","h0","b0"],["t","b2"]]],raccord:1,gauche:["electro","ressort"],droite:["electro","ressort"],labels:{h:["4","2"],b:["5","1","3"]}});}),
  Z(55,"d53e","Distributeur 5/3 centre ouvert à l'échappement","distrib","PNEU","Position centrale : les deux chambres du vérin à l'échappement, l'alimentation bloquée. Le vérin est libre et sans pression.","0 0 200 100",g=>{
    distrib(g,40,34,{typ:"5",cases:[[["f","b1","h0"],["f","h1","b2"],["t","b0"]],[["f","h0","b0"],["f","h1","b2"],["t","b1"]],[["f","b1","h1"],["f","h0","b0"],["t","b2"]]],raccord:1,gauche:["electro","ressort"],droite:["electro","ressort"],labels:{h:["4","2"],b:["5","1","3"]}});}),
  Z(56,"d53p","Distributeur 5/3 centre sous pression","distrib","PNEU","Position centrale : les deux chambres alimentées, les échappements bloqués. Le vérin s'équilibre en pression.","0 0 200 100",g=>{
    distrib(g,40,34,{typ:"5",cases:[[["f","b1","h0"],["f","h1","b2"],["t","b0"]],[["f","b1","h0"],["f","b1","h1"],["t","b0"],["t","b2"]],[["f","b1","h1"],["f","h0","b0"],["t","b2"]]],raccord:1,gauche:["electro","ressort"],droite:["electro","ressort"],labels:{h:["4","2"],b:["5","1","3"]}});}),
  Z(57,"d32h","Distributeur 3/2 hydraulique","distrib","HYD","Orifices P (pression), A (utilisation), T (réservoir). Commande un vérin simple effet hydraulique.","0 0 160 100",g=>{
    distrib(g,40,34,{typ:"3",cases:[[["f","b0","h0"],["t","b1"]],[["f","h0","b1"],["t","b0"]]],raccord:1,gauche:"electro",droite:"ressort",labels:{h:["A"],b:["P","T"]}});}),
  Z(58,"d42h","Distributeur 4/2 hydraulique","distrib","HYD","Orifices P, T, A et B : commande un vérin double effet. En position repos, P alimente B et A retourne au réservoir.","0 0 160 100",g=>{
    distrib(g,40,34,{typ:"4",cases:[[["f","b0","h0"],["f","h1","b1"]],[["f","b0","h1"],["f","h0","b1"]]],raccord:1,gauche:"electro",droite:"ressort",labels:{h:["A","B"],b:["P","T"]}});}),
  Z(59,"d43f","Distributeur 4/3 centre fermé","distrib","HYD","Position centrale : P, T, A et B bloqués. Le vérin est immobilisé, la pompe débite sur le limiteur de pression.","0 0 200 100",g=>{
    distrib(g,40,34,{typ:"4",cases:[[["f","b0","h0"],["f","h1","b1"]],[["t","h0"],["t","h1"],["t","b0"],["t","b1"]],[["f","b0","h1"],["f","h0","b1"]]],raccord:1,gauche:["levier","ressort"],droite:"ressort",labels:{h:["A","B"],b:["P","T"]}});}),
  Z(60,"d43t","Distributeur 4/3 centre tandem","distrib","HYD","Position centrale : P relié à T (la pompe débite au réservoir sans pression), A et B bloqués. Économise l'énergie à l'arrêt.","0 0 200 100",g=>{
    distrib(g,40,34,{typ:"4",cases:[[["f","b0","h0"],["f","h1","b1"]],[["l","b0",[0.3,0.6],[0.7,0.6],"b1"],["t","h0"],["t","h1"]],[["f","b0","h1"],["f","h0","b1"]]],raccord:1,gauche:["electro","ressort"],droite:["electro","ressort"],labels:{h:["A","B"],b:["P","T"]}});}),
  Z(61,"d43o","Distributeur 4/3 centre ouvert","distrib","HYD","Position centrale : P, T, A et B reliés. La pompe débite au réservoir, le vérin est libre.","0 0 200 100",g=>{
    distrib(g,40,34,{typ:"4",cases:[[["f","b0","h0"],["f","h1","b1"]],[["l","h0",[0.3,0.5],"b0"],["l","h1",[0.7,0.5],"b1"],["l",[0.3,0.5],[0.7,0.5]],["j",0.3,0.5],["j",0.7,0.5]],[["f","b0","h1"],["f","h0","b1"]]],raccord:1,gauche:["electro","ressort"],droite:["electro","ressort"],labels:{h:["A","B"],b:["P","T"]}});}),
  Z(62,"d43fl","Distributeur 4/3 centre flottant","distrib","HYD","Position centrale : A et B reliés à T, P bloqué. Le vérin est libre de se déplacer sous un effort extérieur.","0 0 200 100",g=>{
    distrib(g,40,34,{typ:"4",cases:[[["f","b0","h0"],["f","h1","b1"]],[["l","h0",[0.3,0.45],[0.7,0.45],"b1"],["l","h1",[0.7,0.45]],["j",0.7,0.45],["t","b0"]],[["f","b0","h1"],["f","h0","b1"]]],raccord:1,gauche:["electro","ressort"],droite:["electro","ressort"],labels:{h:["A","B"],b:["P","T"]}});}),
  Z(63,"d43r","Distributeur 4/3 centre régénératif","distrib","HYD","Position centrale : P, A et B reliés, T bloqué. L'huile de la chambre annulaire rejoint la chambre arrière : sortie rapide du vérin.","0 0 200 100",g=>{
    distrib(g,40,34,{typ:"4",cases:[[["f","b0","h0"],["f","h1","b1"]],[["l","b0",[0.3,0.5],"h0"],["l",[0.3,0.5],[0.7,0.5],"h1"],["j",0.3,0.5],["t","b1"]],[["f","b0","h1"],["f","h0","b1"]]],raccord:1,gauche:["electro","ressort"],droite:["electro","ressort"],labels:{h:["A","B"],b:["P","T"]}});}),
  /* ---- commandes ---- */
  ...[["manuel",64,"Commande manuelle (général)","Symbole général d'une commande par l'opérateur, sans préciser l'organe.","Commun"],
      ["bouton",65,"Bouton-poussoir","Commande manuelle par appui ; le plus souvent avec rappel par ressort.","Commun"],
      ["levierDouble",66,"Levier (avec et sans crans)","Commande manuelle par levier. Avec crans (en haut) : le levier reste dans la position choisie.","Commun"],
      ["pedale",67,"Pédale","Commande au pied : libère les mains de l'opérateur.","PNEU"],
      ["poussoir",68,"Poussoir mécanique","Actionné par une came ou une pièce en mouvement : sert de fin de course.","PNEU"],
      ["galet",69,"Galet","Fin de course actionné par une came dans les deux sens de passage.","PNEU"],
      ["galetEsc",70,"Galet escamotable (unidirectionnel)","N'actionne le distributeur que dans un sens de passage de la came ; dans l'autre, il s'efface.","PNEU"],
      ["ressort",71,"Ressort de rappel / de centrage","Ramène le tiroir en position repos (ou au centre sur un 3 positions) quand la commande cesse.","Commun"],
      ["pilote",72,"Pilotage pneumatique direct","Le tiroir est déplacé par la pression d'un signal pneumatique (orifices 12 et 14).","PNEU"],
      ["electro",73,"Électro-aimant (bobine)","Commande électrique directe : la bobine déplace le tiroir. Repérée Y1, Y2…","Commun"],
      ["electroPilote",74,"Électropneumatique pilotée + commande manuelle auxiliaire","La bobine commande un petit étage pilote alimenté en air ; la commande manuelle auxiliaire permet de tester sans électricité.","PNEU"],
      ["electroHyd",75,"Pilotage hydraulique et électrohydraulique","Pour les gros distributeurs : un étage pilote (hydraulique, ou électrovanne pilote) déplace le tiroir principal.","HYD"],
      ["cran",76,"Verrouillage / crantage","Un cran (ou détente) maintient le tiroir dans la position atteinte.","Commun"]].map(([t,n,nom,f,corp])=>Z(n,"cmd-"+t,nom,"commande",corp,f,"0 0 150 80",g=>{
        R(g,70,25,30,30,"sf fond");
        if(t==="levierDouble"){commande(g,70,48,-1,"levier");commande(g,70,30,-1,"levierCran");}
        else if(t==="electroHyd"){commande(g,70,40,-1,"electroHyd");commande(g,100,40,1,"piloteHyd");}
        else commande(g,70,40,-1,t);})),
  /* ---- clapets ---- */
  Z(77,"clapet","Clapet anti-retour (sans et avec ressort)","clapet","Commun","Laisse passer le fluide dans un seul sens. Avec ressort, il faut une pression d'ouverture (tarage) pour qu'il s'ouvre.","0 0 160 80",g=>{L(g,[[10,40],[70,40]]);clapet(g,40,40,"h");L(g,[[90,40],[150,40]]);clapet(g,125,40,"h",true);}),
  Z(78,"clapetPilote","Clapet anti-retour piloté","clapet","HYD","Bloque le retour d'huile (maintien de charge) ; la pression de pilotage X l'ouvre pour autoriser la descente.","0 0 140 110",g=>{R(g,50,25,40,54,"sf-cadre");L(g,[[70,8],[70,98]]);clapet(g,70,52,"v");L(g,[[110,58],[78,58]],"sf-pil");T(g,118,58,"X","sf-t mini","start");}),
  Z(79,"doubleClapet","Double clapet anti-retour piloté","clapet","HYD","Deux clapets pilotés en croix : le vérin est verrouillé dans les deux sens et ne bouge que si l'on alimente l'une des chambres.","0 0 160 120",g=>{cadreMixte(g,20,26,120,62);L(g,[[50,8],[50,110]]);L(g,[[110,8],[110,110]]);clapet(g,50,58,"v");clapet(g,110,58,"v");L(g,[[50,96],[100,64]],"sf-pil");L(g,[[110,96],[60,64]],"sf-pil");}),
  Z(80,"ou","Sélecteur de circuit (fonction OU)","clapet","PNEU","La sortie est alimentée par l'une OU l'autre entrée ; la bille obture l'entrée non alimentée.","0 0 160 90",g=>{R(g,45,30,70,28,"sf fond");L(g,[[10,44],[45,44]]);L(g,[[115,44],[150,44]]);L(g,[[80,30],[80,10]]);C(g,80,46,6,"sf fond");L(g,[[52,36],[58,44],[52,52]]);L(g,[[108,36],[102,44],[108,52]]);T(g,20,64,"1","sf-t mini");T(g,140,64,"1","sf-t mini");T(g,90,10,"2","sf-t mini","start");}),
  Z(81,"et","Cellule ET (deux pressions)","clapet","PNEU","La sortie n'est alimentée que si les DEUX entrées sont sous pression : commande bimanuelle simple.","0 0 160 90",g=>{R(g,45,30,70,28,"sf fond");L(g,[[10,44],[45,44]]);L(g,[[115,44],[150,44]]);L(g,[[80,30],[80,10]]);R(g,66,38,28,12,"sf fond");L(g,[[52,38],[60,44],[52,50]]);L(g,[[108,38],[100,44],[108,50]]);}),
  Z(82,"echRapide","Soupape d'échappement rapide","clapet","PNEU","Montée près du vérin : l'air de la chambre s'échappe directement sur place, sans revenir au distributeur. Le vérin va plus vite.","0 0 150 110",g=>{R(g,45,34,60,30,"sf fond");L(g,[[10,49],[45,49]]);L(g,[[75,34],[75,10]]);C(g,75,52,6,"sf fond");L(g,[[75,64],[75,84]]);triangle(g,75,92,"b",false,6);}),
  Z(83,"bloqueur","Bloqueur","clapet","Commun","Distributeur 2/2 piloté placé sur l'orifice d'un vérin : sans pression de pilotage, il bloque le vérin en position.","0 0 160 90",g=>{distrib(g,50,28,{typ:"2",cases:[[["f","b0","h0"]],[["t","b0"],["t","h0"]]],raccord:1,gauche:"pilote",droite:"ressort"});}),
  /* ---- pression ---- */
  Z(84,"limiteur","Limiteur de pression (soupape de sûreté)","pression","Commun","Normalement fermé : s'ouvre vers le réservoir (ou l'atmosphère) quand la pression d'entrée dépasse le tarage du ressort. Protège le circuit.","0 0 150 110",g=>{valvePression(g,58,40,{no:false,pilEntree:true});}),
  Z(85,"limiteurPilote","Limiteur de pression piloté","pression","HYD","Pour les forts débits : un petit étage pilote taré commande l'ouverture de l'étage principal. Plus précis, moins de surpression.","0 0 180 120",g=>{cadreMixte(g,38,8,110,98);valvePression(g,62,48,{no:false,pilEntree:true,drain:true});R(g,112,18,22,18,"sf fond");fleche(g,115,30,131,30,4);ressortV(g,123,18,-1,7);}),
  Z(86,"reducteur","Réducteur de pression","pression","HYD","Normalement ouvert : maintient une pression aval plus basse et réglable, mesurée en sortie. Le drain évacue la fuite du pilotage.","0 0 150 110",g=>{valvePression(g,58,40,{no:true,pilEntree:false,drain:true});}),
  Z(87,"sequenceur","Séquenceur de pression","pression","HYD","S'ouvre vers un second circuit quand la pression amont atteint le tarage : « serrer d'abord, puis poinçonner ».","0 0 150 110",g=>{valvePression(g,58,40,{no:false,pilEntree:true,drain:true});T(g,118,100,"vers circuit 2","sf-t mini");}),
  Z(88,"contreBalance","Clapet de maintien (contre-balance)","pression","HYD","Retient une charge motrice : la descente ne se fait que sous une pression de pilotage ; le clapet en parallèle laisse remonter librement.","0 0 170 130",g=>{cadreMixte(g,28,12,124,110);valvePression(g,62,44,{no:false,pilEntree:true});L(g,[[48,61],[48,104],[110,104],[110,61]]);clapet(g,80,104,"h");}),
  /* ---- débit ---- */
  Z(89,"etrFixe","Étrangleur fixe","debit","Commun","Restriction fixe : le débit dépend de la différence de pression de part et d'autre.","0 0 140 90",g=>{L(g,[[70,8],[70,34]]);etrangleur(g,70,34,22);L(g,[[70,56],[70,82]]);}),
  Z(90,"etrReg","Étrangleur réglable","debit","Commun","Restriction réglable : règle la vitesse d'un actionneur, dans les deux sens de passage.","0 0 140 90",g=>{L(g,[[70,8],[70,34]]);etrangleur(g,70,34,22);L(g,[[70,56],[70,82]]);reglable(g,70,45,15);}),
  Z(91,"reducDebit","Réducteur de débit unidirectionnel","debit","Commun","Étrangleur réglable et clapet en parallèle : freine dans un sens, laisse passer librement dans l'autre. Monté à l'échappement du vérin.","0 0 150 100",g=>{R(g,40,16,70,68,"sf-cadre");L(g,[[60,4],[60,96]]);etrangleur(g,60,38,22);reglable(g,60,49,14);L(g,[[60,26],[90,26],[90,74],[60,74]]);clapet(g,90,50,"v");}),
  Z(92,"regulCompense","Régulateur de débit 2 voies compensé","debit","HYD","Maintient un débit constant même si la charge varie : la vitesse du vérin ne dépend plus de l'effort.","0 0 140 100",g=>{R(g,40,22,60,56,"sf fond");L(g,[[70,8],[70,22]]);L(g,[[70,78],[70,92]]);etrangleur(g,58,39,22);reglable(g,58,50,13);fleche(g,86,70,86,32,5);L(g,[[58,22],[58,39]]);L(g,[[58,61],[58,78]]);}),
  Z(93,"diviseur","Diviseur de débit","debit","HYD","Partage un débit d'entrée en deux débits égaux (ou dans un rapport fixé), pour synchroniser deux vérins.","0 0 150 100",g=>{R(g,30,26,90,44,"sf fond");L(g,[[75,70],[75,94]]);L(g,[[50,26],[50,6]]);L(g,[[100,26],[100,6]]);etrangleur(g,50,36,18);etrangleur(g,100,36,18);L(g,[[50,54],[50,60],[100,60],[100,54]]);L(g,[[75,60],[75,70]]);}),
  /* ---- actionneurs ---- */
  Z(94,"vseRessort","Vérin simple effet, rappel par ressort","action","Commun","Un seul orifice : la pression fait sortir la tige, le ressort la fait rentrer.","0 0 160 80",g=>{verin(g,30,20,{ressortOn:true,ports:1,course:0.1});}),
  Z(95,"vseCharge","Vérin simple effet, rappel par la charge","action","HYD","Un seul orifice ; c'est la charge (poids) qui fait rentrer la tige, par exemple un vérin de levage.","0 0 160 80",g=>{verin(g,30,20,{ports:1,course:0.4});Pg(g,[[150,30],[150,40],[138,35]],"sf fond");}),
  Z(96,"vde","Vérin double effet simple tige","action","Commun","Deux orifices : sortie et rentrée sous pression. La force en sortie est plus grande qu'en rentrée (surface de la tige).","0 0 160 80",g=>{verin(g,30,20,{});}),
  Z(97,"vdeTraversante","Vérin à tige traversante","action","Commun","Tige des deux côtés : mêmes surfaces, donc même force et même vitesse dans les deux sens.","0 0 170 80",g=>{verin(g,45,20,{traversante:true});}),
  Z(98,"vdeAmorti","Vérin double effet à amortissements réglables","action","Commun","Freine le piston en fin de course pour éviter les chocs ; l'amortissement se règle par vis.","0 0 160 90",g=>{verin(g,30,28,{amort:true});}),
  Z(99,"vdeAimant","Vérin à piston magnétique","action","PNEU","Un aimant sur le piston permet de détecter sa position à travers le tube (détecteurs ILS ou électroniques).","0 0 160 80",g=>{verin(g,30,20,{aimant:true});}),
  Z(100,"sansTige","Vérin sans tige","action","PNEU","Le chariot se déplace le long du tube : grande course pour un faible encombrement.","0 0 170 80",g=>{R(g,20,28,130,22,"sf fond");R(g,70,30,6,18,"sf-plein");R(g,58,14,30,10,"sf fond");L(g,[[73,24],[73,30]]);L(g,[[30,50],[30,64]]);L(g,[[140,50],[140,64]]);}),
  Z(101,"telescopique","Vérin télescopique","action","HYD","Plusieurs tiges emboîtées : très grande course pour un vérin court rentré (bennes basculantes).","0 0 170 80",g=>{R(g,20,20,70,34,"sf fond");R(g,40,25,64,24,"sf fond");R(g,60,30,74,14,"sf fond");L(g,[[134,37],[154,37]]);L(g,[[30,54],[30,68]]);}),
  Z(102,"tandem","Vérin tandem","action","HYD","Deux pistons sur une même tige : la force est presque doublée pour un même diamètre.","0 0 170 80",g=>{verin(g,30,20,{w:100,tandem:true});L(g,[[75,46],[75,58]]);L(g,[[90,46],[90,58]]);}),
  Z(103,"semiRotatif","Actionneur semi-rotatif","action","Commun","Produit une rotation limitée (90°, 180°…) : manœuvre de vannes quart de tour.","0 0 140 90",g=>{Pa(g,"M40 66 A30 30 0 0 1 100 66");Pa(g,"M48 66 A22 22 0 0 1 92 66");L(g,[[40,66],[48,66]]);L(g,[[92,66],[100,66]]);Pa(g,"M34 30 A40 40 0 0 1 106 30");tete(g,106,30,0.75,6);tete(g,34,30,2.39,6);L(g,[[52,66],[52,84]]);L(g,[[88,66],[88,84]]);}),
  Z(104,"moteurPneu","Moteur pneumatique un sens et deux sens","action","PNEU","Rotation continue entraînée par l'air. Triangles vides tournés vers l'intérieur : l'énergie entre dans l'appareil.","0 0 180 100",g=>{pompe(g,55,50,{plein:false,moteur:true,arbre:false});L(g,[[70,48],[85,48]]);L(g,[[70,52],[85,52]]);pompe(g,135,50,{plein:false,moteur:true,deux:true,arbre:false});L(g,[[150,48],[165,48]]);L(g,[[150,52],[165,52]]);}),
  Z(105,"moteurHyd","Moteur hydraulique fixe et variable","action","HYD","Rotation continue entraînée par l'huile (treuils, enrouleurs). À droite, cylindrée variable et deux sens.","0 0 180 100",g=>{pompe(g,55,50,{plein:true,moteur:true,arbre:false});L(g,[[70,48],[85,48]]);L(g,[[70,52],[85,52]]);pompe(g,135,50,{plein:true,moteur:true,deux:true,variable:true,arbre:false});L(g,[[150,48],[165,48]]);L(g,[[150,52],[165,52]]);}),
  Z(106,"multiplicateur","Multiplicateur de pression","action","Commun","Un grand piston pneumatique pousse un petit piston hydraulique : la pression est multipliée par le rapport des surfaces.","0 0 170 90",g=>{R(g,20,18,60,46,"sf fond");R(g,80,31,70,20,"sf fond");R(g,60,20,5,42,"sf-plein");L(g,[[65,38],[120,38]]);L(g,[[65,44],[120,44]]);R(g,118,33,5,16,"sf-plein");L(g,[[30,64],[30,78]]);L(g,[[140,51],[140,72]]);}),
  Z(107,"ventouse","Ventouse","action","PNEU","Saisit une pièce par le vide : la pression atmosphérique plaque la pièce contre la ventouse.","0 0 140 90",g=>{L(g,[[70,8],[70,40]]);Pa(g,"M48 62 Q70 34 92 62");L(g,[[44,64],[96,64]]);}),
  Z(108,"venturi","Générateur de vide (Venturi)","action","PNEU","L'air comprimé traverse une buse : la dépression créée aspire l'air de la ventouse. Pas de pièce mobile.","0 0 170 100",g=>{R(g,40,30,90,34,"sf fond");L(g,[[10,47],[40,47]]);L(g,[[130,47],[150,47]]);triangle(g,156,47,"d",false,6);Pa(g,"M60 38 L85 45 L110 38M60 56 L85 49 L110 56");L(g,[[85,30],[85,10]]);T(g,94,12,"vide","sf-t mini","start");}),
  /* ---- capteurs ---- */
  Z(109,"fcVerin","Fins de course repérés sur un vérin","capteur","PNEU","Les capteurs de position sont repérés sur le vérin : 1S1 tige rentrée, 1S2 tige sortie (ISO 1219-2).","0 0 190 100",g=>{verin(g,40,42,{course:0.05});L(g,[[50,40],[50,24]]);T(g,50,16,"1S1","sf-t mini");L(g,[[148,40],[148,24]]);T(g,148,16,"1S2","sf-t mini");T(g,90,92,"1A1","sf-t mini");}),
  Z(110,"ilsVerin","Détecteur magnétique (ILS) sur vérin","capteur","PNEU","Le détecteur, fixé sur le tube, change d'état quand l'aimant du piston passe devant lui.","0 0 190 100",g=>{verin(g,40,46,{aimant:true,course:0.05});losange(g,54,34,7);L(g,[[54,27],[54,14]]);T(g,64,14,"1S1","sf-t mini","start");}),
  Z(111,"capteurFuite","Capteur pneumatique à fuite / à seuil","capteur","PNEU","Un jet d'air s'échappe par une buse : quand un objet l'obstrue, la pression monte et un signal est émis.","0 0 160 100",g=>{L(g,[[20,50],[60,50]]);R(g,60,36,40,28,"sf fond");triangle(g,108,50,"d",false,6);L(g,[[80,64],[80,90]],"sf-pil");T(g,90,88,"signal","sf-t mini","start");Pg(g,[[66,46],[70,50],[66,54]],"sf");}),
  /* ---- consignation ---- */
  Z(112,"vanne22","Vanne d'isolement 2/2 cadenassable","consig","Commun","Isole un circuit ou un accumulateur ; cadenassée en position fermée lors de la consignation.","0 0 160 100",g=>{distrib(g,55,34,{typ:"2",cases:[[["f","b0","h0"]],[["t","b0"],["t","h0"]]],raccord:1,gauche:"levier",droite:"ressort"});cadenas(g,30,64);}),
  Z(113,"purge","Vanne de décharge / de purge","consig","Commun","Ouvre le circuit vers le réservoir ou l'atmosphère pour faire tomber la pression avant d'intervenir.","0 0 150 110",g=>{L(g,[[10,24],[76,24]]);L(g,[[76,24],[76,30]]);distrib(g,60,40,{typ:"2",cases:[[["t","b0"],["t","h0"]]],raccord:0,gauche:"manuel"});reservoir(g,63,90,24,8);L(g,[[75,80],[75,96]]);})
];

/* ---------- planches de repérage (n° 114 à 117) ---------- */
const PLANCHES=[
  {n:114,titre:"Repérage des orifices pneumatiques (ISO 5599 / ISO 11727)",lignes:[["1","Alimentation en pression"],["2, 4","Orifices d'utilisation (vers le vérin)"],["3, 5","Échappements"],["12","Pilotage qui relie 1 à 2"],["14","Pilotage qui relie 1 à 4"],["82, 84","Échappements des étages pilotes (associés à 12 et 14)"],["10","Signal de pilotage qui ferme le passage de l'orifice 1"]]},
  {n:115,titre:"Repérage des orifices hydrauliques",lignes:[["P","Pression (arrivée de la pompe)"],["T","Retour au réservoir (tank)"],["A, B","Orifices d'utilisation"],["X","Pilotage (pression de commande)"],["Y","Drain de pilotage"],["L","Fuite (drain de carter)"]]},
  {n:116,titre:"Repérage des composants (ISO 1219-2)",lignes:[["0P1, 0Z1…","Groupe 0 : production et conditionnement (pompe, FRL, sectionneur)"],["1A1","Actionneur 1 (vérin ou moteur)"],["1V1, 1V2…","Valves de la chaîne 1 (distributeur, réducteurs de débit)"],["1S1, 1S2","Capteurs de la chaîne 1 (fins de course)"],["1Z1","Autres composants de la chaîne 1 (filtre, accumulateur)"],["2A1…","Chaîne d'action suivante"]]},
  {n:117,titre:"Pneumatique et hydraulique : mêmes fonctions",lignes:[["Source","Triangle vide (air) / triangle plein (huile)"],["Retour","Échappement à l'atmosphère / retour au réservoir (T)"],["Orifices","1, 2, 3, 4, 5 / P, A, B, T"],["Pression usuelle","6 à 8 bar / 100 à 300 bar"],["Limiteur","Soupape de sûreté du réseau / limiteur de pression de la centrale"],["Maintien de position","Bloqueur, distributeur centre fermé / clapet piloté, double clapet"],["Consignation","Vanne 3/2 à mise à l'échappement / isolement + décharge de l'accumulateur"]]}];

/* ======================= interface ======================= */
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const melange=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const CORPUS={PNEU:"Pneumatique",HYD:"Hydraulique",Commun:"Commun"};
function dessiner(s,label){
  const svg=document.createElementNS(NS,"svg");svg.setAttribute("viewBox",s.vb);svg.setAttribute("class","sf-svg");
  svg.setAttribute("role","img");svg.setAttribute("aria-label",label||s.nom);
  const g=el("g",{},svg);s.d(g);return svg;
}
const onglets=actif=>`<div class="segment sy-onglets" role="group" aria-label="Familles de symboles"><a role="button" href="#/symboles" aria-pressed="${actif==="elec"}">Électriques</a><a role="button" href="#/symboles/fluides" aria-pressed="${actif==="fluides"}">Fluidiques</a></div>`;
function imagier(main){
  let cat="tous",corp="tous";
  main.innerHTML=`<div class="page-head"><div>
      <p class="tag"><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>Symboles</p>
      <h1>Symboles de fluidique</h1>
      <p class="lead">Les symboles normalisés de la pneumatique et de l'hydraulique (ISO 1219-1), avec la fonction de chaque appareil. Distributeurs dessinés en position repos raccordée.</p>
    </div><a class="btn btn-primary" href="#/symboles/fluides-jeu">Jouer : reconnaître les symboles</a></div>
    ${onglets("fluides")}
    <div class="filtres" role="group" aria-label="Énergie">${[["tous","Tout"],["PNEU","Pneumatique"],["HYD","Hydraulique"]].map(([v,t])=>`<button type="button" data-corp="${v}" aria-pressed="${v===corp}">${t}</button>`).join("")}</div>
    <div class="filtres" role="group" aria-label="Catégories">${[{id:"tous",nom:"Toutes les catégories"},...CATS,{id:"planches",nom:"Repérage"}].map(c=>`<button type="button" data-cat="${c.id}" aria-pressed="${c.id===cat}">${esc(c.nom)}</button>`).join("")}</div>
    <div class="sy-outils"><label class="option export-nb"><input type="checkbox" id="expNoir"> Exporter en noir et blanc (photocopie)</label>
      <button type="button" class="btn" id="imprimer">Imprimer l'aide-mémoire affiché</button></div>
    <div class="imagier" id="imagier"></div>
    <p class="astuce" style="margin-top:14px">Dessins réalisés d'après l'ISO 1219-1 ; quelques symboles d'appareils de conditionnement (sécheurs, démarreur progressif) sont simplifiés. Le numéro « n° » renvoie à la liste de production des supports du cours.</p>`;
  const zone=main.querySelector("#imagier");
  function remplir(){
    zone.innerHTML="";
    const liste=SYM.filter(s=>(cat==="tous"||s.cat===cat)&&(corp==="tous"||s.corpus===corp||s.corpus==="Commun"));
    if(cat==="tous"||cat==="planches")PLANCHES.filter(p=>corp==="tous"||(corp==="PNEU"?p.n!==115:p.n!==114)).forEach(p=>{
      const a=document.createElement("article");a.className="fiche sy-planche";
      a.innerHTML=`<div class="txt"><div class="ligne"><h3>${esc(p.titre)}</h3><span class="sy-n">n° ${p.n}</span></div>
        <table class="sy-table"><tbody>${p.lignes.map(([k,v])=>`<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</tbody></table></div>`;
      if(cat==="planches")zone.appendChild(a);else zone.__planches=(zone.__planches||[]).concat(a);
    });
    if(cat==="planches"){return;}
    liste.forEach(s=>{
      const a=document.createElement("article");a.className="fiche";
      a.innerHTML=`<div class="dessin"></div><div class="txt"><div class="ligne"><h3>${esc(s.nom)}</h3><span class="repere">${esc(CORPUS[s.corpus])}</span></div>
        <p>${esc(s.fonction)}</p><span class="sy-n">n° ${s.n}</span>
        <div class="exp-sym" role="group" aria-label="Exporter ${esc(s.nom)}"><span>Exporter</span><button type="button" class="btn" data-fmt="svg">SVG</button><button type="button" class="btn" data-fmt="png">PNG</button></div></div>`;
      const svg=dessiner(s);a.querySelector(".dessin").appendChild(svg);
      a.querySelectorAll("[data-fmt]").forEach(b=>b.addEventListener("click",async()=>{
        const X=window.ElecExport,noir=main.querySelector("#expNoir").checked;
        const nom="fluide-"+String(s.n).padStart(3,"0")+"-"+X.slug(s.nom)+(noir?"-nb":"");
        const ok=await X.exporter(()=>({svg}),b.dataset.fmt,nom,{noir,titre:s.nom,description:"Symbole ISO 1219-1"},b);
        if(!ok)b.closest(".exp-sym").querySelector("span").textContent="Échec, essaie l'autre format";
      }));
      zone.appendChild(a);
    });
    (zone.__planches||[]).forEach(a=>zone.appendChild(a));zone.__planches=null;
  }
  main.querySelectorAll("[data-cat]").forEach(b=>b.onclick=()=>{cat=b.dataset.cat;main.querySelectorAll("[data-cat]").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));remplir();});
  main.querySelectorAll("[data-corp]").forEach(b=>b.onclick=()=>{corp=b.dataset.corp;main.querySelectorAll("[data-corp]").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));remplir();});
  main.querySelector("#imprimer").onclick=()=>window.print();
  remplir();
  return ()=>{};
}
function jeu(main){
  const total=10;let n=0,bons=0;const serie=melange(SYM).slice(0,total);
  function question(){
    const s=serie[n];
    const proches=melange(SYM.filter(x=>x.cat===s.cat&&x.id!==s.id)).slice(0,2),autres=melange(SYM.filter(x=>x.cat!==s.cat)).slice(0,3-proches.length);
    const options=melange([s,...proches,...autres]);
    main.innerHTML=`<a class="retour" href="#/symboles/fluides">← Imagier fluidique</a>
      <div class="jeu"><div class="progression"><span>Question ${n+1} sur ${total}</span><span class="barre"><i style="width:${n/total*100}%"></i></span></div>
      <div class="question"><div class="dessin"></div><div class="corps"><h2>Quel est ce symbole ?</h2>
        <div class="choix">${options.map(o=>`<button type="button" data-id="${o.id}">${esc(o.nom)}</button>`).join("")}</div>
        <div class="retour-jeu" hidden aria-live="polite"></div>
        <button type="button" class="btn btn-primary suite" hidden>${n+1<total?"Question suivante":"Voir le bilan"}</button></div></div></div>`;
    main.querySelector(".dessin").appendChild(dessiner(s,"Symbole à reconnaître"));
    const fb=main.querySelector(".retour-jeu"),suite=main.querySelector(".suite");
    main.querySelectorAll(".choix button").forEach(b=>b.onclick=()=>{
      const ok=b.dataset.id===s.id;if(ok)bons++;
      main.querySelectorAll(".choix button").forEach(x=>{x.disabled=true;if(x.dataset.id===s.id)x.classList.add("juste");});
      if(!ok)b.classList.add("faux");
      fb.hidden=false;fb.className="retour-jeu "+(ok?"juste":"faux");fb.innerHTML=`<b>${ok?"Exact.":"Ce n'est pas ça."}</b> ${esc(s.nom)} : ${esc(s.fonction)}`;
      suite.hidden=false;suite.focus();});
    suite.onclick=()=>{n++;n<total?question():bilan();};
  }
  function bilan(){
    main.innerHTML=`<a class="retour" href="#/symboles/fluides">← Imagier fluidique</a><div class="jeu"><div class="bilan"><h2>${bons} bonne${bons>1?"s":""} réponse${bons>1?"s":""} sur ${total}</h2>
      <p class="lead">Ce résultat n'est pas enregistré.</p><div class="actions"><button type="button" class="btn btn-primary" id="rejouer">Nouvelle série</button><a class="btn" href="#/symboles/fluides">Revoir l'imagier</a></div></div></div>`;
    main.querySelector("#rejouer").onclick=()=>{n=0;bons=0;serie.splice(0,serie.length,...melange(SYM).slice(0,total));question();};
  }
  question();return ()=>{};
}

window.ElecSymbolesFluides={imagier,jeu,dessiner,SYM,CATS,PLANCHES,onglets};
})();
