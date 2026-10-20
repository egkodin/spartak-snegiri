import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const url = 'https://egkodin.github.io/spartak-snegiri/';
const html = readFileSync('dist/index.html', 'utf8');
assert.equal((html.match(/<h1\b/g) || []).length, 1);
assert.equal((html.match(/<main\b/g) || []).length, 1);
assert(html.includes(`<link rel="canonical" href="${url}"`));
assert(html.includes(`property="og:url" content="${url}"`));
assert(html.includes(`property="og:image" content="${url}images/spartak/hall-2-1600.webp"`));
assert(!/noindex|<div id="root"><\/div>/.test(html));
assert(!/(?:src|href|srcSet)="\/(?:images|icons)\//.test(html), 'Resources must work under a GitHub Pages repository path');
for (const text of ['Полетаев', 'РГСУ', 'Чемпион Москвы и МО', 'Чемпион международных соревнований в формате 7х7', 'Финалист всероссийского турнира Adidas', 'Чемпион кубка лфл Москва', 'Многократный обладатель индивидуальных наград', 'Трофимов', 'Цимбал', 'Стадионная, 3', '18:00–19:00', '19:00–20:30', 'Вторник', 'Четверг', 'tel:+79067514267']) assert(html.includes(text), `Missing content: ${text}`);
for (const value of ['5180', '5900', '950']) assert(html.replaceAll(/\s/g, '').includes(value));
assert.equal((html.match(/role="tabpanel"/g) || []).length, 2);
assert(html.indexOf('id="maxim-title"') < html.indexOf('id="coach-title"'));
assert(html.indexOf('id="coach-title"') < html.indexOf('id="curator-title"'));
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const ref = match[1];
  if (/^(https?:|tel:|mailto:)/.test(ref)) continue;
  assert(existsSync(resolve('dist', ref)), `Missing file: ${ref}`);
}
for (const match of html.matchAll(/srcSet="([^"]+)"/g)) {
  for (const candidate of match[1].split(',')) assert(existsSync(resolve('dist', candidate.trim().split(' ')[0])));
}
for (let photo = 1; photo <= 5; photo++) {
  for (const variant of ['768', '1600', 'thumb']) assert(existsSync(`dist/images/spartak/hall-${photo}-${variant}.webp`));
}
const icons = JSON.parse(readFileSync('icons8.json', 'utf8'));
for (const name of Object.keys(icons.icons.items)) assert(existsSync(`dist/icons/${name}.png`));
assert(html.includes('https://icons8.com'));
assert(readFileSync('dist/robots.txt', 'utf8').includes(`${url}sitemap.xml`));
assert(readFileSync('dist/sitemap.xml', 'utf8').includes(`<loc>${url}</loc>`));
assert(!existsSync('dist/spartak.html') && !existsSync('dist/CNAME'));
for (const file of readdirSync('dist/assets')) {
  if (!file.endsWith('.js')) continue;
  const code = readFileSync(`dist/assets/${file}`, 'utf8');
  assert(!/3793562|cfc-sportacadem\.ru|dfc_sportacadem|Сиреневый бульвар|\/Users\/|\/tmp\//.test(code), `Unrelated data in ${file}`);
}
console.log('Site: prerender, content, Pages metadata, relative resources, icons and clean output passed');
