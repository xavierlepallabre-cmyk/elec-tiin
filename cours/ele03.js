/* Élec TIIN — schémas des cours, ELE03 suite (EL-022 à EL-031) : commande et logique câblée. */
(function(){
"use strict";
const {NO,NF,rails,logique,fusion,ETATS_LEGENDE}=window.COURS_OUTILS;
const BP={type:"poussoir"};

/* schéma de l'application, folio i, avec les extrémités d'arrivée déclarées libres */
function appli(id,i,libres,retirer){
  const s=window.ELEC_SCHEMAS.find(x=>x.id===id);
  const f=JSON.parse(JSON.stringify(s.folios[i]));
  f.libres=libres||[];
  if(retirer)f.dessin=f.dessin.filter(c=>!retirer(c));
  delete f.zones;
  return {folio:f,logique:s};
}

/* ---------- EL-022 : deux boutons Marche en parallèle ---------- */
const el022={id:"EL-022",titre:"Commande avec deux boutons Marche en parallèle",
  folio:Object.assign({vue:[-2.5,0.55,5.0,-7.1]},fusion(rails(-1.6,4.4,-6.7),{
    fils:[["p24",[[0,0],[0,-0.3]]],["a1",[[0,-1.5],[0,-1.8]]],
      ["A",[[0,-3.0],[0,-3.5]]],["A",[[0,-3.25],[3.6,-3.25],[3.6,-3.5]]],["A",[[2.3,-3.25],[2.3,-3.5]]],
      ["B",[[0,-4.7],[0,-5.2]]],["B",[[3.6,-4.7],[3.6,-4.95],[0,-4.95]]],["B",[[2.3,-4.7],[2.3,-4.95]]],["z",[[0,-6.4],[0,-6.7]]]],
    joncs:[["p24",0,0],["A",0,-3.25],["A",2.3,-3.25],["B",0,-4.95],["B",2.3,-4.95],["z",0,-6.7]],
    contacts:[NF("S1c","S1",0,-1.8,"a1","A",["11","12"]),NO("S2c","S2",0,-3.5,"A","B",["13","14"]),
      NO("S3c","S3",2.3,-3.5,"A","B",["13","14"]),NO("KMa","KM1",3.6,-3.5,"A","B",["13","14"])],
    dessin:[["fusible",0,-0.3,"p24","a1","FU1"],["poussoir","S1c",-0.8,"S1","Arrêt"],
      ["poussoir","S2c",-0.8,"S2","Marche 1"],["poussoir","S3c",1.5,"S3","Marche 2"],["rep",3.92,-4.1,"KM1"],
      ["bobine","bKM1",0,-5.2,"B","z","KM1"]]
  })),
  logique:logique({S1:BP,S2:BP,S3:BP,KM1:{type:"contacteur",bobine:"bKM1"}},[{id:"bKM1",type:"bobine",a:"B",b:"z"}])
};

/* ---------- EL-023 : deux boutons Arrêt en série ---------- */
const el023={id:"EL-023",titre:"Commande avec deux boutons Arrêt en série",
  folio:Object.assign({vue:[-2.6,0.55,2.4,-8.6]},fusion(rails(-1.6,1.8,-8.2),{
    fils:[["p24",[[0,0],[0,-0.3]]],["a1",[[0,-1.5],[0,-1.8]]],["a2",[[0,-3.0],[0,-3.3]]],
      ["A",[[0,-4.5],[0,-5.0]]],["A",[[0,-4.75],[1.3,-4.75],[1.3,-5.0]]],
      ["B",[[0,-6.2],[0,-6.7]]],["B",[[1.3,-6.2],[1.3,-6.45],[0,-6.45]]],["z",[[0,-7.9],[0,-8.2]]]],
    joncs:[["p24",0,0],["A",0,-4.75],["B",0,-6.45],["z",0,-8.2]],
    contacts:[NF("S1c","S1",0,-1.8,"a1","a2",["11","12"]),NF("S3c","S3",0,-3.3,"a2","A",["11","12"]),
      NO("S2c","S2",0,-5.0,"A","B",["13","14"]),NO("KMa","KM1",1.3,-5.0,"A","B",["13","14"])],
    dessin:[["fusible",0,-0.3,"p24","a1","FU1"],["poussoir","S1c",-0.8,"S1","Arrêt 1"],["poussoir","S3c",-0.8,"S3","Arrêt 2"],
      ["poussoir","S2c",-0.8,"S2","Marche"],["rep",1.62,-5.6,"KM1"],["bobine","bKM1",0,-6.7,"B","z","KM1"]]
  })),
  logique:logique({S1:BP,S2:BP,S3:BP,KM1:{type:"contacteur",bobine:"bKM1"}},[{id:"bKM1",type:"bobine",a:"B",b:"z"}])
};

/* ---------- EL-024 : logique câblée ET, OU, NON ---------- */
const el024={id:"EL-024",titre:"Logique câblée ET, OU, NON avec contacts NO et NF",
  folio:Object.assign({vue:[-2.4,0.85,7.6,-5.6]},fusion(rails(-1.6,7.0,-4.8),{
    fils:[["p24",[[0,0],[0,-0.3]]],["e1",[[0,-1.5],[0,-1.8]]],["e2",[[0,-3.0],[0,-3.3]]],["z",[[0,-4.5],[0,-4.8]]],
      ["p24",[[2.6,0],[2.6,-0.3]]],["p24",[[4.3,0],[4.3,-0.3]]],["o1",[[2.6,-1.5],[2.6,-3.3]]],["o1",[[4.3,-1.5],[4.3,-1.8],[2.6,-1.8]]],["z",[[2.6,-4.5],[2.6,-4.8]]],
      ["p24",[[6.2,0],[6.2,-0.3]]],["n1",[[6.2,-1.5],[6.2,-3.3]]],["z",[[6.2,-4.5],[6.2,-4.8]]]],
    joncs:[["p24",0,0],["p24",2.6,0],["p24",4.3,0],["p24",6.2,0],["o1",2.6,-1.8],["z",0,-4.8],["z",2.6,-4.8],["z",6.2,-4.8]],
    contacts:[NO("S1c","S1",0,-0.3,"p24","e1",["13","14"]),NO("S2c","S2",0,-1.8,"e1","e2",["13","14"]),
      NO("S3c","S3",2.6,-0.3,"p24","o1",["13","14"]),NO("S4c","S4",4.3,-0.3,"p24","o1",["13","14"]),
      NF("S5c","S5",6.2,-0.3,"p24","n1",["11","12"])],
    dessin:[["poussoir","S1c",-0.8,"S1"],["poussoir","S2c",-0.8,"S2"],["poussoir","S3c",1.8,"S3"],["poussoir","S4c",3.5,"S4"],["poussoir","S5c",5.4,"S5"],
      ["voyant","H1",0,-3.3,"e2","z","H1","vert"],["voyant","H2",2.6,-3.3,"o1","z","H2","vert"],["voyant","H3",6.2,-3.3,"n1","z","H3","vert"],
      ["texte",0,0.5,"ET (série)","gras","milieu"],["texte",3.45,0.5,"OU (parallèle)","gras","milieu"],["texte",6.2,0.5,"NON (contact NF)","gras","milieu"],
      ["texte",0,-5.25,"H1 = S1 ET S2","note","milieu"],["texte",3.45,-5.25,"H2 = S3 OU S4","note","milieu"],["texte",6.2,-5.25,"H3 = NON S5","note","milieu"]]
  })),
  logique:logique({S1:BP,S2:BP,S3:BP,S4:BP,S5:BP},[{id:"H1",type:"voyant",a:"e2",b:"z"},{id:"H2",type:"voyant",a:"o1",b:"z"},{id:"H3",type:"voyant",a:"n1",b:"z"}])
};

/* ---------- EL-025 : relais intermédiaire et relais temporisé ---------- */
function el025folio(){
  return Object.assign({vue:[-2.4,0.55,5.9,-5.2]},fusion(rails(-1.6,5.4,-4.8),{
    fils:[["p24",[[0,0],[0,-0.3]]],["k1",[[0,-1.5],[0,-3.3]]],["z",[[0,-4.5],[0,-4.8]]],
      ["p24",[[2,0],[2,-0.3]]],["k2",[[2,-1.5],[2,-3.3]]],["z",[[2,-4.5],[2,-4.8]]],
      ["p24",[[4.6,0],[4.6,-0.3]]],["k3",[[4.6,-1.5],[4.6,-3.3]]],["z",[[4.6,-4.5],[4.6,-4.8]]]],
    joncs:[["p24",0,0],["p24",2,0],["p24",4.6,0],["z",0,-4.8],["z",2,-4.8],["z",4.6,-4.8]],
    contacts:[NO("S1c","S1",0,-0.3,"p24","k1",["13","14"]),NO("KA1a","KA1",2,-0.3,"p24","k2",["13","14"]),
      {id:"KA2t",app:"KA2",mode:"tno",type:"no",x:4.6,y:-0.3,haut:"p24",bas:"k3",b:["67","68"]}],
    dessin:[["poussoir","S1c",-0.8,"S1","Marche"],["rep",2.32,-0.9,"KA1"],["lienTempo","KA2t",0.5,"KA2"],
      ["bobine","bKA1",0,-3.3,"k1","z","KA1"],["texte",-0.5,-3.8,"relais","sous","fin"],["texte",-0.5,-4.02,"intermédiaire","sous","fin"],
      ["bobine","bKA2",2,-3.3,"k2","z","KA2"],
      ["cadre",2.42,-3.6,2.72,-4.2],["trait",[[2.42,-3.6],[2.72,-4.2]]],["trait",[[2.42,-4.2],[2.72,-3.6]]],
      ["texte",2.82,-3.75,"temporisé","sous"],["texte",2.82,-3.97,"au travail","sous"],["texte",2.82,-4.19,"t = 5 s","sous"],
      ["voyant","H1",4.6,-3.3,"k3","z","H1","vert"]]
  }));
}
const el025L=logique({S1:BP,KA1:{type:"contacteur",bobine:"bKA1"},KA2:{type:"contacteur",bobine:"bKA2",tempo:5}},
  [{id:"bKA1",type:"bobine",a:"k1",b:"z"},{id:"bKA2",type:"bobine",a:"k2",b:"z"},{id:"H1",type:"voyant",a:"k3",b:"z"}]);
const el025={id:"EL-025",titre:"Relais intermédiaire et relais temporisé",folio:el025folio(),logique:el025L};
const el025e={id:"EL-025-etats",titre:"Relais temporisé au travail : états successifs",colonnes:2,legende:ETATS_LEGENDE,folio:el025folio(),logique:el025L,
  etats:[
    {titre:"1. Repos",actions:[],attendu:{bKA1:false,bKA2:false,H1:false}},
    {titre:"2. S1 appuyé (t = 0)",actions:[["appuyer","S1",true]],attendu:{bKA1:true,bKA2:true,H1:false},note:"la temporisation de KA2 démarre"},
    {titre:"3. S1 maintenu, t = 5 s",actions:[["attendre",5]],attendu:{bKA1:true,bKA2:true,H1:true},note:"le contact 67-68 se ferme"},
    {titre:"4. S1 relâché",actions:[["appuyer","S1",false]],attendu:{bKA1:false,bKA2:false,H1:false},note:"67-68 s'ouvre aussitôt"}
  ]};

/* ---------- EL-026 : commande par capteur tout ou rien ---------- */
function el026folio(){
  return Object.assign({vue:[-2.6,0.55,3.4,-3.7]},fusion(rails(-1.8,2.4,-3.3),{
    fils:[["p24",[[0,0],[0,-0.3]]],["c1",[[0,-1.5],[0,-1.8]]],["c1",[[0,-1.65],[1.6,-1.65],[1.6,-1.8]]],["z",[[0,-3.0],[0,-3.3]]],["z",[[1.6,-3.0],[1.6,-3.3]]]],
    joncs:[["p24",0,0],["c1",0,-1.65],["z",0,-3.3],["z",1.6,-3.3]],
    contacts:[NO("B1c","B1",0,-0.3,"p24","c1",["13","14"])],
    dessin:[["tirets",[[-0.16,-0.88],[-0.8,-0.88]]],["cadre",-1.16,-0.7,-0.8,-1.06],["losange",-0.98,-0.88,0.13],
      ["rep",-1.26,-0.88,"B1","capteur","fin"],
      ["bobine","bKA1",0,-1.8,"c1","z","KA1"],["voyant","H1",1.6,-1.8,"c1","z","H1","vert"],["texte",1.92,-2.72,"objet détecté","sous"]]
  }));
}
const el026L=logique({B1:BP,KA1:{type:"contacteur",bobine:"bKA1"}},[{id:"bKA1",type:"bobine",a:"c1",b:"z"},{id:"H1",type:"voyant",a:"c1",b:"z"}]);
const el026={id:"EL-026",titre:"Commande par capteur tout ou rien",folio:el026folio(),logique:el026L};
const el026e={id:"EL-026-etats",titre:"Capteur tout ou rien : deux états",colonnes:2,legende:ETATS_LEGENDE,folio:el026folio(),logique:el026L,
  etats:[{titre:"Aucun objet",actions:[],attendu:{bKA1:false,H1:false}},
    {titre:"Objet devant le capteur",actions:[["appuyer","B1",true]],attendu:{bKA1:true,H1:true}}]};

/* ---------- EL-027 : signalisation disponibilité, marche, défaut ---------- */
function el027folio(){
  return Object.assign({vue:[-2.4,0.55,7.4,-8.6]},fusion(rails(-1.6,6.6,-8.2),{
    fils:[["p24",[[0,0],[0,-0.3]]],["a1",[[0,-1.5],[0,-1.8]]],["a1",[[0,-1.65],[5.9,-1.65],[5.9,-1.9]]],
      ["a2",[[0,-3.0],[0,-3.3]]],["a2",[[0,-3.15],[3.9,-3.15],[3.9,-3.4]]],["a2",[[2.6,-3.15],[2.6,-3.4]]],
      ["A",[[0,-4.5],[0,-5.0]]],["A",[[0,-4.75],[1.3,-4.75],[1.3,-5.0]]],
      ["B",[[0,-6.2],[0,-6.7]]],["B",[[1.3,-6.2],[1.3,-6.45],[0,-6.45]]],
      ["m1",[[2.6,-4.6],[2.6,-6.7]]],["d1",[[3.9,-4.6],[3.9,-6.7]]],["f1",[[5.9,-3.1],[5.9,-6.7]]],
      ["z",[[0,-7.9],[0,-8.2]]],["z",[[2.6,-7.9],[2.6,-8.2]]],["z",[[3.9,-7.9],[3.9,-8.2]]],["z",[[5.9,-7.9],[5.9,-8.2]]]],
    joncs:[["p24",0,0],["a1",0,-1.65],["a2",0,-3.15],["a2",2.6,-3.15],["A",0,-4.75],["B",0,-6.45],
      ["z",0,-8.2],["z",2.6,-8.2],["z",3.9,-8.2],["z",5.9,-8.2]],
    contacts:[NF("F1c","F1",0,-1.8,"a1","a2",["95","96"]),NF("S1c","S1",0,-3.3,"a2","A",["11","12"]),
      NO("S2c","S2",0,-5.0,"A","B",["13","14"]),NO("KMa","KM1",1.3,-5.0,"A","B",["13","14"]),
      NO("KMm","KM1",2.6,-3.4,"a2","m1",["43","44"]),NF("KMd","KM1",3.9,-3.4,"a2","d1",["21","22"]),
      NO("F1d","F1",5.9,-1.9,"a1","f1",["97","98"])],
    dessin:[["fusible",0,-0.3,"p24","a1","FU1"],["lienTherm","F1c",0.6,"F1"],["lienTherm","F1d",0.6,"F1"],
      ["poussoir","S1c",-0.8,"S1","Arrêt"],["poussoir","S2c",-0.8,"S2","Marche"],["rep",1.62,-5.6,"KM1"],
      ["rep",2.92,-4.0,"KM1"],["rep",4.4,-4.0,"KM1"],
      ["bobine","bKM1",0,-6.7,"B","z","KM1"],
      ["voyant","H1",2.6,-6.7,"m1","z","H1","vert"],["texte",2.92,-7.62,"marche","sous"],
      ["voyant","H3",3.9,-6.7,"d1","z","H3","blanc"],["texte",4.22,-7.62,"disponible","sous"],
      ["voyant","H2",5.9,-6.7,"f1","z","H2","rouge"],["texte",6.22,-7.62,"défaut","sous"]]
  }));
}
const el027L=logique({F1:{type:"thermique"},S1:BP,S2:BP,KM1:{type:"contacteur",bobine:"bKM1"}},
  [{id:"bKM1",type:"bobine",a:"B",b:"z"},{id:"H1",type:"voyant",a:"m1",b:"z"},{id:"H3",type:"voyant",a:"d1",b:"z"},{id:"H2",type:"voyant",a:"f1",b:"z"}]);
const el027={id:"EL-027",titre:"Signalisation des états : disponibilité, marche, défaut",folio:el027folio(),logique:el027L};
const el027e={id:"EL-027-etats",titre:"Signalisation : trois états",colonnes:3,legende:ETATS_LEGENDE,folio:el027folio(),logique:el027L,
  etats:[{titre:"1. Disponible",actions:[],attendu:{bKM1:false,H1:false,H2:false,H3:true}},
    {titre:"2. En marche",actions:[["appuyer","S2",true],["appuyer","S2",false]],attendu:{bKM1:true,H1:true,H2:false,H3:false}},
    {titre:"3. Défaut thermique",actions:[["declencher","F1"]],attendu:{bKM1:false,H1:false,H2:true,H3:false}}]};

/* ---------- EL-028 à EL-031 : schémas de l'Atelier ---------- */
const el028=Object.assign({id:"EL-028",titre:"Démarrage direct d'un moteur : puissance et commande"},
  appli("direct-un-sens",0,[[0,2.6],[0.8,2.6],[1.6,2.6]],c=>c[0]==="fil"&&c[1]==="s0"));
const el029=Object.assign({id:"EL-029",titre:"Inversion de sens d'un moteur : puissance"},
  appli("deux-sens",0,[[-0.5,0],[6.4,0],[-0.5,-0.35],[6.4,-0.35],[-0.5,-0.7],[6.4,-0.7]]));
const el030=Object.assign({id:"EL-030",titre:"Inversion de sens : commande et verrouillages"},appli("deux-sens",1,[[-4.4,0],[-4.4,-9.7]]));
const el031=Object.assign({id:"EL-031",titre:"Inversion de sens : séquence et ordres simultanés impossibles",colonnes:2,
  legende:"Trait épais : conducteur relié à la phase L. Bobine ou voyant grisé : alimenté."},appli("deux-sens",1,[[-4.4,0],[-4.4,-9.7]]),{
  etats:[
    {titre:"1. Sens 1 : S2 appuyé puis relâché",actions:[["appuyer","S2",true],["appuyer","S2",false]],attendu:{bKM1:true,bKM2:false}},
    {titre:"2. S3 appuyé pendant le sens 1",actions:[["appuyer","S3",true]],attendu:{bKM1:true,bKM2:false},note:"KM1 21-22 ouvert : KM2 ne peut pas s'enclencher"},
    {titre:"3. Arrêt : S1 appuyé puis relâché",actions:[["appuyer","S3",false],["appuyer","S1",true],["appuyer","S1",false]],attendu:{bKM1:false,bKM2:false}},
    {titre:"4. Sens 2 : S3 appuyé puis relâché",actions:[["appuyer","S3",true],["appuyer","S3",false]],attendu:{bKM1:false,bKM2:true}}
  ]});

window.COURS_OUTILS.appli=appli;
window.COURS_SCHEMAS=window.COURS_SCHEMAS.concat([el022,el023,el024,el025,el025e,el026,el026e,el027,el027e,el028,el029,el030,el031]);
})();
