# Sanad (سَنَد): Project Overview

**«لكلِّ حديثٍ إسناد»** — *Every hadith has its isnad.*

AI Challenge — Serving Islamic Content · **Track 04: Knowledge and verification tools** · Built 4–6 Oct 2026 · Solo builder
Live: https://sanad-pi-five.vercel.app · Code: https://github.com/Malik-712/sanad

---

## 1. Concept

Sanad is an Arabic, right-to-left web app. You paste an **isnad** (the chain of narrators of a hadith). An AI model reads it in your browser, and Sanad finds every hadith in a 36,390-hadith corpus with the same or a close chain, then draws the shared chain as one interactive graph. The compilers' own 5 hadiths (37 isnads) have full source panels and merged trees.

It is an aid, not an authority: it **never grades a hadith** and **never gives a fatwa**.

| | |
|---|---|
| **Audience** | Hadith students, researchers, teachers, anyone who must check a chain before citing it |
| **Problem** | Isnads are scattered as text across many books. Finding every hadith that shares a chain, or drawing the tree by hand (*tashjir*), takes hours and is error-prone. |
| **Solution** | Paste once → all matching hadiths, ranked, with the chain drawn, each with book, number and a link to its source. |
| **Promise** | No hadith is shown without its isnad, word for word from its book. |

**How it answers the Track 04 test** (accuracy · visible sources and evidence status · separating what sources support from what needs checking):

- Every result is a real entry with book, number and source link.
- Three evidence statuses always appear with a word: «مصدر موثق» · «يحتاج تحققًا» · «لا مصدر بعد».
- The AI only reads names. Matching and ranking are fixed calculations. The AI is never the evidence.

---

## 2. Scope

| Built (MVP) | Later (not started) |
|---|---|
| Explorer on Home: paste → in-browser reading → matches → graph + ranked list with filters | Compare two hadiths |
| A page per found hadith (`/c/<book>/<n>`) | Export tree as PNG/PDF |
| 5 verified hadiths, 37 isnads, merged trees with the common link (*madar*) and branch points | More hand-checked hadiths |
| 92 narrator pages with quoted Taqrib entries | Accounts, saved trees |
| Source panel with copyable citation; `/sources`; About with method and limits | |
| Rule-based fallback when the model cannot load | |

---

## 3. Workflow

```
Paste isnad ──► Tagger finds names + transmission words (browser Web Worker)
                    │  model fails / slow ──► rule parser (labelled on screen)
                    ▼
        Align names, in order, with every corpus isnad (fixed algorithm)
                    ▼
   Summary · shared-chain graph · ranked list (book / match type / name filters)
                    ▼
        Hadith page: isnad, status, source link  (+ our verified tree if we hold it)
```

Offline, once: Sanadset 650K → word-level labels (split **by book**, 300-isnad test set) → fine-tune BERT-mini → int8 ONNX (12.24 MB) → the same model reads all 36,390 corpus isnads into a static index.

---

## 4. Tools and stack

| Area | Choice |
|---|---|
| Web | Next.js 16 (App Router, static pages), TypeScript strict, Tailwind 4, pnpm |
| Tree | Own SVG renderer + dagre layout, pointer pan/zoom |
| Data checks | zod schemas + `validate:data` (fails the build) |
| ML (offline) | Python: pandas, transformers, seqeval, optimum; base `asafaya/bert-mini-arabic` |
| ML (browser) | Transformers.js + ONNX Runtime (WASM) in a Web Worker |
| Font | IBM Plex Sans Arabic only (OFL) |
| Tests | Vitest, Playwright (Edge) + axe |
| Hosting / CI | Vercel Hobby (auto-deploy from `main`), GitHub Actions |
| AI assistance | Claude Code and Claude Design (disclosed) |

---

# Technical documentation

## 5. Architecture

- **Static only.** No database, API route, server secret or paid API. Pasted text is processed in the page and never sent anywhere.
- **Corpus:** `fawazahmed0/hadith-api` (7 books), pinned to commit `df57907`, SHA-256 per book in `corpus/MANIFEST.json`. Shipped as a ~17 MB static index (names + postings) and 200-hadith text chunks.
- **Matching:** each pasted name votes for hadiths holding its rarest words; candidates are aligned with a weighted longest-common-subsequence. Classes: *same*, *contains*, *close*. Shorter name forms count 0.8.
- **Narrator linking (own records):** exact alias = 1.0, else Jaro-Winkler; teacher/student context only reorders. States: high (≥ 0.90 and gap ≥ 0.10) · check (0.60–0.90 or close tie, with candidate buttons) · none (< 0.60).
- **Model loading:** waits up to 30 s while downloading, then the rules read that isnad and the model keeps loading; dropped only on error or a 20 s stall. Large files are served `no-store` (fresh browsers refuse a 12 MB HTTP-cache entry) and kept in Cache Storage.

## 6. Data model

`data/hadiths/<id>.json` (route: book, edition, number, volume/page, source URL, full isnad text, chain, quoted grade with author, verification status) and `data/narrators.json` (name, aliases, role, honorific, *tabaqa*, death, Taqrib quote with entry/page, identification kind, verification). The validator rejects any route without a source, unknown narrators, chains not ending at the Prophet ﷺ, and placeholders.

## 7. Measured results

| Item | Result |
|---|---|
| Narrator-name tagger, 300 held-out isnads from 9 unseen books | Rules F1 0.76, exact chain 32 % · **Model F1 0.916, exact chain 71 %** |
| Browser model vs Python int8 | Identical labels on 100 % of 14,789 words |
| ONNX parity vs PyTorch | 99.49 % |
| Explorer: our 18 Bukhari isnads | All find their own hadith in the first 3 results (model not better than rules on this small set; reported as is) |
| Hard cases (unknown narrator, broken chain, shared name, non-isnad, tashkeel, long input…) | 15 / 15, three runs, identical SHA-256 |
| Tests | 142 unit · 46 browser (incl. privacy spy, model-blocked fallback, axe) |
| Accessibility / speed | axe: 0 serious or critical on every page at 390 and 1440 px; Lighthouse performance 95–100 |
| Cost | $0 running cost |

Not yet done: the 5-user timed test (protocol ready in `docs/USER_TEST.md`).

## 8. Quality gates

Before every push: `pnpm lint`, `pnpm test`, `pnpm validate:data`, `pnpm build`. CI also runs the hard cases ×3. Browser tests run locally and against the live site (`BASE_URL`). One command re-runs the numbers: `pnpm eval:all`.

---

# Legal documentation

## 9. Licences and provenance

| Item | Status |
|---|---|
| Code | © 2026 Abdulmalik, **all rights reserved** (owner may open it later) |
| npm and Python dependencies | MIT / Apache-2.0 / BSD / MPL-2.0; full lists in `docs/licenses/` |
| IBM Plex Sans Arabic, Scheherazade New (one sign, U+FD41) | SIL OFL 1.1 |
| **Sanadset 650K** (training data) | ⚠ **No licence stated.** Used for research training; owner decided to publish the derived model; disclosed |
| **`bert-mini-arabic`** (base model) | ⚠ Hugging Face card has no licence field; author's repo shows MIT |
| **`hadith-api` corpus** | ⚠ Origin and licence not stated by the corpus; shown as published, never edited, labelled «يحتاج تحققًا — من مجموعة خارجية» |
| Shamela (shamela.ws), dorar.net | ⚠ No licence found. Only short attributed quotes and links are stored; dorar.net's FAQ says its content is not to be copied |
| Prior project `sanad2` | Disclosed in `docs/BASELINE.md` (tag `challenge-baseline`); only the logo artwork is reused, marked in the files |

Every AI tool, model, dataset, service and package is logged with its licence in `docs/SOURCES_LOG.md` (Terms §9).

## 10. Compliance with the challenge Terms

- **Window:** the repo started empty; the first commit (4 Oct) holds only planning files.
- **Privacy:** no user data anywhere; tests use made-up or sourced text; a Playwright test asserts that no request carries the pasted text.
- **Third-party request:** a hadith page fetches its full text from the jsDelivr CDN (reveals only which hadith was opened); never during analysis.
- **Secrets:** none needed; history scanned, none found.
- **Editors' footnotes** (tahqiq notes) are never copied: classical text only, edition named, page linked.

---

# Islamic and scholarly documentation

## 11. Rules the product enforces

1. **Nothing from memory.** Every hadith, isnad, narrator fact, number and grade is copied from a cited source page; no source → empty field → «لا مصدر بعد».
2. **No grading by Sanad.** A grade appears only as a quote with its author and link. «صحيح / ضعيف / موضوع / متواتر» are never in Sanad's own voice. Inclusion in the Sahih is quoted from Ibn al-Salah (*Muqaddima*, ed. Itr).
3. **Unverified until the human owner verifies.** New data is «يحتاج تحققًا»; changes are logged in `docs/REVIEW.md`.
4. **AI is labelled and humble.** Output is «استخراج آلي — راجِع النتائج»; low confidence shows candidates, never a silent guess; no record → «لا مصدر بعد» (neutral grey, never red: a missing source does not mean a hadith is fabricated).
5. **Shared names are not guessed.** An ambiguous narrator (e.g. «سفيان», «محمد بن جعفر») stays unresolved unless a quoted source settles it.
6. **Fixed sentences everywhere:** the disclaimer «أداة مساعدة بالذكاء الاصطناعي، لا تحكم على الأحاديث ولا تُفتي» (About, footer) and, with every source, «ذِكرُ الحديث في كتابٍ ليس حكمًا عليه. الأحكام تُنقل منسوبةً إلى قائليها.»
7. **Etiquette:** ﷺ after the Prophet's name; the honorific after every companion (enforced by the validator); a route is called «إسناد» (plural «أسانيد»).

## 12. Sources and verification

| Content | Source |
|---|---|
| Bukhari, Muslim texts and numbers | al-Maktaba al-Shamila (Sultaniyya ed.; Abd al-Baqi ed.), page linked |
| Narrator data | *Taqrib al-Tahdhib* (entry and page quoted); cross-checks in *Tahdhib al-Kamal*, *Tuhfat al-Ashraf* |
| Short grades | dorar.net, with the author named |
| Corpus hadiths | `hadith-api` (numbering may differ from printed editions, notably in Muslim; says so on screen) |

**Verification state:** 37 of 37 isnads checked by the owner against Shamela (5 Oct, `docs/REVIEW.md`); 0 of 92 narrator records verified (shown «يحتاج تحققًا»); 44 narrators carry no certain identification.

## 13. Known limits and open items

- No specialist review of a full hadith is recorded yet.
- *Muhammad ibn Hatim* (`muslim-iman-55-n96`) is linked to Ibn Maymun as «قرينة» although Taqrib and *Tahdhib al-Kamal* differ; flagged for a specialist.
- The Taqrib edition (publisher, editor, year) is not yet stated; the page of `muslim-muqaddima-n1-*` is unreliable (shown «غير مذكور»).
- The corpus covers 7 books only and is not a verified edition; the model reads names, it does not understand the text.
- Open licence questions (§9) are disclosed rather than resolved.
- Owner steps remaining: user test, video, slides, portal submission.

---

*Detailed documents:* `docs/SOURCES.md` · `docs/SOURCES_LOG.md` · `docs/REVIEW.md` · `docs/EVALUATION.md` · `docs/HARD_CASES.md` · `docs/REQUIREMENTS.md` · `docs/JUDGES.md` · `docs/COST.md`
