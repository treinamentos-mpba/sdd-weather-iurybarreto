import * as format from '../../src/lib/format';

const { getShortDate } = format;

describe('getShortDate', () => {
  it('rotula os dois primeiros dias como Hoje e Amanhã', () => {
    expect(getShortDate('2026-10-29', 0)).toBe('Hoje');
    expect(getShortDate('2026-10-30', 1)).toBe('Amanhã');
  });

  it('retorna o dia da semana para os demais índices', () => {
    expect(getShortDate('2026-10-31', 2)).toBe('sábado');
  });

  it('mantém a formatação da data localizada existente', () => {
    expect(format.formatDayLabel('2026-10-29')).toContain('29');
    expect(format.formatDayLabel('invalid')).toBe('Data indisponível');
  });

  it.each(['2026-02-30', '2026-13-01', '', 'invalid'])('trata data inválida %s', (date) => {
    expect(format.formatDayLabel(date)).toBe('Data indisponível');
    expect(getShortDate(date, 0)).toBe('Data indisponível');
  });

  it('mantém o calendário local e converte instantes no fuso da cidade na virada do mês', () => {
    expect(format.formatObservedAt('2026-11-01T00:15')).toBe('Observado em 01 de nov. às 00:15');
    expect(format.formatObservedAt('2026-11-01T01:15Z', 'America/Sao_Paulo')).toBe(
      'Observado em 31 de out. às 22:15',
    );
  });

  it.each([
    null,
    '2026-02-30T13:00',
    '2026-10-29T24:00',
    'invalid',
  ])('trata horário inválido %s', (value) => {
    expect(format.formatObservedAt(value)).toBe('Horário indisponível');
  });

  it.each([null, NaN, Infinity, -Infinity])('não mostra métrica inválida %s', (value) => {
    expect(format.formatMetric(value, 'mm')).toBe('Indisponível');
  });
});
