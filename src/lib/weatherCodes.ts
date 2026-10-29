export type WeatherIconName =
  | 'sun'
  | 'cloud-sun'
  | 'cloud'
  | 'fog'
  | 'cloud-drizzle'
  | 'cloud-rain'
  | 'cloud-snow'
  | 'cloud-lightning'
  | 'cloud-help';

const weatherConditionsPtBr: Record<number, string> = {
  0: 'Céu limpo',
  1: 'Predominantemente limpo',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Neblina',
  48: 'Nevoeiro com geada',
  51: 'Garoa fraca',
  53: 'Garoa moderada',
  55: 'Garoa intensa',
  56: 'Garoa congelante fraca',
  57: 'Garoa congelante intensa',
  61: 'Chuva fraca',
  63: 'Chuva moderada',
  65: 'Chuva intensa',
  66: 'Chuva congelante fraca',
  67: 'Chuva congelante intensa',
  71: 'Neve fraca',
  73: 'Neve moderada',
  75: 'Neve intensa',
  77: 'Grãos de neve',
  80: 'Pancadas de chuva fracas',
  81: 'Pancadas de chuva moderadas',
  82: 'Pancadas de chuva violentas',
  85: 'Pancadas de neve fracas',
  86: 'Pancadas de neve intensas',
  95: 'Trovoada',
  96: 'Trovoada com granizo fraco',
  99: 'Trovoada com granizo intenso',
};

export function getWeatherConditionPtBr(weatherCode: number | null): string {
  if (weatherCode === null) {
    return 'Condição indisponível';
  }

  return weatherConditionsPtBr[weatherCode] ?? 'Condição indisponível';
}

export function getWeatherIconName(weatherCode: number | null): WeatherIconName {
  if (weatherCode === 0) {
    return 'sun';
  }

  if (weatherCode === 1 || weatherCode === 2) {
    return 'cloud-sun';
  }

  if (weatherCode === 3) {
    return 'cloud';
  }

  if (weatherCode === 45 || weatherCode === 48) {
    return 'fog';
  }

  if ([51, 53, 55, 56, 57].includes(weatherCode ?? -1)) {
    return 'cloud-drizzle';
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode ?? -1)) {
    return 'cloud-rain';
  }

  if ([71, 73, 75, 77, 85, 86].includes(weatherCode ?? -1)) {
    return 'cloud-snow';
  }

  if ([95, 96, 99].includes(weatherCode ?? -1)) {
    return 'cloud-lightning';
  }

  return 'cloud-help';
}
