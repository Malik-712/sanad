// Draws the isnad tree onto a canvas and saves it as a PNG. Browser only; no data leaves the page.
// Colours are the design tokens (CLAUDE.md); sizes come from the layout, so the picture matches the screen.
// The picture is a finished sheet: gold frame, brand line, title, the tree, the legend, and the footer.
import type { TreeLayout } from "./layout";

const C = {
  paper: "#FFFDF8",
  ink: "#1C1C1A",
  green: "#0E4B3B",
  gold: "#C9A45C",
  sage: "#6F8F7F",
  edge: "#7D8A84",
  muted: "#5E6B66",
  line: "#DDD6C6",
};

export type LegendLabels = {
  prophet: string;
  companion: string;
  narrator: string;
  compiler: string;
  common: string;
  branch: string;
  selected: string;
};

type Input = {
  layout: TreeLayout;
  labels: Record<string, string>;
  honorifics: Record<string, string>;
  /** Node ids to dim (outside the selected isnad) and edge paths to draw thick. */
  dimmed: Set<string> | null;
  highlightEdges: string[];
  /** Brand line above the title, and the line under the legend (the site address and the disclaimer), already in Arabic. */
  brand: string;
  footer: string;
  site: string;
  legend: LegendLabels;
  legendNote: string;
  /** Hadith title (or the explorer's graph title) printed at the top of the sheet. */
  title: string;
  fileName: string;
};

const SCALE = 3;
const FONT_SIZE = 16;
const LINE = 21.6;
const MARGIN = 36;
const HEADER_H = 78;

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && ctx.measureText(next).width > maxWidth) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const rest = lines.splice(maxLines - 1).join(" ");
    lines.push(rest);
  }
  return lines;
}

export async function downloadTreePng(input: Input): Promise<void> {
  const { layout, labels, honorifics, dimmed, highlightEdges, brand, footer, site, legend, legendNote, title, fileName } = input;
  await document.fonts.ready;
  const family = getComputedStyle(document.body).fontFamily;

  // The sheet is at least wide enough for the legend and the title, however narrow the tree is.
  const W = Math.max(Math.ceil(layout.width) + MARGIN * 2, 760);
  const treeLeft = (W - layout.width) / 2;
  const treeTop = MARGIN + HEADER_H;

  // Measure the text blocks that depend on the sheet width before the canvas height is known.
  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) return;
  measure.direction = "rtl";
  measure.font = `400 14px ${family}`;
  const noteLines = wrap(measure, legendNote, W - MARGIN * 2 - 24, 3);
  const legendH = 78 + noteLines.length * 22;
  const footerH = 46;
  const H = Math.ceil(treeTop + layout.height + legendH + footerH + MARGIN);

  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(SCALE, SCALE);
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, W, H);
  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.lineCap = "square";

  // Gold frame, as on the logo and the tree stage.
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 2;
  ctx.strokeRect(12, 12, W - 24, H - 24);
  ctx.strokeStyle = C.green;
  ctx.lineWidth = 1;
  ctx.strokeRect(18, 18, W - 36, H - 36);

  // Header: brand line, title, and a short rule.
  ctx.fillStyle = C.muted;
  ctx.font = `500 14px ${family}`;
  ctx.fillText(brand, W / 2, MARGIN - 4);
  ctx.fillStyle = C.green;
  ctx.font = `700 26px ${family}`;
  ctx.fillText(title, W / 2, MARGIN + 22);
  ctx.fillStyle = C.gold;
  ctx.fillRect(W / 2 - 24, MARGIN + 64, 48, 3);

  ctx.save();
  ctx.translate(treeLeft, treeTop);

  // Lines: all isnads thin, the selected one thick.
  ctx.strokeStyle = C.edge;
  ctx.lineWidth = 2;
  ctx.stroke(new Path2D(layout.edges.map((e) => e.d).join(" ")));
  if (highlightEdges.length) {
    ctx.strokeStyle = C.green;
    ctx.lineWidth = 4;
    ctx.stroke(new Path2D(highlightEdges.join(" ")));
  }

  const diamond = (x: number, y: number, half: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y - half);
    ctx.lineTo(x + half, y);
    ctx.lineTo(x, y + half);
    ctx.lineTo(x - half, y);
    ctx.closePath();
  };

  for (const b of layout.branches) {
    ctx.fillStyle = C.gold;
    diamond(b.x, b.y, 7);
    ctx.fill();
  }

  for (const n of layout.nodes) {
    ctx.globalAlpha = dimmed?.has(n.id) ? 0.4 : 1;
    if (n.common) {
      ctx.strokeStyle = C.gold;
      ctx.lineWidth = 2;
      diamond(n.x, n.y, 19);
      ctx.stroke();
    }
    if (n.role === "prophet") {
      ctx.fillStyle = C.gold;
      ctx.strokeStyle = C.green;
      ctx.lineWidth = 2;
      diamond(n.x, n.y, 13);
      ctx.fill();
      ctx.stroke();
    } else if (n.role === "companion") {
      ctx.fillStyle = C.green;
      ctx.fillRect(n.x - 9, n.y - 9, 18, 18);
    } else if (n.role === "compiler") {
      ctx.fillStyle = C.ink;
      ctx.fillRect(n.x - 16, n.y - 13, 32, 26);
      ctx.strokeStyle = C.paper;
      ctx.lineWidth = 2.4;
      ctx.strokeRect(n.x - 8, n.y - 7, 7, 14);
      ctx.strokeRect(n.x + 1, n.y - 7, 7, 14);
    } else {
      ctx.fillStyle = C.paper;
      ctx.strokeStyle = C.sage;
      ctx.lineWidth = 2;
      ctx.fillRect(n.x - 8, n.y - 8, 16, 16);
      ctx.strokeRect(n.x - 8, n.y - 8, 16, 16);
    }

    // Label under the shape, wrapped like the screen (three lines at most).
    ctx.font = `${n.role === "compiler" ? 700 : 400} ${FONT_SIZE}px ${family}`;
    ctx.fillStyle = C.ink;
    const extra = n.common ? 9 : 0;
    let y = n.box.top + extra * 2 + (n.role === "compiler" ? 26 : 18) + 6;
    // The white plate behind a name is always opaque, so a line never shows through the text; only the text is dimmed.
    const alpha = dimmed?.has(n.id) ? 0.4 : 1;
    for (const line of wrap(ctx, labels[n.id] ?? n.id, n.box.width - 8, 3)) {
      const w = ctx.measureText(line).width;
      ctx.globalAlpha = 1;
      ctx.fillStyle = C.paper;
      ctx.fillRect(n.x - w / 2 - 3, y, w + 6, LINE);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = C.ink;
      ctx.fillText(line, n.x, y + 1);
      y += LINE;
    }
    const honorific = honorifics[n.id];
    if (honorific) {
      ctx.font = `400 13px ${family}`;
      const w = ctx.measureText(honorific).width;
      ctx.globalAlpha = 1;
      ctx.fillStyle = C.paper;
      ctx.fillRect(n.x - w / 2 - 3, y, w + 6, LINE);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = C.ink;
      ctx.fillText(honorific, n.x, y + 1);
    }
    ctx.globalAlpha = 1;
  }

  if (layout.tag) {
    const t = layout.tag;
    ctx.fillStyle = C.paper;
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 1.5;
    ctx.fillRect(t.x, t.y, t.w, t.h);
    ctx.strokeRect(t.x, t.y, t.w, t.h);
    ctx.font = `500 13px ${family}`;
    ctx.fillStyle = C.ink;
    ctx.textBaseline = "middle";
    ctx.fillText(legend.common, t.x + t.w / 2, t.y + t.h / 2);
    ctx.textBaseline = "top";
  }
  ctx.restore();

  // Legend: the same marks as under the tree on screen, laid out from the right (RTL).
  const ly = treeTop + layout.height + 14;
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(MARGIN, ly);
  ctx.lineTo(W - MARGIN, ly);
  ctx.stroke();

  const items: { text: string; draw: (x: number, y: number) => void }[] = [
    {
      text: legend.prophet,
      draw: (x, y) => {
        ctx.fillStyle = C.gold;
        ctx.strokeStyle = C.green;
        ctx.lineWidth = 2;
        diamond(x, y, 7);
        ctx.fill();
        ctx.stroke();
      },
    },
    {
      text: legend.companion,
      draw: (x, y) => {
        ctx.fillStyle = C.green;
        ctx.fillRect(x - 6, y - 6, 12, 12);
      },
    },
    {
      text: legend.narrator,
      draw: (x, y) => {
        ctx.strokeStyle = C.sage;
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 5, y - 5, 10, 10);
      },
    },
    {
      text: legend.compiler,
      draw: (x, y) => {
        ctx.fillStyle = C.ink;
        ctx.fillRect(x - 8, y - 6, 16, 12);
      },
    },
    {
      text: legend.common,
      draw: (x, y) => {
        ctx.strokeStyle = C.gold;
        ctx.lineWidth = 2;
        diamond(x, y, 8);
        ctx.stroke();
      },
    },
    {
      text: legend.branch,
      draw: (x, y) => {
        ctx.fillStyle = C.gold;
        diamond(x, y, 5);
        ctx.fill();
      },
    },
  ];
  if (highlightEdges.length) {
    items.push({
      text: legend.selected,
      draw: (x, y) => {
        ctx.fillStyle = C.green;
        ctx.fillRect(x - 11, y - 2, 22, 4);
      },
    });
  }
  ctx.font = `400 14px ${family}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  const rowY = ly + 26;
  let x = W - MARGIN - 12;
  for (const it of items) {
    const w = ctx.measureText(it.text).width;
    it.draw(x - 11, rowY);
    ctx.fillStyle = C.ink;
    ctx.fillText(it.text, x - 28, rowY);
    x -= w + 28 + 22;
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = C.muted;
  ctx.font = `400 14px ${family}`;
  let ny = ly + 48;
  for (const line of noteLines) {
    ctx.fillText(line, W / 2, ny);
    ny += 22;
  }

  // Footer: the disclaimer, and the site address.
  const fy = H - MARGIN - footerH + 6;
  ctx.strokeStyle = C.line;
  ctx.beginPath();
  ctx.moveTo(MARGIN, fy - 8);
  ctx.lineTo(W - MARGIN, fy - 8);
  ctx.stroke();
  ctx.fillStyle = C.muted;
  ctx.font = `400 13px ${family}`;
  ctx.fillText(footer, W / 2, fy);
  ctx.direction = "ltr";
  ctx.fillText(site, W / 2, fy + 20);

  const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/png"));
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke late: a slow device may not have started reading the file after one second.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
