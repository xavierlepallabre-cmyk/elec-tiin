/* Élec TIIN — schémas des cours, ELE04 (EL-032 à EL-042) : moteurs asynchrones. */
(function(){
"use strict";
const {NO,NF,appli}=window.COURS_OUTILS;

/* plaque à bornes : rangée basse U1 V1 W1 en (x, y), rangée haute W2 U2 V2 en (x, y+1) ; pas de 1 cm.
   nets (facultatif) : {U1:"net",...} pour raccorder des conducteurs (contrôle des schémas) */
const POS={U1:[0,0],V1:[1,0],W1:[2,0],W2:[0,1],U2:[1,1],V2:[2,1]};
function bornier(x,y,opt){
  opt=opt||{};const d=[["boite",x-0.5,y+1.5,x+2.5,y-0.5]];
  if(opt.enroulements!==false){
    d.push(["trait",[[x,y],[x+1,y+1]]],["trait",[[x+1,y],[x+2,y+1]]],["tirets",[[x+2,y],[x,y+1]]]);
  }
  for(const [k,[dx,dy]] of Object.entries(POS)){
    const net=opt.nets&&opt.nets[k];
    d.push(net?["raccord",x+dx,y+dy,net,k,"h"]:["borne",x+dx,y+dy,k,"h"]);
  }
  return d;
}

/* ---------- EL-032 : moteur à cage, stator, rotor, bornier ---------- */
const cage=[];
for(let i=0;i<12;i++){const a=i*Math.PI/6;cage.push(["cercle",+(0.62*Math.cos(a)).toFixed(3),+(0.62*Math.sin(a)).toFixed(3),0.07,"symb plein-fond"]);}
const bob=[];
[["U",90],["V",210],["W",330]].forEach(([n,deg])=>{
  const a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a),r1=1.2,r2=1.5,w=0.28;
  const p=(r,t)=>[+(r*c-t*s).toFixed(3),+(r*s+t*c).toFixed(3)];
  bob.push(["trait",[p(r1,-w),p(r2,-w),p(r2,w),p(r1,w),p(r1,-w)]]);
  const q=p(1.78,0);bob.push(["texte",q[0],q[1],n,"gras","milieu"]);
});
const el032={id:"EL-032",titre:"Moteur asynchrone triphasé à cage : stator, rotor, plaque à bornes",controle:false,
  folio:{vue:[-2.6,2.6,7.4,-2.8],
    dessin:[["cercle",0,0,1.9],["cercle",0,0,1.1],["cercle",0,0,0.8],...cage,["cercle",0,0,0.18,"plein"],...bob,
      ["texte",-2.4,2.3,"Coupe simplifiée","gras"],
      ["texte",0,-2.2,"stator : carcasse et enroulements U, V, W","note","milieu"],
      ["texte",0,-2.5,"rotor à cage : barres en court-circuit, entrefer, arbre","note","milieu"],
      ["texte",3.6,2.3,"Plaque à bornes","gras"],
      ...bornier(4.4,0),
      ["texte",5.4,-1.0,"enroulement U : U1 – U2","note","milieu"],["texte",5.4,-1.3,"enroulement V : V1 – V2","note","milieu"],
      ["texte",5.4,-1.6,"enroulement W : W1 – W2 (en tirets)","note","milieu"]]}
};

/* ---------- EL-033 : couplages étoile et triangle, barrettes ---------- */
function plaque(x,mode){
  const d=bornier(x,0);
  ["L1","L2","L3"].forEach((l,i)=>d.push(["trait",[[x+i,-0.95],[x+i,0]]],["texte",x+i,-1.15,l,"petit","milieu"]));
  if(mode==="Y")d.push(["barrette",x,1,x+2,1]);
  else d.push(["barrette",x,0,x,1],["barrette",x+1,0,x+1,1],["barrette",x+2,0,x+2,1]);
  d.push(["texte",x+1,2.0,mode==="Y"?"Couplage étoile (Y)":"Couplage triangle (Δ)","gras","milieu"]);
  d.push(["texte",x+1,-1.55,mode==="Y"?"une barrette relie W2, U2, V2":"trois barrettes : W2-U1, U2-V1, V2-W1","note","milieu"]);
  return d;
}
const el033={id:"EL-033",titre:"Couplage étoile et triangle : barrettes de la plaque à bornes",controle:false,
  folio:{vue:[-1.0,2.35,7.6,-1.85],dessin:[...plaque(0,"Y"),...plaque(4.6,"D")]}};

/* ---------- EL-034 : plaque signalétique et choix du couplage ---------- */
const lignes=["MOT. 3 ~   50 Hz","1,5 kW   cos φ 0,82","1425 tr/min","Δ 230 V   5,9 A","Y 400 V   3,4 A","IP 55   classe F"];
const el034={id:"EL-034",titre:"Lecture de la plaque signalétique et choix du couplage",controle:false,
  folio:{vue:[-0.4,3.4,9.8,-2.2],dessin:[
    ["boite",0,3.0,4.0,-0.2,"Plaque signalétique"],
    ...lignes.map((t,i)=>["texte",0.3,2.3-i*0.42,t,"rep rep-bob"]),
    ["texte",4.6,2.7,"Réseau 3 × 400 V","gras"],
    ["texte",4.6,2.3,"Chaque enroulement supporte 230 V :","note"],
    ["texte",4.6,2.0,"en étoile, il reçoit 400 / √3 ≈ 230 V.","note"],
    ["texte",4.6,1.7,"→ couplage étoile, courant de ligne 3,4 A.","note"],
    ...bornier(5.6,-0.7),["barrette",5.6,0.3,7.6,0.3],
    ["texte",4.6,-1.55,"Sur un réseau 3 × 230 V, le même moteur","note"],["texte",4.6,-1.85,"se couple en triangle (5,9 A).","note"]]}
};

/* ---------- EL-035 : démarrage direct, puissance avec protections ---------- */
const X3=[0,0.8,1.6];
const el035={id:"EL-035",titre:"Démarrage direct : schéma de puissance avec protections",
  folio:{vue:[-2.8,0.75,4.6,-7.3],
    libres:X3.map(x=>[x,0.1]),
    fils:[...X3.map((x,i)=>["L"+(i+1),[[x,0.1],[x,-0.2]]]),...X3.map((x,i)=>["q"+(i+1),[[x,-1.6],[x,-2.0]]]),
      ...X3.map((x,i)=>["k"+(i+1),[[x,-3.2],[x,-3.5]]]),["k1",[[0,-4.06],[0,-5.3]]],["k2",[[0.8,-4.06],[0.8,-4.9]]],["k3",[[1.6,-4.06],[1.6,-5.3]]]],
    contacts:X3.map((x,i)=>({id:"QS"+(i+1),app:"QS",type:"sectfus",x,y:-0.2,haut:"L"+(i+1),bas:"q"+(i+1),b:[String(2*i+1),String(2*i+2)],bpos:"p"}))
      .concat(X3.map((x,i)=>({id:"K"+(i+1),app:"KM1",type:"kmp",x,y:-2.0,haut:"q"+(i+1),bas:"k"+(i+1),b:[String(2*i+1),String(2*i+2)],bpos:"p"}))),
    dessin:[["texte",0,0.35,"L1","petit","milieu"],["texte",0.8,0.35,"L2","petit","milieu"],["texte",1.6,0.35,"L3","petit","milieu"],
      ["tirets",[[-0.2,-0.915],[1.4,-0.915]]],["tirets",[[-0.2,-0.915],[-0.9,-0.915]]],["trait",[[-0.9,-0.75],[-0.9,-1.08]]],
      ["rep",-1.0,-0.915,"QS","fusibles aM","fin"],
      ["tirets",[[-0.16,-2.58],[1.44,-2.58]]],["tirets",[[-0.16,-2.58],[-0.6,-2.58]]],["rep",-0.68,-2.58,"KM1",null,"fin"],
      ...X3.map(x=>["thermique","k"+(1+X3.indexOf(x)),x,-3.5]),["cadre",-0.2,-3.42,2.15,-4.14],["rep",2.3,-3.78,"F1","relais thermique"],
      ["borne",0,-4.6,"U"],["borne",0.8,-4.6,"V"],["borne",1.6,-4.6,"W"],["moteur",0.8,-5.9,1.0],
      ["trait",[[-0.75,-4.67],[-0.75,-5.9],[-0.2,-5.9]]],["trait",[[-0.75,-5.9],[-0.75,-6.25]]],["terre",-0.75,-6.25],["point",-0.75,-5.9],
      ["borne",-0.75,-4.6,"PE","g"],["rep",-1.0,-6.7,"M1",null,"fin"]]},
  logique:null
};

/* ---------- EL-036, EL-037 : étoile-triangle de l'Atelier ---------- */
const el036=Object.assign({id:"EL-036",titre:"Démarrage étoile-triangle : puissance"},
  appli("etoile-triangle",0,[[-0.5,0],[9.8,0],[-0.5,-0.35],[9.8,-0.35],[-0.5,-0.7],[9.8,-0.7]]));
const el037=Object.assign({id:"EL-037",titre:"Démarrage étoile-triangle : commande temporisée et verrouillage"},
  appli("etoile-triangle",1,[[-4.4,0],[-4.4,-11.4]]));
const el037e=Object.assign({id:"EL-037-etats",titre:"Démarrage étoile-triangle : séquence",colonnes:3,
  legende:"Trait épais : conducteur relié à la phase L. Bobine grisée : alimentée."},appli("etoile-triangle",1,[[-4.4,0],[-4.4,-11.4]]),{
  etats:[
    {titre:"1. Marche appuyé : étoile",actions:[["appuyer","S2",true],["appuyer","S2",false]],attendu:{bKM1:true,bKM2:true,bKM3:false}},
    {titre:"2. Après la temporisation : triangle",actions:[["attendre",5]],attendu:{bKM1:false,bKM2:true,bKM3:true}},
    {titre:"3. Arrêt",actions:[["appuyer","S1",true],["appuyer","S1",false]],attendu:{bKM1:false,bKM2:false,bKM3:false}}
  ]});

/* ---------- EL-038 : moteur à rotor bobiné ---------- */
const PH=[0,1.8,3.6],RL=[0.6,1.4,2.2];
const el038={id:"EL-038",titre:"Moteur à rotor bobiné : bagues, balais et résistances rotoriques",
  folio:{vue:[-1.7,3.65,5.6,-5.0],
    libres:RL.map(x=>[x,3.0]),
    fils:[...RL.map((x,i)=>["L"+(i+1),[[x,3.0],[x,2.7]]]),["s1",[[0.6,1.5],[0.6,0.6]]],["s2",[[1.4,1.5],[1.4,1.0]]],["s3",[[2.2,1.5],[2.2,0.6]]],
      ["r1",[[0.6,-0.6],[0.6,-1.5],[0,-1.5],[0,-2.6]]],["r2",[[1.4,-1.0],[1.4,-1.5],[1.8,-1.5],[1.8,-2.6]]],["r3",[[2.2,-0.6],[2.2,-1.5],[3.6,-1.5],[3.6,-2.6]]],
      ...PH.map((x,i)=>["r"+(i+1),[[x,-2.3],[x+0.6,-2.3],[x+0.6,-2.6]]]),
      ...PH.map(x=>["pt",[[x,-3.8],[x,-4.1]]]),...PH.map(x=>["pt",[[x+0.6,-3.8],[x+0.6,-4.1]]]),["pt",[[0,-4.1],[4.2,-4.1]]]],
    joncs:[...PH.map((x,i)=>["r"+(i+1),x,-2.3]),["pt",0.6,-4.1],["pt",1.8,-4.1],["pt",2.4,-4.1],["pt",3.6,-4.1]],
    contacts:[...RL.map((x,i)=>({id:"K1"+i,app:"KM1",type:"kmp",x,y:2.7,haut:"L"+(i+1),bas:"s"+(i+1),b:[String(2*i+1),String(2*i+2)],bpos:"p"})),
      ...PH.map((x,i)=>({id:"K2"+i,app:"KM2",type:"kmp",x:x+0.6,y:-2.6,haut:"r"+(i+1),bas:"pt"}))],
    dessin:[["texte",0.6,3.25,"L1","petit","milieu"],["texte",1.4,3.25,"L2","petit","milieu"],["texte",2.2,3.25,"L3","petit","milieu"],
      ["tirets",[[0.44,2.12],[2.04,2.12]]],["tirets",[[0.44,2.12],[0,2.12]]],["rep",-0.08,2.12,"KM1","ligne","fin"],
      ["moteur",1.4,0,1.0],["cercle",1.4,0,0.72],
      ["borne",0.6,-1.05,"K","g"],["borne",1.4,-1.25,"L","g"],["borne",2.2,-1.05,"M"],
      ["texte",2.7,-0.55,"bagues et balais","sous"],["rep",0.1,0.3,"M1",null,"fin"],
      ...PH.map((x,i)=>["dipole","R",x,-2.6,"r"+(i+1),"pt",null,null,"v"]),
      ...PH.map(x=>["texte",x+0.9,-3.2,"KM2","gras"]),
      ["texte",2.1,-4.5,"résistances rotoriques, court-circuitées par KM2 en fin de démarrage","note","milieu"]]},
  logique:null
};

/* ---------- EL-039 : contrôle des enroulements hors tension (ohmmètre) ---------- */
const el039={id:"EL-039",titre:"Contrôle des enroulements hors tension à l'ohmmètre",
  folio:{vue:[-1.4,2.6,5.4,-2.3],
    fils:[["m2",[[3.6,1.6],[3.6,2.0],[1,2.0],[1,1]]],["m1",[[3.6,0.4],[3.6,-0.9],[0,-0.9],[0,0]]]],
    dessin:[...bornier(0,0,{nets:{U1:"m1",U2:"m2"}}),
      ["dipole","Ω",3.6,1.6,"m2","m1",null,null,"v"],["texte",4.0,1.0,"ohmmètre","sous"],
      ["texte",1.6,-1.35,"Moteur consigné, barrettes retirées.","note","milieu"],
      ["texte",1.6,-1.65,"Mesurer U1-U2, V1-V2, W1-W2 :","note","milieu"],
      ["texte",1.6,-1.95,"les trois valeurs doivent être voisines.","note","milieu"]]},
  logique:null
};

/* ---------- EL-040 : mesure d'isolement d'un moteur (représentation pédagogique) ---------- */
const el040={id:"EL-040",titre:"Mesure d'isolement d'un moteur : représentation pédagogique",
  folio:{vue:[-2.2,2.6,5.6,-2.6],
    fils:[["m2",[[3.6,1.6],[3.6,2.0],[1,2.0],[1,1]]],["m1",[[3.6,0.4],[3.6,-0.9],[-1.2,-0.9],[-1.2,0.3]]]],
    dessin:[...bornier(0,0,{nets:{U2:"m2"}}),
      ["raccord",-1.2,0.3,"m1","PE","g"],["trait",[[-1.2,0.3],[-0.5,0.3]]],["texte",-1.25,0.62,"masse","sous","milieu"],
      ["dipole","MΩ",3.6,1.6,"m2","m1",null,null,"v"],["texte",4.0,1.0,"mégohmmètre","sous"],
      ["texte",1.6,-1.35,"Moteur consigné et déconnecté du réseau.","note","milieu"],
      ["texte",1.6,-1.65,"Isolement entre un enroulement et la masse (PE) ;","note","milieu"],
      ["texte",1.6,-1.95,"aussi entre enroulements, barrettes retirées.","note","milieu"],
      ["texte",1.6,-2.25,"Tension d'essai et seuil : procédure et notice du constructeur.","note","milieu"]]},
  logique:null
};

/* ---------- EL-041 : position du relais thermique ---------- */
function triangle(dx,mode){
  const X=[0,1.4,2.8].map(x=>x+dx),f=[],j=[],d=[];
  const ty=mode==="ligne"?1.6:1.0, noeud=mode==="ligne"?0.5:1.3;
  X.forEach((x,i)=>{
    const n="n"+i+dx,w="w"+i+dx,b="b"+i+dx,L="L"+i+dx;
    f.push([mode==="ligne"?L:n,[[x,2.2],[x,mode==="ligne"?ty:noeud]]]);
    if(mode==="ligne"){f.push([L,[[x,ty-0.56],[x,noeud]]]);d.push(["thermique",L,x,ty]);f.push([L,[[x,noeud],[x,0.2]]]);}
    else{f.push([n,[[x,noeud],[x,ty]]]);d.push(["thermique",n,x,ty]);f.push([n,[[x,ty-0.56],[x,0.2]]]);}
    d.push(["texte",x,2.4,"L"+(i+1),"petit","milieu"],["dipole","L",x,0.2,mode==="ligne"?L:n,b,null,null,"v"]);
    d.push(["texte",x+0.25,0.1,["U1","V1","W1"][i],"born"],["texte",x+0.25,-1.1,["U2","V2","W2"][i],"born"]);
  });
  // fermeture du triangle : U2→V1, V2→W1, W2→U1
  const nn=i=>mode==="ligne"?"L"+i+dx:"n"+i+dx;
  f.push(["b0"+dx,[[X[0],-1.0],[X[0],-1.3],[X[0]+0.8,-1.3],[X[0]+0.8,noeud],[X[1],noeud]]]);
  f.push(["b1"+dx,[[X[1],-1.0],[X[1],-1.3],[X[1]+0.8,-1.3],[X[1]+0.8,noeud],[X[2],noeud]]]);
  f.push(["b2"+dx,[[X[2],-1.0],[X[2],-1.6],[X[0]-0.6,-1.6],[X[0]-0.6,noeud],[X[0],noeud]]]);
  // les conducteurs de fermeture prennent le nom du nœud qu'ils rejoignent
  f.forEach(w=>{if(w[0]==="b0"+dx)w[0]=nn(1);if(w[0]==="b1"+dx)w[0]=nn(2);if(w[0]==="b2"+dx)w[0]=nn(0);});
  d.forEach(c=>{if(c[0]==="dipole"){const i=X.indexOf(c[2]);c[5]=nn((i+1)%3);}});
  X.forEach((x,i)=>j.push([nn(i),x,noeud]));
  X.forEach(x=>d.push(["cadre",x-0.1,ty+0.06,x+0.52,ty-0.62]));d.push(["rep",X[2]+0.65,ty-0.28,"F1"]);
  d.push(["texte",dx+1.4,2.85,mode==="ligne"?"(a) Relais sur la ligne":"(b) Relais dans les enroulements","gras","milieu"]);
  d.push(["texte",dx+1.4,-2.0,mode==="ligne"?"F1 mesure le courant de ligne :":"F1 mesure le courant d'un enroulement :","note","milieu"]);
  d.push(["texte",dx+1.4,-2.28,mode==="ligne"?"réglage = In (plaque)":"réglage = In / √3 ≈ 0,58 In","note","milieu"]);
  return {fils:f,joncs:j,dessin:d,libres:X.map(x=>[x,2.2])};
}
const ta=triangle(0,"ligne"),tb=triangle(6.0,"enroulement");
const el041={id:"EL-041",titre:"Protection thermique selon sa position dans le montage",
  folio:{vue:[-1.2,3.15,10.8,-2.6],fils:ta.fils.concat(tb.fils),joncs:ta.joncs.concat(tb.joncs),dessin:ta.dessin.concat(tb.dessin),libres:ta.libres.concat(tb.libres)},
  logique:null};

/* ---------- EL-042 : variateur de fréquence ---------- */
const el042={id:"EL-042",titre:"Variateur de fréquence et moteur asynchrone : puissance et commande",
  folio:{vue:[-3.9,3.0,5.6,-6.3],
    libres:X3.map(x=>[x,2.5]).concat([[3.45,-1.1]]),
    fils:[...X3.map((x,i)=>["L"+(i+1),[[x,2.5],[x,2.2]]]),...X3.map((x,i)=>["q"+(i+1),[[x,1.0],[x,0.4]]]),
      ["u",[[0,-2.4],[0,-3.8]]],["v",[[0.8,-2.4],[0.8,-3.4]]],["w",[[1.6,-2.4],[1.6,-3.8]]],
      ["p24",[[-1.4,-0.3],[-2.2,-0.3],[-2.2,-0.45]]],["di",[[-2.2,-1.65],[-2.2,-1.8],[-1.4,-1.8]]],
      ["p10",[[3.0,-0.5],[3.8,-0.5]]],["ai",[[3.0,-1.1],[3.45,-1.1]]],["g0",[[3.0,-1.7],[3.8,-1.7]]]],
    contacts:[...X3.map((x,i)=>({id:"Q"+i,app:"QF1",type:"disj",x,y:2.2,haut:"L"+(i+1),bas:"q"+(i+1),b:[String(2*i+1),String(2*i+2)],bpos:"p"})),
      NO("S1c","S1",-2.2,-0.45,"p24","di",["13","14"])],
    dessin:[["texte",0,2.75,"L1","petit","milieu"],["texte",0.8,2.75,"L2","petit","milieu"],["texte",1.6,2.75,"L3","petit","milieu"],
      ["tirets",[[-0.16,1.62],[1.44,1.62]]],["tirets",[[-0.16,1.62],[-0.6,1.62]]],["rep",-0.68,1.62,"QF1",null,"fin"],
      ["boite",-1.4,0.4,3.0,-2.4,"Variateur de fréquence"],["texte",0.8,-1.0,"redresseur – onduleur","sous","milieu"],
      ["raccord",0,0.4,"q1","L1"],["raccord",0.8,0.4,"q2","L2"],["raccord",1.6,0.4,"q3","L3"],
      ["raccord",0,-2.4,"u","U"],["raccord",0.8,-2.4,"v","V"],["raccord",1.6,-2.4,"w","W"],
      ["raccord",-1.4,-0.3,"p24","+24"],["raccord",-1.4,-1.8,"di","DI1"],
      ["raccord",3.0,-0.5,"p10","+10","g"],["raccord",3.0,-1.1,"ai","AI1","g"],["raccord",3.0,-1.7,"g0","0 V","g"],
      ["poussoir","S1c",-3.0,"S1","marche"],
      ["dipole","R",3.8,-0.5,"p10","g0",null,null,"v"],["fleche2",3.45,-1.1,3.66,-1.1],["texte",4.05,-1.0,"R1","gras"],["texte",4.05,-1.3,"consigne","sous"],
      ["moteur",0.8,-4.4,1.0],["rep",-0.3,-5.3,"M1",null,"fin"],
      ["texte",0.8,-5.75,"La fréquence de sortie fixe la vitesse.","note","milieu"],
      ["texte",0.8,-6.0,"La consigne 0-10 V arrive sur AI1, l'ordre de marche sur DI1.","note","milieu"]]},
  logique:null
};

window.COURS_SCHEMAS=window.COURS_SCHEMAS.concat([el032,el033,el034,el035,el036,el037,el037e,el038,el039,el040,el041,el042]);
})();
