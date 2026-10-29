import type { Unit } from '../types/weather';

const temperatureFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

export function unitLabel(unit: Unit): string {
  return unit === 'celsius' ? '°C' : '°F';
}

export function convertTemperature(temperatureC: number | null, unit: Unit): number | null {
  if (temperatureC === null || !Number.isFinite(temperatureC)) {
    return null;
  }

  const converted = unit === 'celsius' ? temperatureC : (temperatureC * 9) / 5 + 32;
  return Number.isFinite(converted) ? converted : null;
}

export function formatTemperature(temperatureC: number | null, unit: Unit): string {
  const temperature = convertTemperature(temperatureC, unit);

  if (temperature === null) {
    return 'Indisponível';
  }

  return `${temperatureFormatter.format(temperature)} ${unitLabel(unit)}`;
}
