import { SearchIcon } from "@/components/ui/icons";
import { ar } from "@/lib/copy/ar";

// The desktop header search (TreeDesktop): a plain form that opens Home with ?q=, so it needs no JavaScript.
export function HeaderSearch() {
  return (
    <form
      role="search"
      action="/"
      method="get"
      className="flex h-11 min-w-[240px] shrink basis-[360px] rounded-sq border-[1.5px] border-on-green-muted focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-gold focus-within:outline-solid"
    >
      <label htmlFor="top-q" className="sr-only">
        {ar.search.label}
      </label>
      <input
        id="top-q"
        name="q"
        type="search"
        placeholder={ar.search.label}
        className="min-w-0 flex-1 border-0 bg-transparent px-3.5 text-[15px] text-parchment outline-none placeholder:text-on-green-muted placeholder:opacity-100"
      />
      <button
        type="submit"
        aria-label={ar.search.button}
        className="flex w-11 flex-none cursor-pointer items-center justify-center border-0 border-s-[1.5px] border-on-green-muted bg-transparent text-parchment"
      >
        <SearchIcon />
      </button>
    </form>
  );
}
