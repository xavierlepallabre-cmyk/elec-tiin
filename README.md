# Élec TIIN

Simulateurs de schémas électriques pour les apprentis du **Bac Pro TIIN** — Lycée Alexis de Tocqueville, Cherbourg-en-Cotentin.

Application statique, installable sur tablette et utilisable hors connexion, sur le même principe que Nucléa TIIN et Sûreté & Cycle TIIN : HTML, CSS et JavaScript natifs, sans framework, sans compte, sans serveur, sans aucune note ni historique.

## Contenu de la version 1.7

**Atelier** — trois simulateurs :
- Démarrage direct un sens (disjoncteur-moteur, transformateur 400 V / 24 V, sectionneur général cadenassable) ;
- Deux sens de marche (inversion L1 / L3, verrouillages, voyants H1 à H4) ;
- Démarrage étoile-triangle (temporisation de KM2 visible, couplage détecté).

Dans chaque simulateur : les fils sous tension passent en rouge, le neutre et le 0 V en bleu ; on manœuvre les appareils sur le schéma ou au pupitre ; on simule une surcharge ; une option repère les phases L1, L2, L3 par couleur ; un cadre explique chaque étape.

**Fluidique** — quatre simulateurs en symboles ISO 1219-1 (repérage des orifices ISO 5599) : vérin simple effet et distributeur 3/2 ; vérin double effet, distributeur 5/2 monostable et réducteurs de débit unidirectionnels (vitesse réglée à l'échappement) ; distributeur 5/2 bistable et effet mémoire ; centrale hydraulique avec limiteur de pression réglable, distributeur 4/3 à centre fermé et clapet anti-retour piloté qui maintient une charge (pression piégée, dérive sans clapet, chute de la charge). Vanne de sectionnement avec mise à l'échappement sur les circuits pneumatiques.

**Défis** — schémas à trous en cinq niveaux : sur le démarrage direct (l'auto-maintien ; arrêter et protéger ; NO ou NF ?), sur les deux sens de marche (le verrouillage électrique) et sur l'étoile-triangle (les contacts temporisés). L'apprenti place les pièces, puis lance un test automatique animé : la simulation joue le résultat, même faux (contacteur qui bat, moteur qui démarre seul, moteur grillé faute de protection, court-circuit faute de verrouillage, pas de passage en triangle), et explique pourquoi. Aucun résultat n'est enregistré. Les niveaux se décrivent dans `js/defis-data.js`.

**Dépannage** — seize pannes cachées dans les trois schémas (contact usé ou oxydé, bobine coupée, pôle hors service, contacts soudés, voyant grillé, contact temporisé défaillant). L'apprenti observe le symptôme, mesure au multimètre virtuel (tension sous tension, résistance hors tension, refus de l'ohmmètre sur un circuit alimenté), fait maintenir un bouton par un collègue, puis désigne l'élément défaillant. Les contacts sont dessinés dans l'état de leur appareil : la panne ne se voit qu'à la mesure. Pannes décrites dans `js/depannage-data.js`.

**Sécurité** — deux volets.

*Consigner* : pompe secourue par un groupe électrogène selon la NF C 18-510 (2012 + A1 2020 + A2 2023), et presse hydraulique selon l'INRS ED 6109 :
- *procédure guidée* : séparation de toutes les sources, condamnation, identification, VAT avec autotest avant et après la mesure, MALT-CC, attestation de consignation, puis avis de fin de travail et déconsignation dans le bon ordre ;
- *mode erreurs* : ordre libre, puis une journée de travail met la consignation à l'épreuve (opérateur qui veut refermer, essai du groupe électrogène) avec un bilan étape par étape ;
- *rôles et habilitations* : circuit des documents, rôles BC, B2, B1, BR, B0, lecture des symboles, quiz ;
- *presse hydraulique* (procédure guidée et mode erreurs) : intervention sous l'outil en position haute ; béquille de sécurité, séparation électrique (sectionneur du moteur de pompe) et hydraulique (vanne d'isolement), purge de l'accumulateur et de la chambre du vérin, condamnation des purges ouvertes, vérification (manomètres, essai de démarrage, essai du levier), déconsignation avec reprise de la charge avant le retrait de la béquille ;
- *fluides* : les quatre opérations et les niveaux d'isolement de l'INRS ED 6109 (3e éd., 2020), avec une conduite interactive (fuite de vanne, purge, joint plein, tronçon démonté).

*Protéger les personnes* :
- *le disjoncteur différentiel* : installation en schéma TT (transformateur, neutre à la terre, DDR avec son tore et son bouton test, appareil à carcasse métallique, PE et prise de terre Ra). On choisit la sensibilité (aucun, 30, 300, 500 mA), l'isolement (sain, abîmé, défaut franc), le PE (raccordé ou coupé), la prise de terre (20, 100, 500 Ω), ce que touche la personne (rien, la carcasse, un fil de phase, phase et neutre) et l'état de sa peau. Le simulateur calcule le courant de fuite, la tension de la masse, le courant dans le corps et sa durée, vérifie la règle Ra × IΔn ≤ 50 V et anime le chemin du courant. Sept expériences guident l'apprenti (dont le piège du PE coupé et le contact phase-neutre que le DDR ne voit pas) ;
- *les effets du courant* : I = U / R selon la tension touchée et l'état de la peau, placé sur une échelle des seuils (perception, non-lâcher, paralysie respiratoire, fibrillation, arrêt cardiaque), avec la tension limite UL ;
- *accident électrique* : deux situations (arrêt cardiaque ; victime consciente brûlée) à résoudre en choisissant les gestes dans l'ordre Protéger, Examiner, Faire alerter, Secourir (référentiel SST, INRS ED 7000). Toucher la victime avant de couper provoque un sur-accident ; les autres erreurs sont expliquées et listées au bilan.

**Symboles** — imagier de 23 symboles IEC 60617 (lettre repère, bornes, fonction) et jeu de reconnaissance par séries de dix questions, sans enregistrement du résultat.

**Export (v1.9)** — chaque folio de l'Atelier et chaque symbole de l'imagier s'exporte en fichier autonome :
- *SVG* vectoriel, pour un cours LaTeX (via `\includesvg` ou après conversion en PDF avec Inkscape), un traitement de texte ou Éléa ; *PNG* à 300 ppp avec la police Lexend incorporée ;
- *au repos* (schéma normalisé, contacts en position de repos) ou *dans l'état affiché* par la simulation (fils sous tension en couleur) ;
- option *noir et blanc* pour la photocopie : traits et textes noirs, voyants allumés et bobines alimentées en gris, sans filtre global (le rendu reste vectoriel) ;
- échelle 1:1 (1 cm du schéma = 1 cm imprimé), palette du thème clair même si l'application est en thème sombre, zones cliquables retirées, titre et licence inscrits dans le fichier.

## Organisation du dossier

```
elec-tiin/
├── index.html, style.css, icon.svg, manifest.webmanifest, sw.js
├── js/
│   ├── dessin.js            symboles (mêmes dessins que les macros LaTeX symboles-electriques.tex)
│   ├── export.js            export SVG / PNG autonome des schémas et des symboles
│   ├── moteur.js            simulation « tout ou rien » (équipotentielles, contacteurs, temporisations)
│   ├── atelier.js           liste des schémas et simulateur
│   ├── symboles-data.js     contenu de l'imagier
│   ├── symboles.js          imagier et jeu
│   ├── defis-data.js        niveaux, emplacements et pièces des Défis
│   ├── defis.js             schéma à trous et test automatique
│   ├── fluidique-dessin.js  symboles pneumatiques et hydrauliques (ISO 1219-1)
│   ├── fluidique-data.js    circuits de la Fluidique
│   ├── fluidique.js         simulateur fluidique
│   ├── depannage-data.js    pannes, résistances et méthode du Dépannage
│   ├── depannage.js         diagnostic et multimètre virtuel
│   ├── consignation-data.js scénario, rôles, quiz et fluides de la Consignation
│   ├── consignation.js      procédure guidée, mode erreurs, rôles, fluides
│   ├── consignation-fluides.js consignation de la presse hydraulique
│   ├── protection.js        différentiel, effets du courant, accident électrique
│   ├── app.js               navigation, thème, mises à jour
│   └── schemas/             ★ un fichier par schéma (voir AJOUTER-UN-SCHEMA.md)
├── assets/                  police Lexend (licence OFL) et logo du lycée
├── icons/                   icônes de l'application installée
├── cours/                   schémas des cours (descriptions, générateur, SVG produits ; voir cours/README.md)
├── tools/version.py         met à jour le numéro de cache avant publication
├── tools/generer_schemas.py génère et contrôle les schémas des cours
└── tests/test_app.py        132 vérifications dans un vrai navigateur
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

## Auteur et droits

Conception originale : Xavier Le Pallabre  
Ressource pédagogique développée à titre personnel, avec l’assistance d’outils d’intelligence artificielle.  
© 2026 Xavier Le Pallabre — Attribution de l’auteur original à conserver lors des réutilisations et adaptations, conformément à la licence applicable : [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.fr).

## Licence

Sauf mention contraire, le contenu de ce dépôt (code, textes, schémas, illustrations) est mis à disposition selon les termes de la licence **Creative Commons Attribution – Pas d'utilisation commerciale – Partage dans les mêmes conditions 4.0 International** ([CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.fr)). Texte complet : fichier `LICENSE`.

Tu peux le réutiliser, le copier et l'adapter, à trois conditions :
- **Attribution** : citer l'auteur original (Xavier Le Pallabre), indiquer la licence et signaler les modifications ;
- **Pas d'utilisation commerciale** : pas de vente ni d'usage dans un service payant ;
- **Partage dans les mêmes conditions** : diffuser les adaptations sous la même licence.

Ne sont pas couverts par cette licence :
- la police Lexend (`assets/fonts/`), sous licence SIL Open Font License 1.1 (voir `assets/fonts/OFL.txt`) ;
- le logo du lycée Alexis de Tocqueville, propriété de l'établissement ;
- les normes citées (IEC, NF, INRS), qui restent la propriété de leurs éditeurs : l'application les résume sans les reproduire.
