// Sorting and labelling news posts. Which posts are "upcoming" or "open" is decided when the site is built.
import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'news'>;

export const TYPE_LABELS: Record<Post['data']['type'], string> = {
  event: 'Event',
  did: 'What we did',
  announcement: 'Announcement',
  opportunity: 'Opportunity',
  report: 'Conference report',
  review: 'Research review',
};

// "29 Sep 2026". Written out by hand because en-GB abbreviates September as "Sept".
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const inSingapore = (d: Date) => new Date(d.valueOf() + 8 * 3600_000);
export const shortMonth = (d: Date) => MONTHS[inSingapore(d).getUTCMonth()];
export const formatDate = (d: Date) => `${inSingapore(d).getUTCDate()} ${shortMonth(d)} ${inSingapore(d).getUTCFullYear()}`;

// Where a post's card goes: its own page, or the outside link when it has one.
export const href = (p: Post) => p.data.link ?? `/news/${p.id}/`;
export const isExternal = (p: Post) => !!p.data.link;

export async function newsFront() {
  const today = new Date(new Date().toISOString().slice(0, 10));
  const posts = (await getCollection('news', (p) => !p.data.draft)).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  const upcoming = posts
    .filter((p) => p.data.type === 'event' && p.data.starts && (p.data.ends ?? p.data.starts) >= today)
    .sort((a, b) => a.data.starts!.valueOf() - b.data.starts!.valueOf());
  const open = posts
    .filter((p) => p.data.type === 'opportunity' && (!p.data.deadline || p.data.deadline >= today))
    .sort((a, b) => (a.data.deadline?.valueOf() ?? Infinity) - (b.data.deadline?.valueOf() ?? Infinity));
  const featured = posts.find((p) => p.data.featured) ?? posts.find((p) => p.data.type === 'report');
  const shown = new Set([featured, ...upcoming, ...open].filter(Boolean));
  const latest = posts.filter((p) => !shown.has(p));
  return { featured, upcoming: upcoming.slice(0, 3), open, latest };
}
