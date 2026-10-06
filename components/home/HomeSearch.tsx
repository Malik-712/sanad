"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type ReactNode, useDeferredValue, useRef, useState } from "react";
import { buttonPrimary } from "@/components/ui/buttons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { countNoun } from "@/lib/arabic/count";
import { toArabicIndic } from "@/lib/arabic/digits";
import { ar } from "@/lib/copy/ar";
import { filterEntries, type SearchEntry } from "@/lib/search/filter";

// Home (owner, 6 Oct): search only. The logo, the slogan and one large search box on the green band,
// then the list of hadiths, filtered as the user types. The query starts from ?q= but is not written back.
type Props = {
  entries: SearchEntry[];
  cards: { id: string; card: ReactNode }[];
};

/** Reads ?q= once; render inside <Suspense> with <HomeSearch initialQuery=""> as the fallback. */
export function HomeSearchFromUrl(props: Props) {
  const q = useSearchParams().get("q") ?? "";
  return <HomeSearch key={q} {...props} initialQuery={q} />;
}

const hadiths = (n: number) => (n >= 1 && n <= 99 ? countNoun(n, "hadith") : `${toArabicIndic(n)} ${ar.nouns.hadith.plural}`);

export function HomeSearch({ entries, cards, initialQuery }: Props & { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const deferred = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLHeadingElement>(null);

  const shown = new Set(filterEntries(entries, deferred));
  const visible = cards.filter((c) => shown.has(c.id));
  const searching = deferred.trim() !== "";
  const none = searching && visible.length === 0;

  return (
    <>
      <div className="ongreen bg-green text-parchment">
        <div className="mx-auto flex max-w-[760px] flex-col items-center gap-6 px-5 pt-10 pb-12 lg:pt-16 lg:pb-16">
          <Image src="/brand/sanad-mark.svg" alt="" width={72} height={72} priority />
          <h1 className="m-0 text-center text-[40px] leading-[1.25] font-bold lg:text-[52px]">{ar.slogan}</h1>
          <form
            role="search"
            aria-labelledby="home-q-label"
            onSubmit={(e) => {
              e.preventDefault();
              listRef.current?.focus();
            }}
            className="flex w-full flex-col gap-2"
          >
            <label id="home-q-label" htmlFor="home-q" className="text-[15px] font-medium text-on-green-muted">
              {ar.search.label}
            </label>
            <div className="flex h-14 rounded-sq border-[1.5px] border-ink bg-paper focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-gold focus-within:outline-solid">
              <input
                ref={inputRef}
                id="home-q"
                name="q"
                type="search"
                autoComplete="off"
                spellCheck={false}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={ar.search.placeholder}
                aria-describedby="home-q-hint"
                className="min-w-0 flex-1 border-0 bg-transparent px-4 text-[17px] text-ink outline-none [&::-webkit-search-cancel-button]:hidden"
              />
              {query ? (
                <button
                  type="button"
                  title={ar.search.clearTitle}
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="flex min-w-11 flex-none cursor-pointer items-center gap-1 border-0 bg-transparent px-3 text-[14px] text-muted hover:bg-hover hover:text-ink"
                >
                  <span aria-hidden="true" className="text-[20px] leading-none">
                    ×
                  </span>
                  {ar.search.clear}
                </button>
              ) : null}
              <button
                type="submit"
                className="w-[96px] flex-none cursor-pointer border-0 bg-green text-[16px] font-medium text-parchment hover:bg-green-deep"
              >
                {ar.search.button}
              </button>
            </div>
            <span id="home-q-hint" className="text-[13px] text-on-green-muted">
              {ar.search.hint}
            </span>
          </form>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[880px] flex-col px-4 pt-8 pb-12">
        <section aria-labelledby="list-h" className="flex flex-col">
          <SectionHeading id="list-h">
            <span ref={listRef} tabIndex={-1} className="outline-none">
              {ar.home.listTitle}
            </span>
          </SectionHeading>
          <p role="status" className={`m-0 pt-3 leading-[1.8] ${none ? "text-[16px] text-ink" : "text-[14px] text-muted"}`}>
            {none
              ? ar.home.noResults(hadiths(cards.length))
              : searching
                ? ar.home.results(hadiths(visible.length))
                : ar.home.count(hadiths(cards.length))}
          </p>
          {none ? (
            <Link href="/parse" className={`${buttonPrimary} mt-4 self-start`}>
              {ar.home.pasteButton}
            </Link>
          ) : null}
          <div className="flex flex-col">
            {visible.map((c) => (
              <div key={c.id}>{c.card}</div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
