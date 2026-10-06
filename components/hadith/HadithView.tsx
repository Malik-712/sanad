"use client";

import { useSearchParams } from "next/navigation";
import { type ReactNode, useState } from "react";
import { CloseIcon } from "@/components/ui/icons";
import { Segmented } from "@/components/ui/Segmented";
import { StatusBadge, StatusInline } from "@/components/ui/StatusBadge";
import { ar } from "@/lib/copy/ar";
import type { Status } from "@/lib/data/types";

// The hadith page body. Desktop (≥1024px): routes list | tree | panel. Mobile: tabs «الشجرة / الأسانيد …», then the panel.
// The selected isnad is kept in ?isnad= so other pages can link to one isnad.
export type RouteItem = {
  id: string;
  no: string;
  title: string;
  panelTitle: string;
  panelEyebrow: string;
  summary: string;
  status: Status;
  body: ReactNode;
};

type Props = { routes: RouteItem[]; listLabel: string; tree: ReactNode; disclaimer: ReactNode };

export function HadithViewFromUrl(props: Props) {
  const wanted = useSearchParams().get("isnad");
  const initial = props.routes.some((r) => r.id === wanted) ? wanted : (props.routes[0]?.id ?? null);
  return <HadithView key={initial ?? ""} {...props} initial={initial} />;
}

export function HadithView({ routes, listLabel, tree, disclaimer, initial }: Props & { initial: string | null }) {
  const [selected, setSelected] = useState<string | null>(initial);
  const [view, setView] = useState<"tree" | "list">("tree");
  const current = routes.find((r) => r.id === selected) ?? null;

  function pick(id: string) {
    setSelected(id);
    setView("tree");
    window.history.replaceState(null, "", `?isnad=${encodeURIComponent(id)}`);
  }

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
          const on = r.id === selected;
          return (
            <button
              key={r.id}
              type="button"
              aria-pressed={on}
              onClick={() => pick(r.id)}
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
            </button>
          );
        })}
      </aside>

      <div className={`${view === "tree" ? "flex" : "hidden"} min-w-0 flex-col lg:flex lg:flex-[999_1_560px]`}>{tree}</div>

      <aside className="flex min-w-0 flex-col gap-4 lg:flex-[1_1_360px]">
        {current ? (
          <section
            aria-label={ar.hadith.panelLabel}
            className="flex flex-col overflow-hidden rounded-sq border-[1.5px] border-ink bg-paper"
          >
            <div className="ongreen flex items-start justify-between gap-3 bg-green px-5 pt-4 pb-[18px] text-parchment">
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] text-on-green-muted">{current.panelEyebrow}</span>
                <h2 className="m-0 text-[20px] leading-[1.5] font-semibold lg:text-[21px]">{current.panelTitle}</h2>
              </div>
              <button
                type="button"
                aria-label={ar.hadith.close}
                onClick={() => setSelected(null)}
                className="hidden size-11 flex-none cursor-pointer items-center justify-center rounded-sq border-[1.5px] border-on-green-muted bg-transparent p-0 text-parchment focus-visible:outline-gold lg:flex"
              >
                <CloseIcon />
              </button>
            </div>
            {current.body}
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
