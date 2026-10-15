# 0003: Keep the URL and the state in step in one direction at a time

Status: accepted

## Context

Page, page size and filters live in both the app state (Recoil then, Jotai since
[0006](0006-replace-recoil-with-jotai.md)) and the URL, so a view can be shared. The first version had two
effects, one writing the URL from the state and one reading the state from the URL, which triggered each
other. It worked by accident, and it lost the page number on a shared link. A first attempt at a fix, skipping
writes that changed nothing, made the effects loop forever, which hung the test run.

## Decision

Each effect acts only when the URL and the state disagree, and only in one direction. A state change writes
the URL; a URL change (a shared link, or back and forward) reads into the state. Writing the URL makes the two
agree, so it never triggers a read back, and nothing is written on first mount. The sync lives in a component
that renders nothing, so a URL change re-renders that component and not the app.

## Consequences

- A link such as `?page=3&continent=Europe` restores exactly that view, including after a reload.
- An invalid value in the URL (a page size that is not offered) is corrected and the URL is cleaned.
- The design is harder to describe than "two effects", but it cannot loop, and nine tests pin its behaviour.
