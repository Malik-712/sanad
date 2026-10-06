"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { TreeLegend } from "@/components/hadith/TreePlaceholder";
import { GoldFrame } from "@/components/ui/GoldFrame";
import { toArabicIndic } from "@/lib/arabic/digits";
import { ar } from "@/lib/copy/ar";
import { downloadTreePng } from "@/lib/isnad/exportImage";
import type { TreeLayout } from "@/lib/isnad/layout";

// The isnad tree as in design/screens/Tree.dc.html (mobile) and TreeDesktop.dc.html (≥1024px):
// SVG lines, node buttons laid over them, pan by drag, zoom by buttons / wheel / pinch.
export type Selection = { kind: "route" | "narrator"; id: string } | null;

type Props = {
  mobile: TreeLayout;
  desktop: TreeLayout;
  labels: Record<string, string>;
  /** A companion's honorific, shown on a small line under the name. */
  honorifics: Record<string, string>;
  arias: Record<string, string>;
  /** Narrator ids of each route, for dimming nodes outside the selected route. */
  routeNodes: Record<string, string[]>;
  selection: Selection;
  onSelectNarrator: (id: string) => void;
};

export function IsnadTree(props: Props) {
  return (
    <section
      aria-label={ar.hadith.treeLabel}
      className="flex flex-col overflow-hidden rounded-sq border-[1.5px] border-ink bg-paper"
    >
      <div className="lg:hidden">
        <TreeCanvas {...props} layout={props.mobile} variant="mobile" />
      </div>
      <div className="hidden lg:block">
        <TreeCanvas {...props} layout={props.desktop} variant="desktop" />
      </div>
      <TreeLegend />
    </section>
  );
}

const MAX_ZOOM = 2.5;
// Start fitted to the width, but never below the design's 60% so names stay readable;
// a wide tree then opens on its top (the Prophet ﷺ), and zooming out shows all of it.
const startZoom = (fit: number, cap: number) => Math.min(cap, Math.max(fit, 0.6));
const STEP = 0.2;

function TreeCanvas({
  layout,
  desktop: desktopTree,
  variant,
  labels,
  honorifics,
  arias,
  routeNodes,
  selection,
  onSelectNarrator,
}: Props & { layout: TreeLayout; variant: "mobile" | "desktop" }) {
  const vpRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(1);
  const [view, setView] = useState({ z: 1, px: 0, py: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number; moved: boolean } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; z: number } | null>(null);
  const wasDrag = useRef(false);
  const minZoom = Math.min(0.6, fit);
  // The wide desktop canvas may open larger than 100% so the tree fills it.
  const fitCap = variant === "desktop" ? 1.35 : 1;
  // Open on the Prophet ﷺ: shift the drawing so his node sits in the middle of the viewport.
  const topNode = layout.nodes.find((n) => n.role === "prophet");
  const startView = useCallback(
    (f: number) => {
      const z = startZoom(f, fitCap);
      const px = topNode ? -(topNode.x - layout.width / 2) * z : 0;
      return { z, px: z > f ? px : 0, py: 0 };
    },
    [topNode, layout.width, fitCap],
  );

  // Fit the drawing to the viewport width on first paint and on resize.
  useLayoutEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const update = () => {
      const w = vp.clientWidth;
      if (!w) return;
      const f = Math.min(fitCap, (w - 24) / layout.width);
      setFit(f);
      setView(startView(f));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(vp);
    return () => ro.disconnect();
  }, [layout.width, startView, fitCap]);

  const zoomBy = useCallback(
    (delta: number) =>
      setView((v) => ({ ...v, z: Math.min(MAX_ZOOM, Math.max(Math.min(0.6, fit), +(v.z + delta).toFixed(2))) })),
    [fit],
  );

  // Wheel zoom needs a non-passive listener to keep the page from scrolling.
  useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomBy(e.deltaY < 0 ? STEP / 2 : -STEP / 2);
    };
    vp.addEventListener("wheel", onWheel, { passive: false });
    return () => vp.removeEventListener("wheel", onWheel);
  }, [zoomBy]);

  const inRoute = selection?.kind === "route" ? new Set(routeNodes[selection.id] ?? []) : null;
  const selectedNode = selection?.kind === "narrator" ? selection.id : null;
  const hiEdges = layout.edges.filter((e) =>
    selection?.kind === "route" ? e.routeIds.includes(selection.id) : selectedNode ? e.from === selectedNode || e.to === selectedNode : false,
  );
  const hiKey = selection ? `${selection.kind}:${selection.id}` : "none";

  const desktop = variant === "desktop";
  // Each control says what it does (owner, 6 Oct): a tooltip everywhere, and visible words on desktop.
  // Mobile buttons are icon-only, so they carry an aria-label; desktop buttons are named by their text.
  const control = (label: string, shortLabel: string, onClick: () => void, icon: string) => (
    <button
      type="button"
      className={`${zoomBtn} ${desktop ? "gap-1.5 px-3 text-[14px] whitespace-nowrap" : ""}`}
      title={label}
      aria-label={desktop ? undefined : label}
      onClick={onClick}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
        <path d={icon} />
      </svg>
      {desktop ? <span>{shortLabel}</span> : null}
    </button>
  );
  const saveImage = () =>
    downloadTreePng({
      layout: desktopTree,
      labels,
      honorifics,
      dimmed: inRoute ? new Set(desktopTree.nodes.map((n) => n.id).filter((id) => !inRoute.has(id))) : null,
      highlightEdges: desktopTree.edges
        .filter((e) =>
          selection?.kind === "route" ? e.routeIds.includes(selection.id) : selectedNode ? e.from === selectedNode || e.to === selectedNode : false,
        )
        .map((e) => e.d),
      footer: ar.tree.downloadFooter,
      commonTag: ar.legend.common,
      fileName: ar.tree.downloadFile,
    });
  const zoomButtons = (
    <>
      {control(ar.tree.zoomIn, ar.tree.zoomIn, () => zoomBy(STEP), "M12 5v14M5 12h14")}
      {desktop ? (
        <span className="min-w-[52px] text-center text-[15px]" aria-live="polite">
          {ar.tree.zoomPct(toArabicIndic(Math.round(view.z * 100)))}
        </span>
      ) : null}
      {control(ar.tree.zoomOut, ar.tree.zoomOut, () => zoomBy(-STEP), "M5 12h14")}
      {control(ar.tree.reset, ar.tree.resetShort, () => setView(startView(fit)), "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5")}
      {control(ar.tree.download, ar.tree.downloadShort, saveImage, "M12 4v11M7 11l5 5 5-5M5 20h14")}
    </>
  );

  return (
    <div className="flex flex-col">
      {desktop ? (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b-[1.5px] border-ink py-2 ps-4 pe-2">
          <span className="text-[14px] text-muted">{ar.tree.hintDesktop}</span>
          <div className="flex items-center gap-1.5">{zoomButtons}</div>
        </div>
      ) : null}
      <div
        ref={vpRef}
        className={`relative cursor-grab touch-none overflow-hidden bg-paper select-none active:cursor-grabbing ${desktop ? "h-[max(700px,calc(100vh-150px))]" : "h-[560px]"}`}
        onPointerDown={(e) => {
          pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
          if (pointers.current.size === 2) {
            const [a, b] = [...pointers.current.values()] as [{ x: number; y: number }, { x: number; y: number }];
            pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), z: view.z };
            drag.current = null;
            return;
          }
          wasDrag.current = false;
          drag.current = { x: e.clientX, y: e.clientY, px: view.px, py: view.py, moved: false };
        }}
        onPointerMove={(e) => {
          if (!pointers.current.has(e.pointerId)) return;
          pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
          if (pinch.current && pointers.current.size === 2) {
            const [a, b] = [...pointers.current.values()] as [{ x: number; y: number }, { x: number; y: number }];
            const ratio = Math.hypot(a.x - b.x, a.y - b.y) / pinch.current.dist;
            const z = Math.min(MAX_ZOOM, Math.max(minZoom, +(pinch.current.z * ratio).toFixed(2)));
            setView((v) => ({ ...v, z }));
            wasDrag.current = true;
            return;
          }
          const d = drag.current;
          if (!d) return;
          const dx = e.clientX - d.x;
          const dy = e.clientY - d.y;
          if (!d.moved && Math.abs(dx) + Math.abs(dy) < 5) return;
          if (!d.moved) (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          d.moved = true;
          setView((v) => ({ ...v, px: d.px + dx, py: d.py + dy }));
        }}
        onPointerUp={(e) => {
          pointers.current.delete(e.pointerId);
          if (pointers.current.size < 2) pinch.current = null;
          if (drag.current) wasDrag.current = drag.current.moved || wasDrag.current;
          drag.current = null;
        }}
        onPointerCancel={(e) => {
          pointers.current.delete(e.pointerId);
          pinch.current = null;
          drag.current = null;
        }}
      >
        {desktop ? null : <GoldFrame inset="8px" />}
        <div
          className="absolute top-2.5 left-1/2 origin-top"
          style={{
            width: layout.width,
            height: layout.height,
            marginLeft: -layout.width / 2,
            transform: `translate(${view.px}px, ${view.py}px) scale(${view.z})`,
          }}
        >
          <svg
            width={layout.width}
            height={layout.height}
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            aria-hidden="true"
            className="absolute top-0 left-0 overflow-visible"
          >
            <path d={layout.edges.map((e) => e.d).join(" ")} fill="none" stroke="var(--color-edge)" strokeWidth="2" strokeLinecap="square" />
            {hiEdges.length ? (
              <path
                key={hiKey}
                className="tree-draw"
                d={hiEdges.map((e) => e.d).join(" ")}
                fill="none"
                stroke="var(--color-green)"
                strokeWidth="4"
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
            ) : null}
          </svg>

          {layout.branches.map((b) => (
            <span
              key={b.id}
              aria-hidden="true"
              className={`absolute rotate-45 bg-gold ${desktop ? "-mt-[5px] -ml-[5px] size-2.5" : "-mt-1 -ml-1 size-2"}`}
              style={{ left: b.x, top: b.y }}
            />
          ))}

          {layout.tag ? (
            <span
              aria-hidden="true"
              className={`absolute flex items-center border-[1.5px] border-gold bg-paper whitespace-nowrap text-ink ${desktop ? "px-2.5 text-[13px]" : "px-2 text-[12px]"} font-medium`}
              style={{ left: layout.tag.x, top: layout.tag.y, height: layout.tag.h }}
            >
              {ar.legend.common}
            </span>
          ) : null}

          {layout.nodes.map((n) => {
            const on = selectedNode === n.id;
            const dim = inRoute ? !inRoute.has(n.id) : false;
            return (
              <button
                key={n.id}
                type="button"
                aria-label={arias[n.id]}
                aria-pressed={on}
                onClick={() => {
                  if (wasDrag.current) {
                    wasDrag.current = false;
                    return;
                  }
                  onSelectNarrator(n.id);
                }}
                className="group absolute flex cursor-pointer flex-col items-center border-0 bg-transparent p-0 text-ink focus-visible:outline-none"
                style={{ left: n.box.left, top: n.box.top, width: n.box.width, minHeight: 44 }}
              >
                <Shape role={n.role} common={n.common} desktop={desktop} dim={dim} />
                <span
                  className={`line-clamp-3 max-w-full px-[3px] text-center leading-[1.35] group-hover:underline group-hover:underline-offset-4 group-focus-visible:outline-[3px] group-focus-visible:outline-offset-2 group-focus-visible:outline-green group-focus-visible:outline-solid ${
                    desktop ? "mt-1.5 text-[16px]" : "mt-[5px] text-[13px]"
                  } ${n.role === "compiler" ? "font-bold" : ""} ${on ? "bg-green text-parchment" : dim ? "bg-paper text-muted" : "bg-paper"}`}
                >
                  {labels[n.id]}
                </span>
                {honorifics[n.id] ? (
                  <span className={`bg-paper px-[3px] text-center leading-[1.35] ${desktop ? "text-[13px]" : "text-[12px]"} ${dim ? "text-muted" : "text-ink"}`}>
                    {honorifics[n.id]}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {desktop ? null : (
          <div className="absolute top-[18px] left-[18px] flex flex-col gap-1.5">{zoomButtons}</div>
        )}
      </div>
      {desktop ? null : <p className="m-0 px-3.5 pt-2 text-[13px] text-muted">{ar.tree.hintMobile}</p>}
    </div>
  );
}

const zoomBtn =
  "flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-sq border-[1.5px] border-ink bg-paper p-0 text-ink hover:bg-hover";

function Shape({ role, common, desktop, dim }: { role: string; common: boolean; desktop: boolean; dim: boolean }) {
  const s = desktop ? 18 : role === "prophet" ? 15 : 14;
  const ring = desktop ? 28 : 22;
  const extra = common ? (desktop ? 9 : 7) : 0;
  let shape;
  if (role === "prophet") shape = <span className="rotate-45 border-2 border-green bg-gold" style={{ width: s, height: s }} />;
  else if (role === "companion") shape = <span className="bg-green" style={{ width: s, height: s }} />;
  else if (role === "compiler")
    shape = (
      <span className="flex items-center justify-center bg-ink text-paper" style={{ width: desktop ? 32 : 26, height: desktop ? 26 : 20 }}>
        <svg width={desktop ? 16 : 13} height={desktop ? 16 : 13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={desktop ? 2.4 : 2.6} strokeLinecap="square" aria-hidden="true">
          <path d="M4 5h7v15H4zM13 5h7v15h-7z" />
        </svg>
      </span>
    );
  else shape = <span className="border-2 border-sage bg-paper" style={{ width: s, height: s }} />;

  return (
    <span className={`relative flex flex-none items-center justify-center ${dim ? "opacity-40" : ""}`} style={{ paddingTop: extra, paddingBottom: extra }}>
      {common ? (
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 rotate-45 border-2 border-gold"
          style={{ width: ring, height: ring, marginLeft: -ring / 2, marginTop: -ring / 2 }}
        />
      ) : null}
      {shape}
    </span>
  );
}
