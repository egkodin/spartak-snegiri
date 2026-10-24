import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync } from 'node:fs';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH || 'playwright');
const base = process.env.SPARTAK_BASE_URL || 'http://127.0.0.1:4173/';
const output = process.env.SPARTAK_SCREENSHOTS || '/tmp/spartak-smoke';
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.SPARTAK_BROWSER ? { executablePath: process.env.SPARTAK_BROWSER } : {}) });

try {
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(new URL('index.html', base).href);
  await page.locator('.hero-photo').evaluate(image => image.decode());
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  assert.equal(await page.locator('h1').count(), 1);
  assert.equal(await page.locator('#coaches .coach-layout').count(), 3);
  assert.equal(await page.locator('.coach-layout').last().locator('h2').innerText(), 'Валерий Валерьевич\nЦимбал');
  assert.deepEqual(await page.locator('#coaches .coach-layout h2').allInnerTexts(), ['Максим Андреевич\nПолетаев', 'Артем Михайлович\nТрофимов', 'Валерий Валерьевич\nЦимбал']);
  assert.equal(await page.locator('.coach-maxim .coach-license').innerText(), 'ЛИЦЕНЗИЯ C–UEFA');
  assert((await page.locator('.coach-maxim .coach-facts').innerText()).includes('РГСУ'));
  assert.deepEqual(await page.locator('.coach-achievements li').allInnerTexts(), ['Чемпион Москвы и МО', 'Чемпион международных соревнований в формате 7х7', 'Финалист всероссийского турнира Adidas', 'Чемпион кубка лфл Москва', 'Многократный обладатель индивидуальных наград']);

  assert.equal(await page.locator('.coach-methodist').count(), 0);
  assert.equal(await page.locator('.venue-thumbnails img').count(), 5);
  assert.equal(await page.locator('.price-card').count(), 2);
  assert.equal((await page.locator('.price-current').first().innerText()).replaceAll(/\s/g, ''), '5180₽/мес.');
  assert.equal((await page.locator('.price-current').last().innerText()).replaceAll(/\s/g, ''), '5900₽/мес.');
  assert(await page.locator('.single-session').innerText().then(text => text.includes('950 ₽')));
  for (const element of await page.locator('a[href^="#"]').all()) {
    const href = await element.getAttribute('href');
    assert.equal(await page.locator(href).count(), 1, `Missing anchor: ${href}`);
  }
  const cta = new URL(await page.locator('.hero-actions a').getAttribute('href'));
  assert.equal(cta.origin + cta.pathname, 'https://t.me/cfcspartak');
  assert(cta.searchParams.get('text').includes('в ДФК «Спартак» в Снегирях'));
  assert(!cta.searchParams.get('text').includes('СпортАкадемКлуб'));
  assert.equal(await page.locator('.contact-phone').getAttribute('href'), 'tel:+79067514267');
  assert.equal(await page.locator('#vk-pixel').count(), 0);
  assert.equal(await page.locator('.address-info a').getAttribute('href'), 'https://yandex.ru/maps/org/snegirek/45210896054?si=0f63ev4bvvg42exe41krpzaru0');
  for (const selector of ['.hero-bottom', '#venues .section-heading', '.address-info', '.footer-contacts']) {
    const text = await page.locator(selector).innerText();
    assert(text.includes('Снегирек') && text.includes('Октябрьская ул., 41, п. г. т. Снегири'));
  }
  assert((await page.locator('#artem-career').textContent()).includes('2024: стажировка'));
  assert.equal(await page.locator('#curator-biography li').count(), 11);
  await context.route('https://t.me/**', route => route.fulfill({ contentType: 'text/html', body: 'Telegram preview' }));
  const popupPromise = context.waitForEvent('page');
  await page.locator('#coaches .text-link').first().click();
  const popup = await popupPromise;
  await popup.waitForLoadState();
  assert.equal(new URL(popup.url()).pathname, '/cfcspartak');
  assert(new URL(popup.url()).searchParams.get('text').includes('Снегирях'));
  await popup.close();
  for (const button of await page.locator('.coach-details-toggle').all()) {
    await button.click();
    assert.equal(await button.getAttribute('aria-expanded'), 'true');
    await button.click();
  }
  const tab = page.getByRole('tab').first();
  await tab.focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.getByRole('tab').last().getAttribute('aria-selected'), 'true');
  assert((await page.getByRole('tabpanel').innerText()).includes('90 минут'));
  assert((await page.getByRole('tabpanel').innerText()).includes('19:00–20:30'));
  await page.keyboard.press('Home');
  assert((await page.getByRole('tabpanel').innerText()).includes('60 минут'));
  assert.equal(await page.getByRole('tabpanel').locator('.schedule-days > div').count(), 2);
  for (let i = 0; i < 5; i++) {
    await page.locator('.venue-thumbnails button').nth(i).click();
    await page.waitForFunction(index => document.querySelectorAll('.venue-main img')[index]?.dataset.state === 'ready', i);
  }
  await page.getByRole('button', { name: 'Следующая фотография', exact: true }).click();
  assert.equal(await page.locator('.venue-thumbnails button').first().getAttribute('aria-pressed'), 'true');
  await page.getByRole('button', { name: 'Предыдущая фотография', exact: true }).click();
  assert.equal(await page.locator('.venue-thumbnails button').last().getAttribute('aria-pressed'), 'true');
  for (const button of await page.locator('.faq-item button').all()) {
    if (await button.getAttribute('aria-expanded') === 'true') await button.click();
    await button.click();
    assert.equal(await button.getAttribute('aria-expanded'), 'true');
    await button.click();
    assert.equal(await button.getAttribute('aria-expanded'), 'false');
  }
  for (const width of [320, 360, 390, 640, 768, 900, 1050, 1280, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(100);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Horizontal overflow at ${width}`);
    const small = await page.locator('a,button').evaluateAll(elements => elements.filter(el => el.getClientRects().length).map(el => ({ text: el.textContent.trim().slice(0, 35), width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height })).filter(el => el.width < 43.9 || el.height < 43.9));
    assert.deepEqual(small, [], `Touch targets at ${width}`);
    if ([390, 1440].includes(width)) {
      for (let y = 0; y < await page.evaluate(() => document.body.scrollHeight); y += 700) await page.evaluate(y => scrollTo(0, y), y);
      await page.waitForFunction(() => [...document.images].every(image => !image.getClientRects().length || (image.complete && image.naturalWidth > 0)));
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: `${output}/${width}-full.png`, fullPage: true });
      await page.screenshot({ path: `${output}/${width}-hero.png` });
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Открыть меню', exact: true }).click();
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('button', { name: 'Открыть меню', exact: true }).getAttribute('aria-expanded'), 'false');
  await page.getByRole('button', { name: 'Открыть меню', exact: true }).click();
  await page.locator('#mobile-nav a[href="#pricing"]').click();
  assert.equal(await page.locator('.menu-button').getAttribute('aria-expanded'), 'false');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.locator('.collapse').first().evaluate(el => getComputedStyle(el).transitionDuration), '0s');
  assert.deepEqual(errors, [], 'Browser and hydration errors');
  const html = readFileSync('dist/index.html', 'utf8');
  assert(html.includes('Трофимов') && html.includes('Октябрьская ул., 41, п. г. т. Снегири') && html.replaceAll(/\s/g, '').includes('5180'));
  assert(!html.includes('<div id="root"></div>'));
  assert(!/(?:src|href|srcSet)="\/(?:images|icons)\//.test(html), 'SSR assets must support a subdirectory');
  assert(!html.includes('noindex'));
  const staticContext = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await staticContext.newPage();
  await staticPage.goto(new URL('index.html', base).href);
  assert.equal(await staticPage.getByRole('tabpanel').count(), 2);
  assert(await staticPage.locator('#artem-career').isVisible());
  assert(await staticPage.locator('#curator-biography').isVisible());
  assert.equal(await staticPage.locator('.hero-actions a').getAttribute('href'), cta.href);
  await staticContext.close();
  console.log('Spartak: content, links, coaches, gallery, schedule keyboard, FAQ, menu, reduced motion, 9 widths and no-JavaScript rendering passed');
} finally {
  await browser.close();
}
