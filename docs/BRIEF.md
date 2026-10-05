# Sanad — Concept, Goals & Visual Identity

Version: 4 Oct 2026 · Author: Abdulmalik · Live copy: https://claude.ai/code/artifact/b44a3481-b332-48ac-ba19-860578afbe15

## Concept

**Sanad (سَنَد)** is an Arabic web app that draws every chain of narration (isnad) of one hadith as a single interactive tree. The Prophet ﷺ sits at the top. The compilers (al-Bukhari, Muslim, Abu Dawud and others) sit at the bottom. The tree shows where the chains meet (the common link, *madar*) and where they split.

- **Problem:** Students and researchers read isnads as long lines of text spread over many books. Drawing the tree by hand (*tashjir al-isnad*) takes hours and is easy to get wrong.
- **Solution:** Search a hadith, see all its routes merged into one tree, click any narrator to see who he is, and click any branch to see the exact source (book, number, volume, page).
- **Smart layer:** A machine learning model reads a raw isnad text, finds the narrator names, and links each name to the right person. So users can also paste their own isnad and get a tree.
- **Audience:** Hadith students, researchers, teachers, and people who teach about Islam and must check a hadith and its chains before they cite it.
- **Language:** All planning files and code are in English. The product interface is in Arabic (right-to-left).

## Challenge fit and objectives

Sanad enters **Track 04 — Knowledge and verification tools** (أدوات المعرفة والتحقق). Building and submission run from **Sun 4 Oct 09:00 to Tue 6 Oct 23:59** (Riyadh time); only work done in that window is judged. We aim to submit by **Tue 6 Oct 20:00** to keep a 4-hour safety buffer.

**Track 04 success test (official):** Does the tool make finding or checking knowledge more accurate, show the source and the status of the evidence clearly and traceably, and separate what the sources support from what needs more checking or referral?

**How Sanad answers it:** every route in the tree links to its book and hadith number; every hadith grade is quoted from an approved source (al-Sahihayn, dorar.net, al-Maktaba al-Shamila), never made up by the tool; and any narrator the AI cannot link with high confidence is marked "needs verification" (يحتاج تحققًا) instead of guessed.

**Final judging criteria and our plan for a 5/5 on each**

| Criterion | Weight | What earns 5/5 | Evidence we will show |
| --- | --- | --- | --- |
| Technical quality and AI use | 25% | Stable product; AI does a real job with a documented method; measured gain over a simpler method | Our trained narrator tagger vs a rule-based baseline on 300 held-out isnads: precision, recall, F1 |
| Benefit per track success test | 20% | Clear, repeatable improvement for the target user, with documented results | Timed test: build a tree by hand vs with Sanad (3+ users); linking accuracy on our test set |
| Reliability and scholarly safety | 15% | Passes hard cases; traceable sources; abstains or refers when unsure; consistent over repeated runs | Every route cited; no self-made grades; "needs verification" flag; test file of tricky cases run 3 times |
| Innovation and added value | 15% | Proven advantage over a named alternative | Side-by-side with dorar.net (one isnad at a time) and manual *tashjir* |
| Running cost and continuity | 10% | Costs, dependencies, maintenance and a fallback for critical parts | $0 running cost (Vercel free tier, model runs in the browser); rule-based fallback; content review plan |
| User experience and accessibility | 10% | Target user finishes the task; errors explained; fixes made after a user test | 5-user test; one change made from the results; WCAG 2.1 AA check |
| Clear presentation | 5% | Short, organised, easy to re-test; separates built vs planned | 5-minute demo script, test steps in README, "built" and "next" slides apart |

**Required deliverables (all are mandatory)**

- [ ] Working, complete product (not a prototype)
- [ ] Public GitHub repo with setup docs, licences, and no secrets
- [ ] Demo video, 2 minutes or less
- [ ] Presentation (PDF or PowerPoint) on the official template
- [ ] Source documentation: which scholarly sources we use, how, and how we verify them
- [ ] Live demo link that works during judging (7–22 Oct)
- [ ] Tools, models and data log with licences (required by the Terms, §9)

**Rules from the Terms and Conditions we must follow**

- Disclose every AI tool, model, service, dataset and open-source part, with its licence, in `docs/SOURCES_LOG.md` (type, source, purpose, date, licence). This includes Claude Code and Claude Design, which we use to build Sanad (§9).
- Only work from 4–6 Oct is judged. The repo started empty on 4 Oct; the first commit says so (§8).
- **Prior project:** an earlier version exists (`Malik-712/sanad2`). Say so openly in `docs/BASELINE.md`: its link, a tag of its last version, and anything reused from it. Hiding it is the risk, not having it (§8).
- No real user data in tests or in any AI service; use made-up examples only (§9).
- No passwords or keys in the repo (§10).
- Do not copy protected material, such as an editor's footnotes in a Shamela edition. Use the classical text, name the edition, and link to the page (§8–9).
- Use the challenge logo only in the deck and project materials, as its identity guide says (§19).

## Scope

We have about 55 hours, so the MVP is small and complete: 4 screens, 5 fully checked hadiths, and 1 AI pipeline that is measured. A small product that works end to end beats a big one that breaks.

**MVP (must have for the demo)**

1. **Home + search:** the slogan «لكلِّ حديثٍ إسناد»; search by words of the hadith or by narrator; 5 featured hadiths.
2. **Tree view:** top-to-bottom tree of the hadith's isnads («أسانيد») from the Prophet ﷺ to the compilers; zoom, pan, highlight one isnad, highlight the common link (*madar*) and every branch point.
3. **Narrator panel:** name, generation (*tabaqa*), death year, grade quoted from a named rijal book (e.g. Taqrib al-Tahdhib) with its page, and the routes he appears in.
4. **Source panel:** for each isnad: its full text word for word from the source, book, hadith number, place (edition, volume, page), the quoted grade, a link to the source page, and a «انسخ التوثيق» (copy the reference) button.
5. **Paste an isnad (AI):** paste raw Arabic isnad text; the AI extracts the narrators, links each one to a narrator record with a confidence score, and draws the chain. Low confidence shows "needs verification". The text stays in the browser.
6. **About and method page:** how it works, sources used, the three evidence statuses, AI limits, privacy, and a clear note that this is an AI-assisted tool that does not grade hadiths or give fatwas.

**Later (only if time is left)**

- Compare two hadiths side by side.
- Export the tree as PNG or PDF.
- Larger hadith set from an open dataset.
- User accounts and saved trees.

## Visual identity

The look is "a manuscript, made digital", built on the square Kufic grid of the logo: square units, straight lines, and a thin gold frame with diamond corners. Every element comes from the logo; if it does not, it does not belong. The full identity board is the first board («هوية سند») in the design file (`design/`).

**Name and slogan**

- Name: Sanad — سَنَد.
- Slogan (Arabic, in the product): **«لكلِّ حديثٍ إسناد»** — English: *"Every hadith has its isnad."* It is our promise: we never show a hadith without its isnad, word for word from its book. Write it in full, next to or under the logo.

**Logo** (`public/brand/sanad-mark.svg`)

| Version | Use | Rule |
| --- | --- | --- |
| Full mark (green badge + gold frame) | 48 px and larger: header, cover, video | Never stretch, rotate, recolour, or add a shadow |
| Small mark (no gold frame) | Under 48 px: favicon, app icon | The thin frame disappears at small sizes |
| One colour (green letters, no badge) | Print, stamps, light backgrounds | Sanad Green on parchment or white |
| Clear space | Every use | Empty space around it of at least ¼ of its width |

**Colours**

| Token | Hex | Share | Use |
| --- | --- | --- | --- |
| Parchment (background) | #F5F2EB | 52% | Page background; text on green |
| Sanad Green (primary) | #0E4B3B | 26% | Header bands, buttons, tree lines. Green is a surface, not a small touch |
| Paper (surface) | #FFFDF8 | 14% | Tree stage, panels, inputs |
| Ink (text) | #1C1C1A | 5% | Text, compiler nodes, strong borders |
| Sage | #6F8F7F | 2% | Later-narrator node outline |
| Manuscript Gold (accent) | #C9A45C | 1% | Frame and diamonds only. Never text |
| Muted | #5E6B66 | — | Secondary text (5.0:1 on parchment) |
| On-green muted | #CFDAD4 | — | Secondary text on green (7.0:1) |
| Status: source verified | #2E7D5B · #1F5E44 on #E6F0EA | — | «مصدر موثق» |
| Status: needs checking | #B7791F · #7A4F0F on #F7EBD6 | — | «يحتاج تحققًا» |
| Status: no source yet | #8B908D · #45494A on #ECEBE7 | — | «لا مصدر بعد» — neutral grey, never red |

The three statuses describe **the evidence, not the hadith**. A missing source does not mean the hadith is fabricated, so it is grey, not red. Scholars' grades are quoted text with the name of who said them, never a colour. Status colours always come with a word.

**Typography**

- **One font only: IBM Plex Sans Arabic** (Google Fonts, Open Font License), weights 400, 500, 600 and 700. It is used for everything: headings, interface, hadith text and narrator names.
- Sizes: 13 (smallest) / 14 / 16 / 20 / 28 / 40 / 64 px. Arabic body line-height 1.8; hadith text 1.9.
- Source text is shown inside «» with its source line under it. The difference comes from layout, not from a second font.
- Slides: the official template keeps its own font and colours. Sanad's green and gold appear in the logo and the screenshots.

**Shapes and tree nodes**

- 8 px grid, 2 px corners, borders instead of shadows, no gradients, straight lines with square ends. Touch targets of at least 44 px.
- The Prophet ﷺ: gold diamond with a green outline, at the top. Companions: filled green square. Later narrators: sage outline square. Compilers: ink rectangle with an open-book icon, on the bottom row.
- Common link: gold diamond ring around the node, with the tag «نقطة الالتقاء». Branch point: small gold diamond on the line.
- Route line 2 px #7D8A84; selected route 4 px Sanad Green.

**Voice and fixed sentences**

Calm, plain, short sentences. We never say «صحيح», «ضعيف» or «موضوع» in our own voice; we only quote them with their author. Always ﷺ after the Prophet's name and رضي الله عنه after a companion's name. These sentences are written exactly as below, in their place, every time:

| Where | Sentence |
| --- | --- |
| Every page | «أداة مساعدة بالذكاء الاصطناعي، لا تحكم على الأحاديث ولا تُفتي.» |
| With every source | «ذِكرُ الحديث في كتابٍ ليس حكمًا عليه. الأحكام تُنقل منسوبةً إلى قائليها.» |
| The word for a route | «إسناد» (plural «أسانيد»), never «طريق» or «طرق» |
| With ML output | «استخراج آلي — راجِع النتائج.» |
| When there is no source | «لم ننقل نصّ الحكم بعد، ولن نعرض حكمًا بلا مصدر.» |
| Privacy | «يُحلَّل النص في متصفحك، ولا نحفظه ولا نرسله.» |

**Icons and motion**

- Icons: the design's own SVG icons (2 px stroke, square ends), only where the design has one. No icon package (owner decision, 5 Oct; see CLAUDE.md).
- Motion: the selected route draws from top to bottom in 300 ms. No motion when the user turns on "reduce motion".

## Tech stack and resources

One Next.js app on Vercel, with checked data as JSON in the repo. There is no paid AI API: we train our own small narrator-tagging model and run it inside the user's browser. Running cost is $0, and pasted text never leaves the user's device.

| Area | Choice | Skill / resource to follow |
| --- | --- | --- |
| Design | Claude Design (Design System + Design artifacts), seeded with the logo and colour tokens | [frontend-design skill](https://github.com/anthropics/skills/tree/main/skills/frontend-design) (Anthropic) |
| Web app | Next.js (App Router) + TypeScript + Tailwind CSS, `dir="rtl"` | [Next.js docs](https://nextjs.org/docs), [react-best-practices](https://github.com/vercel-labs/agent-skills) (Vercel) |
| Tree drawing | Our own SVG renderer (matches the design exactly) + dagre layout | [dagre](https://github.com/dagrejs/dagre) |
| Isnad engine | TypeScript graph code: merge routes, find the common link and branch points (network analysis) | Unit tests with Vitest |
| Hadith sources | 5 demo hadiths; text and numbers checked in al-Maktaba al-Shamila and dorar.net/hadith; grades quoted, never computed | The official reference pack |
| Narrator records | Name, generation, death year, grade quoted from Taqrib al-Tahdhib with page | al-Maktaba al-Shamila |
| Training data | Sanadset 650K (650,986 records from 926 books): isnad text + its narrator list, turned into word-level labels automatically. Split by book, so test books are never seen in training | [Mendeley Data](https://data.mendeley.com/datasets/5xth87zwb5), [paper](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9440281/) |
| ML model | Fine-tune Arabic BERT-mini (11.6M parameters) to tag narrator names; trains on a laptop CPU or free Colab/Kaggle in under 1 hour | [asafaya/bert-mini-arabic](https://huggingface.co/asafaya/bert-mini-arabic) |
| ML in the site | Export to ONNX (int8, about 12 MB) and run it in the browser with Transformers.js | [Transformers.js docs](https://huggingface.co/docs/transformers.js) |
| Baseline to beat | Rule-based splitter on transmission words (حدثنا، أخبرنا، عن، سمعت) | Same 300 held-out isnads, same scoring |
| Narrator linking | Normalise Arabic names, fuzzy match against our narrator records, re-rank with teacher/student links; confidence score; low score → "needs verification" | [narrator linking paper (2026)](https://arxiv.org/abs/2607.05424) for method ideas |
| Fallback | If the model fails to load (old phone, slow network), the rule-based parser runs and the page says so | Covers the "critical dependency" point in the judging rubric |
| Quality | UI review, accessibility, browser tests | [web-design-guidelines](https://github.com/vercel-labs/agent-skills) (Vercel), webapp-testing skill (Anthropic) |
| Hosting | GitHub → Vercel Hobby (free), auto deploy on every push; no secrets needed | [Vercel docs](https://vercel.com/docs) |

## Plan and tasks

The deadline drives everything: submit by **Tue 6 Oct 20:00**. The detailed build order, with times and a "done when" list per session, is in `docs/IMPLEMENTATION.md` (revised Mon 5 Oct, 05:30). The phases below are the summary.

```
0 Plan ──► 1 Design ──┬──► 3 Website ───► 4 Isnad engine ──┬──► 6 Launch and pitch
                      └──► 2 Sources ───► 5 AI layer ──────┘
```

### Phase 0 — Plan (done Sun 4 Oct)

- [x] Read the challenge guide and the reference pack
- [x] Choose the track: Track 04, knowledge and verification tools
- [x] Confirm the repo: `Malik-712/sanad` (empty, so the start is clean)
- [x] Answer the open questions
- [x] Approve this file; the first commit adds it as `docs/BRIEF.md` and records the starting version

### Phase 1 — Design in Claude Design (done Sun 4 Oct)

- [x] Build the Sanad design system from the logo, colour tokens and fonts above
- [x] Design 4 screens: Home and search, Tree view (with narrator and source panels), Paste an isnad, About and method
- [x] Check mobile layout and contrast, then approve
- [x] Export the design (HTML, in `design/`) so Claude Code can build from it

### Phase 2 — Sources and documentation (Mon 5 Oct, 10:00–19:00, with a mentor)

- [x] Pick 5 hadiths from al-Sahihayn with many routes (first one: «إنما الأعمال بالنيات»)
- [x] For every route: full isnad text, book, hadith number, link; check each one in al-Maktaba al-Shamila or dorar.net
- [x] For every route: the grade quoted from an approved source, with who gave it
- [x] For every narrator: name, generation, death year, Taqrib grade and page
- [x] Save as JSON with one fixed schema; a hadith specialist reviews at least 1 hadith in full

### Phase 3 — Website (Session A, Mon 06:00–10:00)

- [ ] Set up Next.js, Tailwind, Arabic RTL, fonts and colour tokens
- [ ] Connect GitHub to Vercel and deploy
- [ ] Build pages: Home, Hadith tree, Narrator, Paste an isnad, About and method

### Phase 4 — Isnad engine (Session B, Mon 10:00–14:00)

- [ ] Build the graph: one node per narrator, one line per "heard from"
- [ ] Merge the same narrator across routes
- [ ] Find the common link and branch points; count routes per generation
- [ ] Write tests that run on all 5 hadiths

### Phase 5 — AI layer (Sessions C and D, Mon 14:00 → Tue 01:00)

- [ ] Check the licences of Sanadset and BERT-mini; record them in `docs/SOURCES_LOG.md`
- [ ] Turn Sanadset into word-level labels; split by book into training data and a 300-isnad test set
- [ ] Rule-based baseline parser; score it on the test set
- [ ] Fine-tune BERT-mini; score it on the same test set; save both results in `docs/EVALUATION.md`
- [ ] Export to ONNX and run it in the browser; rule-based fallback if it fails to load
- [ ] Narrator linking with a confidence score
- [ ] Hard-case file (unknown narrator, broken chain, two people with one name, text that is not an isnad); run it 3 times; results must match

### Phase 6 — Launch and pitch (Sessions E and F, Tue 08:00–19:00, submit by 20:00)

- [ ] 5-user test: time to build a tree by hand vs with Sanad; fix 1 issue it finds
- [ ] Lighthouse 90+, accessibility check, mobile check
- [ ] README (setup, test steps, licences) and `docs/SOURCES.md`
- [ ] `docs/REQUIREMENTS.md`: every official requirement → the feature that meets it → the evidence
- [ ] `docs/JUDGES.md`: 5 things to try on the live site, and one command to re-run the numbers
- [ ] `docs/BASELINE.md`: the prior project, and what was built on 4–6 Oct
- [ ] Video of 2 minutes or less; deck on the official template; 5-minute pitch script
- [ ] Submit on the portal by 20:00 and keep the confirmation email

## Decisions and open questions

**Decisions**

- **AI:** no paid API key. We train our own small model and run it in the browser. Cost is $0, and it shows real machine learning work.
- **Team:** working alone. For human review, book a challenge mentor (content or sharia) during mentoring hours on Mon 5 Oct (10:00–19:00). Record who checked what, and what changed, in `docs/REVIEW.md`.
- **Hosting:** Vercel account is linked to GitHub, so every push deploys.
- **Entry:** accepted, so we submit on the portal.
- **Slogan (5 Oct):** «لكلِّ حديثٍ إسناد» replaces «كلُّ الطرق في شجرة واحدة». It says what Sanad shows, and it matches the Track 04 success test: every hadith with its isnad from its source.
- **Font (5 Oct):** one font only, IBM Plex Sans Arabic. Amiri is removed.
- **Statuses (5 Oct):** "no source yet" is neutral grey, not red. Grades are quoted, never coloured. Every isnad shows its source and place, with a "copy the reference" button. The interface says «أسانيد», not «طرق». These ideas come from the old Sanad plan.

**Still open**

1. **Code licence:** the repo must be public, but an open-source licence is optional. Suggestion: "All rights reserved" for now; you can open it later. This is your choice (this is not legal advice).
2. **Data licences:** the Sanadset and BERT-mini pages did not show a licence. We check them first thing on Monday. If a licence is unclear, we ask a mentor before using it.
