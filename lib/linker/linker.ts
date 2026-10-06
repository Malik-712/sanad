import { stripHonorifics } from "@/lib/arabic/normalize";
import { jaroWinkler } from "./jaroWinkler";

// Links each name found in a pasted isnad to a narrator record, with a confidence and one of three states
// (docs/PHASE5_AI_LAYER.md §5.6). It never picks silently: close candidates give «يحتاج تحققًا».

export type LinkNarrator = { id: string; nameAr: string; fullNameAr: string; aliasesAr: string[]; role: string };

export type LinkIndex = {
  narrators: LinkNarrator[];
  /** "student>teacher" pairs taken from every chain in data/. */
  edges: string[];
};

export type LinkState = "high" | "check" | "none";

export type Candidate = { narratorId: string; score: number };

export type LinkResult = {
  name: string;
  /** From the name alone. Context never raises a link to "high": it only orders the choices. */
  state: LinkState;
  best?: Candidate;
  /** Top 3 in context order, shown as choices when state = "check". */
  candidates: Candidate[];
  /** In "check": a neighbouring name (a known teacher or student in data/) makes `best` the likely one, pre-selected. */
  byContext: boolean;
  /** The neighbouring name (its index) that makes `best` likely: its student, its teacher, or both. */
  context?: { student?: number; teacher?: number };
};

export const HIGH = 0.9;
export const LOW = 0.6;
export const GAP = 0.1;
export const CONTEXT_BOOST = 0.1;
const EPS = 1e-9;

/** Name form used for matching: normalised, honorifics removed, «أبي/أبا» → «أبو», inner «ابن» → «بن». */
export function linkForm(name: string): string {
  return stripHonorifics(name)
    .replace(/[^ء-ي\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w, i) => (i === 0 && /^و(ابن|ابو|ابي|ابا)$/.test(w) ? w.slice(1) : w))
    .map((w, i) => (w === "ابي" || w === "ابا" ? "ابو" : i > 0 && w === "ابن" ? "بن" : w))
    .join(" ");
}

type Entry = { id: string; forms: string[] };

export function buildEntries(narrators: LinkNarrator[]): Entry[] {
  return narrators
    .filter((n) => n.role !== "prophet")
    .map((n) => ({ id: n.id, forms: [...new Set([n.nameAr, n.fullNameAr, ...n.aliasesAr].map(linkForm).filter(Boolean))] }));
}

// Words that do not identify anyone by themselves.
const FILLER = new Set(["بن", "ابن", "بنت", "ابو", "ام", "عبد", "يعني", "هو", "وهو"]);
const WORD_MATCH = 0.8;

function informative(form: string): string[] {
  const words = form.split(" ");
  const kept = words.filter((w) => !FILLER.has(w));
  return kept.length ? kept : words;
}

/** Token-level Jaro-Winkler: each word of the name counts if it is ≥ 0.80 close to a word of the form; divided by the longer word count. */
export function tokenSimilarity(a: string, b: string): number {
  const x = informative(a);
  const y = informative(b);
  let sum = 0;
  for (const w of x) {
    const best = Math.max(0, ...y.map((v) => jaroWinkler(w, v)));
    if (best >= WORD_MATCH) sum += best;
  }
  return sum / Math.max(x.length, y.length);
}

/** Raw candidates for one name: exact form = 1.0, else the best token similarity over the record's forms. Top 5. */
export function candidatesFor(name: string, entries: Entry[]): Candidate[] {
  const form = linkForm(name);
  if (!form) return [];
  return entries
    .map((e) => ({
      narratorId: e.id,
      score: e.forms.includes(form) ? 1 : Math.max(0, ...e.forms.map((f) => tokenSimilarity(form, f))),
    }))
    .sort((a, b) => b.score - a.score || a.narratorId.localeCompare(b.narratorId))
    .slice(0, 5);
}

export function stateOf(sorted: Candidate[]): LinkState {
  const best = sorted[0]?.score ?? 0;
  const second = sorted[1]?.score ?? 0;
  if (best < LOW - EPS) return "none";
  if (best >= HIGH - EPS && best - second >= GAP - EPS) return "high";
  return "check";
}

const round = (x: number) => Math.round(x * 1000) / 1000;

/** Where the chain bends: «ح» starts a new branch; a parallel name stands beside the one before it. */
export type Structure = { tahwil?: number[]; parallel?: number[] };

/**
 * Names in text order (from the compiler's teacher up towards the Prophet ﷺ): the next name is the teacher of this one.
 */
export function linkNames(names: string[], index: LinkIndex, structure: Structure = {}): LinkResult[] {
  const entries = buildEntries(index.narrators);
  const edges = new Set(index.edges);
  const tahwil = new Set(structure.tahwil ?? []);
  const parallel = new Set(structure.parallel ?? []);
  const raw = names.map((n) => candidatesFor(n, entries));
  const plausible = (i: number | null) =>
    i === null ? [] : (raw[i] ?? []).filter((c) => c.score >= LOW - EPS).map((c) => c.narratorId);
  // The student is the name before (skipping a parallel peer); the teacher is the name after (skipping one).
  // No neighbour across «ح».
  const studentOf = (i: number): number | null => {
    if (tahwil.has(i)) return null;
    const j = parallel.has(i) ? i - 2 : i - 1;
    return j >= 0 ? j : null;
  };
  const teacherOf = (i: number): number | null => {
    const j = parallel.has(i + 1) ? i + 2 : i + 1;
    return j < names.length && !tahwil.has(j) && !tahwil.has(i + 1) ? j : null;
  };

  return names.map((name, i) => {
    const s = studentOf(i);
    const t = teacherOf(i);
    const students = plausible(s);
    const teachers = plausible(t);
    const base = raw[i] ?? [];
    const state = stateOf(base);
    // +0.10 for a known student next to it, +0.10 for a known teacher. The order uses the boosted score
    // (it may pass 1.0, so that context can break a tie between exact matches); the shown score does not.
    const boosted = base.map((c) => {
      const byStudent = students.some((x) => edges.has(`${x}>${c.narratorId}`));
      const byTeacher = teachers.some((x) => edges.has(`${c.narratorId}>${x}`));
      return { ...c, byStudent, byTeacher, rank: c.score + CONTEXT_BOOST * (Number(byStudent) + Number(byTeacher)) };
    });
    boosted.sort((a, b) => b.rank - a.rank || b.score - a.score || a.narratorId.localeCompare(b.narratorId));
    const shown = boosted.map((c) => ({ narratorId: c.narratorId, score: round(c.score) }));
    // Context suggests one only if the boosted order separates it from the next candidate by the full gap.
    const [first, second] = boosted;
    const byContext =
      state === "check" && !!first && first.rank > first.score && first.rank - (second?.rank ?? 0) >= GAP - EPS && first.score >= LOW - EPS;
    // The neighbour that tells the two apart (shown in the chooser: «الأقرب …، لأن الحميدي يروي عنه في أسانيدنا»).
    const context =
      byContext && first
        ? {
            ...(first.byStudent && !second?.byStudent && s !== null ? { student: s } : {}),
            ...(first.byTeacher && !second?.byTeacher && t !== null ? { teacher: t } : {}),
          }
        : undefined;
    return {
      name,
      state,
      ...(state !== "none" && shown[0] ? { best: shown[0] } : {}),
      candidates: state === "none" ? [] : shown.filter((c) => c.score >= LOW - EPS).slice(0, 3),
      byContext,
      ...(context ? { context } : {}),
    };
  });
}

/** "student>teacher" pairs from route chains (each chain runs from the compiler up to the Prophet ﷺ). */
export function chainEdges(chains: string[][]): string[] {
  const out = new Set<string>();
  for (const chain of chains) for (let i = 0; i + 1 < chain.length; i++) out.add(`${chain[i]}>${chain[i + 1]}`);
  return [...out];
}
