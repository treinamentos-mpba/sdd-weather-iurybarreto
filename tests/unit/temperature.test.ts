import * as temperature from '../../src/lib/temperature';

const { unitLabel } = temperature;

describe('conversão de temperatura', () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
  ])('%i °C equivale a %i °F', (celsius, fahrenheit) => {
    expect(temperature.convertTemperature(celsius, 'fahrenheit')).toBe(fahrenheit);
  });

  it('mantém o valor quando a unidade é Celsius', () => {
    expect(temperature.convertTemperature(21.5, 'celsius')).toBe(21.5);
  });

  it('mantém valores nulos indisponíveis', () => {
    expect(temperature.convertTemperature(null, 'fahrenheit')).toBeNull();
    expect(temperature.formatTemperature(null, 'celsius')).toBe('Indisponível');
  });

  it('arredonda para uma casa decimal e inclui o símbolo da unidade', () => {
    expect(temperature.formatTemperature(21.86, 'celsius')).toBe('21,9 °C');
    expect(temperature.formatTemperature(0, 'fahrenheit')).toBe('32 °F');
  });

  it('expõe unitLabel para os símbolos Celsius e Fahrenheit', () => {
    expect(unitLabel('celsius')).toBe('°C');
    expect(unitLabel('fahrenheit')).toBe('°F');
  });

  it.each([NaN, Infinity, -Infinity])('não mostra valor não finito %s', (value) => {
    expect(temperature.convertTemperature(value, 'fahrenheit')).toBeNull();
    expect(temperature.formatTemperature(value, 'celsius')).toBe('Indisponível');
  });
});
