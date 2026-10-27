/* Élec TIIN — Consignation : scénario, rôles et fluides.
   Références : NF C 18-510 (2012) + A1 (2020) + A2 (2023) ; INRS ED 6109 « Consignations et déconsignations », 3e éd., 2020.
   Scénario : remplacement du moteur M2 de la pompe P2, secourue par un groupe électrogène. */
(function(){
"use strict";
const pole=(id,app,type,x,haut,bas,i)=>({id,app,type,x,y:-1.0,haut,bas,b:[String(2*i+1),String(2*i+2)],bpos:"p"});

window.ELEC_CONSIGNATION={
  /* ---------- schéma de l'installation ---------- */
  schema:{
    id:"consignation",
    appareils:{
      Q1:{type:"manuel",nom:"Départ pompe P1"},
      Q2:{type:"manuel",nom:"Départ pompe P2"},
      Q3:{type:"manuel",nom:"Secours pompe P2"},
      GE:{type:"manuel",initial:false,nom:"Groupe électrogène"},
      MALT:{type:"manuel",initial:false,nom:"MALT-CC"}
    },
    sources:[
      {net:"L1",nom:"L1",type:"phase"},{net:"L2",nom:"L2",type:"phase"},{net:"L3",nom:"L3",type:"phase"},
      {net:"gs1",nom:"L1",type:"phase"},{net:"gs2",nom:"L2",type:"phase"},{net:"gs3",nom:"L3",type:"phase"}
    ],
    charges:[],
    protections:[
      {noms:["L1","L2","L3"],app:"Q2",texte:"Court-circuit sur le départ P2 : Q2 a déclenché."},
      {noms:["L1","L2","L3"],app:"Q3",texte:"Court-circuit sur le départ P2 : Q3 a déclenché."},
      {noms:["L1","L2","L3"],app:"Q1",texte:"Court-circuit sur le départ P1 : Q1 a déclenché."}
    ],
    contactsCaches:[
      {id:"GE1",app:"GE",haut:"gs1",bas:"g1"},{id:"GE2",app:"GE",haut:"gs2",bas:"g2"},{id:"GE3",app:"GE",haut:"gs3",bas:"g3"},
      {id:"MA1",app:"MALT",haut:"n1",bas:"pe"},{id:"MA2",app:"MALT",haut:"n2",bas:"pe"},{id:"MA3",app:"MALT",haut:"n3",bas:"pe"}
    ],
    folios:[{
      titre:"Installation : pompes P1 et P2",
      vue:[-2.9,2.35,12.5,-8.75],
      fils:[
        ["L1",[[-0.5,0],[6.6,0]]],["L2",[[-0.5,-0.35],[6.6,-0.35]]],["L3",[[-0.5,-0.7],[6.6,-0.7]]],
        ["L1",[[0,0],[0,-1.0]]],["L2",[[0.8,-0.35],[0.8,-1.0]]],["L3",[[1.6,-0.7],[1.6,-1.0]]],
        ["L1",[[4.0,0],[4.0,-1.0]]],["L2",[[4.8,-0.35],[4.8,-1.0]]],["L3",[[5.6,-0.7],[5.6,-1.0]]],
        ["d1",[[0,-2.2],[0,-6.59]]],["d2",[[0.8,-2.2],[0.8,-6.1]]],["d3",[[1.6,-2.2],[1.6,-6.59]]],
        ["n1",[[4.0,-2.2],[4.0,-6.59]]],["n2",[[4.8,-2.2],[4.8,-6.1]]],["n3",[[5.6,-2.2],[5.6,-6.59]]],
        ["g1",[[9.15,0.72],[8.6,0.3],[8.6,-1.0]]],["g2",[[9.4,0.65],[9.4,-1.0]]],["g3",[[9.65,0.72],[10.2,0.3],[10.2,-1.0]]],
        ["n1",[[8.6,-2.2],[8.6,-2.6],[4.0,-2.6]]],["n2",[[9.4,-2.2],[9.4,-2.85],[4.8,-2.85]]],["n3",[[10.2,-2.2],[10.2,-3.1],[5.6,-3.1]]]
      ],
      joncs:[["L1",0,0],["L2",0.8,-0.35],["L3",1.6,-0.7],["L1",4.0,0],["L2",4.8,-0.35],["L3",5.6,-0.7],
             ["n1",4.0,-2.6],["n2",4.8,-2.85],["n3",5.6,-3.1]],
      contacts:[
        pole("Q11","Q1","disjs",0,"L1","d1",0),pole("Q12","Q1","disjs",0.8,"L2","d2",1),pole("Q13","Q1","disjs",1.6,"L3","d3",2),
        pole("Q21","Q2","disjs",4.0,"L1","n1",0),pole("Q22","Q2","disjs",4.8,"L2","n2",1),pole("Q23","Q2","disjs",5.6,"L3","n3",2),
        pole("Q31","Q3","disjs",8.6,"g1","n1",0),pole("Q32","Q3","disjs",9.4,"g2","n2",1),pole("Q33","Q3","disjs",10.2,"g3","n3",2)
      ],
      dessin:[
        ["fleche",-0.5,6.6,0,"L1"],["fleche",-0.5,6.6,-0.35,"L2"],["fleche",-0.5,6.6,-0.7,"L3"],
        ["texte",-0.5,0.32,"Tableau normal · 400 V","rep"],
        ["tirets",[[-0.16,-1.58],[1.44,-1.58]]],["lienMT",[-0.16,-1.58],"Q1","pompe P1"],
        ["tirets",[[3.84,-1.58],[5.44,-1.58]]],["lienMT",[3.84,-1.58],"Q2","pompe P2"],
        ["tirets",[[8.44,-1.58],[10.04,-1.58]]],["lienMT",[8.44,-1.58],"Q3","secours P2"],
        ["borne",0,-5.2,"U"],["borne",0.8,-5.2,"V"],["borne",1.6,-5.2,"W"],
        ["borne",4.0,-5.2,"U"],["borne",4.8,-5.2,"V"],["borne",5.6,-5.2,"W"],
        ["moteur",0.8,-7.0,0.9],["rep",-0.25,-7.75,"M1","pompe P1","fin"],
        ["moteur",4.8,-7.0,0.9],["rep",5.85,-7.75,"M2","pompe P2"],
        ["texte",4.85,-3.85,"câble repéré P2","note","milieu"],["texte",0.85,-3.85,"câble repéré P1","note","milieu"]
      ]
    }]
  },
  /* éléments dessinés par la page (coordonnées en cm) */
  dessinGE:{x:9.4,y:1.25,r:0.6},
  cadenas:{Q1:[-2.75,-1.12],Q2:[1.85,-1.12],Q3:[6.4,-1.12]},
  zones:{Q1:[-2.85,-0.85,1.95,-2.5],Q2:[2.05,-0.85,5.95,-2.5],Q3:[6.65,-0.85,10.55,-2.5],M1:[-0.2,-5.95,1.8,-8.05],M2:[3.8,-5.95,5.8,-8.05]},
  lieu:[3.15,-4.4,6.6,-8.45],
  malt:{y:-5.72,x:[4.0,4.8,5.6],terre:[3.45,-6.15]},

  /* ---------- rôles et habilitations ---------- */
  roles:[
    {titre:"Chargé d'exploitation électrique",sym:"",txt:"Assure l'exploitation de l'installation. Il donne son accord pour retirer l'ouvrage de l'exploitation avant la consignation."},
    {titre:"Chargé de consignation",sym:"BC · HC",txt:"Réalise la consignation (séparation, condamnation, identification, VAT, MALT-CC) et la déconsignation. Il remet l'attestation de consignation au chargé de travaux."},
    {titre:"Chargé de travaux",sym:"B2 · H2",txt:"Dirige les travaux. Il reçoit l'attestation de consignation, délimite la zone, autorise les exécutants à commencer, puis remet l'avis de fin de travail."},
    {titre:"Exécutant électricien",sym:"B1 · H1",txt:"Réalise les travaux sous la direction du chargé de travaux, uniquement sur un ouvrage consigné."},
    {titre:"Chargé d'intervention générale",sym:"BR",txt:"Électricien qui intervient en BT (dépannage, raccordement, mesurage). Il peut consigner lui-même pour ses propres interventions."},
    {titre:"Non-électricien",sym:"B0 · H0",txt:"Réalise des travaux d'ordre non électrique (peinture, nettoyage, maçonnerie) dans un environnement électrique. Il ne touche jamais aux appareils."}
  ],
  lettres:[
    ["B","Basse et très basse tension (jusqu'à 1 000 V alternatif)"],["H","Haute tension (HTA, HTB)"],
    ["0","Travaux d'ordre non électrique"],["1","Exécutant de travaux électriques"],["2","Chargé de travaux électriques"],
    ["C","Consignation"],["R","Intervention BT générale"],["S","Intervention BT élémentaire (remplacer un fusible, réarmer…)"],
    ["E","Opérations spécifiques : essai, mesurage, vérification, manœuvre"],["V","Travaux au voisinage de pièces nues sous tension"],
    ["T","Travaux sous tension"],["P","Opérations sur installations photovoltaïques"]
  ],
  quiz:[
    {q:"Qui remet l'attestation de consignation pour travaux ?",r:"Le chargé de consignation (BC)",f:["Le chargé de travaux (B2)","L'exécutant (B1)","Le non-électricien (B0)"],
     e:"Le chargé de consignation réalise la consignation et la certifie par l'attestation qu'il remet au chargé de travaux."},
    {q:"Qui reçoit l'attestation et autorise les exécutants à commencer ?",r:"Le chargé de travaux (B2)",f:["Le chargé de consignation (BC)","L'exécutant (B1)","Le chargé d'exploitation"],
     e:"Le chargé de travaux reçoit l'attestation, vérifie la zone de travail et donne le départ à son équipe."},
    {q:"Que signifie la lettre V dans l'habilitation B1V ?",r:"Travaux au voisinage de pièces nues sous tension",f:["Vérification d'absence de tension","Véhicules électriques","Vannes et fluides"],
     e:"Le V autorise à travailler à proximité de pièces nues sous tension, dans la zone de voisinage."},
    {q:"Qui délivre le titre d'habilitation ?",r:"L'employeur",f:["L'organisme de formation","L'inspection du travail","Le chargé de consignation"],
     e:"La formation est obligatoire, mais c'est l'employeur qui habilite, par un titre signé, en fonction des tâches confiées."},
    {q:"Avant la déconsignation, le chargé de travaux remet au chargé de consignation…",r:"l'avis de fin de travail",f:["l'attestation de consignation","le titre d'habilitation","le cadenas de Q2"],
     e:"L'avis de fin de travail atteste que le travail est terminé et que le personnel a quitté l'ouvrage. La déconsignation ne peut commencer qu'après."},
    {q:"Un électricien habilité BR doit dépanner un moteur. Peut-il consigner lui-même ?",r:"Oui, pour sa propre intervention",f:["Non, seul un BC peut consigner","Non, il travaille sous tension","Oui, et pour toute l'équipe"],
     e:"Le BR peut réaliser la consignation pour son propre compte, dans le cadre de son intervention."},
    {q:"Un peintre doit repeindre une armoire électrique du local. Quelle habilitation ?",r:"B0",f:["B1","BR","Aucune"],
     e:"Un non-électricien qui travaille dans un local électrique doit être habilité B0 (ou B0V au voisinage). Il ne manœuvre jamais les appareils."}
  ],

  /* ---------- fluides (INRS ED 6109, § 6) ---------- */
  fluides:{
    etapes:[
      ["Séparation","Fermer toutes les arrivées de fluide (vannes), y compris les circuits auxiliaires, après avoir arrêté ce qui met le fluide en mouvement : pompe, compresseur, ventilateur."],
      ["Dissipation","Vidanger pour évacuer le fluide, purger pour ramener à la pression atmosphérique. Purge en partie basse pour un fluide plus lourd que l'air, en partie haute pour un fluide plus léger. Le jet est dirigé vers une zone sans personne."],
      ["Condamnation","Cadenasser les vannes de séparation en position fermée et les purges en position ouverte, avec une signalisation visible."],
      ["Vérification","Contrôler l'absence de pression et de fluide. L'absence d'écoulement ne suffit pas : on vérifie que la purge n'est pas bouchée (manomètre, purge témoin)."]
    ],
    niveaux:[
      {id:"R0",titre:"Une vanne fermée",verdict:"insuffisant",
       txt:"Une vanne seule peut fuir. Le fluide sous pression arrive alors dans la zone de travail. Ce n'est acceptable que si une légère fuite ne présente aucun risque."},
      {id:"R1",titre:"Deux vannes et une purge intermédiaire ouverte",verdict:"isolement renforcé",
       txt:"Si la vanne amont fuit, le fluide s'échappe par la purge ouverte au lieu de passer la seconde vanne. La purge doit être condamnée ouverte et ne pas se boucher."},
      {id:"R2",titre:"Vanne, purge et joint plein",verdict:"isolement renforcé",
       txt:"Un joint plein (type « queue de poêle », visible de l'extérieur) ferme la conduite : rien ne peut passer, même si la vanne fuit."},
      {id:"R3",titre:"Tronçon démonté",verdict:"séparation franche",
       txt:"La conduite est physiquement interrompue (tronçon déposé ou décalé). Le fluide ne peut plus atteindre l'équipement."}
    ],
    nucleaire:"Sur un site nucléaire, la consignation des fluides suit en plus les règles de l'exploitant (régime de consignation, autorisation de travail, gestion des effluents vidangés vers les réseaux prévus). Applique toujours la procédure du site."
  }
};
})();
