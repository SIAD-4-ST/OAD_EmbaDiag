# EmbaDiag v2.0 — Documentation technique

> Copilote d'éco-conception et OAD (Outil d'Aide à la Décision) environnemental des Maisons de Champagne.  
> Développé en conformité avec le Plan de Prévention Commun Champagne, la loi AGEC et les orientations PPWR européennes.

---

## Sommaire

1. [Présentation générale](#1-présentation-générale)
2. [Architecture & lancement](#2-architecture--lancement)
3. [Fichiers — rôle & quand les modifier](#3-fichiers--rôle--quand-les-modifier)
4. [Structure des données : l'objet Diagnostic](#4-structure-des-données--lobjet-diagnostic)
5. [config.js — Facteurs carbone & pénalités](#5-configjs--facteurs-carbone--pénalités)
6. [calculations.js — Moteur de calcul](#6-calculationsjs--moteur-de-calcul)
7. [csv.js — Import / Export](#7-csvjs--import--export)
8. [index.html — Composants React](#8-indexhtml--composants-react)
9. [Barème de scoring détaillé](#9-barème-de-scoring-détaillé)
10. [Axes RSE transversaux](#10-axes-rse-transversaux)
11. [Estimation carbone (gCO₂e)](#11-estimation-carbone-gco₂e)
12. [Simulation What-If](#12-simulation-what-if)
13. [Persistance & export CSV](#13-persistance--export-csv)
14. [Modifier les barèmes](#14-modifier-les-barèmes)

---

## 1. Présentation générale

EmbaDiag est une application **100 % front-end** (HTML + JS + CSS, aucun serveur requis) qui permet aux Maisons de Champagne d'évaluer l'impact environnemental de leurs emballages selon les règles **Adelphe / Citeo** révisées.

### Fonctionnalités principales

| Fonctionnalité | Description |
|---|---|
| **Wizard multi-étapes** | 5 étapes guidées couvrant tous les composants de l'emballage |
| **Score EmbaScore** | Note globale de 0 à 100 calculée en temps réel |
| **Non-concerné par module** | Modules Étuis et Suremballage marquables N/C — exclus du calcul de pénalités |
| **Progression par module** | Badge `x/n` par module indiquant le taux de complétion des champs |
| **Simulation What-If** | Projection du gain si toutes les bonnes pratiques étaient appliquées |
| **Gestion de gamme** | Multi-cuvées avec score global Maison pondéré par volume |
| **Export CSV** | Export de toutes les cuvées avec leurs données brutes (47 colonnes) |
| **Import CSV** | Rechargement d'un export précédent — détection automatique du séparateur `,` / `;` |
| **Persistance localStorage** | Sauvegarde automatique dans le navigateur |
| **Axes RSE** | Scores croisés Sobriété / Recyclabilité / Ressources matières |

---

## 2. Architecture & lancement

### Structure des fichiers

```
OAD_EmbaDiag/
├── index.html          ← Point d'entrée unique (HTML + JSX React inline)
├── README.md
├── css/
│   └── styles.css      ← Animations et styles custom (scrollbar, focus)
└── js/
    ├── config.js       ← Constantes : facteurs carbone et pénalités
    ├── calculations.js ← Moteur de calcul du diagnostic
    └── csv.js          ← Fonctions d'import/export CSV
```

### Ordre de chargement dans le navigateur

```
1. React 18 CDN         (global : React, ReactDOM)
2. Babel Standalone CDN (transpile JSX → JS à la volée)
3. Tailwind CDN         (utilitaires CSS)
4. css/styles.css       (animations, scrollbar)
5. js/config.js         (global : BENCHMARK_CONFIG)
6. js/calculations.js   (global : calculateDiagnostic, simulateWhatIf, createDefaultDiagnostic)
7. js/csv.js            (global : exportToCSV, parseCSV, parseCSVLine, csvCell)
8. <script type="text/babel"> dans index.html  (composants React)
```

> **Note :** Les fichiers 5–7 sont des `<script>` classiques : leurs variables sont accessibles en scope global, ce qui permet aux composants React de les appeler directement sans import.

### Lancement

Double-cliquer sur `index.html` — s'ouvre directement dans le navigateur, aucun serveur requis.

---

## 3. Fichiers — rôle & quand les modifier

### `js/config.js`
Contient **uniquement** l'objet `BENCHMARK_CONFIG` avec les facteurs carbone et les pénalités.  
→ À modifier pour **changer un barème, un facteur carbone, un seuil**.

### `js/calculations.js`
Contient la logique métier pure (aucun HTML, aucun React).  
→ À modifier pour **changer une règle de calcul, ajouter un critère, modifier la pondération**.

### `js/csv.js`
Contient les fonctions d'import/export CSV.  
→ À modifier pour **changer les colonnes exportées ou le format**.

### `index.html`
Contient le HTML de la page + les composants React JSX dans le bloc `<script type="text/babel">` en fin de fichier. C'est le **seul fichier à modifier** pour l'interface utilisateur.  
→ À modifier pour **changer l'interface utilisateur, les libellés, l'ergonomie**.

### `css/styles.css`
Animations CSS et surcharges de style (scrollbar, bordures de focus des inputs).  
→ À modifier pour **changer les transitions ou le style des champs de formulaire**.

---

## 4. Structure des données : l'objet Diagnostic

Chaque cuvée possède un objet `diagnostic` contenant toutes ses caractéristiques d'emballage. C'est l'entrée de la fonction `calculateDiagnostic()`.

### Champs de l'objet diagnostic

#### Bouteille

| Champ | Type | Valeurs possibles | Description |
|---|---|---|---|
| `bottleWeight` | string (num) | `"835"`, `"900"`, … | Poids de la bouteille en grammes |
| `bottleshape` | string | `"standard"`, `"special"` | Forme du flacon |
| `bottlecolor` | string | `"verte"`, `"brune"`, `"opaque"`, `"blanche"` | Couleur du verre |
| `bottleincr` | string | `"oui"`, `"non"` | Présence d'incrustations fusionnées |

#### Coiffe & bouchage

| Champ | Type | Valeurs possibles | Description |
|---|---|---|---|
| `coiffeMat` | string | `"etain"`, `"alu_epais"`, `"complexe"`, `"alu_fin"`, `"papier"`, `"0"` | Matière de la coiffe |
| `coiffeSize` | string | `"longue"`, `"courte"`, `"0"` | Longueur de la coiffe |
| `coiffecoll` | string | `"non"`, `"papier-tradi"`, `"papier-adh"`, `"plastique"`, `"metal"`, `"0"` | Type de collerette |
| `coiffethermo` | string | `"oui"`, `"non"` | Présence d'un manchon thermoformé |
| `capsuleType` | string | `"metalique"`, `"plastique"`, `"0"` | Matière de la plaque muselet |
| `capsuleColor` | string | `"non"`, `"mono"`, `"mono-inf"`, `"poly"`, `"poly-inf"`, `"0"` | Niveau d'impression sur la plaque |
| `bouchonType` | string | `"oui"`, `"non"`, `"nsp"`, `"0"` | Certification FSC/PEFC du bouchon |
| `plaqueSeparable` | string | `"oui"`, `"non"` | Séparabilité plaque / insert plastique |

#### Étiquetage

| Champ | Type | Valeurs possibles | Description |
|---|---|---|---|
| `etiquetteCount` | string (num) | `"1"`, `"2"`, `"3"`, … | Nombre d'étiquettes distinctes |
| `etiquetteColor` | string (num) | `"1"`, `"4"`, `"6"`, … | Nombre de couleurs d'encrage |
| `etiquetteEcoInk` | boolean | `true`, `false` | Présence de grands aplats de couleur |
| `etiquetteInkRatio` | string | `"<30%"`, `"30-70%"`, `">70%"` | Taux d'encrage de surface |
| `etiquetteMat` | string | `"papierepais"`, `"papieradh"`, `"papiercoton"`, `"plastique"`, `"métal"`, `"0"` | Matière de l'étiquette principale |
| `etiquettecontreMat` | string | (idem etiquetteMat) | Matière de la contre-étiquette |
| `papierreshum` | boolean | `true`, `false` | Traitement REH (résistance à l'humidité) |
| `etiquetteDor` | string | `"pasdorure"`, `"dorurefroid"`, `"dorurechaud"`, `"0"` | Type de dorure |
| `etiquetteColle` | string | `"collestand"`, `"colleultra"`, `"collewashoff"`, `"0"` | Technologie de colle |

#### Étuis & suremballage

| Champ | Type | Valeurs possibles | Description |
|---|---|---|---|
| `etuisNC` | boolean | `true`, `false` | Module Étuis non-concerné — exclut toute pénalité étuis |
| `etuisType` | string | `"pasetuiscoffret"`, `"commande"`, `"systematique"`, `"0"` | Mode de distribution des étuis |
| `etuiWeight` | string (num) | `"400"`, `"900"`, … | Poids unitaire de l'étui en grammes |
| `elementsassos` | boolean | `true`, `false` | Livrets et notices associés |
| `etuisEcoink` | boolean | `true`, `false` | Aplats de couleur sur l'étui |
| `etuissilkpaper` | boolean | `true`, `false` | Papier de soie interne |
| `etuisPapier` | boolean | `true`, `false` | Composition : papier |
| `etuisCarton` | boolean | `true`, `false` | Composition : carton |
| `etuisBois` | boolean | `true`, `false` | Composition : bois massif |
| `etuisPlastique` | boolean | `true`, `false` | Composition : plastique |
| `etuisAimant` | boolean | `true`, `false` | Fermetures aimantées |
| `surembNC` | boolean | `true`, `false` | Module Suremballage non-concerné — exclut toute pénalité suremballage |
| `suremballage` | string | `"pas_de_sac"`, `"sac_sur_demande"`, `"sac_systematique"`, `"0"` | Type de suremballage boutique |
| `suremballageEcoink` | boolean | `true`, `false` | Aplats de couleur sur le sac |
| `sacPapier` | boolean | `true`, `false` | Sac en papier |
| `sacCarton` | boolean | `true`, `false` | Sac en carton |
| `sacPlastique` | boolean | `true`, `false` | Sac en plastique |
| `sacAimant` | boolean | `true`, `false` | Fermeture aimantée du sac |

#### Carton d'expédition & objets

| Champ | Type | Valeurs possibles | Description |
|---|---|---|---|
| `cartonRecycled` | string | `"oui"`, `"non"`, `"0"` | Fibres recyclées dans le carton |
| `cartonCannelure` | string | `"B"`, `"E"`, `"EB"`, `"BE"`, `"0"` | Type de cannelure (simple ou double) |
| `cartonInter` | string | `"carton"`, `"cellulose"`, `"plastique"`, `"0"` | Nature des intercalaires |
| `cartonScotch` | string | `"plastique"`, `"papier kraft"`, `"0"` | Type d'adhésif de fermeture |
| `cartonDor` | string | `"pasdorure"`, `"dorurefroid"`, `"dorurechaud"`, `"0"` | Dorure sur le carton |
| `cartonInk` | string | `"huileminerale"`, `"encrevegetale"`, `"0"` | Type d'encrage carton |
| `objet` | string | `"oui"`, `"non"`, `"0"` | Présence d'un objet publicitaire |

---

## 5. config.js — Facteurs carbone & pénalités

L'objet `BENCHMARK_CONFIG` est la **source unique de vérité** pour tous les barèmes.

### `BENCHMARK_CONFIG.uncertaintyPercent`

```js
uncertaintyPercent: 8
```

Marge d'incertitude affichée sur l'estimation carbone (±8 %). Correspond aux variations de taux de calcin régional non captées par le modèle screening.

---

### `BENCHMARK_CONFIG.carbonFactors` — Facteurs d'émission

Toutes les valeurs sont exprimées en **gCO₂e par unité** (sauf indication).

#### Verre (`glass`)

Facteur en **gCO₂e par kg de verre**. Multipliés par le poids de la bouteille (en kg).

| Clé | Valeur (gCO₂e/kg) | Commentaire |
|---|---|---|
| `verte` | 680 | Verre vert, taux de calcin élevé |
| `brune` | 765 | Verre brun |
| `opaque` | 765 | Verre opaque (même facteur que brun) |
| `blanche` | 1018 | Verre blanc : moins de calcin, plus de matière vierge |

**Formule :** `co2Bottle = (poids_g / 1000) × facteur`

#### Coiffe (`coiffe`)

Facteur en **gCO₂e par coiffe**, distinguant coiffe longue et coiffe courte.

| Matière | Longue (gCO₂e) | Courte (gCO₂e) |
|---|---|---|
| `etain` | 49.73 | 28.23 |
| `alu_epais` | 23.2 | 13.18 |
| `complexe` (Alu-PE) | 14.8 | 8.4 |
| `alu_fin` | 10.62 | 6.03 |
| `papier` | 1.6 | 0.8 |

#### Collerette (`collerette`)

Facteur en **gCO₂e par collerette**.

| Type | gCO₂e |
|---|---|
| `papier-tradi` | 0.169 |
| `papier-adh` | 0.437 |
| `plastique` | 5.757 |
| `metal` | 11.320 |

#### Bouchage

| Composant | Clé | gCO₂e | Description |
|---|---|---|---|
| Bouchon liège | `bouchon_standard` | 42.791 | Bouchon de tirage + bouchon de finition |
| Capsule de tirage | `capsule_tirage` | 8.356 | Capsule métallique de tirage |
| Plaque muselet | `capsule_plaque` | 5.58 | Ajouté si une plaque est présente |

**Formule bouchage :** `co2Bouchage = capsule_tirage + bouchon_standard [+ capsule_plaque si plaque présente]`

#### Étiquettes (`etiquette` / `contreEtiquette`)

Facteur en **gCO₂e par étiquette**.

| Matière | Étiquette (gCO₂e) | Contre-étiquette (gCO₂e) |
|---|---|---|
| `papierepais` | 0.210 | 0.090 |
| `papieradh` | 0.392 | 0.168 |
| `papiercoton` | 5.167 | 2.218 |
| `plastique` | 5.167 | 2.218 |
| `métal` | 10.160 | 4.361 |

#### Étuis (`etuis`)

Facteur en **gCO₂e par kg de matière**. Multiplié par le poids de l'étui (en kg).

| Matière | gCO₂e/kg |
|---|---|
| `bois` | 700 |
| `papier` | 641 |
| `carton` | 932 |
| `plastique` | 3105 |

Quand plusieurs matières coexistent, les facteurs s'additionnent.  
Si aucune matière n'est cochée, le facteur `carton` (932) est utilisé par défaut.  
**Réduction de 50 %** si le mode de distribution est `"commande"` (sur demande).

#### Carton d'expédition (`cartonCannelure`, `cartonInter`)

| Composant | Clé | gCO₂e | Condition |
|---|---|---|---|
| Cannelure simple | `cartonCannelure.single` | 35.167 | Cannelure B ou E |
| Cannelure double | `cartonCannelure.double` | 53.500 | Cannelure EB ou BE |
| Intercalaire carton | `cartonInter.carton` | 9.318 | — |
| Intercalaire cellulose | `cartonInter.cellulose` | 18.325 | — |
| Intercalaire plastique | `cartonInter.plastique` | 1.625 | — |

#### Suremballage (sacs boutique)

Valeurs forfaitaires en **gCO₂e par sac** :

| Condition | gCO₂e | Réduction si sur demande |
|---|---|---|
| Sac papier | 15 | × 0.3 → 4.5 |
| Sac plastique | 45 | × 0.3 → 13.5 |
| Autre | 10 | × 0.3 → 3.0 |

---

### `BENCHMARK_CONFIG.penalties` — Pénalités de scoring

Les pénalités sont des points **retranchés** au score. Elles s'accumulent par module.

#### Module Bouteille (`bottle`)

| Paramètre | Valeur | Description |
|---|---|---|
| `minWeight` | 835 | Seuil bas (poids cible recommandé, g) |
| `maxWeight` | 900 | Seuil haut (pénalité maximale à partir de ce poids, g) |
| `maxPenalty` | 3.0 | Pénalité maximale pour poids excessif |
| `specialDiscount` | 0.5 | Réduction de 50 % pour flacons de prestige (`special`) |
| `opaquePenalty` | 3.0 | Pénalité verre opaque |
| `blanchePenalty` | 3.0 | Pénalité verre blanc |
| `incrPenalty` | 3.0 | Pénalité incrustations fusionnées |

**Pénalité poids — calcul interpolé :**
```
ratio = min(1.0, (poids - 835) / (900 - 835))
si flacon special : ratio = ratio × (1 - 0.5) = ratio × 0.5
pénalité = ratio × 3.0
```
Exemple : 870 g standard → ratio = 35/65 = 0.538 → pénalité = 1.62 pts

#### Module Coiffe (`coiffe`)

| Paramètre | Valeur | Déclencheur |
|---|---|---|
| `etainPenalty` | 3.0 | Coiffe en étain |
| `aluEpaisPenalty` | 1.0 | Coiffe alu épais |
| `complexePenalty` | 1.0 | Coiffe composite Alu-PE |
| `longuePenalty` | 1.0 | Coiffe longue |
| `collerettePapierPenalty` | 1.0 | Collerette papier (tradi ou adh) |
| `collerettePlastiqueMetalPenalty` | 3.0 | Collerette plastique ou métal |
| `thermoPenalty` | 3.0 | Manchon thermoformé |

#### Module Bouchage (`bouchage`)

| Paramètre | Valeur | Déclencheur |
|---|---|---|
| `plastiquePenalty` | 3.0 | Plaque muselet plastique |
| `impressionsPenalty` | 1.0 | Impressions complexes (poly, mono-inf, poly-inf) |
| `nonDurableBouchonPenalty` | 1.0 | Bouchon non certifié FSC/PEFC |
| `nonSeparablePlaquePenalty` | 2.0 | Insert plastique non séparable de la plaque |

#### Module Étiquetage (`etiquette`)

| Paramètre | Valeur | Déclencheur |
|---|---|---|
| `multipleLabelsPenalty` | 1.0 | ≥ 2 étiquettes |
| `manyColorsPenalty` | 1.0 | ≥ 3 couleurs |
| `ecoInkPenalty` | 1.0 | Grands aplats de couleur |
| `highEncragePenalty` | 2.0 | Ratio d'encrage > 70 % |
| `unrecyclableMaterialPenalty` | 3.0 | Matière papier coton, métal ou plastique |
| `humidResistPenalty` | 1.0 | Traitement REH |
| `hotDorePenalty` | 1.0 | Dorure à chaud |
| `ultraCollePenalty` | 3.0 | Colle ultra-adhésive (PSA) |
| `washOffBonus` | **-1.0** | Colle Wash-Off (bonus, déduit de la pénalité) |

#### Module Étuis (`etuis`)

| Paramètre | Valeur | Déclencheur |
|---|---|---|
| `systematiquePenalty` | 3.0 | Distribution systématique |
| `unitaireHeavyPenalty` | 1.0 | Poids étui ≥ 900 g |
| `assosPenalty` | 1.0 | Éléments associés (livrets, notices) |
| `aplatPenalty` | 1.0 | Aplats de couleur |
| `silkPaperPenalty` | 1.0 | Papier de soie interne |
| `boisPenalty` | 3.0 | Présence de bois |
| `plastiquePenalty` | 1.0 | Présence de plastique |
| `aimantPenalty` | 3.0 | Fermetures aimantées |

#### Module Suremballage (`suremballage`)

| Paramètre | Valeur | Déclencheur |
|---|---|---|
| `commissionPenalty` | 1.0 | Sac distribué sur demande |
| `systematiquePenalty` | 3.0 | Sac distribué systématiquement |
| `aplatPenalty` | 1.0 | Aplats de couleur sur le sac |
| `plastiquePenalty` | 1.0 | Sac plastique |
| `aimantPenalty` | 3.0 | Fermeture aimantée |

#### Module Carton (`carton`)

| Paramètre | Valeur | Déclencheur |
|---|---|---|
| `nonRecycledPenalty` | 1.0 | Fibres vierges (non recyclées) |
| `doubleCannelurePenalty` | 1.0 | Double cannelure (EB ou BE) |
| `plastiqueInterPenalty` | 3.0 | Intercalaire plastique |
| `cartonInterPenalty` | 1.0 | Intercalaire carton |
| `plastiqueScotchPenalty` | 1.0 | Scotch plastique |
| `hotDorePenalty` | 1.0 | Dorure à chaud sur carton |
| `mineralInkPenalty` | 1.0 | Encres minérales (MOSH/MOAH) |

#### Module Objet publicitaire (`objet`)

| Paramètre | Valeur | Déclencheur |
|---|---|---|
| `presencePenalty` | 3.0 | Présence d'un objet promotionnel |

---

## 6. calculations.js — Moteur de calcul

### Fonction `calculateDiagnostic(d)`

Prend en entrée un objet `diagnostic` (voir §4) et retourne un objet résultat complet.

#### Valeurs retournées

```js
{
  // Scores globaux et par module (0 à 100)
  score,           // Score global EmbaDiag
  scoreBottle,     // Score module Bouteille
  scoreCoiffe,     // Score module Coiffe
  scoreBouchage,   // Score module Bouchage
  scoreEtiquette,  // Score module Étiquetage
  scoreEtuis,      // Score module Étuis
  scoreSuremb,     // Score module Suremballage
  scoreCarton,     // Score module Carton
  scoreObjet,      // Score module Objet

  // Scores RSE transversaux (0 à 100)
  scoreSobriete,   // Axe Sobriété
  scoreRecyclage,  // Axe Recyclabilité
  scoreMateriaux,  // Axe Ressources Matières

  // Bilan carbone
  carbonGCo2,                // Total gCO₂e par bouteille
  carbonUncertaintyPercent,  // Marge d'incertitude (8)

  // Conseils textuels
  advises,  // string[] : liste des recommandations

  // Pénalités brutes (pour débogage)
  rawPenalties: {
    bottle, coiffe, bouchage, etiquette, etuis, suremb, carton, objet,
    sobriete, recyclage, materiaux
  }
}
```

#### Formule de calcul des scores par module

```
score_module = max(0, min(100, round((1 - pénalité_module / plafond_module) × 100)))
```

**Plafonds par module :**

| Module | Plafond | Pénalité max théorique |
|---|---|---|
| Bouteille | 9 | 3 (poids) + 3 (opaque) + 3 (incrustations) |
| Coiffe | 10 | 3 + 1 + 1 + 1 + 3 + 1 = 10 |
| Bouchage | 7 | 3 + 1 + 1 + 2 = 7 |
| Étiquette | 12 | 1+1+1+2+3+1+1+3 = 13, bonus -1 wash-off |
| Étuis | 15 | 3+1+1+1+1+3+1+3 = 14 |
| Suremballage | 9 | 3+1+1+3 = 8 |
| Carton | 8 | 1+1+3+1+1+1+1 = 9 |
| Objet | 3 | 3 |

#### Formule du score global

```
totalRaw = somme des pénalités des 8 modules
score = max(0, min(100, round((1 - totalRaw / 70) × 100)))
```

Le dénominateur **70** est la somme des plafonds théoriques de tous les modules.

#### Paliers de classe

| Score | Classe | Couleur |
|---|---|---|
| ≥ 80 | Classe A — Éco-conçu | Vert |
| 60–79 | Classe B — Améliorable | Or |
| < 60 | Classe C — Pénalisé | Rouge |

---

### Fonction `simulateWhatIf(current)`

Génère un objet diagnostic « idéal » à partir de la cuvée courante, en appliquant les meilleures pratiques :

| Champ modifié | Valeur optimale |
|---|---|
| `bottleWeight` | `'835'` |
| `bottleshape` | `'standard'` |
| `bottlecolor` | conservé sauf blanc → vert |
| `bottleincr` | `'non'` |
| `coiffeMat` | `'papier'` |
| `coiffeSize` | `'courte'` |
| `coiffecoll` | `'non'` |
| `coiffethermo` | `'non'` |
| `capsuleType` | `'metalique'` |
| `bouchonType` | `'oui'` |
| `plaqueSeparable` | `'oui'` |
| `etiquetteCount` | `'1'` |
| `etiquetteEcoInk` | `false` |
| `etiquetteMat` | `'papierepais'` |
| `papierreshum` | `false` |
| `etiquetteDor` | `'pasdorure'` |
| `etiquetteColle` | `'collewashoff'` |
| `etuisType` | `'pasetuiscoffret'` |
| `suremballage` | `'pas_de_sac'` |
| `cartonRecycled` | `'oui'` |
| `cartonCannelure` | `'B'` |
| `cartonInter` | `'cellulose'` |
| `cartonScotch` | `'papier kraft'` |
| `cartonInk` | `'encrevegetale'` |
| `objet` | `'non'` |

---

### Fonction `createDefaultDiagnostic()`

Retourne un objet diagnostic pré-rempli représentant une cuvée "moyenne négative" (valeurs courantes mais non optimales), utilisé lors de la création d'une nouvelle cuvée :

- Bouteille 900 g, verte, standard, sans incrustations
- Coiffe complexe longue, collerette papier traditionnel
- Plaque métallique, bouchon non certifié, plaque inséparable
- 2 étiquettes, 4 couleurs, aplats, papier auto-adhésif, REH, dorure chaud, colle ultra
- Étui systématique 400 g
- Suremballage sur demande, sac papier
- Carton recyclé, double cannelure EB, intercalaire carton, scotch plastique, encre minérale
- Sans objet publicitaire

---

## 7. csv.js — Import / Export

### `exportToCSV(cuvees)`

Génère et télécharge un fichier `embadiag_export.csv`.

- **Encodage :** UTF-8 avec BOM (compatible Excel français)
- **Séparateur :** virgule `,`
- **47 colonnes** correspondant à tous les champs du diagnostic + nom et volume de la cuvée
- Les booléens sont exportés en `"Oui"` / `"Non"`

### `parseCSV(text)`

Recharge un fichier CSV exporté par EmbaDiag.

- Lit la ligne d'en-tête (ignorée, mais requise)
- **Détecte automatiquement le séparateur** `,` ou `;` en comparant leur fréquence dans la ligne d'en-tête (compatibilité Excel FR)
- Reconstruit l'objet `diagnostic` depuis les colonnes en positionnement fixe
- Les booléens `"Oui"` / `"true"` / `"1"` sont convertis en `true`
- Retourne un tableau de cuvées compatible avec l'état React

### `parseCSVLine(line, sep)`

Parseur CSV interne gérant les champs entre guillemets et les guillemets doublés (standard RFC 4180). Accepte un séparateur paramétrable (`,` par défaut).

### `csvCell(v)`

Formate une valeur en cellule CSV (entoure de guillemets, échappe les guillemets internes).

---

## 8. index.html — Composants React

### Composant `App`

Composant racine. Gère l'état global de l'application via `useState`.

**État :**
- `cuvees` : tableau de toutes les cuvées (chacune enrichie de `score` et `result`)
- `selectedId` : identifiant de la cuvée active
- `modalOpen` : visibilité de la modale de gestion de gamme
- `csvError` : message d'erreur en cas d'échec d'import CSV
- `showWhatIf` : visibilité de la modale What-If

**Handlers principaux :**
- `handleDiagChange(newData)` : met à jour le diagnostic de la cuvée active, recalcule le score, persiste
- `handleCatalogSave(newCat)` : remplace la gamme complète après édition
- `handleLoadCSV(e)` : parse un fichier CSV et remplace la gamme
- `handleApplyWhatIf()` : applique le diagnostic optimisé à la cuvée active

---

### Composant `WizardTunnel`

Formulaire en 5 étapes pour saisir les caractéristiques de l'emballage.

**Étape 1 — Flacon & Matière**  
→ Champs : `bottleWeight`, `bottleshape`, `bottlecolor`, `bottleincr`

**Étape 2 — Bouchage & Coiffe**  
→ Champs : `coiffeMat`, `coiffeSize`, `coiffecoll`, `coiffethermo`, `capsuleType`, `plaqueSeparable`, `capsuleColor`, `bouchonType`

**Étape 3 — Étiquetage & Colle**  
→ Champs : `etiquetteCount`, `etiquetteColor`, `etiquetteEcoInk`, `etiquetteInkRatio`, `etiquetteMat`, `etiquettecontreMat`, `papierreshum`, `etiquetteDor`, `etiquetteColle`

**Étape 4 — Étuis & Sacs**  
Chaque sous-section (Étuis et Suremballage) dispose d'un toggle **Non-concerné** : quand activé, tous les champs de la sous-section sont masqués et le module est exclu du calcul de pénalités.  
→ Champs : `etuisNC`, `etuisType`, `etuiWeight`, `elementsassos`, `etuisEcoink`, `etuissilkpaper`, `etuisBois`, `etuisPlastique`, `etuisPapier`, `etuisCarton`, `etuisAimant`, `surembNC`, `suremballage`, `suremballageEcoink`, `sacPapier`, `sacCarton`, `sacPlastique`, `sacAimant`

**Étape 5 — Expédition & Pub**  
→ Champs : `cartonRecycled`, `cartonCannelure`, `cartonInter`, `cartonScotch`, `cartonInk`, `objet`, `cartonDor`

**Sous-composants internes** (définis dans WizardTunnel, accèdent à `data` et `up` par closure) :
- `Sel({ label, name, opts, hint })` : `<select>` contrôlé
- `Num({ label, name, placeholder, hint, disabled })` : `<input type="number">` contrôlé
- `Chk({ id, label, name })` : `<input type="checkbox">` contrôlé

---

### Évaluation détaillée par module (dans `App`)

Chaque module affiche :
- Un badge **`x/n`** indiquant le nombre de champs select/numérique renseignés sur le total attendu — vert si complet, ambre si partiel, gris si vide.
- Un badge **`N/C`** grisé à la place du score quand le module est marqué non-concerné (`etuisNC` / `surembNC`).
- La **barre de progression** du score (absente en mode N/C).

---

### Composant `GammeDashboard`

Barre de navigation supérieure affichant la gamme complète.

**Score Maison :**
- Pondéré par le volume annuel si au moins une cuvée a un volume défini
- Moyenne simple sinon

**Formule pondérée :**
```
scoreMailson = Σ(score_i × volume_i) / Σ(volume_i)
```

---

### Composant `GammeModal`

Modale de gestion du catalogue de cuvées (ajout, renommage, suppression, volume annuel).

Chaque cuvée est créée avec `createDefaultDiagnostic()` et un identifiant auto-incrémenté (`max(ids) + 1`).

---

## 9. Barème de scoring détaillé

### Score global

```
score = max(0, min(100, round((1 - totalRaw / 70) × 100)))
```

Où `totalRaw = Σ(pénalités de tous les modules)`.

### Scores par module

```
score_module = max(0, min(100, round((1 - pénalité_module / plafond) × 100)))
```

| Module | Plafond | Pénalités possibles (max cumulé) |
|---|---|---|
| Bouteille | 9 | Poids interpolé 0→3, opaque +3, blanc +3, incrustations +3 |
| Coiffe | 10 | Étain +3, alu épais +1, complexe +1, longue +1, collerette papier +1, collerette plastique/métal +3, thermo +3 |
| Bouchage | 7 | Plaque plastique +3, impressions poly +1, bouchon non certifié +1, inséparable +2 |
| Étiquette | 12 | Multi-ét. +1, couleurs +1, aplats +1, encrage>70% +2, matière +3, REH +1, dorure chaud +1, ultra-colle +3, wash-off **-1** |
| Étuis | 15 | Systématique +3, lourd ≥900g +1, éléments +1, aplats +1, soie +1, bois +3, plastique +1, aimant +3 |
| Suremballage | 9 | Sur demande +1, systématique +3, aplats +1, plastique +1, aimant +3 |
| Carton | 8 | Vierge +1, double cannelure +1, inter plastique +3, inter carton +1, scotch plastique +1, dorure chaud +1, encre minérale +1 |
| Objet | 3 | Présence +3 |

---

## 10. Axes RSE transversaux

Trois axes transversaux recoupent les critères de plusieurs modules pour donner une lecture RSE synthétique.

### Axe Sobriété (plafond : 21)

Mesure l'effort de réduction à la source (poids, suremballage, simplicité).

**Contributions :**

| Module | Pénalités de sobriété |
|---|---|
| Bouteille | Poids interpolé (0→3) |
| Coiffe | Étain +1, alu épais +1, complexe +1, longue +1, collerette papier +0.5, collerette plastique/métal +2 |
| Bouchage | Impressions poly +0.5 |
| Étiquette | Multi-ét. +0.5, couleurs +0.5, aplats +1, encrage>70% +1, dorure chaud +0.5 |
| Étuis | Systématique +1, lourd +1, éléments +0.5, aplats +0.5, soie +0.5 |
| Suremballage | Sur demande +0.5, systématique +1.5, aplats +0.5 |
| Carton | Double cannelure +0.5, dorure chaud +0.5 |
| Objet | Présence +1 |

```
scoreSobriete = max(0, min(100, round((1 - totalSobriete / 21) × 100)))
```

### Axe Recyclabilité Citeo (plafond : 10)

Mesure la capacité des emballages à entrer dans les filières de tri et recyclage Citeo.

**Contributions :**

| Module | Pénalités de recyclabilité |
|---|---|
| Bouteille | Opaque +1, incrustations +1 |
| Coiffe | Thermoformé +1 |
| Bouchage | Plaque plastique +1, inséparable +1 |
| Étiquette | Ultra-colle +1 |
| Étuis | Bois +1, aimant +1 |
| Suremballage | Aimant +1 |
| Carton | (aucune contribution directe) |

```
scoreRecyclage = max(0, min(100, round((1 - totalRecyclage / 10) × 100)))
```

### Axe Ressources Matières (plafond : 13)

Mesure la qualité et l'origine des matières (recyclées, certifiées, renouvelables).

**Contributions :**

| Module | Pénalités matières |
|---|---|
| Bouteille | Blanc +1 |
| Bouchage | Bouchon non certifié +1 |
| Étiquette | Matière non recyclable +1, REH +0.5 |
| Étuis | Plastique +1 |
| Suremballage | Plastique +1 |
| Carton | Vierge +1, inter plastique +1, inter carton +0.5, scotch plastique +0.5, encre minérale +0.5 |

```
scoreMateriaux = max(0, min(100, round((1 - totalMateriaux / 13) × 100)))
```

---

## 11. Estimation carbone (gCO₂e)

L'estimation est une **approche screening de premier niveau**, non certifiée ISO 14044. Elle donne un ordre de grandeur avec une incertitude de ±8 %.

### Formule globale

```
carbonGCo2 = co2Bottle + co2Coiffe + co2Bouchage + co2Etiquette + co2Etuis + co2Suremb + co2Carton
```

### Détail par module

```
co2Bottle   = (bottleWeight / 1000) × glass[bottlecolor]
co2Coiffe   = coiffe[coiffeMat][coiffeSize] + collerette[coiffecoll]
co2Bouchage = capsule_tirage + bouchon_standard [+ capsule_plaque si plaque présente]
co2Etiquette = etiquette[etiquetteMat] [+ contreEtiquette[etiquettecontreMat] si contre-étiquette]
co2Etuis    = (etuiWeight / 1000) × Σ(facteurs matières) × (0.5 si sur commande)
co2Suremb   = {15 | 45 | 10} × (0.3 si sur demande)
co2Carton   = cartonCannelure[type] [+ cartonInter[type]]
```

### Exemple de calcul (BSA classique)

| Composant | Calcul | Résultat |
|---|---|---|
| Bouteille (900 g verte) | 0.9 × 680 | 612 gCO₂e |
| Coiffe (complexe, longue) | 14.8 + 0.169 | 14.97 gCO₂e |
| Bouchage (métal, avec plaque) | 8.356 + 42.791 + 5.58 | 56.73 gCO₂e |
| Étiquette (papier adh × 2) | 0.392 + 0.168 | 0.56 gCO₂e |
| **Total estimé** | | **≈ 684 gCO₂e ± 8 %** |

---

## 12. Simulation What-If

La modale What-If compare deux états :

1. **État actuel** : `calculateDiagnostic(activeCuvee.diagnostic)`
2. **État optimisé** : `calculateDiagnostic(simulateWhatIf(activeCuvee.diagnostic))`

**Gain carbone affiché :**
```
gain% = round((1 - co2Optimisé / co2Actuel) × 100)
```

Le bouton "Appliquer à ma Cuvée active" remplace le diagnostic courant par le diagnostic optimisé et le persiste en localStorage.

---

## 13. Persistance & export CSV

### localStorage

Les données sont stockées sous la clé `embaDiag_cuveeData` au format JSON.

**Structure stockée :**
```json
[
  {
    "id": 1,
    "name": "Brut Sans Année",
    "nb": "1000000",
    "diagnostic": { ... },
    "score": 52,
    "result": { ... }
  }
]
```

Au rechargement, `score` et `result` sont recalculés à la volée (ils ne sont pas stockés pour éviter la désynchronisation avec le code de calcul).

### Colonnes CSV (ordre fixe, 44 colonnes)

```
Nom de la Cuvée | Nombre de Bouteilles | Poids bouteille | Forme | Couleur | Incrustations |
Matière coiffe | Longueur coiffe | Collerette | Thermoformé |
Type capsule | Impressions capsule | Type bouchon | Plaquette séparable |
Nb étiquettes | Nb couleurs | Aplats | Matière étiquette | Matière contre-étiquette |
REH | Dorure | Colle |
Étuis non-concerné | Type étui | Poids étui | Éléments associés | Aplats étuis | Soie | Papier | Carton | Bois | Plastique | Aimant |
Suremballage non-concerné | Type suremballage | Aplats suremballage | Papier sac | Carton sac | Plastique sac | Aimant sac |
Carton recyclé | Cannelure | Intercalaire | Scotch | Dorure carton | Encrage | Objet
```

---

## 14. Modifier les barèmes

### Changer un facteur carbone

Ouvrir `js/config.js` et modifier la valeur dans `BENCHMARK_CONFIG.carbonFactors`.

Exemple — Mettre à jour le facteur du verre vert (nouvelle donnée fournisseur) :
```js
glass: { verte: 650, ... }  // était 680
```

### Changer une pénalité

Modifier la valeur dans `BENCHMARK_CONFIG.penalties`.

Exemple — Durcir la pénalité pour coiffe en étain :
```js
coiffe: { etainPenalty: 4.0, ... }  // était 3.0
```

### Ajouter un nouveau critère

1. Ajouter le champ dans l'objet retourné par `createDefaultDiagnostic()` (`calculations.js`)
2. Ajouter la pénalité dans `BENCHMARK_CONFIG.penalties` (`config.js`)
3. Ajouter la logique de calcul dans `calculateDiagnostic()` (`calculations.js`)
4. Ajouter le contrôle dans l'étape appropriée du `WizardTunnel` (`index.html`)
5. Ajouter la colonne dans `exportToCSV()` et `parseCSV()` si export CSV souhaité (`csv.js`)

### Modifier le plafond global (score sur 70 pts)

La valeur `70` est codée en dur dans `calculateDiagnostic()` :
```js
const score = Math.max(0, Math.min(100, Math.round((1 - totalRaw / 70) * 100)));
```
Si vous ajoutez des modules avec de nouvelles pénalités maximales, mettre à jour ce dénominateur en conséquence.

### Modifier les plafonds par module

Les plafonds sont codés en dur dans les 8 lignes de calcul des scores partiels :
```js
const scoreBottle    = Math.max(0, Math.min(100, Math.round((1 - penaltyBottle    /  9) * 100)));
const scoreCoiffe    = Math.max(0, Math.min(100, Math.round((1 - penaltyCoiffe    / 10) * 100)));
// etc.
```

---

*Document généré le 29/05/2026 — EmbaDiag v2.0 — CIVC / Adelphe & Citeo*
