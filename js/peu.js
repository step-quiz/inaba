/* Peu de pàgina fix: mesura l'alçada real del peu (pot ocupar 1-3 línies segons l'amplada)
   i la deixa a --peu-alt perquè el cos de la pàgina hi reservi espai i el peu no tapi res. */
(function () {
    'use strict';
    const peu = document.querySelector('.peu-llicencia');
    if (!peu) return;
    function mesura() {
        document.documentElement.style.setProperty('--peu-alt', peu.offsetHeight + 'px');
    }
    mesura();
    if (window.ResizeObserver) new ResizeObserver(mesura).observe(peu);
    window.addEventListener('resize', mesura);
})();
