import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { MutableSnapshot } from 'recoil';
import { Pagination } from '../components/Pagination';
import { countriesState, paginationState } from '../store/countryStore';
import { makeCountries } from '../test/fixtures';
import { renderWithProviders } from '../test/utils';

const setup = (total: number, page = 1, limit = 10) => {
  const init = (s: MutableSnapshot) => {
    s.set(countriesState, makeCountries(total));
    s.set(paginationState, { page, limit });
  };
  return renderWithProviders(<Pagination />, { initializeState: init });
};

const button = (name: string | RegExp) => screen.getByRole('button', { name });

describe('Pagination', () => {
  it('describes the visible range', () => {
    setup(25);
    expect(screen.getByText('Showing 1 to 10 of 25 entries')).toBeInTheDocument();
  });

  it('shortens the range on the last page', () => {
    setup(25, 3);
    expect(screen.getByText('Showing 21 to 25 of 25 entries')).toBeInTheDocument();
  });

  it('disables Previous on the first page and Next on the last', () => {
    const { unmount } = setup(25, 1);
    expect(button(/previous/i)).toBeDisabled();
    expect(button(/next/i)).toBeEnabled();
    unmount();

    setup(25, 3);
    expect(button(/previous/i)).toBeEnabled();
    expect(button(/next/i)).toBeDisabled();
  });

  it('moves to the next and previous page', async () => {
    setup(25);

    await userEvent.click(button(/next/i));
    expect(screen.getByText('Showing 11 to 20 of 25 entries')).toBeInTheDocument();

    await userEvent.click(button(/previous/i));
    expect(screen.getByText('Showing 1 to 10 of 25 entries')).toBeInTheDocument();
  });

  it('jumps to a page number', async () => {
    setup(25);

    await userEvent.click(button('3'));

    expect(screen.getByText('Showing 21 to 25 of 25 entries')).toBeInTheDocument();
  });

  it('links the page-size label to its select', () => {
    setup(25);
    expect(screen.getByLabelText('Show')).toBe(screen.getByRole('combobox'));
  });

  it('offers 10, 20, 50 and 100 rows per page', () => {
    setup(25);
    const sizes = screen.getAllByRole('option').map((o) => o.textContent);
    expect(sizes).toEqual(['10', '20', '50', '100']);
  });

  it('returns to page 1 when the page size changes', async () => {
    setup(120, 3);

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Show' }), '50');

    expect(screen.getByText('Showing 1 to 50 of 120 entries')).toBeInTheDocument();
  });

  describe('with many pages', () => {
    it('shows the first and last page with ellipses around a window of five', () => {
      setup(200, 10); // 20 pages
      const labels = screen.getAllByRole('button').map((b) => b.textContent);

      expect(labels).toEqual(expect.arrayContaining(['1', '8', '9', '10', '11', '12', '20']));
      expect(labels).not.toContain('7');
      expect(labels).not.toContain('13');
      expect(screen.getAllByText('...')).toHaveLength(2);
    });

    it('drops the leading ellipsis near the start', () => {
      setup(200, 1);

      expect(screen.getAllByText('...')).toHaveLength(1);
      expect(button('1')).toBeInTheDocument();
      expect(button('5')).toBeInTheDocument();
      expect(button('20')).toBeInTheDocument();
    });

    it('drops the trailing ellipsis near the end', () => {
      setup(200, 20);

      expect(screen.getAllByText('...')).toHaveLength(1);
    });

    it('shows the page numbers directly with no ellipsis when there are five pages or fewer', () => {
      setup(50);

      expect(screen.queryByText('...')).not.toBeInTheDocument();
      expect(button('5')).toBeInTheDocument();
    });
  });

  describe('with no results', () => {
    it('reports an empty range and disables both buttons', () => {
      setup(0);

      expect(screen.getByText('Showing 0 to 0 of 0 entries')).toBeInTheDocument();
      expect(button(/previous/i)).toBeDisabled();
      expect(button(/next/i)).toBeDisabled();
    });
  });
});
