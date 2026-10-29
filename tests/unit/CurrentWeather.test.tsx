import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import UnitToggle from '../../src/components/UnitToggle';
import { mockWeatherData } from '../../src/mocks/weatherData';
import type { Unit } from '../../src/types/weather';

function WeatherWithUnitToggle() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const current = { ...mockWeatherData.current!, temperatureC: 0 };

  return (
    <>
      <UnitToggle unit={unit} onChange={setUnit} />
      <CurrentWeather city={mockWeatherData.city} current={current} unit={unit} />
    </>
  );
}

describe('CurrentWeather', () => {
  it('exibe temperatura convertida e métricas com unidades', () => {
    render(
      <CurrentWeather
        city={mockWeatherData.city}
        current={mockWeatherData.current!}
        unit="fahrenheit"
      />,
    );

    expect(screen.getByRole('heading', { name: 'Clima atual' })).toBeInTheDocument();
    expect(screen.getByText('72,3 °F')).toBeInTheDocument();
    expect(screen.getByText('Umidade')).toBeInTheDocument();
    expect(screen.getByText('68 %')).toBeInTheDocument();
    expect(screen.getByText('12,4 km/h')).toBeInTheDocument();
    expect(screen.getByText('0,1 mm')).toBeInTheDocument();
    expect(screen.getByText('927 hPa')).toBeInTheDocument();
    expect(screen.getByText(/Observado em 29 de out\. às 13:15/)).toBeInTheDocument();
  });

  it('mostra métricas nulas como indisponíveis e permite atualizar', async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();
    const current = {
      ...mockWeatherData.current!,
      humidityPercent: null,
      windSpeedKmh: null,
      precipitationMm: null,
      surfacePressureHpa: null,
    };

    render(
      <CurrentWeather
        city={mockWeatherData.city}
        current={current}
        unit="celsius"
        onRefresh={onRefresh}
      />,
    );

    expect(screen.getAllByText('Indisponível')).toHaveLength(4);
    await user.click(screen.getByRole('button', { name: 'Atualizar clima' }));
    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it('converte a temperatura após trocar a unidade para Fahrenheit', async () => {
    const user = userEvent.setup();
    render(<WeatherWithUnitToggle />);

    expect(screen.getByText('0 °C')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    expect(screen.getByText('32 °F')).toBeInTheDocument();
  });
});
