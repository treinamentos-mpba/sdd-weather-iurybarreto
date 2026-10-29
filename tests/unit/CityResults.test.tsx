import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CityResults from '../../src/components/CityResults';
import type { City } from '../../src/types/weather';

const city: City = {
  id: 1,
  name: 'Springfield',
  adminRegion: 'Illinois',
  country: 'Estados Unidos',
  latitude: 39.78,
  longitude: -89.64,
};

describe('CityResults', () => {
  it('exibe contexto geográfico e seleciona somente o local acionado', () => {
    const secondCity = { ...city, id: 2, adminRegion: 'Missouri' };
    const onSelect = vi.fn();
    render(<CityResults cities={[city, secondCity]} selectedCityId={null} onSelect={onSelect} />);

    const illinois = screen.getByRole('button', { name: 'Springfield, Illinois, Estados Unidos' });
    const missouri = screen.getByRole('button', { name: 'Springfield, Missouri, Estados Unidos' });

    expect(illinois).toHaveAttribute('aria-pressed', 'false');
    expect(missouri).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(missouri);
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith(secondCity);
  });

  it('exibe o nome retornado como texto, nunca como marcação HTML', () => {
    render(
      <CityResults
        cities={[{ ...city, name: '<b>Cidade</b>' }]}
        selectedCityId={null}
        onSelect={vi.fn()}
      />,
    );
    expect(
      screen.getByRole('button', { name: '<b>Cidade</b>, Illinois, Estados Unidos' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Cidade', { exact: true })).not.toBeInTheDocument();
  });
});
