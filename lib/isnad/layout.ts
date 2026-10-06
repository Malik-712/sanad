// Positions for the isnad tree: dagre, top to bottom, the Prophet ﷺ at the top and every compiler on the bottom row.
// Pure: graph + analysis + size config in, coordinates out. Sizes follow the design CSS (Tree / TreeDesktop).
import { Graph, layout as dagreLayout } from "@dagrejs/dagre";
import type { Role } from "@/lib/data/types";
import type { Analysis } from "./analyze";
import type { IsnadGraph } from "./graph";

export type LayoutConfig = {
  /** Width of a node box; the label wraps inside it (two lines at most). */
  boxWidth: number;
  shape: Record<Role, { w: number; h: number }>;
  /** Extra half-size of the common-link ring around the node shape. */
  ring: number;
  labelGap: number;
  lineHeight: number;
  /** Rough average Arabic glyph width at the label size, to estimate one or two lines. */
  charWidth: number;
  nodeSep: number;
  rankSep: number;
  /** Height of the horizontal part of an elbow above the student. */
  elbow: number;
  tag: { w: number; h: number; gap: number };
  margin: number;
};

export const MOBILE: LayoutConfig = {
  boxWidth: 88,
  shape: { prophet: { w: 15, h: 15 }, companion: { w: 14, h: 14 }, narrator: { w: 14, h: 14 }, compiler: { w: 26, h: 20 } },
  ring: 9,
  labelGap: 5,
  lineHeight: 17.5,
  charWidth: 6.4,
  nodeSep: 10,
  rankSep: 30,
  elbow: 26,
  tag: { w: 86, h: 24, gap: 12 },
  margin: 24,
};

export const DESKTOP: LayoutConfig = {
  boxWidth: 124,
  shape: { prophet: { w: 18, h: 18 }, companion: { w: 18, h: 18 }, narrator: { w: 18, h: 18 }, compiler: { w: 32, h: 26 } },
  ring: 11,
  labelGap: 6,
  lineHeight: 21.6,
  charWidth: 7.8,
  nodeSep: 16,
  rankSep: 40,
  elbow: 32,
  tag: { w: 104, h: 28, gap: 14 },
  margin: 32,
};

export type PlacedNode = {
  id: string;
  role: Role;
  /** Centre of the shape. */
  x: number;
  y: number;
  /** Bounding box of shape + label (for hit areas and the overlap test). */
  box: { left: number; top: number; width: number; height: number };
  lines: 1 | 2;
  common: boolean;
};

export type PlacedEdge = { id: string; from: string; to: string; d: string; routeIds: string[] };

export type TreeLayout = {
  width: number;
  height: number;
  nodes: PlacedNode[];
  edges: PlacedEdge[];
  /** Small gold diamonds where a line splits. */
  branches: { id: string; x: number; y: number }[];
  /** «نقطة الالتقاء» tag next to the common link. */
  tag: { x: number; y: number; w: number; h: number } | null;
};

const round = (n: number) => Math.round(n * 10) / 10;

export function layoutTree(
  graph: IsnadGraph,
  analysis: Analysis,
  labels: Map<string, string>,
  cfg: LayoutConfig,
): TreeLayout {
  const g = new Graph();
  g.setGraph({ rankdir: "TB", ranker: "longest-path", nodesep: cfg.nodeSep, ranksep: cfg.rankSep, marginx: cfg.margin, marginy: cfg.margin });
  g.setDefaultEdgeLabel(() => ({}));

  const lines = new Map<string, 1 | 2>();
  const heights = new Map<string, number>();
  for (const n of graph.nodes.values()) {
    const label = labels.get(n.id) ?? n.id;
    const l: 1 | 2 = label.length * cfg.charWidth > cfg.boxWidth - 8 ? 2 : 1;
    lines.set(n.id, l);
    const shapeH = cfg.shape[n.role].h + (n.id === analysis.commonLink ? cfg.ring * 2 - 4 : 0);
    const h = shapeH + cfg.labelGap + l * cfg.lineHeight;
    heights.set(n.id, h);
    g.setNode(n.id, { width: cfg.boxWidth, height: h });
  }
  for (const e of graph.edges) g.setEdge(e.from, e.to);
  dagreLayout(g);

  const placed = new Map<string, PlacedNode>();
  for (const n of graph.nodes.values()) {
    const p = g.node(n.id) as { x: number; y: number; width: number; height: number };
    const common = n.id === analysis.commonLink;
    const extra = common ? cfg.ring - 2 : 0;
    const top = p.y - p.height / 2;
    const y = top + extra + cfg.shape[n.role].h / 2;
    placed.set(n.id, {
      id: n.id,
      role: n.role,
      x: round(p.x),
      y: round(y),
      box: { left: round(p.x - cfg.boxWidth / 2), top: round(top), width: cfg.boxWidth, height: round(p.height) },
      lines: lines.get(n.id) ?? 1,
      common,
    });
  }

  const half = (id: string) => {
    const n = placed.get(id) as PlacedNode;
    return cfg.shape[n.role].h / 2 + (n.common ? cfg.ring : 0);
  };

  const edges: PlacedEdge[] = graph.edges.map((e) => {
    const a = placed.get(e.from) as PlacedNode;
    const b = placed.get(e.to) as PlacedNode;
    const sy = round(a.y + half(e.from));
    const ey = round(b.y - half(e.to));
    const d =
      a.x === b.x
        ? `M${a.x} ${sy}V${ey}`
        : `M${a.x} ${sy}V${round(b.y - half(e.to) - cfg.elbow)}H${b.x}V${ey}`;
    return { id: e.id, from: e.from, to: e.to, d, routeIds: e.routeIds };
  });

  const branches = analysis.branchPoints.map((id) => {
    const a = placed.get(id) as PlacedNode;
    const node = graph.nodes.get(id);
    const childTop = Math.min(...(node?.students ?? []).map((s) => (placed.get(s) as PlacedNode).y - half(s)));
    return { id, x: a.x, y: round(childTop - cfg.elbow) };
  });

  let tag: TreeLayout["tag"] = null;
  if (analysis.commonLink) {
    const c = placed.get(analysis.commonLink) as PlacedNode;
    const y = round(c.y - cfg.tag.h / 2);
    const left = { x: round(c.x - cfg.ring - cfg.tag.gap - cfg.tag.w), y, w: cfg.tag.w, h: cfg.tag.h };
    const right = { x: round(c.x + cfg.ring + cfg.tag.gap), y, w: cfg.tag.w, h: cfg.tag.h };
    tag = [left, right].find((t) => !overlapsAny({ left: t.x, top: t.y, width: t.w, height: t.h }, [...placed.values()], c.id)) ?? left;
  }

  const graphSize = g.graph() as { width?: number; height?: number };
  let width = graphSize.width ?? 0;
  if (tag && tag.x < 0) {
    // Keep the tag inside the drawing: shift everything right.
    const shift = -tag.x + cfg.margin / 2;
    shiftAll(placed, edges, branches, tag, shift);
    width += shift;
  }
  if (tag) width = Math.max(width, tag.x + tag.w + cfg.margin / 2);
  return { width: round(width), height: round(graphSize.height ?? 0), nodes: [...placed.values()], edges, branches, tag };
}

type Box = { left: number; top: number; width: number; height: number };

export function boxesOverlap(a: Box, b: Box): boolean {
  return a.left < b.left + b.width && b.left < a.left + a.width && a.top < b.top + b.height && b.top < a.top + a.height;
}

function overlapsAny(box: Box, nodes: PlacedNode[], except: string): boolean {
  return nodes.some((n) => n.id !== except && boxesOverlap(box, n.box));
}

function shiftAll(
  placed: Map<string, PlacedNode>,
  edges: PlacedEdge[],
  branches: { x: number }[],
  tag: { x: number },
  dx: number,
): void {
  for (const n of placed.values()) {
    n.x = round(n.x + dx);
    n.box.left = round(n.box.left + dx);
  }
  for (const e of edges) {
    e.d = e.d.replace(/([MH])(-?[\d.]+)/g, (_, cmd: string, x: string) => `${cmd}${round(Number(x) + dx)}`);
  }
  for (const b of branches) b.x = round(b.x + dx);
  tag.x = round(tag.x + dx);
}
