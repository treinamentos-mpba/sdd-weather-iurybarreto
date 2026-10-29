import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchBar from '../../src/components/SearchBar';

describe('SearchBar', () => {
  it('expõe uma busca nomeada e um campo com label acessível', () => {
    render(<SearchBar onSearch={vi.fn()} />);

    expect(screen.getByRole('search', { name: 'Buscar cidade' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Cidade' })).toBeInTheDocument();
  });

  it('envia a cidade aparada ao submeter', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), '  São Paulo  ');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).toHaveBeenCalledOnce();
    expect(onSearch).toHaveBeenCalledWith('São Paulo');
  });

  it('não envia busca vazia ou composta apenas por espaços', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('searchbox', { name: 'Cidade' });
    const form = screen.getByRole('search', { name: 'Buscar cidade' });

    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
    fireEvent.submit(form);
    await user.type(input, '   ');
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
    fireEvent.submit(form);

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('desabilita o campo e impede envio quando disabled é true', async () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} disabled />);

    expect(screen.getByRole('searchbox', { name: 'Cidade' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();

    fireEvent.submit(screen.getByRole('search', { name: 'Buscar cidade' }));
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('envia por teclado sem remover acentos, hífen ou apóstrofo', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), "São José-d'Oeste{Enter}");
    expect(onSearch).toHaveBeenCalledWith("São José-d'Oeste");
  });
});
