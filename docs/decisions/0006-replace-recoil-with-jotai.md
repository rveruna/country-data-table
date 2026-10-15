# 0006: Replace Recoil with Jotai

Status: accepted

## Context

The app kept its state in Recoil: five atoms (the countries, filters, page, loading and error) and four
selectors derived from them (the filtered list, the current page, the currencies and the page totals). Recoil's
last release, 0.7.7, was in February 2024, and its repository has been archived since January 2025.

React 19 made that a blocker. Recoil reads `ReactCurrentDispatcher` from React's private internals, which React
19 removed, so the Dependabot update to React 19 failed 21 tests with
`Cannot destructure property 'ReactCurrentDispatcher' of 'react.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED'`.
No fix is coming from an archived project.

## Decision

Replace Recoil with Jotai, which has the same model of small atoms and values derived from them, supports
React 19, and is maintained.

- Each atom stays an atom and each selector becomes a derived atom, with the same logic. Names end in `Atom`
  instead of `State` and `Selector`.
- The filter action, which changes the filters and returns to page 1, is a write-only atom. Like the Recoil
  callback it replaces, it reads the filters when called, so the components that use it do not subscribe to
  them.
- The app uses Jotai's default store and needs no provider. Each test render gets a store of its own, which
  tests can fill before rendering, as Recoil's `initializeState` did.
- The feature steps for search, filters and paging set atoms in a fresh store and read the derived atom from
  it, with no rendering, where they used Recoil's `snapshot_UNSTABLE`. The shared-link steps render the URL
  sync and read and set the state through that render's store.

## What stayed the same

- Behaviour. All 154 tests and all 59 rule scenarios pass with no assertion weakened. One test now waits for
  the URL, which React 19 can write a moment after the table; it still checks the same value.
- The URL sync in `useUrlState` ([0003](0003-one-directional-url-sync.md)): one direction at a time, nothing
  written on first mount, and invalid values cleaned out of the address.
- The render budget ([0002](0002-derive-pagination-totals.md)): choosing a continent still renders the header,
  table and pagination once each.
- The earlier records say "selector". They describe what was decided at the time; the same values are derived
  atoms now.

## Consequences

- React can be upgraded. React 19 went in with no other source change.
- Bundle size, measured with `npm run size`: Recoil to Jotai on React 18 cut JavaScript from 87.6 kB to 67.5 kB
  gzipped. React 19 then added 22.5 kB of its own, ending at 90.0 kB, inside the 100 kB budget. On Recoil,
  React 19 would have gone over it.
- Jotai has no string keys, so atoms are identified by the module that exports them. Recoil's keys had to be
  unique by hand; nothing replaces that check because nothing needs it.
