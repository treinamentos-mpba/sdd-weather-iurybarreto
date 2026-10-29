import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <section className="rounded-2xl border border-rose-300/20 bg-rose-400/5 p-5 text-white shadow-glass backdrop-blur-md">
      <div className="flex items-start gap-3">
        <AlertTriangle aria-hidden="true" className="mt-0.5 shrink-0 text-rose-200" size={20} />
        <p role="alert" className="min-w-0 text-sm leading-6 text-rose-50">
          {message}
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        Tentar novamente
      </button>
    </section>
  );
}