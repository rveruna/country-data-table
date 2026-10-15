# 0004: Check accessibility at four levels, and be explicit about what each misses

Status: accepted

## Context

No single check finds every accessibility problem. This project found that out directly: axe-core in the unit
tests passed while Lighthouse in a real browser reported a score of 90, because the tests run in jsdom.

## Decision

| Level | Tool | Catches | Misses |
|---|---|---|---|
| Lint | `eslint-plugin-jsx-a11y`, with `control-has-associated-label` switched on | icon-only buttons with no accessible name | an unlinked label whose text is dynamic, and the visible "x" on the filter chips |
| Unit tests | Testing Library queries by role and name | unlinked labels, unnamed controls, state announcements | anything that needs real layout |
| Unit tests | axe-core in jsdom | heading order, empty table headers, invalid ARIA | colour contrast and page-level landmarks, because jsdom computes no styles and renders into a container |
| Browser, in CI | Lighthouse in Chrome, score at least 95 | colour contrast, the main landmark, document-level problems | real screen reader behaviour |

Real screen reader testing is still manual and has not been done here.

## Consequences

- The Lighthouse run caught faint grey text and a missing `main` landmark that the tests could not see. Both
  are fixed, and a test now asserts the landmark.
- Each rule was checked by undoing a fix and watching it fail, so the table above states what is true rather
  than what is hoped.
