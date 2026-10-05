"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type ReactNode, useDeferredValue, useRef, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ar } from "@/lib/copy/ar";
import { filterEntries, type SearchEntry } from "@/lib/search/filter";

// The search card and the «أحاديث مختارة» list it filters in place.
// The query starts from ?q= (the desktop header search sends it) but is not written back to the URL.
type Props = {
  entries: SearchEntry[];
  cards: { id: string; card: ReactNode }[];
  tryLinks: { href: string; label: string }[];
  between: ReactNode;
  demoTag: ReactNode;
};

/** Reads ?q= once; render inside <Suspense> with <HomeSearch initialQuery=""> as the fallback. */
export function HomeSearchFromUrl(props: Props) {
  const q = useSearchParams().get("q") ?? "";
  return <HomeSearch key={q} {...props} initialQuery={q} />;
}

export function HomeSearch({ entries, cards, tryLinks, between, demoTag, initialQuery }: Props & { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const deferred = useDeferredValue(query);
  const listRef = useRef<HTMLSpanElement>(null);

  const shown = new Set(filterEntries(entries, deferred));
  const visible = cards.filter((c) => shown.has(c.id));

  return (
    <>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          listRef.current?.focus();
        }}
        className="relative mx-4 -mt-[72px] flex flex-col gap-3 rounded-sq border-[1.5px] border-ink bg-paper p-5 lg:mx-auto lg:w-[688px]"
      >
        <label htmlFor="home-q" className="text-[15px] font-medium">
          {ar.search.label}
        </label>
        <div className="flex h-[52px] rounded-sq border-[1.5px] border-ink bg-paper">
          <input
            id="home-q"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={ar.home.searchPlaceholder}
            className="min-w-0 flex-1 border-0 bg-transparent px-3.5 text-[16px] text-ink outline-none"
          />
          <button
            type="submit"
            className="w-[84px] flex-none cursor-pointer border-0 bg-green text-[15px] font-medium text-parchment"
          >
            {ar.search.button}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] text-muted">{ar.home.tryLabel}</span>
          {tryLinks.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="inline-flex min-h-11 items-center rounded-sq border border-line-strong px-3 text-[17px] text-ink no-underline hover:text-ink"
            >
              {t.label}
            </Link>
          ))}
        </div>
      </form>

      <main id="main" className="mx-auto flex w-full max-w-[720px] flex-col gap-10 px-4 pt-6 pb-10">
        {between}
        <section aria-labelledby="featured-h" className="flex flex-col">
          <SectionHeading id="featured-h" end={demoTag}>
            <span ref={listRef} tabIndex={-1} className="outline-none">
              {ar.home.featured}
            </span>
          </SectionHeading>
          {visible.map((c) => (
            <div key={c.id}>{c.card}</div>
          ))}
          {visible.length === 0 ? (
            <p role="status" className="m-0 py-5 text-[15px] leading-[1.7] text-muted">
              {ar.home.noResults}
            </p>
          ) : null}
        </section>
      </main>
    </>
  );
}
