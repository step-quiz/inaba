# inaba

Puzzles matemàtics de **Naoki Inaba** (稲葉直貴), de domini públic, traduïts al català i fets interactius.
Són pàgines web estàtiques, sense res a instal·lar: HTML, CSS i JavaScript «vainilla».

Els PDF originals (en japonès) són a [`src/`](src/): `*_q.pdf` són els enunciats i `*_a.pdf`, les solucions.

## Puzzles

| Puzzle | Original | Pàgina | Problemes |
|---|---|---|---|
| Enllaç de múltiples | 倍数リンク (`blink`) | [`enllac-multiples.html`](enllac-multiples.html) | 42 |

La portada ([`index.html`](index.html)) també llista els altres 11 puzzles de `src/` com a «Properament».

## Com es juga a l'Enllaç de múltiples

Tres maneres de fer el mateix, i es poden barrejar:

- **Arrossegar** una targeta (amb el ratolí o amb el dit) fins a un lloc buit. Una targeta del tauler es
  pot arrossegar a un altre lloc (s'intercanvien) o fora del tauler (torna a baix).
- **Clicar o tocar** una targeta i després el lloc. Clicar una targeta del tauler la treu.
- **Teclat**: Tab o les fletxes per anar d'un lloc a l'altre, escriure el número de la targeta,
  ⌫ o Supr per treure-la, Esc per desfer la tria.

Quan tots els llocs són plens, es comprova sol: si hi ha alguna fletxa que no va a un múltiple, es
marca en vermell i es diu per què («10 no és múltiple de 4»); si tot és correcte, cada fletxa mostra
el factor (×2, ×5…).

Altres detalls:

- Els problemes resolts es desen al navegador (localStorage) i es veuen amb un ✓ a «Escull…» i a la
  portada. Si el navegador no ho permet, es juga igual.
- Per enviar un problema concret als alumnes: `enllac-multiples.html?p=13` (de l'1 al 42).

## Provar-ho a l'ordinador

Com que no fa servir mòduls, n'hi ha prou amb obrir `index.html` amb doble clic.

## Estructura

```
index.html                     ← portada
icon.png                       ← la sabatilla (enllaça a step-quiz.net), la mateixa d'operacions
enllac-multiples.html          ← el puzzle
css/comu.css                   ← estils comuns a tots els puzzles
css/enllac-multiples.css       ← estils del puzzle
js/portada.js                  ← progrés a la portada
js/enllac-multiples/
    problemes.js               ← els 42 problemes (dades)
    motor.js                   ← comprovar i resoldre (sense DOM)
    tauler.js                  ← dibuixa el tauler (targetes + fletxes SVG)
    enllac-multiples.js        ← controlador: arrossegar, clicar, teclat
tests/enllac-multiples.test.js ← cada problema té una sola solució, i és la del PDF
docs/enllac-multiples.md       ← traducció de les instruccions i notes
src/                           ← PDF originals
```

## Tests

```
node tests/enllac-multiples.test.js
```

GitHub l'executa sol a cada pull request i a cada canvi a `main` (pestanya **Actions**).
