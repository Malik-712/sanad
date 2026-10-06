// The reader the page uses: the trained model in a Web Worker, with the rule parser as an automatic fallback
// (the model fails to load, the worker errors, or 15 seconds pass). Whichever ran is reported, so the page can say so.
import { parseRules } from "@/lib/parser/ruleParser";
import { buildResult } from "@/lib/parser/result";
import { tokenize } from "@/lib/parser/tokenize";
import type { ParseResult } from "@/lib/parser/types";
import { spansFromLabels } from "./spans";
import type { Label } from "./tagger";
import type { FromWorker, ToWorker } from "./worker";

export const LOAD_TIMEOUT_MS = 15000;

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

  const fallback = (reason: string) => {
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
      const finish = (ok: boolean, reason?: string) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        if (!ok) fallback(reason ?? "model not available");
        resolve(ok);
      };
      const timer = setTimeout(() => finish(false, "timeout"), LOAD_TIMEOUT_MS);
      try {
        worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
      } catch (e) {
        finish(false, String(e));
        return;
      }
      worker.onerror = (e) => finish(false, e.message || "worker error");
      worker.onmessage = (e: MessageEvent<FromWorker>) => {
        const m = e.data;
        if (m.type === "progress") set({ progress: m.value });
        else if (m.type === "ready") {
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
    const ok = await ready;
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
        fallback(String(e));
      }
    }
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
