import { matchChain, type MatchRoute } from "@/lib/isnad/chainMatch";
import { parseRules } from "@/lib/parser/ruleParser";
import { tokenize } from "@/lib/parser/tokenize";
import type { ParseResult } from "@/lib/parser/types";
import { isSigha } from "@/lib/parser/words";
import { linkNames, type LinkIndex, type LinkResult } from "./linker";

// The whole /parse pipeline, shared by the page, scripts/eval-e2e.ts and scripts/hardcases.ts:
// input rules → rule parser → linker → (user choices) → chain match. Pure and deterministic; runs in the browser.

export const MAX_CHARS = 2000;
const MAX_READINGS = 32;

export type InputProblem = "empty" | "tooLong" | "notIsnad";

export type Analysis =
  | { ok: false; problem: InputProblem }
  | { ok: true; parse: ParseResult; links: LinkResult[] };

/** The input rules that apply before any reading: empty, too long. */
export function checkInput(text: string): InputProblem | null {
  if (!text.trim()) return "empty";
  if (text.length > MAX_CHARS) return "tooLong";
  return null;
}

/** Links names already read from the text (by the model or by the rules) and applies the «not an isnad» rule. */
export function analyzeParsed(text: string, parse: ParseResult, index: LinkIndex): Analysis {
  const problem = checkInput(text);
  if (problem) return { ok: false, problem };
  const hasSigha = tokenize(text).some((t) => isSigha(t.text));
  if (!parse.names.length || (!hasSigha && parse.names.length < 2)) return { ok: false, problem: "notIsnad" };
  const links = linkNames(
    parse.names.map((n) => n.text),
    index,
    { tahwil: parse.tahwil, parallel: parse.parallel },
  );
  return { ok: true, parse, links };
}

/** Rule-based reading (no model): used by the tests, the evaluation scripts and as the fallback. */
export function analyzeIsnad(text: string, index: LinkIndex): Analysis {
  const problem = checkInput(text);
  if (problem) return { ok: false, problem };
  return analyzeParsed(text, parseRules(text), index);
}

/** The narrator id used for each name: the user's choice, else a confident link, else the context suggestion. */
export function decidedIds(links: LinkResult[], choices: Record<number, string> = {}): (string | null)[] {
  return links.map((l, i) => {
    if (choices[i]) return choices[i]!;
    if (l.state === "high" || (l.state === "check" && l.byContext)) return l.best?.narratorId ?? null;
    return null;
  });
}

/**
 * Every chain the text can stand for, as lists of name indices (compiler's teacher first):
 * one per choice among parallel names («فلان وابن فلان»), and each «ح» branch joined to the last branch
 * at the narrator they share. The last branch (the full isnad) comes first.
 */
export function readings(parse: Pick<ParseResult, "names" | "tahwil" | "parallel">, ids: (string | null)[]): number[][] {
  const n = parse.names.length;
  const cuts = [0, ...parse.tahwil.filter((t) => t > 0 && t < n), n];
  const branches = cuts.slice(0, -1).map((c, k) => Array.from({ length: cuts[k + 1]! - c }, (_, j) => c + j));
  const parallel = new Set(parse.parallel);

  const expand = (branch: number[]): number[][] => {
    let out: number[][] = [[]];
    for (const i of branch) {
      if (parallel.has(i) && branch.includes(i - 1)) {
        // i stands beside i - 1: a reading takes one of the two.
        out = out.flatMap((r) => (r.at(-1) === i - 1 ? [r, [...r.slice(0, -1), i]] : [r]));
      } else out = out.map((r) => [...r, i]);
      if (out.length > MAX_READINGS) out = out.slice(0, MAX_READINGS);
    }
    return out;
  };

  const main = expand(branches.at(-1) ?? []);
  const result: number[][] = [...main];
  for (const branch of branches.slice(0, -1)) {
    for (const b of expand(branch)) {
      const joinId = ids[b.at(-1)!];
      let joined = false;
      for (const m of main) {
        const p = joinId ? m.findIndex((i) => ids[i] === joinId) : -1;
        if (p >= 0) {
          result.push([...b, ...m.slice(p + 1)]);
          joined = true;
        }
      }
      if (!joined) result.push(b);
    }
  }
  return result.slice(0, MAX_READINGS);
}

export type Found = { route: MatchRoute; reading: number[] } | null;

/** The first reading whose decided ids are exactly a route's chain. */
export function findRoute(
  parse: Pick<ParseResult, "names" | "tahwil" | "parallel">,
  links: LinkResult[],
  routes: MatchRoute[],
  choices: Record<number, string> = {},
): Found {
  const ids = decidedIds(links, choices);
  for (const reading of readings(parse, ids)) {
    const route = matchChain(
      reading.map((i) => ids[i] ?? null),
      routes,
    );
    if (route) return { route, reading };
  }
  return null;
}
