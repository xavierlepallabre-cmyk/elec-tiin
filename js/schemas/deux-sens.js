/* Démarrage direct deux sens de marche, avec signalisation.
   Coordonnées en cm, identiques au fichier LaTeX schema-deux-sens.tex. */
(window.ELEC_SCHEMAS=window.ELEC_SCHEMAS||[]).push({
  id:"deux-sens",
  titre:"Deux sens de marche",
  resume:"Inversion de deux phases par KM2, verrouillages mécanique et électrique, voyants de marche, de surcharge et de mise sous tension.",
  notions:["Inversion du sens de rotation","Verrouillage électrique","Verrouillage mécanique","Signalisation"],

  appareils:{
    Q1:{type:"manuel",nom:"Sectionneur porte-fusibles",declencheLib:"fusibles fondus"},
    F1:{type:"thermique",nom:"Relais thermique"},
    AU:{type:"au",nom:"Arrêt d'urgence"},
    S1:{type:"poussoir",nom:"Bouton Arrêt"},
    S2:{type:"poussoir",nom:"Bouton Sens 1"},
    S3:{type:"poussoir",nom:"Bouton Sens 2"},
    KM1:{type:"contacteur",nom:"Contacteur sens 1",bobine:"bKM1"},
    KM2:{type:"contacteur",nom:"Contacteur sens 2",bobine:"bKM2"}
  },
  sources:[
    {net:"L1",nom:"L1",type:"phase"},{net:"L2",nom:"L2",type:"phase"},{net:"L3",nom:"L3",type:"phase"},
    {net:"L",nom:"L",type:"phase"},{net:"N",nom:"N",type:"neutre"}
  ],
  charges:[
    {id:"bKM1",type:"bobine",a:"a6",b:"N"},{id:"bKM2",type:"bobine",a:"a8",b:"N"},
    {id:"H1",type:"voyant",a:"h1",b:"N"},{id:"H2",type:"voyant",a:"h2",b:"N"},
    {id:"H3",type:"voyant",a:"h3",b:"N"},{id:"H4",type:"voyant",a:"a2",b:"N"}
  ],
  protections:[{noms:["L1","L2","L3"],app:"Q1",texte:"Court-circuit entre phases : les fusibles de Q1 ont fondu."}],
  moteur:{type:"direct",bornes:["k1","k2","k3"],afficheSens:true},

  folios:[{
    titre:"Puissance",
    vue:[-2.5,0.75,7.7,-10.0],
    fils:[
      ["L1",[[-0.5,0],[6.4,0]]],["L2",[[-0.5,-0.35],[6.4,-0.35]]],["L3",[[-0.5,-0.7],[6.4,-0.7]]],
      ["L1",[[0,0],[0,-1.0]]],["L2",[[0.8,-0.35],[0.8,-1.0]]],["L3",[[1.6,-0.7],[1.6,-1.0]]],
      ["q1",[[0,-2.4],[0,-3.5]]],["q2",[[0.8,-2.4],[0.8,-3.5]]],["q3",[[1.6,-2.4],[1.6,-3.5]]],
      ["q1",[[0,-2.70],[3.0,-2.70],[3.0,-3.5]]],["q2",[[0.8,-2.95],[3.8,-2.95],[3.8,-3.5]]],["q3",[[1.6,-3.20],[4.6,-3.20],[4.6,-3.5]]],
      ["k1",[[0,-4.7],[0,-6.1],[0,-6.42],[0.42,-6.42],[0.42,-6.78],[0,-6.78],[0,-8.2]]],
      ["k2",[[0.8,-4.7],[0.8,-6.1],[0.8,-6.42],[1.22,-6.42],[1.22,-6.78],[0.8,-6.78],[0.8,-7.8]]],
      ["k3",[[1.6,-4.7],[1.6,-6.1],[1.6,-6.42],[2.02,-6.42],[2.02,-6.78],[1.6,-6.78],[1.6,-8.2]]],
      ["k1",[[4.6,-4.7],[4.6,-5.0],[0,-5.0]]],["k2",[[3.8,-4.7],[3.8,-5.3],[0.8,-5.3]]],["k3",[[3.0,-4.7],[3.0,-5.6],[1.6,-5.6]]]
    ],
    joncs:[["L1",0,0],["L2",0.8,-0.35],["L3",1.6,-0.7],["q1",0,-2.7],["q2",0.8,-2.95],["q3",1.6,-3.2],
           ["k1",0,-5.0],["k2",0.8,-5.3],["k3",1.6,-5.6]],
    contacts:[
      {id:"Q11",app:"Q1",type:"sectfus",x:0,y:-1.0,haut:"L1",bas:"q1"},
      {id:"Q12",app:"Q1",type:"sectfus",x:0.8,y:-1.0,haut:"L2",bas:"q2"},
      {id:"Q13",app:"Q1",type:"sectfus",x:1.6,y:-1.0,haut:"L3",bas:"q3"},
      {id:"K11",app:"KM1",type:"kmp",x:0,y:-3.5,haut:"q1",bas:"k1",b:["1","2"],bpos:"p"},
      {id:"K12",app:"KM1",type:"kmp",x:0.8,y:-3.5,haut:"q2",bas:"k2",b:["3","4"],bpos:"p"},
      {id:"K13",app:"KM1",type:"kmp",x:1.6,y:-3.5,haut:"q3",bas:"k3",b:["5","6"],bpos:"p"},
      {id:"K21",app:"KM2",type:"kmp",x:3.0,y:-3.5,haut:"q1",bas:"k3",b:["1","2"],bpos:"p"},
      {id:"K22",app:"KM2",type:"kmp",x:3.8,y:-3.5,haut:"q2",bas:"k2",b:["3","4"],bpos:"p"},
      {id:"K23",app:"KM2",type:"kmp",x:4.6,y:-3.5,haut:"q3",bas:"k1",b:["5","6"],bpos:"p"}
    ],
    dessin:[
      ["fleche",-0.5,6.4,0,"L1"],["fleche",-0.5,6.4,-0.35,"L2"],["fleche",-0.5,6.4,-0.7,"L3"],
      ["texte",6.4,0.3,"Tri 400 V + PE","rep","fin"],
      ["tirets",[[1.4,-1.715],[-0.75,-1.715]]],["rep",-0.82,-1.715,"Q1","fusibles aM","fin"],
      ["tirets",[[-0.16,-4.08],[-0.66,-4.08]]],["rep",-0.73,-4.08,"KM1","sens 1","fin"],["tirets",[[-0.16,-4.08],[1.44,-4.08]]],
      ["tirets",[[2.84,-4.08],[5.05,-4.08]]],["rep",5.12,-4.08,"KM2","sens 2"],
      ["verrou",[1.44,-4.08],[2.84,-4.08]],
      ["texte",2.1,-5.85,"inversion L1 / L3","note"],
      ["cadre",-0.25,-6.22,2.25,-6.98],["rep",2.35,-6.6,"F1","réglage : In du moteur"],
      ["moteur",0.8,-8.8,1.0],
      ["borne",0,-7.6,"U"],["borne",0.8,-7.6,"V"],["borne",1.6,-7.6,"W"],
      ["trait",[[-0.75,-7.67],[-0.75,-8.8],[-0.2,-8.8]]],["trait",[[-0.75,-8.8],[-0.75,-9.15]]],
      ["terre",-0.75,-9.15],["point",-0.75,-8.8],["borne",-0.75,-7.6,"PE","g"],
      ["rep",-1.0,-9.5,"M1",null,"fin"]
    ],
    zones:[["Q1",-2.3,-0.85,1.9,-2.5,"Sectionneur porte-fusibles Q1"]]
  },{
    titre:"Commande",
    vue:[-4.9,0.75,14.0,-10.6],
    fils:[
      ["L",[[-4.4,0],[-3.6,0]]],
      ["a1",[[-2.4,0],[0,0],[0,-0.3]]],
      ["a2",[[0,-1.5],[13.2,-1.5]]],
      ["a3",[[0,-2.7],[0,-3.1]]],
      ["a4",[[0,-4.3],[0,-5.0]]],["a4",[[0,-4.8],[6.1,-4.8],[6.1,-5.0]]],["a4",[[1.3,-4.8],[1.3,-5.0]]],["a4",[[4.8,-4.8],[4.8,-5.0]]],
      ["a5",[[0,-6.2],[0,-7.0]]],["a5",[[1.3,-6.2],[1.3,-7.0],[0,-7.0]]],
      ["a6",[[0,-8.2],[0,-8.3]]],
      ["a7",[[4.8,-6.2],[4.8,-7.0]]],["a7",[[6.1,-6.2],[6.1,-7.0],[4.8,-7.0]]],
      ["a8",[[4.8,-8.2],[4.8,-8.3]]],
      ["a2",[[8.0,-1.5],[8.0,-5.0]]],["h1",[[8.0,-6.2],[8.0,-8.3]]],
      ["a2",[[9.6,-1.5],[9.6,-5.0]]],["h2",[[9.6,-6.2],[9.6,-8.3]]],
      ["a2",[[11.6,-1.5],[11.6,-5.0]]],["h3",[[11.6,-6.2],[11.6,-8.3]]],
      ["a2",[[13.2,-1.5],[13.2,-8.3]]],
      ["N",[[-4.4,-9.7],[13.2,-9.7],[13.2,-9.5]]],
      ["N",[[0,-9.5],[0,-9.7]]],["N",[[4.8,-9.5],[4.8,-9.7]]],["N",[[8.0,-9.5],[8.0,-9.7]]],["N",[[9.6,-9.5],[9.6,-9.7]]],["N",[[11.6,-9.5],[11.6,-9.7]]]
    ],
    joncs:[["a2",0,-1.5],["a4",0,-4.8],["a4",1.3,-4.8],["a4",4.8,-4.8],["a5",0,-7.0],["a7",4.8,-7.0],
           ["a2",8.0,-1.5],["a2",9.6,-1.5],["a2",11.6,-1.5],
           ["N",0,-9.7],["N",4.8,-9.7],["N",8.0,-9.7],["N",9.6,-9.7],["N",11.6,-9.7]],
    contacts:[
      {id:"AUc",app:"AU",mode:"nf",type:"nf",rot:90,x:-3.6,y:0,haut:"L",bas:"a1"},
      {id:"Q1a",app:"Q1",type:"no",x:0,y:-0.3,haut:"a1",bas:"a2"},
      {id:"F1c",app:"F1",mode:"nf",type:"nf",x:0,y:-1.5,haut:"a2",bas:"a3",b:["95","96"]},
      {id:"S1c",app:"S1",mode:"nf",type:"nf",x:0,y:-3.1,haut:"a3",bas:"a4",b:["11","12"]},
      {id:"S2c",app:"S2",type:"no",x:0,y:-5.0,haut:"a4",bas:"a5",b:["13","14"]},
      {id:"KM1a",app:"KM1",type:"no",x:1.3,y:-5.0,haut:"a4",bas:"a5",b:["13","14"]},
      {id:"KM2v",app:"KM2",mode:"nf",type:"nf",x:0,y:-7.0,haut:"a5",bas:"a6",b:["21","22"]},
      {id:"S3c",app:"S3",type:"no",x:4.8,y:-5.0,haut:"a4",bas:"a7",b:["13","14"]},
      {id:"KM2a",app:"KM2",type:"no",x:6.1,y:-5.0,haut:"a4",bas:"a7",b:["13","14"]},
      {id:"KM1v",app:"KM1",mode:"nf",type:"nf",x:4.8,y:-7.0,haut:"a7",bas:"a8",b:["21","22"]},
      {id:"H1c",app:"KM1",type:"no",x:8.0,y:-5.0,haut:"a2",bas:"h1",b:["43","44"]},
      {id:"H2c",app:"KM2",type:"no",x:9.6,y:-5.0,haut:"a2",bas:"h2",b:["43","44"]},
      {id:"H3c",app:"F1",type:"no",x:11.6,y:-5.0,haut:"a2",bas:"h3",b:["97","98"]}
    ],
    dessin:[
      ["fleche",-4.4,-4.05,0,"L"],["au",-3.6,0],
      ["borne",-1.2,0,"X3","h"],
      ["lien","Q1a",-0.8,"Q1"],
      ["lienTherm","F1c",0.6,"F1"],
      ["borne",0,-2.9,"X4"],
      ["poussoir","S1c",-0.8,"S1","Arrêt"],
      ["borne",0,-4.5,"X5"],
      ["poussoir","S2c",-0.8,"S2","Sens 1"],["borne",0,-6.5,"X6"],["rep",1.62,-5.6,"KM1"],
      ["lien","KM2v",-0.8,"KM2"],
      ["bobine","bKM1",0,-8.3,"a6","N","KM1"],
      ["poussoir","S3c",4.0,"S3","Sens 2"],["borne",4.8,-6.5,"X7"],["rep",6.42,-5.6,"KM2"],
      ["lien","KM1v",4.0,"KM1"],
      ["bobine","bKM2",4.8,-8.3,"a8","N","KM2"],
      ["rep",8.32,-5.6,"KM1"],["voyant","H1",8.0,-8.3,"h1","N","H1","vert"],
      ["rep",9.92,-5.6,"KM2"],["voyant","H2",9.6,-8.3,"h2","N","H2","vert"],
      ["lienTherm","H3c",0.25,null],["rep",11.92,-5.6,"F1"],["voyant","H3",11.6,-8.3,"h3","N","H3","orange"],
      ["voyant","H4",13.2,-8.3,"a2","N","H4","blanc"],
      ["fleche",-4.4,-4.05,-9.7,"N"],
      ["texte",0,-10.0,"Sens 1","note","milieu"],["texte",4.8,-10.0,"Sens 2","note","milieu"],
      ["texte",8.0,-10.0,"Marche","note","milieu"],["texte",8.0,-10.3,"avant","note","milieu"],
      ["texte",9.6,-10.0,"Marche","note","milieu"],["texte",9.6,-10.3,"arrière","note","milieu"],
      ["texte",11.6,-10.0,"Surcharge","note","milieu"],
      ["texte",13.2,-10.0,"Sous","note","milieu"],["texte",13.2,-10.3,"tension","note","milieu"]
    ],
    zones:[
      ["AU",-3.75,0.55,-2.25,-1.3,"Arrêt d'urgence AU"],
      ["F1",-1.25,-1.4,0.6,-2.75,"Relais thermique F1"],
      ["S1",-1.9,-3.0,0.6,-4.35,"Bouton S1 Arrêt"],
      ["S2",-1.9,-4.95,0.45,-6.25,"Bouton S2 Sens 1"],
      ["S3",2.9,-4.95,5.25,-6.25,"Bouton S3 Sens 2"]
    ]
  }],

  pupitre:{
    poussoirs:[{app:"S2",titre:"S2 Sens 1",style:"marche"},{app:"S3",titre:"S3 Sens 2",style:"marche"},{app:"S1",titre:"S1 Arrêt",style:"arret"}],
    appareils:[{app:"AU",sous:"arrêt d'urgence"},{app:"Q1",sous:"sectionneur"},{app:"F1",sous:"relais thermique"}]
  },
  defauts:[{titre:"Surcharge moteur",app:"F1"}],

  explications(e){
    const L=[],m=e.moteur;
    if(!e.ferme("Q1")){
      L.push([e.declenche("Q1")?"Les fusibles de Q1 ont fondu : un court-circuit entre phases a été coupé. Touche Q1 pour les remplacer.":
        "Q1 est ouvert : le moteur est isolé et son contact de précoupure coupe la commande.","ko"]);
      return L;
    }
    if(e.appuye("AU"))L.push(["L'arrêt d'urgence est enfoncé et verrouillé : toute la commande est coupée. Touche-le pour le déverrouiller.","ko"]);
    if(e.declenche("F1"))L.push(["F1 a déclenché sur surcharge : son contact 95-96 coupe les bobines, son contact 97-98 allume le voyant H3. Touche F1 pour le réarmer.","ko"]);
    if(L.length)return L;
    if(e.appuye("S1"))L.push(["S1 est enfoncé : les deux bobines sont coupées.","ko"]);
    else if(m.tourne){
      L.push([`Le moteur tourne en sens ${m.sens} : ${m.sens===1?"KM1":"KM2"} est maintenu par son contact 13-14, le voyant ${m.sens===1?"H1":"H2"} est allumé.`,"ok"]);
      if(e.appuye(m.sens===1?"S3":"S2"))L.push([`Verrouillage électrique : le contact NF 21-22 de ${m.sens===1?"KM1":"KM2"} empêche ${m.sens===1?"KM2":"KM1"} de s'enclencher. Il faut d'abord appuyer sur S1.`,"ko"]);
      if(m.sens===2)L.push(["KM2 croise L1 et L3 : le champ tournant change de sens.",""]);
    }
    else L.push(["Prêt : appuie sur S2 pour le sens 1 ou sur S3 pour le sens 2. Le voyant H4 indique que la commande est sous tension.",""]);
    return L;
  }
});
