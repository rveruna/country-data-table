# Country Data Table

A responsive table of the world's countries with filtering, search, pagination and shareable URLs. Built with React, TypeScript, Apollo Client (GraphQL), Recoil and Tailwind CSS.

<p align="center"><img src="./demo.gif" alt="Demo: filtering, searching and paging the country table" width="800" /></p>

Data comes from the public [Countries GraphQL API](https://countries.trevorblades.com/).

## What it does

- Table of country name, code, continent and currency
- Pagination with 10, 20, 50 or 100 rows per page
- Filters for continent and currency
- Search that matches an exact country code or any part of a country name, debounced by 300 ms
- Page, filters and search are kept in the URL, so a view can be shared and survives a refresh
- Skeleton loading, an error state with a retry button, an offline banner and an error boundary
- Layout adapts to screen size with Tailwind breakpoints

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check and production build
npm run lint
npm test          # 132 tests
npm run test:coverage
```

## How it is put together

- **One fetch, derived views.** All countries are fetched once with Apollo. Filtering and pagination are Recoil selectors derived from that list and from the filter state, so nothing is refetched when you change a filter.
- **URL as shared state.** `useUrlState` keeps the query string and the Recoil state in sync in both directions, and ignores a page-size value that is not one of the allowed options.
- **Debounced search.** `useDebounce` delays updating the filters while you type, and the input syncs back when filters change from outside (for example from the URL).

## Tests

132 tests in 12 files, using Vitest and React Testing Library, with 97% of statements, 99% of branches and 91% of functions covered. Apollo is replaced by a mocked provider, so the tests run offline and never call the real API.

- **Logic:** the filter, search, pagination and currency selectors, and the debounce hook.
- **URL sync:** restoring page, page size and filters from a link, falling back from invalid values, and writing state back to the URL.
- **Components:** every component, queried by role and accessible name, as a user would find them.
- **Whole app:** loading, error and retry, filtering, searching, paging and opening a shared link, against mocked GraphQL data.
- **Accessibility:** axe-core runs against the loading, loaded, filtered, empty, later-page, error and error-boundary states. It cannot check colour contrast, because jsdom does not compute styles.

To check that the tests can fail, I broke the app on purpose in 27 ways (for example, an off-by-one page slice, a missing debounce, an unlinked label, a reintroduced heading skip) and ran the suite each time. 26 were caught. The one that was not does nothing visible, because an invalid page in the URL is corrected when the URL is rewritten.

### What writing the tests found

- **A shared link lost its page.** Opening `?page=3` landed on page 1, so the page number did not survive a refresh. An effect that reset the page whenever filters changed also fired when the URL itself set the filters. The reset now happens only when a person changes a filter.
- **Controls had no accessible names.** The Continent, Currency, search and page-size labels were not linked to their controls, and the clear, remove-filter and close buttons were unnamed icons.
- **The pagination text was wrong with no results.** It read "Showing 1 to 0 of 0 entries" and left Next enabled.
- **axe-core found two more.** The loading skeleton exposed empty table headers to screen readers, and the error alert's heading jumped from an h1 to an h3. Both are fixed.
- **"Try Again" reloaded the whole page,** discarding the filters. It now requests the countries again.
- **Dead code.** Two unused components, an unused `refetch` function, and a word-start search branch that the substring match already covered.

## Limits and what I would improve

- I have not measured performance or tested across browsers.
- Search is a substring and exact-code match, not a typo-tolerant fuzzy search.
- `src/lib/apollo.ts` (the real network client) is not covered by tests.
- Accessibility is checked with axe-core in jsdom, which cannot judge colour contrast or real screen reader behaviour. I would add a browser-based audit and test with a screen reader by hand.
