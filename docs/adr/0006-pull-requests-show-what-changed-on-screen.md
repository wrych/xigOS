# 0006. Pull requests show what changed on screen

- **Status:** Accepted
- **Date:** 2026-11-09
- **Deciders:** Andy Moesch

## Context

A maintainer approves most agent pull requests, often from a phone. A change to
something a person sees — a screen, a layout, an email, a message, command
output — is judged by looking at it, and the diff does not show that. Today the
maintainer pulls the branch or waits for a preview deployment just to see it.

Agents in Claude Code cloud sessions have a browser (Chromium with Playwright)
and can capture what they built. They cannot upload an image into a pull
request: GitHub takes attachments only through its web page, and its API takes
text files only. Committing images to the branch puts them on `main` with the
squash merge; pushing them to a separate branch is a push the review gate
refuses, since the gate reviews only commits on the checked-out branch.

## Decision

- **A pull request whose change can be seen shows it**, in screenshots or a
  short video, whenever the agent can run the change. Seen means a screen, a
  component, a layout, an email, or output a person reads.
- **What to capture:** the changed state; before and after when something was
  there before; phone width (390 px) and desktop width; light and dark when the
  theme matters; the empty and error states the change touches. A flow of
  several steps or an animation is a video or GIF of under 30 seconds.
  Screenshots a person will read are taken at device scale factor 2.
- **Seeded data only.** No real person's data in any image (§5); use fixtures.
- **Where they go:** never committed to the branch. Where the harness can
  publish a private page (a claude.ai Artifact), the agent publishes one page
  with the images and video, captioned, and links it under "How it is tested".
  It also sends the files to the person in the session. A person writing a
  pull request drags them into the description.
- **When it cannot capture** — no runnable app, a service the session cannot
  reach — it says so and why under "How it is tested". It never shows a mock-up
  as a capture of the change.
- **Images are evidence, not tests.** The behavior still ships with its tests
  (§2).
- Nothing to see — a refactor, a test, a tool — needs no capture.

## Alternatives considered

- **An orphan media branch** — renders in the description, but the review gate
  refuses the push, and loosening the gate for it is a larger decision.
- **CI uploads screenshots as artifacts** — needs a download to view, and
  every project would need a browser job.
- **Rely on preview deployments** — slower, not every project has one, and the
  maintainer still has to click through to find the change.

## Consequences

- The maintainer can approve a visible change from the description, without
  checking out the branch.
- A private Artifact page is visible only to its owner, the person whose
  session made it. Another maintainer sees it only once it is shared; the agent
  says so when someone else is asked to review.
- Capturing costs the agent a few minutes; a change nobody can see costs none.
- If GitHub ever accepts image uploads through its API, the images move into
  the description and this ADR is superseded.

## References

Constitution §1, §2, §5. ADR 0004 (the review gate).
