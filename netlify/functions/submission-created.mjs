// Netlify runs this automatically for every verified (non-spam) Netlify Forms submission.
// It sends the person who got in touch through "Work with us" a thank-you email through Resend.
//
// Required environment variables (set in Netlify > Site configuration > Environment variables):
//   RESEND_API_KEY  API key from resend.com
//   RESEND_FROM     Verified sender, e.g. "Asian AI Evaluation Institute <hello@example.org>"
// Optional:
//   REPLY_TO        Address that replies should go to

const FORM_NAME = 'workshop-request';

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

// The thank-you note for each "Looking for" choice. Keys match the labels in src/pages/index.astro.
const REPLIES = {
  'Evaluation & red teaming': {
    subject: 'Thanks for getting in touch about an evaluation',
    lines: ['Thank you for getting in touch about evaluating your model or system.', 'We have received your message and will be in touch within a few working days to talk through what you want tested, the languages involved, and any confidentiality requirements.'],
  },
  'A workshop': {
    subject: 'Thanks for your workshop request',
    lines: ['Thank you for your interest in a Break AI Before Deploying AI workshop for your team.', 'We have received your request and will be in touch within a few working days to talk through your systems, your team, and the format that would work best.'],
  },
  'Capacity building & advice': {
    subject: 'Thanks for getting in touch',
    lines: ['Thank you for getting in touch about capacity building and advice.', 'We have received your message and will be in touch within a few working days to understand what you are setting up.'],
  },
  'Comment or interview': {
    subject: 'Thanks for your request for comment',
    lines: ['Thank you for your request for comment.', 'We have received it and will reply as soon as we can, before your deadline where possible.'],
  },
};
const DEFAULT_REPLY = {
  subject: 'Thanks for getting in touch',
  lines: ['Thank you for getting in touch.', 'We have received your message and will reply within a few working days.'],
};

const firstName = (name) => String(name || '').trim().split(/\s+/)[0].slice(0, 40);

export const handler = async (event) => {
  const { payload } = JSON.parse(event.body);
  if (payload.form_name !== FORM_NAME) return { statusCode: 200, body: 'Ignored' };

  const { RESEND_API_KEY, RESEND_FROM, REPLY_TO } = process.env;
  if (!RESEND_API_KEY || !RESEND_FROM) {
    console.error('Thank-you email skipped: RESEND_API_KEY or RESEND_FROM is not set.');
    return { statusCode: 500, body: 'Email not configured' };
  }

  const to = String(payload.data.email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return { statusCode: 400, body: 'Invalid email' };

  const name = firstName(payload.data.name);
  const greeting = name ? `Hi ${name},` : 'Hello,';

  const reply = REPLIES[payload.data.need] ?? DEFAULT_REPLY;
  const text = [greeting, '', ...reply.lines.flatMap((line) => [line, '']), 'Asian AI Evaluation Institute'].join('\n');
  const html = [greeting, ...reply.lines, 'Asian AI Evaluation Institute'].map((line) => `<p>${escapeHtml(line)}</p>`).join('\n');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: [to],
      subject: reply.subject,
      text,
      html,
      ...(REPLY_TO ? { reply_to: REPLY_TO } : {}),
    }),
  });

  if (!response.ok) {
    console.error('Resend error', response.status, await response.text());
    return { statusCode: 502, body: 'Email failed' };
  }

  return { statusCode: 200, body: 'Sent' };
};
