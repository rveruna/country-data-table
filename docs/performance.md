# Performance

How I measured, what I changed, and what each change did. Every number here comes from a script in
`perf/` that you can run yourself.

## How it is measured

| What | How | Command |
|---|---|---|
| Page load | Lighthouse in real Chrome, mobile emulation, simulated slow 4G, median of 5 runs | `npm run perf:lighthouse` |
| Interactions | Chrome with a 4x CPU slowdown (about a mid-range phone), median of 9 samples after 4 warm-ups, with 250, 2,500 and 25,000 countries | `npm run perf:scale` |
| Re-renders | React Profiler, counted per interaction in a test | `npm test` (render budget) |
| Bundle size | Gzipped size of the production build | `npm run size` |

The API is a local mock with the real 250 countries and a fixed 150 ms delay, so a run does not depend on a
remote server. Everything ran on one laptop, so the numbers are for comparing before and after, not promises
about other devices. Interaction time is the time until the work for the event has finished; paint is not
included, because waiting for animation frames cannot measure anything under about 33 ms.

## Results

### Page load (Lighthouse, simulated mobile)

| | Before | After |
|---|---|---|
| Performance score | 99 | **100** |
| First contentful paint | 1,652 ms | **1,352 ms** |
| Largest contentful paint | 1,802 ms | **1,502 ms** |
| Total blocking time | 1 ms | **0 ms** |
| JavaScript | 465 kB (142.7 kB gzipped) | **271 kB (86.1 kB gzipped)** |
| Page weight | 166 kB | **111 kB** |

### Interactions (4x CPU slowdown, milliseconds)

| Countries | Load | Filter | Page size | Search* |
|---|---|---|---|---|
| 250, before | 244 | 10.2 | 20.0 | 6.4 |
| 250, after | **153** | **7.2** | **13.8** | **4.8** |
| 2,500, before | 340 | 10.5 | 19.8 | 6.9 |
| 2,500, after | **154** | **7.8** | **12.8** | **5.1** |
| 25,000, before | 1,343 | 21.1 | 23.3 | 12.2 |
| 25,000, after | **209** | **8.7** | **13.8** | **7.7** |

\* Excludes the fixed 300 ms debounce. At every size the page shows 10 rows and 375 DOM nodes.

### Re-renders

| Interaction | Before | After |
|---|---|---|
| Choose a continent | header, filters, search, table and pagination, 5 times each | header, table and pagination, **once** |
| Next page | those five components, 4 times each | table and pagination once; header and filters **not at all** |

## What changed, and why

1. **Replaced Apollo Client with a small `fetch` client.** Apollo was 45% of the bundle, and the app makes one
   query, so its normalised cache bought nothing. This was the only change that helped page load (first paint
   300 ms sooner) and it also cut load time with 25,000 countries from 1.3 s to 0.2 s, because Apollo was
   building a normalised cache entry for every country. The cost is that the project no longer uses Apollo.
   The query is still GraphQL.
2. **Made the URL sync one-directional and moved it out of `App`.** The two effects wrote to each other and
   made the whole page re-render on every change. Each effect now acts only when the URL and the state
   disagree, and the sync lives in a component that renders nothing.
3. **Derived the page totals instead of copying them into state.** An effect computed the totals and stored
   them, which cost a second render pass on every filter change. A selector derives them now.
4. **Memoised the display components,** which take only a class name.
5. **Started out in the loading state,** so the first paint is the placeholder and not an empty table.

## What I did not do, and why

- **No list virtualisation.** I measured 25,000 countries: the page still renders 10 rows, and interactions
  take under 14 ms at a 4x slowdown. Virtualisation would add code to solve a problem the pagination already
  prevents.
- **No code-splitting.** Everything on the page is needed for the first paint, and 86 kB gzipped is one request.
  Splitting it would add requests without making the first paint sooner.
- **No real-device testing.** The throttling is simulated.

## Things that went wrong along the way

- My first attempt at the URL fix, skipping identical writes, made the two effects loop forever. The tests
  hung, which is how I found it. The fix was a different design, not a smaller patch.
- My first render counter was itself memoised, so it hid the exact regressions it was meant to catch. A
  counter that mirrors the thing under test cannot detect its removal. I fixed it and checked that the
  budget now fails when `App` subscribes to the data again or the URL sync moves back into it.
- My first interaction benchmark reported 32 ms for everything, which was just two animation frames, the floor
  of the method. I changed it to measure the work itself.

## Guards in CI

- Bundle budget: JavaScript at most 100 kB gzipped and CSS at most 6 kB (`npm run size`).
- Lighthouse performance score at least 90 over 3 runs.
- The render budget tests.
