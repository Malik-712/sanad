# PLAN-A — Pages, live link, source documentation

Written Mon 5 Oct 2026, 19:10 Riyadh. Target: everything here done and live before **Tue 6 Oct 20:00**. Hard deadline 23:59.

On approval, this text is saved as `docs/PLAN-A.md` and pushed with Stage 2.

**Owner instruction for Stage 2 (5 Oct):**
- Do Stage 2 now, fast and minimal: only what the later pages need, no extras.
- No stopping for notes. When lint, test, validate:data and build pass: commit, push, run the live check, and send one short note (what is done, live check result).
- Stop only if a check fails or a scholarly fact is missing.
- Do not start Stage 4.

## 0. Scope and fixed rules

**In this plan:**
1. The five pages (Home, hadith tree, narrator, Paste, About) on the real data.
2. A live link that works for judging, 7–22 Oct.
3. The source documentation (`docs/SOURCES.md`) and the tools, models and data log with licences (`docs/SOURCES_LOG.md`).

**Not in this plan:**
- The drawn tree, the common-link analysis and the zod schemas (Session B).
- ML (Session C) and `/parse` analysis (Session D).
- Playwright test suites (Session E).
- The demo video and the slide deck (owner, Session F).
- Anything not listed here.

**Rules for every stage:**
- The design (`design/screens/`) is followed exactly, with only the existing colour tokens: no new colours, no shadows.
- Every Arabic string goes in `lib/copy/ar.ts`.
- Every value shown comes from `data/`. A missing scholarly fact means I stop and ask.
- Badges follow `verification.status`, which only you set. I never call anything "verified". The /parse sample shows only «بيانات توضيحية».
- Anything new (package, font, data source, tool) gets a `docs/SOURCES_LOG.md` row the same day, with its real licence or «unclear» (and I tell you).
- `docs/REVIEW.md` is never staged.

**Every stage ends the same way:**
1. `pnpm lint`, `pnpm test`, `pnpm validate:data` and `pnpm build` pass.
2. Commit, staging files by name.
3. Push to `main`.
4. Run the live check in §3.
5. Send you a short note and wait.

## 1. Status

| Stage | What | State |
| --- | --- | --- |
| 1 | Design notes, companion honorifics | ✅ Done, live (`e100ccc`, `978d489`) |
| 2 | Helpers, data layer, shared UI, header and footer | Next |
| 4 | Home | — |
| 5 | Hadith page | — |
| 6 | Narrator pages | — |
| 7 | Paste page | — |
| 8 | About, not-found, metadata | — |
| 9 | Design and accessibility review, fixes | — |
| 10 | Source documentation and licences | — |
| 11 | Final live-link check and freeze | — |

(Stage 3 is merged into Stage 2. The numbers of the others are unchanged.)

## 2. Stages

### Stage 2 — Helpers, data layer, shared UI, header and footer

**Build:**
- `lib/arabic/count.ts` + test: counts in words, for example «ثمانية أسانيد», «ستة عشر إسنادًا», «مصنِّفان», «الأسانيد الثمانية».
- `lib/arabic/normalize.ts` + test: strips diacritics and tatweel; unifies the alef forms, ى and ة.
- `lib/data/types.ts`: the CLAUDE.md schema, including `honorificAr`.
- `lib/data/load.ts`:
  - reads `data/` at build, wrapped in React `cache()`
  - narrators in a `Map` by id
  - the Home order: niyyah, man-kadhaba, al-din-al-nasiha, la-yuminu, buniya-al-islam
- `lib/data/derive.ts` + test:
  - status of an isnad or narrator
  - compilers and companions of a hadith
  - routes through a narrator
  - the place line («ت عبد الباقي، ج ١، ص ٧٤»)
  - the name with its honorific
- `lib/data/cite.ts` + test: the text that «انسخ التوثيق» copies.
- `lib/search/filter.ts` + test.
- `components/ui/`:
  - `icons.tsx` (the design's SVG paths)
  - `GoldFrame`, `Diamond`, `StatusBadge`, `DemoTag`, `SectionHeading`
  - button styles
  - `Segmented` (client)
- `components/layout/`:
  - `SiteHeader`: mobile below 1024px, desktop from 1024px, with the small logo at 44px and the full logo at 48px
  - `NavLinks` (client, gold underline on the current page)
  - `HeaderSearch` (plain form to `/`)
  - `SiteFooter` (green / about / plain)
  - `SkipLink`
- `app/layout.tsx`: header and skip link.
- `public/brand/sanad-mark-small.svg`.
- All new strings go in `lib/copy/ar.ts`.
- The placeholder home is replaced by a temporary page that uses the new header and footer.
- `docs/BRIEF.md`: the icons line changes from «Lucide» to the design's SVGs, matching CLAUDE.md.

**No new packages.**

**Done when:**
- The four checks pass.
- Unit tests cover every count that occurs in the data (1, 2, 3, 5, 7, 8, 16) and every status rule.
- Header at 390px and 1440px matches the design. Tab shows a gold focus ring on green, the skip link appears on first Tab, and there is no horizontal scroll.
- `grep` finds no Arabic letters in `components/` or `app/` outside `lib/copy/ar.ts`.
- Live check passes.

**Time:** 2–2.5 h.

**Risks:**
- *Arabic number grammar is wrong for some number.* The tests list every form explicitly, and I paste the forms in my note for you to read.
- *Header layout differs between design breakpoints.* I follow TreeDesktop from 1024px and the mobile screens below it, as decided.

### Stage 4 — Home (`/`)

**Build:**
- `app/page.tsx` (server).
- `components/home/HomeSearch` (client, inside `Suspense`, reads `?q`, filters with `useDeferredValue`).
- `HadithCard`.
- The hero:
  - `GoldFrame`, the slogan, the intro line
  - the small tree drawing; the line-drawing animation is turned off under reduced motion
  - a caption with counts from data only
- The search card, the «جرّب» chips (niyyah's title and «يحيى بن سعيد الأنصاري» from data), the Paste link row.
- «أحاديث مختارة»: five cards with the quoted title, «من رواية …» plus the honorific (or a count of companions), the compilers, and «افتح الشجرة: … أسانيد».
- Green footer.

**Done when:**
- The checks pass.
- Matches `Home.dc.html` at 390px; a centred 720px column at 1440px.
- Typing «النية» (any diacritics) or a narrator's name filters the list.
- `?q` is kept; one result plus Enter opens it; no result shows the empty line.
- Every card opens its hadith page.
- Live check passes.

**Time:** 1.5 h.

**Risks:**
- *Search misses obvious matches.* Normalize unit tests use real titles and names from the data.
- *Hydration mismatch from `?q`.* The server renders the full list; the client filters after mount.

### Stage 5 — Hadith page (`/hadith/[id]`)

**Build:**
- `app/hadith/[id]/page.tsx`: 5 static pages, `dynamicParams = false`, Arabic `<title>`.
- The band:
  - «نتائج البحث» back to `/?q=…`
  - the matn in «»
  - the matn source line (book, number, link)
  - «قراءة أخرى» disclosure for `matnVariants`
  - the counts line
- `HadithView` (client):
  - the selected isnad, kept in `?isnad=`
  - mobile tabs «الشجرة / الأسانيد …»
  - the desktop close button and the «اختر من الشجرة» empty state
- `RouteCard`, `TreePlaceholder` (frame, one sentence, `TreeLegend`).
- `RoutePanel`:
  - «الإسناد ١ من …», title, status
  - isnad text, note
  - narrators list with links to their pages
  - الموضع, الحكم المنقول (quoted grade with author and link, Ibn al-Salah inclusion, or the no-grade sentence)
  - the source sentence
  - «افتح الموضع في المصدر»
  - `CopyCitation` (client, «نُسخ التوثيق»)
- The disclaimer line in the panel column.

**Done when:**
- The checks pass.
- All 37 isnads open in the panel, with status, place and grade exactly as in `data/`.
- Matches `Tree.dc.html` (390px) and `TreeDesktop.dc.html` (1440px).
- Tabs work; `?isnad=` opens the right isnad.
- Copy writes the citation.
- Every narrator link returns 200.
- Live check passes.

**Time:** 2.5 h.

**Risks:**
- *Long isnads or notes overflow on mobile.* Long words break, and I check at 390px.
- *The «﵁» glyph inside isnad texts is missing from the font.* I report it; the text itself is not changed.
- *A field is missing in some record (3 isnads have no page).* The place line leaves the part out, never invents it.

### Stage 6 — Narrator pages (`/narrator/[id]`)

**Build:**
- `app/narrator/[id]/page.tsx`: 92 static pages.
- `NarratorPanel` content:
  - role word, name plus honorific, full name
  - الطبقة / الوفاة (or «لم تُنقل»)
  - the Taqrib quote with page, entry number and link, or the no-quote note
  - status
  - identification (نص / قرينة and its note)
  - «يمرّ به … أسانيد» with links to each hadith
- Variants for the Prophet ﷺ and for compilers, as in the panel.
- Green footer.

**Done when:**
- The checks pass.
- The build lists 92 narrator pages.
- A sample of 10 (all roles, with and without Taqrib, the 4 «عنهما» companions) matches `data/` field by field.
- Live check passes.

**Time:** 1–1.5 h.

**Risks:**
- *Narrator records are unverified.* Every one shows «يحتاج تحققًا», which is correct.
- *A record has no tabaqa or death.* «لم تُنقل» is shown, as the design does.

### Stage 7 — Paste page (`/parse`)

**Build:**
- `app/parse/page.tsx`.
- `ParseForm`: the textarea (nothing is sent anywhere), the privacy line, and «حلِّل الإسناد» disabled with «قريبًا».
- `AutoNotice`.
- The sample section tagged «بيانات توضيحية», built from `bukhari-1` in `data/`:
  - `NarratorChip` names without percentages
  - `ChainList` with its transmission words and the dashed «المصنِّف، ولم يُذكر في النص» row
  - `FoundInTree` linking to `/hadith/niyyah?isnad=bukhari-1`
- Plain footer.

**Done when:**
- The checks pass.
- Matches `Paste.dc.html` minus the parts left out on purpose: percentages, the chooser, the meeting-point ring, status badges.
- The button can't be activated.
- The link opens isnad `bukhari-1`.
- Live check passes.

**Time:** 1 h.

**Risk:** *The sample could read as real model output.* The «بيانات توضيحية» tag sits on the section heading, and no confidence numbers are shown.

### Stage 8 — About, not-found, metadata (`/about`)

**Build:**
- `app/about/page.tsx` as in `About.dc.html`:
  - the four steps, the tree key, the three statuses, the AI limits, privacy
  - «كتب الرواية» lists only books in `data/`
  - no death date from the design
  - the editions line comes from your answer to question 1 in §7, or stays «[أضف الطبعات ودور النشر]»
- `app/not-found.tsx` (Arabic).
- `app/opengraph-image.tsx`: logo on green, no text.
- A title and description for each page.

**Done when:**
- The checks pass.
- About matches the design at 390px and 1440px.
- An unknown URL shows the Arabic not-found page with status 404.
- Social preview shows the logo.
- Live check passes.

**Time:** 1 h.

**Risk:** *The OG image fails to build.* I cut it (cut list item 1) and keep the favicon.

### Stage 9 — Review and fixes

**Build:**
- A `web-design-guidelines` review of every page, and the fixes it finds.
- A one-off check script, kept in the scratchpad and not in the repo (Playwright with system Chrome, and axe-core). It covers all routes at 390px and 1440px:
  - screenshots next to the design
  - no horizontal scroll
  - Tab order and focus rings
  - axe with no serious or critical issues
- Each tool used gets its `SOURCES_LOG` row.

**Done when:**
- Session A "Done when" in `docs/IMPLEMENTATION.md` is all true:
  - lint, test and build pass
  - five routes match at 390px and 1440px with no horizontal scroll
  - keyboard and focus work
  - the live URL works and is in `README.md`
  - packages are logged
- I send you the screenshots.

**Time:** 1.5–2 h.

**Risks:**
- *Too many review findings.* I fix accessibility and design mismatches first and list the rest for you.
- *axe flags the gold-on-parchment contrast.* Gold is never text (by design), so I confirm it is only shapes.

### Stage 10 — Source documentation and licences

**Build:**
- **`docs/SOURCES.md`:**
  - every scholarly source: book, author, edition as named in Shamela, Shamela book id, and what we use it for. The books are Bukhari, Muslim, Taqrib, Ibn al-Salah's *Muqaddima*, and the books cited in the route notes and `RESOLUTIONS.md` (*Fath al-Bari*, *Tuhfat al-Ashraf*, *Tahdhib al-Kamal*, *al-Isaba*, *al-Mustakhraj*, al-Albani's *Sahih al-Jami'*).
  - dorar.net, for the short grade quotes and links.
  - how text is copied: word for word, with the `url`, `retrieved` and `method` fields, and no editor footnotes.
  - how it is checked: the owner's review in `docs/REVIEW.md`, `docs/VERIFY-*.md`, `docs/RESOLUTIONS.md`, and the status rules.
  - how grades are quoted (never computed); identification rules (نص / قرينة).
  - open items, and an index of the 37 isnads (hadith → book, number, URL). The index is made once from `data/` with a scratchpad script; I note that it must be remade if the data changes.
- **`docs/SOURCES_LOG.md`:**
  - checks every row against its real licence (§5)
  - turns «check on the font page» into the font's actual licence
  - adds rows for: shields.io (README badges), Playwright and axe-core (Stage 9 checks), the Shamela connector used for the source checks, and the scholarly sources and their sites
  - a short line on how licences were checked
- **`README.md`:** the Status table is updated and `docs/SOURCES.md` is linked.

**Done when:**
- Every source named in `data/` notes or `RESOLUTIONS.md` appears in `SOURCES.md`.
- Every row in `SOURCES_LOG.md` has a licence or «unclear» with a note.
- The index matches `data/` (37 rows, every URL as in the data).
- The checks pass; live check passes.

**Time:** 2–2.5 h.

**Risks:**
- *A licence can't be found.* The row says «unclear», gives the link I read, and I list it for you (§5).
- *An edition detail is missing* (publisher, year). It stays «غير مذكور في بيانات الشاملة» unless you supply it (question 1 in §7).

### Stage 11 — Final live-link check and freeze

**Build:**
- The full check in §3, including a private window.
- An annotated git tag `submission-a` on the commit that is live.
- `docs/PROGRESS.md` updated.
- A one-page judging checklist added to `docs/PLAN-A.md`: what to check and how to roll back (§3).

**Done when:** every item in §3 "Final check" is ticked, with results pasted in my report.

**Time:** 30 min.

**Risk:** *A late push breaks the site during judging.* §3 freeze and rollback.

**Total for stages 2–11: about 13–15 hours of work** (2–2.5 + 1.5 + 2.5 + 1–1.5 + 1 + 1 + 1.5–2 + 2–2.5 + 0.5). From now (Mon 19:10) that ends Tue morning at the earliest. Sessions B–E in the playbook are not in this plan and need time too. The cut list in §6 protects the pages and the live link if we fall behind.

## 3. Live link plan

**The link for judging:** `https://sanad-pi-five.vercel.app`, the production address. The project's settings, read through the Vercel tools:
- `passwordProtection` is off.
- `ssoProtection` (Vercel Authentication) is **on for "all except custom domains"**.
- So the production address is public (HTTP 200 for anyone today), but each deployment's own URL (for example `sanad-mthdamp3k-…vercel.app`) redirects to a Vercel login.
- Judges must only ever get the production address. It goes in `README.md`, the deck, the video and the submission form, and nowhere a deployment URL.

**After every push:**
1. Vercel tools: the newest production deployment is `READY` and built from the commit just pushed.
2. `curl` the production address, with no cookies, for every route built so far: `/`, `/about`, `/parse`, all 5 `/hadith/*` and 3 sample `/narrator/*`. Each returns **200**, has no `www-authenticate` header, and the HTML contains `lang="ar" dir="rtl"` and the page's own Arabic title.
3. Vercel tools: `passwordProtection.enabled` is still `false`, and `domains` still contains `sanad-pi-five.vercel.app`.
4. If any check fails, I stop, tell you, and roll back if needed (below).

**Final check (Stage 11):**
- The steps above for all 100 pages (5 hadith, 92 narrator, 3 others).
- A private browser window, logged out of Vercel and GitHub, at 390px and 1440px: every page opens with no login prompt; search, isnad selection and copy citation work.
- The GitHub repo is public and the README live link opens.
- An unknown URL gives the Arabic 404.

**Freeze and rollback for 7–22 Oct:**
- After `submission-a`, nothing goes to `main` without your yes.
- If a push breaks the site, use Vercel's Instant Rollback to the last good production deployment (Vercel dashboard → Deployments → the last READY one → "Promote" / "Instant Rollback"), then fix on a branch.
- Hobby limits (bandwidth, builds) are far above a judging site of static pages.

## 4. Where each submission requirement is covered

| Requirement (BRIEF / Terms) | Stage | File | How you check it |
| --- | --- | --- | --- |
| Working, complete product | 2–9 | `app/`, `components/`, `lib/` | Open the live link; all five pages work on real data |
| Live demo link working 7–22 Oct | every stage, 11 | `README.md` (link), §3 | Private window on `https://sanad-pi-five.vercel.app`; my curl results in each stage note |
| Public GitHub repo with setup docs | 10 | `README.md` | «Run locally» steps work on a fresh clone |
| Licences | 10 | `LICENSE`, `docs/SOURCES_LOG.md` | Every row has a licence or «unclear» with a note |
| No secrets in the repo | 11 | — | My report shows `git grep` for keys/tokens/passwords returning nothing and no `.env*` tracked |
| Source documentation (which sources, how used, how verified) | 10 | `docs/SOURCES.md` | Every source in `data/` and `RESOLUTIONS.md` is listed; the 37-isnad index matches `data/` |
| Tools, models and data log with licences (Terms §9) | every stage, 10 | `docs/SOURCES_LOG.md` | One row per package, font, tool, service, source |
| Prior project disclosed (Terms §8) | done, owner items open | `docs/BASELINE.md` | Two «OWNER TO CONFIRM» lines remain (question 4) |
| Only work from 4–6 Oct | done | `docs/SOURCES_LOG.md` «Starting version», git history | `git log` starts 4 Oct with planning files only |
| No real user data | all | tests, /parse | Tests use made-up or source data only; /parse sends nothing |
| Demo video ≤ 2 min | **not in Plan A** | — | Owner, Session F |
| Presentation on the official template | **not in Plan A** | — | Owner, Session F |

## 5. Licence plan

| Item | Where I read the licence or terms | What I expect to write |
| --- | --- | --- |
| npm packages (direct and dev) | `pnpm licenses list` (the `license` field), and each package's LICENSE file for any non-standard value | MIT / Apache-2.0 / etc., per package |
| IBM Plex Sans Arabic | `OFL.txt` in the font's folder on github.com/google/fonts, and its Google Fonts page | SIL Open Font License 1.1 |
| Design files and logo (Claude Design, Claude) | Anthropic Consumer Terms (anthropic.com/legal/consumer-terms), section on outputs | The terms' wording on who owns outputs, quoted |
| Claude Code skills | Each skill's LICENSE file (already read: Apache-2.0 for anthropics/skills, MIT for vercel-labs) | As read |
| Playwright, axe-core (Stage 9 checks) | Their LICENSE files on npm / GitHub | Apache-2.0; MPL-2.0 |
| shields.io (README badges) | shields.io and its GitHub repo licence | As read |
| Vercel, GitHub | Their terms of service | Service terms (no licence) |
| dorar.net (short grade quotes + links) | dorar.net terms / FAQ (dorar.net/feedback); recorded 28 Sep: the encyclopedia is for searching on the site, and copying is not allowed | **Likely «unclear»**: we store a two-word attributed quote and a link. Question 2 |
| al-Maktaba al-Shamila (shamela.ws), as the copy we quote from | shamela.ws about/terms pages | «unclear» if no terms page is found; the classical texts are centuries old, and we copy no editor's notes (CLAUDE.md rule 7) |
| Taqrib, Bukhari, Muslim, Muqaddima Ibn al-Salah and the other classical books | The edition as named in Shamela | Classical text, no editorial apparatus copied; edition named. Publisher and year only if you supply them (question 1) |
| Shamela connector (local tool used for source checks) | Its own documentation | «unclear» if none is stated |

**When a licence is unclear:**
- The row says «unclear».
- It gives the exact page I read and what it says, in one line.
- I list it in my stage note.
- Nothing is removed or replaced without your decision.

## 6. What to cut first if we run late

Never cut:
- the five pages rendering on real data
- source links and the fixed sentences
- status badges with words
- the live-link checks
- the `SOURCES_LOG` licences
- lint, test, validate:data and build passing

Cut in this order:
1. The OG image (keep the favicon).
2. The hero line-drawing animation (keep the drawing static).
3. Search extras: `?q` in the URL and Enter-to-open (keep in-place filtering).
4. Narrator page extras: the identification line and the per-hadith list (keep the panel content).
5. The /parse sample section (keep the form, privacy line, disabled button and notice).
6. The 37-row isnad index in `docs/SOURCES.md` (link to `data/hadiths/*.json` instead).
7. The axe run in Stage 9 (keep the manual keyboard and focus check at both widths).

## 7. Open questions for you

1. **Edition details.** Shamela names the editions (Bukhari «ط السلطانية», Muslim «ت عبد الباقي», Taqrib: «المحقق والناشر ورقم الطبعة غير مذكورة في بيانات الشاملة»). Do you want to supply publisher and year for each, for About «الطبعات المعتمدة» and `docs/SOURCES.md`? Or should I write them as named in Shamela, with «غير مذكور» where missing?
2. **dorar.net quotes.** 29 isnads quote «[صحيح]» with its author and a dorar.net link. Dorar's FAQ says its content is not to be copied. Keep the short attributed quote and mark the licence «unclear»? Or write to support@dorar.net? Or quote these rulings from another source?
3. **Monitoring during judging (7–22 Oct).** Who checks the live link, and how often? A daily manual check by you with the §3 list, or would you like me to set one up?
4. **`docs/BASELINE.md`:** still needs the `sanad2` last-version tag and whether any of `data/` or `design/` came from `sanad2`.
