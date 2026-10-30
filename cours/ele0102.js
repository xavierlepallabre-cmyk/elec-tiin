/* Élec TIIN — schémas des cours, ELE01 (EL-001 à EL-005) et ELE02 (EL-006 à EL-014). */
(function(){
"use strict";
const {NO,NF,rails,logique,fusion,ETATS_LEGENDE}=window.COURS_OUTILS;
const BP={type:"poussoir"};

/* ---------- EL-001 : alimentation BT, L, N, PE (schéma TT) ---------- */
function tt(opt){
  opt=opt||{};
  const f={fils:[["L",[[0,0],[0,0.5],[5,0.5]]],["N",[[0,-1.2],[0,-1.7],[5,-1.7]]],["N",[[0,-1.7],[0,-2.3]]],
      ["L",[[5,0.5],[5,0]]],["N",[[5,-1.2],[5,-1.7]]],["PE",[[5.9,-0.6],[6.6,-0.6],[6.6,-2.3]]]],
    joncs:[["N",0,-1.7]],
    libres:[],
    dessin:[["dipole","G~",0,0,"L","N","T","230 V","v"],["terre",0,-2.3],["texte",-0.2,-2.75,"prise de terre du neutre","sous","milieu"],
      ["dipole","R",5,0,"L","N",null,null,"v"],
      ["tirets",[[3.5,0.25],[5.9,0.25],[5.9,-1.45],[3.5,-1.45],[3.5,0.25]]],["texte",3.6,-0.3,"récepteur","sous"],["texte",3.6,-0.65,"masse","sous"],["texte",3.6,-0.9,"métallique","sous"],
      ["raccord",5.9,-0.6,"PE",null],["terre",6.6,-2.3],["texte",6.6,-2.75,"prise de terre Ra","sous","milieu"],
      ["texte",2.5,0.72,"L (phase)","gras","milieu"],["texte",2.5,-1.48,"N (neutre)","gras","milieu"],["texte",6.75,-1.0,"PE","gras"]]};
  return f;
}
const el001={id:"EL-001",titre:"Principe d'alimentation BT : L, N, PE (schéma TT)",folio:Object.assign({vue:[-2.4,1.2,7.6,-3.1]},tt())};

/* ---------- EL-002 : protection par fusible et par disjoncteur ---------- */
const el002={id:"EL-002",titre:"Protection par fusible et par disjoncteur",
  folio:Object.assign({vue:[-1.9,0.6,5.6,-4.6]},{
    libres:[[-1.0,0],[4.8,0],[-1.0,-3.3],[4.8,-3.3]],
    fils:[["L",[[-1.0,0],[4.8,0]]],["N",[[-1.0,-3.3],[4.8,-3.3]]],
      ["L",[[0,0],[0,-0.3]]],["f1",[[0,-1.5],[0,-1.8]]],["N",[[0,-3.0],[0,-3.3]]],
      ["L",[[3.4,0],[3.4,-0.3]]],["q1",[[3.4,-1.5],[3.4,-1.8]]],["N",[[3.4,-3.0],[3.4,-3.3]]]],
    joncs:[["L",0,0],["L",3.4,0],["N",0,-3.3],["N",3.4,-3.3]],
    contacts:[{id:"Q1c",app:"Q1",type:"disj",x:3.4,y:-0.3,haut:"L",bas:"q1",b:["1","2"]}],
    dessin:[["texte",-1.08,0,"L","petit","fin"],["texte",-1.08,-3.3,"N","petit","fin"],
      ["fusible",0,-0.3,"L","f1","F1"],["dipole","R",0,-1.8,"f1","N",null,null,"v"],
      ["lienMT","Q1c","Q1"],["dipole","R",3.4,-1.8,"q1","N",null,null,"v"],
      ["texte",0,-3.65,"fusible : il fond,","note","milieu"],["texte",0,-3.9,"on le remplace","note","milieu"],
      ["texte",3.4,-3.65,"disjoncteur : il déclenche,","note","milieu"],["texte",3.4,-3.9,"on le réarme","note","milieu"],
      ["texte",1.7,-4.25,"Les deux coupent le circuit en cas de surcharge ou de court-circuit.","note","milieu"]]})
};

/* ---------- EL-003 : dispositif différentiel et défaut d'isolement ---------- */
const el003={id:"EL-003",titre:"Dispositif différentiel et défaut d'isolement (schéma TT)",
  folio:{vue:[-2.4,1.5,8.2,-3.7],
    fils:[["L",[[0,0],[0,0.5],[1.6,0.5]]],["N",[[0,-1.2],[0,-1.7],[1.6,-1.7]]],["N",[[0,-1.7],[0,-2.3]]],
      ["L2",[[3.0,0.5],[5,0.5],[5,0]]],["N2",[[3.0,-1.7],[5,-1.7],[5,-1.2]]],["PE",[[5.9,-0.6],[6.6,-0.6],[6.6,-2.3]]]],
    joncs:[["N",0,-1.7]],
    dessin:[["dipole","G~",0,0,"L","N","T","230 V","v"],["terre",0,-2.3],["texte",0,-2.75,"Rn","sous","milieu"],
      ["boite",1.6,1.0,3.0,-2.2,"DDR"],["texte",2.3,-0.45,"IΔn","gras","milieu"],["texte",2.3,-0.75,"30 mA","sous","milieu"],
      ["raccord",1.6,0.5,"L",null],["raccord",3.0,0.5,"L2",null],["raccord",1.6,-1.7,"N",null],["raccord",3.0,-1.7,"N2",null],
      ["dipole","R",5,0,"L2","N2",null,"récepteur","v"],
      ["tirets",[[4.2,0.25],[5.9,0.25],[5.9,-1.45],[4.2,-1.45],[4.2,0.25]]],
      ["raccord",5.9,-0.6,"PE",null],["terre",6.6,-2.3],["texte",6.6,-2.75,"Ra","sous","milieu"],
      ["trait",[[5,0.2],[5.25,-0.05],[5.1,-0.1],[5.55,-0.45]]],["fleche2",5.4,-0.33,5.55,-0.45],["texte",5.25,-1.25,"défaut","sous"],
      ["fleche2",6.75,-0.9,6.75,-1.7],["texte",6.85,-1.2,"Id","gras"],
      ["tirets",[[6.4,-2.55],[0.3,-2.55]]],["fleche2",3.6,-2.55,3.2,-2.55],["texte",3.4,-2.8,"retour de Id par la terre","sous","milieu"],
      ["texte",3.2,-3.2,"Id ne revient pas par N : le DDR mesure IL ≠ IN et déclenche si Id ≥ IΔn.","note","milieu"],
      ["texte",4.0,0.72,"L","gras","milieu"],["texte",4.0,-1.48,"N","gras","milieu"],["texte",6.75,-0.45,"PE","gras"]]}
};

/* ---------- EL-004 : séparation, condamnation, vérification d'absence de tension ---------- */
const X3=[0,0.8,1.6];
const el004={id:"EL-004",titre:"Séparation, condamnation et vérification d'absence de tension : principe",
  folio:{vue:[-2.4,1.2,7.6,-4.6],
    libres:X3.map(x=>[x,0.6]).concat(X3.map(x=>[x,-3.4])),
    fils:[...X3.map((x,i)=>["L"+(i+1),[[x,0.6],[x,0.2]]]),...X3.map((x,i)=>["d"+(i+1),[[x,-1.0],[x,-3.4]]]),
      ["d2",[[0.8,-2.0],[3.0,-2.0]]],["d3",[[1.6,-2.5],[3.0,-2.5]]]],
    joncs:[["d2",0.8,-2.0],["d3",1.6,-2.5]],
    contacts:X3.map((x,i)=>({id:"QS"+i,app:"QS",type:"isect",x,y:0.2,haut:"L"+(i+1),bas:"d"+(i+1),b:[String(2*i+1),String(2*i+2)],bpos:"p"})),
    dessin:[["texte",0,0.85,"L1","petit","milieu"],["texte",0.8,0.85,"L2","petit","milieu"],["texte",1.6,0.85,"L3","petit","milieu"],
      ["tirets",[[1.44,-0.38],[-0.86,-0.38]]],["trait",[[-0.86,-0.22],[-0.86,-0.54]]],["cadenas",-1.16,-0.38],["rep",-1.36,-0.38,"QS",null,"fin"],
      ["boite",3.0,-1.7,4.4,-2.8,"VAT"],["raccord",3.0,-2.0,"d2",null],["raccord",3.0,-2.5,"d3",null],
      ["boite",-0.4,-3.4,2.0,-4.0],["texte",0.8,-3.7,"ouvrage à consigner","sous","milieu"],
      ["texte",3.0,0.55,"1. Séparer : ouvrir QS","note"],["texte",3.0,0.2,"2. Condamner : cadenas sur QS","note"],
      ["texte",3.0,-0.15,"3. Vérifier l'absence de tension (VAT)","note"],["texte",3.0,-0.45,"   entre tous les conducteurs","note"],
      ["texte",2.6,-4.3,"Principe seulement : la procédure de consignation de l'entreprise s'applique.","note","milieu"]]}
};

/* ---------- EL-005 : arrêt normal et arrêt d'urgence ---------- */
function el005folio(){
  return Object.assign({vue:[-2.9,0.55,5.6,-9.7]},fusion(rails(-1.6,1.8,-9.7+0.4),{
    fils:[["p24",[[0,0],[0,-0.3]]],["a1",[[0,-1.5],[0,-1.8]]],["a2",[[0,-3.0],[0,-3.3]]],
      ["A",[[0,-4.5],[0,-5.0]]],["A",[[0,-4.75],[1.3,-4.75],[1.3,-5.0]]],
      ["B",[[0,-6.2],[0,-6.7]]],["B",[[1.3,-6.2],[1.3,-6.45],[0,-6.45]]],["z",[[0,-7.9],[0,-9.3]]]],
    joncs:[["p24",0,0],["A",0,-4.75],["B",0,-6.45],["z",0,-9.3]],
    contacts:[NF("AUc","AU",0,-1.8,"a1","a2",["11","12"]),NF("S1c","S1",0,-3.3,"a2","A",["11","12"]),
      NO("S2c","S2",0,-5.0,"A","B",["13","14"]),NO("KMa","KM1",1.3,-5.0,"A","B",["13","14"])],
    dessin:[["fusible",0,-0.3,"p24","a1","FU1"],["coupDePoing","AUc",-0.8,"AU","arrêt d'urgence"],
      ["poussoir","S1c",-0.8,"S1","Arrêt"],["poussoir","S2c",-0.8,"S2","Marche"],["rep",1.62,-5.6,"KM1"],
      ["bobine","bKM1",0,-6.7,"B","z","KM1"],
      ["texte",2.0,-2.2,"AU : à accrochage, prioritaire ;","note"],["texte",2.0,-2.45,"il reste enfoncé jusqu'au","note"],["texte",2.0,-2.7,"déverrouillage volontaire.","note"],
      ["texte",2.0,-3.7,"S1 : arrêt normal,","note"],["texte",2.0,-3.95,"il revient seul au repos.","note"],
      ["texte",2.0,-8.3,"Ni AU ni S1 ne sont","note"],["texte",2.0,-8.55,"des organes de sectionnement.","note"]]
  }));
}
const el005L=logique({AU:{type:"au"},S1:BP,S2:BP,KM1:{type:"contacteur",bobine:"bKM1"}},[{id:"bKM1",type:"bobine",a:"B",b:"z"}]);
const el005={id:"EL-005",titre:"Arrêt normal et arrêt d'urgence : distinction fonctionnelle",folio:el005folio(),logique:el005L};
const el005e={id:"EL-005-etats",titre:"Arrêt d'urgence : états successifs",colonnes:3,legende:ETATS_LEGENDE,folio:el005folio(),logique:el005L,
  etats:[{titre:"1. En marche",actions:[["appuyer","S2",true],["appuyer","S2",false]],attendu:{bKM1:true}},
    {titre:"2. AU enfoncé (accroché)",actions:[["basculer","AU"]],attendu:{bKM1:false},note:"AU reste enfoncé"},
    {titre:"3. AU déverrouillé",actions:[["basculer","AU"]],attendu:{bKM1:false},note:"pas de redémarrage sans Marche"}]};

/* ---------- ELE02 : circuits de mesure (source continue G=, récepteur R1) ---------- */
function boucle(appareil,mode){ // mode : "parallele" | "serie" | "pince"
  const f={fils:[],joncs:[],dessin:[["dipole","G=",0,0,"p","n","G","12 V","v"]],libres:[]};
  if(mode==="serie"){
    f.fils.push(["p",[[0,0],[0,0.4],[1.0,0.4]]],["p2",[[2.2,0.4],[3.4,0.4],[3.4,0]]],["n",[[3.4,-1.2],[3.4,-1.6],[0,-1.6],[0,-1.2]]]);
    f.dessin.push(["dipole","A",1.0,0.4,"p","p2",null,null,"h"],["dipole","R",3.4,0,"p2","n","R1",null,"v"]);
  } else {
    f.fils.push(["p",[[0,0],[0,0.4],[2.4,0.4],[2.4,0]]],["n",[[2.4,-1.2],[2.4,-1.6],[0,-1.6],[0,-1.2]]]);
    f.dessin.push(["dipole","R",2.4,0,"p","n","R1",null,"v"]);
    if(mode==="parallele"){
      f.fils.push(["p",[[2.4,0.4],[3.8,0.4],[3.8,0]]],["n",[[3.8,-1.2],[3.8,-1.6],[2.4,-1.6]]]);
      f.joncs.push(["p",2.4,0.4],["n",2.4,-1.6]);
      f.dessin.push(["dipole",appareil,3.8,0,"p","n",null,null,"v"]);
    }
  }
  return f;
}
const el006={id:"EL-006",titre:"Mesure de tension au voltmètre",folio:Object.assign({vue:[-1.6,1.0,5.6,-2.6]},fusion(boucle("V","parallele"),{dessin:[
  ["texte",4.2,-0.6,"voltmètre","sous"],["texte",2.0,-2.05,"Le voltmètre se branche en dérivation (en parallèle) sur R1.","note","milieu"]]}))};
const el007={id:"EL-007",titre:"Mesure du courant à l'ampèremètre",folio:Object.assign({vue:[-1.6,1.2,5.0,-2.6]},fusion(boucle("A","serie"),{dessin:[
  ["texte",1.6,0.95,"ampèremètre","sous","milieu"],["texte",1.7,-2.05,"L'ampèremètre se branche en série : il faut ouvrir le circuit.","note","milieu"]]}))};
const el008={id:"EL-008",titre:"Mesure du courant à la pince ampèremétrique",folio:Object.assign({vue:[-1.6,2.4,4.6,-2.9]},fusion(boucle(null,"pince"),{dessin:[
  ["cercle",1.2,0.4,0.28],["trait",[[1.2,0.68],[1.2,1.25]]],
  ["cercle",1.2,1.55,0.3,"symb plein-fond"],["texte",1.2,1.55,"A","rep","milieu"],["texte",1.6,1.55,"pince ampèremétrique","sous"],
  ["texte",1.4,-2.05,"La pince entoure un seul conducteur :","note","milieu"],["texte",1.4,-2.35,"pas besoin d'ouvrir le circuit.","note","milieu"]]}))};
const el009={id:"EL-009",titre:"Mesure de résistance à l'ohmmètre",
  folio:{vue:[-1.6,1.0,4.6,-2.9],
    fils:[["a",[[0,0],[0,0.4],[1.6,0.4],[1.6,0]]],["b",[[1.6,-1.2],[1.6,-1.6],[0,-1.6],[0,-1.2]]]],
    dessin:[["dipole","R",0,0,"a","b","R1",null,"v"],["dipole","Ω",1.6,0,"a","b",null,null,"v"],["texte",2.0,-0.6,"ohmmètre","sous"],
      ["texte",0.8,-2.05,"Circuit hors tension ; R1 isolée","note","milieu"],["texte",0.8,-2.35,"(débranchée du reste du circuit).","note","milieu"]]}
};
const el010={id:"EL-010",titre:"Mesure de résistance d'isolement au mégohmmètre (circuit isolé)",
  folio:{vue:[-2.6,1.0,5.6,-5.4],
    libres:[[0,0.6],[0.8,0.6],[-0.8,0.6],[0,-3.0],[0.8,-3.0]],
    fils:[["L",[[0,0.6],[0,0]]],["N",[[0.8,0.6],[0.8,0]]],["c",[[0,-1.2],[0,-3.0]]],["c",[[0.8,-1.2],[0.8,-3.0]]],
      ["c",[[0,-2.4],[2.4,-2.4]]],["pe",[[-0.8,0.6],[-0.8,-3.9],[2.4,-3.9],[2.4,-3.6]]]],
    joncs:[["c",0,-2.4],["c",0.8,-2.4]],
    contacts:[{id:"Q1a",app:"Q1",type:"disj",x:0,y:0,haut:"L",bas:"c",b:["1","2"],bpos:"p"},{id:"Q1b",app:"Q1",type:"disj",x:0.8,y:0,haut:"N",bas:"c",b:["3","4"],bpos:"p"}],
    dessin:[["texte",0,0.82,"L","petit","milieu"],["texte",0.8,0.82,"N","petit","milieu"],["texte",-0.8,0.82,"PE","petit","milieu"],
      ["tirets",[[-0.16,-0.58],[0.64,-0.58]]],["cadenas",1.3,-0.58],["rep",1.55,-0.58,"Q1","ouvert, condamné"],
      ["texte",1.2,-2.2,"pont L-N","sous"],["dipole","MΩ",2.4,-2.4,"c","pe",null,null,"v"],["texte",2.8,-3.0,"mégohmmètre","sous"],
      ["texte",0.4,-3.25,"récepteurs","sous","milieu"],["texte",0.4,-3.5,"débranchés","sous","milieu"],
      ["texte",1.4,-4.35,"Mesure entre les conducteurs actifs (L et N reliés) et le PE.","note","milieu"],
      ["texte",1.4,-4.65,"Tension d'essai et valeur minimale : selon la procédure.","note","milieu"],
      ["texte",1.4,-4.95,"Circuit consigné, récepteurs sensibles débranchés.","note","milieu"]]}
};

/* ---------- EL-011 : circuit continu résistif série et parallèle ---------- */
const el011={id:"EL-011",titre:"Circuit continu résistif : série et parallèle",
  folio:{vue:[-1.6,1.6,9.6,-3.3],
    fils:[["p",[[0,0],[0,0.4],[2.0,0.4],[2.0,0]]],["m",[[2.0,-1.2],[2.0,-1.4]]],["n",[[2.0,-2.6],[0,-2.6],[0,-1.2]]],
      ["p2",[[5.6,0],[5.6,0.4],[8.8,0.4],[8.8,0]]],["p2",[[7.4,0.4],[7.4,0]]],["n2",[[5.6,-1.2],[5.6,-1.6],[8.8,-1.6],[8.8,-1.2]]],["n2",[[7.4,-1.2],[7.4,-1.6]]]],
    joncs:[["p2",7.4,0.4],["n2",7.4,-1.6]],
    dessin:[["dipole","G=",0,0,"p","n","G",null,"v"],["dipole","R",2.0,0,"p","m","R1",null,"v"],["dipole","R",2.0,-1.4,"m","n","R2",null,"v"],
      ["fleche2",0.8,0.4,1.2,0.4],["texte",1.0,0.65,"I","gras","milieu"],
      ["texte",1.0,1.2,"Série","gras","milieu"],["texte",1.0,-2.95,"même courant I ; R = R1 + R2","note","milieu"],
      ["dipole","G=",5.6,0,"p2","n2","G",null,"v"],["dipole","R",7.4,0,"p2","n2","R1",null,"v"],["dipole","R",8.8,0,"p2","n2","R2",null,"v"],
      ["fleche2",6.3,0.4,6.7,0.4],["texte",6.5,0.65,"I","gras","milieu"],
      ["texte",7.2,1.2,"Parallèle","gras","milieu"],["texte",7.2,-2.0,"même tension U ; I = I1 + I2","note","milieu"]]}
};

/* ---------- EL-012 : monophasé, récepteur résistif et inductif ---------- */
const el012={id:"EL-012",titre:"Circuit monophasé avec récepteur résistif et récepteur inductif",
  folio:{vue:[-1.9,1.3,6.6,-3.6],
    fils:[["L",[[0,0],[0,0.4],[4.4,0.4],[4.4,0]]],["L",[[2.4,0.4],[2.4,0]]],["N",[[0,-1.2],[0,-2.6],[4.4,-2.6],[4.4,-2.4]]],["N",[[2.4,-1.2],[2.4,-2.6]]]],
    joncs:[["L",2.4,0.4],["N",2.4,-2.6]],
    dessin:[["dipole","G~",0,0,"L","N","G","230 V 50 Hz","v"],["dipole","R",2.4,0,"L","N","R",null,"v"],
      ["dipole","R",4.4,0,"L","m",null,null,"v"],["dipole","L",4.4,-1.2,"m","N",null,null,"v"],
      ["texte",2.2,-2.95,"Récepteur résistif : courant en phase avec la tension.","note","milieu"],["texte",4.8,-0.6,"R","gras"],["texte",4.8,-1.8,"L","gras"],
      ["texte",4.4,0.8,"récepteur inductif","sous","milieu"],["texte",2.4,0.8,"récepteur résistif","sous","milieu"],
      ["texte",2.2,-3.25,"Récepteur inductif : courant en retard sur la tension.","note","milieu"]]}
};

/* ---------- EL-013 : réseau triphasé, tensions simples et composées ---------- */
const Y={L1:0,L2:-0.8,L3:-1.6,N:-2.4,PE:-3.2};
const el013={id:"EL-013",titre:"Réseau triphasé : L1, L2, L3, N, PE et tensions",
  folio:{vue:[-1.0,0.6,7.0,-4.1],
    libres:Object.values(Y).flatMap(y=>[[0,y],[6.0,y]]),
    fils:Object.entries(Y).map(([k,y])=>[k,[[0,y],[6.0,y]]]),
    dessin:[...Object.entries(Y).map(([k,y])=>["texte",-0.1,y,k,"gras","fin"]),
      ["fleche2",2.0,-2.4,2.0,0],["texte",2.1,-1.2,"V1 = 230 V","petit"],
      ["fleche2",4.0,-0.8,4.0,0],["texte",4.1,-0.4,"U12 = 400 V","petit"],
      ["texte",3.0,-3.55,"tension simple V (phase-neutre) = 230 V","note","milieu"],["texte",3.0,-3.85,"tension composée U (phase-phase) = 400 V = √3 × 230 V","note","milieu"]]}
};

/* ---------- EL-014 : mesure de puissance au wattmètre ---------- */
const el014={id:"EL-014",titre:"Mesure de puissance électrique au wattmètre : montage pédagogique",
  folio:{vue:[-1.9,1.5,5.4,-2.8],
    libres:[[1.6,0.1]],
    fils:[["L",[[0,0],[0,0.4],[1.0,0.4]]],["L2",[[2.2,0.4],[3.6,0.4],[3.6,0]]],["N",[[3.6,-1.2],[3.6,-1.6],[0,-1.6],[0,-1.2]]],["N",[[1.6,0.1],[1.6,-1.6]]]],
    joncs:[["N",1.6,-1.6]],
    dessin:[["dipole","G~",0,0,"L","N","G","230 V","v"],["dipole","W",1.0,0.4,"L","L2",null,null,"h"],["dipole","R",3.6,0,"L2","N","récepteur",null,"v"],
      ["texte",1.6,1.0,"wattmètre","sous","milieu"],
      ["texte",1.7,-2.05,"Circuit courant en série, circuit tension en dérivation.","note","milieu"],
      ["texte",1.7,-2.35,"Il affiche P = U × I × cos φ.","note","milieu"]]}
};

window.COURS_SCHEMAS=window.COURS_SCHEMAS.concat([el001,el002,el003,el004,el005,el005e,el006,el007,el008,el009,el010,el011,el012,el013,el014]);
})();
