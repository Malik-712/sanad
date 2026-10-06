/// <reference lib="webworker" />
// The browser worker: loads the tagger once and labels words on request. Runs off the main thread so the page
// stays responsive while the model loads. It only fetches files of this site (model, wasm); the pasted text is
// passed in as words and never sent anywhere.
import { createTagger, type Tagger } from "./tagger";

export type ToWorker = { type: "load" } | { type: "tag"; id: number; words: string[] };
export type FromWorker =
  | { type: "progress"; value: number }
  | { type: "ready" }
  | { type: "error"; message: string }
  | { type: "tags"; id: number; labels: string[] }
  | { type: "tagError"; id: number; message: string };

let tagger: Tagger | null = null;
const post = (m: FromWorker) => (self as unknown as Worker).postMessage(m);

self.onmessage = async (e: MessageEvent<ToWorker>) => {
  const msg = e.data;
  if (msg.type === "load") {
    try {
      tagger = await createTagger({
        localModelPath: "/models/",
        wasmPath: "/ort/",
        onProgress: (value) => post({ type: "progress", value }),
      });
      post({ type: "ready" });
    } catch (err) {
      post({ type: "error", message: String(err) });
    }
  } else if (msg.type === "tag") {
    try {
      if (!tagger) throw new Error("model not loaded");
      post({ type: "tags", id: msg.id, labels: await tagger.tag(msg.words) });
    } catch (err) {
      post({ type: "tagError", id: msg.id, message: String(err) });
    }
  }
};
