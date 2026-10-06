# Design notes

How the approved design in `design/screens/*.dc.html` maps to the app. The design is built **exactly**; where it is silent or conflicts with `CLAUDE.md`, the decision is recorded below. All names, counts, pages, dates and percentages in the design files are sample content and never go into `data/` (CLAUDE.md rule 9).

## Artboards → routes and components

| Artboard | Size | Route / use | Main components |
| --- | --- | --- | --- |
| `Main.dc.html` «هوية سند» | 1440 | Reference only (identity board) | Tokens, type scale, tree node shapes, buttons, search field, segmented control, tags, status badges, the automatic-extraction notice, narrator panel, route card, source line, fixed sentences |
| `Home.dc.html` | 390 | `/` | `SiteHeader`, hero with `GoldFrame` and the small tree drawing, search card, Paste link row, `SectionHeading` «أحاديث مختارة», `HadithCard`, green `SiteFooter` |
| `Tree.dc.html` | 390 | `/hadith/[id]` below 1024px | Green band (back link, matn, counts), `Segmented` «الشجرة / الأسانيد …», tree area, `TreeLegend`, `RouteCard` list, `NarratorPanel`, `RoutePanel` |
| `TreeDesktop.dc.html` | 1440 | `/hadith/[id]` from 1024px | Desktop header (logo 48px, 4-link nav with gold underline, search on green), band with `GoldFrame`, three columns: routes list / tree with zoom bar / panel column with the disclaimer line |
| `Paste.dc.html` | 390 | `/parse` | Band, textarea form, privacy line, analyse button, `AutoNotice`, `NarratorChip` list, the «سفيان» chooser, `ChainList`, found-in-tree box, plain footer |
| `About.dc.html` | 390 | `/about` | Band with the disclaimer in a framed `green-deep` box, numbered steps, tree key, sources list, three evidence statuses, AI limits, privacy, green footer |
| — | — | `/narrator/[id]` | Built from the narrator panel (Tree / TreeDesktop) |

## Tokens found

All colours are tokens in `app/globals.css` and in the CLAUDE.md table. Four come from the design and were added on 5 Oct: `edge` #7D8A84 (normal isnad line, 2px), `selected` #EAF1EC (selected route card), `hover` #EDE8DC (zoom button hover), `green-line` #2A6453 (divider on green). `#EFEADF` is only a swatch border on the identity board and is not a token. Corners 2px (`rounded-sq`); borders instead of shadows; touch targets ≥ 44px.

## Type

One font, IBM Plex Sans Arabic. Sizes are used as px values exactly as in the screens.

| Role | Sizes (px) | Weight | Line height |
| --- | --- | --- | --- |
| Display / slogan | 46 (Home), 40 (Paste, About h1), 52–88 (identity board) | 700 | 1.15–1.25 |
| Section headings | 26, 28 | 600 | 1.3 |
| Matn / source text («») | 23 (cards), 26 (tree band mobile), 34 (desktop), 19–22 (isnad, quotes) | 400 | 1.6–2 |
| Panel names | 28 (mobile), 30 (desktop) | 700 | 1.5 |
| Interface | 13, 14, 15, 16, 17, 20 | 400–600 | 1.6–1.8 |
| Smallest text | 13 (12 only inside tree tags) | — | — |

## Interactions

- **Tree pan and zoom:** drag on the tree area (pointer events, 5px threshold so a tap is not a drag); zoom buttons +0.2 / −0.2 between 0.6 and 2; reset; desktop shows the zoom as a percentage. *Session B.*
- **Select a route:** a route card toggles `.on` (green 2px border, `selected` background, number box filled); the route's edges are drawn 4px green and nodes outside the route are dimmed; the panel shows the source panel.
- **Select a narrator:** a node gets the green label; edges touching it are highlighted; the panel shows the narrator panel; desktop marks route cards that pass through him («يمرّ بالراوي المختار»). *Session B (tree nodes).*
- **Panels:** narrator panel (role word, name, common-link note, الطبقة / الوفاة, Taqrib quote with ref or the no-quote note, status, count of routes) and source panel (route n of N, title, status, isnad text, note, الموضع, الحكم المنقول, the source sentence, «افتح الموضع في المصدر», «انسخ التوثيق» → «نُسخ التوثيق»). Desktop panels have a close button; with nothing selected the column shows «اختر من الشجرة».
- **The «سفيان» chooser (Paste):** when a name matches more than one narrator, a box asks which one, with the likely one pre-selected. *Session D.*
- **Mobile tabs:** a two-button segmented control switches between the tree and the route list; choosing a route from the list returns to the tree.

## Decisions where the design is silent or conflicts

Owner decisions, 5 Oct 2026:

1. **Real data only.** No demo hadith file. «بيانات توضيحية» shows only for data marked `demo: true`, and on the /parse sample.
2. **Counts in words**, as the design writes them («ثمانية أسانيد», «الأسانيد الستة عشر»), from a tested helper.
3. **Home hero caption:** counts from data only; the meeting point is added in Session B when the engine computes it.
4. **/parse sample:** the results layout built from a real isnad in `data/`, tagged «بيانات توضيحية», with no match percentages, no «سفيان» chooser, no meeting-point ring and no status badge. The analyse button is disabled with «قريبًا».
5. **Icons:** the design's own SVGs, not `lucide-react` (CLAUDE.md updated).
6. **Narrator pages** are reached from the route panel, which lists the route's narrators with links.
7. **Search** filters «أحاديث مختارة» in place; the query stays in `?q=`.
8. **Desktop header on every page** from 1024px; «شجرة الأسانيد» in the nav only on hadith pages; Home, Paste and About in a centred 720px column.
9. **Footers** follow each screen; on the hadith page the disclaimer is the line in the panel column (stacked under the panel on mobile).
10. **Honorifics** come from `honorificAr` in `data/narrators.json` (see `docs/RESOLUTIONS.md`).
11. **Status badges** follow `verification.status`, which only the owner sets.

Following the design's own rules:

- **Logo below 48px** (mobile header, 44px) uses the small mark without the gold frame, as the identity board says.
- **Matn source line** under the matn on the hadith page, and other readings (`matnVariants`) in a small disclosure, because CLAUDE.md marks source text by «» and the source line under it.
- **About:** «كتب الرواية» lists only the books in `data/`; the death date in the design is dropped (sample content); the editions line stays a visible placeholder until Session F.
- **Skip link and not-found page** added for accessibility.

## Session B (done 6 Oct)

The tree is drawn from data by the engine (`lib/isnad/`): graph, analysis and dagre layout, with tests. It includes nodes and edges, branch diamonds, the common-link ring and tag (owner decision: never the Prophet ﷺ or a compiler; when it carries only some isnads, the count is said in words), pan by drag, zoom by buttons / wheel / pinch, reset, and isnad and narrator selection (`?isnad=` / `?narrator=`). Tree labels use `nameAr` (no invented short names); a companion's honorific is a small second line. Wide trees open at 60% on the Prophet ﷺ; zooming out shows the whole tree.
