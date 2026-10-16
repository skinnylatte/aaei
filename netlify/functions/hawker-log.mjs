// Download or clear the "Uncle Lim's secret" game log, saved by the hawker function in Netlify Blobs.
//
//   Download everything as one JSON file:  open /case-studies/api/hawker-log in a browser and sign in
//     with any username and the admin password. Add ?day=2026-10-16 for a single day.
//   Clear it:  curl -X DELETE -u admin:PASSWORD https://asianaieval.org/case-studies/api/hawker-log
//     (add ?day=2026-10-16 to clear a single day). The case studies sign-in also applies,
//     so from outside a browser send the session cookie as well.
//
// Required environment variable:
//   HAWKER_ADMIN_PASSWORD  Only people with this can read or clear the log. Keep it separate from DEMOS_PASSWORD.

import { getStore } from '@netlify/blobs';

const encoder = new TextEncoder();
// Compare hashes, so the check takes the same time however close a guess is.
async function safeEqual(a, b) {
  const [x, y] = await Promise.all([a, b].map(async (v) => new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(v)))));
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

function suppliedPassword(request) {
  const header = request.headers.get('authorization') ?? '';
  if (!header.startsWith('Basic ')) return '';
  try {
    const decoded = atob(header.slice(6));
    return decoded.slice(decoded.indexOf(':') + 1);
  } catch {
    return '';
  }
}

const deny = () => new Response('Admin password needed.', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Hawker game log", charset="UTF-8"', 'Cache-Control': 'no-store' } });

export default async (request) => {
  const admin = Netlify.env.get('HAWKER_ADMIN_PASSWORD');
  if (!admin) return new Response('Set HAWKER_ADMIN_PASSWORD to use the log.', { status: 503 });
  if (!(await safeEqual(suppliedPassword(request), admin))) {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Slow down password guessing.
    return deny();
  }

  const day = new URL(request.url).searchParams.get('day');
  if (day && !/^\d{4}-\d{2}-\d{2}$/.test(day)) return new Response('Use ?day=YYYY-MM-DD.', { status: 400 });
  const store = getStore('hawker-log');
  const { blobs } = await store.list(day ? { prefix: `${day}/` } : {});

  if (request.method === 'DELETE') {
    await Promise.all(blobs.map((b) => store.delete(b.key)));
    return Response.json({ deleted: blobs.length });
  }
  if (request.method !== 'GET') return new Response('Use GET or DELETE.', { status: 405 });

  const events = (await Promise.all(blobs.map((b) => store.get(b.key, { type: 'json' })))).filter(Boolean).sort((a, b) => String(a.at).localeCompare(String(b.at)));
  return new Response(JSON.stringify(events, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="hawker-log${day ? `-${day}` : ''}.json"`,
      'Cache-Control': 'no-store',
    },
  });
};

export const config = { path: '/case-studies/api/hawker-log' };
