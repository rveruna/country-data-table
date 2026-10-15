import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterDropdown } from '../components/FilterDropdown';

const options = ['Africa', 'Asia', 'Europe'];

describe('FilterDropdown', () => {
  it('shows the placeholder first, then every option', () => {
    render(
      <FilterDropdown
        label="Continent"
        value={undefined}
        options={options}
        onChange={vi.fn()}
        placeholder="All Continents"
      />,
    );

    const labels = screen.getAllByRole('option').map((o) => o.textContent);
    expect(labels).toEqual(['All Continents', 'Africa', 'Asia', 'Europe']);
  });

  it('defaults the placeholder to "All"', () => {
    render(<FilterDropdown label="Currency" value={undefined} options={[]} onChange={vi.fn()} />);

    expect(screen.getByRole('option', { name: 'All' })).toBeInTheDocument();
  });

  it('shows the current value as selected', () => {
    render(<FilterDropdown label="Continent" value="Asia" options={options} onChange={vi.fn()} />);

    expect(screen.getByRole('combobox')).toHaveValue('Asia');
  });

  it('reports the chosen option', async () => {
    const onChange = vi.fn();
    render(<FilterDropdown label="Continent" value={undefined} options={options} onChange={onChange} />);

    await userEvent.selectOptions(screen.getByRole('combobox'), 'Europe');

    expect(onChange).toHaveBeenCalledWith('Europe');
  });

  it('reports undefined when the placeholder is chosen again', async () => {
    const onChange = vi.fn();
    render(<FilterDropdown label="Continent" value="Europe" options={options} onChange={onChange} />);

    await userEvent.selectOptions(screen.getByRole('combobox'), '');

    expect(onChange).toHaveBeenCalledWith(undefined);
  });
});
