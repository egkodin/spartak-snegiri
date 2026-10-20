import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';
import { createElement, StrictMode } from 'react';
import { renderToString } from 'react-dom/server';

const temporary = await mkdtemp('node_modules/.spartak-prerender-');
try {
  await build({
    define: { 'import.meta.env.BASE_URL': JSON.stringify('./') },
    build: {
      ssr: true,
      outDir: temporary,
      rollupOptions: { input: 'src/App.tsx', output: { entryFileNames: 'App.mjs' } },
    },
  });
  const { default: App } = await import(pathToFileURL(resolve(temporary, 'App.mjs')));
  const template = await readFile('dist/index.html', 'utf8');
  if (!template.includes('<div id="root"></div>')) throw new Error('Missing prerender target');
  const markup = renderToString(createElement(StrictMode, null, createElement(App)));
  await writeFile('dist/index.html', template.replace('<div id="root"></div>', () => `<div id="root">${markup}</div>`));
  console.log(`Prerender: ${markup.length} characters`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
