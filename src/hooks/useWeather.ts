import { useRef, useState } from 'react';
import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type UseWeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

type LastOperation = { kind: 'search'; name: string } | { kind: 'select-city'; city: City };

export interface UseWeatherResult {
  status: UseWeatherStatus;
  data: WeatherData | null;
  cities: City[];
  selectedCity: City | null;
  error: WeatherServiceError | null;
  query: string;
  isPartial: boolean;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

function hasMissingWeatherFields(data: WeatherData): boolean {
  const currentValues = data.current
    ? [
        data.current.temperatureC,
        data.current.humidityPercent,
        data.current.windSpeedKmh,
        data.current.precipitationMm,
        data.current.surfacePressureHpa,
        data.current.weatherCode,
        data.current.observedAt,
      ]
    : [];

  return (
    data.current === null ||
    data.timezone === null ||
    currentValues.some((value) => value === null) ||
    data.forecast.length !== 5 ||
    data.forecast.some(
      (day) =>
        day.minimumC === null ||
        day.maximumC === null ||
        day.precipitationProbabilityPercent === null ||
        day.weatherCode === null,
    )
  );
}

function toWeatherServiceError(error: unknown): WeatherServiceError {
  if (error instanceof WeatherServiceError) {
    return error;
  }

  return new WeatherServiceError('Falha de rede.', 'network');
}

export default function useWeather(): UseWeatherResult {
  const [status, setStatus] = useState<UseWeatherStatus>('idle');
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [error, setError] = useState<WeatherServiceError | null>(null);
  const [query, setQuery] = useState('');
  const [isPartial, setIsPartial] = useState(false);
  const requestId = useRef(0);
  const lastOperation = useRef<LastOperation | null>(null);

  async function loadCityWeather(city: City, activeRequestId: number) {
    setStatus('loading');
    setData(null);
    setError(null);
    setIsPartial(false);

    try {
      const weather = await getWeather(city);
      if (activeRequestId !== requestId.current) {
        return;
      }

      setData(weather);
      setIsPartial(hasMissingWeatherFields(weather));
      setStatus('success');
    } catch (caughtError) {
      if (activeRequestId !== requestId.current) {
        return;
      }

      setError(toWeatherServiceError(caughtError));
      setStatus('error');
    }
  }

  async function search(name: string) {
    const normalizedName = name.trim();
    lastOperation.current = { kind: 'search', name: normalizedName };
    const activeRequestId = ++requestId.current;
    setQuery(normalizedName);
    setCities([]);
    setSelectedCity(null);
    setData(null);
    setError(null);
    setIsPartial(false);

    if (!normalizedName) {
      setStatus('empty');
      return;
    }

    setStatus('loading');

    try {
      const results = await searchCities(normalizedName);
      if (activeRequestId !== requestId.current) {
        return;
      }

      setCities(results);
      if (results.length === 0) {
        setStatus('empty');
        return;
      }

      setStatus('success');
    } catch (caughtError) {
      if (activeRequestId !== requestId.current) {
        return;
      }

      setError(toWeatherServiceError(caughtError));
      setStatus('error');
    }
  }

  async function selectCity(city: City) {
    lastOperation.current = { kind: 'select-city', city };
    const activeRequestId = ++requestId.current;
    setSelectedCity(city);
    setError(null);
    setData(null);
    setIsPartial(false);
    await loadCityWeather(city, activeRequestId);
  }

  async function retry() {
    const operation = lastOperation.current;
    if (!operation) {
      return;
    }

    if (operation.kind === 'search') {
      await search(operation.name);
      return;
    }

    await selectCity(operation.city);
  }

  return {
    status,
    data,
    cities,
    selectedCity,
    error,
    query,
    isPartial,
    search,
    selectCity,
    retry,
  };
}
