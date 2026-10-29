import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ForecastList from '../../src/components/ForecastList';
import { mockWeatherData } from '../../src/mocks/weatherData';

describe('ForecastList', () => {
  it('renderiza cinco cartões com temperaturas e probabilidade na unidade atual', () => {
    render(<ForecastList forecast={mockWeatherData.forecast} unit="fahrenheit" />);

    expect(
      screen.getByRole('heading', { name: 'Previsão dos próximos cinco dias' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(5);
    expect(screen.getByText('79,7 °F')).toBeInTheDocument();
    expect(screen.getByText('64,4 °F')).toBeInTheDocument();
    expect(screen.getByText('Chuva: 10 %')).toBeInTheDocument();
    expect(screen.getByText(/29 de out/i)).toBeInTheDocument();
  });

  it('mostra indisponibilidade para probabilidade ausente', () => {
    const forecast = mockWeatherData.forecast.map((day, index) =>
      index === 0 ? { ...day, precipitationProbabilityPercent: null } : day,
    );

    render(<ForecastList forecast={forecast} unit="celsius" />);

    expect(screen.getByText('Chuva: Indisponível')).toBeInTheDocument();
  });

  it('informa quando a lista de previsão está vazia', () => {
    render(<ForecastList forecast={[]} unit="celsius" />);

    expect(screen.getByRole('status')).toHaveTextContent('Previsão indisponível');
  });

  it('não mostra NaN ou undefined quando temperaturas diárias são nulas', () => {
    const forecast = mockWeatherData.forecast.map((day) => ({
      ...day,
      minimumC: null,
      maximumC: null,
    }));
    render(<ForecastList forecast={forecast} unit="fahrenheit" />);

    expect(screen.getAllByText('Indisponível', { exact: true })).toHaveLength(10);
    expect(screen.queryByText(/NaN|undefined|Infinity/)).not.toBeInTheDocument();
  });
});
