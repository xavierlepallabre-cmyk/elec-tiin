# Élec TIIN

Simulateurs de schémas électriques pour les apprentis du **Bac Pro TIIN** — Lycée Alexis de Tocqueville, Cherbourg-en-Cotentin.

Application statique, installable sur tablette et utilisable hors connexion, sur le même principe que Nucléa TIIN et Sûreté & Cycle TIIN : HTML, CSS et JavaScript natifs, sans framework, sans compte, sans serveur, sans aucune note ni historique.

## Contenu de la version 1.4

**Atelier** — trois simulateurs :
- Démarrage direct un sens (disjoncteur-moteur, transformateur 400 V / 24 V, sectionneur général cadenassable) ;
- Deux sens de marche (inversion L1 / L3, verrouillages, voyants H1 à H4) ;
- Démarrage étoile-triangle (temporisation de KM2 visible, couplage détecté).

Dans chaque simulateur : les fils sous tension passent en rouge, le neutre et le 0 V en bleu ; on manœuvre les appareils sur le schéma ou au pupitre ; on simule une surcharge ; une option repère les phases L1, L2, L3 par couleur ; un cadre explique chaque étape.

**Défis** — schémas à trous en cinq niveaux : sur le démarrage direct (l'auto-maintien ; arrêter et protéger ; NO ou NF ?), sur les deux sens de marche (le verrouillage électrique) et sur l'étoile-triangle (les contacts temporisés). L'apprenti place les pièces, puis lance un test automatique animé : la simulation joue le résultat, même faux (contacteur qui bat, moteur qui démarre seul, moteur grillé faute de protection, court-circuit faute de verrouillage, pas de passage en triangle), et explique pourquoi. Aucun résultat n'est enregistré. Les niveaux se décrivent dans `js/defis-data.js`.

**Dépannage** — seize pannes cachées dans les trois schémas (contact usé ou oxydé, bobine coupée, pôle hors service, contacts soudés, voyant grillé, contact temporisé défaillant). L'apprenti observe le symptôme, mesure au multimètre virtuel (tension sous tension, résistance hors tension, refus de l'ohmmètre sur un circuit alimenté), fait maintenir un bouton par un collègue, puis désigne l'élément défaillant. Les contacts sont dessinés dans l'état de leur appareil : la panne ne se voit qu'à la mesure. Pannes décrites dans `js/depannage-data.js`.

**Consignation** — scénario de remplacement du moteur d'une pompe secourue par un groupe électrogène, selon la NF C 18-510 (2012 + A1 2020 + A2 2023) :
- *procédure guidée* : séparation de toutes les sources, condamnation, identification, VAT avec autotest avant et après la mesure, MALT-CC, attestation de consignation, puis avis de fin de travail et déconsignation dans le bon ordre ;
- *mode erreurs* : ordre libre, puis une journée de travail met la consignation à l'épreuve (opérateur qui veut refermer, essai du groupe électrogène) avec un bilan étape par étape ;
- *rôles et habilitations* : circuit des documents, rôles BC, B2, B1, BR, B0, lecture des symboles, quiz ;
- *fluides* : les quatre opérations et les niveaux d'isolement de l'INRS ED 6109 (3e éd., 2020), avec une conduite interactive (fuite de vanne, purge, joint plein, tronçon démonté).

**Symboles** — imagier de 23 symboles IEC 60617 (lettre repère, bornes, fonction) et jeu de reconnaissance par séries de dix questions, sans enregistrement du résultat.

## Organisation du dossier

```
elec-tiin/
├── index.html, style.css, icon.svg, manifest.webmanifest, sw.js
├── js/
│   ├── dessin.js            symboles (mêmes dessins que les macros LaTeX symboles-electriques.tex)
│   ├── moteur.js            simulation « tout ou rien » (équipotentielles, contacteurs, temporisations)
│   ├── atelier.js           liste des schémas et simulateur
│   ├── symboles-data.js     contenu de l'imagier
│   ├── symboles.js          imagier et jeu
│   ├── defis-data.js        niveaux, emplacements et pièces des Défis
│   ├── defis.js             schéma à trous et test automatique
│   ├── depannage-data.js    pannes, résistances et méthode du Dépannage
│   ├── depannage.js         diagnostic et multimètre virtuel
│   ├── consignation-data.js scénario, rôles, quiz et fluides de la Consignation
│   ├── consignation.js      procédure guidée, mode erreurs, rôles, fluides
│   ├── app.js               navigation, thème, mises à jour
│   └── schemas/             ★ un fichier par schéma (voir AJOUTER-UN-SCHEMA.md)
├── assets/                  police Lexend (licence OFL) et logo du lycée
├── icons/                   icônes de l'application installée
├── tools/version.py         met à jour le numéro de cache avant publication
└── tests/test_app.py        78 vérifications dans un vrai navigateur
```

## Publier sur GitHub Pages

1. Sur github.com, compte `xavierlepallabre-cmyk` : **New**, nom `elec-tiin`, visibilité **Public**.
2. **Add file › Upload files** : glisser **le contenu** du dossier (`index.html` doit être à la racine). **Commit changes**.
3. **Settings › Pages** : *Deploy from a branch*, branche **main**, dossier **/ (root)**.
4. Après une à deux minutes : **https://xavierlepallabre-cmyk.github.io/elec-tiin/**

Pour l'ajouter au Portail TIIN, déclarer une fiche dans `data/catalogue.json` du portail, rubrique `applications`. Les simulateurs s'ouvrent directement par leur adresse : `#/atelier/direct-un-sens`, `#/atelier/deux-sens`, `#/atelier/etoile-triangle` (utilisables comme raccourcis).

## Mettre à jour

1. Modifier ou ajouter les fichiers.
2. Lancer `python tools/version.py` : le numéro de cache de `sw.js` change, les tablettes proposeront « Mettre à jour ».
3. Tester (ci-dessous), puis publier.

Tout nouveau fichier doit être ajouté à la liste `ASSETS` de `sw.js` et, pour un schéma, à `index.html` (voir AJOUTER-UN-SCHEMA.md).

## Tester

Le service worker ne fonctionne pas en `file://` : il faut un petit serveur local.

```
python -m http.server 8000
python tests/test_app.py            (dans un second terminal ; --captures pour enregistrer des images)
```

Prérequis des tests : `pip install playwright` puis `python -m playwright install chromium`.

## Limites assumées

- Simulation « tout ou rien » : aucun calcul de courant, de chute de tension ni d'échauffement. La surcharge est déclenchée par un bouton.
- Un court-circuit (deux sources reliées sans récepteur) fait déclencher l'appareil de protection désigné dans le schéma.
- Les contacteurs changent d'état instantanément ; seules les temporisations ont une durée.
