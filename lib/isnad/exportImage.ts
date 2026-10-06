// Draws the isnad tree onto a canvas and saves it as a PNG. Browser only; no data leaves the page.
// Colours are the design tokens (CLAUDE.md); sizes come from the layout, so the picture matches the screen.
import type { TreeLayout } from "./layout";

const C = {
  paper: "#FFFDF8",
  ink: "#1C1C1A",
  green: "#0E4B3B",
  gold: "#C9A45C",
  sage: "#6F8F7F",
  edge: "#7D8A84",
  muted: "#5E6B66",
  parchment: "#F5F2EB",
};

type Input = {
  layout: TreeLayout;
  labels: Record<string, string>;
  honorifics: Record<string, string>;
  /** Node ids to dim (outside the selected isnad) and edge paths to draw thick. */
  dimmed: Set<string> | null;
  highlightEdges: string[];
  /** Text under the picture (the site address and the disclaimer), already in Arabic. */
  footer: string;
  /** The «نقطة الالتقاء» tag text. */
  commonTag: string;
  fileName: string;
};

const SCALE = 3;
const FONT_SIZE = 16;
const LINE = 21.6;

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
  const { layout, labels, honorifics, dimmed, highlightEdges, footer, commonTag, fileName } = input;
  await document.fonts.ready;
  const family = getComputedStyle(document.body).fontFamily;

  const footerH = 44;
  const W = Math.ceil(layout.width);
  const H = Math.ceil(layout.height) + footerH;
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
    for (const line of wrap(ctx, labels[n.id] ?? n.id, n.box.width - 8, 3)) {
      const w = ctx.measureText(line).width;
      ctx.fillStyle = C.paper;
      ctx.fillRect(n.x - w / 2 - 3, y, w + 6, LINE);
      ctx.fillStyle = C.ink;
      ctx.fillText(line, n.x, y + 1);
      y += LINE;
    }
    const honorific = honorifics[n.id];
    if (honorific) {
      ctx.font = `400 13px ${family}`;
      const w = ctx.measureText(honorific).width;
      ctx.fillStyle = C.paper;
      ctx.fillRect(n.x - w / 2 - 3, y, w + 6, LINE);
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
    ctx.fillText(commonTag, t.x + t.w / 2, t.y + t.h / 2);
    ctx.textBaseline = "top";
  }

  ctx.strokeStyle = C.parchment;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(16, layout.height + 4);
  ctx.lineTo(W - 16, layout.height + 4);
  ctx.stroke();
  ctx.fillStyle = C.muted;
  ctx.font = `400 13px ${family}`;
  ctx.fillText(footer, W / 2, layout.height + 16);

  const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/png"));
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
