import type { City } from '../types/weather';

interface CityResultsProps {
  cities: City[];
  selectedCityId: number | null;
  onSelect: (city: City) => void;
}

function getCityLabel(city: City): string {
  const region = city.adminRegion && city.adminRegion !== city.name ? city.adminRegion : null;

  return [city.name, region, city.country].filter(Boolean).join(', ');
}

export default function CityResults({ cities, selectedCityId, onSelect }: CityResultsProps) {
  return (
    <section aria-labelledby="city-results-heading">
      <h2 id="city-results-heading" className="mb-3 text-sm font-semibold text-white/80">
        Selecione uma cidade
      </h2>
      <ul className="space-y-2">
        {cities.map((city) => (
          <li key={city.id}>
            <button
              type="button"
              aria-pressed={selectedCityId === city.id}
              onClick={() => onSelect(city)}
              className="w-full break-words rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
            >
              {getCityLabel(city)}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
