import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { mockWeatherData } from '../../src/mocks/weatherData';
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

function deferred<Value>() {
  let resolve!: (value: Value) => void;
  const promise = new Promise<Value>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
}

describe('App', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('mostra o estado inicial, loading e sucesso com o mock', async () => {
    const user = userEvent.setup();
    const searchResult = deferred<City[]>();
    const weatherResult = deferred<WeatherData>();
    vi.mocked(searchCities).mockReturnValue(searchResult.promise);
    vi.mocked(getWeather).mockReturnValue(weatherResult.promise);
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Consulte o clima da sua cidade' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Unidade de temperatura' })).toBeInTheDocument();

    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(screen.getByRole('status', { name: 'Andamento da consulta' })).toHaveTextContent(
      'Buscando cidades…',
    );
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');

    searchResult.resolve([mockWeatherData.city]);
    const cityOption = await screen.findByRole('button', { name: 'São Paulo, Brasil' });
    expect(cityOption).toHaveAttribute('aria-pressed', 'false');
    await waitFor(() => expect(screen.getByRole('main')).toHaveFocus());
    expect(getWeather).not.toHaveBeenCalled();
    await user.click(cityOption);
    expect(screen.getByRole('status', { name: 'Andamento da consulta' })).toHaveTextContent(
      'Carregando clima de São Paulo…',
    );

    weatherResult.resolve(mockWeatherData);
    expect(await screen.findByRole('heading', { name: 'Clima atual' })).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'Previsão dos próximos cinco dias' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(5);
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'false');
    await waitFor(() => expect(screen.getByRole('main')).toHaveFocus());
    expect(getWeather).toHaveBeenCalledWith(mockWeatherData.city);
  });

  it('mostra empty quando a busca retorna lista vazia', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockResolvedValue([]);
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'Atlantis');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(
      await screen.findByRole('heading', { name: 'Nenhuma cidade encontrada' }),
    ).toBeInTheDocument();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('mostra error e permite repetir a busca', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities)
      .mockRejectedValueOnce(new Error('Falha simulada'))
      .mockResolvedValueOnce([mockWeatherData.city]);
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha de rede.');

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await user.click(await screen.findByRole('button', { name: 'São Paulo, Brasil' }));
    expect(await screen.findByRole('heading', { name: 'Clima atual' })).toBeInTheDocument();
    expect(searchCities).toHaveBeenCalledTimes(2);
  });

  it('atualiza somente o clima da cidade escolhida e substitui valores e horário', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city]);
    vi.mocked(getWeather)
      .mockResolvedValueOnce(mockWeatherData)
      .mockResolvedValueOnce({
        ...mockWeatherData,
        current: { ...mockWeatherData.current!, temperatureC: 25, observedAt: '2026-10-29T14:30' },
      });
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.click(await screen.findByRole('button', { name: 'São Paulo, Brasil' }));
    await user.click(await screen.findByRole('button', { name: 'Atualizar clima' }));

    const current = await screen.findByRole('region', { name: 'Clima atual' });
    expect(await within(current).findByText('25 °C')).toBeInTheDocument();
    expect(screen.getByText('Observado em 29 de out. às 14:30')).toBeInTheDocument();
    expect(searchCities).toHaveBeenCalledOnce();
    expect(getWeather).toHaveBeenCalledTimes(2);
    expect(getWeather).toHaveBeenLastCalledWith(mockWeatherData.city);
  });

  it('mostra a previsão válida quando o clima atual não está disponível', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city]);
    vi.mocked(getWeather).mockResolvedValue({ ...mockWeatherData, current: null });
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.click(await screen.findByRole('button', { name: 'São Paulo, Brasil' }));

    expect(await screen.findByText('Clima atual indisponível')).toBeInTheDocument();
    expect(
      screen.getByText('Alguns dados meteorológicos estão indisponíveis.'),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(5);
  });

  it('respeita a unidade alterada durante loading sem consultar novamente', async () => {
    const user = userEvent.setup();
    const pending = deferred<WeatherData>();
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city]);
    vi.mocked(getWeather).mockReturnValue(pending.promise);
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.click(await screen.findByRole('button', { name: 'São Paulo, Brasil' }));
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');
    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));
    pending.resolve(mockWeatherData);

    const current = await screen.findByRole('region', { name: 'Clima atual' });
    expect(within(current).getByText('72,3 °F')).toBeInTheDocument();
    expect(getWeather).toHaveBeenCalledOnce();
  });

  it('não persiste Fahrenheit após desmontar e montar novamente', async () => {
    const user = userEvent.setup();
    const first = render(<App />);
    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));
    expect(screen.getByRole('button', { name: 'Fahrenheit' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    first.unmount();
    render(<App />);
    expect(screen.getByRole('button', { name: 'Celsius' })).toHaveAttribute('aria-pressed', 'true');
    expect(getWeather).not.toHaveBeenCalled();
  });
});
