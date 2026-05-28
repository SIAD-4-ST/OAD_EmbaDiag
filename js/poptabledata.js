var cuveeData = [];
var cuveeIdCounter = 0;

// ── Persistance localStorage ───────────────────────────────────────────
function persistData() {
    try {
        localStorage.setItem('embaDiag_cuveeData', JSON.stringify(cuveeData));
        localStorage.setItem('embaDiag_cuveeIdCounter', cuveeIdCounter);
    } catch (e) {
        console.warn('localStorage non disponible :', e);
    }
}

function loadPersistedData() {
    try {
        const saved = localStorage.getItem('embaDiag_cuveeData');
        const savedCounter = localStorage.getItem('embaDiag_cuveeIdCounter');
        if (saved) {
            cuveeData = JSON.parse(saved);
            cuveeIdCounter = savedCounter ? parseInt(savedCounter) : cuveeData.length;
            updateCuveeDropdown();
        }
    } catch (e) {
        console.warn('Impossible de charger les données sauvegardées :', e);
    }
}

// ── Gestion de la popup ────────────────────────────────────────────────
function saveCuvees() {
    var table = document.getElementById('cuveeTable').getElementsByTagName('tbody')[0];

    // Construire la liste des cuvées à partir du tableau
    var updatedNames = new Set();
    for (var i = 0, row; (row = table.rows[i]); i++) {
        var cuveeName = row.cells[0].innerText.trim();
        var cuveeNb   = row.cells[1].innerText.trim();
        if (!cuveeName) continue;
        updatedNames.add(cuveeName);
        var existing = cuveeData.find(function (c) { return c.name === cuveeName; });
        if (existing) {
            existing.nb = cuveeNb;
        } else {
            cuveeData.push({
                id: cuveeIdCounter++,
                name: cuveeName,
                nb: cuveeNb,
                diagnostic: {}
            });
        }
    }

    persistData();
    updateCuveeDropdown();
    closePopup();
}

function openPopup() {
    document.getElementById('cuveePopup').style.display = 'flex';
    var table = document.getElementById('cuveeTable').getElementsByTagName('tbody')[0];
    table.innerHTML = '';
    cuveeData.forEach(function (cuvee) {
        var newRow = table.insertRow();
        var cell1 = newRow.insertCell(0);
        var cell2 = newRow.insertCell(1);
        cell1.contentEditable = 'true';
        cell2.contentEditable = 'true';
        cell1.innerText = cuvee.name;
        cell2.innerText = cuvee.nb;
    });
    // Ligne vide pour saisie rapide si tableau vide
    if (cuveeData.length === 0) addNewRow();
}

function closePopup() {
    document.getElementById('cuveePopup').style.display = 'none';
}

function addNewRow() {
    var table = document.getElementById('cuveeTable').getElementsByTagName('tbody')[0];
    var newRow = table.insertRow();
    var cell1 = newRow.insertCell(0);
    var cell2 = newRow.insertCell(1);
    cell1.contentEditable = 'true';
    cell2.contentEditable = 'true';
    cell1.innerText = '';
    cell2.innerText = '';
    cell1.focus();
}

function updateCuveeDropdown() {
    var select = document.getElementById('cuveeSelect');
    select.innerHTML = '<option value="" disabled selected>Choisissez une cuvée</option>';
    cuveeData.forEach(function (cuvee) {
        var option = document.createElement('option');
        option.value = cuvee.id;
        option.text  = cuvee.name + (cuvee.nb ? '  (' + Number(cuvee.nb).toLocaleString('fr-FR') + ' btl/an)' : '');
        select.appendChild(option);
    });
}

function loadCuveeData() {
    var select = document.getElementById('cuveeSelect');
    var selectedCuvee = cuveeData.find(function (c) { return c.id == select.value; });
    if (!selectedCuvee) return;
    var d = selectedCuvee.diagnostic;

    document.getElementById('bottleWeight').value         = d.bottleWeight        || '';
    document.getElementById('bottleshape').value          = d.bottleshape         || '0';
    document.getElementById('bottlecolor').value          = d.bottlecolor         || '0';
    document.getElementById('bottleincr').value           = d.bottleincr          || '0';

    document.getElementById('coiffeMat').value            = d.coiffeMat           || '0';
    document.getElementById('coiffeSize').value           = d.coiffeSize          || '0';
    document.getElementById('coiffecoll').value           = d.coiffecoll          || '0';
    document.getElementById('coiffethermo').value         = d.coiffethermo        || '0';

    document.getElementById('capsuleType').value          = d.capsuleType         || '0';
    document.getElementById('capsuleColor').value         = d.capsuleColor        || '0';
    document.getElementById('bouchonType').value          = d.bouchonType         || '0';

    document.getElementById('etiquetteCount').value       = d.etiquetteCount      || '';
    document.getElementById('etiquetteColor').value       = d.etiquetteColor      || '';
    document.getElementById('etiquetteEcoInk').checked    = d.etiquetteEcoInk     || false;
    document.getElementById('etiquetteMat').value         = d.etiquetteMat        || '0';
    document.getElementById('etiquettecontreMat').value   = d.etiquettecontreMat  || '0';
    document.getElementById('papierreshum').checked       = d.papierreshum        || false;
    document.getElementById('etiquetteDor').value         = d.etiquetteDor        || '0';
    document.getElementById('etiquetteColle').value       = d.etiquetteColle      || '0';

    document.getElementById('etuisType').value            = d.etuisType           || '0';
    document.getElementById('etuiWeight').value           = d.etuiWeight          || '';
    document.getElementById('elementsassos').checked      = d.elementsassos       || false;
    document.getElementById('etuisEcoink').checked        = d.etuisEcoink         || false;
    document.getElementById('etuissilkpaper').checked     = d.etuissilkpaper      || false;
    document.getElementById('etuisPapier').checked        = d.etuisPapier         || false;
    document.getElementById('etuisCarton').checked        = d.etuisCarton         || false;
    document.getElementById('etuisBois').checked          = d.etuisBois           || false;
    document.getElementById('etuisPlastique').checked     = d.etuisPlastique      || false;
    document.getElementById('etuisAimant').checked        = d.etuisAimant         || false;

    document.getElementById('suremballage').value         = d.suremballage        || '0';
    document.getElementById('suremballageEcoink').checked = d.suremballageEcoink  || false;
    document.getElementById('sacPapier').checked          = d.sacPapier           || false;
    document.getElementById('sacCarton').checked          = d.sacCarton           || false;
    document.getElementById('sacPlastique').checked       = d.sacPlastique        || false;
    document.getElementById('sacAimant').checked          = d.sacAimant           || false;

    document.getElementById('cartonRecycled').value       = d.cartonRecycled      || '0';
    document.getElementById('cartonCannelure').value      = d.cartonCannelure     || '0';
    document.getElementById('cartonInter').value          = d.cartonInter         || '0';
    document.getElementById('cartonScotch').value         = d.cartonScotch        || '0';
    document.getElementById('cartonDor').value            = d.cartonDor           || '0';
    document.getElementById('cartonInk').value            = d.cartonInk           || '0';

    document.getElementById('objet').value                = d.objet               || '0';
}

function saveDiagnostic() {
    var select = document.getElementById('cuveeSelect');
    var selectedCuvee = cuveeData.find(function (c) { return c.id == select.value; });
    if (!selectedCuvee) {
        alert('Veuillez sélectionner une cuvée valide avant de sauvegarder.');
        return;
    }
    selectedCuvee.diagnostic = {
        bottleWeight:       document.getElementById('bottleWeight').value,
        bottleshape:        document.getElementById('bottleshape').value,
        bottlecolor:        document.getElementById('bottlecolor').value,
        bottleincr:         document.getElementById('bottleincr').value,
        coiffeMat:          document.getElementById('coiffeMat').value,
        coiffeSize:         document.getElementById('coiffeSize').value,
        coiffecoll:         document.getElementById('coiffecoll').value,
        coiffethermo:       document.getElementById('coiffethermo').value,
        capsuleType:        document.getElementById('capsuleType').value,
        capsuleColor:       document.getElementById('capsuleColor').value,
        bouchonType:        document.getElementById('bouchonType').value,
        etiquetteCount:     document.getElementById('etiquetteCount').value,
        etiquetteColor:     document.getElementById('etiquetteColor').value,
        etiquetteEcoInk:    document.getElementById('etiquetteEcoInk').checked,
        etiquetteMat:       document.getElementById('etiquetteMat').value,
        etiquettecontreMat: document.getElementById('etiquettecontreMat').value,
        papierreshum:       document.getElementById('papierreshum').checked,
        etiquetteDor:       document.getElementById('etiquetteDor').value,
        etiquetteColle:     document.getElementById('etiquetteColle').value,
        etuisType:          document.getElementById('etuisType').value,
        etuiWeight:         document.getElementById('etuiWeight').value,
        elementsassos:      document.getElementById('elementsassos').checked,
        etuisEcoink:        document.getElementById('etuisEcoink').checked,
        etuissilkpaper:     document.getElementById('etuissilkpaper').checked,
        etuisPapier:        document.getElementById('etuisPapier').checked,
        etuisCarton:        document.getElementById('etuisCarton').checked,
        etuisBois:          document.getElementById('etuisBois').checked,
        etuisPlastique:     document.getElementById('etuisPlastique').checked,
        etuisAimant:        document.getElementById('etuisAimant').checked,
        suremballage:       document.getElementById('suremballage').value,
        suremballageEcoink: document.getElementById('suremballageEcoink').checked,
        sacPapier:          document.getElementById('sacPapier').checked,
        sacCarton:          document.getElementById('sacCarton').checked,
        sacPlastique:       document.getElementById('sacPlastique').checked,
        sacAimant:          document.getElementById('sacAimant').checked,
        cartonRecycled:     document.getElementById('cartonRecycled').value,
        cartonCannelure:    document.getElementById('cartonCannelure').value,
        cartonInter:        document.getElementById('cartonInter').value,
        cartonScotch:       document.getElementById('cartonScotch').value,
        cartonDor:          document.getElementById('cartonDor').value,
        cartonInk:          document.getElementById('cartonInk').value,
        objet:              document.getElementById('objet').value
    };
    persistData();
}

// ── Infobulles ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    loadPersistedData();

    document.querySelectorAll('.tooltip-icon').forEach(function (tooltip) {
        tooltip.addEventListener('mouseenter', function () {
            var tooltipBox = document.createElement('div');
            tooltipBox.className = 'tooltip-box';
            tooltipBox.textContent = this.getAttribute('data-tooltip');
            document.body.appendChild(tooltipBox);
            var rect = this.getBoundingClientRect();
            tooltipBox.style.top  = (rect.top + window.scrollY - tooltipBox.offsetHeight - 10) + 'px';
            tooltipBox.style.left = (rect.left + window.scrollX) + 'px';
            tooltipBox.style.display = 'block';
        });
        tooltip.addEventListener('mouseleave', function () {
            var box = document.querySelector('.tooltip-box');
            if (box) box.remove();
        });
    });
});
