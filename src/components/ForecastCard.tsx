import { formatDayLabel, formatMetric } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import type { ForecastDay, Unit } from '../types/weather';
import WeatherIcon from './WeatherIcon';

interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
}

export default function ForecastCard({ day, unit }: ForecastCardProps) {
  return (
    <article className="flex min-h-48 min-w-0 flex-col break-words rounded-2xl border border-white/10 bg-white/5 p-4 text-white shadow-glass backdrop-blur-md">
      <h3 className="text-sm font-semibold capitalize text-white/80">{formatDayLabel(day.date)}</h3>
      <WeatherIcon weatherCode={day.weatherCode} className="my-4 self-center text-sun" size={40} />
      <p className="min-h-10 text-center text-sm text-white/80">{day.conditionPtBr}</p>
      <dl className="mt-auto grid grid-cols-2 gap-2 text-center">
        <div className="min-w-0">
          <dt className="text-xs text-white/70">Máx.</dt>
          <dd className="font-semibold">{formatTemperature(day.maximumC, unit)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-white/70">Mín.</dt>
          <dd className="font-semibold">{formatTemperature(day.minimumC, unit)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-center text-xs text-white/70">
        Chuva: {formatMetric(day.precipitationProbabilityPercent, '%')}
      </p>
    </article>
  );
}
