/* Démarrage étoile-triangle avec temporisation.
   Coordonnées en cm, identiques au fichier LaTeX schema-etoile-triangle.tex. */
(window.ELEC_SCHEMAS=window.ELEC_SCHEMAS||[]).push({
  id:"etoile-triangle",
  titre:"Démarrage étoile-triangle",
  resume:"Démarrage en étoile, passage automatique en triangle par la temporisation de KM2, verrouillage électrique entre KM1 et KM3.",
  notions:["Couplage étoile et triangle","Temporisation travail","Verrouillage électrique","Relais thermique dans les enroulements"],

  appareils:{
    Q1:{type:"manuel",nom:"Sectionneur porte-fusibles",declencheLib:"fusibles fondus"},
    F1:{type:"thermique",nom:"Relais thermique"},
    AU:{type:"au",nom:"Arrêt d'urgence"},
    S1:{type:"poussoir",nom:"Bouton Arrêt"},
    S2:{type:"poussoir",nom:"Bouton Marche"},
    KM1:{type:"contacteur",nom:"Contacteur étoile",bobine:"bKM1"},
    KM2:{type:"contacteur",nom:"Contacteur de ligne",bobine:"bKM2",tempo:5},
    KM3:{type:"contacteur",nom:"Contacteur triangle",bobine:"bKM3"}
  },
  sources:[
    {net:"L1",nom:"L1",type:"phase"},{net:"L2",nom:"L2",type:"phase"},{net:"L3",nom:"L3",type:"phase"},
    {net:"L",nom:"L",type:"phase"},{net:"N",nom:"N",type:"neutre"}
  ],
  charges:[
    {id:"bKM1",type:"bobine",a:"a8",b:"N"},{id:"bKM2",type:"bobine",a:"a6",b:"N"},{id:"bKM3",type:"bobine",a:"a10",b:"N"}
  ],
  protections:[{noms:["L1","L2","L3"],app:"Q1",texte:"Court-circuit entre phases : les fusibles de Q1 ont fondu."}],
  moteur:{type:"etoile-triangle",bornes:{U1:"u1",V1:"v1",W1:"w1",U2:"t3",V2:"t1",W2:"t2"}},

  folios:[{
    titre:"Puissance",
    vue:[-2.5,0.75,11.6,-11.0],
    fils:[
      ["L1",[[-0.5,0],[9.8,0]]],["L2",[[-0.5,-0.35],[9.8,-0.35]]],["L3",[[-0.5,-0.7],[9.8,-0.7]]],
      ["L1",[[0,0],[0,-1.0]]],["L2",[[0.8,-0.35],[0.8,-1.0]]],["L3",[[1.6,-0.7],[1.6,-1.0]]],
      ["q1",[[0,-2.4],[0,-3.5]]],["q2",[[0.8,-2.4],[0.8,-3.5]]],["q3",[[1.6,-2.4],[1.6,-3.5]]],
      ["q1",[[0,-2.70],[3.6,-2.70],[3.6,-3.5]]],["q2",[[0.8,-2.95],[4.4,-2.95],[4.4,-3.5]]],["q3",[[1.6,-3.20],[5.2,-3.20],[5.2,-3.5]]],
      ["u1",[[0,-4.7],[0,-8.0]]],["v1",[[0.8,-4.7],[0.8,-7.6]]],["w1",[[1.6,-4.7],[1.6,-8.0]]],
      ["etoile",[[7.6,-3.5],[7.6,-3.25],[9.2,-3.25],[9.2,-3.5]]],["etoile",[[8.4,-3.5],[8.4,-3.25]]],
      ["t1",[[3.6,-4.7],[3.6,-6.1],[3.6,-6.42],[4.02,-6.42],[4.02,-6.78],[3.6,-6.78],[3.6,-10.4],[0.8,-10.4],[0.8,-9.6]]],
      ["t2",[[4.4,-4.7],[4.4,-6.1],[4.4,-6.42],[4.82,-6.42],[4.82,-6.78],[4.4,-6.78],[4.4,-10.1],[1.6,-10.1],[1.6,-9.2]]],
      ["t3",[[5.2,-4.7],[5.2,-6.1],[5.2,-6.42],[5.62,-6.42],[5.62,-6.78],[5.2,-6.78],[5.2,-10.7],[0,-10.7],[0,-9.2]]],
      ["t1",[[3.6,-5.1],[9.2,-5.1],[9.2,-4.7]]],["t2",[[4.4,-5.4],[8.4,-5.4],[8.4,-4.7]]],["t3",[[5.2,-5.7],[7.6,-5.7],[7.6,-4.7]]]
    ],
    joncs:[["L1",0,0],["L2",0.8,-0.35],["L3",1.6,-0.7],["q1",0,-2.7],["q2",0.8,-2.95],["q3",1.6,-3.2],
           ["etoile",8.4,-3.25],["t1",3.6,-5.1],["t2",4.4,-5.4],["t3",5.2,-5.7]],
    contacts:[
      {id:"Q11",app:"Q1",type:"sectfus",x:0,y:-1.0,haut:"L1",bas:"q1"},
      {id:"Q12",app:"Q1",type:"sectfus",x:0.8,y:-1.0,haut:"L2",bas:"q2"},
      {id:"Q13",app:"Q1",type:"sectfus",x:1.6,y:-1.0,haut:"L3",bas:"q3"},
      {id:"K21",app:"KM2",type:"kmp",x:0,y:-3.5,haut:"q1",bas:"u1",b:["1","2"],bpos:"p"},
      {id:"K22",app:"KM2",type:"kmp",x:0.8,y:-3.5,haut:"q2",bas:"v1",b:["3","4"],bpos:"p"},
      {id:"K23",app:"KM2",type:"kmp",x:1.6,y:-3.5,haut:"q3",bas:"w1",b:["5","6"],bpos:"p"},
      {id:"K31",app:"KM3",type:"kmp",x:3.6,y:-3.5,haut:"q1",bas:"t1",b:["1","2"],bpos:"p"},
      {id:"K32",app:"KM3",type:"kmp",x:4.4,y:-3.5,haut:"q2",bas:"t2",b:["3","4"],bpos:"p"},
      {id:"K33",app:"KM3",type:"kmp",x:5.2,y:-3.5,haut:"q3",bas:"t3",b:["5","6"],bpos:"p"},
      {id:"K11",app:"KM1",type:"kmp",x:7.6,y:-3.5,haut:"etoile",bas:"t3",b:["1","2"],bpos:"p"},
      {id:"K12",app:"KM1",type:"kmp",x:8.4,y:-3.5,haut:"etoile",bas:"t2",b:["3","4"],bpos:"p"},
      {id:"K13",app:"KM1",type:"kmp",x:9.2,y:-3.5,haut:"etoile",bas:"t1",b:["5","6"],bpos:"p"}
    ],
    dessin:[
      ["fleche",-0.5,9.8,0,"L1"],["fleche",-0.5,9.8,-0.35,"L2"],["fleche",-0.5,9.8,-0.7,"L3"],
      ["texte",9.8,0.3,"Tri 400 V + PE","rep","fin"],
      ["tirets",[[1.4,-1.715],[-0.75,-1.715]]],["rep",-0.82,-1.715,"Q1","fusibles aM","fin"],
      ["tirets",[[1.44,-4.08],[-0.66,-4.08]]],["rep",-0.73,-4.08,"KM2","ligne","fin"],
      ["tirets",[[5.04,-4.08],[2.94,-4.08]]],["rep",2.87,-4.08,"KM3","triangle","fin"],
      ["tirets",[[9.04,-4.08],[6.94,-4.08]]],["rep",6.87,-4.08,"KM1","étoile","fin"],
      ["texte",8.4,-3.0,"point étoile","note","milieu"],
      ["cadre",3.35,-6.22,5.85,-6.98],["rep",5.95,-6.6,"F1","réglage In / √3 = 0,58 In"],
      ["moteur",0.8,-8.6,1.0],
      ["borne",0,-7.4,"U1"],["borne",0.8,-7.4,"V1"],["borne",1.6,-7.4,"W1"],
      ["borne",0,-9.8,"U2"],["borne",0.8,-9.8,"V2"],["borne",1.6,-9.8,"W2"],
      ["trait",[[-0.75,-7.47],[-0.75,-8.6],[-0.2,-8.6]]],["trait",[[-0.75,-8.6],[-0.75,-8.95]]],
      ["terre",-0.75,-8.95],["point",-0.75,-8.6],["borne",-0.75,-7.4,"PE","g"],
      ["rep",-1.0,-9.25,"M1",null,"fin"]
    ],
    zones:[["Q1",-2.3,-0.85,1.9,-2.5,"Sectionneur porte-fusibles Q1"]]
  },{
    titre:"Commande",
    vue:[-4.9,0.75,10.0,-12.0],
    fils:[
      ["L",[[-4.4,0],[-3.6,0]]],
      ["a1",[[-2.4,0],[0,0],[0,-0.3]]],
      ["a3",[[0,-2.7],[0,-3.1]]],
      ["a4",[[0,-4.3],[0,-4.8]]],["a4",[[0,-4.8],[1.3,-4.8],[1.3,-5.0]]],
      ["a5",[[0,-6.0],[0,-7.6]]],["a5",[[1.3,-7.6],[0,-7.6]]],
      ["a6",[[1.3,-6.2],[1.3,-6.4]]],["a6",[[1.3,-6.3],[7.0,-6.3],[7.0,-7.6]]],["a6",[[4.2,-6.3],[4.2,-10.0]]],
      ["N",[[-4.4,-11.4],[7.0,-11.4],[7.0,-11.2]]],["N",[[0,-11.2],[0,-11.4]]],["N",[[4.2,-11.2],[4.2,-11.4]]]
    ],
    joncs:[["a4",0,-4.8],["a5",0,-7.6],["a6",1.3,-6.3],["a6",4.2,-6.3],["N",0,-11.4],["N",4.2,-11.4]],
    contacts:[
      {id:"AUc",app:"AU",mode:"nf",type:"nf",rot:90,x:-3.6,y:0,haut:"L",bas:"a1"},
      {id:"Q1a",app:"Q1",type:"no",x:0,y:-0.3,haut:"a1",bas:"a2"},
      {id:"F1c",app:"F1",mode:"nf",type:"nf",x:0,y:-1.5,haut:"a2",bas:"a3",b:["95","96"]},
      {id:"S1c",app:"S1",mode:"nf",type:"nf",x:0,y:-3.1,haut:"a3",bas:"a4",b:["11","12"]},
      {id:"S2c",app:"S2",type:"no",x:0,y:-4.8,haut:"a4",bas:"a5",b:["13","14"]},
      {id:"KM2a",app:"KM2",type:"no",x:1.3,y:-5.0,haut:"a4",bas:"a6",b:["13","14"]},
      {id:"KM1a",app:"KM1",type:"no",x:1.3,y:-6.4,haut:"a6",bas:"a5",b:["13","14"]},
      {id:"KM2t1",app:"KM2",mode:"tnf",type:"nf",x:0,y:-7.6,haut:"a5",bas:"a7",b:["55","56"]},
      {id:"KM3v",app:"KM3",mode:"nf",type:"nf",x:0,y:-8.8,haut:"a7",bas:"a8",b:["21","22"]},
      {id:"KM2t2",app:"KM2",mode:"tno",type:"no",x:7.0,y:-7.6,haut:"a6",bas:"a9",b:["67","68"]},
      {id:"KM1v",app:"KM1",mode:"nf",type:"nf",x:7.0,y:-8.8,haut:"a9",bas:"a10",b:["21","22"]}
    ],
    dessin:[
      ["fleche",-4.4,-4.05,0,"L"],["au",-3.6,0],
      ["borne",-1.2,0,"X3","h"],
      ["lien","Q1a",-0.8,"Q1"],
      ["lienTherm","F1c",0.6,"F1"],
      ["borne",0,-2.9,"X4"],
      ["poussoir","S1c",-0.8,"S1","Arrêt"],
      ["borne",0,-4.5,"X5"],
      ["poussoir","S2c",-0.8,"S2","Marche"],["borne",0,-6.3,"X6"],
      ["rep",1.62,-5.6,"KM2"],["rep",1.62,-7.0,"KM1"],
      ["lienTempo","KM2t1",0.75,"KM2"],
      ["lien","KM3v",-0.8,"KM3"],
      ["bobine","bKM1",0,-10.0,"a8","N","KM1"],
      ["bobine","bKM2",4.2,-10.0,"a6","N","KM2"],
      ["lienTempo","KM2t2",0.5,"KM2"],
      ["lien","KM1v",6.0,"KM1"],
      ["bobine","bKM3",7.0,-10.0,"a10","N","KM3"],
      ["fleche",-4.4,-4.05,-11.4,"N"],
      ["texte",0,-11.7,"Étoile","note","milieu"],["texte",4.2,-11.7,"Ligne","note","milieu"],["texte",7.0,-11.7,"Triangle","note","milieu"]
    ],
    zones:[
      ["AU",-3.75,0.55,-2.25,-1.3,"Arrêt d'urgence AU"],
      ["F1",-1.25,-1.4,0.6,-2.75,"Relais thermique F1"],
      ["S1",-1.9,-3.0,0.6,-4.35,"Bouton S1 Arrêt"],
      ["S2",-1.9,-4.75,0.45,-6.05,"Bouton S2 Marche"]
    ]
  }],

  pupitre:{
    poussoirs:[{app:"S2",titre:"S2 Marche",style:"marche"},{app:"S1",titre:"S1 Arrêt",style:"arret"}],
    appareils:[{app:"AU",sous:"arrêt d'urgence"},{app:"Q1",sous:"sectionneur"},{app:"F1",sous:"relais thermique"}]
  },
  defauts:[{titre:"Surcharge moteur",app:"F1"}],

  explications(e){
    const L=[],m=e.moteur,km2=e.tempo("KM2");
    if(!e.ferme("Q1")){
      L.push([e.declenche("Q1")?"Les fusibles de Q1 ont fondu : un court-circuit entre phases a été coupé. Touche Q1 pour les remplacer.":
        "Q1 est ouvert : le moteur est isolé et son contact de précoupure coupe la commande.","ko"]);
      return L;
    }
    if(e.appuye("AU"))L.push(["L'arrêt d'urgence est enfoncé et verrouillé : toute la commande est coupée. Touche-le pour le déverrouiller.","ko"]);
    if(e.declenche("F1"))L.push(["F1 a déclenché sur surcharge : son contact 95-96 coupe les trois bobines. Touche F1 pour le réarmer.","ko"]);
    if(L.length)return L;
    if(e.appuye("S1"))L.push(["S1 est enfoncé : les bobines sont coupées, le moteur s'arrête.","ko"]);
    else if(m.couplage==="étoile"){
      L.push(["Démarrage en étoile : KM2 alimente U1 V1 W1, KM1 relie U2 V2 W2. Chaque enroulement reçoit 400 / √3 = 230 V.","ok"]);
      L.push(["La temporisation de KM2 s'écoule. À la fin, son contact 55-56 coupe KM1 et son contact 67-68 enclenche KM3.",""]);
    }
    else if(m.couplage==="triangle"){
      L.push(["Marche en triangle : KM3 relie chaque fin d'enroulement à une phase. Chaque enroulement reçoit 400 V.","ok"]);
      L.push(["KM2 reste maintenu par son contact 13-14. Le contact NF 21-22 de KM1 et celui de KM3 interdisent l'étoile et le triangle en même temps.",""]);
    }
    else if(m.anomalie)L.push([m.anomalie,"ko"]);
    else L.push(["Prêt : appuie sur S2. Le moteur démarrera en étoile puis passera en triangle après "+5+" s.",""]);
    return L;
  }
});
