# 0001: Replace Apollo Client with a small `fetch` client

Status: accepted

## Context

The app makes one GraphQL query, once, and filters the result in the browser. Apollo Client was 45% of the
JavaScript bundle by source size. A throwaway prototype without it, measured before committing to the change,
was 40% smaller when gzipped and painted 300 ms sooner on a simulated slow phone.

## Decision

Use a 30-line client (`src/lib/graphql.ts`) that posts the query with `fetch`, accepts an abort signal and throws
a readable error for a failed request, an error status, GraphQL errors or an empty response. The data hook
cancels the request when the component goes away or retries.

## Consequences

- JavaScript fell from 142.7 kB to 86.1 kB gzipped, first paint from 1,652 ms to 1,352 ms, and loading 25,000
  countries from 1.3 s to 0.2 s, because Apollo was building a normalised cache entry for every country.
  See [docs/performance.md](../performance.md).
- The project no longer demonstrates Apollo. That is a real cost for a portfolio, accepted because the
  query is still GraphQL and the numbers justify it.
- There is no response cache. For one query that loads once, nothing needs one. An app with many related
  queries would, and this decision should be revisited then.

## Alternatives considered

- Keep Apollo and tune it: does not change the bundle, which was the main cost.
- TanStack Query over `fetch`: a good fit for many queries, but about 13 kB gzipped for one request.
