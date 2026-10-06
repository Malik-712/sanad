// Types inferred from the zod schema in lib/data/schema.ts (the CLAUDE.md data schema).
import type { z } from "zod";
import type {
  gradeSchema,
  hadithSchema,
  inclusionSchema,
  narratorSchema,
  roleSchema,
  routeSchema,
  verificationSchema,
} from "./schema";

export type Verification = z.infer<typeof verificationSchema>;
export type Grade = z.infer<typeof gradeSchema>;
export type Inclusion = z.infer<typeof inclusionSchema>;
export type Route = z.infer<typeof routeSchema>;
export type Hadith = z.infer<typeof hadithSchema>;
export type Role = z.infer<typeof roleSchema>;
export type Narrator = z.infer<typeof narratorSchema>;

export type Status = "ok" | "check" | "none";
