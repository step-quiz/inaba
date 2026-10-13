/**
 * ============================================================================
 * FITXER: js/imprimir.js
 * ROL: Munta els fulls A4 de les versions per imprimir (imprimir/<puzzle>.html):
 *      els fulls de problemes (6 per full), la capçalera de cada full (amb el crèdit
 *      de l'autor, Naoki Inaba) i el botó «Imprimeix» de la barra de dalt.
 * ARQUITECTURA: El full d'instruccions s'escriu a mà a l'HTML. Aquest fitxer
 *   hi afegeix al darrere els fulls de problemes, i després posa la capçalera
 *   a tots els fulls que porten data-quins (els fulls en blanc no en porten).
 *   Els fulls no tenen peu: el crèdit de l'autor i l'adaptació van a la capçalera.
 *   Cada puzzle li passa una funció que dibuixa el problema i-èsim.
 * DEPENDÈNCIES: Cap. El fa servir tools/genera-pdf.js a través de l'HTML.
 * ============================================================================
 */
window.Imprimir = (() => {
    // Crèdits de la capçalera: el puzzle és de Naoki Inaba; la traducció i les fitxes, de l'adaptador
    const CREDIT_AUTOR = 'Puzzle original: © Naoki Inaba (inabapuzzle.com), publicat amb el seu permís';
    const CREDIT_ADAPTACIO =
        'Adaptació al català: © 2026 David Arso Civil · Departament de Matemàtiques, INS Miquel Tarradell';

    function element(etiqueta, classe, text) {
        const el = document.createElement(etiqueta);
        if (classe) el.className = classe;
        if (text !== undefined) el.textContent = text;
        return el;
    }

    /**
     * Afegeix els fulls de problemes al final del document.
     *   total, perFull: quants problemes n'hi ha i quants per full
     *   regla: una frase (HTML) per recordar la regla a dalt de cada full, o una funció
     *          (primer, darrer) → frase, si canvia d'un full a un altre
     *   dibuixa(i): l'element del problema i (0…)
     */
    function problemes({ total, perFull, regla, dibuixa }) {
        for (let primer = 1; primer <= total; primer += perFull) {
            const darrer = Math.min(primer + perFull - 1, total);
            const full = element('section', 'pagina');
            full.dataset.quins = `Problemes ${primer}–${darrer}`;
            if (regla) {
                const p = element('p', 'regla-full');
                p.innerHTML = typeof regla === 'function' ? regla(primer, darrer) : regla;
                full.appendChild(p);
            }
            const graella = element('div', 'problemes');
            for (let n = primer; n <= darrer; n++) {
                const fig = element('figure', 'problema');
                fig.appendChild(element('div', 'num-problema', n));
                fig.appendChild(dibuixa(n - 1));
                graella.appendChild(fig);
            }
            full.appendChild(graella);
            document.body.appendChild(full);
        }
    }

    // Posa la capçalera (títol, «Problemes 1–6» i els crèdits) als fulls amb data-quins
    function capsIPeus({ titol, jp }) {
        document.querySelectorAll('.pagina[data-quins]').forEach(full => {
            const cap = element('header', 'cap');
            const h1 = element('h1', '', titol);
            if (jp) h1.appendChild(element('span', 'jp', jp));
            const credits = element('p', 'credits');
            credits.append(element('span', '', CREDIT_AUTOR), element('span', '', CREDIT_ADAPTACIO));
            cap.append(h1, element('span', 'quins', full.dataset.quins), credits);
            full.prepend(cap);
        });
    }

    // El botó «Imprimeix» de la barra de dalt (la barra no s'imprimeix)
    document.querySelectorAll('[data-imprimeix]').forEach(b => b.addEventListener('click', () => window.print()));

    return { problemes, capsIPeus };
})();
