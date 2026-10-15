import { useUrlState } from '../hooks/useUrlState';

/**
 * Keeps the URL and the filter state in step. It renders nothing, and lives in its own component so
 * that a URL change re-renders only this component, not the whole app.
 */
export function UrlStateSync() {
  useUrlState();
  return null;
}
