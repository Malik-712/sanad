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
| Rules (baseline, live) | 0.802 | 0.716 | 0.756 | 32.3 % (97 / 300) |
| Model, PyTorch (fp32) | 0.893 | 0.942 | 0.916 | 71.0 % (213 / 300) |
| Model, ONNX int8 (exported) | 0.892 | 0.941 | 0.916 | 71.7 % (215 / 300) |

Values are rounded to three decimals (full values in `ml/preds/test-scores.json`). The model finds clearly more names, with fewer extra ones, and gets more than twice as many whole chains right. Per ADR-5.1 it would be the default engine; it is not shipped only because of the data licence.

**Export check.** ONNX int8 vs PyTorch labels agree on 99.49 % of words (2,366 words in 50 test isnads). Size on disk: 12.24 MB (`config.json`, tokenizer files, `onnx/model_quantized.onnx`). Kept locally in `ml/out/sanad-ner-onnx/` (git-ignored).

## (b) Real routes in `data/`

<!-- e2e:start -->
_Filled by `pnpm tsx scripts/eval-e2e.ts`._
<!-- e2e:end -->

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
