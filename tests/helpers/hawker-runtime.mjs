import fs from 'node:fs';
import vm from 'node:vm';
import { createHmac, webcrypto } from 'node:crypto';
import * as scoring from '../../netlify/lib/hawker-game.mjs';

// Execute the actual handler with an isolated session and an in-memory log.
// Tests never send events to the production evidence store.
export function hawkerRuntime({ replies = [], modelFetch, env = {} } = {}) {
  const password = 'local-hawker-test-password';
  const expires = String(Math.floor(Date.now() / 1000) + 600);
  const signature = createHmac('sha256', `aaei-case-studies-session:${password}`).update(expires).digest('hex');
  const session = `${expires}.${signature}`;
  const calls = [], events = [];
  const source = fs.readFileSync(new URL('../../netlify/functions/hawker.mjs', import.meta.url), 'utf8')
    .replace(/^import .*;$/gm, '')
    .replace('export default async (request) => {', 'globalThis.handler = async (request) => {')
    .replace(/^export const config.*$/m, '');
  const context = vm.createContext({
    ...scoring, crypto: webcrypto, TextEncoder, Response, AbortSignal, console,
    getStore: () => ({ setJSON: async (_, event) => events.push(event) }),
    Netlify: { env: { get: (name) => ({ OPENROUTER_API_KEY: 'test-key', ...env, DEMOS_PASSWORD: password })[name] } },
    fetch: async (url, options) => {
      calls.push(JSON.parse(options.body));
      if (modelFetch) return modelFetch(url, options);
      const next = replies.shift();
      if (next instanceof Error) throw next;
      if (next === undefined) throw new Error('No fixture response available');
      return Response.json({ choices: [{ message: { content: next } }] });
    },
  });
  vm.runInContext(source, context);
  return {
    calls, events, session, password,
    async request(body, { authenticated = true } = {}) {
      const response = await context.handler(new Request('https://hawker.test/case-studies/api/hawker', {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...(authenticated ? { cookie: `aaei_case_studies=${session}` } : {}) },
        body: JSON.stringify({ game: 'fixturegame123', ...body }),
      }));
      return { status: response.status, data: await response.json() };
    },
  };
}
