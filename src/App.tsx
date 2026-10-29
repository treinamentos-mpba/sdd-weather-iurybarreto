import { CloudSun } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import CityResults from './components/CityResults';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import useWeather from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const weather = useWeather();
  const resultRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (weather.status !== 'idle' && weather.status !== 'loading') {
      resultRef.current?.focus();
    }
  }, [weather.status]);

  function renderWeatherContent() {
    const data = weather.data;
    if (!data) {
      return null;
    }

    return (
      <div className="space-y-8">
        {weather.isPartial ? (
          <p role="status" className="text-sm text-white/70">
            Alguns dados meteorológicos estão indisponíveis.
          </p>
        ) : null}
        {data.current ? (
          <CurrentWeather
            city={data.city}
            current={data.current}
            timezone={data.timezone}
            unit={unit}
            onRefresh={() => void weather.selectCity(data.city)}
          />
        ) : (
          <p role="status" className="text-sm text-white/70">
            Clima atual indisponível
          </p>
        )}
        <ForecastList forecast={data.forecast} unit={unit} />
      </div>
    );
  }

  function renderSelectedCity() {
    if (weather.cities.length === 0) {
      return null;
    }

    return (
      <CityResults
        cities={weather.cities}
        selectedCityId={weather.selectedCity?.id ?? null}
        onSelect={(city) => void weather.selectCity(city)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-night-900 text-white">
      <a
        href="#main-content"
        className="absolute left-4 top-4 z-50 -translate-y-20 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-night-900 focus:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
      >
        Pular para o conteúdo principal
      </a>
      <header className="border-b border-white/10 bg-night-900/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <CloudSun aria-hidden="true" className="text-sun" size={32} strokeWidth={1.6} />
            <div>
              <h1 className="text-lg font-semibold text-white">Clima</h1>
              <p className="text-xs text-white/70">Previsão local</p>
            </div>
          </div>
          <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center md:max-w-3xl">
            <UnitToggle unit={unit} onChange={setUnit} />
            <div className="min-w-0 flex-1">
              <SearchBar
                onSearch={(cityName) => void weather.search(cityName)}
                disabled={weather.status === 'loading'}
              />
            </div>
          </div>
        </div>
      </header>

      <p role="status" aria-label="Andamento da consulta" className="sr-only">
        {weather.status === 'loading'
          ? weather.selectedCity
            ? `Carregando clima de ${weather.selectedCity.name}…`
            : 'Buscando cidades…'
          : ''}
      </p>

      <main
        ref={resultRef}
        id="main-content"
        aria-label="Resultados da consulta"
        aria-busy={weather.status === 'loading'}
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 sm:px-6 sm:py-10"
      >
        {weather.status === 'idle' ? (
          <EmptyState
            title="Consulte o clima da sua cidade"
            hint="Busque uma cidade para ver as condições atuais e a previsão dos próximos cinco dias."
          />
        ) : null}
        {weather.status === 'loading' ? (
          <div className="space-y-6">
            {renderSelectedCity()}
            <LoadingState
              message={
                weather.selectedCity
                  ? `Carregando clima de ${weather.selectedCity.name}…`
                  : 'Buscando cidades…'
              }
            />
          </div>
        ) : null}
        {weather.status === 'empty' ? (
          <EmptyState
            title="Nenhuma cidade encontrada"
            hint="Confira a grafia ou tente pesquisar por outra cidade."
          />
        ) : null}
        {weather.status === 'error' ? (
          <div className="space-y-8">
            {renderSelectedCity()}
            <ErrorState
              message={
                weather.error?.message ?? 'Não foi possível carregar os dados meteorológicos.'
              }
              onRetry={() => void weather.retry()}
            />
          </div>
        ) : null}
        {weather.status === 'success' ? (
          <div className="space-y-8">
            {renderSelectedCity()}
            {renderWeatherContent()}
          </div>
        ) : null}
      </main>
    </div>
  );
}
