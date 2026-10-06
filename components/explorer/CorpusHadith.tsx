"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Diamond } from "@/components/ui/Diamond";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { toArabicIndic } from "@/lib/arabic/digits";
import { bookById, CORPUS_PIN, sourceFileUrl } from "@/lib/corpus/books";
import { ar } from "@/lib/copy/ar";
import { findByNumber, loadCorpus, loadDocs, type DocRef } from "@/lib/explorer/corpus";

type State = { s: "loading" } | { s: "missing" } | { s: "ok"; doc: DocRef; names: string[] };
type Full = { s: "loading" } | { s: "ok"; text: string } | { s: "empty" } | { s: "failed" };

const T = ar.corpusHadith;

/** /c/<book>/<n> → { book, n }, read from the address bar (the page is shared by every hadith). */
function fromLocation(): { book: string; n: number } | null {
  const m = window.location.pathname.match(/^\/c\/([a-z]+)\/(\d+)\/?$/);
  return m ? { book: m[1]!, n: Number(m[2]) } : null;
}

export function CorpusHadith() {
  const [state, setState] = useState<State>({ s: "loading" });
  const [full, setFull] = useState<Full>({ s: "loading" });

  useEffect(() => {
    let live = true;
    (async () => {
      const ref = fromLocation();
      const missing = () => {
        if (live) setState({ s: "missing" });
      };
      if (!ref || !bookById(ref.book)) return missing();
      const corpus = await loadCorpus();
      const gid = await findByNumber(corpus.manifest, ref.book, ref.n);
      if (gid === null) return missing();
      const doc = (await loadDocs(corpus.manifest, [gid])).get(gid)!;
      const names = corpus.index.h[gid]!.map((id) => corpus.index.dict[id]!);
      if (live) setState({ s: "ok", doc, names });
      // The full text comes from the pinned source file of this hadith; if that fails, the isnad above remains.
      try {
        const r = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@${CORPUS_PIN}/editions/ara-${ref.book}/${ref.n}.json`);
        if (!r.ok) throw new Error(String(r.status));
        const j = (await r.json()) as { hadiths: { hadithnumber: number; text: string }[] };
        const text = j.hadiths.find((x) => x.hadithnumber === ref.n)?.text?.trim() ?? "";
        if (live) setFull(text ? { s: "ok", text } : { s: "empty" });
      } catch {
        if (live) setFull({ s: "failed" });
      }
    })().catch(() => {
      if (live) setState({ s: "missing" });
    });
    return () => {
      live = false;
    };
  }, []);

  if (state.s !== "ok")
    return (
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 px-4 pt-8 pb-10">
        <p role="status" className="m-0 text-[16px]">
          {state.s === "loading" ? T.loading : T.notFound}
        </p>
        <Link href="/" className="inline-flex min-h-11 items-center self-start">
          {T.back}
        </Link>
      </div>
    );

  const { doc, names } = state;
  const book = bookById(doc.book)!;
  const title = ar.explorer.bookNumber(book.nameAr, toArabicIndic(doc.number));

  return (
    <>
      <div className="ongreen bg-green text-parchment">
        <div className="mx-auto flex max-w-[720px] flex-col gap-2 px-5 pt-5 pb-7">
          <Link href="/" className="inline-flex min-h-11 items-center self-start text-[14px] text-on-green-muted no-underline hover:text-parchment">
            {T.back}
          </Link>
          <h1 className="m-0 text-[30px] leading-[1.4] font-bold">{title}</h1>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-8 px-4 pt-6 pb-10">
        <section className="flex flex-col gap-2 rounded-sq border-[1.5px] border-check bg-paper p-5">
          <span className="inline-flex h-[26px] items-center gap-[7px] self-start rounded-sq bg-check-bg px-[9px] text-[13px] font-medium text-check-fg">
            <span aria-hidden="true" className="size-2 bg-check" />
            {T.status}
          </span>
          <p className="m-0 text-[14px] leading-[1.7] text-muted">{T.statusText}</p>
        </section>

        <section aria-labelledby="text-h" className="flex flex-col gap-3">
          <SectionHeading id="text-h" size={26}>
            {full.s === "ok" ? T.fullText : T.isnadOnly}
          </SectionHeading>
          <p className="m-0 text-[20px] leading-[2.1] break-words">{full.s === "ok" ? full.text : doc.text}</p>
          <p role="status" className="m-0 text-[13px] leading-[1.7] text-muted">
            {full.s === "loading" ? T.fullTextLoading : full.s === "empty" ? T.fullTextMissing : full.s === "failed" ? T.fullTextFailed : ""}
          </p>
        </section>

        <section aria-labelledby="read-h" className="flex flex-col gap-3">
          <SectionHeading id="read-h" size={26}>
            {T.readTitle}
          </SectionHeading>
          {names.length ? (
            <ol className="m-0 flex list-none flex-wrap gap-2 p-0">
              {names.map((n, i) => (
                <li key={i} className="inline-flex min-h-10 items-center rounded-sq border border-line-strong bg-paper px-3 text-[16px]">
                  {n}
                </li>
              ))}
            </ol>
          ) : (
            <p className="m-0 text-[15px]">{T.readNone}</p>
          )}
          <p className="m-0 text-[13px] leading-[1.7] text-muted">{T.readNote}</p>
        </section>

        <section aria-labelledby="src-h" className="flex flex-col gap-3">
          <SectionHeading id="src-h" size={26}>
            {T.sourceTitle}
          </SectionHeading>
          <dl className="m-0 grid grid-cols-1 gap-3 text-[15px] sm:grid-cols-2">
            <div>
              <dt className="text-[13px] text-muted">{T.book}</dt>
              <dd className="m-0">{book.nameAr}</dd>
            </div>
            <div>
              <dt className="text-[13px] text-muted">{T.number}</dt>
              <dd className="m-0">{toArabicIndic(doc.number)}</dd>
            </div>
            <div>
              <dt className="text-[13px] text-muted">{T.corpus}</dt>
              <dd className="m-0" dir="ltr">
                {T.corpusName}
              </dd>
            </div>
            <div>
              <dt className="text-[13px] text-muted">{T.pinned}</dt>
              <dd className="m-0 break-all" dir="ltr">
                {CORPUS_PIN.slice(0, 12)}
              </dd>
            </div>
          </dl>
          <a href={sourceFileUrl(doc.book)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center self-start text-[15px] font-semibold">
            {T.openFile}
          </a>
        </section>

        <section aria-labelledby="ver-h" className="flex flex-col gap-3 rounded-sq border-[1.5px] border-ink bg-paper p-5">
          <h2 id="ver-h" className="m-0 text-[20px] leading-[1.4] font-semibold">
            {T.verifyTitle}
          </h2>
          <ol className="m-0 flex list-decimal flex-col gap-1.5 ps-6 text-[15px] leading-[1.7]">
            {T.verifySteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <Link href="/sources" className="inline-flex min-h-11 items-center gap-2 self-start text-[15px]">
            <Diamond size={7} />
            {T.allSources}
          </Link>
        </section>

        <p className="m-0 flex items-start gap-2.5 text-[14px] leading-[1.7] text-muted">
          <Diamond size={7} className="mt-[9px]" />
          {ar.disclaimerLine}
        </p>
      </div>
    </>
  );
}
