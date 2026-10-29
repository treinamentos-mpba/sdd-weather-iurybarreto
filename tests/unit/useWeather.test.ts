import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useWeather from '../../src/hooks/useWeather';
import { getWeather, searchCities } from '../../src/services/weatherService';
import type { City, WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', () => ({
  getWeather: vi.fn(),
  searchCities: vi.fn(),
  WeatherServiceError: class WeatherServiceError extends Error {
    kind: string;

    constructor(message: string, kind: string) {
      super(message);
      this.name = 'WeatherServiceError';
      this.kind = kind;
    }
  },
}));

const city: City = {
  id: 1,
  name: 'São Paulo',
  adminRegion: 'São Paulo',
  country: 'Brasil',
  latitude: -23.55,
  longitude: -46.63,
};

const weather: WeatherData = {
  city,
  timezone: 'America/Sao_Paulo',
  current: {
    temperatureC: 22,
    humidityPercent: 60,
    windSpeedKmh: 10,
    precipitationMm: 0,
    surfacePressureHpa: 920,
    weatherCode: 1,
    conditionPtBr: 'Predominantemente limpo',
    observedAt: '2026-10-29T13:15:00-03:00',
  },
  forecast: Array.from({ length: 5 }, (_, index) => ({
    date: `2026-10-${String(29 + index).padStart(2, '0')}`,
    minimumC: 18,
    maximumC: 26,
    precipitationProbabilityPercent: 10,
    weatherCode: 1,
    conditionPtBr: 'Predominantemente limpo',
  })),
};

function deferred<Value>() {
  let resolve!: (value: Value) => void;
  const promise = new Promise<Value>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
}

describe('useWeather', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('começa em idle', () => {
    const { result } = renderHook(() => useWeather());

    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBeNull();
    expect(result.current.cities).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.query).toBe('');
  });

  it('retorna empty sem chamar o service para nome vazio ou sem resultados', async () => {
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.search('   '));
    expect(result.current.status).toBe('empty');
    expect(searchCities).not.toHaveBeenCalled();

    vi.mocked(searchCities).mockResolvedValueOnce([]);
    await act(async () => result.current.search('Atlantis'));
    expect(result.current.status).toBe('empty');
    expect(result.current.query).toBe('Atlantis');
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('aguarda seleção explícita antes de consultar o clima', async () => {
    vi.mocked(searchCities).mockResolvedValueOnce([city]);
    vi.mocked(getWeather).mockResolvedValueOnce(weather);
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.search(' São Paulo '));

    expect(searchCities).toHaveBeenCalledWith('São Paulo');
    expect(getWeather).not.toHaveBeenCalled();
    expect(result.current.status).toBe('success');
    expect(result.current.cities).toEqual([city]);
    expect(result.current.selectedCity).toBeNull();
    expect(result.current.data).toBeNull();

    await act(async () => result.current.selectCity(city));

    expect(getWeather).toHaveBeenCalledWith(city);
    expect(result.current.selectedCity).toEqual(city);
    expect(result.current.data).toEqual(weather);
    expect(result.current.isPartial).toBe(false);
  });

  it('retry repete a última seleção de cidade', async () => {
    vi.mocked(getWeather).mockResolvedValue(weather);
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.selectCity(city));
    await act(async () => result.current.retry());

    expect(getWeather).toHaveBeenCalledTimes(2);
    expect(getWeather).toHaveBeenNthCalledWith(2, city);
    expect(result.current.status).toBe('success');
  });

  it('permite repetir a busca após falha de rede sem selecionar silenciosamente', async () => {
    vi.mocked(searchCities)
      .mockRejectedValueOnce(new TypeError('offline'))
      .mockResolvedValueOnce([city]);
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.search('São Paulo'));
    expect(result.current.status).toBe('error');
    expect(result.current.error?.kind).toBe('network');
    expect(result.current.data).toBeNull();
    expect(searchCities).toHaveBeenCalledOnce();

    await act(async () => result.current.retry());
    expect(searchCities).toHaveBeenNthCalledWith(2, 'São Paulo');
    expect(result.current.cities).toEqual([city]);
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('repete apenas Forecast após falha de rede na seleção', async () => {
    vi.mocked(getWeather)
      .mockRejectedValueOnce(new TypeError('offline'))
      .mockResolvedValueOnce(weather);
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.selectCity(city));
    expect(result.current.status).toBe('error');
    expect(getWeather).toHaveBeenCalledOnce();
    await act(async () => result.current.retry());

    expect(getWeather).toHaveBeenNthCalledWith(2, city);
    expect(searchCities).not.toHaveBeenCalled();
    expect(result.current.data).toEqual(weather);
  });

  it('sinaliza resposta parcial sem descartar a seção disponível', async () => {
    vi.mocked(getWeather).mockResolvedValue({ ...weather, current: null });
    const { result } = renderHook(() => useWeather());
    await act(async () => result.current.selectCity(city));

    expect(result.current.status).toBe('success');
    expect(result.current.isPartial).toBe(true);
    expect(result.current.data?.forecast).toEqual(weather.forecast);
  });

  it('ignora uma resposta antiga quando outra cidade é selecionada', async () => {
    const cityB = { ...city, id: 2, name: 'Rio de Janeiro' };
    const weatherB = { ...weather, city: cityB };
    const first = deferred<WeatherData>();
    const second = deferred<WeatherData>();
    vi.mocked(getWeather).mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const { result } = renderHook(() => useWeather());
    let firstRequest!: Promise<void>;
    let secondRequest!: Promise<void>;

    act(() => {
      firstRequest = result.current.selectCity(city);
    });
    act(() => {
      secondRequest = result.current.selectCity(cityB);
    });

    await act(async () => {
      second.resolve(weatherB);
      await secondRequest;
    });
    await act(async () => {
      first.resolve(weather);
      await firstRequest;
    });

    expect(result.current.status).toBe('success');
    expect(result.current.data?.city).toEqual(cityB);
    expect(result.current.selectedCity).toEqual(cityB);
  });
});
