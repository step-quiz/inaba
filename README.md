# inaba

Puzzles matemàtics de **Naoki Inaba** (稲葉直貴), de domini públic, traduïts al català i fets interactius.
Són pàgines web estàtiques, sense res a instal·lar: HTML, CSS i JavaScript «vainilla».

Els PDF originals (en japonès) són a [`src/`](src/): `*_q.pdf` són els enunciats i `*_a.pdf`, les solucions.

## Puzzles

| Puzzle | Original | Pàgina | Problemes |
|---|---|---|---|
| Enllaç de múltiples | 倍数リンク (`blink`) | [`enllac-multiples.html`](enllac-multiples.html) | 42 |
| Laberint d'angles | 角度メイズ (`kmaze`) | [`laberint-angles.html`](laberint-angles.html) | 38 |
| Expressions bessones | 双子式 (`gemini`) | [`expressions-bessones.html`](expressions-bessones.html) | 42 |

La portada ([`index.html`](index.html)) també llista els altres 9 puzzles de `src/` com a «Properament».
La traducció de les instruccions de cada puzzle i les notes sobre els problemes són a [`docs/`](docs/).
Les dels puzzles que encara no s'han fet són a [`docs/traduccions.md`](docs/traduccions.md).

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

## Com es juga al Laberint d'angles

El camí sempre surt de la S. Tres maneres de fer-lo, i es poden barrejar:

- **Traçar**: prémer el final del camí i, sense aixecar el dit o el ratolí, passar pels cercles. Tornar
  enrere pel mateix camí l'escurça.
- **Clicar o tocar** els cercles connectats, un darrere l'altre. Clicar un cercle del camí el talla fins allà.
- **Teclat**: Tab o les fletxes per anar d'un cercle a l'altre, Enter per afegir-lo al camí, ⌫ per desfer
  l'últim pas.

Els cercles on es pot anar tenen la vora discontínua, i als cercles amb número per on passa el camí es
dibuixa l'angle que hi formen les dues línies del camí: un escaire si és de 90°, un mig cercle si és de
180° (un angle pla: el camí va recte) i un arc si és un altre. Quan el camí arriba a la G, es comprova sol: si algun angle no és el que demana
el cercle, es marca en vermell i es diu quin fa («Al cercle del 180, el camí fa 90°»).

## Com es juga a les Expressions bessones

Les dues targetes són «bessones»: cada signe (+, −, ×, ÷) es posa una sola vegada i va sol a totes dues.
Els parèntesis «( )» es deixen sobre el signe de l'operació que s'ha de fer primer. Tres maneres de fer-ho:

- **Arrossegar** un signe fins a un forat. Un signe posat es pot arrossegar a l'altre forat (s'intercanvien)
  o fora (es treu).
- **Clicar o tocar** un signe i després el forat. Clicar un signe posat el treu, i clicar un parèntesi treu
  els parèntesis.
- **Teclat**: Tab o les fletxes per anar d'un forat a l'altre, escriure `+ - * /` (o `x :`), `(` per posar o
  treure els parèntesis, ⌫ per esborrar.

Quan hi ha els dos signes, es comprova sol i es mostra el càlcul de cada targeta pas a pas
(«1 + 1 × 2 = 1 + 2 = 3, i no 4»). S'accepta qualsevol solució correcta, encara que no sigui la del PDF.

## Comú als puzzles

- Els problemes resolts es desen al navegador (localStorage) i es veuen amb un ✓ a «Escull…» i a la
  portada. Si el navegador no ho permet, es juga igual.
- Per enviar un problema concret als alumnes: `enllac-multiples.html?p=13`, `laberint-angles.html?p=5`…

## Provar-ho a l'ordinador

Com que no fa servir mòduls, n'hi ha prou amb obrir `index.html` amb doble clic.

## Estructura

```
index.html                     ← portada
icon.png                       ← la sabatilla (enllaça a step-quiz.net), la mateixa d'operacions
enllac-multiples.html          ← un fitxer HTML per puzzle
laberint-angles.html
css/comu.css                   ← estils comuns a tots els puzzles
css/<puzzle>.css               ← estils de cada puzzle
js/comu.js                     ← progrés, capçalera (‹ Escull… ›) i missatges, comuns a tots els puzzles
js/portada.js                  ← progrés a la portada
js/<puzzle>/
    problemes.js               ← els problemes (dades)
    motor.js                   ← comprovar i resoldre (sense DOM)
    tauler.js                  ← dibuixa el tauler
    <puzzle>.js                ← controlador: arrossegar, clicar, teclat
tests/<puzzle>.test.js         ← cada problema té una sola solució, i és la del PDF
tools/extreu-laberint.py       ← llegeix els laberints del PDF i escriu js/laberint-angles/problemes.js
docs/<puzzle>.md               ← traducció de les instruccions i notes
docs/traduccions.md            ← traducció de les instruccions dels puzzles pendents
src/                           ← PDF originals
```

## Tests

```
node tests/enllac-multiples.test.js
node tests/laberint-angles.test.js
node tests/expressions-bessones.test.js
```

GitHub els executa sols a cada pull request i a cada canvi a `main` (pestanya **Actions**).
