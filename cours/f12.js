/* Élec TIIN — schémas des cours, lot F12 (ELE03 : contacteur et auto-maintien).
   Chaque schéma est décrit avec la même bibliothèque que l'Atelier (coordonnées en cm, y vers le haut)
   et avec sa logique (appareils, sources, récepteurs) : le générateur vérifie que le dessin est
   cohérent (bornes raccordées, jonctions, pas de court-circuit dessiné) puis calcule les états
   avec le moteur de simulation de l'application.
   Circuit de référence (ELEC-COU-02) : +24 V → FU1 → F1 95-96 → S1 (NF) → A → [S2 (NO) ∥ KM1 13-14] → B → KM1 A1-A2 ∥ H1 → 0 V. */
(function(){
"use strict";

/* ---------- briques ---------- */
const NO=(id,app,x,y,haut,bas,b,extra)=>Object.assign({id,app,type:"no",x,y,haut,bas,b},extra||{});
const NF=(id,app,x,y,haut,bas,b,extra)=>Object.assign({id,app,type:"nf",mode:"nf",x,y,haut,bas,b},extra||{});

/* rails +24 V (y = 0) et 0 V (y = yb), de x1 à x2 ; les extrémités sont libres */
function rails(x1,x2,yb){
  return {
    fils:[["p24",[[x1,0],[x2,0]]],["z",[[x1,yb],[x2,yb]]]],
    dessin:[["fleche",x1,x1+0.2,0,"+24 V"],["texte",x1-0.08,yb,"0 V","petit","fin"]],
    libres:[[x1,0],[x2,0],[x1,yb],[x2,yb]]
  };
}
/* logique commune : alimentation coupable (non dessinée) et fusible FU1 */
function logique(appareils,charges,caches){
  return {
    appareils:Object.assign({ALIM:{type:"manuel",nom:"Alimentation 24 V"},FU1:{type:"manuel",nom:"Fusible de commande"}},appareils),
    sources:[{net:"src",nom:"+24V",type:"phase"},{net:"z",nom:"0V",type:"neutre"}],
    charges,
    contactsCaches:[{id:"ALIMc",app:"ALIM",type:"no",haut:"src",bas:"p24"},{id:"FU1c",app:"FU1",type:"no",haut:"p24",bas:"a1"}].concat(caches||[]),
    protections:[{noms:["+24V","0V"],app:"FU1",texte:"Court-circuit : FU1 fond."}]
  };
}
function fusion(...parts){
  const r={fils:[],joncs:[],contacts:[],dessin:[],libres:[]};
  parts.forEach(p=>{for(const k in r)if(p[k])r[k]=r[k].concat(p[k]);});
  return r;
}

/* ---------- EL-015 : contacteur, bobine, contacts principaux et auxiliaires ---------- */
const el015={
  id:"EL-015",titre:"Contacteur : bobine, contacts principaux et auxiliaires",
  controle:false, // représentation d'un appareil, pas un circuit
  folio:{
    vue:[-1.2,1.35,6.6,-2.0],
    contacts:[
      {id:"P1",app:"KM1",type:"kmp",x:1.6,y:0,haut:"x",bas:"x",b:["1","2"],bpos:"p"},
      {id:"P2",app:"KM1",type:"kmp",x:2.4,y:0,haut:"x",bas:"x",b:["3","4"],bpos:"p"},
      {id:"P3",app:"KM1",type:"kmp",x:3.2,y:0,haut:"x",bas:"x",b:["5","6"],bpos:"p"},
      NO("A1","KM1",4.5,0,"x","x",["13","14"]),
      NF("A2","KM1",5.5,0,"x","x",["21","22"])
    ],
    dessin:[
      ["bobine","bKM1",0,0,"x","x","KM1"],
      ["tirets",[[0.42,-0.6],[5.7,-0.6]]],
      ["texte",2.4,0.95,"contacts principaux","note","milieu"],["texte",2.4,0.62,"(puissance)","note","milieu"],
      ["texte",5.0,0.95,"contacts auxiliaires","note","milieu"],["texte",5.0,0.62,"(commande)","note","milieu"],
      ["texte",0,0.62,"bobine","note","milieu"],
      ["texte",2.8,-1.6,"liaison mécanique : la bobine manœuvre tous les contacts","note","milieu"]
    ]
  }
};

/* ---------- EL-016 : Marche / Arrêt sans auto-maintien ---------- */
const el016={
  id:"EL-016",titre:"Commande Marche / Arrêt sans auto-maintien",
  folio:Object.assign({vue:[-2.5,0.55,1.6,-6.7]},fusion(rails(-1.6,1.0,-6.3),{
    fils:[["p24",[[0,0],[0,-0.3]]],["a1",[[0,-1.5],[0,-1.8]]],["a2",[[0,-3.0],[0,-3.3]]],["b1",[[0,-4.5],[0,-4.8]]],["z",[[0,-6.0],[0,-6.3]]]],
    joncs:[["p24",0,0],["z",0,-6.3]],
    contacts:[NF("S1c","S1",0,-1.8,"a1","a2",["11","12"]),NO("S2c","S2",0,-3.3,"a2","b1",["13","14"])],
    dessin:[["fusible",0,-0.3,"p24","a1","FU1"],["poussoir","S1c",-0.8,"S1","Arrêt"],["poussoir","S2c",-0.8,"S2","Marche"],
      ["bobine","bKM1",0,-4.8,"b1","z","KM1"]]
  })),
  logique:logique({S1:{type:"poussoir"},S2:{type:"poussoir"},KM1:{type:"contacteur",bobine:"bKM1"}},[{id:"bKM1",type:"bobine",a:"b1",b:"z"}])
};

/* ---------- EL-017 : Marche / Arrêt avec auto-maintien ---------- */
const el017={
  id:"EL-017",titre:"Commande Marche / Arrêt avec auto-maintien",
  folio:Object.assign({vue:[-2.5,0.55,2.4,-7.1]},fusion(rails(-1.6,1.8,-6.7),{
    fils:[["p24",[[0,0],[0,-0.3]]],["a1",[[0,-1.5],[0,-1.8]]],
      ["A",[[0,-3.0],[0,-3.5]]],["A",[[0,-3.25],[1.3,-3.25],[1.3,-3.5]]],
      ["B",[[0,-4.7],[0,-5.2]]],["B",[[1.3,-4.7],[1.3,-4.95],[0,-4.95]]],["z",[[0,-6.4],[0,-6.7]]]],
    joncs:[["p24",0,0],["A",0,-3.25],["B",0,-4.95],["z",0,-6.7]],
    contacts:[NF("S1c","S1",0,-1.8,"a1","A",["11","12"]),NO("S2c","S2",0,-3.5,"A","B",["13","14"]),NO("KMa","KM1",1.3,-3.5,"A","B",["13","14"])],
    dessin:[["fusible",0,-0.3,"p24","a1","FU1"],["poussoir","S1c",-0.8,"S1","Arrêt"],["poussoir","S2c",-0.8,"S2","Marche"],
      ["rep",1.62,-4.1,"KM1"],["texte",-0.14,-3.12,"A","gras","fin"],["texte",-0.14,-5.08,"B","gras","fin"],
      ["bobine","bKM1",0,-5.2,"B","z","KM1"]]
  })),
  logique:logique({S1:{type:"poussoir"},S2:{type:"poussoir"},KM1:{type:"contacteur",bobine:"bKM1"}},[{id:"bKM1",type:"bobine",a:"B",b:"z"}])
};

/* ---------- EL-018 : auto-maintien complet, relais thermique F1 et voyant H1 ---------- */
function complet(avecH2){
  const xr=avecH2?5.2:3.2;
  const f=fusion(rails(-1.6,xr,-8.2),{
    fils:[["p24",[[0,0],[0,-0.3]]],["a1",[[0,-1.5],[0,-1.8]]],["a2",[[0,-3.0],[0,-3.3]]],
      ["A",[[0,-4.5],[0,-5.0]]],["A",[[0,-4.75],[1.3,-4.75],[1.3,-5.0]]],
      ["B",[[0,-6.2],[0,-6.7]]],["B",[[1.3,-6.2],[1.3,-6.45],[0,-6.45]]],["B",[[1.3,-6.45],[2.6,-6.45],[2.6,-6.7]]],
      ["z",[[0,-7.9],[0,-8.2]]],["z",[[2.6,-7.9],[2.6,-8.2]]]],
    joncs:[["p24",0,0],["A",0,-4.75],["B",0,-6.45],["B",1.3,-6.45],["z",0,-8.2],["z",2.6,-8.2]],
    contacts:[NF("F1c","F1",0,-1.8,"a1","a2",["95","96"]),NF("S1c","S1",0,-3.3,"a2","A",["11","12"]),
      NO("S2c","S2",0,-5.0,"A","B",["13","14"]),NO("KMa","KM1",1.3,-5.0,"A","B",["13","14"])],
    dessin:[["fusible",0,-0.3,"p24","a1","FU1"],["lienTherm","F1c",0.6,"F1"],
      ["poussoir","S1c",-0.8,"S1","Arrêt"],["poussoir","S2c",-0.8,"S2","Marche"],
      ["rep",1.62,-5.6,"KM1"],["texte",-0.14,-4.62,"A","gras","fin"],["texte",-0.14,-6.58,"B","gras","fin"],
      ["bobine","bKM1",0,-6.7,"B","z","KM1"],["voyant","H1",2.6,-6.7,"B","z","H1","vert"],["texte",2.92,-7.62,"KM1 alimenté","sous"]]
  });
  const appareils={F1:{type:"thermique"},S1:{type:"poussoir"},S2:{type:"poussoir"},KM1:{type:"contacteur",bobine:"bKM1"}};
  const charges=[{id:"bKM1",type:"bobine",a:"B",b:"z"},{id:"H1",type:"voyant",a:"B",b:"z"}];
  if(avecH2){
    f.fils.push(["a1",[[0,-1.65],[4.6,-1.65],[4.6,-1.9]]],["d1",[[4.6,-3.1],[4.6,-6.7]]],["z",[[4.6,-7.9],[4.6,-8.2]]]);
    f.joncs.push(["a1",0,-1.65],["z",4.6,-8.2]);
    f.contacts.push(NO("F1d","F1",4.6,-1.9,"a1","d1",["97","98"]));
    f.dessin.push(["lienTherm","F1d",0.6,"F1"],["voyant","H2",4.6,-6.7,"d1","z","H2","rouge"],["texte",4.92,-7.62,"défaut F1","sous"]);
    charges.push({id:"H2",type:"voyant",a:"d1",b:"z"});
  }
  f.vue=[-2.4,0.55,avecH2?6.0:4.3,-8.6];
  return {folio:f,logique:logique(appareils,charges)};
}
const c18=complet(false),c21=complet(true);
const el018=Object.assign({id:"EL-018",titre:"Auto-maintien complet avec relais thermique F1 et voyant H1"},c18);

/* ---------- vues d'états (actions successives sur la même simulation) ---------- */
const ETATS_LEGENDE="Trait épais : conducteur relié au +24 V. Bobine ou voyant grisé : alimenté.";
const el019=Object.assign({id:"EL-019",titre:"Auto-maintien : états successifs",colonnes:3,legende:ETATS_LEGENDE},c18,{
  etats:[
    {titre:"1. Repos",actions:[],attendu:{bKM1:false,H1:false}},
    {titre:"2. Marche appuyé",actions:[["appuyer","S2",true]],attendu:{bKM1:true,H1:true}},
    {titre:"3. Marche relâché : maintien",actions:[["appuyer","S2",false]],attendu:{bKM1:true,H1:true}},
    {titre:"4. Arrêt appuyé",actions:[["appuyer","S1",true]],attendu:{bKM1:false,H1:false}},
    {titre:"5. Coupure de l'alimentation en marche",actions:[["appuyer","S1",false],["appuyer","S2",true],["appuyer","S2",false],["basculer","ALIM"]],attendu:{bKM1:false,H1:false}},
    {titre:"6. Retour de l'alimentation",actions:[["basculer","ALIM"]],attendu:{bKM1:false,H1:false},
      note:"KM1 ne se réenclenche pas seul"}
  ]
});
const el020=Object.assign({id:"EL-020",titre:"Auto-maintien : défaut de contact auxiliaire — schéma de l'exercice"},complet(false));
el020.folio.dessin.push(["texte",2.5,-5.6,"(1)","gras"],["texte",0.72,-4.97,"(2)","gras","milieu"],["texte",0.72,-6.22,"(3)","gras","milieu"]);
const el020c=Object.assign({id:"EL-020-corrige",titre:"Auto-maintien : défaut de contact auxiliaire — corrigé",colonnes:2,legende:ETATS_LEGENDE},c18,{
  pannes:{ouverts:["KMa"]},
  etats:[
    {titre:"Marche appuyé",actions:[["appuyer","S2",true]],attendu:{bKM1:true,H1:true},note:"le contact KM1 13-14 reste ouvert"},
    {titre:"Marche relâché",actions:[["appuyer","S2",false]],attendu:{bKM1:false,H1:false},note:"rien ne relaie S2 : KM1 retombe"}
  ]
});
const el021=Object.assign({id:"EL-021",titre:"Auto-maintien : déclenchement thermique et signalisation"},c21);
const el021e=Object.assign({id:"EL-021-etats",titre:"Déclenchement thermique : états successifs",colonnes:3,legende:ETATS_LEGENDE},c21,{
  etats:[
    {titre:"1. En marche (maintien)",actions:[["appuyer","S2",true],["appuyer","S2",false]],attendu:{bKM1:true,H1:true,H2:false}},
    {titre:"2. Surcharge : F1 déclenche",actions:[["declencher","F1"]],attendu:{bKM1:false,H1:false,H2:true}},
    {titre:"3. F1 réarmé",actions:[["basculer","F1"]],attendu:{bKM1:false,H1:false,H2:false},note:"KM1 reste au repos : appuyer sur Marche"}
  ]
});

window.COURS_OUTILS={NO,NF,rails,logique,fusion,ETATS_LEGENDE};
window.COURS_SCHEMAS=(window.COURS_SCHEMAS||[]).concat([el015,el016,el017,el018,el019,el020,el020c,el021,el021e]);
})();
