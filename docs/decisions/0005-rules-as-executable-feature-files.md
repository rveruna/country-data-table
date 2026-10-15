# 0005: Write the table's rules as executable feature files

Status: accepted

## Context

The README promises how search, the filters, paging and shared links behave, and the unit tests check it, but
the promises themselves were spread across test names in 15 files. Nobody could read the agreed behaviour in one
place, and a test could be edited to match the code without anyone noticing that a promise had changed.

## Decision

Each area has a Gherkin feature file in `src/features` that states its rules in plain English, grouped by `Rule:`
and driven by `Examples` tables that include the edge cases (the last part page, a code that is also part of a
name, an empty search). Every file opens by saying it is agreed behaviour, and that a failure means the code is
wrong. The steps sit next to each file in `X.steps.ts` and call the selectors directly; only the debounce and the
URL sync, which live in a component and a hook, are rendered.

They run under Vitest with `@amiceli/vitest-cucumber` (version 5, the line that supports Vitest 3), so `npm test`
and CI run them with no extra step. That library expects every scenario to be named again in code, so a small
runner in `src/features/support` binds each step by pattern instead, as Cucumber does. A new scenario that uses
existing steps needs only the feature file.

A rule the code does not meet yet is tagged `@known-bug` and reported as skipped, not deleted or reworded.

## Consequences

- The rules can fail: breaking the search, the exact-code match, the page slice, the debounce or the URL sync on
  purpose each failed at least one scenario.
- Writing them found one bug: a link with a page size that is not offered, such as `?limit=7`, shows 10 rows but
  keeps `limit=7` in the address, against [0003](0003-one-directional-url-sync.md). The value fell back to its
  default, the state did not change, so nothing rewrote the address. It is fixed: reading the URL now cleans it
  too, and the scenarios that were tagged `@known-bug` run.
- Vitest counts each step as a test, so its total (363) is larger than the number of scenarios (59).
- There is one more development dependency and a 90-line runner of our own to maintain. Neither reaches the
  bundle.
