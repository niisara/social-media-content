import Link from "next/link";
import { readCharacterProfile } from "@/lib/character/read-character-profile";
import { ProfileMarkdown } from "./ProfileMarkdown";

export const dynamic = "force-dynamic";

interface CharacterProfilePageProps {
  params: Promise<{ slug: string }>;
}

export default async function CharacterProfilePage({ params }: CharacterProfilePageProps) {
  const { slug } = await params;
  const result = readCharacterProfile(slug);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm shadow-slate-200/50">
        <Link
          href={`/content-generation?character=${encodeURIComponent(slug)}`}
          className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          ← Back to Content Generation
        </Link>
        <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Character profile</span>
      </div>

      <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_80px_rgba(15,23,42,0.06)]">
        <div className="bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_45%)] p-6 sm:p-10">
          {result.ok ? (
            <>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Profile</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{result.title}</h1>
              <div className="mt-8">
                <ProfileMarkdown markdown={result.markdown} />
              </div>
            </>
          ) : (
            <>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Profile</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Profile not available</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
                We couldn&apos;t find a profile to show for this character. It may be missing its
                profile file, or have more than one — check the character&apos;s folder and try again.
              </p>
            </>
          )}
        </div>
      </article>
    </main>
  );
}
