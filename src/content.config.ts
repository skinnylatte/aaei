import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// News posts: one Markdown file each in src/content/news/. The file name becomes the address, /news/<file-name>/.
const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  // `image` is a file in src/img/, which Astro resizes and optimises at build time.
  schema: ({ image }) => z.object({
    title: z.string(),
    // The date the post goes up. Events and opportunities have their own dates below.
    date: z.coerce.date(),
    // review: our take on someone else's research. field: news from elsewhere, such as a launch.
    type: z.enum(['event', 'did', 'announcement', 'opportunity', 'report', 'review', 'field']),
    summary: z.string(),
    // Where it happened or happens, for example "Geneva".
    place: z.string().optional(),
    // Events: when it starts (and ends). Set workshop: true for one of our own workshops; upcoming ones appear under Coming up.
    starts: z.coerce.date().optional(),
    ends: z.coerce.date().optional(),
    workshop: z.boolean().default(false),
    // Opportunities: who runs it and when applications close. Open ones appear in the Opportunities band.
    organization: z.string().optional(),
    deadline: z.coerce.date().optional(),
    // A link to another site. When set, the post's card goes there instead of to the post's own page.
    link: z.string().url().optional(),
    linkLabel: z.string().optional(),
    // The work a post is about, for example a paper or a study. Shown on the post's page, and cited.
    source: z.string().url().optional(),
    sourceLabel: z.string().optional(),
    // A picture for the post, as a path from the post's file, for example ../../img/photo.jpeg. imageAlt describes it for screen readers.
    image: image().optional(),
    imageAlt: z.string().optional(),
    // A post to read next, by its file name. That post links back here, so the two get arrows to each other.
    next: reference('news').optional(),
    // The big story at the top of News. With several, News shows arrows to move between them.
    featured: z.boolean().default(false),
    // Drafts are left out of the site.
    draft: z.boolean().default(false),
  }),
});

export const collections = { news };
