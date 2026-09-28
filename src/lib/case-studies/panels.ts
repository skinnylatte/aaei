// Browser-side panel shared by every case study page: the failure-mode worksheet.
// (The test suite panel is archived in archive/test-suite/.)

import { esc, newId, store, type FailureMode } from './runner';

const q = <T extends Element = HTMLElement>(root: ParentNode, sel: string) => root.querySelector<T>(sel)!;

// ---------- Worksheet ----------

type Status = 'found' | 'not-seen';
type Row = { id: string; mode: string; harmed: string; severity: number; likelihood: number; status?: Status };

const storageKey = (caseId: string) => `aaei:${caseId}:worksheet`;
const byRisk = (rows: Row[]) => [...rows].sort((a, b) => b.severity * b.likelihood - a.severity * a.likelihood);

export function riskChip(score: number) {
  const band = score >= 9 ? 'high' : score >= 4 ? 'medium' : 'low';
  return `<span class="risk risk-${band}">${band[0].toUpperCase() + band.slice(1)} ${score}</span>`;
}

// Grow a text cell to fit its content, in browsers without CSS field-sizing.
const fit = (el: HTMLTextAreaElement) => { el.style.height = 'auto'; el.style.height = `${el.scrollHeight + 2}px`; };

const options = (selected: number) => [1, 2, 3, 4].map((n) => `<option${n === selected ? ' selected' : ''}>${n}</option>`).join('');

export function mountWorksheet(root: HTMLElement, caseId: string, defaults: FailureMode[]) {
  const key = storageKey(caseId);
  let rows = store.get<Row[]>(key, []);
  let lastCleared: Row[] | null = null;
  const body = q(root, '[data-ws-rows]');
  const form = q<HTMLFormElement>(root, '[data-ws-form]');
  const status = q(root, '[data-ws-status]');
  const clearButton = q<HTMLButtonElement>(root, '[data-ws-clear]');
  const guide = q<HTMLDetailsElement>(root, '[data-ws-guide]');
  if (matchMedia('(max-width: 1000px)').matches) guide.open = false;

  const save = () => store.set(key, rows);
  const say = (html: string) => { status.innerHTML = html; };

  const render = () => {
    clearButton.disabled = !rows.length;
    body.innerHTML = rows.length
      ? byRisk(rows).map((r, i) => `<tr data-id="${r.id}">
          <td class="ws-rank" data-label="Rank">${i + 1}</td>
          <td data-label="Failure mode"><textarea class="ws-cell" data-field="mode" rows="2" maxlength="200" aria-label="Failure mode">${esc(r.mode)}</textarea></td>
          <td data-label="Who is harmed"><textarea class="ws-cell" data-field="harmed" rows="2" maxlength="120" aria-label="Who is harmed by: ${esc(r.mode)}">${esc(r.harmed)}</textarea></td>
          <td data-label="Severity"><select class="ws-cell" data-field="severity" aria-label="Severity of: ${esc(r.mode)}">${options(r.severity)}</select></td>
          <td data-label="Likelihood"><select class="ws-cell" data-field="likelihood" aria-label="Likelihood of: ${esc(r.mode)}">${options(r.likelihood)}</select></td>
          <td data-label="Risk">${riskChip(r.severity * r.likelihood)}</td>
          <td class="ws-remove"><button type="button" class="ws-remove-button" data-remove="${r.id}" aria-label="Remove ${esc(r.mode)}" title="Remove">✕</button></td>
        </tr>`).join('')
      : '<tr class="ws-empty"><td colspan="7">No failure modes yet. Add your own below, or fill with defaults and adjust them.</td></tr>';
    body.querySelectorAll<HTMLTextAreaElement>('textarea').forEach(fit);
  };

  body.addEventListener('input', (e) => { if (e.target instanceof HTMLTextAreaElement) fit(e.target); });
  // Column widths change with the window, so refit on resize.
  addEventListener('resize', () => body.querySelectorAll<HTMLTextAreaElement>('textarea').forEach(fit));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const mode = String(data.get('mode') ?? '').trim();
    if (!mode) return;
    rows.push({ id: newId(), mode, harmed: String(data.get('harmed') ?? '').trim(), severity: Number(data.get('severity')), likelihood: Number(data.get('likelihood')) });
    save();
    form.reset();
    render();
    say(`Added "${esc(mode)}".`);
    q<HTMLInputElement>(form, '[name="mode"]').focus();
  });

  // Edit in place. Changing a rating re-sorts the list, then returns focus to the same control.
  body.addEventListener('change', (e) => {
    const el = e.target as HTMLTextAreaElement | HTMLSelectElement;
    const id = el.closest<HTMLElement>('tr')?.dataset.id;
    const row = rows.find((r) => r.id === id);
    const field = el.dataset.field as 'mode' | 'harmed' | 'severity' | 'likelihood' | undefined;
    if (!row || !field) return;
    if (field === 'severity' || field === 'likelihood') {
      row[field] = Number(el.value);
      save();
      render();
      body.querySelector<HTMLSelectElement>(`tr[data-id="${id}"] [data-field="${field}"]`)?.focus();
      say(`"${esc(row.mode)}" is now ${row.severity * row.likelihood}.`);
    } else {
      const value = el.value.trim();
      if (field === 'mode' && !value) { el.value = row.mode; return; }
      row[field] = value;
      save();
    }
  });

  // Adds the defaults that are not already on the list, so it never duplicates a row.
  q(root, '[data-ws-defaults]').addEventListener('click', () => {
    const have = new Set(rows.map((r) => r.mode.toLowerCase()));
    const added = defaults.filter((d) => !have.has(d.mode.toLowerCase())).map((d) => ({ id: newId(), ...d }));
    rows.push(...added);
    save();
    render();
    say(added.length ? `Added ${added.length} default failure ${added.length === 1 ? 'mode' : 'modes'}. Change the ratings, or remove any that do not fit.` : 'All the defaults are already on your list.');
  });

  clearButton.addEventListener('click', () => {
    if (!rows.length) return;
    lastCleared = rows;
    rows = [];
    save();
    render();
    say(`Cleared ${lastCleared.length} failure ${lastCleared.length === 1 ? 'mode' : 'modes'}. <button type="button" class="text-link" data-ws-undo>Undo</button>`);
    status.querySelector<HTMLButtonElement>('[data-ws-undo]')?.focus();
  });

  status.addEventListener('click', (e) => {
    if (!(e.target as HTMLElement).closest('[data-ws-undo]') || !lastCleared) return;
    rows = [...lastCleared, ...rows];
    lastCleared = null;
    save();
    render();
    say('Restored your list.');
    clearButton.focus();
  });

  body.addEventListener('click', (e) => {
    const id = (e.target as HTMLElement).closest<HTMLElement>('[data-remove]')?.dataset.remove;
    if (!id) return;
    const removed = rows.find((r) => r.id === id);
    rows = rows.filter((r) => r.id !== id);
    save();
    render();
    say(removed ? `Removed "${esc(removed.mode)}".` : '');
  });
  render();
}

// ---------- The same list on the testing page, marked as trainees test ----------

export function mountChecklist(root: HTMLElement, caseId: string) {
  const key = storageKey(caseId);
  const list = q(root, '[data-checklist-items]');
  const summary = q(root, '[data-checklist-summary]');
  const empty = q(root, '[data-checklist-empty]');

  const render = () => {
    const rows = byRisk(store.get<Row[]>(key, []));
    empty.hidden = rows.length > 0;
    summary.hidden = !rows.length;
    const found = rows.filter((r) => r.status === 'found').length;
    const notSeen = rows.filter((r) => r.status === 'not-seen').length;
    summary.textContent = `${found} found · ${notSeen} not seen · ${rows.length - found - notSeen} not tested yet`;
    list.innerHTML = rows.map((r) => `<li data-id="${r.id}" class="${r.status ? `is-${r.status}` : ''}">
        <p class="check-mode">${esc(r.mode)} ${riskChip(r.severity * r.likelihood)}</p>
        <div class="check-toggle" role="group" aria-label="Result for: ${esc(r.mode)}">
          <button type="button" data-status="found" aria-pressed="${r.status === 'found'}">Found it</button>
          <button type="button" data-status="not-seen" aria-pressed="${r.status === 'not-seen'}">Not seen</button>
        </div>
      </li>`).join('');
  };

  list.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-status]');
    const id = b?.closest<HTMLElement>('li')?.dataset.id;
    if (!b || !id) return;
    const rows = store.get<Row[]>(key, []);
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    const next = b.dataset.status as Status;
    row.status = row.status === next ? undefined : next;
    store.set(key, rows);
    render();
    list.querySelector<HTMLButtonElement>(`li[data-id="${id}"] [data-status="${next}"]`)?.focus();
  });
  // Keep in step if the list is edited in another tab.
  addEventListener('storage', (e) => { if (e.key === key) render(); });
  render();
}
