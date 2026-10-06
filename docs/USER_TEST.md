# User test — finding the hadiths of an isnād, by hand vs with Sanad

> **Status: not run yet.** Every result field below is empty. **To be filled in after the test.** No number in this file may be estimated, rounded up or made up (CLAUDE.md, the golden rule).

## 1. What we want to learn

Can a student of hadith find the hadiths that carry a given isnād **faster, and with correct results**, with Sanad than with the means they normally use? This is the judging criterion «Benefit per track success test» and part of «User experience».

## 2. Participants

- **5 people** who can read an Arabic isnād: hadith students, Sharia students, or teachers. Not members of the team.
- Each person agrees to take part and to be timed. Record **no name and no personal data**: participants are P1–P5 (Terms §9, CLAUDE.md rule 8).
- One background question only (see the sheet): how often they search for the hadiths of an isnād.

## 3. Materials

| Item | Where |
| --- | --- |
| Card A, printed: one isnād (Bukhari 2529) | `docs/user-test/card-A.md` |
| Card B, printed: one isnād (Bukhari 8) | `docs/user-test/card-B.md` |
| A phone or laptop with the live site open | https://sanad-pi-five.vercel.app |
| A device with the tools the participant normally uses (e.g. Shamela, dorar.net, a book) | the participant's own |
| A stopwatch, a pen, and one recording sheet (§7) per participant | — |

The cards are generated from `data/` word for word (`pnpm tsx scripts/user-test-handout.ts`).

## 4. Design

Each participant does **one card by hand and the other card with Sanad**; the order and the card are swapped to cancel the learning effect:

| Participant | First task | Second task |
| --- | --- | --- |
| P1 | By hand — Card A | With Sanad — Card B |
| P2 | With Sanad — Card A | By hand — Card B |
| P3 | By hand — Card B | With Sanad — Card A |
| P4 | With Sanad — Card B | By hand — Card A |
| P5 | By hand — Card A | With Sanad — Card B |

**The task (both conditions):** «اذكر ثلاثة أحاديث على الأقل (الكتاب ورقم الحديث) ورد فيها هذا الإسناد نفسه أو ما يقاربه.»
- **By hand:** with any tool the participant normally uses, except Sanad. Done when they name three hadiths (or at 10 minutes).
- **With Sanad:** paste the card's isnād on Home and read the list. Done when they name three hadiths.

**Measures for each task**
1. **Time** in seconds, from «ابدأ» until the third hadith is named (or 10:00).
2. **Hadiths named that are correct:** each named hadith is checked by the moderator afterwards by opening it (in Sanad's page for the hadith, or in the book): do the names of the card's isnād appear there in the same order? Count correct / named.
3. **Errors and hesitations:** what the participant got stuck on, in their words.

After both tasks, three short questions (§7): ease, trust in what the tool found, and what to change.

## 5. Moderator instructions

**Before the session**
1. Print one recording sheet (§7) and both cards. Write the participant code (P1–P5) on the sheet.
2. Open the live site in a private window and wait until the model has loaded (the progress line disappears after the first analysis).
3. Run both cards through Sanad yourself and keep the results aside (answer key); do not show them.

**During the session (about 20 minutes)**
1. Read aloud: «نختبر أداة، لا نختبرك. سنطلب منك مهمتين قصيرتين ونقيس الوقت. فكّر بصوت مسموع إن أردت. يمكنك التوقف متى شئت.»
2. Give the first task (§4 table). Say «ابدأ» and start the stopwatch. Do not help. If asked, say only: «افعل ما تراه مناسبًا».
3. Stop at the third named hadith, or at **10 minutes** («stopped at 10:00»). Write the time and what was named.
4. Same for the second task.
5. Ask the three questions (§7) and write the answers in the participant's words.
6. Thank the participant.

**Rules**
- No hints, no leading questions, no comments on speed.
- Write what happened, including failures. A task not finished is recorded as not finished.
- Do not explain the isnāds on the cards before the test.

## 6. Results

**To be filled in after the test.**

| Participant | Order | Card by hand | Time by hand (s) | Hadiths named / correct (by hand) | Card with Sanad | Time with Sanad (s) | Hadiths named / correct (with Sanad) | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P1 | hand → Sanad | A |  |  | B |  |  |  |
| P2 | Sanad → hand | B |  |  | A |  |  |  |
| P3 | hand → Sanad | B |  |  | A |  |  |  |
| P4 | Sanad → hand | A |  |  | B |  |  |  |
| P5 | hand → Sanad | A |  |  | B |  |  |  |

**Summary — to be filled in after the test.** Compute from the table only; write "n/a" where a task was stopped.

| Measure | By hand | With Sanad |
| --- | --- | --- |
| Median time (s) |  |  |
| Hadiths named that are correct (of those named) |  |  |
| Tasks stopped at 10:00 |  |  |

**Answers to the three questions — to be filled in after the test.**

| Participant | Q1 Ease (1–5) | Q2 Trust in what the tool found (1–5) | Q3 One thing to change |
| --- | --- | --- | --- |
| P1 |  |  |  |
| P2 |  |  |  |
| P3 |  |  |  |
| P4 |  |  |  |
| P5 |  |  |  |

## 7. Recording sheet (one per participant; print)

```
Participant: P__        Date: ____        Device: phone / laptop
Background: How often do you look for the hadiths of an isnad?   [ ] daily  [ ] weekly  [ ] rarely

Task 1 — [ ] by hand  [ ] with Sanad      Card: ____
  Start  __:__   End  __:__   Time (s): ____     [ ] stopped at 10:00
  Hadiths named (book, number): 1) ____________ 2) ____________ 3) ____________
  Checked by the moderator afterwards — correct: __ / __
  Got stuck on: _______________________________________________

Task 2 — [ ] by hand  [ ] with Sanad      Card: ____
  Start  __:__   End  __:__   Time (s): ____     [ ] stopped at 10:00
  Hadiths named (book, number): 1) ____________ 2) ____________ 3) ____________
  Checked by the moderator afterwards — correct: __ / __
  Got stuck on: _______________________________________________

Q1  «ما مدى سهولة الوصول إلى الأحاديث في سند؟» (1 = صعب جدًّا … 5 = سهل جدًّا)      ____
Q2  «إلى أي حد تثق بما وجده سند؟» (1 … 5)                                          ____
Q3  «ما الشيء الواحد الذي تغيّره في سند؟»
    ____________________________________________________________
```

## 8. After the test: one fix

**To be filled in after the test.**

1. Read the «Got stuck on» notes and the Q3 answers. Pick the **one** problem named most often that can be fixed safely.
2. Fix it, run `pnpm lint && pnpm test && pnpm validate:data && pnpm build`, push, and log it here:

| Problem seen (participants) | Change made | Commit | Date |
| --- | --- | --- | --- |
|  |  |  |  |

3. Update the "Benefit" row in `docs/REQUIREMENTS.md` and the numbers slide in `docs/DECK.md` with the summary above, as measured.
