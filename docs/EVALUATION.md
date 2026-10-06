# Evaluation — narrator extraction

How well Sanad finds narrator names in an isnad, measured on data the systems never saw. Two readers are compared on the same words and the same scoring:

- **Rules** (`lib/parser/ruleParser.ts`): splits the text on transmission words («حدثنا»، «عن»، «قال» …), punctuation, «ح» and honorifics. This is the reader the live site runs.
- **Model**: `asafaya/bert-mini-arabic` fine-tuned to tag each word as the start of a name, inside a name, or neither (`B-NAR` / `I-NAR` / `O`). **Trained and measured, not shipped**: the licence of the training data (Sanadset 650K) is unclear, and the owner decided on 6 Oct to use it for research and evaluation only (`docs/SOURCES_LOG.md`).

All numbers below are as measured on 6 Oct 2026, from one run with seed 42. Nothing is rounded up and no run was dropped.

## Method

| | |
| --- | --- |
| Data | Sanadset 650K (Mendeley Data, DOI 10.17632/5xth87zwb5). 650,986 rows; 491,428 have a tagged isnad. Narrators are tagged in the text itself (`<NAR> … </NAR>`), so the labels come straight from the dataset, with no fuzzy alignment. |
| Input per record | The text up to the end of the isnad, plus the first 8 words of the matn (all `O`), so that a reader must also find where the isnad stops. `<IDF>` words inside a name («يعني») stay inside the name. |
| Words | `lib/parser/tokenize.ts` and its Python twin `ml/tokenize_words.py`: split on spaces, each punctuation mark is a word, every word normalised as in `lib/arabic/normalize.ts`. A shared fixture checks that both give the same output (Vitest and pytest). |
| Kept | Records with exactly one tagged isnad and balanced tags: 85.2 % of the parsed rows (123,093 of 144,410). |
| Split | **By book**: no book appears in two splits. Test: 300 isnads drawn from 9 held-out books. Dev: 79 books (22,517 isnads; a fixed sample of 2,000 is used for early stopping). Train: 831 books, 96,926 isnads. Exact duplicate isnads across splits: 0 (630 removed from train). |
| Test books | أحاديث عن شيوخ أبي محمد البعلبكي · إثبات صفة العلو لابن قدامة · الرد على الجهمية لابن منده · الضعفاء الكبير للعقيلي · الفرج بعد الشدة لابن أبي الدنيا · النزول للدارقطني · جزء الألف دينار للقطيعي · عوالي مالك بن أنس رواية الكندي · معجم أبي يعلى الموصلي |
| Scores | Entity precision / recall / F1 with `seqeval` (strict IOB2: a name counts only with exactly the right first and last word). **Exact chain**: every name found, with the right boundaries, in order, and nothing extra. |
| Rules tuning | The word lists were adjusted by looking at **dev** errors only (dev F1 0.797 → 0.800). The test set was scored once, at the end. |

## (a) 300 held-out isnads

| Reader | Precision | Recall | F1 | Exact chain |
| --- | --- | --- | --- | --- |
| Rules (baseline, frozen before the test run) | 0.802 | 0.716 | 0.756 | 32.3 % (97 / 300) |
| Rules (live version, changed after the test run †) | 0.816 | 0.706 | 0.757 | 33.3 % (100 / 300) |
| Model, PyTorch (fp32) | 0.893 | 0.942 | 0.916 | 71.0 % (213 / 300) |
| Model, ONNX int8 (exported) | 0.892 | 0.941 | 0.916 | 71.7 % (215 / 300) |

Values are rounded to three decimals (full values in `ml/preds/test-scores.json`).

The model finds clearly more names, with fewer extra ones, and gets more than twice as many whole chains right. Per ADR-5.1 it would be the default engine; it is not shipped only because of the data licence.

† After the test run, building `/parse` on the routes in `data/` showed gaps in the rules, fixed with general rules: words after a name and its honorific («عمر ﵁ على المنبر») are not a name; «يعني …» and «(وهو ابن …)» belong to the name before; the person after «يحدّث» is a listener; «قال: قال فلان» continues the isnad; «فلان وابن فلان» are two names side by side. On dev these moved F1 0.800 → 0.804 and exact chain 43.3 % → 39.8 %. The test set was then scored again; both rows are kept so the change is visible.

**Export check.** ONNX int8 vs PyTorch labels agree on 99.49 % of words (2,366 words in 50 test isnads). Size on disk: 12.24 MB (`config.json`, tokenizer files, `onnx/model_quantized.onnx`). Kept locally in `ml/out/sanad-ner-onnx/` (git-ignored).

## (b) Real routes in `data/`

<!-- e2e:start -->
All 37 routes in `data/` (5 hadiths), each pasted exactly as stored in `isnadAr`. Gold: the route's own chain, checked by the owner, without the compiler and the Prophet ﷺ (193 names in all). Linking uses the 92 narrator records in `data/narrators.json`; this is the data the linker was built for, so these numbers say how the whole flow behaves on our own routes, not how it generalises.

| Reader → linker | Right number of names | Names linked to the right record, no help | Chain found in the right tree, no help | Chain found after choosing among the offered candidates |
| --- | --- | --- | --- | --- |
| Rules (live) | 33 / 37 | 88.1 % | 27 / 37 (73.0 %) | 28 / 37 (75.7 %) |
| Model, ONNX int8 (not shipped) | 24 / 37 | 59.6 % | 16 / 37 (43.2 %) | 16 / 37 (43.2 %) |

«No help» counts a name as decided when its link is confident, or when it needs checking but a known teacher or student next to it makes one candidate likely (the pre-selected choice on `/parse`). «After choosing» assumes the user picks the right candidate wherever `/parse` offers a choice.

Generated by `pnpm tsx scripts/eval-e2e.ts` on 2026-10-06.
<!-- e2e:end -->

**Read (b) with care.** The rules were adjusted while looking at these 37 routes (see † above), and the context bonus uses teacher–student pairs taken from these same chains, so the rules row is optimistic. The model was not adjusted on them, and it does not mark «فلان وابن فلان» as parallel names. The model also learned Sanadset's choices of where a name ends (it often keeps a nisba or kunya that our aliases do not list), which costs it links here. So (b) is not a fair comparison of the two readers; (a) is. Of the 10 routes the rules miss without help, most are story-style isnads («قلت لسهيل …», «دخلت على …») or two isnads written in one text.

## (d) The explorer: finding the hadiths of a pasted isnād

What the product does: the reader (the model in the browser, the rules as fallback) finds the narrator names in a pasted isnād; the explorer aligns them, in order, with the names read from the isnād of every hadith in the corpus (fawazahmed0/hadith-api, pinned commit `df57907`, 36,390 hadiths in 7 books, also read by the model), and ranks the hadiths: **same** isnād, an isnād that **contains** it, or a **close** one. It only ever lists hadiths that exist in the corpus.

<!-- explorer:start -->
All 37 verified isnāds of `data/` pasted exactly as stored, against the corpus of 36,390 hadiths. Both readers go through the same matching; the model row is the reader the site uses (the same code as in the browser, run in Node). Ground truth: a Bukhari isnād should find the corpus hadith with the same Bukhari number (the numbering agrees for Bukhari; for Muslim it does not, so Muslim rows count only whether anything is listed).

| Reader | Isnāds with at least one hadith listed | Median hadiths listed | Own Bukhari hadith in the list | … in the first 3 | … as «same» or «contains» (not only «close») | Median rank of own hadith |
| --- | --- | --- | --- | --- | --- | --- |
| Rules | 37 / 37 | 19 | 18 / 18 | 18 / 18 | 18 / 18 | 1 |
| Model (shipped) | 37 / 37 | 15 | 18 / 18 | 18 / 18 | 17 / 18 | 1 |

The set is small (18 Bukhari isnāds) and the rules were tuned while looking at these routes, so read the rules row as optimistic.

Generated by `pnpm eval:explorer` on 2026-10-06.
<!-- explorer:end -->

**The tagger in the browser equals the Python one.** `pnpm check:tagger` runs the Transformers.js code (the same file the browser worker uses) on the 300 held-out test isnāds and compares with the Python int8 labels: **100.00 % agreement on 14,789 words**, about 2 ms per isnād in Node. In Edge, from a click to the full result takes about 1.4 s once the model is cached.

**Limits.** The corpus has no narrator ids, so a match is «by the name as written»: two narrators with one name are not told apart. The corpus's own isnāds are read by the same model (F1 0.916 on Sanadset's test set), so some are read wrongly and can be missed or listed as «close». The corpus text origin and licence are not stated; its numbering for Muslim differs from the printed editions, so Muslim hadiths are matched without a number check. Imported hadiths are never shown as verified.

## (c) Site quality: Lighthouse, accessibility, browser tests

### Lighthouse (live site, after the explorer)

<!-- lighthouse:start -->
Lighthouse 12.8.2 in headless Microsoft Edge on https://sanad-pi-five.vercel.app, **3 runs per page and form factor; the median is reported** (`bash scripts/lighthouse.sh https://sanad-pi-five.vercel.app 3`, then `node scripts/lighthouse-table.mjs --write`). Measured on 2026-10-06, after the explorer was deployed. Mobile uses Lighthouse's default throttled profile; desktop uses `--preset=desktop`. Page weight is what loads before the visitor does anything: the 12 MB model and the 14 MB wasm download only when the visitor first uses the paste box.

| Page | Form factor | Performance | Accessibility | Best practices | SEO | Performance, 3 runs | Page weight | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | mobile | 87 | 100 | 100 | 100 | 80 / 97 / 87 | 470 KB | 3.5 s | 189 ms | 0.000 |
| `/` | desktop | 100 | 100 | 100 | 100 | 100 / 100 / 100 | 470 KB | 0.7 s | 0 ms | 0.000 |
| `/c/bukhari/1` | mobile | 95 | 100 | 100 | 100 | 92 / 95 / 95 | 486 KB | 2.8 s | 93 ms | 0.001 |
| `/c/bukhari/1` | desktop | 100 | 100 | 100 | 100 | 100 / 100 / 100 | 486 KB | 0.7 s | 0 ms | 0.000 |
| `/hadith/niyyah` | mobile | 84 | 100 | 100 | 100 | 84 / 88 / 62 | 642 KB | 3.0 s | 401 ms | 0.000 |
| `/hadith/niyyah` | desktop | 92 | 100 | 100 | 100 | 92 / 94 / 63 | 646 KB | 0.7 s | 217 ms | 0.000 |
| `/narrator/umar-ibn-al-khattab` | mobile | 95 | 100 | 100 | 100 | 71 / 95 / 98 | 469 KB | 2.1 s | 113 ms | 0.000 |
| `/narrator/umar-ibn-al-khattab` | desktop | 100 | 100 | 100 | 100 | 100 / 100 / 100 | 469 KB | 0.6 s | 13 ms | 0.000 |
| `/sources` | mobile | 69 | 100 | 100 | 100 | 69 / 69 / 80 | 464 KB | 2.4 s | 925 ms | 0.118 |
| `/sources` | desktop | 99 | 100 | 100 | 100 | 99 / 98 / 100 | 464 KB | 0.7 s | 78 ms | 0.000 |
| `/about` | mobile | 93 | 100 | 100 | 100 | 97 / 85 / 93 | 462 KB | 2.6 s | 235 ms | 0.000 |
| `/about` | desktop | 100 | 100 | 100 | 100 | 81 / 100 / 100 | 462 KB | 0.6 s | 59 ms | 0.000 |
<!-- lighthouse:end -->

**What was found and fixed on 6 Oct (measured on the live site before each fix, 3 runs):**

| Finding | Before | Fix | Result |
| --- | --- | --- | --- |
| Hadith page `/c/bukhari/1`: its text waited for a 2.3 MB name index, then for the full text from a CDN | mobile Performance 65, LCP 7.4 s, CLS 0.22; desktop 76 | The isnād comes from one small file and is shown first; names are in that file; the full text is the last section | mobile Performance 95, LCP 2.8 s, CLS 0.001; desktop 100 (median of 3, live, after the loading-block fix) |
| Hadith page, second try: names still loaded the big index in the background | mobile 59 (TBT 987 ms), desktop CLS 0.625 | Names moved into the 200-hadith files; the index is no longer loaded on this page | see the table above |
| Home: the 12 MB model started downloading 0.4 s after load, inside Lighthouse's measuring window | mobile runs 96 / 97 / 79; page weight 11.5 MB | The model starts when the visitor first focuses the paste box or presses a button | see the table above |
| No `robots.txt` (Lighthouse SEO «robots.txt is not valid») | desktop Home SEO 92 in 2 of 3 runs | `public/robots.txt` | SEO 100 |
| Earlier on 6 Oct: desktop hadith page layout shift | CLS 0.115 | Latin font preloaded again | CLS 0.000 |

### Accessibility and browser tests

| Check | Result | How |
| --- | --- | --- |
| axe-core (WCAG 2.0/2.1 A and AA rules) on `/`, `/hadith/niyyah`, `/hadith/niyyah?isnad=bukhari-1`, `/narrator/umar-ibn-al-khattab`, `/parse` (before and after a result), `/about` | **0 serious or critical issues** on every page, at 390 px and 1440 px | `@axe-core/playwright` in `tests/e2e/` |
| Keyboard only | skip link first; search, open a hadith, select an isnad with Tab and Enter; the focused control has a visible outline | `tests/e2e/site.spec.ts` |
| Reduced motion | all animation is cut to 0.01 ms under `prefers-reduced-motion` (`app/globals.css`); axe runs with reduced motion on | `tests/e2e/` |
| Contrast | part of the axe rules above (`color-contrast`) | — |
| Playwright end to end (Edge, 390 px and 1440 px) | **46 / 46 pass** locally, and on the live site run one test at a time: the explorer (the model reads the sample, the «سفيان» chooser, the hadiths found and the graph, filters, a hadith page, nothing found → nothing invented, **fallback with the model blocked**, **privacy: every request goes to the site's own origin**, input rules, Ctrl+Enter); the verified hadith pages, tree, narrator page; `/sources`; the three-link header; narrator panel and page; About and 404; `/parse` flow, chooser, input messages, Ctrl+Enter; privacy (no request carries the pasted text); axe | `pnpm test:e2e`; on the live site `BASE_URL=https://sanad-pi-five.vercel.app pnpm test:e2e` |

## Training

| | |
| --- | --- |
| Base | `asafaya/bert-mini-arabic` (4 layers, hidden size 256) |
| Task | Token classification, labels `O`, `B-NAR`, `I-NAR`; label on the first sub-word of each word, the rest ignored |
| Settings | learning rate 5e-5, batch 32, at most 3 epochs, max length 83 sub-words (95th percentile of train), early stopping on dev F1 with patience 1, seed 42 |
| Hardware | Laptop CPU, Intel Core Ultra 7 155H (16 threads), no GPU |
| Time | 27.9 min. Epoch 1: dev F1 0.911 (13.0 min). Epoch 2: dev F1 0.908 → stopped; the epoch 1 weights are kept |
| Loss | 0.235 (step 200) → 0.111 (step 1,200) → 0.085 (step 3,200) → 0.080 (step 5,200) |
| Log | `ml/out/train_log.json` (git-ignored; summarised here) |

## Ten errors of the exported model (test set)

The first ten test isnads where the model's names differ from the gold tags, in file order (not chosen):

| # | Book | What happened | Why |
| --- | --- | --- | --- |
| 1 | إثبات صفة العلو | Model tags 11 names; gold tags 2 | **Gold is incomplete**: Sanadset left the first nine narrators of this long isnad untagged. Model also split «أبو بكر عبد الله» wrongly after a repeated «وأخبرنا». |
| 2 | عوالي مالك | Two names too long («… القزاز البغدادي», «… عبد الرحمن - يعني») | Nisba and a following «يعني» joined to the name; gold stops before them. |
| 3 | الضعفاء الكبير | «عمرو بن عبد الجبار العبدي ابن أخي عبيدة بن حسان» as one name | A description of kinship after the name; gold cuts after «العبدي». |
| 4 | جزء الألف دينار | Missed «عبد الله» at the start | The first name right after «حدثنا» at the very start of the text. |
| 5 | الضعفاء الكبير | Extra «بلال» and «أبي بردة» | They are in a story («دخلت على بلال بن أبي بردة») between links, not in the chain; gold leaves them out. |
| 6 | النزول | Extra «القاضي» | A title repeated before the name («حدثنا القاضي حدثنا القاضي أبو عبد الله …»). |
| 7 | الضعفاء الكبير | «سعيد بن أبي سعيد المقبري» vs gold «سعيد بن أبي سعيد» | Nisba boundary; gold stops before «المقبري». |
| 8 | الضعفاء الكبير | Several broken pieces («عبد», «بن الخطاب») | **Gold is incomplete** (only «ابن عباس» tagged) and the isnad is written twice; the model also breaks names in the repeated part. |
| 9 | أحاديث عن شيوخ البعلبكي | Title words kept («الإمام فخر الدين …»), one name split in two | Long later-period isnad with titles, dates and «إجازة» between names. |
| 10 | الضعفاء الكبير | Extra «علي» twice | **Gold is incomplete** (only «ابن عباس» tagged) in a repeated isnad; the model's «علي» is cut from «علي بن مالك». |

## Limits

- **The gold is Sanadset's own tags.** Some records are only partly tagged (errors 1, 8 and 10 above), so both readers lose points they may not deserve. We did not correct the gold.
- The test set is 9 books. Several are late collections with long chains and titles, which are harder than the Sahihayn style of our five hadiths. Per-book scores vary.
- The model learns Sanadset's boundary choices (where a name ends, whether nisbas and kunyas are included). Users and other books may cut names differently.
- The rule parser cannot tell a narrator from a person named inside a story, and it stops at «قال:» when the next words are not a transmission word.
- Neither reader decides who a narrator is. That is the linker's job, with its own confidence states (`lib/linker/linker.ts`), and every result is labelled «استخراج آلي».

## Reproduce

See `ml/README.md`.
