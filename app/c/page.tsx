import type { Metadata } from "next";
import { CorpusHadith } from "@/components/explorer/CorpusHadith";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ar } from "@/lib/copy/ar";

export const metadata: Metadata = { title: ar.corpusHadith.metaTitle };

// One static page serves every hadith of the corpus (/c/<book>/<n> is rewritten to /c in next.config.ts);
// the hadith is looked up in the browser from the shipped files.
export default function CorpusHadithPage() {
  return (
    <>
      <CorpusHadith />
      <SiteFooter variant="green" />
    </>
  );
}
