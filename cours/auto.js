/* Élec TIIN — schémas des cours, automatismes et interfaces (EL-043 à EL-052). */
(function(){
"use strict";
const {NO,NF,rails,logique,fusion,ETATS_LEGENDE}=window.COURS_OUTILS;
const BP={type:"poussoir"};
const notes=(x,y,lignes)=>lignes.map((t,i)=>["texte",x,y-0.3*i,t,"note","milieu"]);

/* ---------- EL-043 / EL-044 : capteur 3 fils PNP / NPN vers entrée d'automate ---------- */
function capteur3fils(type){
  const pnp=type==="PNP";
  return Object.assign({vue:[-2.4,0.5,7.2,-5.3]},fusion(rails(-1.6,6.6,-3.6),{
    fils:[["p24",[[0.3,0],[0.3,-0.8]]],["z",[[0.3,-2.4],[0.3,-3.6]]],["s",[[1.6,-1.6],[3.6,-1.6]]],
      pnp?["z",[[5.6,-1.6],[6.2,-1.6],[6.2,-3.6]]]:["p24",[[5.6,-1.6],[6.2,-1.6],[6.2,0]]]],
    joncs:[["p24",0.3,0],["z",0.3,-3.6],pnp?["z",6.2,-3.6]:["p24",6.2,0]],
    dessin:[["boite",0,-0.8,1.6,-2.4,"B1",type],["losange",0.8,-1.95,0.2],
      ["raccord",0.3,-0.8,"p24","BN"],["raccord",0.3,-2.4,"z","BU"],["raccord",1.6,-1.6,"s","BK"],
      ["boite",3.6,-0.8,5.6,-2.4,"API","entrées"],["raccord",3.6,-1.6,"s","I0.0"],["raccord",5.6,-1.6,pnp?"z":"p24","COM","g"],
      ["texte",2.6,-1.4,"signal","sous","milieu"],
      ...notes(2.4,-4.05,pnp?["B1 commute le +24 V : BK passe à +24 V quand un objet est détecté.",
          "Entrée à logique positive : le commun COM est relié au 0 V.","BN brun (+) · BU bleu (−) · BK noir (sortie)"]
        :["B1 commute le 0 V : BK passe à 0 V quand un objet est détecté.",
          "Entrée à logique négative : le commun COM est relié au +24 V.","Un capteur NPN ne convient pas à une entrée PNP : vérifier."])]
  }));
}
const el043={id:"EL-043",titre:"Capteur inductif 3 fils PNP et entrée d'automate",folio:capteur3fils("PNP")};
const el044={id:"EL-044",titre:"Capteur 3 fils NPN et entrée d'automate compatible",folio:capteur3fils("NPN")};

/* ---------- EL-045 : fin de course mécanique ---------- */
function el045folio(){
  return Object.assign({vue:[-2.9,0.55,3.6,-8.6]},fusion(rails(-1.6,1.8,-8.2),{
    fils:[["p24",[[0,0],[0,-0.3]]],["a1",[[0,-1.5],[0,-1.8]]],
      ["A",[[0,-3.0],[0,-3.5]]],["A",[[0,-3.25],[1.3,-3.25],[1.3,-3.5]]],
      ["B",[[0,-4.7],[0,-5.2]]],["B",[[1.3,-4.7],[1.3,-4.95],[0,-4.95]]],["C",[[0,-6.4],[0,-6.7]]],["z",[[0,-7.9],[0,-8.2]]]],
    joncs:[["p24",0,0],["A",0,-3.25],["B",0,-4.95],["z",0,-8.2]],
    contacts:[NF("S1c","S1",0,-1.8,"a1","A",["11","12"]),NO("S2c","S2",0,-3.5,"A","B",["13","14"]),NO("KMa","KM1",1.3,-3.5,"A","B",["13","14"]),
      NF("S3c","S3",0,-5.2,"B","C",["11","12"])],
    dessin:[["fusible",0,-0.3,"p24","a1","FU1"],["poussoir","S1c",-0.8,"S1","Arrêt"],["poussoir","S2c",-0.8,"S2","Marche"],["rep",1.62,-4.1,"KM1"],
      ["tirets",[[0.2,-5.75],[-0.66,-5.75]]],["cercle",-0.8,-5.75,0.14],["point",-0.8,-5.75],["rep",-1.05,-5.75,"S3","fin de course","fin"],
      ["bobine","bKM1",0,-6.7,"C","z","KM1"],
      ["texte",0.6,-6.05,"S3 s'ouvre quand le mobile","sous"],["texte",0.6,-6.27,"atteint la fin de course","sous"]]
  }));
}
const el045L=logique({S1:BP,S2:BP,S3:BP,KM1:{type:"contacteur",bobine:"bKM1"}},[{id:"bKM1",type:"bobine",a:"C",b:"z"}]);
const el045={id:"EL-045",titre:"Fin de course mécanique et commande",folio:el045folio(),logique:el045L};
const el045e={id:"EL-045-etats",titre:"Fin de course : deux états",colonnes:2,legende:ETATS_LEGENDE,folio:el045folio(),logique:el045L,
  etats:[{titre:"1. En déplacement",actions:[["appuyer","S2",true],["appuyer","S2",false]],attendu:{bKM1:true}},
    {titre:"2. Fin de course atteinte",actions:[["appuyer","S3",true]],attendu:{bKM1:false},note:"S3 actionné : KM1 retombe"}]};

/* ---------- EL-046 / EL-047 : sortie d'automate vers relais d'interface ---------- */
function interfaceAPI(sortie,relais,charge){
  const ev=charge==="YV1",nets=ev?["p24b","zb"]:["L","N"];
  const [P,M]=nets;
  return {vue:[-2.4,0.6,8.2,-5.2],
    libres:[[-1.6,0],[2.8,0],[-1.6,-3.7],[2.8,-3.7],[4.2,0],[7.0,0],[4.2,-3.7],[7.0,-3.7]],
    fils:[["p24",[[-1.6,0],[2.8,0]]],["z",[[-1.6,-3.7],[2.8,-3.7]]],["p24",[[0.2,0],[0.2,-0.5]]],
      ["q",[[0.8,-1.7],[0.8,-2.2]]],["q",[[0.8,-1.95],[2.0,-1.95],[2.0,-2.2]]],["z",[[0.8,-3.4],[0.8,-3.7]]],["z",[[2.0,-3.4],[2.0,-3.7]]],
      ["z",[[-0.4,-1.1],[-1.0,-1.1],[-1.0,-3.7]]],
      [P,[[4.2,0],[7.0,0]]],[M,[[4.2,-3.7],[7.0,-3.7]]],[P,[[5.2,0],[5.2,-0.3]]],["k",[[5.2,-1.5],[5.2,-2.2]]],[M,[[5.2,-3.4],[5.2,-3.7]]]]
      .concat(ev?[["k",[[5.2,-1.85],[6.4,-1.85],[6.4,-2.2]]],[M,[[6.4,-3.4],[6.4,-3.7]]]]:[]),
    joncs:[["p24",0.2,0],["q",0.8,-1.95],["z",0.8,-3.7],["z",2.0,-3.7],["z",-1.0,-3.7],[P,5.2,0],[M,5.2,-3.7]]
      .concat(ev?[["k",5.2,-1.85],[M,6.4,-3.7]]:[]),
    contacts:[NO("KAc",relais,5.2,-0.3,P,"k",["13","14"])],
    dessin:[["texte",-1.7,0,"+24 V","petit","fin"],["texte",-1.7,-3.7,"0 V","petit","fin"],
      ["texte",4.1,0,ev?"+24 V":"L","petit","fin"],["texte",4.1,-3.7,ev?"0 V":"N","petit","fin"],
      ["boite",-0.4,-0.5,1.4,-1.7,"API","sortie"],["raccord",0.2,-0.5,"p24","L+"],["raccord",0.8,-1.7,"q",sortie],["raccord",-0.4,-1.1,"z","M"],
      ["bobine","b"+relais,0.8,-2.2,"q","z",relais],["dipole","D-",2.0,-2.2,"q","z",null,null,"v"],["texte",2.2,-2.45,"diode de","sous"],["texte",2.2,-2.67,"roue libre","sous"],
      ["rep",5.52,-0.9,relais],
      ["bobine","b"+charge,5.2,-2.2,"k",M,charge]]
      .concat(ev?[["dipole","D-",6.4,-2.2,"k",M,null,null,"v"],["texte",5.0,-4.05,"bobine d'électrovanne (24 V continu)","sous","milieu"]]
               :[["texte",5.6,-4.05,"bobine du contacteur (230 V)","sous","milieu"]])
      .concat(notes(2.9,-4.5,ev?["L'API ne commande pas directement la charge : le relais KA2 adapte","le courant et protège la sortie. Une diode par bobine continue."]
        :["La sortie de l'API (24 V, faible courant) commande KA1 ;","le contact 13-14 de KA1 commande KM1 en 230 V."]))};
}
const el046={id:"EL-046",titre:"Sortie d'automate vers relais intermédiaire",folio:interfaceAPI("Q0.0","KA1","KM1")};
const el047={id:"EL-047",titre:"Sortie d'automate vers électrovanne avec interface adaptée",folio:interfaceAPI("Q0.1","KA2","YV1")};

/* ---------- EL-048 : chaîne capteur – API – préactionneur – actionneur ---------- */
const blocs=[["Capteur","B1 : détecte","acquérir"],["API","traite","traiter"],["Préactionneur","KM1, distributeur","distribuer"],["Actionneur","moteur, vérin","convertir"]];
const el048={id:"EL-048",titre:"Chaîne capteur – API – préactionneur – actionneur",controle:false,
  folio:{vue:[-0.4,1.9,15.6,-2.0],dessin:[
    ...blocs.flatMap(([t,s,f],i)=>{const x=i*3.6;return [["boite",x,0.6,x+2.4,-0.6,t,s],["texte",x+1.2,-0.95,f,"note","milieu"]];}),
    ...[0,1,2].map(i=>["fleche2",i*3.6+2.4,0,i*3.6+3.6,0]),["fleche2",13.2,0,14.4,0],["texte",13.8,0.25,"effet","sous","milieu"],
    ["texte",3.0,0.25,"information","sous","milieu"],["texte",6.6,0.25,"ordre","sous","milieu"],["texte",10.2,0.25,"énergie","sous","milieu"],
    ["fleche2",8.4,1.5,8.4,0.6],["texte",8.55,1.3,"énergie (réseau, air comprimé)","sous"],
    ["texte",7.0,-1.6,"Chaîne d'information (capteur, API) et chaîne d'énergie (préactionneur, actionneur)","note","milieu"]]}
};

/* ---------- EL-049 : entrées et sorties 24 V continu d'un API ---------- */
const el049={id:"EL-049",titre:"Entrées et sorties 24 V continu d'un automate",
  folio:Object.assign({vue:[-3.8,0.6,9.0,-6.3]},fusion(rails(-2.6,8.4,-5.2),{
    fils:[["p24",[[0.6,0],[0.6,-0.3]]],["i0",[[0.6,-1.5],[0.6,-1.8],[1.6,-1.8]]],["p24",[[-1.2,0],[-1.2,-0.3]]],["i1",[[-1.2,-1.5],[-1.2,-2.6],[1.6,-2.6]]],
      ["z",[[1.6,-3.4],[1.0,-3.4],[1.0,-5.2]]],["p24",[[4.2,0],[4.2,-1.2]]],
      ["q0",[[4.8,-2.6],[6.0,-2.6],[6.0,-3.0]]],["q0",[[6.0,-2.8],[6.7,-2.8],[6.7,-3.0]]],["q1",[[4.8,-1.8],[7.7,-1.8],[7.7,-3.0]]],
      ["z",[[6.0,-4.2],[6.0,-5.2]]],["z",[[6.7,-4.2],[6.7,-5.2]]],["z",[[7.7,-4.2],[7.7,-5.2]]]],
    joncs:[["p24",0.6,0],["p24",-1.2,0],["p24",4.2,0],["z",1.0,-5.2],["q0",6.0,-2.8],["z",6.0,-5.2],["z",6.7,-5.2],["z",7.7,-5.2]],
    contacts:[NO("S1c","S1",0.6,-0.3,"p24","i0",["13","14"]),NF("S2c","S2",-1.2,-0.3,"p24","i1",["11","12"])],
    dessin:[["poussoir","S1c",0.0,"S1","Marche"],["poussoir","S2c",-2.0,"S2","Arrêt"],
      ["boite",1.6,-1.2,4.8,-4.0,"API","24 V continu"],
      ["raccord",1.6,-1.8,"i0","I0.0"],["raccord",1.6,-2.6,"i1","I0.1"],["raccord",1.6,-3.4,"z","M"],
      ["raccord",4.2,-1.2,"p24","L+"],["raccord",4.8,-1.8,"q1","Q0.1","g"],["raccord",4.8,-2.6,"q0","Q0.0","g"],
      ["bobine","bKA1",6.0,-3.0,"q0","z","KA1"],["dipole","D-",6.7,-3.0,"q0","z",null,null,"v"],["voyant","H1",7.7,-3.0,"q1","z","H1","vert"],
      ...notes(3.0,-5.6,["Entrées : contacts alimentés par le +24 V, commun M au 0 V. S2 (Arrêt) est câblé en NF :","un fil coupé donne le même effet qu'un appui sur Arrêt. Sorties : L+ alimente les sorties Q."])]
  }))
};

/* ---------- EL-050 : commande manuelle / automatique ---------- */
function el050folio(){
  return Object.assign({vue:[-2.9,0.55,3.6,-8.6]},fusion(rails(-1.6,2.2,-8.2),{
    fils:[["p24",[[0,0],[0,-0.3]]],["a1",[[0,-1.5],[0,-1.8]]],
      ["A",[[0,-3.0],[0,-3.5]]],["A",[[0,-3.25],[1.6,-3.25],[1.6,-3.5]]],
      ["m",[[0,-4.7],[0,-5.0]]],["au",[[1.6,-4.7],[1.6,-5.0]]],
      ["B",[[0,-6.2],[0,-6.7]]],["B",[[1.6,-6.2],[1.6,-6.45],[0,-6.45]]],["z",[[0,-7.9],[0,-8.2]]]],
    joncs:[["p24",0,0],["A",0,-3.25],["B",0,-6.45],["z",0,-8.2]],
    contacts:[NF("S1c","S1",0,-1.8,"a1","A",["11","12"]),NF("S0m","S0",0,-3.5,"A","m",["11","12"]),NO("S0a","S0",1.6,-3.5,"A","au",["23","24"]),
      NO("S2c","S2",0,-5.0,"m","B",["13","14"]),NO("KAc","KA1",1.6,-5.0,"au","B",["13","14"])],
    dessin:[["fusible",0,-0.3,"p24","a1","FU1"],["poussoir","S1c",-0.8,"S1","Arrêt"],["poussoir","S2c",-0.8,"S2","Marche"],
      ["tirets",[[0.2,-4.05],[1.44,-4.05]]],["tirets",[[0.2,-4.05],[-0.8,-4.05]]],["trait",[[-0.68,-3.89],[-0.8,-3.89],[-0.8,-4.21],[-0.92,-4.21]]],
      ["rep",-1.0,-4.05,"S0","MAN / AUTO","fin"],["texte",0.48,-4.5,"MAN","sous"],["texte",1.95,-4.1,"AUTO","sous"],
      ["rep",1.92,-5.6,"KA1","ordre API"],["bobine","bKM1",0,-6.7,"B","z","KM1"]]
  }));
}
const el050L=logique({S0:{type:"manuel",initial:false},S1:BP,S2:BP,KA1:BP,KM1:{type:"contacteur",bobine:"bKM1"}},[{id:"bKM1",type:"bobine",a:"B",b:"z"}]);
const el050={id:"EL-050",titre:"Commande manuelle / automatique : principe logique",folio:el050folio(),logique:el050L};
const el050e={id:"EL-050-etats",titre:"Manuel / automatique : trois cas",colonnes:3,legende:ETATS_LEGENDE,folio:el050folio(),logique:el050L,
  etats:[{titre:"1. MAN : S2 appuyé",actions:[["appuyer","S2",true]],attendu:{bKM1:true}},
    {titre:"2. AUTO : ordre de l'API",actions:[["appuyer","S2",false],["basculer","S0"],["appuyer","KA1",true]],attendu:{bKM1:true}},
    {titre:"3. AUTO : S2 sans effet",actions:[["appuyer","KA1",false],["appuyer","S2",true]],attendu:{bKM1:false}}]};

/* ---------- EL-051 : boucle 4-20 mA ---------- */
const el051={id:"EL-051",titre:"Signal analogique 4-20 mA : boucle de mesure",
  folio:{vue:[-1.9,1.5,7.2,-3.3],
    fils:[["p",[[0,0],[0,0.5],[1.6,0.5]]],["ai",[[3.2,0.5],[4.0,0.5],[4.0,-0.2],[4.4,-0.2]]],["ai",[[4.4,-0.2],[5.0,-0.2]]],
      ["aim",[[5.0,-1.4],[4.4,-1.4]]],["aim",[[4.4,-1.4],[4.0,-1.4],[4.0,-1.7],[0,-1.7],[0,-1.2]]]],
    dessin:[["dipole","G=",0,0,"p","aim","G","24 V","v"],
      ["boite",1.6,0.9,3.2,0.1,"TT1","4-20 mA"],["raccord",1.6,0.5,"p","+","h"],["raccord",3.2,0.5,"ai","−","h"],
      ["boite",4.4,0.4,6.8,-1.8,"API"],["raccord",4.4,-0.2,"ai","AI+"],["raccord",4.4,-1.4,"aim","AI−"],
      ["dipole","R",5.0,-0.2,"ai","aim",null,null,"v"],["texte",5.3,-0.8,"mesure","sous"],
      ["fleche2",0.6,0.5,1.0,0.5],["texte",0.8,0.75,"I","gras","milieu"],
      ...notes(2.6,-2.3,["Boucle série : le même courant (4 à 20 mA) traverse l'alimentation,","le transmetteur et l'entrée. 4 mA = début d'échelle ; 0 mA = boucle coupée."])]}
};

/* ---------- EL-052 : signal 0-10 V ---------- */
const el052={id:"EL-052",titre:"Signal analogique 0-10 V : câblage de principe",
  folio:Object.assign({vue:[-2.4,0.6,6.8,-4.9]},fusion(rails(-1.6,6.2,-3.4),{
    fils:[["p24",[[0.4,0],[0.4,-0.6]]],["z",[[0.4,-2.4],[0.4,-3.4]]],["s",[[1.8,-1.5],[3.8,-1.5]]],["z",[[3.8,-2.1],[3.2,-2.1],[3.2,-3.4]]]],
    joncs:[["p24",0.4,0],["z",0.4,-3.4],["z",3.2,-3.4]],
    dessin:[["boite",0,-0.6,1.8,-2.4,"TT1","0-10 V"],["raccord",0.4,-0.6,"p24","+24"],["raccord",0.4,-2.4,"z","0 V"],["raccord",1.8,-1.5,"s","OUT"],
      ["boite",3.8,-0.6,5.8,-2.4,"API","entrée 0-10 V"],["raccord",3.8,-1.5,"s","AI"],["raccord",3.8,-2.1,"z","0 V"],
      ["fleche2",2.6,-3.4,2.6,-1.5],["texte",2.7,-2.6,"U","gras"],
      ...notes(2.0,-3.85,["La tension U est mesurée entre AI et le 0 V commun.","Sur de grandes longueurs, préférer le 4-20 mA (moins sensible aux parasites)."])]
  }))
};

window.COURS_SCHEMAS=window.COURS_SCHEMAS.concat([el043,el044,el045,el045e,el046,el047,el048,el049,el050,el050e,el051,el052]);
})();
