import { type FormEvent, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const city = query.trim();
  const canSubmit = !disabled && city.length > 0;
  const isWhitespace = query.length > 0 && city.length === 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    onSearch(city);
  }

  return (
    <form
      role="search"
      aria-label="Buscar cidade"
      aria-busy={disabled}
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 shadow-glass backdrop-blur-md"
    >
      <label htmlFor="city-search" className="mb-2 block text-sm font-medium text-white">
        Cidade
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="city-search"
          name="city"
          type="search"
          required
          aria-invalid={isWhitespace}
          aria-describedby={isWhitespace ? 'city-search-validation' : undefined}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ex.: São Paulo"
          disabled={disabled}
          className="min-w-0 flex-1 rounded-xl border border-white/50 bg-night-800/80 px-4 py-3 text-white placeholder:text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-xl border border-accent-400/40 bg-accent-600 px-5 py-3 font-semibold text-white transition-colors enabled:hover:bg-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buscar
        </button>
      </div>
      {isWhitespace ? (
        <p id="city-search-validation" className="mt-2 text-sm text-rose-200">
          Informe o nome de uma cidade.
        </p>
      ) : null}
    </form>
  );
}
