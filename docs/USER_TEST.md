# User test — building an isnad tree by hand vs with Sanad

> **Status: not run yet.** Every result field below is empty. **To be filled in after the test.** No number in this file may be estimated, rounded up or made up (CLAUDE.md, the golden rule).

## 1. What we want to learn

Can a student of hadith get the merged tree of one hadith (who meets whom, where the isnads meet) **faster and more correctly** with Sanad than by hand from the isnad texts? This is the judging criterion «Benefit per track success test» and part of «User experience».

## 2. Participants

- **5 people** who can read an Arabic isnad: hadith students, Sharia students, or teachers. Not members of the team.
- Each person agrees to take part and to be timed. Record **no name and no personal data**: participants are P1–P5 (Terms §9, CLAUDE.md rule 8).
- Ask one background question only (see the template): how often they read isnads.

## 3. Materials

| Item | Where |
| --- | --- |
| Handout A, printed: «بني الإسلام على خمس», 5 isnads | `docs/user-test/handout-buniya-al-islam.md` |
| Handout B, printed: «لا يؤمن أحدكم…», 5 isnads (written in 3 texts: two texts hold two isnads each) | `docs/user-test/handout-la-yuminu.md` |
| Blank A4 paper and a pen | — |
| A phone or laptop with the live site open on Home | https://sanad-pi-five.vercel.app |
| A stopwatch (phone) | — |
| This file, printed, one recording sheet (§7) per participant | — |

The handouts are generated from `data/` word for word (`pnpm tsx scripts/user-test-handout.ts buniya-al-islam la-yuminu`). Both hadiths have 5 isnads in our data.

## 4. Design

Each participant does **one hadith by hand and the other hadith with Sanad**, so nobody builds the same tree twice. Order and hadith are swapped to cancel the learning effect:

| Participant | First task | Second task |
| --- | --- | --- |
| P1 | By hand — Handout A | With Sanad — «لا يؤمن» |
| P2 | With Sanad — «بني الإسلام» | By hand — Handout B |
| P3 | By hand — Handout B | With Sanad — «بني الإسلام» |
| P4 | With Sanad — «لا يؤمن» | By hand — Handout A |
| P5 | By hand — Handout A | With Sanad — «لا يؤمن» |

**The task (both conditions):** «اجمع أسانيد هذا الحديث في شجرة واحدة، وحدِّد الراوي الذي تلتقي عنده أكثر الأسانيد.»
- **By hand:** draw the tree on paper from the handout. Done when the participant says «انتهيت».
- **With Sanad:** from Home, find the hadith, open its tree, and say (or point to) the meeting point. Done when the participant names it.

**Measures for each task**
1. **Time** in seconds, from «ابدأ» to «انتهيت».
2. **Meeting point correct?** yes / no. The answer key is the meeting point drawn on the hadith's page in Sanad (gold diamond ring): https://sanad-pi-five.vercel.app/hadith/buniya-al-islam and https://sanad-pi-five.vercel.app/hadith/la-yuminu. The moderator checks this **before** the session, not in front of the participant.
3. **Isnads placed correctly** (by hand only): how many of the 5 isnads appear in the drawn tree with the right order of narrators, out of 5.
4. **Errors and hesitations:** what the participant got stuck on, in their words.

After both tasks, three short questions (§7): ease, trust in the sources, and what to change.

## 5. Moderator instructions

**Before the session**
1. Print one recording sheet (§7) and both handouts. Write the participant code (P1–P5) on the sheet.
2. Open the live site on Home in a private window. Check it loads.
3. Look up the meeting point of both hadiths on their Sanad pages (answer key, §4). Do not show it.

**During the session (about 15 minutes)**
1. Read the introduction aloud:
   «نختبر أداة، لا نختبرك. سنطلب منك مهمتين قصيرتين ونقيس الوقت. فكّر بصوت مسموع إن أردت. يمكنك التوقف متى شئت.»
2. Give the first task (§4 table). Say «ابدأ» and start the stopwatch. Do not help. If asked, say only: «افعل ما تراه مناسبًا».
3. Stop the stopwatch at «انتهيت». Write the time and the answer. If a task passes **10 minutes**, stop it and write «stopped at 10:00».
4. Same for the second task.
5. Ask the three questions (§7) and write the answers in the participant's words.
6. Thank the participant. Do not keep the paper tree if it has their name on it.

**Rules**
- No hints, no leading questions, no comments on speed.
- Write what happened, including failures. A task not finished is recorded as not finished.
- Do not use the test hadiths in any explanation before the test.

## 6. Results

**To be filled in after the test.**

| Participant | Order | Hadith by hand | Time by hand (s) | Meeting point by hand correct? | Isnads placed by hand (of 5) | Hadith with Sanad | Time with Sanad (s) | Meeting point with Sanad correct? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P1 | hand → Sanad | A |  |  |  | «لا يؤمن» |  |  |  |
| P2 | Sanad → hand | B |  |  |  | «بني الإسلام» |  |  |  |
| P3 | hand → Sanad | B |  |  |  | «بني الإسلام» |  |  |  |
| P4 | Sanad → hand | A |  |  |  | «لا يؤمن» |  |  |  |
| P5 | hand → Sanad | A |  |  |  | «لا يؤمن» |  |  |  |

**Summary — to be filled in after the test.** Compute from the table only; write "n/a" where a task was stopped.

| Measure | By hand | With Sanad |
| --- | --- | --- |
| Median time (s) |  |  |
| Meeting point correct (of 5) |  |  |
| Tasks stopped at 10:00 |  |  |

**Answers to the three questions — to be filled in after the test.**

| Participant | Q1 Ease (1–5) | Q2 Trust in the sources (1–5) | Q3 One thing to change |
| --- | --- | --- | --- |
| P1 |  |  |  |
| P2 |  |  |  |
| P3 |  |  |  |
| P4 |  |  |  |
| P5 |  |  |  |

## 7. Recording sheet (one per participant; print)

```
Participant: P__        Date: ____        Device: phone / laptop
Background: How often do you read an isnad?   [ ] daily  [ ] weekly  [ ] rarely

Task 1 — [ ] by hand  [ ] with Sanad      Hadith: ______________
  Start  __:__   End  __:__   Time (s): ____     [ ] stopped at 10:00
  Meeting point named: ______________________   Correct?  [ ] yes  [ ] no
  By hand only — isnads placed correctly: __ / 5
  Got stuck on: _______________________________________________

Task 2 — [ ] by hand  [ ] with Sanad      Hadith: ______________
  Start  __:__   End  __:__   Time (s): ____     [ ] stopped at 10:00
  Meeting point named: ______________________   Correct?  [ ] yes  [ ] no
  By hand only — isnads placed correctly: __ / 5
  Got stuck on: _______________________________________________

Q1  «ما مدى سهولة الوصول إلى الشجرة في سند؟» (1 = صعب جدًّا … 5 = سهل جدًّا)      ____
Q2  «إلى أي حد تثق بأن كل إسناد في سند منقول من مصدره؟» (1 … 5)                 ____
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
