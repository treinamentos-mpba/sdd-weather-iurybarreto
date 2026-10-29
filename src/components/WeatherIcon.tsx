import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  type LucideIcon,
  Sun,
} from 'lucide-react';
import { getWeatherIconName, type WeatherIconName } from '../lib/weatherCodes';

const icons: Record<WeatherIconName, LucideIcon> = {
  sun: Sun,
  'cloud-sun': CloudSun,
  cloud: Cloud,
  fog: CloudFog,
  'cloud-drizzle': CloudDrizzle,
  'cloud-rain': CloudRain,
  'cloud-snow': CloudSnow,
  'cloud-lightning': CloudLightning,
  'cloud-help': Cloud,
};

interface WeatherIconProps {
  weatherCode: number | null;
  className?: string;
  size?: number;
}

export default function WeatherIcon({ weatherCode, className, size = 40 }: WeatherIconProps) {
  const Icon = icons[getWeatherIconName(weatherCode)];

  return (
    <Icon
      aria-hidden="true"
      focusable="false"
      className={className}
      size={size}
      strokeWidth={1.6}
    />
  );
}
