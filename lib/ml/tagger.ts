// The narrator tagger (BERT-mini fine-tuned on Sanadset, int8 ONNX, public/models/sanad-ner) running through
// Transformers.js. The same code runs in the browser worker (lib/ml/worker.ts) and in Node (scripts/check-tagger.ts).
// It labels each word O / B-NAR / I-NAR; names and transmission words are then built by lib/parser/result.ts.
import { AutoModelForTokenClassification, AutoTokenizer, Tensor, env } from "@huggingface/transformers";

export type Label = "O" | "B-NAR" | "I-NAR";
const LABELS: Label[] = ["O", "B-NAR", "I-NAR"];
const MAX_SUBWORDS = 254; // 256 less [CLS] and [SEP]
const CLS = 2;
const SEP = 3;

export type Tagger = { tag(words: string[]): Promise<Label[]> };

export async function createTagger(opts: {
  /** Folder that contains «sanad-ner/»: «/models/» in the browser, an absolute path in Node. */
  localModelPath: string;
  /** Browser only: folder with the onnxruntime WebAssembly files, served by this site (no CDN). */
  wasmPath?: string;
  onProgress?: (fraction: number) => void;
}): Promise<Tagger> {
  // Only the files shipped with the site; nothing is requested from another origin.
  env.allowRemoteModels = false;
  env.allowLocalModels = true;
  env.localModelPath = opts.localModelPath;
  if (opts.wasmPath) {
    const wasm = env.backends.onnx.wasm;
    if (wasm) {
      // The plain (smallest) build, named explicitly: onnxruntime would otherwise pick a larger variant we do not ship.
      wasm.wasmPaths = { mjs: `${opts.wasmPath}ort-wasm-simd-threaded.mjs`, wasm: `${opts.wasmPath}ort-wasm-simd-threaded.wasm` };
      wasm.numThreads = 1; // no cross-origin isolation on a static site
    }
  }
  const tokenizer = await AutoTokenizer.from_pretrained("sanad-ner");
  const model = await AutoModelForTokenClassification.from_pretrained("sanad-ner", {
    dtype: "q8",
    ...(opts.wasmPath ? { device: "wasm" as const } : {}),
    progress_callback: (p: { status?: string; progress?: number }) => {
      if (p.status === "progress" && typeof p.progress === "number") opts.onProgress?.(p.progress / 100);
    },
  });

  return {
    async tag(words) {
      // Each word is tokenised on its own; the label goes on its first sub-word (as in training).
      const ids: number[] = [CLS];
      const first: number[] = []; // position of the first sub-word of each kept word, -1 if cut
      for (const w of words) {
        const pieces = tokenizer.encode(w, { add_special_tokens: false });
        if (!pieces.length || ids.length + pieces.length > MAX_SUBWORDS + 1) {
          first.push(-1);
          continue;
        }
        first.push(ids.length);
        ids.push(...pieces);
      }
      ids.push(SEP);
      const n = ids.length;
      const mk = (a: number[]) => new Tensor("int64", BigInt64Array.from(a.map(BigInt)), [1, n]);
      const out = await model({ input_ids: mk(ids), attention_mask: mk(ids.map(() => 1)), token_type_ids: mk(ids.map(() => 0)) });
      const logits = out.logits.data as Float32Array;
      const labels = first.map((pos): Label => {
        if (pos < 0) return "O";
        let best = 0;
        for (let c = 1; c < 3; c++) if (logits[pos * 3 + c]! > logits[pos * 3 + best]!) best = c;
        return LABELS[best]!;
      });
      // An I-NAR that does not follow a name starts one (same repair as ml/predict.py).
      return labels.map((l, i) => (l === "I-NAR" && (i === 0 || labels[i - 1] === "O") ? "B-NAR" : l));
    },
  };
}
