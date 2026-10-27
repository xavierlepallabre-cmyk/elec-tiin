# Ajouter un schéma à l'Atelier

Un schéma est **un seul fichier** dans `js/schemas/`. Le simulateur, le pupitre, les couleurs et le moteur le prennent en charge sans autre modification. Le plus simple : copier `direct-un-sens.js`, le renommer, puis changer les valeurs.

Les coordonnées sont **les mêmes que dans tes fichiers LaTeX** (en cm, y vers le haut) : un schéma dessiné avec `symboles-electriques.tex` se reporte presque ligne à ligne.

## 1. Déclarer le fichier

Dans `index.html`, ajouter avant `symboles-data.js` :
```html
<script src="js/schemas/mon-schema.js"></script>
```
Dans `sw.js`, ajouter `'./js/schemas/mon-schema.js'` à la liste `ASSETS`.

## 2. Les rubriques du fichier

| Rubrique | Rôle |
|---|---|
| `id`, `titre`, `resume`, `notions` | identité et carte de l'Atelier (`id` = adresse `#/atelier/id`) |
| `appareils` | chaque appareil et son type (voir ci-dessous) |
| `sources` | conducteurs reliés au réseau : `{net:"L1", nom:"L1", type:"phase"}` ; neutre ou 0 V : `type:"neutre"`. Source alimentée par un transformateur : ajouter `si:"T1"` |
| `charges` | récepteurs entre deux conducteurs : bobines, voyants, transformateurs |
| `protections` | appareil qui déclenche en cas de court-circuit entre les sources citées |
| `moteur` | `{type:"direct", bornes:["m1","m2","m3"]}` ou `{type:"etoile-triangle", bornes:{U1:…, V2:…}}` ; `afficheSens:true` pour afficher le sens |
| `folios` | un ou plusieurs folios (Puissance, Commande) : dessin et contacts |
| `pupitre`, `defauts` | boutons du pupitre et défauts simulables |
| `explications(e)` | textes du cadre « Ce qui se passe » selon l'état |

## 3. Types d'appareils

| Type | Exemples | Comportement |
|---|---|---|
| `manuel` | QS, Q1, Q2, sectionneur | se ferme / s'ouvre au toucher ; peut déclencher (`declencheLib`) |
| `poussoir` | S1, S2 | actif tant qu'on appuie |
| `au` | arrêt d'urgence | s'enfonce et reste verrouillé jusqu'au toucher suivant |
| `thermique` | F1 | déclenche sur « Surcharge », se réarme au toucher |
| `contacteur` | KM1 | suit sa bobine (`bobine:"bKM1"`) ; `tempo:5` pour une temporisation travail de 5 s |

## 4. Les contacts

Chaque contact relie deux conducteurs (`haut` et `bas`) et appartient à un appareil :
```js
{id:"S1c", app:"S1", mode:"nf", type:"nf", x:7.6, y:-6.5, haut:"c2", bas:"c3", b:["1","2"]}
```
- `type` (le dessin) : `no`, `nf`, `kmp` (pôle de contacteur), `disj`, `disjs`, `isect`, `sect`, `sectfus` ;
- `mode` (le fonctionnement) : `no` (par défaut), `nf`, `tno` / `tnf` (temporisés) ;
- `rot:90` pour un contact horizontal (arrêt d'urgence sur la ligne d'arrivée).

**Règle d'or des conducteurs** : tous les morceaux de fil qui sont électriquement reliés sans contact entre eux portent **le même nom** (`c3`, `k1`…). C'est ce nom qui permet au moteur de savoir ce qui est sous tension.

## 5. Le dessin

`fils` : `["c3", [[x1,y1],[x2,y2],…]]` ; `joncs` : `["c3", x, y]` ; `dessin` : commandes reprenant les macros LaTeX, par exemple :
```js
["poussoir","S1c",6.6,"S1","Arrêt"]   ["lien","Q1a",6.8,"Q1"]   ["lienTempo","KM2t1",0.75,"KM2"]
["lienTherm","F1c",0.6,"F1"]          ["lienMT",[x,y],"Q1"]       ["verrou","K13","K21"]
["bobine","bKM1",x,y,"c4","s0","KM1"] ["voyant","H1",x,y,"h1","N","H1","vert"]  ["moteur",x,y,1.0]
["borne",x,y,"X4"]  ["terre",x,y]  ["cadenas",x,y]  ["au",x,y]  ["transfo","T1",x,y]  ["texte",x,y,"…","note"]
```
`zones` : rectangles tactiles `["S1", x1,y1,x2,y2,"Bouton S1 Arrêt"]` pour manœuvrer l'appareil sur le schéma.

## 6. Vérifier

Ouvrir le schéma, faire un cycle complet, puis lancer `python tests/test_app.py`. Une erreur de nom de conducteur se voit tout de suite : le fil reste noir alors qu'il devrait être rouge.
