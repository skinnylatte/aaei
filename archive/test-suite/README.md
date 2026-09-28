# Archived: case study test suite panel

Removed from the case study pages on 28 September 2026, when the expected behaviour moved to the answer sheets at `/case-studies/<name>/answers/`. Kept here so it can be restored. Nothing in this folder is built or deployed.

## What it was

A panel at the bottom of each case study page with:

- the built-in test suite, each test with a **Run** button;
- after a run, one result per version (weak, patched, safe) that replayed the test in the case study above;
- a results grid showing which checks failed, per version;
- an evidence summary counting failed checks by kind;
- a deployment decision form (version, decision, conditions) with a **Copy summary** button.

## What still lives in `src/`

The engines, checks and suites are still used by the answer sheets, so they were not archived:

- `src/lib/case-studies/runner.ts`: `runTest`, `failures`, the `Check` and `TestCase` types
- `SUITE` and `checks` in `northstar.ts`, `tidewater.ts` and `harbour-city.ts`

## Files

| File | Restore to |
| --- | --- |
| `TestPanel.astro` | `src/components/case-studies/TestPanel.astro` |
| `test-panel.ts` | Append the `mountTestPanel` function to `src/lib/case-studies/panels.ts`, and change its import path to `./runner` |
| `test-panel.css` | Append to `src/styles/case-studies.css` |

## Restoring it on a page

On each case study page, import the component and render `<TestPanel caseId="…" />` after the "behind the scenes" section. Then call the panel from the page script, passing a function that replays a test in the live view. For Northstar:

```ts
mountTestPanel(document.querySelector('[data-tests]')!, northstar, SUITE, (t, v) => {
  $<HTMLSelectElement>('#chat-variant').value = v;
  $<HTMLSelectElement>('#chat-principal').value = t.setup.principal;
  start();
  for (const step of t.steps) {
    if (step.action === 'say') chat!.turn(step.value ?? '');
    else chat!.resolve(Number(step.value), step.action === 'agent-approve');
  }
  render();
  document.querySelector('.chat-layout')!.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
```

Tidewater and Harbour City follow the same shape: set the setup controls, start a session, replay the steps, render. The last version of those functions is in the git history of `src/pages/case-studies/tidewater.astro` and `harbour-city.astro`.
