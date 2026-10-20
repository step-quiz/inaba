/**
 * ============================================================================
 * FITXER: js/portada.js
 * ROL: A la portada (index.html):
 *      1. Mostra quants problemes de cada puzzle ha resolt qui juga en aquest
 *         navegador (si no hi ha localStorage, es queda el text de l'HTML).
 *      2. Interruptor «Joc dinàmic ⇄ Imprimir PDF»:
 *         - Joc dinàmic (per defecte): cada targeta va al puzzle interactiu i
 *           mostra «42 problemes» o «Resolts: n / 42».
 *         - Imprimir PDF: les mateixes targetes porten al PDF de la carpeta
 *           imprimir/ (<puzzle>.pdf) i mostren «Imprimir en PDF».
 *         La URL amb #imprimir obre la portada ja en mode PDF (per compartir-la).
 *      3. Fa que la fletxa de cada casella desplegui la descripció en català.
 * ============================================================================
 */
(() => {
    const PUZZLES = [
        { clau: 'inaba.enllac-multiples', el: 'progres-enllac', total: 42 },
        { clau: 'inaba.laberint-angles', el: 'progres-laberint', total: 38 },
        { clau: 'inaba.expressions-bessones', el: 'progres-bessones', total: 42 },
        { clau: 'inaba.talla-rectangles', el: 'progres-rectangles', total: 42 },
        { clau: 'inaba.creuat-multiples', el: 'progres-creuat', total: 42 },
        { clau: 'inaba.on-es-la-xifra', el: 'progres-xifra', total: 42 },
        { clau: 'inaba.busca-el-nombre', el: 'progres-nombre', total: 42 },
        { clau: 'inaba.busca-el-triangle', el: 'progres-triangle', total: 42 },
        { clau: 'inaba.escala-nombres', el: 'progres-escala', total: 42 },
        { clau: 'inaba.busca-la-figura', el: 'progres-figura', total: 42 },
        { clau: 'inaba.afegeix-zeros', el: 'progres-zeros', total: 49 },
        { clau: 'inaba.diposits-aigua', el: 'progres-diposits', total: 42 },
    ];

    // Text de progrés de cada targeta en mode «Joc dinàmic»
    PUZZLES.forEach(p => {
        const el = document.getElementById(p.el);
        if (!el) return;
        p.textJoc = el.textContent; // «42 problemes», si no hi ha res desat
        try {
            const d = JSON.parse(localStorage.getItem(p.clau));
            const n = d && Array.isArray(d.resolts) ? d.resolts.length : 0;
            if (n > 0) p.textJoc = `Resolts: ${n} / ${p.total}`;
        } catch (e) {
            /* sense localStorage: es queda el text de l'HTML */
        }
    });

    const llista = document.querySelector('.llista');
    const interruptor = document.getElementById('selector-mode');
    const targetes = Array.from(document.querySelectorAll('.llista a.puzzle'));

    // L'enllaç del joc és el de l'HTML (p. ex. «busca-el-nombre.html»); el del PDF, «imprimir/busca-el-nombre.pdf»
    targetes.forEach(a => {
        const hrefJoc = a.getAttribute('href');
        a.dataset.hrefJoc = hrefJoc;
        a.dataset.hrefPdf = 'imprimir/' + hrefJoc.replace(/\.html$/, '.pdf');
    });

    function aplicaMode(pdf) {
        interruptor.setAttribute('aria-checked', String(pdf));
        llista.classList.toggle('mode-pdf', pdf);
        targetes.forEach(a => {
            a.setAttribute('href', pdf ? a.dataset.hrefPdf : a.dataset.hrefJoc);
            if (pdf) {
                a.target = '_blank';
                a.rel = 'noopener';
            } else {
                a.removeAttribute('target');
                a.removeAttribute('rel');
            }
        });
        PUZZLES.forEach(p => {
            const el = document.getElementById(p.el);
            if (el) el.textContent = pdf ? 'Imprimir en PDF' : p.textJoc;
        });
        // La URL recorda el mode (sense afegir entrades a l'historial)
        try {
            history.replaceState(null, '', pdf ? '#imprimir' : location.pathname + location.search);
        } catch (e) {
            /* per exemple, en obrir el fitxer amb doble clic en alguns navegadors */
        }
    }

    interruptor.addEventListener('click', () => {
        aplicaMode(interruptor.getAttribute('aria-checked') !== 'true');
    });

    // Per defecte, el joc dinàmic; només #imprimir obre el mode PDF
    aplicaMode(location.hash === '#imprimir');
})();

// Fletxa de cada casella: desplega o plega la descripció en català
document.querySelectorAll('.desplega').forEach(boto => {
    boto.addEventListener('click', () => {
        const desc = document.getElementById(boto.getAttribute('aria-controls'));
        const obert = boto.getAttribute('aria-expanded') === 'true';
        boto.setAttribute('aria-expanded', String(!obert));
        boto.title = obert ? 'Mostra la descripció' : 'Amaga la descripció';
        desc.hidden = obert;
    });
});
