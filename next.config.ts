import type { NextConfig } from "next";

// no-transform: the CDN must not recompress the model or the wasm (a recompressed stream failed inside Transformers.js on a Vercel preview).
const immutable = "public, max-age=31536000, immutable, no-transform";

const nextConfig: NextConfig = {
  // `next dev` would otherwise append its own block to CLAUDE.md, which only the owner edits.
  agentRules: false,
  async redirects() {
    // The paste page is now the Home page.
    return [{ source: "/parse", destination: "/", permanent: false }];
  },
  async rewrites() {
    // One static client page serves every hadith of the corpus: /c/bukhari/1 → /c.
    return [{ source: "/c/:book/:n", destination: "/c" }];
  },
  async headers() {
    return [
      { source: "/models/:path*", headers: [{ key: "Cache-Control", value: immutable }] },
      { source: "/ort/:path*", headers: [{ key: "Cache-Control", value: immutable }] },
      { source: "/corpus/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
    ];
  },
};

export default nextConfig;
