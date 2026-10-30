/* Démarrage direct un sens de marche — puissance et commande 24 V sur un même folio.
   Coordonnées en cm, identiques au fichier LaTeX schema-simple-sens.tex. */
(window.ELEC_SCHEMAS=window.ELEC_SCHEMAS||[]).push({
  id:"direct-un-sens",
  titre:"Démarrage direct un sens",
  resume:"Disjoncteur-moteur, contacteur de ligne et commande 24 V par transformateur. Marche, arrêt, auto-maintien.",
  notions:["Auto-maintien","Sectionnement","Protection magnéto-thermique","Commande TBTS 24 V"],

  appareils:{
    QS:{type:"manuel",nom:"Interrupteur-sectionneur général"},
    Q1:{type:"manuel",nom:"Disjoncteur-moteur",declencheLib:"déclenché"},
    Q3:{type:"manuel",nom:"Disjoncteur du primaire de T1",declencheLib:"déclenché"},
    Q2:{type:"manuel",nom:"Disjoncteur de commande",declencheLib:"déclenché"},
    S1:{type:"poussoir",nom:"Bouton Arrêt"},
    S2:{type:"poussoir",nom:"Bouton Marche"},
    KM1:{type:"contacteur",nom:"Contacteur de ligne",bobine:"bKM1"}
  },
  sources:[
    {net:"in1",nom:"L1",type:"phase"},{net:"in2",nom:"L2",type:"phase"},{net:"in3",nom:"L3",type:"phase"},
    {net:"s24",nom:"24V",type:"phase",si:"T1"},{net:"s0",nom:"0V",type:"neutre",si:"T1"}
  ],
  charges:[
    {id:"T1",type:"transfo",a:"p1",b:"p2"},
    {id:"bKM1",type:"bobine",a:"c4",b:"s0"}
  ],
  protections:[
    {noms:["L1","L2","L3"],app:"Q1",texte:"Court-circuit côté moteur : Q1 a déclenché."},
    {noms:["24V","0V"],app:"Q2",texte:"Court-circuit dans la commande : Q2 a déclenché."}
  ],
  moteur:{type:"direct",bornes:["m1","m2","m3"]},

  folios:[{
    titre:"Puissance et commande",
    vue:[-3.7,3.3,10.6,-11.6],
    fils:[
      ["in1",[[0,2.6],[0,2.2]]],["in2",[[0.8,2.6],[0.8,2.2]]],["in3",[[1.6,2.6],[1.6,2.2]]],
      ["b1",[[0,1.0],[0,-1.0]]],["b1",[[0,0],[4.6,0],[4.6,-1.0]]],
      ["b2",[[0.8,1.0],[0.8,-1.0]]],["b2",[[0.8,-0.35],[5.4,-0.35],[5.4,-1.0]]],
      ["b3",[[1.6,1.0],[1.6,-1.0]]],
      ["q1",[[0,-2.2],[0,-3.4]]],["q2",[[0.8,-2.2],[0.8,-3.4]]],["q3",[[1.6,-2.2],[1.6,-3.4]]],
      ["m1",[[0,-4.6],[0,-6.2]]],["m2",[[0.8,-4.6],[0.8,-5.8]]],["m3",[[1.6,-4.6],[1.6,-6.2]]],
      ["p1",[[4.6,-2.2],[4.6,-2.4],[4.85,-2.4],[4.85,-2.634]]],
      ["p2",[[5.4,-2.2],[5.4,-2.4],[5.15,-2.4],[5.15,-2.634]]],
      ["s24",[[5.15,-3.766],[5.15,-4.0],[7.6,-4.0],[7.6,-4.1]]],
      ["s0",[[4.85,-3.766],[4.85,-10.9],[7.6,-10.9],[7.6,-10.7]]],["s0",[[4.85,-10.9],[4.85,-11.15]]],
      ["c3",[[7.6,-7.7],[7.6,-7.9],[8.9,-7.9],[8.9,-8.1]]],["c3",[[7.6,-7.9],[7.6,-8.1]]],
      ["c4",[[8.9,-9.3],[8.9,-9.5],[7.6,-9.5]]],["c4",[[7.6,-9.3],[7.6,-9.5]]]
    ],
    joncs:[["b1",0,0],["b2",0.8,-0.35],["s0",4.85,-10.9],["c3",7.6,-7.9],["c4",7.6,-9.5]],
    contacts:[
      {id:"QS1",app:"QS",type:"isect",x:0,y:2.2,haut:"in1",bas:"b1",b:["1","2"],bpos:"p"},
      {id:"QS2",app:"QS",type:"isect",x:0.8,y:2.2,haut:"in2",bas:"b2",b:["3","4"],bpos:"p"},
      {id:"QS3",app:"QS",type:"isect",x:1.6,y:2.2,haut:"in3",bas:"b3",b:["5","6"],bpos:"p"},
      {id:"Q11",app:"Q1",type:"disjs",x:0,y:-1.0,haut:"b1",bas:"q1",b:["1","2"],bpos:"p"},
      {id:"Q12",app:"Q1",type:"disjs",x:0.8,y:-1.0,haut:"b2",bas:"q2",b:["3","4"],bpos:"p"},
      {id:"Q13",app:"Q1",type:"disjs",x:1.6,y:-1.0,haut:"b3",bas:"q3",b:["5","6"],bpos:"p"},
      {id:"K11",app:"KM1",type:"kmp",x:0,y:-3.4,haut:"q1",bas:"m1",b:["1","2"],bpos:"p"},
      {id:"K12",app:"KM1",type:"kmp",x:0.8,y:-3.4,haut:"q2",bas:"m2",b:["3","4"],bpos:"p"},
      {id:"K13",app:"KM1",type:"kmp",x:1.6,y:-3.4,haut:"q3",bas:"m3",b:["5","6"],bpos:"p"},
      {id:"Q31",app:"Q3",type:"disj",x:4.6,y:-1.0,haut:"b1",bas:"p1",b:["1","2"],bpos:"p"},
      {id:"Q32",app:"Q3",type:"disj",x:5.4,y:-1.0,haut:"b2",bas:"p2",b:["3","4"],bpos:"p"},
      {id:"Q2c",app:"Q2",type:"disj",x:7.6,y:-4.1,haut:"s24",bas:"c1"},
      {id:"Q1a",app:"Q1",type:"no",x:7.6,y:-5.3,haut:"c1",bas:"c2",b:["13","14"]},
      {id:"S1c",app:"S1",mode:"nf",type:"nf",x:7.6,y:-6.5,haut:"c2",bas:"c3",b:["11","12"]},
      {id:"S2c",app:"S2",type:"no",x:7.6,y:-8.1,haut:"c3",bas:"c4",b:["13","14"]},
      {id:"KMa",app:"KM1",type:"no",x:8.9,y:-8.1,haut:"c3",bas:"c4",b:["13","14"]}
    ],
    dessin:[
      ["texte",0,2.85,"L1","petit","milieu"],["texte",0.8,2.85,"L2","petit","milieu"],["texte",1.6,2.85,"L3","petit","milieu"],
      ["texte",2.0,2.95,"Tri 400 V + PE","rep"],
      ["tirets",[[1.44,1.62],[-0.86,1.62]]],["trait",[[-0.86,1.78],[-0.86,1.46]]],["cadenas",-1.16,1.62],
      ["rep",-1.36,1.62,"QS","sectionneur général","fin"],
      ["tirets",[[-0.16,-1.58],[1.44,-1.58]]],["lienMT",[-0.16,-1.58],"Q1"],
      ["tirets",[[1.44,-3.98],[-0.6,-3.98]]],["rep",-0.68,-3.98,"KM1",null,"fin"],
      ["tirets",[[4.44,-1.58],[5.24,-1.58]]],["lienMT",[4.44,-1.58],"Q3"],
      ["transfo","T1",5.0,-2.95],["rep",5.45,-3.2,"T1","400 V / 24 V"],
      ["texte",6.4,-3.82,"24 V","petit","milieu"],["texte",4.75,-10.6,"0 V","petit","fin"],["terre",4.85,-11.15],
      ["texte",7.54,-4.32,"1","born","fin"],["texte",7.54,-5.08,"2","born","fin"],["lienMT","Q2c","Q2"],
      ["lien","Q1a",6.8,"Q1"],
      ["poussoir","S1c",6.6,"S1","Arrêt"],
      ["poussoir","S2c",6.96,"S2","Marche"],
      ["rep",9.22,-8.7,"KM1"],
      ["bobine","bKM1",7.6,-9.5,"c4","s0","KM1"],["fil","s0",[[7.6,-10.7],[7.6,-10.9]]],
      ["moteur",0.8,-6.8,1.0],
      ["borne",0,-5.6,"U"],["borne",0.8,-5.6,"V"],["borne",1.6,-5.6,"W"],
      ["trait",[[-0.75,-5.67],[-0.75,-6.8],[-0.2,-6.8]]],["trait",[[-0.75,-6.8],[-0.75,-7.15]]],
      ["terre",-0.75,-7.15],["point",-0.75,-6.8],["borne",-0.75,-5.6,"PE","g"],
      ["rep",-1.0,-7.55,"M1",null,"fin"]
    ],
    zones:[
      ["QS",-2.4,2.4,1.85,0.95,"Interrupteur-sectionneur QS"],
      ["Q1",-2.4,-0.85,1.85,-2.3,"Disjoncteur-moteur Q1"],
      ["Q3",2.9,-0.85,5.65,-2.3,"Disjoncteur Q3 du transformateur"],
      ["Q2",5.8,-4.05,8.0,-5.3,"Disjoncteur de commande Q2"],
      ["S1",5.9,-6.45,8.15,-7.75,"Bouton S1 Arrêt"],
      ["S2",6.2,-8.05,8.0,-9.35,"Bouton S2 Marche"]
    ]
  }],

  pupitre:{
    poussoirs:[{app:"S2",titre:"S2 Marche",style:"marche"},{app:"S1",titre:"S1 Arrêt",style:"arret"}],
    appareils:[{app:"QS",sous:"sectionneur général"},{app:"Q1",sous:"disj. moteur"},{app:"Q3",sous:"disj. primaire T1"},{app:"Q2",sous:"disj. commande"}]
  },
  defauts:[
    {titre:"Surcharge moteur",app:"Q1"},
    {titre:"Court-circuit commande",app:"Q2"}
  ],

  explications(e){
    const L=[],m=e.moteur;
    if(!e.ferme("QS")){L.push(["QS est ouvert : toute l'installation est isolée, puissance et commande. C'est la position de consignation.","ko"]);return L;}
    if(!e.ferme("Q3"))L.push(["Q3 est ouvert : le primaire de T1 n'est plus alimenté, la commande 24 V est hors tension.","ko"]);
    if(e.declenche("Q2"))L.push(["Q2 a déclenché : le défaut de la commande est coupé sans toucher à Q1 ni à Q3. Touche Q2 pour le réarmer.","ko"]);
    else if(!e.ferme("Q2"))L.push(["Q2 est ouvert : le circuit de commande 24 V est coupé.","ko"]);
    if(e.declenche("Q1"))L.push(["Q1 a déclenché : le moteur est protégé. Son contact 13-14 coupe aussi la bobine de KM1. Touche Q1 pour le réarmer.","ko"]);
    else if(!e.ferme("Q1"))L.push(["Q1 est ouvert : le moteur est isolé et le contact Q1 13-14 coupe la commande.","ko"]);
    if(L.length)return L;
    if(e.appuye("S1"))L.push(["S1 est enfoncé : le circuit de la bobine est ouvert, KM1 retombe ou ne peut pas s'enclencher.","ko"]);
    else if(m.tourne&&e.appuye("S2"))L.push(["S2 est enfoncé : la bobine de KM1 est alimentée, ses pôles se ferment et le moteur démarre.","ok"]);
    else if(m.tourne)L.push(["Auto-maintien : le contact KM1 13-14 alimente la bobine à la place de S2. Le moteur continue de tourner.","ok"]);
    else L.push(["Tout est prêt : appuie sur S2 pour démarrer le moteur.",""]);
    return L;
  }
});
