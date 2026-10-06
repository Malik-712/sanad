// Loads the shipped corpus files in the browser: the name index once (about 2 MB), and the isnad texts of the
// hadiths that are shown, 200 at a time. Everything comes from this site's own static files.
import { CORPUS_BOOKS, bookById } from "@/lib/corpus/books";
import { createIndex, type CorpusIndex } from "./match";

export type Manifest = {
  pinnedCommit: string;
  total: number;
  chunkSize: number;
  books: { id: string; count: number; offset: number; chunks: number }[];
};

export type Corpus = { index: CorpusIndex; manifest: Manifest };

let manifestLoading: Promise<Manifest> | null = null;

/** The book list and counts (a few hundred bytes): enough to find one hadith without the name index. */
export function loadManifest(base = "/corpus"): Promise<Manifest> {
  manifestLoading ??= fetch(`${base}/manifest.json`).then((r) => {
    if (!r.ok) throw new Error(`manifest: ${r.status}`);
    return r.json() as Promise<Manifest>;
  });
  return manifestLoading;
}

let loading: Promise<Corpus> | null = null;

export function loadCorpus(base = "/corpus"): Promise<Corpus> {
  loading ??= (async () => {
    const get = async <T>(file: string): Promise<T> => {
      const r = await fetch(`${base}/${file}`);
      if (!r.ok) throw new Error(`${file}: ${r.status}`);
      return (await r.json()) as T;
    };
    const [manifest, names, idx] = await Promise.all([
      get<Manifest>("manifest.json"),
      get<{ dict: string[]; h: number[][] }>("names.json"),
      get<Record<string, number[]>>("idx.json"),
    ]);
    return { manifest, index: createIndex(names.dict, names.h, idx) };
  })().catch((e) => {
    loading = null; // allow a retry
    throw e;
  });
  return loading;
}

/** Which book and which position in the book a global hadith id is. */
export function locate(manifest: Manifest, gid: number): { book: string; pos: number } {
  for (let i = manifest.books.length - 1; i >= 0; i--) {
    const b = manifest.books[i]!;
    if (gid >= b.offset) return { book: b.id, pos: gid - b.offset };
  }
  return { book: manifest.books[0]!.id, pos: gid };
}

export type DocRef = { gid: number; book: string; pos: number; number: number; text: string };

type Chunk = { n: number[]; t: string[] };
const chunkCache = new Map<string, Promise<Chunk>>();

function loadChunk(book: string, k: number, base: string): Promise<Chunk> {
  const key = `${book}-${k}`;
  let p = chunkCache.get(key);
  if (!p) {
    p = fetch(`${base}/docs/${key}.json`).then((r) => {
      if (!r.ok) throw new Error(`${key}: ${r.status}`);
      return r.json() as Promise<Chunk>;
    });
    chunkCache.set(key, p);
  }
  return p;
}

/** The global id of the hadith with this number in a book (numbers rise through the book), or null. */
export async function findByNumber(manifest: Manifest, book: string, number: number, base = "/corpus"): Promise<number | null> {
  const b = manifest.books.find((x) => x.id === book);
  if (!b) return null;
  // Numbers rise through the book and are nearly one per hadith, so the chunk is usually the one at (number - 1) / size.
  let lo = 0;
  let hi = b.chunks - 1;
  let mid = Math.min(hi, Math.max(0, Math.floor((number - 1) / manifest.chunkSize)));
  while (lo <= hi) {
    const chunk = await loadChunk(book, mid, base);
    const first = chunk.n[0]!;
    const last = chunk.n[chunk.n.length - 1]!;
    if (number < first) hi = mid - 1;
    else if (number > last) lo = mid + 1;
    else {
      const i = chunk.n.indexOf(number);
      return i < 0 ? null : b.offset + mid * manifest.chunkSize + i;
    }
    mid = (lo + hi) >> 1;
  }
  return null;
}

/** The hadith number and isnad text of each global id (loads the 200-hadith files that contain them). */
export async function loadDocs(manifest: Manifest, gids: number[], base = "/corpus"): Promise<Map<number, DocRef>> {
  const out = new Map<number, DocRef>();
  await Promise.all(
    gids.map(async (gid) => {
      const { book, pos } = locate(manifest, gid);
      const chunk = await loadChunk(book, Math.floor(pos / manifest.chunkSize), base);
      const i = pos % manifest.chunkSize;
      out.set(gid, { gid, book, pos, number: chunk.n[i]!, text: chunk.t[i]! });
    }),
  );
  return out;
}

export const bookName = (id: string) => bookById(id)?.nameAr ?? id;
export const bookShort = (id: string) => bookById(id)?.shortAr ?? id;
export const bookOrder = CORPUS_BOOKS.map((b) => b.id);
