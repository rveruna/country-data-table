import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { countries } from '../test/fixtures';
import { expectNoAxeViolations } from '../test/axe';
import { countriesErrorMock, countriesQueryMock, renderWithProviders } from '../test/utils';

describe('accessibility (axe-core)', () => {
  it.each([
    ['while loading', undefined],
    ['once loaded', 'United States'],
  ])('has a main landmark %s', async (_state, ready) => {
    renderWithProviders(<App />, { mocks: [countriesQueryMock(countries)] });
    if (ready) await screen.findByText(ready);

    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('has a main landmark in the error state', async () => {
    renderWithProviders(<App />, { mocks: [countriesErrorMock('Network down')] });
    await screen.findByText('Failed to load countries');

    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('has no violations while loading', async () => {
    const { container } = renderWithProviders(<App />, { mocks: [countriesQueryMock(countries)] });
    await expectNoAxeViolations(container);
  });

  it('has no violations once the table has loaded', async () => {
    const { container } = renderWithProviders(<App />, { mocks: [countriesQueryMock(countries)] });
    await screen.findByText('United States');
    await expectNoAxeViolations(container);
  });

  it('has no violations with filters and a search applied', async () => {
    const { container } = renderWithProviders(<App />, {
      route: '/?continent=Europe&currency=EUR&search=an',
      mocks: [countriesQueryMock(countries)],
    });
    await screen.findByText('Germany');
    await expectNoAxeViolations(container);
  });

  it('has no violations when nothing matches', async () => {
    const { container } = renderWithProviders(<App />, {
      route: '/?search=atlantis',
      mocks: [countriesQueryMock(countries)],
    });
    await screen.findByText('No countries found');
    await expectNoAxeViolations(container);
  });

  it('has no violations on a later page', async () => {
    const { container } = renderWithProviders(<App />, { mocks: [countriesQueryMock(countries)] });
    await screen.findByText('United States');
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await expectNoAxeViolations(container);
  });

  it('has no violations in the error state', async () => {
    const { container } = renderWithProviders(<App />, { mocks: [countriesErrorMock('Network down')] });
    await screen.findByText('Failed to load countries');
    await expectNoAxeViolations(container);
  });

  it('has no violations in the error boundary fallback', async () => {
    const Boom = () => {
      throw new Error('kaboom');
    };
    const spy = (await import('vitest')).vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = renderWithProviders(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    await expectNoAxeViolations(container);
    spy.mockRestore();
  });
});
