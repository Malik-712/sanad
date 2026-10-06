"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type ReactNode, useDeferredValue, useRef, useState } from "react";
import { GoldFrame } from "@/components/ui/GoldFrame";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ar } from "@/lib/copy/ar";
import { filterEntries, type SearchEntry } from "@/lib/search/filter";

// The Home hero, the search card and the «أحاديث مختارة» list it filters in place.
// The query starts from ?q= (the desktop header search on other pages sends it) but is not written back to the URL.
//
// Below 1024px (design «Home»): the green band, then the card overlapping its bottom by 72px.
// From 1024px: one full-width band; the slogan and the card in the first column, the drawing in the second.
// The band's inner wrapper becomes `display: contents` there, so the single form joins the band's grid.
type Props = {
  entries: SearchEntry[];
  cards: { id: string; card: ReactNode }[];
  tryLinks: { href: string; label: string }[];
  between: ReactNode;
  demoTag: ReactNode;
  heroText: ReactNode;
  heroFigure: ReactNode;
};

/** Reads ?q= once; render inside <Suspense> with <HomeSearch initialQuery=""> as the fallback. */
export function HomeSearchFromUrl(props: Props) {
  const q = useSearchParams().get("q") ?? "";
  return <HomeSearch key={q} {...props} initialQuery={q} />;
}

// Desktop content: at most 1344px (the 1440px artboard less the band's 48px gutters), centred.
const desktopGutter = "lg:px-[max(3rem,calc((100%-84rem)/2))]";

export function HomeSearch({ entries, cards, tryLinks, between, demoTag, heroText, heroFigure, initialQuery }: Props & { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const deferred = useDeferredValue(query);
  const listRef = useRef<HTMLSpanElement>(null);

  const shown = new Set(filterEntries(entries, deferred));
  const visible = cards.filter((c) => shown.has(c.id));

  return (
    <>
      <div
        className={`relative lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-x-16 lg:gap-y-7 lg:bg-green lg:pt-14 lg:pb-16 ${desktopGutter}`}
      >
        <div className="ongreen relative bg-green text-parchment lg:contents">
          <GoldFrame className="inset-x-2.5 top-0 bottom-2.5 lg:inset-x-5 lg:top-3 lg:bottom-3.5" />
          <div className="mx-auto flex max-w-[720px] flex-col gap-5 px-7 pt-10 lg:col-start-1 lg:row-start-1 lg:m-0 lg:max-w-none lg:self-end lg:p-0">
            {heroText}
          </div>
          <div className="mx-auto max-w-[720px] px-7 pt-7 pb-28 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:m-0 lg:flex lg:max-w-none lg:justify-center lg:p-0">
            {heroFigure}
          </div>
        </div>

        <form
          role="search"
          aria-labelledby="home-q-label"
          onSubmit={(e) => {
            e.preventDefault();
            listRef.current?.focus();
          }}
          className="relative mx-4 -mt-[72px] flex flex-col gap-3 rounded-sq border-[1.5px] border-ink bg-paper p-5 md:mx-auto md:w-[688px] lg:col-start-1 lg:row-start-2 lg:m-0 lg:w-full lg:max-w-[600px] lg:self-start"
        >
          <label id="home-q-label" htmlFor="home-q" className="text-[15px] font-medium">
            {ar.search.label}
          </label>
          <div className="flex h-[52px] rounded-sq border-[1.5px] border-ink bg-paper focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-green focus-within:outline-solid">
            <input
              id="home-q"
              name="q"
              type="search"
              autoComplete="off"
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
                className="inline-flex min-h-11 items-center rounded-sq border border-line-strong px-3 text-[17px] text-ink no-underline hover:border-ink hover:text-ink"
              >
                {t.label}
              </Link>
            ))}
          </div>
        </form>
      </div>

      <div className={`mx-auto flex w-full max-w-[720px] flex-col gap-10 px-4 pt-6 pb-10 lg:max-w-none lg:pt-10 lg:pb-14 ${desktopGutter}`}>
        {between}
        <section aria-labelledby="featured-h" className="flex flex-col">
          <SectionHeading id="featured-h" end={demoTag}>
            <span ref={listRef} tabIndex={-1} className="outline-none">
              {ar.home.featured}
            </span>
          </SectionHeading>
          {/* One column, two from 1024px; each row keeps its own rule. */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-x-12">
            {visible.map((c) => (
              <div key={c.id}>{c.card}</div>
            ))}
          </div>
          {visible.length === 0 ? (
            <p role="status" className="m-0 py-5 text-[15px] leading-[1.7] text-muted">
              {ar.home.noResults}
            </p>
          ) : null}
        </section>
      </div>
    </>
  );
}
