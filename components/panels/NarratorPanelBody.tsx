import type { ReactNode } from "react";
import { Diamond } from "@/components/ui/Diamond";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { toArabicIndic } from "@/lib/arabic/digits";
import { ar } from "@/lib/copy/ar";
import { narratorStatus } from "@/lib/data/derive";
import type { Narrator } from "@/lib/data/types";

// The narrator panel content (design «لوحة الراوي»), shared by /narrator/[id] and the hadith page.
// Every value comes from data/narrators.json; a grade is only the quoted Taqrib entry.
export function NarratorPanelBody({
  narrator: n,
  books = [],
  lead,
  children,
}: {
  narrator: Narrator;
  /** For a compiler: the books his isnads come from. */
  books?: string[];
  /** A line above the facts (the Prophet ﷺ note, or the common-link line). */
  lead?: ReactNode;
  /** Extra sections below (routes through him, links). */
  children?: ReactNode;
}) {
  const isProphet = n.role === "prophet";
  const isCompiler = n.role === "compiler";
  const showTaqrib = n.role === "companion" || n.role === "narrator";

  return (
    <div className="flex flex-col gap-[18px] p-5 lg:px-6">
      {lead}

      {isProphet ? null : (
        <dl className="m-0 grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-0.5">
            <dt className="text-[13px] text-muted">{ar.narrator.tabaqa}</dt>
            <dd className="m-0 text-[16px]">{n.tabaqa ?? ar.narrator.notReported}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-[13px] text-muted">{ar.narrator.death}</dt>
            <dd className="m-0 text-[16px]">{n.deathAr ?? ar.narrator.notReported}</dd>
          </div>
        </dl>
      )}

      {isCompiler && books.length ? (
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] text-muted">{ar.narrator.book}</span>
          <span className="text-[19px]">{books.join("، ")}</span>
        </div>
      ) : null}

      {showTaqrib ? (
        <div className="flex flex-col gap-2.5 border-t border-line pt-4">
          <span className="text-[14px] font-medium">{ar.narrator.taqribHeading}</span>
          {n.taqrib ? (
            <>
              <blockquote className="m-0 text-[21px] leading-[1.9] lg:text-[22px]">«{n.taqrib.quoteAr}»</blockquote>
              <span className="flex items-center gap-2 text-[13px] text-muted">
                <Diamond size={7} />
                <span>
                  {ar.narrator.taqribRef(toArabicIndic(n.taqrib.page), toArabicIndic(n.taqrib.entryNo))}
                  {n.taqrib.url ? (
                    <>
                      {"، "}
                      <a href={n.taqrib.url} target="_blank" rel="noopener noreferrer" className="py-2">
                        {ar.narrator.sourceLink}
                      </a>
                    </>
                  ) : null}
                </span>
              </span>
            </>
          ) : (
            <p className="m-0 border border-dashed border-edge px-3.5 py-3 text-[14px] leading-[1.7] text-muted">
              {ar.narrator.noQuote}
            </p>
          )}
          <StatusBadge status={narratorStatus(n)} />
        </div>
      ) : null}

      {n.identification ? (
        <div className="flex flex-col gap-1 border-t border-line pt-4">
          <span className="text-[13px] text-muted">{ar.narrator.identification}</span>
          <p className="m-0 text-[15px] leading-[1.7] break-words">
            <b className="font-semibold">{n.identification.kind}</b>: {n.identification.note}
          </p>
        </div>
      ) : null}

      {children}
    </div>
  );
}
