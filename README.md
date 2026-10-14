# Country Data Table

A responsive table of the world's countries with filtering, search, pagination and shareable URLs. Built with React, TypeScript, Apollo Client (GraphQL), Recoil and Tailwind CSS.

<p align="center"><img src="./demo.gif" alt="Demo: filtering, searching and paging the country table" width="800" /></p>

Data comes from the public [Countries GraphQL API](https://countries.trevorblades.com/).

## What it does

- Table of country name, code, continent and currency
- Pagination with 10, 20, 50 or 100 rows per page
- Filters for continent and currency
- Search that matches an exact country code, any part of a country name, or the start of any word in it, debounced by 300 ms
- Page, filters and search are kept in the URL, so a view can be shared and survives a refresh
- Skeleton loading, an error state with a retry button, an offline banner and an error boundary
- Layout adapts to screen size with Tailwind breakpoints

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check and production build
npm run lint
```

## How it is put together

- **One fetch, derived views.** All countries are fetched once with Apollo. Filtering and pagination are Recoil selectors derived from that list and from the filter state, so nothing is refetched when you change a filter.
- **URL as shared state.** `useUrlState` keeps the query string and the Recoil state in sync in both directions, and ignores a page-size value that is not one of the allowed options.
- **Debounced search.** `useDebounce` delays updating the filters while you type, and the input syncs back when filters change from outside (for example from the URL).

## Limits and what I would improve

- There are no automated tests. It is checked by the type-checker and linter only, and I have not measured performance or tested it across browsers.
- Accessibility relies on native elements (table, select, button). The form labels are not yet linked to their controls with `htmlFor`, and there is no extra keyboard handling, which I would fix first.
- "Retry" reloads the whole page instead of refetching.
- Search is a substring and word-start match, not a typo-tolerant fuzzy search.
