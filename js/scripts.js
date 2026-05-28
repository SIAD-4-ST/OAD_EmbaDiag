var radarChartInstance = null;

function calculateDiagnosis() {
    // Récupérer les valeurs du formulaire
    const bottleWeight = parseFloat(document.getElementById('bottleWeight').value);
    const bottleshape = document.getElementById('bottleshape').value;
    const bottlecolor = document.getElementById('bottlecolor').value;
    const bottleincr = document.getElementById('bottleincr').value;

    const coiffeMat = document.getElementById('coiffeMat').value;
    const coiffeSize = document.getElementById('coiffeSize').value;
    const coiffecoll = document.getElementById('coiffecoll').value;
    const coiffethermo = document.getElementById('coiffethermo').value;

    const capsuleType = document.getElementById('capsuleType').value;
    const capsuleColor = document.getElementById('capsuleColor').value;
    const bouchonType = document.getElementById('bouchonType').value;

    const etiquetteCount = parseInt(document.getElementById('etiquetteCount').value) || 0;
    const etiquetteColor = parseInt(document.getElementById('etiquetteColor').value) || 0;
    const etiquetteEcoInk = document.getElementById('etiquetteEcoInk').checked;
    const etiquetteMat = document.getElementById('etiquetteMat').value;
    const etiquettecontreMat = document.getElementById('etiquettecontreMat').value;
    const papierreshum = document.getElementById('papierreshum').checked;
    const etiquetteDor = document.getElementById('etiquetteDor').value;
    const etiquetteColle = document.getElementById('etiquetteColle').value;

    const etuisType = document.getElementById('etuisType').value;
    const etuiWeight = parseFloat(document.getElementById('etuiWeight').value) || 0;
    const elementsassos = document.getElementById('elementsassos').checked;
    const etuisEcoink = document.getElementById('etuisEcoink').checked;
    const etuissilkpaper = document.getElementById('etuissilkpaper').checked;
    const etuisPapier = document.getElementById('etuisPapier').checked;
    const etuisCarton = document.getElementById('etuisCarton').checked;
    const etuisBois = document.getElementById('etuisBois').checked;
    const etuisPlastique = document.getElementById('etuisPlastique').checked;
    const etuisAimant = document.getElementById('etuisAimant').checked;

    const suremballage = document.getElementById('suremballage').value;
    const suremballageEcoink = document.getElementById('suremballageEcoink').checked;
    const sacPapier = document.getElementById('sacPapier').checked;
    const sacCarton = document.getElementById('sacCarton').checked;
    const sacPlastique = document.getElementById('sacPlastique').checked;
    const sacAimant = document.getElementById('sacAimant').checked;

    const cartonRecycled = document.getElementById('cartonRecycled').value;
    const cartonCannelure = document.getElementById('cartonCannelure').value;
    const cartonInter = document.getElementById('cartonInter').value;
    const cartonScotch = document.getElementById('cartonScotch').value;
    const cartonDor = document.getElementById('cartonDor').value;
    const cartonInk = document.getElementById('cartonInk').value;

    const objet = document.getElementById('objet').value;

    // Logique de calcul
    let scorebottle = 0;
    let scorecoiffe = 0;
    let scorebouchage = 0;
    let scoreetiquette = 0;
    let scoreetuis = 0;
    let scoresuremb = 0;
    let scorecarton = 0;
    let scoreobjet = 0;

    let scoresobriete = 0;
    let scorerecyclage = 0;
    let scoremateriaux = 0;
    let scorecarbone = 0;

    const advises = [];

    // ── Bouteille (max 9) ──────────────────────────────────────────────
    if (bottleWeight > 910) {
        scorebottle += 3; scoresobriete += 1;
        advises.push('Réduire le poids de la bouteille en dessous de 900 g.');
    }
    if (bottleWeight > 835 && bottleWeight <= 910 && bottleshape !== 'special') {
        scorebottle += 3; scoresobriete += 1;
        advises.push('En bouteille standard, viser 800-835 g.');
    }
    if (bottleWeight > 835 && bottleWeight <= 910 && bottleshape === 'special') {
        scorebottle += 1; scoresobriete += 1;
    }
    if (bottlecolor === 'opaque') { scorebottle += 3; scorerecyclage += 1; advises.push('La bouteille opaque est difficilement recyclable ; préférer une teinte verte ou brune.'); }
    if (bottlecolor === 'blanche') { scorebottle += 3; scoremateriaux += 1; advises.push('La bouteille blanche présente un impact matières élevé ; préférer le vert ou le brun.'); }
    if (bottleincr === 'oui') { scorebottle += 3; scorerecyclage += 1; advises.push('Les incrustations dans le verre compliquent le recyclage ; les éviter si possible.'); }

    if (bottlecolor === 'verte')  scorecarbone += (bottleWeight / 1000) * 680;
    if (bottlecolor === 'brune')  scorecarbone += (bottleWeight / 1000) * 765;
    if (bottlecolor === 'opaque') scorecarbone += (bottleWeight / 1000) * 765;
    if (bottlecolor === 'blanche') scorecarbone += (bottleWeight / 1000) * 1018;
    if (bottleWeight > 0 && bottleWeight <= 835 && bottleshape === 'standard') {
        advises.push('Votre format et poids de bouteille sont optimaux.');
    }

    // ── Coiffe (max 10) ───────────────────────────────────────────────
    if (coiffeMat === 'etain')     { scorecoiffe += 3; scoresobriete += 1; advises.push('La coiffe en étain est très impactante ; préférer l\'alu fin ou le papier.'); }
    if (coiffeMat === 'alu_epais') { scorecoiffe += 1; scoresobriete += 1; advises.push('Remplacer l\'alu épais par de l\'alu fin (tradi) ou du papier pour réduire l\'impact.'); }
    if (coiffeMat === 'complexe')  { scorecoiffe += 1; scoresobriete += 1; advises.push('Le complexe alu-PE est non recyclable ; préférer l\'alu fin mono-matière ou le papier.'); }
    if (coiffeSize === 'longue')   { scorecoiffe += 1; scoresobriete += 1; advises.push('Opter pour une coiffe courte pour réduire la quantité de matière.'); }
    if (coiffecoll === 'papier-tradi' || coiffecoll === 'papier-adh') { scorecoiffe += 1; scoresobriete += 1; }
    if (coiffecoll === 'plastique' || coiffecoll === 'metal') {
        scorecoiffe += 3; scoresobriete += 3;
        advises.push('Remplacer la collerette plastique ou métallique par une collerette papier ou supprimer la collerette.');
    }
    if (coiffethermo === 'oui') { scorecoiffe += 3; scorerecyclage += 1; advises.push('Le plastique thermoformé sur la coiffe nuit au recyclage ; le supprimer.'); }

    if (coiffeMat === 'etain'    && coiffeSize === 'longue')  scorecarbone += 49.73;
    if (coiffeMat === 'etain'    && coiffeSize === 'courte') scorecarbone += 28.23;
    if (coiffeMat === 'alu_epais' && coiffeSize === 'longue') scorecarbone += 23.2;
    if (coiffeMat === 'alu_epais' && coiffeSize === 'courte') scorecarbone += 13.18;
    if (coiffeMat === 'complexe' && coiffeSize === 'longue')  scorecarbone += 14.8;
    if (coiffeMat === 'complexe' && coiffeSize === 'courte')  scorecarbone += 8.4;
    if (coiffeMat === 'alu_fin'  && coiffeSize === 'longue')  scorecarbone += 10.62;
    if (coiffeMat === 'alu_fin'  && coiffeSize === 'courte')  scorecarbone += 6.03;
    if (coiffeMat === 'papier'   && coiffeSize === 'longue')  scorecarbone += 1.6;
    if (coiffeMat === 'papier'   && coiffeSize === 'courte')  scorecarbone += 0.8;
    if (coiffecoll === 'papier-tradi') scorecarbone += 0.169;
    if (coiffecoll === 'papier-adh')   scorecarbone += 0.437;
    if (coiffecoll === 'plastique')    scorecarbone += 5.757;
    if (coiffecoll === 'metal')        scorecarbone += 11.320;

    // ── Bouchage (max 5) ──────────────────────────────────────────────
    if (capsuleType === 'plastique') { scorebouchage += 3; scorerecyclage += 1; advises.push('Remplacer la plaque plastique par une plaque métallique pour faciliter le recyclage.'); }
    if (capsuleColor === 'mono-inf' || capsuleColor === 'poly' || capsuleColor === 'poly-inf') {
        scorebouchage += 1; scoresobriete += 1;
        advises.push('Réduire les impressions sur la plaque ou supprimer la surimpression face inférieure.');
    }
    if (bouchonType === 'non') { scorebouchage += 1; scoremateriaux += 1; advises.push('Privilégier un bouchon issu de forêts gérées durablement (FSC/PEFC).'); }

    if (capsuleType === 'metalique' || capsuleType === 'plastique') scorecarbone += 5.58;
    if (bottleWeight > 0) scorecarbone += 8.356;  // capsule de tirage
    if (bottleWeight > 0) scorecarbone += 42.791; // bouchon (moyenne LA2R / micro-aggloméré)

    // ── Étiquette (max 11) ────────────────────────────────────────────
    if (etiquetteCount >= 2)  { scoreetiquette += 1; scoresobriete += 1; advises.push('Réduire le nombre d\'étiquettes (tendre vers 1 seule étiquette).'); }
    if (etiquetteColor >= 3)  { scoreetiquette += 1; scoresobriete += 1; advises.push('Réduire le nombre de couleurs sur l\'étiquette (< 3 couleurs recommandé).'); }
    if (etiquetteEcoInk)      { scoreetiquette += 1; scoresobriete += 1; advises.push('Éviter les grands aplats de couleurs sur les étiquettes pour limiter la consommation d\'encre.'); }
    if (etiquetteMat === 'papiercoton' || etiquetteMat === 'métal') {
        scoreetiquette += 3; scoremateriaux += 1;
        advises.push('Remplacer l\'étiquette papier coton ou métal par un papier traditionnel ou auto-adhésif plus léger.');
    }
    if (papierreshum)         { scoreetiquette += 1; scoremateriaux += 1; advises.push('Le traitement résistant à l\'humide sur l\'étiquette complique le recyclage ; l\'éviter si possible.'); }
    if (etiquetteDor === 'dorurechaud') { scoreetiquette += 1; scoresobriete += 1; advises.push('Remplacer la dorure à chaud par une dorure à froid, moins énergivore.'); }
    if (etiquetteColle === 'colleultra') { scoreetiquette += 3; scorerecyclage += 1; advises.push('La colle ultra-adhésive nuit au désencrage lors du recyclage du papier ; préférer une colle standard.'); }

    if (etiquetteMat === 'papierepais')  scorecarbone += 0.210;
    if (etiquetteMat === 'papieradh')    scorecarbone += 0.392;
    if (etiquetteMat === 'papiercoton')  scorecarbone += 5.167;
    if (etiquetteMat === 'plastique')    scorecarbone += 5.167;
    if (etiquetteMat === 'métal')        scorecarbone += 10.160;
    if (etiquettecontreMat === 'papierepais') scorecarbone += 0.090;
    if (etiquettecontreMat === 'papieradh')   scorecarbone += 0.168;
    if (etiquettecontreMat === 'papiercoton') scorecarbone += 2.218;
    if (etiquettecontreMat === 'plastique')   scorecarbone += 2.218;
    if (etiquettecontreMat === 'métal')       scorecarbone += 4.361;

    // ── Étuis / Coffrets (max 15) ─────────────────────────────────────
    if (etuisType === 'commande')   { scoreetuis += 1; scoresobriete += 1; }
    if (etuisType === 'systematique') {
        scoreetuis += 3; scoresobriete += 1;
        advises.push('Les étuis/coffrets systématiques représentent un sur-emballage important ; les proposer uniquement sur commande.');
    }
    if (etuiWeight >= 900) { scoreetuis += 1; scoresobriete += 1; advises.push('Alléger l\'étui/coffret en dessous de 900 g.'); }
    if (elementsassos) { scoreetuis += 1; scoresobriete += 1; advises.push('Limiter les éléments associés (livrets, documentation) dans les coffrets.'); }
    if (etuisEcoink)   { scoreetuis += 1; scoresobriete += 1; advises.push('Éviter les aplats de couleurs sur les étuis pour réduire la consommation d\'encre.'); }
    if (etuissilkpaper){ scoreetuis += 1; scoresobriete += 1; advises.push('Supprimer le papier de soie dans les coffrets (matière à faible valeur recyclable).'); }
    if (etuisPapier)   { scoreetuis += 1; scoremateriaux += 1; }
    if (etuisCarton)   { scoreetuis += 0; scoremateriaux += 1; } // Carton est la meilleure option, pas de pénalité
    if (etuisBois)     { scoreetuis += 3; scorerecyclage += 1; advises.push('Le bois dans les coffrets est difficilement recyclable en filière standard ; envisager le carton.'); }
    if (etuisPlastique){ scoreetuis += 1; scoremateriaux += 1; advises.push('Remplacer le plastique dans les coffrets par du carton ou du papier cartonné.'); }
    if (etuisAimant)   { scoreetuis += 3; scorerecyclage += 1; advises.push('Les aimants dans les coffrets perturbent le tri et le recyclage ; les éviter.'); }

    if (etuisType === 'systematique' && etuisBois)     scorecarbone += (etuiWeight / 1000) * 700;
    if (etuisType === 'systematique' && etuisPapier)   scorecarbone += (etuiWeight / 1000) * 641;
    if (etuisType === 'systematique' && etuisCarton)   scorecarbone += (etuiWeight / 1000) * 932;
    if (etuisType === 'systematique' && etuisPlastique) scorecarbone += (etuiWeight / 1000) * 3105;
    if (etuisType === 'commande' && etuisBois)     scorecarbone += (etuiWeight / 1000) * 700  * 0.5;
    if (etuisType === 'commande' && etuisPapier)   scorecarbone += (etuiWeight / 1000) * 641  * 0.5;
    if (etuisType === 'commande' && etuisCarton)   scorecarbone += (etuiWeight / 1000) * 932  * 0.5;
    if (etuisType === 'commande' && etuisPlastique) scorecarbone += (etuiWeight / 1000) * 3105 * 0.5;

    // ── Suremballage (max 9) ──────────────────────────────────────────
    if (suremballage === 'sac_sur_demande') { scoresuremb += 1; scoresobriete += 1; }
    if (suremballage === 'sac_systematique') {
        scoresuremb += 3; scoresobriete += 1;
        advises.push('Proposer les sacs uniquement sur demande du client plutôt que systématiquement.');
    }
    if (suremballageEcoink) { scoresuremb += 1; scoresobriete += 1; advises.push('Éviter les aplats de couleurs sur les sacs/suremballages.'); }
    if (sacPapier)    { scoresuremb += 1; scoremateriaux += 1; }
    if (sacPlastique) { scoresuremb += 1; scoremateriaux += 1; advises.push('Remplacer les sacs plastiques par des sacs en papier ou en matières biosourcées.'); }
    if (sacAimant)    { scoresuremb += 3; scorerecyclage += 1; advises.push('Les aimants dans les suremballages perturbent le tri ; les éliminer.'); }

    // ── Carton d'expédition (max 8) ───────────────────────────────────
    if (cartonRecycled === 'non') { scorecarton += 1; scoremateriaux += 1; advises.push('Utiliser du carton et du papier recyclé pour les caisses d\'expédition.'); }
    if (cartonCannelure === 'EB' || cartonCannelure === 'BE') { scorecarton += 1; scoresobriete += 1; advises.push('Préférer une cannelure simple B ou E, moins lourde qu\'une double cannelure EB/BE.'); }
    if (cartonInter === 'plastique') { scorecarton += 3; scoremateriaux += 1; advises.push('Remplacer la mousse plastique intercalaire par de la cellulose moulée ou du carton.'); }
    if (cartonInter === 'carton')    { scorecarton += 1; scoremateriaux += 1; }
    if (cartonScotch === 'plastique') { scorecarton += 1; scoremateriaux += 1; advises.push('Utiliser du scotch papier kraft plutôt que plastique pour fermer les caisses.'); }
    if (cartonDor === 'dorurechaud') { scorecarton += 1; scoresobriete += 1; advises.push('Remplacer la dorure à chaud sur carton par une dorure à froid.'); }
    if (cartonInk === 'huileminerale') { scorecarton += 1; scoremateriaux += 1; advises.push('Remplacer les encres à huile minérale par des encres végétales sur les cartons.'); }

    if (cartonCannelure === 'B' || cartonCannelure === 'E')   scorecarbone += (211 / 6);
    if (cartonCannelure === 'EB' || cartonCannelure === 'BE') scorecarbone += (321 / 6);
    if (cartonInter === 'carton')    scorecarbone += (55.91  / 6);
    if (cartonInter === 'cellulose') scorecarbone += (109.95 / 6);
    if (cartonInter === 'plastique') scorecarbone += (9.75   / 6);

    // ── Objets publicitaires (max 3) ──────────────────────────────────
    if (objet === 'oui') {
        scoreobjet += 3; scoresobriete += 1;
        advises.push('Supprimer ou limiter les objets publicitaires associés à la bouteille.');
    }

    // ── Score global ──────────────────────────────────────────────────
    const totalRaw = scorebottle + scorecoiffe + scorebouchage + scoreetiquette
                   + scoreetuis + scoresuremb + scorecarton + scoreobjet;
    const score = Math.round((1 - (totalRaw / 70)) * 100);

    // Scores par catégorie (0 = parfait, 100 = mauvais → on affiche l'inverse)
    const pctBottle     = Math.round((1 - (scorebottle    /  9)) * 100);
    const pctCoiffe     = Math.round((1 - (scorecoiffe    / 10)) * 100); // CORRIGÉ : max 10
    const pctBouchage   = Math.round((1 - (scorebouchage  /  5)) * 100);
    const pctEtiquette  = Math.round((1 - (scoreetiquette / 11)) * 100);
    const pctEtuis      = Math.round((1 - (scoreetuis     / 15)) * 100); // CORRIGÉ : max 15
    const pctSuremb     = Math.round((1 - (scoresuremb    /  9)) * 100);
    const pctCarton     = Math.round((1 - (scorecarton    /  8)) * 100);
    const pctObjet      = Math.round((1 - (scoreobjet     /  3)) * 100);

    const pctSobriete   = Math.round((1 - (scoresobriete  / 21)) * 100);
    const pctRecyclage  = Math.round((1 - (scorerecyclage /  7)) * 100);
    const pctMateriaux  = Math.round((1 - (scoremateriaux / 13)) * 100);

    scorecarbone = Math.round(scorecarbone);

    // ── Affichage ─────────────────────────────────────────────────────
    const mainScore = document.getElementById('embascore');
    mainScore.textContent = score + ' %';
    mainScore.style.color = score >= 80 ? '#27ae60' : score >= 60 ? '#f39c12' : '#e74c3c';

    const scoreMap = [
        ['indicebottle',    pctBottle],
        ['indicecoiffe',    pctCoiffe],
        ['indicebouchage',  pctBouchage],
        ['indiceetiquette', pctEtiquette],
        ['indiceetuis',     pctEtuis],
        ['indicesuremb',    pctSuremb],
        ['indicecarton',    pctCarton],
        ['indiceobjet',     pctObjet],
    ];
    scoreMap.forEach(function([id, pct]) {
        document.getElementById(id).textContent = pct + ' %';
        setValueColor(id, pct);
    });

    document.getElementById('indicesobriete').textContent  = 'Sobriété : '  + pctSobriete  + ' %';
    document.getElementById('indicerecyclage').textContent = 'Recyclage : ' + pctRecyclage + ' %';
    document.getElementById('indicemateriaux').textContent = 'Matériaux : ' + pctMateriaux + ' %';

    document.getElementById('indicecarbone').innerHTML =
        'Empreinte carbone :<br><strong>' + scorecarbone + ' gCO₂e / Bouteille</strong>';

    setScoreIndicator('Sobriété-indicator',  pctSobriete);
    setScoreIndicator('Recyclage-indicator', pctRecyclage);
    setScoreIndicator('Matériaux-indicator', pctMateriaux);

    // ── Points d'amélioration ─────────────────────────────────────────
    const advEl = document.getElementById('diagnosisAdvise');
    advEl.innerHTML = '';
    // Dédupliquer et afficher uniquement les points négatifs
    const seen = new Set();
    advises.forEach(function(msg) {
        if (!seen.has(msg) && !msg.startsWith('Votre format')) {
            seen.add(msg);
            const li = document.createElement('li');
            li.textContent = msg;
            advEl.appendChild(li);
        }
    });
    if (advEl.children.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'Aucun point d\'amélioration identifié — pratiques optimales !';
        advEl.appendChild(li);
    }

    // ── Graphique radar ───────────────────────────────────────────────
    renderRadarChart([pctBottle, pctCoiffe, pctBouchage, pctEtiquette,
                      pctEtuis, pctSuremb, pctCarton, pctObjet]);

    // ── Stocker le score + afficher le panneau résultats ─────────────
    var activeCuveeName = '';
    if (typeof cuveeData !== 'undefined') {
        var activeId = document.getElementById('cuveeSelect').value;
        var activeCuvee = cuveeData.find(function(c) { return c.id == activeId; });
        if (activeCuvee) {
            activeCuvee.score = score;
            activeCuveeName = activeCuvee.name;
            if (typeof persistData === 'function') persistData();
        }
    }

    var nameEl = document.getElementById('rp-cuvee-name');
    if (nameEl) nameEl.textContent = activeCuveeName ? '— ' + activeCuveeName : '';

    var panel = document.getElementById('resultsPanel');
    if (panel) {
        panel.classList.remove('visible');
        void panel.offsetWidth; // force reflow pour re-déclencher l'animation
        panel.classList.add('visible');
    }

    updateScoresBar();
}

// ── Graphique radar ────────────────────────────────────────────────────
function renderRadarChart(scores) {
    const ctx = document.getElementById('radarChart').getContext('2d');
    if (radarChartInstance) {
        radarChartInstance.destroy();
    }
    radarChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Bouteille', 'Coiffe', 'Bouchage', 'Étiquette',
                     'Étuis', 'Suremballage', 'Carton', 'Objets pub.'],
            datasets: [{
                label: 'Score éco-conception (%)',
                data: scores,
                backgroundColor: 'rgba(0, 119, 200, 0.15)',
                borderColor: '#0077c8',
                pointBackgroundColor: scores.map(function(s) {
                    return s >= 80 ? '#27ae60' : s >= 60 ? '#f39c12' : '#e74c3c';
                }),
                pointRadius: 4,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    min: 0,
                    max: 100,
                    ticks: { stepSize: 20, font: { size: 10 } },
                    pointLabels: { font: { size: 11 } }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// ── Barres de score ────────────────────────────────────────────────────
function setScoreIndicator(id, scorecolor) {
    document.getElementById(id).style.left = scorecolor + '%';
}

function setValueColor(id, pct) {
    const el = document.getElementById(id);
    if (pct >= 80)      { el.style.color = '#15803d'; el.style.background = '#dcfce7'; }
    else if (pct >= 60) { el.style.color = '#b45309'; el.style.background = '#fef3c7'; }
    else                { el.style.color = '#b91c1c'; el.style.background = '#fee2e2'; }
}

// ── Accordéon ─────────────────────────────────────────────────────────
const accordions = document.getElementsByClassName('accordion');
for (let i = 0; i < accordions.length; i++) {
    accordions[i].addEventListener('click', function () {
        for (let j = 0; j < accordions.length; j++) {
            if (accordions[j] !== this) {
                accordions[j].classList.remove('active');
                accordions[j].nextElementSibling.style.display = 'none';
            }
        }
        this.classList.toggle('active');
        const panel = this.nextElementSibling;
        const opening = panel.style.display !== 'block';
        panel.style.display = opening ? 'block' : 'none';
        if (opening) {
            panel.classList.add('panel-entering');
            setTimeout(function() { panel.classList.remove('panel-entering'); }, 200);
        }
    });
}

// ── Barre de scores ────────────────────────────────────────────────────
function updateScoresBar() {
    var bar = document.getElementById('scoresBar');
    if (!bar) return;

    var allCuvees = typeof cuveeData !== 'undefined' ? cuveeData : [];
    var scored = allCuvees.filter(function(c) { return c.score !== undefined; });

    if (scored.length === 0) {
        bar.innerHTML = '<span class="scores-empty">Calculez un diagnostic pour voir les scores ici</span>';
        return;
    }

    function scoreColor(s) { return s >= 80 ? '#15803d' : s >= 60 ? '#b45309' : '#b91c1c'; }
    function scoreBg(s)    { return s >= 80 ? '#dcfce7' : s >= 60 ? '#fef3c7' : '#fee2e2'; }

    // Score global pondéré par nombre de bouteilles
    var totalW = 0, totalNb = 0;
    scored.forEach(function(c) {
        var nb = parseFloat(c.nb);
        if (nb > 0) { totalW += c.score * nb; totalNb += nb; }
    });
    var isWeighted = totalNb > 0;
    var globalScore = isWeighted
        ? Math.round(totalW / totalNb)
        : Math.round(scored.reduce(function(a, c) { return a + c.score; }, 0) / scored.length);

    var activeCuveeId = document.getElementById('cuveeSelect').value;

    var html = '<div class="score-card global">'
             + '<div class="score-card-name">Score global</div>'
             + '<div class="score-card-value" style="color:' + scoreColor(globalScore) + ';background:' + scoreBg(globalScore) + '">'
             +   globalScore + ' %'
             + '</div>'
             + '<div class="score-card-sub">' + (isWeighted ? 'pondéré / bouteilles' : 'moyenne simple') + '</div>'
             + '</div>'
             + '<div class="score-card-sep"></div>';

    scored.forEach(function(c) {
        var nb = parseFloat(c.nb);
        var isActive = String(c.id) === String(activeCuveeId);
        html += '<div class="score-card' + (isActive ? ' active' : '') + '"'
              + ' onclick="document.getElementById(\'cuveeSelect\').value=\'' + c.id + '\';loadCuveeData();"'
              + ' title="Charger ' + c.name.replace(/"/g, '&quot;') + '">'
              + '<div class="score-card-name" title="' + c.name.replace(/"/g, '&quot;') + '">' + c.name + '</div>'
              + '<div class="score-card-value" style="color:' + scoreColor(c.score) + ';background:' + scoreBg(c.score) + '">'
              +   c.score + ' %'
              + '</div>'
              + '<div class="score-card-sub">' + (nb > 0 ? Number(nb).toLocaleString('fr-FR') + ' btl/an' : '—') + '</div>'
              + '</div>';
    });

    bar.innerHTML = html;
}

// ── PDF ───────────────────────────────────────────────────────────────
function viewPDF() {
    window.open('media/plan-de-prevention-commun-champagne_2023.pdf', '_blank');
}
