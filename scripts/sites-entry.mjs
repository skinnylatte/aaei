import { writeFile } from 'node:fs/promises';

await writeFile(
  new URL('../dist/server/index.js', import.meta.url),
  "export { default } from './entry.mjs';\n",
  'utf8',
);
