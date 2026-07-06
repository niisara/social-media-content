"use client";

import Link from "next/link";
import { useId, useState } from "react";
import type { Character } from "@/lib/character/list-characters";

interface CharacterSelectProps {
  characters: Character[];
  /** Slug to pre-select (e.g. restored from ?character= when returning from a profile). */
  initialSlug?: string | null;
}

export function CharacterSelect({ characters, initialSlug }: CharacterSelectProps) {
  const selectId = useId();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(() =>
    initialSlug && characters.some((c) => c.slug === initialSlug) ? initialSlug : null,
  );

  const hasCharacters = characters.length > 0;
  const selected = hasCharacters ? characters.find((c) => c.slug === selectedSlug) ?? null : null;

  return (
    <div className="mt-8 max-w-md">
      <label htmlFor={selectId} className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
        Character
      </label>

      {hasCharacters ? (
        <select
          id={selectId}
          value={selectedSlug ?? ""}
          onChange={(event) => setSelectedSlug(event.target.value || null)}
          className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-2 focus:outline-offset-2 focus:outline-slate-950"
        >
          <option value="" disabled>
            Select a character…
          </option>
          {characters.map((character) => (
            <option key={character.slug} value={character.slug}>
              {character.label}
            </option>
          ))}
        </select>
      ) : (
        <div
          aria-disabled="true"
          className="mt-3 w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-400"
        >
          No characters available
        </div>
      )}

      {selected && (
        <p className="mt-3 text-sm text-slate-600">
          Selected character: <span className="font-semibold text-slate-900">{selected.label}</span>
        </p>
      )}

      <div className="mt-4">
        {selected ? (
          <Link
            href={`/character/${selected.slug}`}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-2 focus:outline-offset-2 focus:outline-slate-950"
          >
            About {selected.label}
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="inline-flex cursor-not-allowed items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400"
          >
            About character
          </span>
        )}
      </div>
    </div>
  );
}
