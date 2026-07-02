import fs from "node:fs";
import YAML from "yaml";
import { manifestPathFor } from "@/lib/fs-paths";
import { ManifestEntrySchema, type ManifestEntry } from "./manifest-schema";

export interface ManifestReadResult {
  brand: string;
  fileExists: boolean;
  entries: ManifestEntry[];
  malformedEntries: { index: number; reason: string }[];
}

/** Reads and validates a brand's manifest fresh from disk (spec FR-005a — no caching). */
export function readManifest(brandSlug: string): ManifestReadResult {
  const filePath = manifestPathFor(brandSlug);

  if (!fs.existsSync(filePath)) {
    return { brand: brandSlug, fileExists: false, entries: [], malformedEntries: [] };
  }

  const raw = fs.readFileSync(filePath, "utf8");
  let parsed: unknown;
  try {
    parsed = YAML.parse(raw) ?? {};
  } catch (error) {
    return {
      brand: brandSlug,
      fileExists: true,
      entries: [],
      malformedEntries: [
        { index: -1, reason: `Manifest YAML could not be parsed: ${(error as Error).message}` },
      ],
    };
  }

  const rawEntries = Array.isArray((parsed as { entries?: unknown }).entries)
    ? (parsed as { entries: unknown[] }).entries
    : [];

  const entries: ManifestEntry[] = [];
  const malformedEntries: { index: number; reason: string }[] = [];

  rawEntries.forEach((rawEntry, index) => {
    const result = ManifestEntrySchema.safeParse(rawEntry);
    if (result.success) {
      entries.push(result.data);
    } else {
      malformedEntries.push({ index, reason: result.error.message });
    }
  });

  return { brand: brandSlug, fileExists: true, entries, malformedEntries };
}
