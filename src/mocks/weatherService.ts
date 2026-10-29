import type { City, WeatherData } from '../types/weather';
import { mockWeatherData } from './weatherData';

const MOCK_DELAY_MS = 180;

function waitForMockResponse(): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, MOCK_DELAY_MS));
}

function normalizeCityName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLocaleLowerCase('pt-BR');
}

export async function searchMockCities(query: string): Promise<City[]> {
  await waitForMockResponse();
  const normalizedQuery = normalizeCityName(query);
  const normalizedCity = normalizeCityName(mockWeatherData.city.name);

  if (!normalizedQuery || !normalizedCity.includes(normalizedQuery)) {
    return [];
  }

  return [mockWeatherData.city];
}

export async function loadMockWeather(city: City): Promise<WeatherData> {
  await waitForMockResponse();

  if (city.id !== mockWeatherData.city.id) {
    throw new Error('Não há dados de demonstração para esta cidade.');
  }

  return { ...mockWeatherData, city };
}
