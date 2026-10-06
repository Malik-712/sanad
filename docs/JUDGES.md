# For the judges — دليل المحكِّمين

Live site · الموقع: **https://sanad-pi-five.vercel.app** (works on a phone and a desktop · يعمل على الجوال والحاسوب)

Sanad is **one tool**: paste an isnād, and an AI model (running in your browser) reads it; Sanad then finds every hadith with the same or a close isnād and draws the shared chain. · أداة واحدة: الصق إسنادًا، فيقرؤه نموذج ذكاء اصطناعي في متصفحك، ثم نجد كل حديث ورد فيه هذا الإسناد أو ما يقاربه ونرسم السلسلة المشتركة.

## Five things to try (about 5 minutes) · خمس تجارب

| # | Try this | What you should see |
| --- | --- | --- |
| 1 | **The explorer.** On Home press «جرّب مثالًا». | Seven names with match tags and the line «قرأ النموذجُ الأسماء في متصفحك»; a summary «وجدنا … حديثًا: … بالإسناد نفسه، … بإسناد قريب»; the **shared-chain graph**; and the ranked list, starting with «صحيح البخاري، حديث ١ — الإسناد نفسه — ٦ من ٦ رواة», names highlighted. |
| 2 | **The «سفيان» choice.** In the box «من «سفيان» هنا؟» choose «سفيان الثوري». | The chain changes; the page says the isnād is no longer one of our verified ones. The AI never decides alone: it shows candidates and the reason for the likely one. |
| 3 | **Narrow the results.** In «كل الأحاديث المطابقة», press a book (e.g. «صحيح مسلم»), then «الإسناد نفسه», then type a name in the narrowing box. Click a hadith or a narrator in the graph. | The list follows each filter and the graph selection; counts are shown on every button. |
| 4 | **Check the evidence.** Open any hadith with «افتح الحديث». | Its text from the corpus, the status «يحتاج تحققًا — من مجموعة خارجية», the pinned corpus version, a link to the exact source file, and three steps to verify it. Then open «الكتب والمصادر» to see the corpus, the model, their licences (unclear, stated openly) and what the owner has checked. |
| 5 | **Uncertainty and privacy.** Paste a made-up isnād, e.g. «حدثنا قزمان بن طرخان، عن هلال بن سمعان، عن ترتان بن مرتان». Keep the Network tab open. Then try with the model blocked (DevTools → Network → block `*/models/*`) and press «جرّب مثالًا». | «لم نجد في المجموعة حديثًا بهذا الإسناد» — nothing is invented. Every request goes to the site's own files; none carries your text. With the model blocked the page says «تعمل الآن الطريقة البديلة (القواعد)» and still works. |

## One command for the numbers · أمر واحد للأرقام

Needs Node 20.9+ and pnpm. No internet access, keys or GPU are needed after `pnpm install`.

```bash
git clone https://github.com/Malik-712/sanad.git && cd sanad
pnpm install
pnpm eval:all
pnpm eval:explorer
pnpm check:tagger
```

| Command | What it checks | Result on 6 Oct 2026 |
| --- | --- | --- |
| `pnpm eval:all` (`pnpm test`) | Unit tests: explorer matching and graph, parser, linker, normaliser, data rules | all pass (the count is printed) |
| `pnpm eval:all` (`hardcases`) | 15 hard cases, three runs, SHA-256 of each run | 15 / 15 pass; 3 identical hashes (`docs/HARD_CASES.md`) |
| `pnpm eval:explorer` | The 37 verified isnāds pasted into the explorer, rules vs the shipped model | all 18 Bukhari isnāds find their own hadith in the first 3 results (`docs/EVALUATION.md` d) |
| `pnpm check:tagger` | The browser tagger code vs the Python labels on 300 held-out isnāds | 100.00 % agreement on 14,789 words |

More checks:

```bash
pnpm build && pnpm test:e2e                               # browser tests at 390 and 1440 px, incl. axe, the fallback and the privacy test
BASE_URL=https://sanad-pi-five.vercel.app pnpm test:e2e   # the same on the live site
```

The model's accuracy on held-out data (F1 0.916 vs the rules' 0.757 on 300 isnāds from 9 books) needs the Sanadset download and Python; the steps are in `ml/README.md`, the results in `docs/EVALUATION.md`.

## Where to read more

`docs/REQUIREMENTS.md` (each requirement → evidence) · `docs/SOURCES.md` · `docs/EVALUATION.md` · `docs/HARD_CASES.md` · `docs/COST.md` · `docs/BASELINE.md` (the earlier project, disclosed)
