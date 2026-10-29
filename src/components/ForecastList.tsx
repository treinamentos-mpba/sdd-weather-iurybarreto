import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: ForecastDay[];
  unit: Unit;
}

export default function ForecastList({ forecast, unit }: ForecastListProps) {
  return (
    <section aria-labelledby="forecast-heading">
      <h2 id="forecast-heading" className="mb-4 text-lg font-semibold text-white">
        Previsão dos próximos cinco dias
      </h2>
      {forecast.length === 0 ? (
        <p role="status" className="text-sm text-white/70">
          Previsão indisponível
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {forecast.map((day) => (
            <li key={day.date}>
              <ForecastCard day={day} unit={unit} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
