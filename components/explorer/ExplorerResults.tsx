"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { IsnadTree, type Selection } from "@/components/tree/IsnadTree";
import { Diamond } from "@/components/ui/Diamond";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { toArabicIndic } from "@/lib/arabic/digits";
import { ar } from "@/lib/copy/ar";
import { bookName, bookOrder, bookShort, loadCorpus, loadDocs, locate, type Corpus, type DocRef } from "@/lib/explorer/corpus";
import { buildExplorerGraph, hadithKey, PROPHET } from "@/lib/explorer/graph";
import { highlight } from "@/lib/explorer/highlight";
import { findHadiths, type Hit, type MatchClass } from "@/lib/explorer/match";

// What is found for a pasted isnad: a summary, the shared-chain graph, and the list of every matching hadith with
// filters. All of it is computed in the browser from the shipped corpus files; nothing is sent anywhere.
const PAGE = 20;
const n = (x: number) => toArabicIndic(x);
const hadiths = (x: number) => (x === 1 ? "حديث واحد" : x === 2 ? "حديثان" : x >= 3 && x <= 10 ? `${n(x)} أحاديث` : `${n(x)} حديثًا`);

export function ExplorerResults({ pasted, display }: { pasted: string[]; display: string[] }) {
  const [corpus, setCorpus] = useState<Corpus | null>(null);
  const [error, setError] = useState(false);
  const [docs, setDocs] = useState<Map<number, DocRef>>(new Map());
  const [book, setBook] = useState("all");
  const [cls, setCls] = useState<MatchClass | "all">("all");
  const [narrow, setNarrow] = useState("");
  const [selection, setSelection] = useState<Selection>(null);
  const [shown, setShown] = useState(PAGE);

  useEffect(() => {
    let live = true;
    loadCorpus()
      .then((c) => {
        if (live) setCorpus(c);
      })
      .catch(() => {
        if (live) setError(true);
      });
    return () => {
      live = false;
    };
  }, []);

  const hits: Hit[] = useMemo(() => (corpus ? findHadiths(pasted, corpus.index) : []), [corpus, pasted]);

  // The graph draws the best matches; their book and number come from the manifest and the shipped files.
  const drawnGids = useMemo(() => hits.slice(0, 12).map((h) => h.gid), [hits]);
  const neededGids = useMemo(() => {
    const filtered = hits.filter((h) => passesFilters(h)).slice(0, shown);
    return [...new Set([...drawnGids, ...filtered.map((h) => h.gid)])];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hits, drawnGids, shown, book, cls, narrow, corpus]);

  useEffect(() => {
    if (!corpus || neededGids.length === 0) return;
    let live = true;
    loadDocs(corpus.manifest, neededGids).then((m) => {
      if (live) setDocs((old) => new Map([...old, ...m]));
    });
    return () => {
      live = false;
    };
  }, [corpus, neededGids]);

  const label = (gid: number) => {
    const d = docs.get(gid);
    if (d) return ar.explorer.bookNumber(bookShort(d.book), n(d.number));
    const l = corpus ? locate(corpus.manifest, gid) : null;
    return l ? bookShort(l.book) : "…";
  };

  const graph = useMemo(
    () =>
      corpus && hits.length && drawnGids.every((g) => docs.has(g))
        ? buildExplorerGraph(
            pasted,
            display,
            hits,
            corpus.index,
            label,
            ar.explorer.prophetNode,
            ar.tree.nodeAria,
            { prophet: ar.narrator.role.prophet, narrator: ar.explorer.narratorRole, hadith: ar.explorer.hadithRole },
          )
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [corpus, hits, docs, drawnGids, pasted, display],
  );

  /** The book, match-type and name filters. */
  function passesFilters(h: Hit): boolean {
    if (!corpus) return false;
    if (book !== "all" && locate(corpus.manifest, h.gid).book !== book) return false;
    if (cls !== "all" && h.cls !== cls) return false;
    if (narrow.trim()) {
      const words = narrow.trim().split(/\s+/);
      const text = corpus.index.h[h.gid]!.map((id) => corpus.index.dict[id]!).join(" ");
      if (!words.every((w) => text.includes(w))) return false;
    }
    return true;
  }

  /** The filters, and the graph selection (only the drawn hadiths are on the graph). */
  function passes(h: Hit): boolean {
    if (!passesFilters(h)) return false;
    if (selection?.kind === "narrator") {
      const chain = graph?.routeNodes[hadithKey(h.gid)];
      if (!chain?.includes(selection.id)) return false;
    }
    if (selection?.kind === "route" && hadithKey(h.gid) !== selection.id) return false;
    return true;
  }

  if (error)
    return (
      <p role="alert" className="m-0 text-[15px] text-check-fg">
        {ar.explorer.loadError}
      </p>
    );
  if (!corpus) return <p className="m-0 text-[15px] text-muted" role="status">{ar.explorer.loadingCorpus}</p>;

  const count = (c: MatchClass) => hits.filter((h) => h.cls === c).length;
  const visible = hits.filter(passes);
  const books = bookOrder.filter((b) => hits.some((h) => locate(corpus.manifest, h.gid).book === b));
  const selectedName = selection?.kind === "narrator" ? graph?.labels[selection.id] : null;

  if (hits.length === 0)
    return (
      <section aria-labelledby="ex-h" className="flex flex-col gap-3">
        <SectionHeading id="ex-h" size={26}>
          {ar.explorer.title}
        </SectionHeading>
        <p role="status" className="m-0 text-[16px] leading-[1.8]">
          {ar.explorer.none}
        </p>
        <Rule />
      </section>
    );

  const chip = (active: boolean) =>
    `inline-flex min-h-11 cursor-pointer items-center rounded-sq border px-3.5 text-[14px] ${
      active ? "border-green bg-green text-parchment" : "border-line-strong bg-paper text-ink hover:border-ink"
    }`;

  return (
    <section aria-labelledby="ex-h" className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <SectionHeading id="ex-h" size={26}>
          {ar.explorer.title}
        </SectionHeading>
        <p role="status" className="m-0 text-[17px] leading-[1.8] font-medium">
          {ar.explorer.summary(hadiths(hits.length), n(count("same")), n(count("contains")), n(count("close")))}
        </p>
        {pasted.length <= 2 ? <p className="m-0 text-[14px] leading-[1.7] text-check-fg">{ar.explorer.tooShort}</p> : null}
        <Rule />
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="m-0 text-[20px] font-semibold">{ar.explorer.graphTitle}</h3>
        <p className="m-0 text-[13px] leading-[1.7] text-muted">
          {ar.explorer.graphHint} {hits.length > 12 ? ar.explorer.graphNote(n(12), n(hits.length)) : ""}
        </p>
        {graph ? (
          <IsnadTree
            mobile={graph.layouts.mobile}
            desktop={graph.layouts.desktop}
            labels={graph.labels}
            honorifics={{}}
            arias={graph.arias}
            routeNodes={graph.routeNodes}
            selection={selection}
            onSelectNarrator={(id) => {
              if (id === PROPHET) return;
              setShown(PAGE);
              setSelection((cur) =>
                cur?.id === id ? null : id.startsWith("h:") ? { kind: "route", id } : { kind: "narrator", id },
              );
            }}
          />
        ) : (
          <p className="m-0 text-[14px] text-muted" role="status">
            {ar.explorer.loadingCorpus}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <SectionHeading id="list-h" size={26}>
          {ar.explorer.listTitle}
        </SectionHeading>

        <div className="flex flex-col gap-3 rounded-sq border border-line-strong bg-paper p-4">
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-medium text-muted">{ar.explorer.filterBook}</span>
            <div className="flex flex-wrap gap-2" role="group" aria-label={ar.explorer.filterBook}>
              <button type="button" aria-pressed={book === "all"} className={chip(book === "all")} onClick={() => (setBook("all"), setShown(PAGE))}>
                {ar.explorer.all} ({n(hits.length)})
              </button>
              {books.map((b) => (
                <button key={b} type="button" aria-pressed={book === b} className={chip(book === b)} onClick={() => (setBook(b), setShown(PAGE))}>
                  {bookName(b)} ({n(hits.filter((h) => locate(corpus.manifest, h.gid).book === b).length)})
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-medium text-muted">{ar.explorer.filterClass}</span>
            <div className="flex flex-wrap gap-2" role="group" aria-label={ar.explorer.filterClass}>
              <button type="button" aria-pressed={cls === "all"} className={chip(cls === "all")} onClick={() => (setCls("all"), setShown(PAGE))}>
                {ar.explorer.all}
              </button>
              {(["same", "contains", "close"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={cls === c}
                  title={ar.explorer.classHelp[c]}
                  disabled={count(c) === 0}
                  className={`${chip(cls === c)} disabled:cursor-not-allowed disabled:opacity-50`}
                  onClick={() => (setCls(c), setShown(PAGE))}
                >
                  {ar.explorer.classes[c]} ({n(count(c))})
                </button>
              ))}
            </div>
          </div>
          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-medium text-muted">{ar.explorer.narrow}</span>
            <input
              type="search"
              value={narrow}
              onChange={(e) => (setNarrow(e.target.value), setShown(PAGE))}
              placeholder={ar.explorer.narrowPlaceholder}
              autoComplete="off"
              spellCheck={false}
              className="box-border h-11 w-full rounded-sq border-[1.5px] border-ink bg-paper px-3.5 text-[16px] text-ink"
            />
          </label>
          {selection ? (
            <div className="flex flex-wrap items-center gap-3 border-t border-line pt-3 text-[14px]">
              <span>{selectedName ? ar.explorer.selectedNode(selectedName) : ar.explorer.selectedNode(label(Number(selection.id.slice(2))))}</span>
              <button type="button" className={chip(false)} onClick={() => setSelection(null)}>
                {ar.explorer.clearSelection}
              </button>
            </div>
          ) : null}
        </div>

        <p role="status" className="m-0 text-[14px] text-muted">
          {ar.explorer.shown(n(Math.min(shown, visible.length)), n(visible.length))} · {ar.explorer.asWritten}
        </p>
        {visible.length === 0 ? <p className="m-0 text-[15px]">{ar.explorer.noFilterResult}</p> : null}

        <ol className="m-0 flex list-none flex-col p-0">
          {visible.slice(0, shown).map((h) => (
            <HitCard key={h.gid} hit={h} corpus={corpus} doc={docs.get(h.gid)} pasted={pasted} selected={selection?.id === hadithKey(h.gid)} />
          ))}
        </ol>
        {visible.length > shown ? (
          <button type="button" className={`${chip(false)} self-start`} onClick={() => setShown((s) => s + PAGE)}>
            {ar.explorer.more} ({n(Math.min(PAGE, visible.length - shown))})
          </button>
        ) : null}
        <Rule />
      </div>
    </section>
  );
}

function Rule() {
  return (
    <p className="m-0 flex items-start gap-2.5 text-[14px] leading-[1.7] text-muted">
      <Diamond size={7} className="mt-[9px]" />
      <span>
        <b className="font-semibold text-ink">{ar.explorer.aiTitle}.</b> {ar.explorer.aiDoes} {ar.explorer.aiDoesnt}
      </span>
    </p>
  );
}

function HitCard({ hit, corpus, doc, pasted, selected }: { hit: Hit; corpus: Corpus; doc: DocRef | undefined; pasted: string[]; selected: boolean }) {
  const loc = locate(corpus.manifest, hit.gid);
  const names = corpus.index.h[hit.gid]!.map((id) => corpus.index.dict[id]!);
  const matchedNames = hit.pairs.map((p) => names[p.hadith]!);
  const pieces = doc ? highlight(doc.text, matchedNames) : null;
  const total = pasted.length;
  return (
    <li className={`flex flex-col gap-2.5 border-b border-line py-5 ${selected ? "bg-selected px-3" : ""}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <b className="text-[18px] font-semibold">{doc ? ar.explorer.bookNumber(bookName(loc.book), n(doc.number)) : bookName(loc.book)}</b>
        <span className="inline-flex h-6 items-center rounded-sq bg-selected px-2 text-[13px] font-medium text-green" title={ar.explorer.classHelp[hit.cls]}>
          {ar.explorer.classes[hit.cls]}
        </span>
        <span className="text-[13px] text-muted">
          {ar.explorer.score(n(hit.matched), n(total))}
          {hit.extras ? ` · ${ar.explorer.extras(n(hit.extras))}` : ""}
          {hit.missing ? ` · ${ar.explorer.missing(n(hit.missing))}` : ""}
        </span>
      </div>
      <p className="m-0 text-[17px] leading-[2] break-words" aria-label={ar.explorer.isnadAsInCorpus}>
        {pieces
          ? pieces.map((p, i) =>
              p.mark ? (
                <mark key={i} className="rounded-sq bg-selected px-0.5 text-ink">
                  {p.text}
                </mark>
              ) : (
                <span key={i}>{p.text}</span>
              ),
            )
          : "…"}
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="inline-flex h-6 items-center gap-1.5 rounded-sq bg-check-bg px-2 text-[13px] font-medium text-check-fg">
          <span aria-hidden="true" className="size-2 bg-check" />
          {ar.explorer.status}
        </span>
        {doc ? (
          <Link href={`/c/${loc.book}/${doc.number}`} className="inline-flex min-h-11 items-center text-[15px] font-semibold">
            {ar.explorer.open}
          </Link>
        ) : null}
      </div>
    </li>
  );
}
