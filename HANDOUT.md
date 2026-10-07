# HANDOUT — handover for a cold-start Claude

You are continuing a project: turning the public-domain math puzzles of **Naoki Inaba** (Japanese PDFs in
`src/`) into interactive, static, vanilla-JS web pages in **Catalan**, for a secondary-school math teacher.
4 of the 12 puzzles are done; **8 are pending**. Read this file fully before touching anything: it encodes
every decision already agreed with the user, the architecture, the data pipeline, the testing method and the
traps already found. There is also a **second phase: printable A4 sheets** (laminated, written on with a
whiteboard marker): done for Expressions bessones, see §14.

Sections: 1 User & rules · 2 Environment · 3 Git/PR workflow · 4 Repo layout · 5 Shared architecture ·
6 Conventions · 7 Interaction patterns · 8 The 4 finished puzzles · 9 PDF data extraction · 10 Testing ·
11 Recipe for a new puzzle · 12 The 8 pending puzzles · 13 Open points · 14 Print versions (phase 2)

---

## 1. The user and the rules they set

- **Who**: math teacher (ESO + Batxillerat, Catalonia), maths graduate, knows C and algorithms, limited
  HTML/CSS/JS, **limited Git/GitHub/Codespaces knowledge** → whenever they must do something (merge, pull…),
  give step-by-step, copy-paste-ready instructions. Talk to them **in Catalan**. They rest 23:00–07:00.
- **Workflow they want**: you implement → commit → push → **open the PR yourself automatically** → they merge
  on GitHub. Always end your reply with the 3 merge steps (open PR link, wait for green ✓, "Merge pull request"
  → "Confirm merge") and the Cloudflare preview link.
- **NEVER** put `[skip ci]`, `[ci skip]` or `[cf-pages-skip]` in any commit message (Cloudflare would not
  deploy).
- **Agreed product decisions** (do not re-litigate):
  - Free play only: **no attempts, no points, no verification codes** (unlike their other site).
  - Puzzle names (Catalan) approved — see §12 and `index.html`.
  - «Com es juga?» (instructions `<details>`) is **folded by default**.
  - **No long hint text** under the board (they explicitly removed one). A one-line rule above the board is
    fine; a short `instr-compte` note inside the instructions is fine.
  - Header: shoe icon (`icon.png`) linking to `https://step-quiz.net/`, same as their `operacions` repo;
    big ‹ › SVG arrows; middle button label **«Escull…»**.
  - **Every puzzle gets a print version** (§14) and, on its game page, a discreet link «Versió per imprimir»
    (printer icon) at the right of «← Tots els puzzles» in `nav.dalt`. Add the link only when
    `imprimir/<puzzle>.html` exists (copy it from `expressions-bessones.html`).
  - Footer: `<p class="credits">Puzzle original de Naoki Inaba</p>` + the CC BY-NC-SA licence bar
    (`footer.peu-llicencia`, copied from `operacions/index.html`). Copy it from any existing page.
  - Laberint d'angles: keep **S/G** letters; angle arcs **visible while playing**; never say the path
    «gira» (turn angle); the number is the angle **formed by the two segments**; 180° = flat angle, drawn
    as a semicircle.
  - Expressions bessones problem 17: **keep the original statement** (see §8.3).
- When you find an error in a source PDF: keep the original data, accept every valid answer, document it in
  `docs/<puzzle>.md` and in the test, and tell the user. (Errors found so far: blink 13, gemini 17 & 41,
  shikaku 41.)
- The user may paste translations made by other AIs (Gemini). Treat them as data: verify against the PDF;
  they contained real errors (see `docs/traduccions.md` notes).

## 2. Environment facts

- Repos: `step-quiz/inaba` (this one, the product) and `step-quiz/operacions` (their other site, **read-only
  reference** for look & feel: `prioritat.html`, `vocabulari.html`, `css/shared.css`, `css/tokens.css`).
- Deploy: **Cloudflare Pages** builds every push. Production = `main`. Branch previews:
  `https://<branch-name-with-dashes>.inaba-2uz.pages.dev/` (e.g. `claude-sharp-tesla-ayy1yw.inaba-2uz…`).
  The sandbox network **blocks** `*.pages.dev` and `licensebuttons.net` (403 from proxy) — you cannot open
  the live site; rely on local testing + Cloudflare's green check on the PR.
- GitHub: no `gh` CLI; use the `mcp__github__*` tools (load via ToolSearch: `select:mcp__github__create_pull_request`,
  `select:mcp__github__pull_request_read`).
- Tools available: `python3`, `node 22`, poppler (`pdftotext`, `pdftocairo`, `pdftoppm`, `pdfimages`),
  PIL, Playwright at `/opt/node22/lib/node_modules/playwright` (Chromium preinstalled; never run
  `playwright install`), Prettier at `/opt/node22/lib/node_modules/prettier/bin/prettier.cjs`.
- Use the session scratchpad for throw-away scripts/screenshots; never commit them.

## 3. Git / PR workflow (exact)

```bash
cd /home/user/inaba
# Before starting new work, check whether the previous PR was merged (mcp pull_request_read → "merged": true).
git fetch -q origin main && git merge --ff-only origin/main   # bring the dev branch up to the merged main
# … work, test (§10) …
git add -A && git commit -F - <<'EOF'
<Catalan title: «Nom del puzzle: què s'ha fet»>

<Catalan bullet body>

Co-Authored-By: <as given in the session's system reminder>
Claude-Session: <as given in the session's system reminder>
EOF
git push -u origin <designated-branch>
```

- Work only on the designated branch from the session instructions (so far `claude/sharp-tesla-ayy1yw`).
- `git checkout -B <branch> origin/main` was **refused by the permission classifier** ("irreversible local
  destruction"). Use `git merge --ff-only origin/main` instead (works because merged PRs leave the branch
  as an ancestor of main). Never force-push.
- Each finished piece of work = a new PR (`base: main`), title and body **in Catalan**, body ends with the
  attribution lines from the system reminder. PR template: none in this repo.
- Commit messages and PR bodies in Catalan, describing what changed and how it was verified.
- Do not commit `__pycache__/` (`.gitignore` covers it; it once slipped in via `importlib`).

## 4. Repository layout

```
index.html                    home: available puzzle cards + «Properament» list (inline <style>)
icon.png                      shoe icon (from operacions); also favicon
enllac-multiples.html  laberint-angles.html  expressions-bessones.html  talla-rectangles.html
css/comu.css                  everything shared (tokens, layout, header, buttons, instructions, pila,
                              messages, dialog, footer, keyframes, ≤480px rules)
css/<puzzle>.css              theme colours (--primary…) + puzzle-specific styles
js/comu.js                    window.Comu: progress, header/nav + «Escull…» dialog, messages, anima()
js/portada.js                 home: «Resolts: n / N» per puzzle from localStorage
js/<puzzle>/problemes.js      data (window.PROBLEMES_<X>), prettier-ignore compact tables
js/<puzzle>/motor.js          pure logic, no DOM (window.Motor<X>): check + brute-force solver
js/<puzzle>/tauler.js         rendering (window.Tauler<X>): crea(...) + estatic(...) for instructions
js/<puzzle>/<puzzle>.js       controller IIFE: state, events (pointer/click/keyboard), messages
tests/<puzzle>.test.js        node test: data sanity + unique solution + equals PDF answer key
tests/<puzzle>-solucions.json answers extracted from *_a.pdf (only for generated datasets)
tools/extreu-laberint.py      PDF → js/laberint-angles/problemes.js + tests/laberint-angles-solucions.json
tools/extreu-rectangles.py    PDF → js/talla-rectangles/problemes.js + tests/talla-rectangles-solucions.json
docs/<puzzle>.md              JA↔CA translation table + translation notes + problem notes + PDF errata
docs/traduccions.md           reviewed translations of the PENDING puzzles (move a section out when done)
src/*_q.pdf, src/*_a.pdf      original problems / answers (8 pages q: p1 = instructions; 7 pages a)
.github/workflows/tests.yml   CI: runs every tests/*.test.js step (add one step per new puzzle)
.prettierrc.json              same config as operacions (4 spaces, single quotes, width 120)
imprimir/<puzzle>.html        print version (A4 sheets) + imprimir/<puzzle>.pdf generated from it (§14)
css/imprimir.css              shared print styles; css/imprimir-<puzzle>.css per puzzle
js/imprimir.js                window.Imprimir: problem sheets (6 per page), header/footer, print button
js/<puzzle>/imprimir.js       fills the print page (instruction examples + problem sheets)
tools/genera-pdf.js           Playwright/Chromium: imprimir/<puzzle>.html → PDF, fails on any overflow
README.md                     user-facing (Catalan) description; update per puzzle
```

## 5. Shared architecture

- **No ES modules**: classic scripts with `defer`, so pages work by double-clicking the HTML (`file://`).
  Load order per page: `js/comu.js`, `problemes.js`, `motor.js`, `tauler.js`, controller. Each file exposes
  one global on `window` (or is an IIFE). Tests load data+motor in Node with `vm.runInContext` and a fake
  `window` object — so **motor.js and problemes.js must not touch the DOM**.
- **HTML skeleton** (copy `talla-rectangles.html` or `expressions-bessones.html` and edit): `nav.dalt` (`a.tornar`
  + `a.per-imprimir` if there is a print version) →
  `.title-row` (shoe + `h1`) → `details#instruccions.instruccions` → `main.panel` with `.header-info`
  (`#titol-problema`, `#ja-resolt`, `#comptador`, nav `#btn-anterior` / `#btn-tria` «Escull…» /
  `#btn-seguent`), `p.regla`, puzzle area (`#tauler-wrap`, optional `.pila-wrap > #pila`), `#missatge`
  (`aria-live="polite"`), `.accions > #btn-reinicia` → `p.credits` → `footer.peu-llicencia` →
  `dialog#dialeg-tria` (`#graella-problemes`, `#btn-esborra-progres`, `#btn-tanca-tria`). **comu.js needs
  all these ids.**
- **`js/comu.js` API** (`window.Comu`):
  - `progres(clau)` → `{ dades: { resolts: [1-based numbers], actual: index }, desa(), marcaResolt(n),
    esResolt(n) }`; localStorage wrapped in try/catch. Keys: `inaba.<puzzle-slug>`.
  - `navegacio({ total, progres, carrega })` → `{ obre(i), actualitza(), inicial(), botoSeguent(),
    totsResolts(), obreTria(), dialegObert() }`. `obre(i)` saves progress, sets `?p=i+1` (replaceState),
    refreshes header. `inicial()` = `?p=` or last seen. `botoSeguent()` returns the «Problema següent →»
    (or «Escull un altre problema») button for the success message. `carrega` is the controller's
    function-declaration (hoisted), passed before definition.
  - `missatge(el, tipus, titol, frases = [], boto = null)` with `tipus` ∈ `error | ok | info`;
    `amagaMissatge(el)`; `anima(el, classe)` (restartable CSS animation, removes class on `animationend`).
- **Controller skeleton** (all four follow it): constants & `els`; `progres`, `nav`; state vars;
  `carrega(i)` (reset state, build view via `T.crea`, wire events, `nav.obre`, `pinta()`); `pinta()`
  (pure state→DOM incl. aria-labels, then `nav.actualitza()`); actions that end in `canvi()` →
  `amagaMissatge(); pinta(); revisa()`; `revisa()` checks only when the board is complete; `celebra()` sets
  `resolt = true`, `progres.marcaResolt(actual + 1)`, message `ok` with the computed facts + next button
  (focused); `reinicia()`; event sections (click/tap, keyboard, pointer drag); `pintaInstruccions()` builds
  static example boards with `T.estatic`; bootstrap `carrega(nav.inicial())`.
- **CSS**: `css/comu.css` defines tokens (`--text-main #1e293b`, `--text-muted #64748b`, `--border-*`,
  `--success #047857`, `--success-light`, `--danger #dc2626`, `--danger-light`, `--warning`) and defaults
  for `--primary/-light/-hover/-dark`; each puzzle CSS overrides `--primary*` in `:root`. Shared classes:
  `.instr-cos/.instr-regles/.instr-fila(.exemple)/.instr-caixa/.instr-compte/.instr-veredicte.be|.malament`,
  `.regla`, `#tauler-wrap` (flex centre), `.pila-wrap/.pila-titol/.pila(.avisa)`, `.missatge(.error|.ok|.info)`,
  `.accions`, `.btn-principal/.btn-sec/.btn-nav/.btn-text`, `.dialeg-tria/.graella`, keyframes
  `fadeIn`, `sacseja`, `home-blink-shake`. Puzzle CSS defines its own `posa`/`celebra`/`batec` keyframes.
- **Theme colours used**: Enllaç indigo `#4f46e5`; Laberint sky `#0369a1` (path `#0284c7`); Bessones amber
  `#b45309`; Rectangles violet `#6d28d9` (+ `--mida-0..3` piece fills). Each new puzzle gets its own colour
  (ideas: teal `#0f766e`, rose `#be123c`, cyan `#0e7490`, fuchsia `#a21caf`, orange `#c2410c`, emerald —
  keep enough contrast with white text; avoid confusion with success green/danger red). The home card uses
  the same colour via a `.puzzle.<slug>` class in `index.html`'s `<style>` (border-top, strong/progres
  colour, hover).
- **Scaling boards**: board units → SVG `viewBox` (+ HTML overlays positioned in %), CSS `width` in px with
  `max-width: 100%`; fonts inside HTML overlays use container query units
  (`container-type: inline-size` + `calc(100cqw * k / var(--amplada))`). Must have **no horizontal scroll
  at 360 px** (check `document.documentElement.scrollWidth`).

## 6. Conventions

- Code identifiers, comments, file headers, UI text: **Catalan**. File header block (see any JS file:
  `FITXER / ROL / ARQUITECTURA / DEPENDÈNCIES`). Match comment density of existing files.
- Prettier with `.prettierrc.json`; run `prettier --write js css tests` and `--check`. Data tables keep one
  problem per line using a `// prettier-ignore` comment **exactly** (extra text after it disables it).
- UI language: address the student as **tu** («Col·loca», «Ves», «Arrossega»). Vocabulary: **xifra** =
  digit 0–9, **nombre** = quantity, **número** = the written label on a card/circle; 式 = **igualtat** (not
  «equació»); マス = **quadret**; ○ in PDFs = ✓, × = ✗; decimals with comma (1,5); multiplication `×`,
  division `÷`, minus `−` (U+2212).
- Every puzzle page: translated instructions from the PDF page 1 (examples drawn with `T.estatic`); any
  sentence not in the PDF must be flagged in `docs/<puzzle>.md`.
- `?p=N` deep link works on every puzzle (teachers share specific problems).

## 7. Interaction patterns (reuse them)

Every puzzle supports **mouse, touch and keyboard**, three equivalent ways:

1. **Drag** with Pointer Events (one code path for mouse/touch/pen): `pointerdown` stores start; after 6 px
   it becomes a drag (ghost element `position: fixed` following the pointer; on touch, aim point 40 px above
   the finger); `pointerup` hit-tests with `document.elementFromPoint` → `.closest('.target')`. Listeners
   on `document` for move/up/cancel. Draggable elements need `touch-action: none` (so the page does not
   scroll); the rest of the page keeps scrolling. After an active drag set a flag
   (`acabaDArrossegar = true; setTimeout(() => acabaDArrossegar = false, 0)`) so the trailing `click` is
   ignored.
2. **Click/tap**: select a source (chip/card; `aria-pressed`) then click a target; clicking a filled target
   removes/clears it. Targets show a pulsing highlight while something is selected (`.amb-seleccio`).
3. **Keyboard**: targets are `tabindex=0` `role=button` with descriptive `aria-label`; arrows move focus
   spatially; Enter/Space = click; Backspace/Delete = clear; Esc = cancel selection; typing digits/symbols
   directly fills a target where natural. For a click event without pointer (`e.detail === 0`, screen
   readers) call the same action.

Feedback rules: nothing is judged until the board is **complete**; then mark the wrong items in red with a
concrete mathematical reason («10 no és múltiple de 4», «Al cercle del 180, el camí fa 90°», «7 + 1 + 6 =
8 + 6 = 14, i no 13», «han de fer 3, 5 i 6 quadrets, però en fan …»); on success turn things green and show
the underlying maths (×k labels, base × altura, step-by-step calculation). Local, non-revealing aids are OK
during play (e.g. rectangle size label, angle arcs, ✓ on used cards/sizes).

## 8. The four finished puzzles

### 8.1 Enllaç de múltiples (`blink`, 倍数リンク) — 42 problems, indigo
- Data (hand-transcribed, `js/enllac-multiples/problemes.js`): `{ llocs: [[col, fila, valor?]], fletxes:
  [[origen, desti]], targetes: [...] }`; `valor` present = card already on the board. Destination must be a
  multiple of origin; cards used once; some cards spare.
- `motor.js`: `esMultiple, taulerInicial, esFix, targetesLliures, comprova, resol`.
- `tauler.js`: slots are HTML divs over an SVG of arrows (units W=72, H=92, pitch 150); `etiqueta(i, text)`
  shows ×k / ✗ pills on arrows.
- UI: pool of cards (`#pila`) → drag/click into dashed slots; dragging slot→slot swaps, out of board returns
  card; keyboard: type the number in a focused slot (multi-digit prefix buffer, 900 ms).
- PDF answer error: problem **13** (answer shows 24 top-right; correct is 8).

### 8.2 Laberint d'angles (`kmaze`, 角度メイズ) — 38 problems, sky
- Data **generated** by `tools/extreu-laberint.py`: `{ nodes: [[x, y, label?]], arestes: [[a,b]],
  tallades: [[a,b]] }` (x,y in edge-length units; label `'S' | 'G' | degrees`). `tallades` = dotted lines
  with × (not passable).
- Rule: path S→G along lines, each circle at most once; at a numbered circle the **angle between incoming
  and outgoing segments** equals the number (180 = straight). Verified: this reading gives 38/38 unique
  solutions matching the PDF; the "turning angle" reading gives 26 unsolvable.
- `motor.js`: `direccio` rounds each line direction to **multiples of 15°** (absorbs drawing error of the
  irregular problems 31–36); `angle(p,u,v,w)`, `comprova`, `resol` (DFS with pruning).
- `tauler.js`: SVG lines/path/arcs + HTML circles; unit `U = max(72, 64/shortest edge)`, R=19, width
  ≤ 540 px; arc marks: square for 90°, semicircle for 180° (above, or right if vertical), arc otherwise.
  Circles have an enlarged invisible hit area (`::before inset -30%`).
- UI: trace by dragging through circles (back over the previous circle shortens), click circles, keyboard
  (Enter adds, Backspace undoes); candidates have dashed borders; «↶ Desfés» button.

### 8.3 Expressions bessones (`gemini`, 双子式) — 42 problems, amber
- Data: `[[a, b, c, r], [d, e, f, s]]` per problem. Choice = `{ ops: [o1, o2], par }`, `par` 0 none, 1 =
  `(a o1 b) o2 c`, 2 = `a o1 (b o2 c)`.
- `motor.js`: exact fractions; `avalua` returns calculation steps (`['(1 + 1) × 2', '2 × 2', '4']`),
  negatives/fractions in parentheses mid-step, division by zero flagged; `comprova`, `resol` (48 combos).
- UI: the two cards share **one** set of sign slots ("twins"): a sign placed in either card appears in both.
  CSS grid with fixed column slots so twins align. Palette `+ − × ÷ ( )`; «( )» dropped on the operation to
  do first; keys `+ - * x / : ( )`. Instructions add an order-of-operations reminder (not in PDF).
- Any valid answer accepted. PDF answer errors: **17** (its answer `4 ÷ 2 + 1 = 4` is false; with the
  original statement the only solutions are `a × (b − c)` or `a ÷ (b − c)` — user chose to keep the
  original), **41** (missing parentheses: `12 × (8 − 6) = 24`). Test allows two solutions only for 17.

### 8.4 Talla en rectangles (`shikaku`, 四角カット) — 42 problems, violet
- Data **generated** by `tools/extreu-rectangles.py`: `{ figura: ['.#.', '###', …], mides: [1, 2, 3] }`
  (`#` = cell); one rectangle per size; sizes sum to the area. Example (page 1 is an image) hard-coded in
  the script.
- `motor.js`: `figura, dins, entre, cap, toca, comprova (→ sobren = rectangles with a size not in the list
  or duplicated), resol` (exact cover: first empty cell is a top-left corner).
- `tauler.js`: pure SVG, 10 units per cell, `CEL 56` px, max 520 px; `pinta(peces)` draws fills per piece,
  thin grid, **thick cuts computed from cell ownership** (piece≠piece, piece≠empty, inside≠outside), labels
  at piece centre; `previsio(r, valid)`; `cursor(q)`; `quadret(clientX, clientY)`.
- UI: drag from a cell to the opposite corner (pointer capture on the SVG) with live «base × altura =
  quadrets»; new rectangle replaces overlapped ones; tap removes; tap on empty makes 1×1 only if 1 is in
  the list; keyboard cursor (arrows, Enter start/finish, Esc, Supr). Each size has a colour; wrong sizes red.
- PDF answer error: **41** (cuts drawn wrong; test uses the correct solution).

## 9. PDF data extraction (the technique that works)

All 12 PDFs are **vector** drawings. Only `shikaku_q.pdf` page 1 embeds raster images (its example was
copied by hand); `pdfimages -list` reports 0 images for all 8 pending `_q.pdf`.
Pipeline used by both tools (copy the helpers from `tools/extreu-laberint.py`):

1. `pdftocairo -svg -f P -l P file.pdf -` → parse every `<path>` after `</defs>`: attributes (`stroke`,
   `stroke-width`, `fill`, `stroke-dasharray`, `transform="matrix(a,b,c,d,e,f)"` → apply
   `x' = a·x + c·y + e`, `y' = b·x + d·y + f`), path commands M/L/C/Z (curves ⇒ circles/dots: bbox centre and
   radius). Ignore degenerate sub-paths (a lone `M` after `Z`).
2. **Classify by style** (survey first: `pdftocairo -svg … | grep -o '<path [^>]*' | sed 's/ d="[^"]*"//;
   s/transform="[^"]*"//' | sort | uniq -c`). Typical: thick black lines = outlines; grey = grid;
   dasharray = special (blocked lines / dotted grids); in answer PDFs the solution is a **thicker black**
   stroke that *replaces* the grey line (so treat it as an edge too).
3. `pdftotext -bbox -f P -l P` → words with centres; normalise with `unicodedata.normalize('NFKC')`
   (full-width digits/parentheses). Problem labels are `(n)`; size/target texts are separate words.
4. Group drawing elements into figures (connected components by touching endpoints / shared circles), then
   assign each label to the **nearest figure by bbox distance**, greedy over sorted pairs. **Key by word
   index, not text** (the same text, e.g. `1,2,3`, can appear twice on a page — this bug happened).
5. Snap to the grid / lattice; assert consistency; write compact data + answers JSON; the Node test then
   checks uniqueness and equality with the answers.
6. Hand drawings are imprecise (kmaze: up to 12° off). Idealise geometry when the family is a lattice
   (`redibuixa`: directions rounded to 90/60/45/30°, lengths to 1 or √2, BFS rebuild + cycle-closure assert).

Other traps met: Markdown `---` also matches table separators (`|---|`) — search `'\n---\n'`; running a
tool via `importlib` creates `__pycache__`.

## 10. Testing

- Unit: `for t in tests/*.test.js; do node $t; done` (all must print ✓). CI runs the same.
- Format: `node /opt/node22/lib/node_modules/prettier/bin/prettier.cjs --check js css tests`.
- Browser (Playwright, scripts kept in the scratchpad):
  - Server: `python3 -m http.server 8010 --bind 127.0.0.1` as a **background** Bash job (it is killed after
    its time limit — restart when needed; report it if a task notification says it stopped).
  - `const { chromium } = require('/opt/node22/lib/node_modules/playwright');` Block the licence image to
    avoid noise: `page.route('https://licensebuttons.net/**', r => r.fulfill({ path: '<any png>' }))`.
  - Mouse drag: `page.mouse.move(x,y); down(); move(x2,y2,{steps:8}); up()`.
  - Touch drag (real `pointerType: 'touch'`): context `{ viewport: {width: 360, height: 760}, hasTouch:
    true, isMobile: true }`, `cdp = await ctx.newCDPSession(page)`, then `Input.dispatchTouchEvent`
    `touchStart` / several `touchMove` / `touchEnd`.
  - SVG cell centre from viewBox: read `svg.getAttribute('viewBox')` (not `viewBox.baseVal`, it serialises
    to `{}`).
  - Always: solve **every** problem through the UI using the PDF answers, test the error path, keyboard,
    360 px mobile (scrollWidth = 360), then look at screenshots with the Read tool (wait ~500 ms for
    animations or screenshots look half-faded).
- Before each PR: unit tests ✓, prettier ✓, the other puzzles' browser tests still pass (shared CSS/JS).

## 11. Recipe: adding a puzzle

1. Read its section in `docs/traduccions.md` (reviewed translation + notes) and the PDFs (render pages with
   `pdftoppm -r 80 -png`; view with Read).
2. Survey the vector styles (§9); write `tools/extreu-<slug>.py` if the data is graphical (or transcribe by
   hand if small: blink/gemini were hand-typed). Generate `js/<slug>/problemes.js` + answers JSON.
3. `motor.js` + `tests/<slug>.test.js` (sanity, unique solution, equals PDF answer; document any PDF error).
   Get the test green **before** the UI.
4. Choose an interaction **different** from the existing ones when sensible (user likes variety), with
   drag + click + keyboard; `tauler.js` (`crea` + `estatic`), controller following §5.
5. `<slug>.html` from an existing page; `css/<slug>.css` with a new theme colour.
6. Integrations: `index.html` (move the card from «Properament» to the list + `.puzzle.<slug>` colour
   rules), `js/portada.js` (add `{ clau, el, total }`), `.github/workflows/tests.yml` (new step),
   `README.md` (table row, «Com es juga…» section, structure, tests; update the «altres N puzzles» count),
   `docs/<slug>.md` (move the section out of `docs/traduccions.md` + fix its intro list), translation notes.
7. Prettier, all tests, browser tests (§10), commit, push, PR, reply in Catalan with merge steps + preview.

## 12. The 8 pending puzzles

All have 8-page `_q.pdf` (page 1 = instructions) and 7-page `_a.pdf`; all vector. Reviewed Catalan
instructions are in `docs/traduccions.md`. Approved Catalan names in **bold**.

| Name (slug idea) | PDF | Problems | What it is | Interaction idea |
|---|---|---|---|---|
| **Creuat de múltiples** (`creuat-multiples`) | `bcross` | 42 | Kakuro-like grid; black cells split by a diagonal hold clue numbers; fill white cells with digits 0–9; the number read from a clue (◣ lower-left half → downwards; ◥ upper-right half → rightwards) must be a multiple of the clue; no leading 0. | Digit entry: focus cell + type; on-screen digit pad 0–9 (drag/tap) for mobile. Feedback per clue «96 = 8 × 12». |
| **On és la xifra?** (`on-es-la-xifra`) | `dokoeq` | 42 | Column additions with □ boxes (only **sums**: all 48 signs are +); clue digits outside with arrows point to a column (from above) or a row (from the side): the digit must appear somewhere in that line; no leading 0, no number that is just 0. | Same digit-entry component as bcross (worth putting in `comu.js`). |
| **Busca el nombre** (`busca-el-nombre`) | `kazu` | 42 | For young kids (hiragana). Grid with apples (red fill `rgb(98%,36%,24%)`), later also mandarins; place a 3×3 (or 2×2) square frame where the count = N, or «més/menys mandarines que pomes», «tantes com», «la diferència és 0/1/2». Must stay inside the dotted area. | Drag a fixed-size frame snapping to cells; arrows move it; Enter checks. Very simple language. |
| **Dipòsits d'aigua** (`diposits-aigua`) | `mizu` | 42 | 3-D drawn cubes; tanks = thick-bordered groups of cubes; **1 cube = 1 litre**; arrows give row/column totals as fractions (5/6, 3/2…); water settles: same level within a tank, lower floor full before upper. | Drag the water surface of each tank (snap to the tick marks — thirds/quarters/sixths); exact fractions (reuse bessones fraction code). |
| **Busca el triangle** (`busca-el-triangle`) | `sankaku` | 42 | Dot grid (dashed grey lines) with black dots; choose 3 dots → triangle with the given area (1, 1,5, 2, 3…). Instructions explain base×altura:2 and the "box minus corner triangles" method. | Tap 3 dots, polygon drawn; on check show area by the box method; dot-grid component shared with zukei. |
| **L'escala de nombres** (`escala-nombres`) | `step` | 42 | Circles joined by straight lines; each straight chain is an arithmetic progression from one end (difference ≥ 1, no repeats, integers ≥ 1, may have 2+ digits); some circles given. | Number entry in circles (keyboard + pad); show the common difference (+2, +3) on each line when solved. |
| **Afegeix zeros** (`afegeix-zeros`) | `zero` | **49** | `a + b + c = N` with single-digit cards; append zeros to cards (×10ᵏ) so the equality holds (e.g. 1 + 200 + 30 = 231). «0, 1, 2 zeros» in the PDF is just the example, not a limit. | Tap a card / «+0» button / drag a 0 chip onto a card; Backspace removes a zero; live sum shown only on completion. |
| **Busca la figura** (`busca-la-figura`) | `zukei` | 42 | Dot grid; choose vertices forming the named figure (isòsceles, rectangle, rectangle isòsceles, quadrat, rectangle, rombe, trapezi, paral·lelogram), possibly rotated. PDF definitions are inclusive (a square is a rectangle and a rhombus); for **trapezi** check the answers to know if "≥ 1 pair" or "exactly 1 pair" of parallel sides. | Same dot-grid selection as sankaku; vertices ordered automatically (convex hull); exact integer geometry (squared lengths, dot/cross products). |

Style survey of page 2 (to start the extractors): bcross = black filled evenodd polygons with white
strokes (triangles) + white-filled cells; dokoeq = black 6.25 strokes (boxes/arrows) + black fills (arrow
heads); kazu = grey dashed 4.17 grid + red fruit fills; mizu = black 12.5 (tank borders), 4.17 (cube
edges), 3.125 (tick marks); sankaku/zukei = grey dashed 4.17 grid + black filled dots; step = black 18.75
(lines) + white-filled circles with black 12.5 outline; zero = black 3.125 card boxes (numbers are text).

## 13. Open points / ideas

- Nothing pending from the user right now; the next request will probably be "Implementa «<name>»" or a
  print version of another puzzle (§14).
- Possible refactors if a third puzzle needs them: shared digit-entry pad (bcross, dokoeq, step), shared
  dot-grid selector (sankaku, zukei), shared exact-fraction helper (bessones, mizu).
- `docs/traduccions.md` notes contain the known Gemini mistakes (only sums in dokoeq; 1 litre per cube in
  mizu; «0, 1, 2 zeros» is not a rule; kazu «Compte!» is about the dotted line and square size).

## 14. Print versions (phase 2)

The user prints the PDF **double-sided on a black & white printer**, laminates the sheets and students write
the answers with a **whiteboard marker** (12–13 year olds, thick marker → big writing areas).

- **Pages**: 1 = instructions (same text and examples as the game's «Com es juga?»), 2 = blank (back of the
  instructions), 3… = problems, **6 per page** in a 2 × 3 grid (Expressions bessones: 42 → pages 3–9,
  i.e. 1–6, 7–12, … 37–42). Each problem page: header (title + Japanese name + «Problemes a–b»), a one-line
  rule, the grid, footer (credits + CC BY-NC-SA). The examples on page 1 are in a smaller size
  (`.mida-instr`).
- **Rules the user set**: only **white, black and dark grey** (`--tinta: #000`, `--gris: #333`; no colour at
  all, also for ✓/✗: verify by rendering with `pdftoppm` and counting pixels with R≠G≠B); dashed boxes must
  **not touch** the card border (vertical air `--aire`); boxes **centred** between the two numbers (equal
  space on both sides, see the `data-forat` margins); as much writing room as fits.
- **How it is built**: `imprimir/<puzzle>.html` is a static page whose first sheet (instructions) is written
  in HTML; `js/<puzzle>/imprimir.js` renders the examples with the game's own `Tauler<X>.estatic(...)` and
  calls `Imprimir.problemes({ total, perFull: 6, regla, dibuixa })` and `Imprimir.capsIPeus({ titol, jp })`.
  Each sheet is a `.pagina` of exactly 210 × 297 mm (`@page { size: A4; margin: 0 }`), everything in mm/pt.
  On screen there is a bar (hidden in print) with «← Torna al joc», «Imprimeix o desa com a PDF»
  (`window.print()`) and a download link to the generated PDF. The game page links to it with
  `a.per-imprimir` in `nav.dalt` (see §1).
- **Pending**: print versions of Enllaç de múltiples, Laberint d'angles and Talla en rectangles (and of every
  new puzzle). Same layout rules; design each one's writing areas for a thick marker, send a sample first.
- **Width is the constraint**: page side padding 6 mm, column gap 3 mm → 97.5 mm per column. Expressions
  bessones: boxes 14 × 14 mm, parenthesis slots 5 mm, numbers 19.5 pt; problems 37–42 (two-digit operands)
  get `.dues-xifres` (15 pt numbers) so their cards fit; first number right-aligned and last left-aligned so a
  one-digit number sharing a column with a two-digit one stays next to its box.
- **Generate**: `node tools/genera-pdf.js expressions-bessones` → `imprimir/expressions-bessones.pdf`
  (commit it; regenerate whenever the data or the print CSS change). `--pagines 1,3 --sortida
  imprimir/x-mostra.pdf` makes a sample for the user (`*-mostra.pdf` is git-ignored). The script throws if any
  `.pagina`, `.problemes`, `.problema` or `.caixa` overflows: the grid can silently grow into the page padding
  otherwise.
- **Workflow with the user**: send a sample (pages 1 and 3) with `SendUserFile`, iterate, then the full PDF.
