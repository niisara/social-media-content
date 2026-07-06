import fs from "node:fs";
import path from "node:path";
import { CHARACTER_ROOT } from "@/lib/fs-paths";

export type ProfileResult =
  | { ok: true; slug: string; title: string; markdown: string }
  | { ok: false; reason: "character-not-found" | "profile-missing" | "profile-ambiguous" };

const PROFILE_FILE_PATTERN = /-PROFILE\.md$/i;

/**
 * Resolves and reads the single *-PROFILE.md file inside character/<slug>/, fresh from disk.
 * Convention-based (no hardcoded filenames) so a new character folder works automatically.
 * Returns a typed ok/err result; zero/multiple/missing map to a clear not-available state.
 */
export function readCharacterProfile(slug: string): ProfileResult {
  const characterDir = path.join(CHARACTER_ROOT, slug);

  // Path safety: the resolved folder must stay within CHARACTER_ROOT (reject "../" traversal).
  if (!characterDir.startsWith(CHARACTER_ROOT + path.sep)) {
    return { ok: false, reason: "character-not-found" };
  }

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(characterDir, { withFileTypes: true });
  } catch {
    return { ok: false, reason: "character-not-found" };
  }

  const matches = entries.filter((entry) => entry.isFile() && PROFILE_FILE_PATTERN.test(entry.name));

  if (matches.length === 0) return { ok: false, reason: "profile-missing" };
  if (matches.length > 1) return { ok: false, reason: "profile-ambiguous" };

  const markdown = fs.readFileSync(path.join(characterDir, matches[0]!.name), "utf8");
  return { ok: true, slug, title: deriveTitle(markdown, slug), markdown };
}

/**
 * Title from the profile's own heading + name: e.g. "# Profession Profile — Doctor" and
 * "## Name **Dr. Vikram Rao**" → "Dr. Vikram Rao — Doctor". Falls back to the slug label.
 */
function deriveTitle(markdown: string, slug: string): string {
  const h1 = markdown.match(/^#\s+(.+?)\s*$/m)?.[1]?.trim();
  const role = h1?.replace(/^Profession Profile\s*[—–-]\s*/i, "").trim();

  const nameSection = markdown.match(/^##\s+Name\s*\n+([^\n]+)/im)?.[1];
  const name = nameSection?.replace(/\*\*/g, "").trim();

  if (name && role) return `${name} — ${role}`;
  if (name) return name;
  if (role) return role;
  return slugToLabel(slug);
}

function slugToLabel(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word[0]!.toUpperCase() + word.slice(1))
    .join(" ");
}
