// Shared engine for the case studies: variants, tests, checks, and browser storage.
// Every case study is deterministic and runs entirely in the browser.

export type Variant = 'weak' | 'patched' | 'safe';
export const VARIANTS: Variant[] = ['weak', 'patched', 'safe'];
export const VARIANT_LABELS: Record<Variant, string> = { weak: 'Weak', patched: 'Patched', safe: 'Hardened' };

export type Lang = 'en' | 'zh' | 'ms' | 'ta' | 'mixed';
export const LANG_LABELS: Record<Lang, string> = { en: 'English', zh: 'Chinese', ms: 'Malay', ta: 'Tamil', mixed: 'Mixed language' };

export type ToolCall = { name: string; input: Record<string, unknown>; output: Record<string, unknown>; authorized?: boolean; note?: string };

// A tool call as it would appear in the service's audit log: stamped with when, which session, which request and who.
export type AuditEntry = ToolCall & { at: string; session: string; request: number; principal: string };
// Guardrails and replies are logged as events, not as tool calls, because the model did not call anything.
export const EVENTS = new Set(['chat_response', 'security_event', 'third_party_filter', 'send_limit']);
export const auditJson = (e: AuditEntry) => JSON.stringify({ timestamp: e.at, session_id: e.session, request_id: `req-${e.request}`, principal: e.principal, ...(EVENTS.has(e.name) ? { event: e.name } : { tool: e.name }), input: e.input, output: e.output, ...(e.authorized === undefined ? {} : { authz: e.authorized ? 'owner' : 'not_owner' }) });
export const newSessionId = () => `sess-${Math.random().toString(36).slice(2, 8)}`;
export type Message = { role: 'user' | 'assistant'; content: string; translation?: string; lang?: Lang };

// One step a trainee took, replayable against any variant.
export type Step = { action: string; value?: string };

// OWASP Top 10 for LLM Applications, 2025 edition.
export const OWASP = {
  LLM01: 'Prompt Injection',
  LLM02: 'Sensitive Information Disclosure',
  LLM03: 'Supply Chain',
  LLM04: 'Data and Model Poisoning',
  LLM05: 'Improper Output Handling',
  LLM06: 'Excessive Agency',
  LLM07: 'System Prompt Leakage',
  LLM08: 'Vector and Embedding Weaknesses',
  LLM09: 'Misinformation',
  LLM10: 'Unbounded Consumption',
} as const;
export type OwaspId = keyof typeof OWASP;

// MITRE ATLAS techniques the scenarios use, named as in ATLAS.
export const ATLAS = {
  'AML.T0051.000': 'LLM Prompt Injection: Direct',
  'AML.T0051.001': 'LLM Prompt Injection: Indirect',
  'AML.T0053': 'AI Agent Tool Invocation',
  'AML.T0054': 'LLM Jailbreak',
  'AML.T0056': 'Extract LLM System Prompt',
  'AML.T0057': 'LLM Data Leakage',
  'AML.T0070': 'RAG Poisoning',
  'AML.T0073': 'Impersonation',
  'AML.T0083': 'Credentials from AI Agent Configuration',
  'AML.T0034': 'Cost Harvesting',
} as const;
export type AtlasId = keyof typeof ATLAS;
export const atlasUrl = (id: AtlasId) => `https://atlas.mitre.org/techniques/${id}`;

// The classic weakness behind each failure, for testers who know them from web and API security.
export const CWE = {
  'CWE-639': 'Authorization Bypass Through User-Controlled Key (IDOR)',
  'CWE-862': 'Missing Authorization',
  'CWE-807': 'Reliance on Untrusted Inputs in a Security Decision',
  'CWE-290': 'Authentication Bypass by Spoofing',
  'CWE-798': 'Use of Hard-coded Credentials',
  'CWE-184': 'Incomplete List of Disallowed Inputs',
  'CWE-770': 'Allocation of Resources Without Limits or Throttling',
  'CWE-359': 'Exposure of Private Personal Information to an Unauthorized Actor',
  'CWE-345': 'Insufficient Verification of Data Authenticity',
  'CWE-204': 'Observable Response Discrepancy',
} as const;
export type CweId = keyof typeof CWE;
export const cweUrl = (id: CweId) => `https://cwe.mitre.org/data/definitions/${id.slice(4)}.html`;

// A scenario with a fixed setup and steps. `lesson` is the teaching point shown on the answer sheet.
// `owasp` lists the OWASP risks it exercises; empty means it tests usefulness or fairness rather than security.
// `atlas` and `cwe` give the same scenario in MITRE ATLAS and CWE terms.
export type TestCase<Setup = Record<string, string>> = { id: string; name: string; description: string; lesson: string; owasp: OwaspId[]; atlas?: AtlasId[]; cwe?: CweId[]; setup: Setup; steps: Step[] };

export type CheckResult = { pass: boolean; detail: string };
export type Check<S> = {
  id: string;
  label: string;
  kind: string;
  // Return null when the check does not apply to this session.
  evaluate: (session: S) => CheckResult | null;
};

export interface CaseStudy<S, Setup = Record<string, string>> {
  id: string;
  title: string;
  createSession(variant: Variant, setup: Setup): S;
  replay(session: S, steps: Step[]): void;
  checks: Check<S>[];
}

export type TestRun = { variant: Variant; results: { check: Check<unknown>; result: CheckResult }[]; error?: string };

export function runTest<S, Setup>(cs: CaseStudy<S, Setup>, test: TestCase<Setup>, variant: Variant): TestRun {
  try {
    const session = cs.createSession(variant, test.setup);
    cs.replay(session, test.steps);
    const results = cs.checks
      .map((check) => ({ check: check as Check<unknown>, result: check.evaluate(session) }))
      .filter((r): r is { check: Check<unknown>; result: CheckResult } => r.result !== null);
    return { variant, results };
  } catch (err) {
    return { variant, results: [], error: (err as Error).message };
  }
}

export const failures = (run: TestRun) => run.results.filter((r) => !r.result.pass);

// The checks that apply to a session, and the ones it fails.
export type Verdict = { applied: number; failed: { label: string; kind: string; detail: string }[] };
export function verdict<S>(checks: Check<S>[], session: S): Verdict {
  const applied = checks.map((c) => ({ c, r: c.evaluate(session) })).filter((x) => x.r !== null);
  return { applied: applied.length, failed: applied.filter((x) => !x.r!.pass).map((x) => ({ label: x.c.label, kind: x.c.kind, detail: x.r!.detail })) };
}
// A copy of a session that shows only some of its history, so checks can judge one message on its own.
export const scoped = <S extends object>(s: S, patch: Partial<S>): S => Object.assign(Object.create(Object.getPrototypeOf(s)), s, patch);

// A starting failure mode for the "Before you start" worksheet.
export type FailureMode = { mode: string; harmed: string; severity: 1 | 2 | 3 | 4; likelihood: 1 | 2 | 3 | 4 };

// Browser storage. It can be unavailable (private windows, blocked site data), so every access is guarded.
export const store = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* Storage unavailable: the page still works, it just forgets on reload. */
    }
  },
};

export const newId = () => Math.random().toString(36).slice(2, 10);

export const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

// Expected behaviour for the answer sheets: every scenario replayed against every version.
export type Expected = { variant: Variant; lines: string[]; applied: number; failed: { label: string; detail: string }[] };
export function expectedBehaviour<S, Setup>(cs: CaseStudy<S, Setup>, suite: TestCase<Setup>[], describe: (s: S) => string[]) {
  return suite.map((test) => ({
    ...test,
    results: VARIANTS.map((variant): Expected => {
      const session = cs.createSession(variant, test.setup);
      cs.replay(session, test.steps);
      const applied = cs.checks.map((c) => ({ c, r: c.evaluate(session) })).filter((x) => x.r !== null);
      return { variant, lines: describe(session), applied: applied.length, failed: applied.filter((x) => !x.r!.pass).map((x) => ({ label: x.c.label, detail: x.r!.detail })) };
    }),
  }));
}
