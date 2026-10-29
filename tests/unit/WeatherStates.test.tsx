import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import EmptyState from '../../src/components/states/EmptyState';
import ErrorState from '../../src/components/states/ErrorState';
import LoadingState from '../../src/components/states/LoadingState';

describe('estados da consulta meteorológica', () => {
  it('anuncia carregamento com role status', () => {
    render(<LoadingState message="Buscando clima…" />);

    expect(screen.getByRole('status')).toHaveTextContent('Buscando clima…');
  });

  it('apresenta erro e chama onRetry', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Não foi possível carregar os dados." onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar os dados.');
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('apresenta título e dica no estado vazio', () => {
    render(
      <EmptyState title="Nenhuma cidade encontrada" hint="Confira a grafia e tente novamente." />,
    );

    expect(screen.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeInTheDocument();
    expect(screen.getByText('Confira a grafia e tente novamente.')).toBeInTheDocument();
  });
});
