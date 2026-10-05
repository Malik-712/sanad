// The data schema from CLAUDE.md. Session B replaces these with types inferred from the zod schemas.

export type Verification = {
  status: "verified" | "unverified";
  checkedBy?: string;
  checkedAt?: string;
  note?: string;
};

export type Grade = { textAr: string; byAr: string; sourceUrl: string };

export type Inclusion = { textAr: string; quoteAr: string; byAr: string; sourceUrl: string };

export type Route = {
  id: string;
  book: { nameAr: string; authorAr: string; edition: string };
  number: string;
  volume?: string;
  page?: string;
  url: string;
  retrieved: string;
  method: "manual-checked" | "manual" | "automatic";
  isnadAr: string;
  chain: string[];
  sighas?: string[];
  grade: Grade | null;
  inclusion?: Inclusion;
  verification: Verification;
};

export type Hadith = {
  id: string;
  demo?: boolean;
  titleAr: string;
  matnAr: string;
  matnSource: { url: string; book: string; number: string };
  matnVariants?: { textAr: string; note: string; sourceUrl: string }[];
  routes: Route[];
};

export type Role = "prophet" | "companion" | "narrator" | "compiler";

export type Narrator = {
  id: string;
  nameAr: string;
  fullNameAr: string;
  aliasesAr: string[];
  role: Role;
  honorificAr?: "رضي الله عنه" | "رضي الله عنها" | "رضي الله عنهما";
  tabaqa?: string;
  deathAr?: string;
  identification?: { kind: "نص" | "قرينة"; note: string } | null;
  taqrib?: { quoteAr: string; entryNo: string; page: string; edition: string; url?: string };
  verification: Verification;
};

export type Status = "ok" | "check" | "none";
