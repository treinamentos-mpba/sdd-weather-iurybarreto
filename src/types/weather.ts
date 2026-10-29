export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id: number;
  name: string;
  adminRegion: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperatureC: number | null;
  humidityPercent: number | null;
  windSpeedKmh: number | null;
  precipitationMm: number | null;
  surfacePressureHpa: number | null;
  weatherCode: number | null;
  conditionPtBr: string;
  observedAt: string | null;
}

export interface ForecastDay {
  date: string;
  minimumC: number | null;
  maximumC: number | null;
  precipitationProbabilityPercent: number | null;
  weatherCode: number | null;
  conditionPtBr: string;
}

export interface WeatherData {
  city: City;
  timezone: string | null;
  current: CurrentWeather | null;
  forecast: ForecastDay[];
}

export type WeatherErrorKind = 'network' | 'http' | 'timeout' | 'invalid-response';

export interface WeatherError {
  kind: WeatherErrorKind;
  messagePtBr: string;
}

export type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; cities: City[] }
  | { status: 'empty' }
  | { status: 'error'; error: WeatherError };

export type WeatherState =
  | { status: 'idle' }
  | { status: 'loading'; city: City }
  | { status: 'success'; data: WeatherData }
  | { status: 'partial'; data: WeatherData }
  | { status: 'error'; city: City; error: WeatherError };
