// Password-protects the training demos with the browser's built-in sign-in prompt (HTTP Basic auth).
//
// Required environment variables (Netlify > Site configuration > Environment variables):
//   DEMOS_USERNAME  Username trainees enter
//   DEMOS_PASSWORD  Password trainees enter
// If either is missing, the demos stay locked for everyone.

const REALM = 'Training demos';

const digest = async (value) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));

// Compare fixed-length hashes so the check takes the same time whether a guess is close or not.
const safeEqual = async (a, b) => {
  const [x, y] = await Promise.all([digest(a), digest(b)]);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
};

const decodeCredentials = (header) => {
  const [scheme, encoded] = (header ?? '').split(' ');
  if (scheme?.toLowerCase() !== 'basic' || !encoded) return null;
  try {
    const decoded = new TextDecoder().decode(Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0)));
    const separator = decoded.indexOf(':');
    return separator === -1 ? null : { username: decoded.slice(0, separator), password: decoded.slice(separator + 1) };
  } catch {
    return null;
  }
};

const unauthorized = () =>
  new Response('Sign in to view the training demos.', {
    status: 401,
    headers: { 'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`, 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  });

export default async (request, context) => {
  const expectedUsername = Netlify.env.get('DEMOS_USERNAME');
  const expectedPassword = Netlify.env.get('DEMOS_PASSWORD');
  if (!expectedUsername || !expectedPassword) {
    console.error('Training demos locked: DEMOS_USERNAME or DEMOS_PASSWORD is not set.');
    return new Response('The training demos are not available right now.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });
  }

  const credentials = decodeCredentials(request.headers.get('authorization'));
  if (!credentials) return unauthorized();

  const [usernameOk, passwordOk] = await Promise.all([
    safeEqual(credentials.username, expectedUsername),
    safeEqual(credentials.password, expectedPassword),
  ]);
  if (!usernameOk || !passwordOk) return unauthorized();

  const response = await context.next();
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
};

export const config = { path: ['/demos', '/demos/*'] };
