import { getWeatherConditionPtBr } from '../lib/weatherCodes';
import type {
  City,
  CurrentWeather,
  ForecastDay,
  WeatherData,
  WeatherErrorKind,
} from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 10_000;

interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string | null;
  country?: string | null;
}

export class WeatherServiceError extends Error {
  constructor(
    message: string,
    readonly kind: WeatherErrorKind,
  ) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

async function readResponse(input: RequestInfo | URL, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(input, { signal });
  if (!response.ok) {
    throw new WeatherServiceError('O serviço está indisponível. Tente novamente.', 'http');
  }

  try {
    return await response.json();
  } catch (error) {
    if (signal.aborted) throw error;
    throw new WeatherServiceError(
      'O serviço retornou uma resposta inválida. Tente novamente.',
      'invalid-response',
    );
  }
}

async function fetchWithTimeout(input: RequestInfo | URL): Promise<unknown> {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_resolve, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        new WeatherServiceError('A consulta excedeu 10 segundos. Tente novamente.', 'timeout'),
      );
      controller.abort();
    }, REQUEST_TIMEOUT_MS);
  });

  try {
    return await Promise.race([readResponse(input, controller.signal), deadline]);
  } catch (error) {
    if (error instanceof WeatherServiceError) throw error;
    if (isRecord(error) && error.name === 'AbortError') {
      throw new WeatherServiceError('A consulta excedeu 10 segundos. Tente novamente.', 'timeout');
    }

    throw new WeatherServiceError(
      'Não foi possível conectar. Verifique sua conexão e tente novamente.',
      'network',
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

function isGeocodingResult(value: unknown): value is GeocodingResult {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    Number.isFinite(value.id) &&
    typeof value.name === 'string' &&
    value.name.trim().length > 0 &&
    typeof value.latitude === 'number' &&
    Number.isFinite(value.latitude) &&
    Math.abs(value.latitude) <= 90 &&
    typeof value.longitude === 'number' &&
    Number.isFinite(value.longitude) &&
    Math.abs(value.longitude) <= 180
  );
}

function toCity(result: GeocodingResult): City {
  return {
    id: result.id,
    name: result.name,
    adminRegion: typeof result.admin1 === 'string' ? result.admin1 : null,
    country: typeof result.country === 'string' ? result.country : null,
    latitude: result.latitude,
    longitude: result.longitude,
  };
}

function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function dailyValue(daily: Record<string, unknown>, key: string, index: number): number | null {
  const values = daily[key];
  return Array.isArray(values) ? numberOrNull(values[index]) : null;
}

function calendarDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
    ? parsed
    : null;
}

export async function searchCities(name: string): Promise<City[]> {
  const query = name.trim();
  if (!query) {
    return [];
  }

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=10&language=pt&format=json`;
  const payload = await fetchWithTimeout(url);
  if (!isRecord(payload)) {
    throw new WeatherServiceError('Resposta inválida da busca de cidades.', 'invalid-response');
  }
  if (payload.results === undefined || payload.results === null) return [];

  if (!Array.isArray(payload.results) || !payload.results.every(isGeocodingResult)) {
    throw new WeatherServiceError('Resposta inválida da busca de cidades.', 'invalid-response');
  }

  return payload.results.map(toCity);
}

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,surface_pressure,weather_code',
    daily: 'temperature_2m_min,temperature_2m_max,precipitation_probability_max,weather_code',
    forecast_days: '5',
    timezone: 'auto',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
  });
  const payload = await fetchWithTimeout(`${FORECAST_URL}?${params.toString()}`);
  if (!isRecord(payload)) {
    throw new WeatherServiceError(
      'Resposta incompleta do serviço meteorológico.',
      'invalid-response',
    );
  }

  const timezone = stringOrNull(payload.timezone);
  const currentResponse = isRecord(payload.current) ? payload.current : {};
  const currentWeatherCode = numberOrNull(currentResponse.weather_code);
  const mappedCurrent: CurrentWeather = {
    temperatureC: numberOrNull(currentResponse.temperature_2m),
    humidityPercent: numberOrNull(currentResponse.relative_humidity_2m),
    windSpeedKmh: numberOrNull(currentResponse.wind_speed_10m),
    precipitationMm: numberOrNull(currentResponse.precipitation),
    surfacePressureHpa: numberOrNull(currentResponse.surface_pressure),
    weatherCode: currentWeatherCode,
    conditionPtBr: getWeatherConditionPtBr(currentWeatherCode),
    observedAt: stringOrNull(currentResponse.time),
  };

  const current =
    Object.values(mappedCurrent).some((value) => typeof value === 'number') ||
    mappedCurrent.observedAt !== null
      ? mappedCurrent
      : null;
  const dailyResponse = isRecord(payload.daily) ? payload.daily : {};
  const dates: unknown[] = Array.isArray(dailyResponse.time) ? dailyResponse.time.slice(0, 5) : [];
  const firstValidIndex = dates.findIndex((date) => calendarDate(date) !== null);
  const firstDate = calendarDate(dates[firstValidIndex]);
  if (firstDate) firstDate.setUTCDate(firstDate.getUTCDate() - firstValidIndex);
  const forecast: ForecastDay[] = firstDate
    ? Array.from({ length: 5 }, (_, dayIndex) => {
        const parsedDate = new Date(firstDate);
        parsedDate.setUTCDate(parsedDate.getUTCDate() + dayIndex);
        const date = parsedDate.toISOString().slice(0, 10);
        const index = dates.indexOf(date);
        const weatherCode = dailyValue(dailyResponse, 'weather_code', index);

        return {
          date,
          minimumC: dailyValue(dailyResponse, 'temperature_2m_min', index),
          maximumC: dailyValue(dailyResponse, 'temperature_2m_max', index),
          precipitationProbabilityPercent: dailyValue(
            dailyResponse,
            'precipitation_probability_max',
            index,
          ),
          weatherCode,
          conditionPtBr: getWeatherConditionPtBr(weatherCode),
        };
      })
    : [];

  if (current === null && forecast.length === 0) {
    throw new WeatherServiceError(
      'Resposta incompleta do serviço meteorológico.',
      'invalid-response',
    );
  }

  return { city, timezone, current, forecast };
}
