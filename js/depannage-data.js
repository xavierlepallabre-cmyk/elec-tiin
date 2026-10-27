/* Élec TIIN — Dépannage : pannes cachées dans les schémas de l'Atelier.
   Chaque panne : schéma, symptôme constaté, défaut injecté, éléments à désigner, explication de la mesure qui le trouve.
   Résistances indicatives utilisées par le multimètre (hors tension). */
(function(){
"use strict";
window.ELEC_DEPANNAGE={
  resistances:{
    "direct-un-sens":{bobine:45,transfo:12,enroulement:4.8},
    "deux-sens":{bobine:1150,voyant:9800,enroulement:4.8},
    "etoile-triangle":{bobine:1150,enroulement:2.6}
  },
  methode:[
    ["Constater","Fais fonctionner l'installation et observe précisément le symptôme : qu'est-ce qui marche, qu'est-ce qui ne marche pas ?"],
    ["Délimiter","Puissance ou commande ? Quel contacteur ou quel récepteur ne réagit pas ? Lis le schéma pour isoler la zone en cause."],
    ["Mesurer","Sous tension, au voltmètre : un contact fermé affiche 0 V, un contact ouvert dans un circuit alimenté affiche la tension du circuit. Hors tension, à l'ohmmètre : continuité ou circuit ouvert (OL)."],
    ["Conclure","Désigne l'élément défaillant. Remplacer une pièce saine coûte du temps et de l'argent : n'accuse un élément qu'après l'avoir mesuré."]
  ],
  pannes:[
    /* ---------- démarrage direct un sens (commande 24 V) ---------- */
    {id:"d1",schema:"direct-un-sens",symptome:"Quand on appuie sur S2, rien ne se passe : KM1 ne colle pas.",
     defaut:{ouverts:["S2c"]},cibles:["S2c"],
     explication:"Le contact 3-4 de S2 ne se ferme plus (contact usé). S2 maintenu appuyé, on mesure 24 V entre ses bornes 3 et 4 au lieu de 0 V. Hors tension, S2 appuyé : OL."},
    {id:"d2",schema:"direct-un-sens",symptome:"Quand on appuie sur S2, rien ne se passe : KM1 ne colle pas.",
     defaut:{coupees:["bKM1"]},cibles:["bKM1"],
     explication:"La bobine de KM1 est coupée. S2 maintenu appuyé, les 24 V arrivent bien entre A1 et A2, mais KM1 ne colle pas. Hors tension, l'ohmmètre affiche OL entre A1 et A2 au lieu d'environ 45 Ω."},
    {id:"d3",schema:"direct-un-sens",symptome:"Quand on appuie sur S2, rien ne se passe : KM1 ne colle pas.",
     defaut:{ouverts:["S1c"]},cibles:["S1c"],
     explication:"Le contact NF 1-2 de S1 reste ouvert (contact oxydé). S2 maintenu appuyé, on mesure 24 V entre les bornes 1 et 2 de S1, alors qu'au repos ce contact doit être fermé."},
    {id:"d4",schema:"direct-un-sens",symptome:"Quand on appuie sur S2, rien ne se passe : KM1 ne colle pas. Q1 est pourtant fermé.",
     defaut:{ouverts:["Q1a"]},cibles:["Q1a"],
     explication:"Le contact auxiliaire 13-14 de Q1 ne se ferme plus. Q1 fermé et S2 maintenu, on mesure 24 V entre ses bornes 13 et 14."},
    {id:"d5",schema:"direct-un-sens",symptome:"Le moteur démarre avec S2, mais il s'arrête dès qu'on relâche le bouton.",
     defaut:{ouverts:["KMa"]},cibles:["KMa"],
     explication:"Le contact d'auto-maintien 13-14 de KM1 ne se ferme plus. S2 relâché, KM1 retombe. Hors tension, en enfonçant KM1 à la main (ou en le testant au banc), l'ohmmètre reste sur OL entre 13 et 14."},
    {id:"d6",schema:"direct-un-sens",symptome:"KM1 colle bien quand on appuie sur S2, mais le moteur ronfle et ne démarre pas.",
     defaut:{ouverts:["K12"]},cibles:["K12"],
     explication:"Le pôle 3-4 de KM1 ne ferme plus : le moteur ne reçoit que deux phases. KM1 collé, on mesure 0 V aux bornes des pôles 1-2 et 5-6, mais une tension entre 3 et 4."},
    {id:"d7",schema:"direct-un-sens",symptome:"Le moteur tourne dès que Q1 est fermé, sans appui sur S2, et S1 ne l'arrête pas : il faut ouvrir Q1 pour le stopper.",
     defaut:{fermes:["K11","K12","K13"]},cibles:["K11","K12","K13"],
     explication:"Les contacts de puissance de KM1 sont soudés (forte surintensité, usure). La bobine n'est pas alimentée (0 V entre A1 et A2, KM1 au repos) mais le moteur reste alimenté : les pôles de KM1 restent fermés. Le contacteur est à remplacer."},
    /* ---------- deux sens de marche (commande 230 V) ---------- */
    {id:"s1",schema:"deux-sens",symptome:"Le sens 1 ne démarre pas. Le sens 2 fonctionne normalement.",
     defaut:{ouverts:["KM2v"]},cibles:["KM2v"],
     explication:"Le contact NF 21-22 de KM2, dans la colonne de KM1, reste ouvert. S2 maintenu, on mesure 230 V entre ses bornes 21 et 22."},
    {id:"s2",schema:"deux-sens",symptome:"Le sens 1 ne démarre pas. Le sens 2 fonctionne normalement.",
     defaut:{ouverts:["S2c"]},cibles:["S2c"],
     explication:"Le contact 3-4 de S2 ne se ferme plus. S2 maintenu, on mesure 230 V entre ses bornes 3 et 4."},
    {id:"s3",schema:"deux-sens",symptome:"Le moteur tourne en sens 1, mais le voyant H1 « marche avant » reste éteint.",
     defaut:{coupees:["H1"]},cibles:["H1"],
     explication:"Le voyant H1 est grillé. En sens 1, on mesure bien 230 V entre X1 et X2 de H1 : la tension arrive, c'est la lampe qui est hors service."},
    {id:"s4",schema:"deux-sens",symptome:"Le moteur tourne en sens 1, mais le voyant H1 « marche avant » reste éteint.",
     defaut:{ouverts:["H1c"]},cibles:["H1c"],
     explication:"Le contact 43-44 de KM1 qui commande H1 ne se ferme plus. En sens 1, on mesure 230 V entre ses bornes 43 et 44 et 0 V aux bornes du voyant."},
    {id:"s5",schema:"deux-sens",symptome:"Plus rien ne démarre. Le voyant H4 est allumé et F1 n'a pas déclenché.",
     defaut:{ouverts:["F1c"]},cibles:["F1c"],
     explication:"Le contact NF 95-96 du relais thermique reste ouvert alors que F1 est armé. S2 maintenu, on mesure 230 V entre 95 et 96. Le relais est à remplacer."},
    /* ---------- étoile-triangle (commande 230 V) ---------- */
    {id:"e1",schema:"etoile-triangle",symptome:"Le moteur démarre en étoile, puis s'arrête au moment où il devrait passer en triangle.",
     defaut:{ouverts:["KM2t2"]},cibles:["KM2t2"],
     explication:"Le contact temporisé 67-68 de KM2 ne se ferme pas. Après la temporisation, on mesure 230 V entre ses bornes 67 et 68 : KM3 n'est jamais alimenté."},
    {id:"e2",schema:"etoile-triangle",symptome:"Le moteur démarre en étoile, puis s'arrête au moment où il devrait passer en triangle.",
     defaut:{coupees:["bKM3"]},cibles:["bKM3"],
     explication:"La bobine de KM3 est coupée. Après la temporisation, les 230 V arrivent entre A1 et A2 de KM3, mais il ne colle pas. Hors tension : OL entre A1 et A2."},
    {id:"e3",schema:"etoile-triangle",symptome:"Quand on appuie sur S2, un contacteur colle, mais le moteur ne démarre pas. Tout retombe quand on relâche.",
     defaut:{ouverts:["KM1a"]},cibles:["KM1a"],
     explication:"Le contact 13-14 de KM1 ne se ferme pas : KM2 (ligne) n'est jamais alimenté. S2 maintenu, KM1 est collé et on mesure 230 V entre 13 et 14 de KM1."},
    {id:"e4",schema:"etoile-triangle",symptome:"Quand on appuie sur S2, rien ne se passe : aucun contacteur ne colle.",
     defaut:{ouverts:["KM3v"]},cibles:["KM3v"],
     explication:"Le contact NF 21-22 de KM3, en série avec la bobine de KM1, reste ouvert. S2 maintenu, on mesure 230 V entre ses bornes 21 et 22."}
  ]
};
})();
