import { describe, expect, it } from 'vitest';
import { getWeatherConditionPtBr, getWeatherIconName } from '../../src/lib/weatherCodes';

describe('weatherCodes', () => {
  it('mapeia código conhecido para condição e ícone', () => {
    expect(getWeatherConditionPtBr(0)).toBe('Céu limpo');
    expect(getWeatherIconName(0)).toBe('sun');
  });

  it('usa fallback para código desconhecido', () => {
    expect(getWeatherConditionPtBr(999)).toBe('Condição indisponível');
    expect(getWeatherIconName(999)).toBe('cloud-help');
  });
});
