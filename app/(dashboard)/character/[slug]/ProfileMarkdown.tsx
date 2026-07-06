import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

/** Maps markdown elements to the app's design-system typography, cards, and table styling. */
const components: Components = {
  h1: ({ children }) => (
    <h2 className="mt-8 text-2xl font-semibold tracking-tight text-slate-950 first:mt-0">{children}</h2>
  ),
  h2: ({ children }) => (
    <h3 className="mt-8 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 first:mt-0">{children}</h3>
  ),
  h3: ({ children }) => (
    <h4 className="mt-6 text-sm font-semibold text-slate-900">{children}</h4>
  ),
  p: ({ children }) => <p className="mt-3 text-sm leading-7 text-slate-700">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">{children}</ul>,
  ol: ({ children }) => <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7 text-slate-700">{children}</ol>,
  li: ({ children }) => <li className="pl-1">{children}</li>,
  a: ({ href, children }) => (
    <a href={href} className="font-medium text-blue-700 underline underline-offset-2 hover:text-blue-900">
      {children}
    </a>
  ),
  hr: () => <hr className="my-6 border-slate-200" />,
  table: ({ children }) => (
    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
      <table className="w-full border-collapse text-left text-sm text-slate-700">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-slate-50">{children}</thead>,
  th: ({ children }) => (
    <th className="border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
      {children}
    </th>
  ),
  td: ({ children }) => <td className="border-b border-slate-100 px-4 py-3 align-top">{children}</td>,
  tr: ({ children }) => <tr className="even:bg-slate-50/50">{children}</tr>,
};

export function ProfileMarkdown({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {markdown}
    </ReactMarkdown>
  );
}
