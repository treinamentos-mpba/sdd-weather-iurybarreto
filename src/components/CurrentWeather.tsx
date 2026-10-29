import { formatMetric, formatObservedAt } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';
import WeatherIcon from './WeatherIcon';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
  timezone?: string | null;
  onRefresh?: () => void;
}

export default function CurrentWeather({
  city,
  current,
  unit,
  timezone,
  onRefresh,
}: CurrentWeatherProps) {
  const location = [city.adminRegion, city.country].filter(Boolean).join(', ');

  const metrics = [
    { label: 'Umidade', value: formatMetric(current.humidityPercent, '%') },
    { label: 'Vento', value: formatMetric(current.windSpeedKmh, 'km/h') },
    { label: 'Precipitação (1 h)', value: formatMetric(current.precipitationMm, 'mm') },
    { label: 'Pressão à superfície', value: formatMetric(current.surfacePressureHpa, 'hPa') },
  ];

  return (
    <section
      aria-labelledby="current-weather-title"
      className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glass backdrop-blur-md"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="current-weather-title" className="text-sm font-semibold uppercase text-white/70">
            Clima atual
          </h2>
          <p className="mt-2 break-words text-lg font-medium text-white">
            {city.name}
            {location ? <span className="text-white/70"> · {location}</span> : null}
          </p>
          <p className="mt-2 break-words text-6xl font-semibold leading-none text-white sm:text-7xl">
            {formatTemperature(current.temperatureC, unit)}
          </p>
          <p className="mt-3 text-base text-white/80">{current.conditionPtBr}</p>
          <p className="mt-2 text-sm text-white/70">
            {formatObservedAt(current.observedAt, timezone)}
          </p>
        </div>
        <WeatherIcon weatherCode={current.weatherCode} className="text-sun" size={72} />
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-x-6 sm:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="border-t border-white/10 py-3">
            <dt className="text-xs text-white/70">{metric.label}</dt>
            <dd className="mt-1 text-base font-medium text-white">{metric.value}</dd>
          </div>
        ))}
      </dl>

      {onRefresh ? (
        <button
          type="button"
          onClick={onRefresh}
          className="mt-3 rounded-lg px-3 py-2 text-sm font-medium text-accent-400 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
        >
          Atualizar clima
        </button>
      ) : null}
    </section>
  );
}
