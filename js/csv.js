/* ─── CSV EXPORT / IMPORT ─────────────────────────────────────────── */

function csvCell(v) {
  return '"' + String(v === null || v === undefined ? '' : v).replace(/"/g, '""') + '"';
}

function exportToCSV(cuvees) {
  if (!cuvees || cuvees.length === 0) { alert('Aucune cuvée à exporter.'); return; }
  const headers = [
    'Nom de la Cuvée','Nombre de Bouteilles','Poids de la bouteille (g)','Forme de la bouteille',
    'Couleur de la bouteille','Incrustations dans le verre','Coiffe matiere','Coiffe longueur',
    'Collerette','Plastique thermoformé','Type de capsule','Impressions sur la capsule',
    'Type de bouchon','Plaquette Séparable',"Nombre d'étiquettes",'Nombre de couleurs',
    "Usage d'aplats de couleurs","Matière de l'étiquette",'Matière de la contre-étiquette',
    "Résistance à l'état humide",'Dorure','Colle','Étuis non-concerné',"Type d'étuis/coffret","Poids d'étui/coffret",
    'Éléments associés','Aplats de couleurs étuis','Papier de soie utilisé','Papier utilisé',
    'Carton utilisé','Bois utilisé','Plastique utilisé','Aimant(s) utilisé(s)','Suremballage non-concerné','Type de suremballage',
    'Aplats de couleurs suremballage','Papier utilisé suremballage','Carton utilisé suremballage',
    'Plastique utilisé suremballage','Aimant(s) utilisé(s) suremballage','Carton recyclé','Cannelure',
    'Intercalaire','Scotch','Dorure carton','Encrage carton','Objet publicitaire associé',
  ];
  const b = v => v ? 'Oui' : 'Non';
  const rows = cuvees.map(c => {
    const d = c.diagnostic;
    return [
      c.name, c.nb, d.bottleWeight, d.bottleshape, d.bottlecolor, d.bottleincr,
      d.coiffeMat, d.coiffeSize, d.coiffecoll, d.coiffethermo,
      d.capsuleType, d.capsuleColor, d.bouchonType, d.plaqueSeparable || 'non',
      d.etiquetteCount, d.etiquetteColor, b(d.etiquetteEcoInk), d.etiquetteMat, d.etiquettecontreMat,
      b(d.papierreshum), d.etiquetteDor, d.etiquetteColle,
      b(d.etuisNC), d.etuisType, d.etuiWeight, b(d.elementsassos), b(d.etuisEcoink), b(d.etuissilkpaper),
      b(d.etuisPapier), b(d.etuisCarton), b(d.etuisBois), b(d.etuisPlastique), b(d.etuisAimant),
      b(d.surembNC), d.suremballage, b(d.suremballageEcoink), b(d.sacPapier), b(d.sacCarton), b(d.sacPlastique), b(d.sacAimant),
      d.cartonRecycled, d.cartonCannelure, d.cartonInter, d.cartonScotch, d.cartonDor, d.cartonInk, d.objet,
    ];
  });
  const csv = [headers.map(csvCell).join(','), ...rows.map(r => r.map(csvCell).join(','))].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'embadiag_export.csv'; a.click();
  URL.revokeObjectURL(url);
}

function parseCSVLine(line, sep = ',') {
  const result = []; let cur = ''; let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else { inQ = !inQ; }
    } else if (ch === sep && !inQ) {
      result.push(cur.trim()); cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2)
    throw new Error("Le fichier CSV doit contenir au moins une ligne d'en-tête et une ligne de données.");

  const header = lines[0];
  const sep = header.split(';').length > header.split(',').length ? ';' : ',';

  return lines.slice(1).map((line, i) => {
    const row = parseCSVLine(line, sep);
    const pb = v => v === 'Oui' || v === 'true' || v === '1';
    return {
      id: i + 1,
      name: row[0] || `Cuvée ${i + 1}`,
      nb: row[1] || '0',
      diagnostic: {
        bottleWeight: row[2] || '900', bottleshape: row[3] || 'standard',
        bottlecolor: row[4] || 'verte', bottleincr: row[5] || 'non',
        coiffeMat: row[6] || 'complexe', coiffeSize: row[7] || 'longue',
        coiffecoll: row[8] || 'papier-tradi', coiffethermo: row[9] || 'non',
        capsuleType: row[10] || 'metalique', capsuleColor: row[11] || 'mono',
        bouchonType: row[12] || 'nsp', plaqueSeparable: row[13] || 'non',
        etiquetteCount: row[14] || '2', etiquetteColor: row[15] || '4',
        etiquetteEcoInk: pb(row[16]), etiquetteMat: row[17] || 'papieradh',
        etiquettecontreMat: row[18] || 'papieradh', papierreshum: pb(row[19]),
        etiquetteDor: row[20] || 'dorurechaud', etiquetteColle: row[21] || 'colleultra',
        etuisNC: pb(row[22]),
        etuisType: row[23] || 'pasetuiscoffret', etuiWeight: row[24] || '0',
        elementsassos: pb(row[25]), etuisEcoink: pb(row[26]), etuissilkpaper: pb(row[27]),
        etuisPapier: pb(row[28]), etuisCarton: pb(row[29]), etuisBois: pb(row[30]),
        etuisPlastique: pb(row[31]), etuisAimant: pb(row[32]),
        surembNC: pb(row[33]),
        suremballage: row[34] || 'pas_de_sac', suremballageEcoink: pb(row[35]),
        sacPapier: pb(row[36]), sacCarton: pb(row[37]), sacPlastique: pb(row[38]), sacAimant: pb(row[39]),
        cartonRecycled: row[40] || 'oui', cartonCannelure: row[41] || 'B',
        cartonInter: row[42] || 'carton', cartonScotch: row[43] || 'plastique',
        cartonDor: row[44] || 'pasdorure', cartonInk: row[45] || 'huileminerale',
        objet: row[46] || 'non',
      },
    };
  });
}
