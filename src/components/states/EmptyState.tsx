interface EmptyStateProps {
  title: string;
  hint: string;
}

export default function EmptyState({ title, hint }: EmptyStateProps) {
  return (
    <section
      role="status"
      aria-live="polite"
      className="rounded-2xl border border-white/10 bg-white/5 px-5 py-8 text-center shadow-glass backdrop-blur-md"
    >
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-prose text-sm leading-6 text-white/70">{hint}</p>
    </section>
  );
}