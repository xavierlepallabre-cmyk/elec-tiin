# Schémas des cours (SVG noir et blanc)

Les schémas des cours Bac Pro TIIN sont décrits ici avec la bibliothèque de dessin de l'application
(`js/dessin.js`), puis générés en SVG noir et blanc, à l'échelle 1:1, dans `cours/svg/`.

## Générer

```
python -m http.server 8000          (premier terminal, depuis le dossier du projet)
python tools/generer_schemas.py     (second terminal)
```

Le script n'écrit rien si une erreur est détectée.

## Contrôles automatiques

- **Validateur dessin–logique** : chaque borne d'appareil est raccordée au bon conducteur, aucune extrémité
  n'est libre, deux conducteurs de repères différents ne se touchent pas, chaque jonction de trois branches
  porte un point (et aucun point inutile), chaque conducteur est dessiné d'un seul tenant.
- **États calculés** : les vues d'états (EL-019, EL-020-corrige, EL-021-etats) sont calculées par le moteur de
  simulation de l'application ; l'état attendu de chaque récepteur est vérifié et écrit sous la vue.

## Schémas produits (EL-001 à EL-052)

`cours/catalogue.html` présente toutes les vignettes. Les fichiers « -etats » et « -corrige » sont des vues d'états calculées.

| Fichier | Contenu |
| --- | --- |
| EL-001 | Principe d'alimentation BT : L, N, PE (schéma TT) |
| EL-002 | Protection par fusible et par disjoncteur |
| EL-003 | Dispositif différentiel et défaut d'isolement (schéma TT) |
| EL-004 | Séparation, condamnation et vérification d'absence de tension : principe |
| EL-005-etats | Arrêt d'urgence : états successifs |
| EL-005 | Arrêt normal et arrêt d'urgence : distinction fonctionnelle |
| EL-006 | Mesure de tension au voltmètre |
| EL-007 | Mesure du courant à l'ampèremètre |
| EL-008 | Mesure du courant à la pince ampèremétrique |
| EL-009 | Mesure de résistance à l'ohmmètre |
| EL-010 | Mesure de résistance d'isolement au mégohmmètre (circuit isolé) |
| EL-011 | Circuit continu résistif : série et parallèle |
| EL-012 | Circuit monophasé avec récepteur résistif et récepteur inductif |
| EL-013 | Réseau triphasé : L1, L2, L3, N, PE et tensions |
| EL-014 | Mesure de puissance électrique au wattmètre : montage pédagogique |
| EL-015 | Contacteur : bobine, contacts principaux et auxiliaires |
| EL-016 | Commande Marche / Arrêt sans auto-maintien |
| EL-017 | Commande Marche / Arrêt avec auto-maintien |
| EL-018 | Auto-maintien complet avec relais thermique F1 et voyant H1 |
| EL-019 | Auto-maintien : états successifs |
| EL-020-corrige | Auto-maintien : défaut de contact auxiliaire — corrigé |
| EL-020 | Auto-maintien : défaut de contact auxiliaire — schéma de l'exercice |
| EL-021-etats | Déclenchement thermique : états successifs |
| EL-021 | Auto-maintien : déclenchement thermique et signalisation |
| EL-022 | Commande avec deux boutons Marche en parallèle |
| EL-023 | Commande avec deux boutons Arrêt en série |
| EL-024 | Logique câblée ET, OU, NON avec contacts NO et NF |
| EL-025-etats | Relais temporisé au travail : états successifs |
| EL-025 | Relais intermédiaire et relais temporisé |
| EL-026-etats | Capteur tout ou rien : deux états |
| EL-026 | Commande par capteur tout ou rien |
| EL-027-etats | Signalisation : trois états |
| EL-027 | Signalisation des états : disponibilité, marche, défaut |
| EL-028 | Démarrage direct d'un moteur : puissance et commande |
| EL-029 | Inversion de sens d'un moteur : puissance |
| EL-030 | Inversion de sens : commande et verrouillages |
| EL-031 | Inversion de sens : séquence et ordres simultanés impossibles |
| EL-032 | Moteur asynchrone triphasé à cage : stator, rotor, plaque à bornes |
| EL-033 | Couplage étoile et triangle : barrettes de la plaque à bornes |
| EL-034 | Lecture de la plaque signalétique et choix du couplage |
| EL-035 | Démarrage direct : schéma de puissance avec protections |
| EL-036 | Démarrage étoile-triangle : puissance |
| EL-037-etats | Démarrage étoile-triangle : séquence |
| EL-037 | Démarrage étoile-triangle : commande temporisée et verrouillage |
| EL-038 | Moteur à rotor bobiné : bagues, balais et résistances rotoriques |
| EL-039 | Contrôle des enroulements hors tension à l'ohmmètre |
| EL-040 | Mesure d'isolement d'un moteur : représentation pédagogique |
| EL-041 | Protection thermique selon sa position dans le montage |
| EL-042 | Variateur de fréquence et moteur asynchrone : puissance et commande |
| EL-043 | Capteur inductif 3 fils PNP et entrée d'automate |
| EL-044 | Capteur 3 fils NPN et entrée d'automate compatible |
| EL-045-etats | Fin de course : deux états |
| EL-045 | Fin de course mécanique et commande |
| EL-046 | Sortie d'automate vers relais intermédiaire |
| EL-047 | Sortie d'automate vers électrovanne avec interface adaptée |
| EL-048 | Chaîne capteur – API – préactionneur – actionneur |
| EL-049 | Entrées et sorties 24 V continu d'un automate |
| EL-050-etats | Manuel / automatique : trois cas |
| EL-050 | Commande manuelle / automatique : principe logique |
| EL-051 | Signal analogique 4-20 mA : boucle de mesure |
| EL-052 | Signal analogique 0-10 V : câblage de principe |

Sources : `f12.js` (EL-015 à EL-021), `ele03.js`, `ele04.js`, `ele0102.js`, `auto.js`. EL-028 à EL-031 et EL-036/037 reprennent les schémas de l'Atelier.

Conventions : schéma développé vertical entre les lignes +24 V et 0 V ; boutons-poussoirs avec le symbole
de commande par poussée ; bornes NF 11-12, NO 13-14 ; dans les vues d'états, trait épais = conducteur relié
au +24 V, bobine ou voyant grisé = alimenté.

Pour LaTeX : `\usepackage{svg}` puis `\includesvg[width=...]{EL-018}` (Inkscape requis), ou conversion
préalable en PDF : `inkscape EL-018.svg --export-type=pdf`.
