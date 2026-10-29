import { afterEach, describe, expect, it, vi } from 'vitest';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

const city: City = {
  id: 3448439,
  name: 'São Paulo',
  adminRegion: 'São Paulo',
  country: 'Brasil',
  latitude: -23.55,
  longitude: -46.63,
};

describe('searchCities', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('retorna lista vazia sem chamar a rede para input vazio', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('   ')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('codifica o nome e mapeia os resultados para City', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [
            {
              id: 3448439,
              name: 'São Paulo',
              latitude: -23.55,
              longitude: -46.63,
              admin1: 'São Paulo',
              country: 'Brasil',
            },
            {
              id: 1,
              name: 'Cidade sem região',
              latitude: 10,
              longitude: 20,
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities(' São José-dos-Campos ')).resolves.toEqual([
      {
        id: 3448439,
        name: 'São Paulo',
        adminRegion: 'São Paulo',
        country: 'Brasil',
        latitude: -23.55,
        longitude: -46.63,
      },
      {
        id: 1,
        name: 'Cidade sem região',
        adminRegion: null,
        country: null,
        latitude: 10,
        longitude: 20,
      },
    ]);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://geocoding-api.open-meteo.com/v1/search?name=S%C3%A3o%20Jos%C3%A9-dos-Campos&count=10&language=pt&format=json',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it.each([429, 503])('lança WeatherServiceError amigável para HTTP %s', async (status) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status })));

    await expect(searchCities('São Paulo')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'http',
      message: 'O serviço está indisponível. Tente novamente.',
    });
  });

  it('lança WeatherServiceError para payload inválido', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ results: [{ name: 'Sem coordenadas' }] }), { status: 200 }),
        ),
    );

    await expect(searchCities('São Paulo')).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('retorna lista vazia quando results está ausente', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 200 })));

    await expect(searchCities('Atlantis')).resolves.toEqual([]);
  });

  it('converte falha de rede para WeatherServiceError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));

    await expect(searchCities('São Paulo')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'network',
      message: 'Não foi possível conectar. Verifique sua conexão e tente novamente.',
    });
  });

  it('converte AbortError em timeout e limpa o timer', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(
      (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const request = searchCities('São Paulo');
    const rejection = expect(request).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'timeout',
      message: 'A consulta excedeu 10 segundos. Tente novamente.',
    });
    await vi.advanceTimersByTimeAsync(10_000);
    await rejection;

    expect(vi.getTimerCount()).toBe(0);
  });

  it('mantém o prazo de 10 segundos durante a leitura do corpo JSON', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => new Promise<unknown>(() => {}),
    });
    vi.stubGlobal('fetch', fetchMock);
    const rejected = expect(searchCities('São Paulo')).rejects.toMatchObject({ kind: 'timeout' });

    await vi.advanceTimersByTimeAsync(10_000);
    await rejected;
    await vi.advanceTimersByTimeAsync(10_000);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('getWeather', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('mapeia clima atual e cinco dias a partir dos arrays paralelos', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          timezone: 'America/Sao_Paulo',
          current: {
            time: '2026-10-29T13:15',
            temperature_2m: 22.4,
            relative_humidity_2m: 68,
            wind_speed_10m: 12.4,
            precipitation: 0.1,
            surface_pressure: 927,
            weather_code: 1,
          },
          daily: {
            time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
            temperature_2m_min: [18, 19, 18.5, 17, 16],
            temperature_2m_max: [26.5, 27, 26, 24.5, 25],
            precipitation_probability_max: [10, 25, 60, 80, 5],
            weather_code: [1, 3, 2, 61, 0],
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const weather = await getWeather(city);

    expect(weather.city).toEqual(city);
    expect(weather.timezone).toBe('America/Sao_Paulo');
    expect(weather.current).toMatchObject({
      temperatureC: 22.4,
      humidityPercent: 68,
      windSpeedKmh: 12.4,
      precipitationMm: 0.1,
      surfacePressureHpa: 927,
      weatherCode: 1,
      conditionPtBr: 'Predominantemente limpo',
      observedAt: '2026-10-29T13:15',
    });
    expect(weather.forecast).toHaveLength(5);
    expect(weather.forecast[3]).toMatchObject({
      date: '2026-11-01',
      minimumC: 17,
      maximumC: 24.5,
      precipitationProbabilityPercent: 80,
      weatherCode: 61,
      conditionPtBr: 'Chuva fraca',
    });

    const requestUrl = new URL(String(fetchMock.mock.calls[0][0]));
    expect(requestUrl.origin + requestUrl.pathname).toBe('https://api.open-meteo.com/v1/forecast');
    expect(requestUrl.searchParams.get('latitude')).toBe(String(city.latitude));
    expect(requestUrl.searchParams.get('longitude')).toBe(String(city.longitude));
    expect(requestUrl.searchParams.get('current')).toContain('relative_humidity_2m');
    expect(requestUrl.searchParams.get('daily')).toContain('precipitation_probability_max');
    expect(requestUrl.searchParams.get('forecast_days')).toBe('5');
    expect(requestUrl.searchParams.get('timezone')).toBe('auto');
  });

  it.each([
    { name: 'current ausente', payload: { timezone: 'UTC', daily: { time: [] } } },
    { name: 'daily ausente', payload: { timezone: 'UTC', current: {} } },
  ])('lança WeatherServiceError quando $name', async ({ payload }) => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 })),
    );

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'invalid-response',
    });
  });

  it('preserva como null um campo ausente em uma resposta diária parcial', async () => {
    const payload = {
      timezone: 'America/Sao_Paulo',
      current: {},
      daily: {
        time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
        temperature_2m_min: [18, 19, 18.5, 17, 16],
        temperature_2m_max: [26.5, 27, 26, 24.5, 25],
        weather_code: [1, 3, 2, 61, 0],
      },
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 })),
    );

    const weather = await getWeather(city);

    expect(weather.forecast[0].precipitationProbabilityPercent).toBeNull();
  });

  it('preserva precipitação atual null como indisponível', async () => {
    const payload = {
      timezone: 'America/Sao_Paulo',
      current: {
        time: '2026-10-29T13:15',
        temperature_2m: 22,
        relative_humidity_2m: 60,
        wind_speed_10m: 10,
        precipitation: null,
        surface_pressure: 920,
        weather_code: 1,
      },
      daily: {
        time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
        temperature_2m_min: [18, 19, 18.5, 17, 16],
        temperature_2m_max: [26, 27, 26, 24.5, 25],
        precipitation_probability_max: [10, 25, 60, 80, 5],
        weather_code: [1, 3, 2, 61, 0],
      },
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 })),
    );

    const weather = await getWeather(city);

    expect(weather.current?.precipitationMm).toBeNull();
  });

  it.each([
    'current',
    'daily',
  ])('preserva a seção válida quando %s está ausente', async (section) => {
    const payload: Record<string, unknown> = {
      current: { temperature_2m: 0 },
      daily: { time: ['2026-10-29'], temperature_2m_max: [20] },
    };
    delete payload[section];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(payload))));

    const result = await getWeather(city);
    expect(result.timezone).toBeNull();
    if (section === 'current') {
      expect(result.current).toBeNull();
      expect(result.forecast[0].maximumC).toBe(20);
    } else {
      expect(result.current?.temperatureC).toBe(0);
      expect(result.forecast).toEqual([]);
    }
  });

  it('rejeita JSON malformado como resposta inválida, não como erro de rede', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{')));
    await expect(getWeather(city)).rejects.toMatchObject({ kind: 'invalid-response' });
  });

  it('mantém cinco datas consecutivas sem deslocar valores quando uma data está ausente', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            timezone: 'America/Sao_Paulo',
            current: null,
            daily: {
              time: ['2026-10-29', null, '2026-10-31'],
              temperature_2m_max: [20, 99, 22],
            },
          }),
        ),
      ),
    );

    const result = await getWeather(city);
    expect(result.forecast.map((day) => day.date)).toEqual([
      '2026-10-29',
      '2026-10-30',
      '2026-10-31',
      '2026-11-01',
      '2026-11-02',
    ]);
    expect(result.forecast[1].maximumC).toBeNull();
    expect(result.forecast[2].maximumC).toBe(22);
    expect(result.forecast[4].maximumC).toBeNull();
  });
});
