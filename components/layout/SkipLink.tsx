import { ar } from "@/lib/copy/ar";

// Hidden until focused with the keyboard; jumps past the header to <main id="main">.
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only bg-paper px-4 py-2 text-[15px] font-medium text-green focus:not-sr-only focus:absolute focus:start-2 focus:top-2 focus:z-10"
    >
      {ar.skipLink}
    </a>
  );
}
