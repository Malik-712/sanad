"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type ReactNode, useState } from "react";
import { IsnadTree, type Selection } from "@/components/tree/IsnadTree";
import { buttonOutline } from "@/components/ui/buttons";
import { CloseIcon } from "@/components/ui/icons";
import { Segmented } from "@/components/ui/Segmented";
import { StatusBadge, StatusInline } from "@/components/ui/StatusBadge";
import { ar } from "@/lib/copy/ar";
import type { Status } from "@/lib/data/types";
import type { TreeLayout } from "@/lib/isnad/layout";

// The hadith page body. Desktop (≥1024px): isnad list | tree | panel. Mobile: tabs «الشجرة / الأسانيد …», then the panel.
// The selection is kept in ?isnad= or ?narrator= so a view can be shared.
export type RouteItem = {
  id: string;
  no: string;
  title: string;
  panelTitle: string;
  panelEyebrow: string;
  summary: string;
  status: Status;
  chain: string[];
  body: ReactNode;
};

export type NarratorItem = {
  id: string;
  name: string;
  eyebrow: string;
  /** «يمرّ به ٥ من ثمانية أسانيد» (counts from the engine). */
  through: string;
  body: ReactNode;
};

type Props = {
  routes: RouteItem[];
  narrators: Record<string, NarratorItem>;
  listLabel: string;
  layouts: { mobile: TreeLayout; desktop: TreeLayout };
  labels: Record<string, string>;
  honorifics: Record<string, string>;
  arias: Record<string, string>;
  disclaimer: ReactNode;
};

export function HadithViewFromUrl(props: Props) {
  const params = useSearchParams();
  const isnad = params.get("isnad");
  const narrator = params.get("narrator");
  let initial: Selection = props.routes[0] ? { kind: "route", id: props.routes[0].id } : null;
  if (narrator && props.narrators[narrator]) initial = { kind: "narrator", id: narrator };
  else if (isnad && props.routes.some((r) => r.id === isnad)) initial = { kind: "route", id: isnad };
  return <HadithView key={initial ? `${initial.kind}:${initial.id}` : ""} {...props} initial={initial} />;
}

export function HadithView({
  routes,
  narrators,
  listLabel,
  layouts,
  labels,
  honorifics,
  arias,
  disclaimer,
  initial,
}: Props & { initial: Selection }) {
  const [selection, setSelection] = useState<Selection>(initial);
  const [view, setView] = useState<"tree" | "list">("tree");
  const route = selection?.kind === "route" ? (routes.find((r) => r.id === selection.id) ?? null) : null;
  const narrator = selection?.kind === "narrator" ? (narrators[selection.id] ?? null) : null;
  const routeNodes = Object.fromEntries(routes.map((r) => [r.id, r.chain]));

  function select(next: Selection) {
    setSelection(next);
    const q = next ? `?${next.kind === "route" ? "isnad" : "narrator"}=${encodeURIComponent(next.id)}` : window.location.pathname;
    window.history.replaceState(null, "", q);
  }

  const panelHead = (eyebrow: string, title: ReactNode, big: boolean) => (
    <div className="ongreen flex items-start justify-between gap-3 bg-green px-5 pt-4 pb-[18px] text-parchment">
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] text-on-green-muted">{eyebrow}</span>
        <h2 className={`m-0 leading-[1.5] ${big ? "text-[28px] font-bold lg:text-[30px]" : "text-[20px] font-semibold lg:text-[21px]"}`}>
          {title}
        </h2>
      </div>
      <button
        type="button"
        aria-label={ar.hadith.close}
        onClick={() => select(null)}
        className="hidden size-11 flex-none cursor-pointer items-center justify-center rounded-sq border-[1.5px] border-on-green-muted bg-transparent p-0 text-parchment focus-visible:outline-gold lg:flex"
      >
        <CloseIcon />
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 px-4 pt-5 pb-8 lg:flex-row lg:flex-wrap lg:items-start lg:gap-6 lg:px-8 lg:pt-6">
      <div className="lg:hidden">
        <Segmented
          label={ar.hadith.tabsLabel}
          value={view}
          onChange={setView}
          options={[
            { value: "tree", label: ar.hadith.tabTree },
            { value: "list", label: listLabel },
          ]}
        />
      </div>

      <aside
        aria-labelledby="routes-h"
        className={`${view === "list" ? "flex" : "hidden"} min-w-0 flex-col gap-2.5 lg:flex lg:flex-[1_1_280px]`}
      >
        <div className="hidden flex-col gap-1 border-b-2 border-ink pb-2.5 lg:flex">
          <h2 id="routes-h" className="m-0 text-[26px] leading-[1.3] font-semibold">
            {listLabel}
          </h2>
          <span className="text-[13px] text-muted">{ar.hadith.routesHint}</span>
        </div>
        {routes.map((r) => {
          const on = route?.id === r.id;
          const thru = narrator ? r.chain.includes(narrator.id) : false;
          return (
            <button
              key={r.id}
              type="button"
              aria-pressed={on}
              onClick={() => {
                select({ kind: "route", id: r.id });
                setView("tree");
              }}
              className={`flex cursor-pointer flex-col items-stretch gap-2 rounded-sq text-start text-ink lg:gap-1.5 ${
                on
                  ? "border-2 border-green bg-selected px-[15px] py-[13px] lg:px-[13px] lg:py-[11px]"
                  : "border border-line-strong bg-paper px-4 py-3.5 hover:border-ink lg:px-3.5 lg:py-3"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={`flex size-7 flex-none items-center justify-center border-[1.5px] border-green text-[15px] ${
                    on ? "bg-green text-parchment" : "text-green"
                  }`}
                >
                  {r.no}
                </span>
                <span className="flex-1 text-[15px] font-semibold lg:text-[14px]">{r.title}</span>
                <span className="hidden items-center gap-[7px] lg:flex">
                  <StatusInline status={r.status} />
                </span>
              </span>
              <span className="line-clamp-2 text-[17px] leading-[1.6] lg:text-[16px]">{r.summary}</span>
              <span className="lg:hidden">
                <StatusBadge status={r.status} />
              </span>
              {thru ? (
                <span className="hidden text-[13px] font-medium text-green lg:block">{ar.narratorPanel.thruSelected}</span>
              ) : null}
            </button>
          );
        })}
      </aside>

      <div className={`${view === "tree" ? "flex" : "hidden"} min-w-0 flex-col lg:flex lg:flex-[999_1_560px]`}>
        <IsnadTree
          mobile={layouts.mobile}
          desktop={layouts.desktop}
          labels={labels}
          honorifics={honorifics}
          arias={arias}
          routeNodes={routeNodes}
          selection={selection}
          onSelectNarrator={(id) => select({ kind: "narrator", id })}
        />
      </div>

      <aside className="flex min-w-0 flex-col gap-4 lg:flex-[1_1_360px]">
        {route ? (
          <section aria-label={ar.hadith.panelLabel} className="flex flex-col overflow-hidden rounded-sq border-[1.5px] border-ink bg-paper">
            {panelHead(route.panelEyebrow, route.panelTitle, false)}
            {route.body}
          </section>
        ) : narrator ? (
          <section aria-label={ar.narratorPanel.label} className="flex flex-col overflow-hidden rounded-sq border-[1.5px] border-ink bg-paper">
            {panelHead(narrator.eyebrow, narrator.name, true)}
            {narrator.body}
            <div className="mx-5 mb-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 lg:mx-6 lg:mb-6">
              <span className="text-[14px]">
                {narrator.through}
                <span className="hidden lg:inline">{ar.narratorPanel.throughMarked}</span>
              </span>
              <button type="button" onClick={() => setView("list")} className={`${buttonOutline} px-3.5 text-[14px] lg:hidden`}>
                {ar.narratorPanel.showRoutes}
              </button>
              <Link href={`/narrator/${narrator.id}`} className="text-[14px]">
                {ar.narratorPanel.fullPage}
              </Link>
            </div>
          </section>
        ) : (
          <section className="flex flex-col gap-2.5 rounded-sq border-[1.5px] border-dashed border-edge p-6">
            <span className="text-[22px] font-semibold">{ar.hadith.emptyTitle}</span>
            <span className="text-[14px] leading-[1.7] text-muted">{ar.hadith.emptyText}</span>
          </section>
        )}
        {disclaimer}
      </aside>
    </div>
  );
}
