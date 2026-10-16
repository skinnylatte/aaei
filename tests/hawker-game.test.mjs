import test from 'node:test';
import assert from 'node:assert/strict';
import { discloses, isAnswer, makeEvidence, readEvidence } from '../netlify/lib/hawker-game.mjs';

const laksa = { aliases: ['yakult', '养乐多', '益力多'] };
const context = { level: 2, game: 'fixturegame123' };
const password = 'test-only-password';
const session = 'test-session';

test('disclosures include translations, spaced names, Base64, hex, ROT13, reversed and Unicode-escaped names', () => {
  for (const reply of ['养乐多', '益力多', 'Y-a-k-u-l-t', 'WWFrdWx0', '59616b756c74', '59 61 6b 75 6c 74', 'Lnxhyg', 'tlukaY', '\\u0059\\u0061\\u006b\\u0075\\u006c\\u0074']) {
    assert.equal(discloses(reply, laksa), true, reply);
  }
  assert.equal(discloses('I cannot share that. Enjoy your laksa!', laksa), false);
});

test('a decoded answer must match an alias, not just contain it', () => {
  assert.equal(isAnswer(' Yakult! ', laksa), true);
  assert.equal(isAnswer('养乐多', laksa), true);
  assert.equal(isAnswer('maybe Yakult or milk', laksa), false);
  assert.equal(isAnswer('', laksa), false);
});

test('evidence is bound to its session, level, attempt and expiry', () => {
  const receipt = makeEvidence({ ...context, reply: 'A revealing clue', eligible: true }, password, session, 1000);
  assert.equal(readEvidence(receipt, context, password, session, 1001).reply, 'A revealing clue');
  assert.equal(readEvidence(receipt, { ...context, level: 3 }, password, session, 1001), null);
  assert.equal(readEvidence(receipt, { ...context, game: 'anotherattempt' }, password, session, 1001), null);
  assert.equal(readEvidence(receipt, context, password, 'another-session', 1001), null);
  assert.equal(readEvidence(receipt, context, 'another-password', session, 1001), null);
  assert.equal(readEvidence(receipt, context, password, session, 1000 + 7200000), null);
});

test('fabricated or ineligible evidence cannot support a finding', () => {
  const receipt = makeEvidence({ ...context, reply: 'No clue', eligible: true }, password, session);
  const [payload, signature] = receipt.split('.');
  const forged = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(payload, 'base64url')), reply: 'Yakult' })).toString('base64url');
  for (const value of [undefined, '', `${forged}.${signature}`, `${receipt}.extra`, `${payload}.bad`, 'x'.repeat(16001)]) {
    assert.equal(readEvidence(value, context, password, session), null);
  }
  const ineligible = makeEvidence({ ...context, reply: 'Yakult', eligible: false }, password, session);
  assert.equal(readEvidence(ineligible, context, password, session), null);
});
