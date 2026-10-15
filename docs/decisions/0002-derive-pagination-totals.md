# 0002: Derive the page totals instead of storing them

Status: accepted

## Context

The total number of results and the page count were computed from the filtered list, then written into state by
an effect. Every filter change therefore rendered twice: once for the filter, and once when the effect updated
the totals. Counting renders with the React Profiler showed choosing a continent rendered the header, table and
pagination five times each.

## Decision

State holds only what a person can change: the page and the page size. A selector derives the totals and the
page count from the filtered list. The effect is gone. A page that no longer exists (an old link, or fewer
results) is corrected in the pagination component.

## Consequences

- Choosing a continent renders the header, table and pagination once. A render budget test fails if that
  regresses.
- The top-level component no longer subscribes to the filtered list, so it does not re-render on filter changes.
- Anything that needs the totals reads the selector, not the atom, which is one more thing to remember.
