// The reader the page uses: the trained model in a Web Worker, with the rule parser as an automatic fallback.
// - If the model is not ready when an analysis is asked for, the analysis waits up to 30 s (the page shows the
//   download progress); after that this analysis is read by the rules, the page says so, and the model keeps loading
//   for the next one.
// - The model is given up for good only if it errors, or makes no progress for 20 s.
import { parseRules } from "@/lib/parser/ruleParser";
import { buildResult } from "@/lib/parser/result";
import { tokenize } from "@/lib/parser/tokenize";
import type { ParseResult } from "@/lib/parser/types";
import { spansFromLabels } from "./spans";
import type { Label } from "./tagger";
import type { FromWorker, ToWorker } from "./worker";

export const WAIT_FOR_MODEL_MS = 30000;
export const STALL_MS = 20000;

export type ReaderState = { status: "idle" | "loading" | "ready" | "fallback"; progress: number; reason?: string };

export type Reader = {
  /** Starts loading the model (once). Safe to call again. */
  start(): void;
  /** Reads the names in a pasted isnad: with the model when it is ready, else with the rules. */
  read(text: string): Promise<ParseResult>;
  state(): ReaderState;
  subscribe(fn: (s: ReaderState) => void): () => void;
};

export function createReader(): Reader {
  let state: ReaderState = { status: "idle", progress: 0 };
  const listeners = new Set<(s: ReaderState) => void>();
  const set = (s: Partial<ReaderState>) => {
    state = { ...state, ...s };
    listeners.forEach((l) => l(state));
  };
  let worker: Worker | null = null;
  let ready: Promise<boolean> | null = null;
  let nextId = 1;
  const pending = new Map<number, { ok: (l: Label[]) => void; fail: (e: string) => void }>();

  const giveUp = (reason: string) => {
    if (state.status === "fallback") return;
    set({ status: "fallback", reason });
    worker?.terminate();
    worker = null;
    pending.forEach((p) => p.fail(reason));
    pending.clear();
  };

  function start() {
    if (ready) return;
    set({ status: "loading", progress: 0 });
    ready = new Promise<boolean>((resolve) => {
      let done = false;
      let stall: ReturnType<typeof setTimeout>;
      const finish = (ok: boolean, reason?: string) => {
        if (done) return;
        done = true;
        clearTimeout(stall);
        if (!ok) giveUp(reason ?? "model not available");
        resolve(ok);
      };
      // No progress for STALL_MS (the clock restarts at every progress event) → give up.
      const bump = () => {
        clearTimeout(stall);
        stall = setTimeout(() => finish(false, "stalled"), STALL_MS);
      };
      bump();
      try {
        worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
      } catch (e) {
        finish(false, String(e));
        return;
      }
      worker.onerror = (e) => finish(false, e.message || "worker error");
      worker.onmessage = (e: MessageEvent<FromWorker>) => {
        const m = e.data;
        if (m.type === "progress") {
          set({ progress: m.value });
          bump();
        } else if (m.type === "ready") {
          set({ status: "ready", progress: 1 });
          finish(true);
        } else if (m.type === "error") finish(false, m.message);
        else if (m.type === "tags") {
          pending.get(m.id)?.ok(m.labels as Label[]);
          pending.delete(m.id);
        } else if (m.type === "tagError") {
          pending.get(m.id)?.fail(m.message);
          pending.delete(m.id);
        }
      };
      worker.postMessage({ type: "load" } satisfies ToWorker);
    });
  }

  async function read(text: string): Promise<ParseResult> {
    start();
    const ok = await Promise.race([ready, new Promise<false>((r) => setTimeout(() => r(false), WAIT_FOR_MODEL_MS))]);
    if (ok && worker) {
      const tokens = tokenize(text);
      const words = tokens.map((t) => t.text);
      try {
        const labels = await new Promise<Label[]>((resolve, reject) => {
          const id = nextId++;
          pending.set(id, { ok: resolve, fail: (e) => reject(new Error(e)) });
          worker!.postMessage({ type: "tag", id, words } satisfies ToWorker);
        });
        return buildResult(text, tokens, spansFromLabels(words, labels), "model");
      } catch (e) {
        giveUp(String(e));
      }
    }
    // The model is not ready (or failed): the rules read this isnād.
    return parseRules(text);
  }

  return {
    start,
    read,
    state: () => state,
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
