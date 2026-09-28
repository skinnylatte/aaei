// Password-protects the case studies behind the branded sign-in page at /signin/.
// Runs on Netlify's servers before any case study page is sent, so it cannot be bypassed in the browser.
//
// Required environment variable (Netlify > Site configuration > Environment variables):
//   DEMOS_PASSWORD  Password trainees enter. Changing it signs everyone out.
// If it is missing, the case studies stay locked for everyone.
// (The variable keeps its original DEMOS_ name so existing Netlify settings keep working.)

const COOKIE = 'aaei_case_studies';
const SESSION_SECONDS = 8 * 60 * 60;
const SIGN_IN = '/signin/';
const encoder = new TextEncoder();

const toHex = (buffer) => [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
const digest = async (value) => new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)));

// Compare fixed-length hashes so the check takes the same time whether a guess is close or not.
const safeEqual = async (a, b) => {
  const [x, y] = await Promise.all([digest(a), digest(b)]);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
};

// Session tokens are "expiry.signature", signed with a key derived from the password.
const sign = async (password, message) => {
  const key = await crypto.subtle.importKey('raw', encoder.encode(`aaei-case-studies-session:${password}`), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toHex(await crypto.subtle.sign('HMAC', key, encoder.encode(message)));
};
const createToken = async (password) => {
  const expires = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  return `${expires}.${await sign(password, expires)}`;
};
const isValidToken = async (token, password) => {
  const [expires, signature] = String(token).split('.');
  if (!/^\d+$/.test(expires ?? '') || !signature || Number(expires) < Date.now() / 1000) return false;
  return safeEqual(signature, await sign(password, expires));
};

const readCookie = (request, name) => {
  for (const part of (request.headers.get('cookie') ?? '').split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return null;
};
const sessionCookie = (value, maxAge) => `${COOKIE}=${value}; Path=/case-studies; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;

// Only ever send people back to a case study page, never to another site.
const safeNext = (value) => {
  const next = String(value ?? '');
  const isCaseStudyPath = /^\/case-studies(\/|$)/.test(next) && !next.startsWith('//') && !next.includes('\\');
  return isCaseStudyPath && !/^\/case-studies\/(login|logout)\b/.test(next) ? next : '/case-studies/';
};

const redirect = (location, cookie) => {
  const headers = new Headers({ Location: location, 'Cache-Control': 'no-store' });
  if (cookie) headers.set('Set-Cookie', cookie);
  return new Response(null, { status: 303, headers });
};

export default async (request, context) => {
  const password = Netlify.env.get('DEMOS_PASSWORD');
  if (!password) {
    console.error('Case studies locked: DEMOS_PASSWORD is not set.');
    return new Response('The case studies are not available right now.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });
  }

  const url = new URL(request.url);

  if (url.pathname === '/case-studies/login') {
    if (request.method !== 'POST') return redirect(SIGN_IN);
    const form = await request.formData().catch(() => new FormData());
    const next = safeNext(form.get('next'));
    if (await safeEqual(String(form.get('password') ?? ''), password)) {
      return redirect(next, sessionCookie(await createToken(password), SESSION_SECONDS));
    }
    await new Promise((resolve) => setTimeout(resolve, 500)); // Slow down password guessing.
    return redirect(`${SIGN_IN}?error=1&next=${encodeURIComponent(next)}`);
  }

  if (url.pathname === '/case-studies/logout') return redirect(`${SIGN_IN}?signedout=1`, sessionCookie('', 0));

  const token = readCookie(request, COOKIE);
  if (token && (await isValidToken(token, password))) {
    const response = await context.next();
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  }

  return redirect(`${SIGN_IN}?next=${encodeURIComponent(safeNext(url.pathname + url.search))}`);
};

export const config = { path: ['/case-studies', '/case-studies/*'] };
