// The data schema from CLAUDE.md, as zod. Types in lib/data/types.ts are inferred from it.
import { z } from "zod";

const text = z.string().trim().min(1);
const url = z.string().regex(/^https?:\/\/\S+$/, "must be an http(s) URL");

export const verificationSchema = z.strictObject({
  status: z.enum(["verified", "unverified"]),
  checkedBy: z.string().optional(),
  checkedAt: z.string().optional(),
  note: z.string().optional(),
});

export const gradeSchema = z.strictObject({ textAr: text, byAr: text, sourceUrl: url });

export const inclusionSchema = z.strictObject({ textAr: text, quoteAr: text, byAr: text, sourceUrl: url });

export const routeSchema = z.strictObject({
  id: text,
  book: z.strictObject({ nameAr: text, authorAr: text, edition: text }),
  number: text,
  volume: text.optional(),
  page: text.optional(),
  url,
  retrieved: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be an ISO date (YYYY-MM-DD)"),
  method: z.enum(["manual-checked", "manual", "automatic"]),
  isnadAr: text,
  chain: z.array(text).min(2),
  sighas: z.array(z.string()).optional(),
  grade: gradeSchema.nullable(),
  inclusion: inclusionSchema.optional(),
  verification: verificationSchema,
});

export const hadithSchema = z.strictObject({
  id: text,
  demo: z.boolean().optional(),
  titleAr: text,
  matnAr: text,
  matnSource: z.strictObject({ url, book: text, number: text }),
  matnVariants: z.array(z.strictObject({ textAr: text, note: text, sourceUrl: url })).optional(),
  routes: z.array(routeSchema).min(1),
});

export const roleSchema = z.enum(["prophet", "companion", "narrator", "compiler"]);

export const narratorSchema = z.strictObject({
  id: text,
  nameAr: text,
  fullNameAr: text,
  aliasesAr: z.array(z.string()),
  role: roleSchema,
  honorificAr: z.enum(["رضي الله عنه", "رضي الله عنها", "رضي الله عنهما"]).optional(),
  tabaqa: text.optional(),
  deathAr: text.optional(),
  identification: z.strictObject({ kind: z.enum(["نص", "قرينة"]), note: text }).nullable().optional(),
  taqrib: z
    .strictObject({ quoteAr: text, entryNo: text, page: text, edition: text, url: url.optional() })
    .optional(),
  verification: verificationSchema,
});

export const narratorsSchema = z.array(narratorSchema);
