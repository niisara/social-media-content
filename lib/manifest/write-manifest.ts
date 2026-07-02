import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { manifestPathFor } from "@/lib/fs-paths";
import { EntryConflictError, EntryNotFoundError } from "@/lib/errors";
import { readManifest } from "./read-manifest";
import { ManifestEntrySchema, type ManifestEntry } from "./manifest-schema";

export { EntryConflictError, EntryNotFoundError };

/**
 * Read-modify-write targeting exactly one entry, identified by entryId.
 * Fails with EntryNotFoundError rather than partially applying if the
 * entry is gone by write time (spec FR-010a, clarification Q3).
 */
export function updateManifestEntry(
  brandSlug: string,
  entryId: string,
  mutate: (entry: ManifestEntry) => ManifestEntry,
): ManifestEntry {
  const { entries } = readManifest(brandSlug);
  const index = entries.findIndex((entry) => entry.entryId === entryId);

  if (index === -1) {
    throw new EntryNotFoundError(brandSlug, entryId);
  }

  const updated = ManifestEntrySchema.parse(mutate(entries[index]));
  const nextEntries = [...entries];
  nextEntries[index] = updated;
  writeManifestFile(brandSlug, nextEntries);
  return updated;
}

/** Appends a new entry (used for repost creation). Fails if entryId collides. */
export function appendManifestEntry(brandSlug: string, entry: ManifestEntry): ManifestEntry {
  const validated = ManifestEntrySchema.parse(entry);
  const { entries } = readManifest(brandSlug);

  if (entries.some((existing) => existing.entryId === validated.entryId)) {
    throw new EntryConflictError(brandSlug, validated.entryId);
  }

  writeManifestFile(brandSlug, [...entries, validated]);
  return validated;
}

/** Atomic write: serialize to a temp file in the same directory, then rename over the original. */
function writeManifestFile(brandSlug: string, entries: ManifestEntry[]): void {
  const filePath = manifestPathFor(brandSlug);
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });

  const yamlText = YAML.stringify({ entries });
  const tmpPath = path.join(dir, `.manifest.${process.pid}.${Date.now()}.tmp`);

  fs.writeFileSync(tmpPath, yamlText, "utf8");
  fs.renameSync(tmpPath, filePath);
}
