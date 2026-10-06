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

## (c) Site quality: Lighthouse, accessibility, browser tests

### Lighthouse (live site, 6 Oct 2026)

Lighthouse 12.8.2 in headless Microsoft Edge, on https://sanad-pi-five.vercel.app, **3 runs per page and form factor; the median is reported** (`bash scripts/lighthouse.sh https://sanad-pi-five.vercel.app 3`). Each page was requested once before measuring, so the CDN cache was warm, as for any visitor after the first. Mobile uses Lighthouse's default throttled mobile profile; desktop uses `--preset=desktop`.

| Page | Form factor | Performance | Accessibility | Best practices | SEO | Performance, 3 runs | Page weight | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | mobile | 98 | 100 | 100 | 100 | 98 / 98 / 92 | 570 KB | 2.3 s | 35 ms | 0.000 |
| `/` | desktop | 100 | 100 | 100 | 100 | 98 / 100 / 100 | 639 KB | 0.7 s | 0 ms | 0.000 |
| `/hadith/niyyah` | mobile | 98 | 100 | 100 | 100 | 99 / 98 / 95 | 718 KB | 2.3 s | 67 ms | 0.018 |
| `/hadith/niyyah` | desktop | 96 | 100 | 100 | 100 | 95 / 97 / 96 | 748 KB | 0.7 s | 0 ms | 0.115 |
| `/narrator/umar-ibn-al-khattab` | mobile | 99 | 100 | 100 | 100 | 100 / 99 / 99 | 510 KB | 1.9 s | 57 ms | 0.048 |
| `/narrator/umar-ibn-al-khattab` | desktop | 100 | 100 | 100 | 100 | 100 / 100 / 100 | 510 KB | 0.7 s | 0 ms | 0.000 |
| `/parse` | mobile | 98 | 100 | 100 | 100 | 99 / 98 / 95 | 547 KB | 2.3 s | 55 ms | 0.001 |
| `/parse` | desktop | 100 | 100 | 100 | 100 | 100 / 100 / 100 | 547 KB | 0.6 s | 0 ms | 0.000 |
| `/about` | mobile | 98 | 100 | 100 | 100 | 98 / 98 / 100 | 540 KB | 2.4 s | 28 ms | 0.020 |
| `/about` | desktop | 100 | 100 | 100 | 100 | 100 / 100 / 99 | 540 KB | 0.6 s | 0 ms | 0.000 |

Page weight, LCP, TBT and CLS are medians of the 3 runs.

**Before the fix.** A first single run, earlier the same day, gave `/` on mobile a Performance score of **81** (LCP 3.3 s, TBT 350 ms); all other pages and categories were 94–100. The page preloaded 8 font files (4 weights × Arabic and Latin subsets). Since commit `29fbae6` only the Arabic subset is preloaded; the Latin subset loads only on pages that show Latin text. The table above is after the fix.

**Known limit.** Desktop `/hadith/niyyah` has a cumulative layout shift of 0.115, above Lighthouse's 0.1 mark for «good», although its score is 96.

### Accessibility and browser tests

| Check | Result | How |
| --- | --- | --- |
| axe-core (WCAG 2.0/2.1 A and AA rules) on `/`, `/hadith/niyyah`, `/hadith/niyyah?isnad=bukhari-1`, `/narrator/umar-ibn-al-khattab`, `/parse` (before and after a result), `/about` | **0 serious or critical issues** on every page, at 390 px and 1440 px | `@axe-core/playwright` in `tests/e2e/` |
| Keyboard only | skip link first; search, open a hadith, select an isnad with Tab and Enter; the focused control has a visible outline | `tests/e2e/site.spec.ts` |
| Reduced motion | all animation is cut to 0.01 ms under `prefers-reduced-motion` (`app/globals.css`); axe runs with reduced motion on | `tests/e2e/` |
| Contrast | part of the axe rules above (`color-contrast`) | — |
| Playwright end to end (Edge, 390 px and 1440 px) | **35 / 35 pass**: Home → search → tree → isnad → source link; narrator panel and page; About and 404; `/parse` flow, chooser, input messages, Ctrl+Enter; privacy (no request carries the pasted text); axe | `pnpm test:e2e`; on the live site `BASE_URL=https://sanad-pi-five.vercel.app pnpm test:e2e` |

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
