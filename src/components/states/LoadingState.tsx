import { LoaderCircle } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Carregando…' }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-6 text-white/80 shadow-glass backdrop-blur-md"
    >
      <LoaderCircle
        aria-hidden="true"
        className="animate-spin text-accent-400 motion-reduce:animate-none"
        size={20}
      />
      <span>{message}</span>
    </div>
  );
}
