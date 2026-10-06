// Checks all data files. Pure: takes parsed JSON, returns English error lines (file and id first).
// Used by scripts/validate-data.ts (before every build) and by the tests.
import { hadithSchema, narratorsSchema } from "./schema";
import type { Hadith, Narrator } from "./types";

export type DataFile = { file: string; json: unknown };

// A placeholder such as «[رقم الحديث]» left in a text field. Quoted grades are not checked:
// «[صحيح]» is dorar.net's own notation for a grade.
const PLACEHOLDER = /\[[^\]]*\]/;

function zodErrors(file: string, issues: { path: PropertyKey[]; message: string }[]): string[] {
  return issues.map((i) => `${file}: ${i.path.map(String).join(".") || "(root)"}: ${i.message}`);
}

export function validateData(narratorsFile: DataFile, hadithFiles: DataFile[]): string[] {
  const errors: string[] = [];

  const parsedNarrators = narratorsSchema.safeParse(narratorsFile.json);
  if (!parsedNarrators.success) return zodErrors(narratorsFile.file, parsedNarrators.error.issues);
  const narrators: Narrator[] = parsedNarrators.data;

  const narratorIds = new Set<string>();
  for (const n of narrators) {
    if (narratorIds.has(n.id)) errors.push(`${narratorsFile.file}: duplicate narrator id "${n.id}"`);
    narratorIds.add(n.id);
    if (n.role === "companion" && !n.honorificAr) {
      errors.push(`${narratorsFile.file}: companion "${n.id}" needs honorificAr`);
    }
    if (n.role !== "companion" && n.honorificAr) {
      errors.push(`${narratorsFile.file}: "${n.id}" is not a companion but has honorificAr`);
    }
  }

  const used = new Set<string>();
  const hadithIds = new Set<string>();
  const routeIds = new Set<string>();

  for (const { file, json } of hadithFiles) {
    const parsed = hadithSchema.safeParse(json);
    if (!parsed.success) {
      errors.push(...zodErrors(file, parsed.error.issues));
      // Still check the chains of a file that fails the schema, so one missing field
      // does not hide chain errors or make every narrator in it look unused.
      const rawRoutes = (json as { routes?: unknown }).routes;
      if (Array.isArray(rawRoutes)) {
        for (const raw of rawRoutes as { id?: unknown; chain?: unknown }[]) {
          if (!Array.isArray(raw.chain)) continue;
          const chain = raw.chain.filter((id): id is string => typeof id === "string");
          const at = `${file} (${String(raw.id)})`;
          for (const id of chain) {
            if (!narratorIds.has(id)) errors.push(`${at}: unknown narrator "${id}"`);
            used.add(id);
          }
          if (chain[chain.length - 1] !== "prophet") errors.push(`${at}: chain must end at "prophet"`);
        }
      }
      continue;
    }
    const h: Hadith = parsed.data;
    const base = file.split(/[\\/]/).pop() ?? file;
    if (`${h.id}.json` !== base) errors.push(`${file}: id "${h.id}" does not match the file name`);
    if (hadithIds.has(h.id)) errors.push(`${file}: duplicate hadith id "${h.id}"`);
    hadithIds.add(h.id);

    if (!h.demo) {
      for (const [field, value] of [
        ["titleAr", h.titleAr],
        ["matnAr", h.matnAr],
      ] as const) {
        if (PLACEHOLDER.test(value)) errors.push(`${file}: ${field} contains a placeholder`);
      }
    }

    for (const r of h.routes) {
      const at = `${file} (${r.id})`;
      if (routeIds.has(r.id)) errors.push(`${at}: duplicate route id`);
      routeIds.add(r.id);

      for (const id of r.chain) {
        if (!narratorIds.has(id)) errors.push(`${at}: unknown narrator "${id}"`);
        used.add(id);
      }
      if (r.chain[r.chain.length - 1] !== "prophet") errors.push(`${at}: chain must end at "prophet"`);
      if (r.sighas && r.sighas.length !== r.chain.length - 1) {
        errors.push(`${at}: sighas has ${r.sighas.length} items, expected ${r.chain.length - 1}`);
      }
      if (!h.demo) {
        for (const [field, value] of [
          ["number", r.number],
          ["volume", r.volume],
          ["page", r.page],
          ["isnadAr", r.isnadAr],
        ] as const) {
          if (value && PLACEHOLDER.test(value)) errors.push(`${at}: ${field} contains a placeholder`);
        }
      }
    }
  }

  for (const n of narrators) {
    if (!used.has(n.id)) errors.push(`${narratorsFile.file}: narrator "${n.id}" is not used in any chain`);
  }

  return errors;
}
