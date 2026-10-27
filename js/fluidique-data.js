/* Élec TIIN — circuits pneumatiques et hydrauliques (symboles ISO 1219-1).
   Chaque circuit : composants dessinés, conduites (net), sources, échappements, dynamique et explications.
   Repérage des orifices ISO 5599 en pneumatique : 1 alimentation, 2 et 4 utilisations, 3 et 5 échappements. */
(function(){
"use strict";
const V0=(x,y)=>({id:"V0",x,y,s:40,cases:2,ref:0,
  ports:{"2":{cote:"h",f:.5,net:"p"},"1":{cote:"b",f:.3,net:"src"},"3":{cote:"b",f:.7,net:"atmV0",echap:true}},
  chemins:{0:[["1","2"]],1:[["2","3"]]},bloques:{0:["3"],1:["1"]},gauche:"levier",lab:"0V1",labX:x+86,labY:y+20,labA:"start"});
const temps=(o)=>(0.9/(o/100)).toFixed(1).replace(".",",");

window.ELEC_FLUIDIQUE=[
/* ======================= 1. vérin simple effet ======================= */
{id:"simple-effet",type:"pneu",titre:"Vérin simple effet",
 resume:"Distributeur 3/2 monostable à bouton-poussoir, retour par ressort. Vanne de sectionnement avec mise à l'échappement.",
 notions:["Vérin simple effet","Distributeur 3/2","Repérage ISO 5599"],
 vue:[520,420],
 dessin(P){
   P.verin({id:"1A",simple:true,x:150,y:60,w:180,h:36,course:20,lab:"1A"});
   P.ligne("a",[[170,96],[170,140],[270,140],[270,200]]);
   P.distributeur({id:"1V1",x:250,y:200,s:40,cases:2,ref:1,
     ports:{"2":{cote:"h",f:.5,net:"a"},"1":{cote:"b",f:.3,net:"p"},"3":{cote:"b",f:.7,net:"atm3",echap:true}},
     chemins:{0:[["1","2"]],1:[["2","3"]]},bloques:{0:["3"],1:["1"]},gauche:"bouton",droite:"ressort",lab:"1V1",labX:316,labY:220,labA:"start"});
   P.ligne("p",[[262,240],[262,300]]);P.ligne("p",[[262,270],[300,270]]);P.point("p",262,270);P.mano("M1",311,270);
   P.distributeur(V0(242,300));
   P.ligne("src",[[254,340],[254,369]]);P.source(254,380,"réseau 6 bar");
 },
 zones:[[180,205,30,30,"Bouton du distributeur 1V1","S1"]],
 commandes:[{type:"maintenu",id:"S1",titre:"Bouton 1V1",dist:"1V1",pos:0,repos:1}],
 vanne:true,
 sources:["src"],echap:["atm3","atmV0"],
 verins:[{id:"1A",type:"simple",A:"a"}],
 manos:{M1:"p"},
 explications(e){
   const L=[];
   if(!e.vanneOuverte)L.push(["La vanne 0V1 est fermée : l'arrivée d'air est coupée et le circuit aval est mis à l'échappement. C'est la position de consignation.","ko"]);
   if(e.cls.a==="P")L.push(["Bouton appuyé : 1V1 relie 1 à 2. L'air sous pression entre dans la chambre et pousse le piston : la tige sort.","ok"]);
   else L.push(["Bouton relâché : le ressort ramène 1V1 au repos, 2 est relié à l'échappement 3. Le ressort du vérin fait rentrer la tige et chasse l'air.",""]);
   return L;
 }},

/* ======================= 2. double effet + réducteurs ======================= */
{id:"double-effet",type:"pneu",titre:"Vérin double effet et réglage de vitesse",
 resume:"Distributeur 5/2 monostable. Deux réducteurs de débit unidirectionnels règlent la vitesse de sortie et de rentrée, à l'échappement.",
 notions:["Vérin double effet","Distributeur 5/2","Réducteur de débit unidirectionnel","Réglage à l'échappement"],
 vue:[520,420],
 dessin(P){
   P.verin({id:"1A",x:150,y:50,w:180,h:36,course:20,lab:"1A"});
   P.ligne("ca",[[166,86],[166,110]]);P.ligne("cb",[[314,86],[314,110]]);
   P.reducteur({id:"R1",x:166,y:110,haut:"ca",bas:"n4",lab:"1V2"});
   P.reducteur({id:"R2",x:314,y:110,haut:"cb",bas:"n2",lab:"1V3"});
   P.ligne("n4",[[166,154],[166,180],[232,180],[232,210]]);P.ligne("n2",[[314,154],[314,180],[256,180],[256,210]]);
   P.distributeur({id:"1V1",x:220,y:210,s:48,cases:2,ref:1,
     ports:{"4":{cote:"h",f:.25,net:"n4"},"2":{cote:"h",f:.75,net:"n2"},"5":{cote:"b",f:.2,net:"atm5",echap:true},"1":{cote:"b",f:.5,net:"p"},"3":{cote:"b",f:.8,net:"atm3",echap:true}},
     chemins:{0:[["1","4"],["2","3"]],1:[["1","2"],["4","5"]]},bloques:{0:["5"],1:["3"]},gauche:"bouton",droite:"ressort",cmdG:"14",lab:"1V1",labX:276,labY:196,labA:"start"});
   P.ligne("p",[[244,258],[244,300]]);P.ligne("p",[[244,280],[290,280]]);P.point("p",244,280);P.mano("M1",301,280);
   P.distributeur(V0(224,300));
   P.ligne("src",[[236,340],[236,369]]);P.source(236,380,"réseau 6 bar");
 },
 zones:[[162,214,28,40,"Bouton 14 du distributeur 1V1","S1"]],
 commandes:[{type:"maintenu",id:"S1",titre:"Bouton 14 de 1V1",dist:"1V1",pos:0,repos:1}],
 reglages:[{id:"R1",titre:"1V2 · réglage de la rentrée",min:10,max:100,val:100},{id:"R2",titre:"1V3 · réglage de la sortie",min:10,max:100,val:40}],
 vanne:true,
 sources:["src"],echap:["atm3","atm5","atmV0"],
 liaisons:[["ca","n4"],["cb","n2"]],
 verins:[{id:"1A",type:"double",A:"ca",B:"cb",regA:"R1",regB:"R2"}],
 manos:{M1:"p"},
 explications(e){
   const L=[];const r=e.reglages;
   if(!e.vanneOuverte){L.push(["La vanne 0V1 est fermée et le circuit est à l'échappement : le vérin n'est plus poussé dans aucun sens. Attention, une tige chargée pourrait bouger sous l'effet d'une charge.","ko"]);return L;}
   if(e.cls.ca==="P")L.push([`Bouton 14 appuyé : 1 relié à 4, la chambre arrière se remplit, la tige sort. L'air de la chambre avant s'échappe par 1V3, réglé à ${r.R2} % : sortie en ${temps(r.R2)} s.`,"ok"]);
   else L.push([`Repos : 1 relié à 2, la chambre avant se remplit, la tige rentre. L'air de la chambre arrière s'échappe par 1V2, réglé à ${r.R1} % : rentrée en ${temps(r.R1)} s.`,""]);
   L.push(["Le réducteur freine l'air qui sort du vérin (réglage à l'échappement) ; l'air qui entre passe librement par le clapet. On règle ainsi une vitesse stable, même avec une charge.",""]);
   return L;
 }},

/* ======================= 3. 5/2 bistable ======================= */
{id:"bistable",type:"pneu",titre:"Distributeur bistable : la mémoire",
 resume:"Distributeur 5/2 à deux commandes, sans ressort. Une impulsion suffit : il garde sa position jusqu'à l'ordre inverse.",
 notions:["Distributeur bistable","Effet mémoire","Commande par impulsion"],
 vue:[520,420],
 dessin(P){
   P.verin({id:"1A",x:150,y:60,w:180,h:36,course:20,lab:"1A"});
   P.ligne("n4",[[166,96],[166,180],[232,180],[232,210]]);P.ligne("n2",[[314,96],[314,180],[256,180],[256,210]]);
   P.distributeur({id:"1V1",x:220,y:210,s:48,cases:2,ref:1,
     ports:{"4":{cote:"h",f:.25,net:"n4"},"2":{cote:"h",f:.75,net:"n2"},"5":{cote:"b",f:.2,net:"atm5",echap:true},"1":{cote:"b",f:.5,net:"p"},"3":{cote:"b",f:.8,net:"atm3",echap:true}},
     chemins:{0:[["1","4"],["2","3"]],1:[["1","2"],["4","5"]]},bloques:{0:["5"],1:["3"]},gauche:"bouton",droite:"bouton",cmdG:"14",cmdD:"12",lab:"1V1",labX:320,labY:200,labA:"start"});
   P.ligne("p",[[244,258],[244,300]]);P.ligne("p",[[244,280],[290,280]]);P.point("p",244,280);P.mano("M1",301,280);
   P.distributeur(V0(224,300));
   P.ligne("src",[[236,340],[236,369]]);P.source(236,380,"réseau 6 bar");
 },
 zones:[[162,214,28,40,"Bouton 14 du distributeur 1V1","S14"],[270,214,28,40,"Bouton 12 du distributeur 1V1","S12"]],
 commandes:[{type:"impulsion",id:"S14",titre:"Impulsion 14 (sortie)",dist:"1V1",pos:0},{type:"impulsion",id:"S12",titre:"Impulsion 12 (rentrée)",dist:"1V1",pos:1}],
 vanne:true,
 sources:["src"],echap:["atm3","atm5","atmV0"],
 verins:[{id:"1A",type:"double",A:"n4",B:"n2"}],
 manos:{M1:"p"},
 explications(e){
   const L=[];
   if(!e.vanneOuverte){L.push(["La vanne 0V1 est fermée : plus de pression. Le distributeur bistable garde pourtant sa position : à la réouverture, le vérin repartira dans le dernier sens commandé. C'est un risque de mouvement inattendu à prendre en compte avant de remettre l'air.","ko"]);return L;}
   L.push([e.pos["1V1"]===0?"Dernier ordre reçu : 14. Le distributeur reste dans cette position même après l'impulsion : la tige est sortie et y reste.":"Dernier ordre reçu : 12. Le distributeur reste dans cette position : la tige est rentrée et y reste.","ok"]);
   L.push(["Contrairement au monostable, il n'y a pas de ressort de rappel : relâcher le bouton ne change rien. C'est l'effet mémoire.",""]);
   return L;
 }},

/* ======================= 4. hydraulique ======================= */
{id:"hydraulique",type:"hydro",titre:"Hydraulique : levage d'une charge",
 resume:"Centrale hydraulique avec limiteur de pression, distributeur 4/3 à centre fermé et clapet anti-retour piloté qui maintient la charge.",
 notions:["Limiteur de pression","Distributeur 4/3 centre fermé","Clapet anti-retour piloté","Énergie résiduelle"],
 vue:[540,545],
 dessin(P){
   P.verin({id:"1A",vertical:true,x:200,y:250,w:140,h:40,course:5,charge:"500 kg",travel:0.6,lab:"1A",labX:122,labY:220});
   P.ligne("cA",[[200,287],[240,287],[240,300]]);
   P.clapetPilote({x:240,y:300,haut:"cA",bas:"nA",lab:"1V2"});
   P.ligne("nA",[[240,340],[240,370]]);
   P.ligne("nB",[[200,160],[300,160],[300,355],[258.4,355],[258.4,370]]);
   P.ligne("nB",[[300,320],[262,320]],true);P.point("nB",300,320);
   P.distributeur({id:"1V1",x:226.2,y:370,s:46,cases:3,ref:1,
     ports:{"A":{cote:"h",f:.3,net:"nA"},"B":{cote:"h",f:.7,net:"nB"},"P":{cote:"b",f:.3,net:"p"},"T":{cote:"b",f:.7,net:"t"}},
     chemins:{0:[["P","A"],["B","T"]],1:[],2:[["P","B"],["A","T"]]},bloques:{1:["A","B","P","T"]},
     gauche:"levier",ressortG:true,ressortD:true,lab:"1V1",labX:326,labY:358,labA:"start"});
   P.ligne("p",[[240,416],[240,450]]);P.point("p",240,450);
   P.ligne("p",[[120,475],[120,450],[420,450]]);P.point("p",380,450);P.mano("M1",431,450);
   P.ligne("p",[[380,450],[380,470]]);P.limiteur({x:380,y:470,lab:"0V1 limiteur"});
   P.ligne("t2",[[380,500],[380,520]]);P.reservoir(380,528);
   P.ligne("t",[[258.4,416],[258.4,520]]);P.reservoir(258.4,528);
   P.pompe(120,490);P.ligne("aspi",[[120,505],[120,520]]);P.reservoir(120,528);
   P.texte(60,520,"0P1","fl-t gras","end");
 },
 zones:[],
 commandes:[{type:"levier",id:"L",dist:"1V1",gauche:"Monter",droite:"Descendre",posG:0,posD:2,repos:1}],
 pompe:true,
 reglages:[{id:"tarage",titre:"Tarage du limiteur 0V1",min:20,max:160,val:120,unite:"bar"}],
 options:[{id:"clapet",titre:"Clapet anti-retour piloté 1V2 en place",val:true}],
 sources:["p"],echap:["t","t2","aspi"],
 verins:[{id:"1A",type:"hydro",A:"cA",B:"nB"}],
 manos:{M1:"p"},
 explications(e){
   const L=[],h=e.hydro||{};
   if(h.messages)h.messages.forEach(m=>L.push(m));
   return L;
 }}
];
})();
