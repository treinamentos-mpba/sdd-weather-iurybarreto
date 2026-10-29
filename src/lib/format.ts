const metricFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

function parseCalendarDate(date: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const parsed = new Date(`${date}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date
    ? parsed
    : null;
}

export function formatMetric(value: number | null, unit: string): string {
  if (value === null || !Number.isFinite(value)) {
    return 'Indisponível';
  }

  const formattedValue = metricFormatter.format(value);

  return unit ? `${formattedValue} ${unit}` : formattedValue;
}

export function formatDayLabel(date: string): string {
  const utcDate = parseCalendarDate(date);
  if (!utcDate) {
    return 'Data indisponível';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(utcDate);
}

export function getShortDate(date: string, index: number): string {
  const parsed = parseCalendarDate(date);
  if (!parsed) return 'Data indisponível';
  if (index === 0) return 'Hoje';
  if (index === 1) return 'Amanhã';
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', timeZone: 'UTC' }).format(parsed);
}

export function formatObservedAt(observedAt: string | null, timezone?: string | null): string {
  if (!observedAt) {
    return 'Horário indisponível';
  }

  const match = observedAt.match(
    /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?(Z|[+-]\d{2}:\d{2})?$/,
  );

  if (!match) {
    return 'Horário indisponível';
  }

  const [, calendarDate, hour, minute, offset] = match;
  const date = parseCalendarDate(calendarDate);
  if (!date || Number(hour) > 23 || Number(minute) > 59) {
    return 'Horário indisponível';
  }

  if (offset && timezone !== undefined) {
    if (!timezone) return 'Horário indisponível';
    try {
      const instant = new Date(observedAt);
      const localDate = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        timeZone: timezone,
      }).format(instant);
      const localTime = new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        timeZone: timezone,
      }).format(instant);
      return `Observado em ${localDate} às ${localTime}`;
    } catch {
      return 'Horário indisponível';
    }
  }

  const localDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  }).format(date);

  return `Observado em ${localDate} às ${hour}:${minute}`;
}
