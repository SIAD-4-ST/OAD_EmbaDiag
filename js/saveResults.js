function saveResults() {
    const headers = [
        'Nom de la Cuvée',
        'Nombre de Bouteilles',
        'Poids de la bouteille (g)', 'Forme de la bouteille', 'Couleur de la bouteille', 'Incrustations dans le verre',
        'Coiffe matiere', 'Coiffe longueur', 'Collerette', 'Plastique thermoformé',
        'Type de capsule', 'Impressions sur la capsule', 'Type de bouchon',
        "Nombre d'étiquettes", 'Nombre de couleurs', "Usage d'aplats de couleurs",
        "Matière de l'étiquette", 'Matière de la contre-étiquette', "Résistance à l'état humide", 'Dorure', 'Colle',
        "Type d'étuis/coffret", "Poids d'étui/coffret", 'Éléments associés', 'Aplats de couleurs étuis',
        'Papier de soie utilisé', 'Papier utilisé', 'Carton utilisé', 'Bois utilisé', 'Plastique utilisé', 'Aimant(s) utilisé(s)',
        'Type de suremballage', 'Aplats de couleurs suremballage', 'Papier utilisé suremballage',
        'Carton utilisé suremballage', 'Plastique utilisé suremballage', 'Aimant(s) utilisé(s) suremballage',
        'Carton recyclé', 'Cannelure', 'Intercalaire', 'Scotch', 'Dorure carton', 'Encrage carton',
        'Objet publicitaire associé'
    ];

    const bool = function (v) { return v ? 'Oui' : 'Non'; };

    const rows = cuveeData.map(function (cuvee) {
        var d = cuvee.diagnostic;
        return [
            cuvee.name, cuvee.nb || '',
            d.bottleWeight || '', d.bottleshape || '', d.bottlecolor || '', d.bottleincr || '',
            d.coiffeMat || '', d.coiffeSize || '', d.coiffecoll || '', d.coiffethermo || '',
            d.capsuleType || '', d.capsuleColor || '', d.bouchonType || '',
            d.etiquetteCount || '', d.etiquetteColor || '', bool(d.etiquetteEcoInk),
            d.etiquetteMat || '', d.etiquettecontreMat || '', bool(d.papierreshum), d.etiquetteDor || '', d.etiquetteColle || '',
            d.etuisType || '', d.etuiWeight || '', bool(d.elementsassos), bool(d.etuisEcoink),
            bool(d.etuissilkpaper), bool(d.etuisPapier), bool(d.etuisCarton),
            bool(d.etuisBois), bool(d.etuisPlastique), bool(d.etuisAimant),
            d.suremballage || '', bool(d.suremballageEcoink), bool(d.sacPapier),
            bool(d.sacCarton), bool(d.sacPlastique), bool(d.sacAimant),
            d.cartonRecycled || '', d.cartonCannelure || '', d.cartonInter || '',
            d.cartonScotch || '', d.cartonDor || '', d.cartonInk || '',
            d.objet || ''
        ];
    });

    // Construire le CSV avec guillemets systématiques (RFC 4180)
    var csvContent = '\uFEFF'; // BOM UTF-8 pour Excel
    csvContent += headers.map(csvCell).join(',') + '\n';
    rows.forEach(function (row) {
        csvContent += row.map(csvCell).join(',') + '\n';
    });

    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sauvegarde_eco_conception_champagne.csv';
    link.click();
}

// Échappe une valeur pour CSV RFC 4180 : entoure de guillemets, double les guillemets internes
function csvCell(value) {
    var str = String(value === null || value === undefined ? '' : value);
    return '"' + str.replace(/"/g, '""') + '"';
}

function loadCSV(event) {
    var reader = new FileReader();
    reader.onload = function () {
        parseCSV(reader.result);
    };
    reader.readAsText(event.target.files[0], 'UTF-8');
    // Reset pour permettre de recharger le même fichier
    event.target.value = '';
}

// Parseur CSV robuste : gère les guillemets, les virgules dans les valeurs et les sauts de ligne
function parseCSVLine(line) {
    var result = [];
    var inQuote = false;
    var cell = '';
    for (var i = 0; i < line.length; i++) {
        var ch = line[i];
        if (inQuote) {
            if (ch === '"') {
                if (line[i + 1] === '"') { cell += '"'; i++; } // guillemet doublé
                else { inQuote = false; }
            } else {
                cell += ch;
            }
        } else {
            if (ch === '"') {
                inQuote = true;
            } else if (ch === ',') {
                result.push(cell);
                cell = '';
            } else {
                cell += ch;
            }
        }
    }
    result.push(cell);
    return result;
}

function parseCSV(csvText) {
    // Supprimer le BOM éventuel
    if (csvText.charCodeAt(0) === 0xFEFF) csvText = csvText.slice(1);

    var lines = csvText.split(/\r?\n/).filter(function (l) { return l.trim() !== ''; });
    if (lines.length < 2) { alert('Fichier CSV vide ou invalide.'); return; }

    // Ignorer la ligne d'en-tête (index 0)
    var dataLines = lines.slice(1);

    cuveeData = dataLines.map(function (line, index) {
        var v = parseCSVLine(line);
        return {
            id: index,
            name: v[0]  || '',
            nb:   v[1]  || '',
            diagnostic: {
                bottleWeight:       v[2]  || '',
                bottleshape:        v[3]  || '',
                bottlecolor:        v[4]  || '',
                bottleincr:         v[5]  || '',
                coiffeMat:          v[6]  || '',
                coiffeSize:         v[7]  || '',
                coiffecoll:         v[8]  || '',
                coiffethermo:       v[9]  || '',
                capsuleType:        v[10] || '',
                capsuleColor:       v[11] || '',
                bouchonType:        v[12] || '',
                etiquetteCount:     v[13] || '',
                etiquetteColor:     v[14] || '',
                etiquetteEcoInk:    v[15] === 'Oui',
                etiquetteMat:       v[16] || '',
                etiquettecontreMat: v[17] || '',
                papierreshum:       v[18] === 'Oui',
                etiquetteDor:       v[19] || '',
                etiquetteColle:     v[20] || '',
                etuisType:          v[21] || '',
                etuiWeight:         v[22] || '',
                elementsassos:      v[23] === 'Oui',
                etuisEcoink:        v[24] === 'Oui',
                etuissilkpaper:     v[25] === 'Oui',
                etuisPapier:        v[26] === 'Oui',
                etuisCarton:        v[27] === 'Oui',
                etuisBois:          v[28] === 'Oui',
                etuisPlastique:     v[29] === 'Oui',
                etuisAimant:        v[30] === 'Oui',
                suremballage:       v[31] || '',
                suremballageEcoink: v[32] === 'Oui',
                sacPapier:          v[33] === 'Oui',
                sacCarton:          v[34] === 'Oui',
                sacPlastique:       v[35] === 'Oui',
                sacAimant:          v[36] === 'Oui',
                cartonRecycled:     v[37] || '',
                cartonCannelure:    v[38] || '',
                cartonInter:        v[39] || '',
                cartonScotch:       v[40] || '',
                cartonDor:          v[41] || '',
                cartonInk:          v[42] || '',
                objet:              v[43] || ''
            }
        };
    });

    if (cuveeData.length > 0) {
        cuveeIdCounter = cuveeData.length;
    }
    persistData();
    updateCuveeDropdown();
    if (typeof updateScoresBar === 'function') updateScoresBar();
    alert(cuveeData.length + ' cuvée(s) chargée(s) avec succès.');
}
