import { type KeyboardEvent, useRef } from 'react';
import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

const units: Unit[] = ['celsius', 'fahrenheit'];

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }

    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (index + direction + units.length) % units.length;
    onChange(units[nextIndex]);
    buttonRefs.current[nextIndex]?.focus();
  }

  return (
    <div
      role="group"
      aria-label="Unidade de temperatura"
      className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1 shadow-glass backdrop-blur-md"
    >
      {units.map((option, index) => {
        const isSelected = unit === option;
        const label = option === 'celsius' ? 'Celsius' : 'Fahrenheit';
        const symbol = option === 'celsius' ? '°C' : '°F';

        return (
          <button
            key={option}
            ref={(element) => {
              buttonRefs.current[index] = element;
            }}
            type="button"
            aria-label={label}
            aria-pressed={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(option)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`min-w-12 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 ${
              isSelected
                ? 'bg-accent-600 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            {symbol}
          </button>
        );
      })}
    </div>
  );
}
