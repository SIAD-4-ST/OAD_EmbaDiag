# EmbaDiag — Outil d'éco-conception des emballages en Champagne

Application web de diagnostic éco-conception destinée aux maisons de Champagne. Elle évalue l'impact environnemental des emballages d'une cuvée à travers huit catégories, produit un score global (EmbaScore), trois scores d'axes transversaux et une empreinte carbone estimée par bouteille.

---

## Sommaire

1. [Architecture des fichiers](#1-architecture-des-fichiers)
2. [Méthodologie de calcul](#2-méthodologie-de-calcul)
   - [EmbaScore global](#embascore-global)
   - [Scores par catégorie](#scores-par-catégorie)
   - [Axes transversaux](#axes-transversaux)
   - [Empreinte carbone](#empreinte-carbone)
   - [Score global pondéré multi-cuvées](#score-global-pondéré-multi-cuvées)
3. [Référence des fichiers](#3-référence-des-fichiers)
   - [index.html](#indexhtml)
   - [js/scripts.js](#jsscriptsjs)
   - [js/poptabledata.js](#jspoptabledatajs)
   - [js/saveResults.js](#jssaveresultsjs)
   - [css/styles.css](#cssstylescss)
4. [Dépendances](#4-dépendances)
5. [Déploiement](#5-déploiement)

---

## 1. Architecture des fichiers

```
OAD_EmbaDiag/
├── index.html               Point d'entrée unique de l'application
├── css/
│   └── styles.css           Tous les styles (design system, layout, composants)
├── js/
│   ├── scripts.js           Calculs, affichage des résultats, accordéons, barre de scores
│   ├── poptabledata.js      Gestion des cuvées, persistance localStorage, infobulles
│   └── saveResults.js       Export CSV, import CSV (parser RFC 4180)
└── media/
    ├── bouteille.png        Icône section Bouteille
    ├── coiffe.png           Icône section Coiffe
    ├── bouchons.png         Icône section Bouchage
    ├── etiquette.png        Icône section Étiquette
    ├── coffret-vin.png      Icône section Étuis / Coffrets
    ├── papier-kraft.png     Icône section Suremballage
    ├── boite-ouverte.png    Icône section Carton d'expédition
    ├── boite-cadeau.png     Icône section Objets publicitaires
    ├── gaz-carbonique.png   Icône empreinte carbone
    ├── logo-large@2x.png    Logo Adelphe
    ├── logo_epsyvin_baseline_h.png
    ├── CIVC_Sign_Q.png      Logo CIVC (favicon et header)
    ├── Logo_pdf.png         Icône bouton guide PDF
    └── plan-de-prevention-commun-champagne_2023.pdf
```

Les trois fichiers JS sont chargés dans cet ordre en bas de `<body>` : `scripts.js` → `saveResults.js` → `poptabledata.js`. Les variables globales définies dans `poptabledata.js` (`cuveeData`, `cuveeIdCounter`) sont accessibles depuis `scripts.js` car les fonctions sont appelées après le chargement complet du DOM.

---

## 2. Méthodologie de calcul

### Principe général

Le système utilise une **logique de pénalités** (points perdus) plutôt que de points gagnés. Chaque mauvais choix éco-conception ajoute des points bruts à un compteur de section. Le score affiché est l'inverse normalisé : `score (%) = (1 − points_bruts / max_section) × 100`. Un score de 100 % signifie aucune pénalité détectée (pratiques optimales ou données non renseignées).

### EmbaScore global

```
totalRaw = Σ(points bruts de chaque section)
EmbaScore = arrondi((1 − totalRaw / 70) × 100)
```

Le dénominateur **70** est la somme des maxima de toutes les sections :

| Section          | Max points bruts |
|------------------|-----------------|
| Bouteille        | 9               |
| Coiffe           | 10              |
| Bouchage         | 5               |
| Étiquette        | 11              |
| Étuis / Coffrets | 15              |
| Suremballage     | 9               |
| Carton           | 8               |
| Objets pub.      | 3               |
| **Total**        | **70**          |

Couleur d'affichage : vert ≥ 80 %, orange ≥ 60 %, rouge < 60 %.

---

### Scores par catégorie

Chaque section produit un pourcentage indépendant : `pct = arrondi((1 − score_section / max_section) × 100)`.

#### Bouteille (max 9)

| Condition | Points bruts | Axe transversal |
|-----------|-------------|-----------------|
| Poids > 910 g | +3 | Sobriété +1 |
| 835 g < poids ≤ 910 g ET forme ≠ « Spéciale » | +3 | Sobriété +1 |
| 835 g < poids ≤ 910 g ET forme = « Spéciale » | +1 | Sobriété +1 |
| Couleur opaque | +3 | Recyclage +1 |
| Couleur blanche | +3 | Matériaux +1 |
| Incrustations = Oui | +3 | Recyclage +1 |

> La règle de poids 835–910 g s'applique dès que la forme n'est pas explicitement déclarée « Spéciale » (valeur par défaut traitée comme standard).

#### Coiffe (max 10)

| Condition | Points bruts | Axe |
|-----------|-------------|-----|
| Matière = Étain | +3 | Sobriété +1 |
| Matière = Alu épais | +1 | Sobriété +1 |
| Matière = Complexe alu-PE | +1 | Sobriété +1 |
| Longueur = Longue | +1 | Sobriété +1 |
| Collerette papier (tradi ou auto-adhésive) | +1 | Sobriété +1 |
| Collerette plastique ou métal | +3 | Sobriété +3 |
| Plastique thermoformé = Oui | +3 | Recyclage +1 |

#### Bouchage (max 5)

| Condition | Points bruts | Axe |
|-----------|-------------|-----|
| Plaque plastique | +3 | Recyclage +1 |
| Impressions : monochrome+inf, polychrome, ou polychrome+inf | +1 | Sobriété +1 |
| Bouchon non issu de forêts gérées durablement | +1 | Matériaux +1 |

#### Étiquette (max 11)

| Condition | Points bruts | Axe |
|-----------|-------------|-----|
| Nombre d'étiquettes ≥ 2 | +1 | Sobriété +1 |
| Nombre de couleurs ≥ 3 | +1 | Sobriété +1 |
| Aplats de couleurs cochés | +1 | Sobriété +1 |
| Matière = Papier coton ou Métallique | +3 | Matériaux +1 |
| Résistance à l'humide cochée | +1 | Matériaux +1 |
| Dorure à chaud | +1 | Sobriété +1 |
| Colle ultra-adhésive | +3 | Recyclage +1 |

> La pénalité matière ne porte que sur l'étiquette principale. La contre-étiquette contribue uniquement au carbone.

#### Étuis / Coffrets (max 15)

| Condition | Points bruts | Axe |
|-----------|-------------|-----|
| Type = Sur commande seulement | +1 | Sobriété +1 |
| Type = Systématique | +3 | Sobriété +1 |
| Poids ≥ 900 g | +1 | Sobriété +1 |
| Éléments associés cochés | +1 | Sobriété +1 |
| Aplats de couleurs cochés | +1 | Sobriété +1 |
| Papier de soie coché | +1 | Sobriété +1 |
| Papier cartonné coché | +1 | Matériaux +1 |
| Carton coché | +0 | Matériaux +1 (meilleure option, pas de pénalité eco) |
| Bois coché | +3 | Recyclage +1 |
| Plastique coché | +1 | Matériaux +1 |
| Aimant(s) cochés | +3 | Recyclage +1 |

#### Suremballage (max 9)

| Condition | Points bruts | Axe |
|-----------|-------------|-----|
| Type = Sacs sur demande | +1 | Sobriété +1 |
| Type = Sacs systématiques | +3 | Sobriété +1 |
| Aplats de couleurs cochés | +1 | Sobriété +1 |
| Papier coché | +1 | Matériaux +1 |
| Plastique coché | +1 | Matériaux +1 |
| Aimant(s) cochés | +3 | Recyclage +1 |

#### Carton d'expédition (max 8)

| Condition | Points bruts | Axe |
|-----------|-------------|-----|
| Non recyclé | +1 | Matériaux +1 |
| Cannelure double (EB ou BE) | +1 | Sobriété +1 |
| Intercalaire mousse plastique | +3 | Matériaux +1 |
| Intercalaire carton | +1 | Matériaux +1 |
| Scotch plastique | +1 | Matériaux +1 |
| Dorure à chaud | +1 | Sobriété +1 |
| Encre huile minérale | +1 | Matériaux +1 |

#### Objets publicitaires (max 3)

| Condition | Points bruts | Axe |
|-----------|-------------|-----|
| Objet publicitaire = Oui | +3 | Sobriété +1 |

---

### Axes transversaux

Trois axes synthétisent des pénalités issues de plusieurs sections :

| Axe | Max | Formule affichée |
|-----|-----|-----------------|
| Sobriété | 21 | `(1 − scoresobriete / 21) × 100` |
| Recyclage | 7 | `(1 − scorerecyclage / 7) × 100` |
| Matériaux | 13 | `(1 − scoremateriaux / 13) × 100` |

Chaque axe est visualisé par une barre dégradée rouge → vert avec un indicateur positionné en pourcentage.

---

### Empreinte carbone

Estimation en **gCO₂e par bouteille**, calculée par addition de contributions unitaires. Les facteurs d'émission proviennent du guide Plan de Prévention Commun Champagne 2023.

#### Bouteille (verre)

```
carbone += (poids_kg) × facteur_couleur
```

| Couleur | Facteur (gCO₂e/kg verre) |
|---------|--------------------------|
| Verte   | 680                      |
| Brune   | 765                      |
| Opaque  | 765                      |
| Blanche | 1 018                    |

#### Coiffe

Valeurs fixes en gCO₂e selon la combinaison matière × longueur :

| Matière | Longue | Courte |
|---------|--------|--------|
| Étain | 49,73 | 28,23 |
| Alu épais | 23,2 | 13,18 |
| Complexe alu-PE | 14,8 | 8,4 |
| Alu fin | 10,62 | 6,03 |
| Papier | 1,6 | 0,8 |

Contributions collerette (gCO₂e) : papier tradi +0,169 — papier auto-adhésif +0,437 — plastique +5,757 — métal +11,320.

#### Bouchage

| Élément | Contribution |
|---------|-------------|
| Plaque (métal ou plastique) | +5,58 gCO₂e |
| Capsule de tirage (si poids bouteille > 0) | +8,356 gCO₂e |
| Bouchon liège (si poids bouteille > 0) | +42,791 gCO₂e |

#### Étiquette

| Matière étiquette | gCO₂e | Matière contre-étiquette | gCO₂e |
|-------------------|-------|--------------------------|-------|
| Papier traditionnel | 0,210 | Papier traditionnel | 0,090 |
| Papier auto-adhésif | 0,392 | Papier auto-adhésif | 0,168 |
| Papier coton | 5,167 | Papier coton | 2,218 |
| Plastique | 5,167 | Plastique | 2,218 |
| Métallique | 10,160 | Métallique | 4,361 |

#### Étuis / Coffrets

Contribution = `(poids_kg) × facteur_matière`. Coefficient 0,5 si distribution sur commande seulement (fréquence réduite).

| Matière | Facteur (gCO₂e/kg) |
|---------|-------------------|
| Bois | 700 |
| Papier cartonné | 641 |
| Carton | 932 |
| Plastique | 3 105 |

#### Carton d'expédition

Divisé par 6 (nombre standard de bouteilles par caisse) :

| Cannelure | gCO₂e/caisse |
|-----------|-------------|
| Simple B ou E | 211 / 6 ≈ 35,2 |
| Double EB ou BE | 321 / 6 = 53,5 |

| Intercalaire | gCO₂e/caisse |
|--------------|-------------|
| Carton | 55,91 / 6 ≈ 9,3 |
| Cellulose moulée | 109,95 / 6 ≈ 18,3 |
| Mousse plastique | 9,75 / 6 ≈ 1,6 |

---

### Score global pondéré multi-cuvées

Lorsque plusieurs cuvées ont été calculées, un **score global pondéré** est affiché dans la barre supérieure :

```
Si au moins une cuvée a un volume (nb bouteilles) renseigné :
  score_global = Σ(score_i × nb_i) / Σ(nb_i)   [moyenne pondérée]

Sinon :
  score_global = Σ(score_i) / n                  [moyenne simple]
```

---

## 3. Référence des fichiers

### index.html

Page unique de l'application. Aucun framework, aucun build. Structure du DOM :

```
<body>
  .header                   Logos Adelphe + CIVC + titre
  #topBar                   Barre unifiée (flex-shrink:0)
    .topbar-controls        Boutons Sauvegarder / Sélecteur cuvée / Modifier
    #scoresBar              Carte score global + cartes par cuvée (générées par JS)
  #cuveePopup               Popup modale (position:fixed) — gestion de la gamme
  #resultsPanel             Panneau résultats horizontal (caché jusqu'au 1er calcul)
    .rp-embascore           Score global + détail 8 composants en grille 2×4
    .rp-radar               Canvas Chart.js radar
    .rp-axes                3 barres Sobriété/Recyclage/Matériaux + CO₂
    .rp-advises             Liste des points d'amélioration
  #diagnosticFormContainer  Grille formulaire (flex:1, remplit le reste du viewport)
    .form-wrapper
      .form-grid            2 colonnes d'accordéons (overflow-y:auto)
        .form-col           Gauche : Bouteille, Coiffe, Bouchage, Étiquette
        .form-col           Droite : Étuis, Suremballage, Carton, Objets pub.
      .form-actions         Boutons Calculer / Exporter / Charger / PDF
```

**IDs importants référencés par JS :**

| ID | Rôle |
|----|------|
| `bottleWeight`, `bottleshape`, `bottlecolor`, `bottleincr` | Champs Bouteille |
| `coiffeMat`, `coiffeSize`, `coiffecoll`, `coiffethermo` | Champs Coiffe |
| `capsuleType`, `capsuleColor`, `bouchonType` | Champs Bouchage |
| `etiquetteCount`, `etiquetteColor`, `etiquetteEcoInk`, `etiquetteMat`, `etiquettecontreMat`, `papierreshum`, `etiquetteDor`, `etiquetteColle` | Champs Étiquette |
| `etuisType`, `etuiWeight`, `elementsassos`, `etuisEcoink`, `etuissilkpaper`, `etuisPapier`, `etuisCarton`, `etuisBois`, `etuisPlastique`, `etuisAimant` | Champs Étuis |
| `suremballage`, `suremballageEcoink`, `sacPapier`, `sacCarton`, `sacPlastique`, `sacAimant` | Champs Suremballage |
| `cartonRecycled`, `cartonCannelure`, `cartonInter`, `cartonScotch`, `cartonDor`, `cartonInk` | Champs Carton |
| `objet` | Champ Objets pub. |
| `cuveeSelect` | Sélecteur de cuvée active |
| `embascore` | Affichage EmbaScore |
| `indicebottle` … `indiceobjet` | Scores par composant |
| `indicesobriete`, `indicerecyclage`, `indicemateriaux` | Labels axes transversaux |
| `Sobriété-indicator`, `Recyclage-indicator`, `Matériaux-indicator` | Indicateurs barres axes |
| `indicecarbone` | Affichage empreinte carbone |
| `diagnosisAdvise` | Liste `<ul>` des points d'amélioration |
| `radarChart` | Canvas du graphique radar |
| `rp-cuvee-name` | Nom de la cuvée dans le titre du panneau résultats |
| `scoresBar` | Zone des cartes de scores (topbar) |
| `resultsPanel` | Panneau résultats horizontal |
| `csvFileInput` | Input fichier CSV (masqué) |

---

### js/scripts.js

Contient tous les calculs et la logique d'affichage des résultats.

#### Variable globale

| Variable | Type | Description |
|----------|------|-------------|
| `radarChartInstance` | `Chart \| null` | Instance Chart.js en cours. Détruite et recréée à chaque calcul pour éviter les fuites mémoire. |

#### Fonctions

---

##### `calculateDiagnosis()`

Fonction principale appelée par le bouton **Calculer les résultats**. Lecture du DOM → calcul des scores → affichage → persistence.

**Variables locales — Entrées formulaire**

Toutes lues via `document.getElementById(...).value` ou `.checked` :

| Variable | Type JS | Champ source |
|----------|---------|--------------|
| `bottleWeight` | `number` (parseFloat) | `#bottleWeight` |
| `bottleshape` | `string` | `#bottleshape` |
| `bottlecolor` | `string` | `#bottlecolor` |
| `bottleincr` | `string` | `#bottleincr` |
| `coiffeMat` | `string` | `#coiffeMat` |
| `coiffeSize` | `string` | `#coiffeSize` |
| `coiffecoll` | `string` | `#coiffecoll` |
| `coiffethermo` | `string` | `#coiffethermo` |
| `capsuleType` | `string` | `#capsuleType` |
| `capsuleColor` | `string` | `#capsuleColor` |
| `bouchonType` | `string` | `#bouchonType` |
| `etiquetteCount` | `number` (parseInt \|\| 0) | `#etiquetteCount` |
| `etiquetteColor` | `number` (parseInt \|\| 0) | `#etiquetteColor` |
| `etiquetteEcoInk` | `boolean` | `#etiquetteEcoInk` (checkbox) |
| `etiquetteMat` | `string` | `#etiquetteMat` |
| `etiquettecontreMat` | `string` | `#etiquettecontreMat` |
| `papierreshum` | `boolean` | `#papierreshum` (checkbox) |
| `etiquetteDor` | `string` | `#etiquetteDor` |
| `etiquetteColle` | `string` | `#etiquetteColle` |
| `etuisType` | `string` | `#etuisType` |
| `etuiWeight` | `number` (parseFloat \|\| 0) | `#etuiWeight` |
| `elementsassos` | `boolean` | `#elementsassos` |
| `etuisEcoink` | `boolean` | `#etuisEcoink` |
| `etuissilkpaper` | `boolean` | `#etuissilkpaper` |
| `etuisPapier` | `boolean` | `#etuisPapier` |
| `etuisCarton` | `boolean` | `#etuisCarton` |
| `etuisBois` | `boolean` | `#etuisBois` |
| `etuisPlastique` | `boolean` | `#etuisPlastique` |
| `etuisAimant` | `boolean` | `#etuisAimant` |
| `suremballage` | `string` | `#suremballage` |
| `suremballageEcoink` | `boolean` | `#suremballageEcoink` |
| `sacPapier` | `boolean` | `#sacPapier` |
| `sacCarton` | `boolean` | `#sacCarton` |
| `sacPlastique` | `boolean` | `#sacPlastique` |
| `sacAimant` | `boolean` | `#sacAimant` |
| `cartonRecycled` | `string` | `#cartonRecycled` |
| `cartonCannelure` | `string` | `#cartonCannelure` |
| `cartonInter` | `string` | `#cartonInter` |
| `cartonScotch` | `string` | `#cartonScotch` |
| `cartonDor` | `string` | `#cartonDor` |
| `cartonInk` | `string` | `#cartonInk` |
| `objet` | `string` | `#objet` |

**Variables locales — Accumulateurs de scores**

| Variable | Max théorique | Description |
|----------|--------------|-------------|
| `scorebottle` | 9 | Points de pénalité section Bouteille |
| `scorecoiffe` | 10 | Points de pénalité section Coiffe |
| `scorebouchage` | 5 | Points de pénalité section Bouchage |
| `scoreetiquette` | 11 | Points de pénalité section Étiquette |
| `scoreetuis` | 15 | Points de pénalité section Étuis |
| `scoresuremb` | 9 | Points de pénalité section Suremballage |
| `scorecarton` | 8 | Points de pénalité section Carton |
| `scoreobjet` | 3 | Points de pénalité section Objets pub. |
| `scoresobriete` | 21 | Points de pénalité axe Sobriété (transversal) |
| `scorerecyclage` | 7 | Points de pénalité axe Recyclage (transversal) |
| `scoremateriaux` | 13 | Points de pénalité axe Matériaux (transversal) |
| `scorecarbone` | — | Empreinte carbone cumulée en gCO₂e/bouteille |
| `advises` | — | Tableau des messages de recommandation |

**Variables locales — Scores calculés**

| Variable | Formule | Description |
|----------|---------|-------------|
| `totalRaw` | `Σ score_section` | Somme brute globale (max 70) |
| `score` | `arrondi((1 − totalRaw/70) × 100)` | EmbaScore affiché |
| `pctBottle` … `pctObjet` | `arrondi((1 − score_section/max) × 100)` | Scores composants en % |
| `pctSobriete` | `arrondi((1 − scoresobriete/21) × 100)` | Axe Sobriété en % |
| `pctRecyclage` | `arrondi((1 − scorerecyclage/7) × 100)` | Axe Recyclage en % |
| `pctMateriaux` | `arrondi((1 − scoremateriaux/13) × 100)` | Axe Matériaux en % |

---

##### `renderRadarChart(scores)`

Crée ou recrée le graphique radar Chart.js.

| Paramètre | Type | Description |
|-----------|------|-------------|
| `scores` | `number[]` | Tableau de 8 pourcentages : `[pctBottle, pctCoiffe, pctBouchage, pctEtiquette, pctEtuis, pctSuremb, pctCarton, pctObjet]` |

Utilise `radarChartInstance` (variable globale) pour détruire le graphique précédent avant d'en créer un nouveau. Les points sont colorés en vert (≥ 80 %), orange (≥ 60 %), rouge (< 60 %).

---

##### `setScoreIndicator(id, scorecolor)`

Positionne l'indicateur circulaire sur une barre de score.

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | `string` | ID de l'élément indicateur (`Sobriété-indicator`, etc.) |
| `scorecolor` | `number` | Valeur en % (0–100). Traduit directement en `left: X%` |

---

##### `setValueColor(id, pct)`

Applique un badge coloré (fond + texte) à un élément de score composant.

| Paramètre | Seuil | Couleur texte | Fond |
|-----------|-------|--------------|------|
| `pct ≥ 80` | Vert | `#15803d` | `#dcfce7` |
| `pct ≥ 60` | Orange | `#b45309` | `#fef3c7` |
| `pct < 60` | Rouge | `#b91c1c` | `#fee2e2` |

---

##### `updateScoresBar()`

Regénère le contenu HTML de `#scoresBar` (dans `#topBar`).

- Filtre `cuveeData` pour ne garder que les cuvées ayant un `score` stocké.
- Si aucune : affiche un texte placeholder.
- Calcule le score global pondéré (ou moyenne simple si aucun volume).
- Génère une carte `.score-card.global` et une carte `.score-card` par cuvée calculée.
- Chaque carte cuvée a un `onclick` qui charge cette cuvée dans le formulaire.
- La carte de la cuvée active reçoit la classe `.active`.

**Variables locales**

| Variable | Description |
|----------|-------------|
| `scored` | Sous-tableau de `cuveeData` ayant un champ `score` |
| `totalW` | Somme pondérée `Σ(score × nb)` |
| `totalNb` | Somme des volumes `Σ(nb)` |
| `isWeighted` | `true` si au moins une cuvée a un volume > 0 |
| `globalScore` | Score global calculé |
| `activeCuveeId` | Valeur courante du `#cuveeSelect` |

---

##### `viewPDF()`

Ouvre le guide PDF dans un nouvel onglet : `media/plan-de-prevention-commun-champagne_2023.pdf`.

---

##### Bloc d'initialisation des accordéons (code immédiat)

Boucle exécutée au chargement. Pour chaque bouton `.accordion` :
- Ferme tous les autres panneaux (retire la classe `active`, `display: none`).
- Toggle le panneau courant.
- Ajoute la classe `panel-entering` pour déclencher l'animation CSS, retirée après 200 ms.

---

### js/poptabledata.js

Gère le cycle de vie des données cuvées : création, lecture, mise à jour, persistance localStorage, et popup de gestion.

#### Variables globales

| Variable | Type | Description |
|----------|------|-------------|
| `cuveeData` | `Array<Object>` | Tableau principal. Chaque objet : `{ id: number, name: string, nb: string, diagnostic: Object, score?: number }` |
| `cuveeIdCounter` | `number` | Compteur auto-incrémenté pour générer des IDs uniques de cuvée |

**Structure d'un objet `diagnostic`** (44 champs) — miroir exact des champs du formulaire, tous stockés en `string` ou `boolean`. Voir la liste complète dans `saveDiagnostic()`.

#### Fonctions

---

##### `persistData()`

Sérialise `cuveeData` et `cuveeIdCounter` en JSON dans `localStorage` sous les clés `embaDiag_cuveeData` et `embaDiag_cuveeIdCounter`. Silencieux en cas d'échec (contexte file://, mode privé, etc.).

---

##### `loadPersistedData()`

Appelée au `DOMContentLoaded`. Lit `localStorage`, désérialise, puis appelle `updateCuveeDropdown()` et `updateScoresBar()` pour restaurer l'état visuel complet de la session précédente.

---

##### `saveCuvees()`

Callback du bouton de fermeture de la popup. Lit les lignes du tableau `#cuveeTable` :
- Met à jour `nb` des cuvées existantes (recherche par nom).
- Ajoute les nouvelles cuvées avec `diagnostic: {}` et `id: cuveeIdCounter++`.
- Appelle `persistData()`, `updateCuveeDropdown()`, `closePopup()`.

---

##### `openPopup()`

Affiche `#cuveePopup` (`display: flex`). Reconstruit le tableau HTML depuis `cuveeData`. Ajoute une ligne vide si le tableau est vide.

---

##### `closePopup()`

Masque `#cuveePopup` (`display: none`).

---

##### `addNewRow()`

Insère une ligne vide éditable dans le tableau de la popup et place le focus sur la première cellule.

---

##### `updateCuveeDropdown()`

Reconstruit les `<option>` du `#cuveeSelect`. Chaque option a `value = cuvee.id` et affiche le nom + le volume formaté en français (`toLocaleString('fr-FR')`).

---

##### `loadCuveeData()`

Appelée au changement de `#cuveeSelect`. Trouve la cuvée dont `id == select.value`, puis affecte chacun de ses 44 champs diagnostic aux éléments du formulaire correspondants. Valeurs manquantes remplacées par `''` ou `'0'` selon le type de champ. Termine par `updateScoresBar()` pour mettre à jour la carte active.

---

##### `saveDiagnostic()`

Appelée par le bouton Sauvegarder et par le bouton Calculer. Lit les 44 champs du formulaire et les stocke dans `selectedCuvee.diagnostic`. Alerte si aucune cuvée n'est sélectionnée. Termine par `persistData()`.

---

##### Bloc `DOMContentLoaded` — Infobulles

Initialise les infobulles sur tous les éléments `.tooltip-icon` :
- `mouseenter` : crée un `div.tooltip-box`, le positionne en absolu via `getBoundingClientRect()` + `window.scrollY`, l'ajoute au `<body>`.
- `mouseleave` : supprime le `div.tooltip-box` du DOM.

---

### js/saveResults.js

Gère l'export et l'import CSV (format RFC 4180, BOM UTF-8 pour compatibilité Excel).

#### Fonctions

---

##### `saveResults()`

Génère un fichier CSV et déclenche son téléchargement.

- En-têtes : 45 colonnes (nom cuvée, volume, puis les 43 champs diagnostic).
- Corps : une ligne par cuvée dans `cuveeData` (toutes les cuvées, pas seulement la cuvée active).
- Toutes les valeurs sont encapsulées par `csvCell()`.
- Crée un `Blob` `text/csv;charset=utf-8` avec BOM `﻿`, génère une URL objet et simule un clic.

---

##### `csvCell(value)`

Formate une valeur pour CSV RFC 4180 : convertit en chaîne, entoure de guillemets doubles, double les guillemets internes (`"` → `""`).

---

##### `loadCSV(event)`

Callback du `<input type="file" id="csvFileInput">`. Lit le fichier sélectionné avec `FileReader` en UTF-8, passe le texte à `parseCSV()`. Réinitialise `event.target.value` pour permettre le rechargement du même fichier.

---

##### `parseCSVLine(line)`

Parseur de ligne CSV robuste gérant les guillemets, les virgules dans les valeurs et les guillemets doublés.

| Paramètre | Type | Description |
|-----------|------|-------------|
| `line` | `string` | Une ligne brute du CSV |

Retourne `string[]` — tableau des cellules de la ligne.

---

##### `parseCSV(csvText)`

Parseur de fichier complet.

1. Supprime le BOM éventuel.
2. Découpe en lignes, ignore les lignes vides.
3. Ignore la ligne d'en-tête (index 0).
4. Pour chaque ligne : construit un objet `{ id, name, nb, diagnostic }` via `parseCSVLine()`.
5. Convertit les champs booléens (`'Oui'` → `true`).
6. Remplace entièrement `cuveeData`, recalcule `cuveeIdCounter`.
7. Appelle `persistData()`, `updateCuveeDropdown()`, `updateScoresBar()`.

---

### css/styles.css

Design system complet en vanilla CSS. Utilise des variables CSS (`--primary`, `--gold`, `--bg`, etc.) et Google Fonts Inter.

#### Variables CSS (`:root`)

| Variable | Valeur | Usage |
|----------|--------|-------|
| `--primary` | `#0077c8` | Bleu CIVC, boutons, focus |
| `--primary-dark` | `#005a9e` | Hover, titres |
| `--primary-light` | `#e8f4fd` | Fonds clairs, zone contrôles |
| `--gold` | `#c9a227` | Or champagne, accordéon actif, CTA |
| `--gold-dark` | `#9c7d1e` | Hover gold |
| `--gold-light` | `#fdf6e3` | Fond carte cuvée active |
| `--bg` | `#f0f4f8` | Fond page |
| `--surface` | `#ffffff` | Fond cartes et panneaux |
| `--border` | `#e2e8f0` | Bordures et séparateurs |
| `--text` | `#1a2332` | Texte principal |
| `--text-muted` | `#64748b` | Labels, titres de section |
| `--radius` | `12px` | Border-radius standard |
| `--shadow` | — | Ombre card légère |
| `--shadow-lg` | — | Ombre popup |

#### Sections principales du CSS

| Sélecteur | Description |
|-----------|-------------|
| `body` | `height: 100vh; overflow: hidden; display: flex; flex-direction: column` — layout viewport-filling |
| `.header` | `flex-shrink: 0` — reste visible, ne compresse pas |
| `#topBar` | Barre unifiée flex : `.topbar-controls` (fond bleu clair) + `.topbar-scores` (scrollable) |
| `.results-panel` | `flex-shrink: 0; max-height: 170px` — panneau résultats compact, caché (`display:none`) jusqu'à la classe `.visible` |
| `#diagnosticFormContainer` | `flex: 1; min-height: 0` — remplit l'espace restant |
| `.form-wrapper` | `flex: 1; min-height: 0; display: flex; flex-direction: column` |
| `.form-grid` | `flex: 1; min-height: 0; display: grid; grid-template-columns: 1fr 1fr` |
| `.form-col` | `overflow-y: auto; scrollbar-width: thin` — défilement interne des accordéons |
| `.accordion` | Dégradé bleu → or champagne au survol/actif ; flèche `▸` animée |
| `.score-bar` | Barre de 5 segments colorés (rouge → vert foncé), indicateur positionné en `%` |
| `.score-card` | Carte de score cuvée dans la topbar (cliquable) |
| `.score-card.global` | Carte score global (non cliquable, fond bleu clair) |
| `.rp-section` | Section du panneau résultats : `flex: 1; border-left` séparateur |
| `.popup` | `position: fixed; backdrop-filter: blur(4px)` — overlay modale |

---

## 4. Dépendances

| Dépendance | Version | Usage |
|------------|---------|-------|
| [Chart.js](https://www.chartjs.org/) | CDN `jsdelivr` | Graphique radar |
| [Google Fonts — Inter](https://fonts.google.com/specimen/Inter) | CDN | Typographie |

Aucun framework JavaScript ni bundler. L'application fonctionne en ouvrant `index.html` directement dans un navigateur (y compris en `file://`), à l'exception de la persistance localStorage qui peut être indisponible selon les restrictions du navigateur en mode fichier local.

---

## 5. Déploiement

Placer les fichiers tels quels sur tout serveur web statique (Apache, Nginx, GitHub Pages, etc.). Aucune compilation ni configuration serveur requise.

```
cp -r OAD_EmbaDiag/ /var/www/html/embadiag/
```

Les données utilisateur sont stockées exclusivement dans le `localStorage` du navigateur — aucune base de données ni API backend. L'export CSV permet la sauvegarde et le partage des diagnostics entre postes.

---

*Développé par le Comité Interprofessionnel du Vin de Champagne (CIVC) dans le cadre du déploiement du Plan de Prévention Commun Champagne 2023.*
