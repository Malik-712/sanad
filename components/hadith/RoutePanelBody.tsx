import { buttonPrimary } from "@/components/ui/buttons";
import { Diamond } from "@/components/ui/Diamond";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ar } from "@/lib/copy/ar";
import { citationText } from "@/lib/data/cite";
import { routePlace, routeStatus } from "@/lib/data/derive";
import { siteName } from "@/lib/data/sources";
import type { Route } from "@/lib/data/types";
import { ChainList, type ChainRow } from "./ChainList";
import { CopyCitation } from "./CopyCitation";

// The body of the source panel (design «لوحة المصدر»). Every value comes from the route record;
// a grade is shown only as a quote with who said it and where.
function SourceRef({ by, url }: { by: string; url: string }) {
  return (
    <span className="flex items-center gap-2 text-[13px] text-muted">
      <Diamond size={7} />
      <span>
        {by}،{" "}
        <a href={url} target="_blank" rel="noopener noreferrer" className="py-2">
          {ar.hadith.gradeSource}
        </a>
      </span>
    </span>
  );
}

export function RoutePanelBody({ route, chain, links }: { route: Route; chain: ChainRow[]; links: string[] }) {
  return (
    <div className="flex flex-col gap-[18px] p-5 lg:px-6 lg:pt-5 lg:pb-6">
      <div className="flex flex-col gap-1.5">
        <StatusBadge status={routeStatus(route)} />
        <p className="m-0 text-[14px] leading-[1.7] text-muted">{ar.about.statusText[routeStatus(route)]}</p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[14px] font-medium">{ar.hadith.isnadText}</span>
        <p className="m-0 text-[19px] leading-[2] break-words">{route.isnadAr}</p>
        {route.verification.note ? (
          <p className="m-0 text-[13px] leading-[1.7] break-words text-muted">{route.verification.note}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 border-t border-line pt-4">
        <span className="text-[14px] font-medium">{ar.hadith.chainLabel}</span>
        <ChainList rows={chain} links={links} label={ar.hadith.chainAria} />
      </div>

      <dl className="m-0 grid grid-cols-1 gap-3.5 border-t border-line pt-4">
        <div className="flex flex-col gap-0.5">
          <dt className="text-[13px] text-muted">{ar.hadith.place}</dt>
          <dd className="m-0 text-[15px]">{routePlace(route)}</dd>
        </div>
        <div className="flex flex-col gap-1.5">
          <dt className="text-[13px] text-muted">{ar.hadith.grade}</dt>
          {route.grade ? (
            // The ruling as quoted: its text, who said it, and where we read it (owner, 6 Oct).
            <dd className="m-0 flex flex-col gap-1">
              <span className="text-[15px]">«{route.grade.textAr}»</span>
              <span className="text-[14px]">
                {ar.hadith.gradeBy}: {route.grade.byAr}
              </span>
              <span className="text-[14px]">
                {ar.hadith.gradeFrom}: {siteName(route.grade.sourceUrl) ?? ar.hadith.notMentioned}،{" "}
                <a href={route.grade.sourceUrl} target="_blank" rel="noopener noreferrer" className="py-2">
                  {ar.hadith.gradeSource}
                </a>
              </span>
            </dd>
          ) : (
            <dd className="m-0 text-[15px]">{ar.hadith.noGrade}</dd>
          )}
          {route.inclusion ? (
            <dd className="m-0 flex flex-col gap-1 pt-2">
              <span className="text-[15px] font-medium">{route.inclusion.textAr}</span>
              <blockquote className="m-0 text-[15px] leading-[1.9]">«{route.inclusion.quoteAr}»</blockquote>
              <SourceRef by={route.inclusion.byAr} url={route.inclusion.sourceUrl} />
            </dd>
          ) : null}
        </div>
      </dl>

      <p className="m-0 flex items-start gap-2.5 text-[14px] leading-[1.7] text-muted">
        <Diamond size={7} className="mt-[9px]" />
        {ar.sourceNote}
      </p>

      <div className="flex flex-wrap gap-2.5">
        <a
          href={route.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonPrimary} flex-[1_1_180px] px-4 text-[15px]`}
        >
          {ar.hadith.openSource}
        </a>
        <CopyCitation text={citationText(route)} label={ar.hadith.copy} doneLabel={ar.hadith.copied} />
      </div>
    </div>
  );
}
