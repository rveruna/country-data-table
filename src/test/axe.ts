import axe from 'axe-core';
import { expect } from 'vitest';

/**
 * Fails with a readable list when axe finds accessibility violations in `container`.
 * Colour contrast is skipped because jsdom does not compute styles; check it in a real browser.
 */
export async function expectNoAxeViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] },
    rules: { 'color-contrast': { enabled: false } },
  });
  const summary = results.violations.map(
    (v) => `${v.id} (${v.impact}): ${v.help} [${v.nodes.map((n) => n.target.join(' ')).join(' | ')}]`,
  );
  expect(summary).toEqual([]);
}
