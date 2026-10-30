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

## Lot F12 (ELE03)

| Fichier | Contenu |
| --- | --- |
| EL-015 | Contacteur : bobine, contacts principaux et auxiliaires |
| EL-016 | Commande Marche / Arrêt sans auto-maintien |
| EL-017 | Commande Marche / Arrêt avec auto-maintien (points A et B) |
| EL-018 | Auto-maintien complet : FU1, F1 95-96, S1, S2 ∥ KM1 13-14, KM1 ∥ H1 |
| EL-019 | États successifs : repos, Marche appuyé, maintien, Arrêt, coupure, retour de l'alimentation |
| EL-020 | Schéma de l'exercice d'interprétation guidée (emplacements repérés (1), (2), (3)) |
| EL-020-corrige | Défaut du contact KM1 13-14 : Marche appuyé puis relâché |
| EL-021 | Auto-maintien avec signalisation du défaut thermique (F1 97-98, H2) |
| EL-021-etats | En marche, déclenchement de F1, F1 réarmé |

Conventions : schéma développé vertical entre les lignes +24 V et 0 V ; boutons-poussoirs avec le symbole
de commande par poussée ; bornes NF 11-12, NO 13-14 ; dans les vues d'états, trait épais = conducteur relié
au +24 V, bobine ou voyant grisé = alimenté.

Pour LaTeX : `\usepackage{svg}` puis `\includesvg[width=...]{EL-018}` (Inkscape requis), ou conversion
préalable en PDF : `inkscape EL-018.svg --export-type=pdf`.
