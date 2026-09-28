// ARCHIVED: the clickable test suite panel, removed from the case study pages on 2026-09-28.
// It depends on ../../src/lib/case-studies/runner.ts. See README.md in this folder to restore it.

import { VARIANTS, VARIANT_LABELS, esc, failures, runTest, store, type CaseStudy, type TestCase, type TestRun, type Variant } from '../../src/lib/case-studies/runner';

const q = <T extends Element = HTMLElement>(root: ParentNode, sel: string) => root.querySelector<T>(sel)!;

// ---------- Test suite and evidence summary ----------

// The suite is fixed per case study. "Run" replays a test against every version; "Watch" hands it to the page to replay live.
export function mountTestPanel<S, Setup>(root: HTMLElement, cs: CaseStudy<S, Setup>, suite: TestCase<Setup>[], watch: (t: TestCase<Setup>, v: Variant) => void) {
  const decisionKey = `aaei:${cs.id}:decision`;
  const runs: Record<string, TestRun[]> = {};

  const list = q(root, '[data-tests-list]');
  const grid = q(root, '[data-tests-grid]');
  const status = q(root, '[data-tests-status]');
  const summary = q(root, '[data-evidence]');
  const decisionForm = q<HTMLFormElement>(root, '[data-decision]');
  const say = (msg: string) => { status.textContent = msg; };

  // Before a run, the only action is Run. After it, each version's result is a button that replays it above.
  const verdict = (t: TestCase<Setup>) => {
    const r = runs[t.id];
    if (!r) return '';
    const pills = r.map((run) => {
      const bad = failures(run).length;
      const result = run.error ? 'error' : bad ? `${bad} failed` : 'passed';
      return `<button type="button" class="pill pill-button ${bad || run.error ? 'bad' : 'ok'}" data-watch="${t.id}" data-variant="${run.variant}" aria-label="${VARIANT_LABELS[run.variant]}: ${result}. Replay this test in the ${VARIANT_LABELS[run.variant].toLowerCase()} version above.">${VARIANT_LABELS[run.variant]}: ${result} <span aria-hidden="true">↑</span></button>`;
    }).join('');
    return `<div class="test-verdict">${pills}</div><p class="verdict-hint">Select a result to replay it above.</p>`;
  };

  const renderList = () => {
    list.innerHTML = suite.map((t) => `<li><div class="test-info"><strong>${esc(t.name)}</strong><span>${esc(t.description)}</span>${verdict(t)}</div><button type="button" class="button button-primary test-run" data-run="${t.id}" aria-label="${runs[t.id] ? 'Run again' : 'Run'}: ${esc(t.name)}">${runs[t.id] ? 'Run again' : 'Run'}</button></li>`).join('');
  };

  const renderGrid = () => {
    const ran = suite.filter((t) => runs[t.id]);
    if (!ran.length) { grid.innerHTML = ''; summary.innerHTML = '<p class="empty-row">Run some tests to see the evidence.</p>'; return; }
    const cell = (run: TestRun) => {
      if (run.error) return `<td><span class="pill bad">Error</span><p class="cell-detail">${esc(run.error)}</p></td>`;
      const bad = failures(run);
      if (!run.results.length) return '<td><span class="pill">No checks applied</span></td>';
      return bad.length
        ? `<td><span class="pill bad">${bad.length} failed</span><ul class="cell-detail">${bad.map((f) => `<li><strong>${esc(f.check.label)}</strong>: ${esc(f.result.detail)}</li>`).join('')}</ul></td>`
        : `<td><span class="pill ok">Passed ${run.results.length}</span></td>`;
    };
    grid.innerHTML = `<h3>Results</h3><div class="table-scroll"><table class="results"><caption>Each cell shows the checks that failed when the test was replayed against that version.</caption><thead><tr><th scope="col">Test</th>${VARIANTS.map((v) => `<th scope="col">${VARIANT_LABELS[v]}</th>`).join('')}</tr></thead><tbody>${ran.map((t) => `<tr><th scope="row">${esc(t.name)}</th>${runs[t.id].map(cell).join('')}</tr>`).join('')}</tbody></table></div>`;
    renderSummary(ran);
  };

  const renderSummary = (ran: TestCase<Setup>[]) => {
    const kinds = new Set<string>();
    const byVariant = VARIANTS.map((v) => {
      const counts: Record<string, number> = {};
      let passed = 0, failed = 0;
      ran.forEach((t) => {
        const run = runs[t.id].find((r) => r.variant === v)!;
        run.results.forEach((r) => { if (r.result.pass) passed++; else { failed++; kinds.add(r.check.kind); counts[r.check.kind] = (counts[r.check.kind] ?? 0) + 1; } });
      });
      return { v, counts, passed, failed };
    });
    const kindList = [...kinds].sort();
    summary.innerHTML = `<div class="table-scroll"><table class="results"><caption>Failed checks by kind, across ${ran.length} of ${suite.length} tests</caption><thead><tr><th scope="col">Version</th><th scope="col">Checks passed</th><th scope="col">Checks failed</th>${kindList.map((k) => `<th scope="col">${esc(k)}</th>`).join('')}</tr></thead><tbody>${byVariant.map((b) => `<tr><th scope="row">${VARIANT_LABELS[b.v]}</th><td>${b.passed}</td><td>${b.failed}</td>${kindList.map((k) => `<td>${b.counts[k] ?? 0}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  };

  const run = (t: TestCase<Setup>) => { runs[t.id] = VARIANTS.map((v) => runTest(cs, t, v)); };

  list.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!el) return;
    if (el.dataset.run) {
      const t = suite.find((x) => x.id === el.dataset.run)!;
      run(t);
      renderList();
      renderGrid();
      say(`Ran "${t.name}" against weak, patched and safe.`);
      list.querySelector<HTMLButtonElement>(`[data-run="${t.id}"]`)?.focus();
    } else if (el.dataset.watch) {
      const t = suite.find((x) => x.id === el.dataset.watch)!;
      const v = el.dataset.variant as Variant;
      watch(t, v);
      say(`Replayed "${t.name}" in the ${VARIANT_LABELS[v].toLowerCase()} version, in the case study above.`);
    }
  });

  q<HTMLButtonElement>(root, '[data-tests-run]').addEventListener('click', () => {
    suite.forEach(run);
    renderList();
    renderGrid();
    say(`Ran all ${suite.length} tests against weak, patched and safe.`);
  });

  // Decision form: saved as the trainee types.
  const saved = store.get<Record<string, string>>(decisionKey, {});
  [...decisionForm.elements].forEach((el) => {
    const field = el as HTMLInputElement;
    if (!field.name || saved[field.name] === undefined) return;
    if (field.type === 'radio') field.checked = field.value === saved[field.name];
    else field.value = saved[field.name];
  });
  decisionForm.addEventListener('input', () => store.set(decisionKey, Object.fromEntries(new FormData(decisionForm) as unknown as Iterable<[string, string]>)));
  decisionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(decisionForm) as unknown as Iterable<[string, string]>);
    const ran = suite.filter((t) => runs[t.id]);
    const lines = [
      `${cs.title}: deployment decision`,
      `Version assessed: ${data.version ? VARIANT_LABELS[data.version as Variant] : 'not chosen'}`,
      `Decision: ${data.decision ?? 'not chosen'}`,
      `Conditions or evidence still needed: ${data.conditions || 'none given'}`,
      '',
      `Tests run: ${ran.length} of ${suite.length}`,
      ...VARIANTS.map((v) => {
        const vr = ran.map((t) => runs[t.id].find((r) => r.variant === v)!);
        const failed = vr.reduce((n, r) => n + failures(r).length, 0);
        return `${VARIANT_LABELS[v]}: ${vr.length ? `${failed} failed checks` : 'not run'}`;
      }),
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      q(decisionForm, '[data-decision-status]').textContent = 'Copied the summary. Paste it into your notes or group doc.';
    } catch {
      q(decisionForm, '[data-decision-status]').textContent = 'Copying is blocked in this browser. Select the text below instead.';
      q(decisionForm, '[data-decision-fallback]').textContent = lines.join('\n');
    }
  });

  renderList();
  renderGrid();
}
