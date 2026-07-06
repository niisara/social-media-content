import Link from "next/link";
import { listCharacters } from "@/lib/character/list-characters";
import { CharacterSelect } from "./CharacterSelect";

export const dynamic = "force-dynamic";

export default function ContentGenerationPage() {
  const characters = listCharacters();

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm shadow-slate-200/50">
        <Link href="/" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
          ← Back to dashboard
        </Link>
        <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Content generation</span>
      </div>

      <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_80px_rgba(15,23,42,0.06)]">
        <div className="bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_45%)] p-6 sm:p-10">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Workspace</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Content Generation</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
            This is where you&apos;ll create new content. We&apos;re still building it — check back
            soon.
          </p>

          <CharacterSelect characters={characters} />

          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
            <span className="inline-block h-2 w-2 rounded-full bg-slate-400" aria-hidden="true" />
            Coming soon
          </div>
        </div>
      </article>
    </main>
  );
}
