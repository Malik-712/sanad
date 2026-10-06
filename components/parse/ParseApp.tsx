"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChainList, type ChainRow } from "@/components/hadith/ChainList";
import { AutoNotice } from "@/components/parse/AutoNotice";
import { MatchTag, NarratorChip } from "@/components/parse/NarratorChip";
import { NarratorChooser } from "@/components/parse/NarratorChooser";
import { ParseForm } from "@/components/parse/ParseForm";
import { ExplorerResults } from "@/components/explorer/ExplorerResults";
import { buttonOnGreen } from "@/components/ui/buttons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { countNoun, numberWord } from "@/lib/arabic/count";
import { toArabicIndic } from "@/lib/arabic/digits";
import { ar } from "@/lib/copy/ar";
import { foldName } from "@/lib/corpus/names";
import { analyzeParsed, checkInput, decidedIds, findRoute, readings, type Analysis, type InputProblem } from "@/lib/linker/analyze";
import { createReader, type ReaderState } from "@/lib/ml/client";
import { HIGH, type LinkResult } from "@/lib/linker/linker";
import type { ParseData } from "@/lib/linker/parseData";

type Ok = Extract<Analysis, { ok: true }>;

const pct = (score: number) => ar.parse.percent(toArabicIndic(Math.round(score * 100)));
const names = (n: number) => (n >= 1 && n <= 99 ? countNoun(n, "name") : `${toArabicIndic(n)} ${ar.nouns.name.plural}`);
const total = (n: number) => (n >= 3 && n <= 99 ? numberWord(n, "gen") : countNoun(n, "isnad", "gen"));

/** The match tag on a chip: confident, needs checking (with %, or plain when two records tie), no record, or chosen. */
function tagFor(link: LinkResult, chosen: boolean, firstHigh: boolean) {
  if (chosen) return <MatchTag tone="chosen">{ar.parse.chosen}</MatchTag>;
  if (link.state === "high") {
    const score = pct(link.best?.score ?? 1);
    return firstHigh ? (
      <MatchTag tone="ok">{`${ar.parse.matchHigh} ${score}`}</MatchTag>
    ) : (
      <MatchTag tone="ok" hidden={ar.parse.matchHigh}>
        {score}
      </MatchTag>
    );
  }
  if (link.state === "check") {
    const top = link.candidates[0]?.score ?? 0;
    return top >= HIGH ? (
      <MatchTag tone="check">{ar.status.check}</MatchTag>
    ) : (
      <MatchTag tone="check">{`${ar.parse.matchMid} ${pct(top)}`}</MatchTag>
    );
  }
  return <MatchTag tone="none">{ar.status.none}</MatchTag>;
}

export function ParseApp({ data }: { data: ParseData }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<Ok | null>(null);
  const [problem, setProblem] = useState<InputProblem | null>(null);
  const [choices, setChoices] = useState<Record<number, string>>({});
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [reading, setReading] = useState(false);
  // The model reads the names in a Web Worker; the rule parser takes over by itself if it cannot (lib/ml/client.ts).
  const reader = useMemo(() => createReader(), []);
  const [readerState, setReaderState] = useState<ReaderState>({ status: "idle", progress: 0 });
  useEffect(() => {
    const off = reader.subscribe(setReaderState);
    // Start after the first paint, so the page is usable at once.
    const t = setTimeout(() => reader.start(), 400);
    return () => {
      clearTimeout(t);
      off();
    };
  }, [reader]);

  const run = async (value: string) => {
    setChoices({});
    const early = checkInput(value);
    if (early) {
      setProblem(early);
      setResult(null);
      inputRef.current?.focus();
      return;
    }
    setReading(true);
    const parse = await reader.read(value);
    setReading(false);
    const a = analyzeParsed(value, parse, data.index);
    if (!a.ok) {
      setProblem(a.problem);
      setResult(null);
      inputRef.current?.focus();
      return;
    }
    setProblem(null);
    setResult(a);
    // Move to the results once they are drawn, so keyboard and screen-reader users land on them.
    requestAnimationFrame(() => resultsRef.current?.focus({ preventScroll: false }));
  };

  const view = useMemo(() => {
    if (!result) return null;
    const { parse, links } = result;
    const ids = decidedIds(links, choices);
    const found = findRoute(parse, links, data.routes, choices);
    const reading = found?.reading ?? readings(parse, ids)[0] ?? [];
    const meeting = found ? data.commonLinks[found.route.hadithId] : null;

    // Chain rows from the Prophet ﷺ down to the compiler's teacher. The word under a name is the one written before it.
    const rows: ChainRow[] = [];
    const links_: string[] = [];
    if (parse.prophet) {
      rows.push({ id: "prophet", name: ar.parse.prophet, role: "prophet" });
      links_.push(parse.prophetSigha);
    }
    for (const i of [...reading].reverse()) {
      const id = ids[i];
      const person = id ? data.people[id] : undefined;
      const link = links[i]!;
      const confirmed = Boolean(choices[i]) || link.state === "high";
      const status = confirmed ? undefined : link.state === "none" ? "none" : "check";
      rows.push({
        id: `${i}`,
        name: confirmed && person ? person.name : parse.names[i]!.text,
        role: confirmed && person ? person.role : "narrator",
        ...(confirmed && id ? { href: `/narrator/${id}` } : {}),
        ...(status ? { status, note: status === "none" ? ar.status.none : ar.status.check } : {}),
        ...(id && id === meeting ? { meeting: ar.parse.meetingPoint } : {}),
      });
      links_.push(i > 0 ? (parse.sighas[i - 1] ?? "") : parse.leadSigha);
    }
    const undecided = links.some((l, i) => l.state === "check" && !choices[i] && !l.byContext);
    // The design writes «تطابق عالٍ» on the first confident chip only; the others show the percentage.
    const firstHigh = links.findIndex((l, i) => l.state === "high" && !choices[i]);
    // The names the explorer looks for: the chain as read, in text order.
    const explorerNames = reading.map((i) => ({ folded: foldName(parse.names[i]!.text), display: parse.names[i]!.text }));
    return { ids, found, rows, links: links_, undecided, firstHigh, explorerNames };
  }, [result, choices, data]);

  const sample = data.sample;
  const choose = (i: number, id: string) => setChoices((c) => ({ ...c, [i]: id }));

  const count = result ? result.parse.names.length + (result.parse.prophet ? 1 : 0) : 0;

  return (
    <>
      <ParseForm
        ref={inputRef}
        value={text}
        onChange={(v) => {
          setText(v);
          if (problem) setProblem(null);
        }}
        onAnalyse={() => run(text)}
        {...(sample
          ? {
              onSample: () => {
                setText(sample.text);
                run(sample.text);
              },
            }
          : {})}
        problem={problem}
        {...(sample && text === sample.text ? { sampleNote: ar.parse.sampleFrom(sample.label) } : {})}
      />

      {readerState.status === "loading" || reading ? (
        <p role="status" className="m-0 text-[14px] text-muted">
          {readerState.status === "loading" && readerState.progress > 0
            ? ar.parse.loadingModelPct(toArabicIndic(Math.round(readerState.progress * 100)))
            : ar.parse.loadingModel}
        </p>
      ) : null}
      {readerState.status === "fallback" || result?.parse.engine === "rules" ? (
        <p role="status" data-reason={readerState.reason ?? "model not ready in time"} className="m-0 border-s-[3px] border-check ps-3 text-[14px] leading-[1.7]">
          {ar.parse.fallbackBanner}
        </p>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {result && view ? ar.parse.announce(names(count), view.found ? view.found.route.hadithTitle : null) : ""}
      </p>

      {result && view ? (
        <div
          ref={resultsRef}
          tabIndex={-1}
          aria-labelledby="found-h"
          className="flex flex-col gap-7 outline-none motion-safe:animate-[fade-in_180ms_ease-out]"
        >
          <AutoNotice engine={result.parse.engine === "model" ? ar.parse.engine : ar.parse.engineRules} />

          <section aria-labelledby="found-h" className="flex flex-col gap-3.5">
            <SectionHeading id="found-h" size={26}>
              {names(count)}
            </SectionHeading>
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {result.links.map((l, i) => {
                const chosen = Boolean(choices[i]);
                const tag = tagFor(l, chosen, i === view.firstHigh);
                return <NarratorChip key={i} name={result.parse.names[i]!.text} tag={tag} warn={l.state === "check" && !chosen} />;
              })}
              {result.parse.prophet ? <NarratorChip name={ar.parse.prophet} /> : null}
            </ul>
            <p className="m-0 text-[13px] leading-[1.8] text-muted">{ar.parse.matchNote}</p>

            {result.links.map((l, i) => {
              if (l.state !== "check") return null;
              const options = l.candidates.map((c) => ({ id: c.narratorId, label: data.people[c.narratorId]?.name ?? c.narratorId }));
              const best = l.best ? (data.people[l.best.narratorId]?.name ?? null) : null;
              const neighbour = (k: number | undefined) =>
                k === undefined ? null : ((view.ids[k] && data.people[view.ids[k]!]?.name) ?? result.parse.names[k]!.text);
              const student = neighbour(l.context?.student);
              const teacher = neighbour(l.context?.teacher);
              const reason = !best
                ? null
                : student
                  ? ar.parse.chooserByStudent(best, student)
                  : teacher
                    ? ar.parse.chooserByTeacher(best, teacher)
                    : null;
              return (
                <NarratorChooser
                  key={`c${i}`}
                  name={result.parse.names[i]!.text}
                  options={options}
                  selected={choices[i] ?? (l.byContext ? (l.best?.narratorId ?? null) : null)}
                  reason={reason}
                  onChoose={(id) => choose(i, id)}
                />
              );
            })}
          </section>

          <section aria-labelledby="chain-h" className="flex flex-col gap-3.5">
            <SectionHeading id="chain-h" size={26}>
              {ar.parse.chainTitle}
            </SectionHeading>
            <div className="rounded-sq border border-line-strong bg-paper p-5">
              <ChainList rows={view.rows} links={view.links} label={ar.parse.chainAria} missingCompiler={ar.parse.missingCompiler} />
            </div>
            <p className="m-0 text-[13px] leading-[1.7] text-muted">{ar.parse.chainNote}</p>
            {result.parse.tahwil.length ? (
              <p className="m-0 text-[13px] leading-[1.7] text-muted">
                {view.found ? ar.parse.tahwilFound : ar.parse.tahwilMain}
              </p>
            ) : null}
          </section>

          <ExplorerResults pasted={view.explorerNames.map((x) => x.folded)} display={view.explorerNames.map((x) => x.display)} />

          {view.found ? (
            <section className="ongreen flex flex-col gap-2.5 bg-green p-5 text-parchment">
              <span className="text-[22px] font-semibold">{ar.parse.foundTitle(view.found.route.hadithTitle)}</span>
              <span className="text-[14px] leading-[1.7] text-on-green-muted">
                {view.found.route.index === 0
                  ? ar.parse.foundFirst(total(view.found.route.total), view.found.route.label ?? "")
                  : ar.parse.foundNth(
                      toArabicIndic(view.found.route.index + 1),
                      total(view.found.route.total),
                      view.found.route.label ?? "",
                    )}
              </span>
              <Link
                href={`/hadith/${view.found.route.hadithId}?isnad=${view.found.route.routeId}`}
                className={`${buttonOnGreen} mt-1.5`}
              >
                {ar.parse.showInTree}
              </Link>
            </section>
          ) : (
            <section className="flex flex-col gap-1.5 rounded-sq border border-line-strong bg-none-bg p-5 text-none-fg">
              <span className="text-[18px] font-semibold">{ar.parse.notFoundTitle}</span>
              <span className="text-[14px] leading-[1.7]">{ar.parse.notFoundText}</span>
              {view.undecided ? <span className="text-[14px] leading-[1.7]">{ar.parse.notFoundChoose}</span> : null}
            </section>
          )}
        </div>
      ) : null}
    </>
  );
}
