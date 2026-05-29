/* ─── CALCULATIONS ────────────────────────────────────────────────── */
/* Dépend de : config.js (BENCHMARK_CONFIG) */

function calculateDiagnostic(d) {
  const cfg = BENCHMARK_CONFIG;
  const advises = [];
  const weight = parseFloat(d.bottleWeight) || 0;
  let penaltyBottle=0, penaltySobBottle=0, penaltyRecBottle=0, penaltyMatBottle=0, co2Bottle=0;

  if (weight > 0) {
    if (weight > cfg.penalties.bottle.minWeight) {
      const diff = weight - cfg.penalties.bottle.minWeight;
      const span = cfg.penalties.bottle.maxWeight - cfg.penalties.bottle.minWeight;
      let ratio = Math.min(1.0, diff / span);
      if (d.bottleshape === 'special') ratio *= (1 - cfg.penalties.bottle.specialDiscount);
      const pVal = ratio * cfg.penalties.bottle.maxPenalty;
      penaltyBottle += pVal; penaltySobBottle += pVal;
      if (weight >= 900)
        advises.push('Poids élevé : Réduire le poids de la bouteille en dessous de 900 g (viser standard allégé à 835 g).');
      else
        advises.push(`Poids intermédiaire (${weight}g) : bel effort d'allègement ! Continuez pour tendre vers le standard coopératif de 835 g.`);
    } else {
      advises.push('Félicitations : le format et le poids de votre bouteille (≤ 835 g) sont optimaux.');
    }

    if (d.bottlecolor === 'opaque') {
      penaltyBottle += cfg.penalties.bottle.opaquePenalty; penaltyRecBottle += 1;
      advises.push('Opaque : Le verre opaque perturbe fortement les centres de tri optique ; préférez une teinte verte ou brune standard.');
    } else if (d.bottlecolor === 'blanche') {
      penaltyBottle += cfg.penalties.bottle.blanchePenalty; penaltyMatBottle += 1;
      advises.push('Verre Blanc : Contient un taux de calcin plus faible, haussant la demande en matières vierges.');
    }

    if (d.bottleincr === 'oui') {
      penaltyBottle += cfg.penalties.bottle.incrPenalty; penaltyRecBottle += 1;
      advises.push("Incrustations : Les décors par fusion d'éléments exogènes dégradent la recyclabilité du calcin.");
    }

    const colorFactor = cfg.carbonFactors.glass[d.bottlecolor] || cfg.carbonFactors.glass.verte;
    co2Bottle = (weight / 1000) * colorFactor;
  }

  let penaltyCoiffe=0, penaltySobCoiffe=0, penaltyRecCoiffe=0, co2Coiffe=0;
  if (d.coiffeMat && d.coiffeMat !== '0') {
    const isLong = d.coiffeSize === 'longue';
    if (d.coiffeMat === 'etain') {
      penaltyCoiffe += cfg.penalties.coiffe.etainPenalty; penaltySobCoiffe += 1;
      advises.push("Coiffe Étain : Matériau lourd au bilan Carbone critique ; privilégiez l'aluminium fin ou une coiffe en papier.");
    } else if (d.coiffeMat === 'alu_epais') {
      penaltyCoiffe += cfg.penalties.coiffe.aluEpaisPenalty; penaltySobCoiffe += 1;
      advises.push('Alu Épais : Possibilité d\'optimisation vers un aluminium mince traditionnel ou papier.');
    } else if (d.coiffeMat === 'complexe') {
      penaltyCoiffe += cfg.penalties.coiffe.complexePenalty; penaltySobCoiffe += 1;
      advises.push('Complexe Alu-PE : Difficile à recycler car bi-matière ; une alternative mono-matériau est recommandée.');
    }
    if (isLong) {
      penaltyCoiffe += cfg.penalties.coiffe.longuePenalty; penaltySobCoiffe += 1;
      advises.push("Coiffe Longue : Consomme davantage de matière ; une coiffe courte réduit l'impact de 40% environ.");
    }
    if (d.coiffecoll === 'papier-tradi' || d.coiffecoll === 'papier-adh') {
      penaltyCoiffe += cfg.penalties.coiffe.collerettePapierPenalty; penaltySobCoiffe += 0.5;
    } else if (d.coiffecoll === 'plastique' || d.coiffecoll === 'metal') {
      penaltyCoiffe += cfg.penalties.coiffe.collerettePlastiqueMetalPenalty; penaltySobCoiffe += 2.0;
      advises.push('Collerette Impactante : Remplacez la collerette plastique ou métallique par une bande de papier hydro-soluble.');
    }
    if (d.coiffethermo === 'oui') {
      penaltyCoiffe += cfg.penalties.coiffe.thermoPenalty; penaltyRecCoiffe += 1;
      advises.push("Manchon thermo : L'enveloppe plastique gêne la séparation mécanique de la coiffe en recyclage.");
    }
    const matFactors = cfg.carbonFactors.coiffe[d.coiffeMat];
    if (matFactors) co2Coiffe += isLong ? matFactors.longue : matFactors.courte;
    const collFactor = cfg.carbonFactors.collerette[d.coiffecoll];
    if (collFactor) co2Coiffe += collFactor;
  }

  let penaltyBouchage=0, penaltyRecBouch=0, penaltySobBouch=0, penaltyMatBouch=0, co2Bouchage=0;
  if (weight > 0) {
    co2Bouchage += cfg.carbonFactors.capsule_tirage + cfg.carbonFactors.bouchon_standard;
    if (d.capsuleType && d.capsuleType !== '0') {
      co2Bouchage += cfg.carbonFactors.capsule_plaque;
      if (d.capsuleType === 'plastique') {
        penaltyBouchage += cfg.penalties.bouchage.plastiquePenalty; penaltyRecBouch += 1;
        advises.push("Plaque plastique : Entrave le captage magnétique de l'acier aux centres de tri Citeo.");
      }
    }
    if (d.capsuleColor && ['mono-inf','poly','poly-inf'].includes(d.capsuleColor)) {
      penaltyBouchage += cfg.penalties.bouchage.impressionsPenalty; penaltySobBouch += 0.5;
      advises.push('Encres Plaque : Le recours à la polychromie complexe augmente la charge d\'encrage.');
    }
    if (d.bouchonType === 'non') {
      penaltyBouchage += cfg.penalties.bouchage.nonDurableBouchonPenalty; penaltyMatBouch += 1;
      advises.push('Bouchon forestier : Choisissez des lièges certifiés FSC ou PEFC pour préserver les écosystèmes des chênaies.');
    }
    if (d.plaqueSeparable === 'non') {
      penaltyBouchage += cfg.penalties.bouchage.nonSeparablePlaquePenalty; penaltyRecBouch += 1;
      advises.push("Inséparabilité Plaque-Insert : L'insert plastique soudé thermiquement empêche le recyclage à 100% de la plaque d'acier.");
    }
  }

  let penaltyEtiquette=0, penaltySobEti=0, penaltyMatEti=0, penaltyRecEti=0, co2Etiquette=0;
  const labelsCount = parseInt(d.etiquetteCount) || 0;
  const colorsCount = parseInt(d.etiquetteColor) || 0;
  if (labelsCount > 0) {
    if (labelsCount >= 2) {
      penaltyEtiquette += cfg.penalties.etiquette.multipleLabelsPenalty; penaltySobEti += 0.5;
      advises.push('Multi-Étiquettes : Multiplier les étiquettes multiplie les colles nécessaires.');
    }
    if (colorsCount >= 3) {
      penaltyEtiquette += cfg.penalties.etiquette.manyColorsPenalty; penaltySobEti += 0.5;
    }
    if (d.etiquetteEcoInk) {
      penaltyEtiquette += cfg.penalties.etiquette.ecoInkPenalty; penaltySobEti += 1.0;
      advises.push("Grands Aplats d'encre : Les fortes surfaces opaques surchargent le bain de lavage du calcin.");
    }
    if (d.etiquetteInkRatio === '>70%') {
      penaltyEtiquette += cfg.penalties.etiquette.highEncragePenalty; penaltySobEti += 1.0;
    }
    if (['papiercoton','métal','plastique'].includes(d.etiquetteMat)) {
      penaltyEtiquette += cfg.penalties.etiquette.unrecyclableMaterialPenalty; penaltyMatEti += 1;
      advises.push('Matière Étiquette : Le papier coton et les plaques métalliques bloquent la flottaison lors du recyclage.');
    }
    if (d.papierreshum) {
      penaltyEtiquette += cfg.penalties.etiquette.humidResistPenalty; penaltyMatEti += 0.5;
      advises.push("Résistance Humidité : Le traitement REH entrave le défibrage du papier recyclé.");
    }
    if (d.etiquetteDor === 'dorurechaud') {
      penaltyEtiquette += cfg.penalties.etiquette.hotDorePenalty; penaltySobEti += 0.5;
      advises.push("Dorure à Chaud : Très énergivore ; privilégiez une dorure à froid ou des encres métallisées.");
    }
    if (d.etiquetteColle === 'colleultra') {
      penaltyEtiquette += cfg.penalties.etiquette.ultraCollePenalty; penaltyRecEti += 1;
      advises.push("Colles Permanentes PSA : L'adhésif ultra-résistant ne se décolle pas à chaud, laissant des résidus vitreux noirs.");
    } else if (d.etiquetteColle === 'collewashoff') {
      penaltyEtiquette += cfg.penalties.etiquette.washOffBonus;
      advises.push("Excellent choix : Vos colles hydrosolubles Wash-Off permettent un décollage propre idéal pour la consigne.");
    }
    const frontFactor = cfg.carbonFactors.etiquette[d.etiquetteMat] || cfg.carbonFactors.etiquette.papierepais;
    const backFactor  = cfg.carbonFactors.contreEtiquette[d.etiquettecontreMat] || cfg.carbonFactors.contreEtiquette.papierepais;
    co2Etiquette += frontFactor;
    if (d.etiquettecontreMat && d.etiquettecontreMat !== '0') co2Etiquette += backFactor;
  }

  let penaltyEtuis=0, penaltySobEtuis=0, penaltyMatEtuis=0, penaltyRecEtuis=0, co2Etuis=0;
  if (!d.etuisNC && d.etuisType && d.etuisType !== 'pasetuiscoffret' && d.etuisType !== '0') {
    const etWeight = parseFloat(d.etuiWeight) || 0;
    if (d.etuisType === 'systematique') {
      penaltyEtuis += cfg.penalties.etuis.systematiquePenalty; penaltySobEtuis += 1;
      advises.push("Étui Systématique : Source majeure d'impact emballage ; basculez vers un modèle distribué sur commande.");
    }
    if (etWeight >= 900) { penaltyEtuis += cfg.penalties.etuis.unitaireHeavyPenalty; penaltySobEtuis += 1; }
    if (d.elementsassos)  { penaltyEtuis += cfg.penalties.etuis.assosPenalty;         penaltySobEtuis += 0.5; }
    if (d.etuisEcoink)    { penaltyEtuis += cfg.penalties.etuis.aplatPenalty;         penaltySobEtuis += 0.5; }
    if (d.etuissilkpaper) { penaltyEtuis += cfg.penalties.etuis.silkPaperPenalty;     penaltySobEtuis += 0.5; }
    if (d.etuisBois) {
      penaltyEtuis += cfg.penalties.etuis.boisPenalty; penaltyRecEtuis += 1.0;
      advises.push("Coffret Bois : Consomme d'immenses ressources forestières primaires et n'intègre aucune filière de recyclage ménager standard.");
    }
    if (d.etuisPlastique) { penaltyEtuis += cfg.penalties.etuis.plastiquePenalty; penaltyMatEtuis += 1.0; }
    if (d.etuisAimant) {
      penaltyEtuis += cfg.penalties.etuis.aimantPenalty; penaltyRecEtuis += 1.0;
      advises.push("Fermeture Aimantée : Les inserts magnétiques déroutent les détecteurs à Courant de Foucault dans les centres de recyclage carton.");
    }
    let weightFactor = 0;
    if (d.etuisBois)     weightFactor += cfg.carbonFactors.etuis.bois;
    if (d.etuisPapier)   weightFactor += cfg.carbonFactors.etuis.papier;
    if (d.etuisCarton)   weightFactor += cfg.carbonFactors.etuis.carton;
    if (d.etuisPlastique) weightFactor += cfg.carbonFactors.etuis.plastique;
    if (weightFactor === 0) weightFactor = cfg.carbonFactors.etuis.carton;
    const baseCo2 = (etWeight / 1000) * weightFactor;
    co2Etuis = d.etuisType === 'commande' ? baseCo2 * 0.5 : baseCo2;
  }

  let penaltySuremb=0, penaltySobSuremb=0, penaltyMatSuremb=0, penaltyRecSuremb=0, co2Suremb=0;
  if (!d.surembNC && d.suremballage && d.suremballage !== 'pas_de_sac' && d.suremballage !== '0') {
    if (d.suremballage === 'sac_sur_demande') {
      penaltySuremb += cfg.penalties.suremballage.commissionPenalty; penaltySobSuremb += 0.5;
    } else if (d.suremballage === 'sac_systematique') {
      penaltySuremb += cfg.penalties.suremballage.systematiquePenalty; penaltySobSuremb += 1.5;
      advises.push("Sacs de caisse : Uniquement à proposer sur demande ; supprimez les distributions systématiques.");
    }
    if (d.suremballageEcoink) { penaltySuremb += cfg.penalties.suremballage.aplatPenalty; penaltySobSuremb += 0.5; }
    if (d.sacPlastique) {
      penaltySuremb += cfg.penalties.suremballage.plastiquePenalty; penaltyMatSuremb += 1;
      advises.push("Sac Plastique : Remplacez les sacs plastiques à usage unique par du papier kraft recyclé.");
    }
    if (d.sacAimant) { penaltySuremb += cfg.penalties.suremballage.aimantPenalty; penaltyRecSuremb += 1; }
    co2Suremb = d.sacPapier ? 15 : d.sacPlastique ? 45 : 10;
    if (d.suremballage === 'sac_sur_demande') co2Suremb *= 0.3;
  }

  let penaltyCarton=0, penaltySobCarton=0, penaltyMatCarton=0, penaltyRecCarton=0, co2Carton=0;
  if (d.cartonCannelure && d.cartonCannelure !== '0') {
    if (d.cartonRecycled === 'non') {
      penaltyCarton += cfg.penalties.carton.nonRecycledPenalty; penaltyMatCarton += 1.0;
      advises.push("Carton Vierge : Utilisez du papier liner 100% recyclé pour limiter l'impact sylvicole original.");
    }
    const isDoubleCannelure = ['EB','BE'].includes(d.cartonCannelure);
    if (isDoubleCannelure) {
      penaltyCarton += cfg.penalties.carton.doubleCannelurePenalty; penaltySobCarton += 0.5;
      advises.push("Épaisseur Cannelure : Préférer une cannelure simple B/E moins lourde de 30%.");
    }
    if (d.cartonInter === 'plastique') {
      penaltyCarton += cfg.penalties.carton.plastiqueInterPenalty; penaltyMatCarton += 1.0;
      advises.push("Intercalaire Plastique : Substituez les calages synthétiques par de la pâte à papier cellulose moulée.");
    } else if (d.cartonInter === 'carton') {
      penaltyCarton += cfg.penalties.carton.cartonInterPenalty; penaltyMatCarton += 0.5;
    }
    if (d.cartonScotch === 'plastique') {
      penaltyCarton += cfg.penalties.carton.plastiqueScotchPenalty; penaltyMatCarton += 0.5;
      advises.push("Ruban adhésif : Utilisez du scotch Kraft papier pour simplifier le désintégration et hydrolyse des caisses.");
    }
    if (d.cartonDor === 'dorurechaud') { penaltyCarton += cfg.penalties.carton.hotDorePenalty; penaltySobCarton += 0.5; }
    if (d.cartonInk === 'huileminerale') {
      penaltyCarton += cfg.penalties.carton.mineralInkPenalty; penaltyMatCarton += 0.5;
      advises.push("Encres minérales : Les hydrocarbures minéraux contaminent les fibres recyclées ; exigez des encres végétales.");
    }
    co2Carton += isDoubleCannelure ? cfg.carbonFactors.cartonCannelure.double : cfg.carbonFactors.cartonCannelure.single;
    const interFactor = cfg.carbonFactors.cartonInter[d.cartonInter];
    if (interFactor) co2Carton += interFactor;
  }

  let penaltyObjet=0, penaltySobObjet=0;
  if (d.objet === 'oui') {
    penaltyObjet += cfg.penalties.objet.presencePenalty; penaltySobObjet += 1.0;
    advises.push("Goodies et Objets : Supprimez les objets promotionnels liés, souvent non recyclés et importés.");
  }

  const totalRaw = penaltyBottle + penaltyCoiffe + penaltyBouchage + penaltyEtiquette + penaltyEtuis + penaltySuremb + penaltyCarton + penaltyObjet;
  const score          = Math.max(0, Math.min(100, Math.round((1 - totalRaw / 70) * 100)));
  const scoreBottle    = Math.max(0, Math.min(100, Math.round((1 - penaltyBottle    /  9) * 100)));
  const scoreCoiffe    = Math.max(0, Math.min(100, Math.round((1 - penaltyCoiffe    / 10) * 100)));
  const scoreBouchage  = Math.max(0, Math.min(100, Math.round((1 - penaltyBouchage  /  7) * 100)));
  const scoreEtiquette = Math.max(0, Math.min(100, Math.round((1 - penaltyEtiquette / 12) * 100)));
  const scoreEtuis     = Math.max(0, Math.min(100, Math.round((1 - penaltyEtuis     / 15) * 100)));
  const scoreSuremb    = Math.max(0, Math.min(100, Math.round((1 - penaltySuremb    /  9) * 100)));
  const scoreCarton    = Math.max(0, Math.min(100, Math.round((1 - penaltyCarton    /  8) * 100)));
  const scoreObjet     = Math.max(0, Math.min(100, Math.round((1 - penaltyObjet     /  3) * 100)));

  const totalSobriete  = penaltySobBottle + penaltySobCoiffe + penaltySobBouch + penaltySobEti + penaltySobEtuis + penaltySobSuremb + penaltySobCarton + penaltySobObjet;
  const totalRecyclage = penaltyRecBottle + penaltyRecCoiffe + penaltyRecBouch + penaltyRecEti + penaltyRecEtuis + penaltyRecSuremb + penaltyRecCarton;
  const totalMateriaux = penaltyMatBottle + penaltyMatBouch + penaltyMatEti + penaltyMatEtuis + penaltyMatSuremb + penaltyMatCarton;
  const scoreSobriete  = Math.max(0, Math.min(100, Math.round((1 - totalSobriete  / 21) * 100)));
  const scoreRecyclage = Math.max(0, Math.min(100, Math.round((1 - totalRecyclage / 10) * 100)));
  const scoreMateriaux = Math.max(0, Math.min(100, Math.round((1 - totalMateriaux / 13) * 100)));
  const carbonGCo2 = Math.round(co2Bottle + co2Coiffe + co2Bouchage + co2Etiquette + co2Etuis + co2Suremb + co2Carton);

  return {
    score, scoreBottle, scoreCoiffe, scoreBouchage, scoreEtiquette, scoreEtuis, scoreSuremb, scoreCarton, scoreObjet,
    scoreSobriete, scoreRecyclage, scoreMateriaux,
    carbonGCo2, carbonUncertaintyPercent: BENCHMARK_CONFIG.uncertaintyPercent,
    advises,
    rawPenalties: {
      bottle: penaltyBottle, coiffe: penaltyCoiffe, bouchage: penaltyBouchage,
      etiquette: penaltyEtiquette, etuis: penaltyEtuis, suremb: penaltySuremb,
      carton: penaltyCarton, objet: penaltyObjet,
      sobriete: totalSobriete, recyclage: totalRecyclage, materiaux: totalMateriaux,
    },
  };
}

function simulateWhatIf(current) {
  return {
    ...current,
    bottleWeight: '835',
    bottleshape: 'standard',
    bottlecolor: current.bottlecolor === 'blanche' ? 'verte' : current.bottlecolor || 'verte',
    bottleincr: 'non',
    coiffeMat: 'papier',
    coiffeSize: 'courte',
    coiffecoll: 'non',
    coiffethermo: 'non',
    capsuleType: 'metalique',
    bouchonType: 'oui',
    plaqueSeparable: 'oui',
    etiquetteCount: '1',
    etiquetteEcoInk: false,
    etiquetteMat: 'papierepais',
    papierreshum: false,
    etiquetteDor: 'pasdorure',
    etiquetteColle: 'collewashoff',
    etuisType: 'pasetuiscoffret',
    etuiWeight: '0',
    suremballage: 'pas_de_sac',
    cartonRecycled: 'oui',
    cartonCannelure: 'B',
    cartonInter: 'cellulose',
    cartonScotch: 'papier kraft',
    cartonInk: 'encrevegetale',
    objet: 'non',
  };
}

function createDefaultDiagnostic() {
  return {
    bottleWeight: '900', bottleshape: 'standard', bottlecolor: 'verte', bottleincr: 'non',
    coiffeMat: 'complexe', coiffeSize: 'longue', coiffecoll: 'papier-tradi', coiffethermo: 'non',
    capsuleType: 'metalique', capsuleColor: 'mono', bouchonType: 'nsp', plaqueSeparable: 'non',
    etiquetteCount: '2', etiquetteColor: '4', etiquetteEcoInk: true, etiquetteMat: 'papieradh',
    etiquettecontreMat: 'papieradh', papierreshum: true, etiquetteDor: 'dorurechaud', etiquetteColle: 'colleultra',
    etuisNC: false, etuisType: 'systematique', etuiWeight: '400', elementsassos: false, etuisEcoink: false,
    etuissilkpaper: false, etuisPapier: true, etuisCarton: false, etuisBois: false, etuisPlastique: false, etuisAimant: false,
    surembNC: false, suremballage: 'sac_sur_demande', suremballageEcoink: false, sacPapier: true, sacCarton: false, sacPlastique: false, sacAimant: false,
    cartonRecycled: 'oui', cartonCannelure: 'EB', cartonInter: 'carton', cartonScotch: 'plastique',
    cartonDor: 'pasdorure', cartonInk: 'huileminerale', objet: 'non',
  };
}
