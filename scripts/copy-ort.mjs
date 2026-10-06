// Copies the onnxruntime WebAssembly files that Transformers.js needs into public/ort/, so the browser loads them
// from this site and not from a CDN. Runs before dev and build (package.json); the copies are git-ignored.
import { copyFileSync, existsSync, mkdirSync, readdirSync, realpathSync } from "node:fs";
import { join } from "node:path";

// pnpm keeps onnxruntime-web next to the package that depends on it.
const hf = realpathSync(join("node_modules", "@huggingface", "transformers"));
const candidates = [join(hf, "..", "..", "onnxruntime-web"), join("node_modules", "onnxruntime-web")];
const ort = candidates.find((d) => existsSync(join(d, "dist", "ort-wasm-simd-threaded.wasm")));
if (!ort) {
  console.error("onnxruntime-web not found; run pnpm install");
  process.exit(1);
}
mkdirSync("public/ort", { recursive: true });
for (const f of ["ort-wasm-simd-threaded.mjs", "ort-wasm-simd-threaded.wasm"]) copyFileSync(join(ort, "dist", f), join("public/ort", f));
console.log("public/ort: onnxruntime wasm copied (" + readdirSync("public/ort").join(", ") + ")");
