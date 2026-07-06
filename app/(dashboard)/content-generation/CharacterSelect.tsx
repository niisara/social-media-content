"use client";

import { useId, useState } from "react";
import type { Character } from "@/lib/character/list-characters";

interface CharacterSelectProps {
  characters: Character[];
}

export function CharacterSelect({ characters }: CharacterSelectProps) {
  const selectId = useId();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

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
    </div>
  );
}
