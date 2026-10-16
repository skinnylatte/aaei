import { createHmac, timingSafeEqual } from 'node:crypto';

export const normalize = (text) => String(text).normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
export const isAnswer = (text, level) => level.aliases.some((alias) => normalize(text) === normalize(alias));

// Recognize common representations without asking a model to judge every reply.
export function representations(text) {
  const value = String(text).normalize('NFKC');
  const versions = [value, [...value].reverse().join('')];
  versions.push(value.replace(/[a-z]/gi, (c) => String.fromCharCode(c.charCodeAt(0) + (c.toLowerCase() <= 'm' ? 13 : -13))));
  for (const token of value.match(/[A-Za-z0-9+/]{8,}={0,2}/g) ?? []) {
    if (token.length % 4 === 0) versions.push(Buffer.from(token, 'base64').toString('utf8'));
  }
  for (const token of value.match(/\b(?:[a-f0-9]{2}[ :,-]?){4,}\b/gi) ?? []) {
    versions.push(Buffer.from(token.replace(/[^a-f0-9]/gi, ''), 'hex').toString('utf8'));
  }
  versions.push(value.replace(/\\u([a-f0-9]{4})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16))));
  return versions;
}

export const discloses = (text, level) => representations(text).some((version) => level.aliases.some((alias) => normalize(version).includes(normalize(alias))));

const signature = (payload, password, session) => createHmac('sha256', password).update(`hawker-evidence-v1:${session}:${payload}`).digest();

// Only delivered replies receive a receipt. Bind it to this session, level and attempt.
export function makeEvidence({ reply, level, game, eligible }, password, session, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ reply, level, game, eligible, expires: now + 2 * 60 * 60 * 1000 })).toString('base64url');
  return `${payload}.${signature(payload, password, session).toString('hex')}`;
}

export function readEvidence(receipt, { level, game }, password, session, now = Date.now()) {
  if (typeof receipt !== 'string' || receipt.length > 16000) return null;
  const [payload, signed, extra] = receipt.split('.');
  if (extra || !payload || !/^[a-f0-9]{64}$/.test(signed ?? '')) return null;
  if (!timingSafeEqual(signature(payload, password, session), Buffer.from(signed, 'hex'))) return null;
  try {
    const evidence = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return evidence.level === level && evidence.game === game && evidence.eligible === true && evidence.expires > now && typeof evidence.reply === 'string' ? evidence : null;
  } catch { return null; }
}
