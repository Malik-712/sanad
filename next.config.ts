import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `next dev` would otherwise append its own block to CLAUDE.md, which only the owner edits.
  agentRules: false,
};

export default nextConfig;
