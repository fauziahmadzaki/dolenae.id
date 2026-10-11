// Run after pnpm build and next start -p 3017. PLAYWRIGHT_MODULE may point to existing playwright-core.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const base = process.env.PUBLIC_PAGES_URL || 'http://localhost:3017';
  const output = process.env.PUBLIC_PAGES_SCREENSHOTS || path.join(process.env.TMPDIR || '.', 'scrum17-screenshots');
  fs.mkdirSync(output, { recursive: true });
  const errors = [];
  const routes = ['tentang-kami', 'kontak', 'bantuan', 'karier', 'privasi-keamanan'];
  try {
    for (const width of [1440, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: 960 } });
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => {
        if (message.type() !== 'error') return;
        if (message.location().url.endsWith('/favicon.ico')) { console.log('KNOWN landing baseline: favicon.ico missing'); return; }
        errors.push(`${message.text()} ${message.location().url}`);
      });
      for (const route of routes) {
        const response = await page.goto(`${base}/${route}`, { waitUntil: 'load' });
        assert.equal(response.status(), 200, route);
        assert.equal(await page.locator('h1').count(), 1);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} overflow ${width}`);
        assert(await page.evaluate(() => [...document.images].every((img) => img.complete && img.naturalWidth > 0)), `${route} assets`);
        for (const target of routes) assert(await page.locator(`footer a[href="/${target}"]`).count(), `${route} footer ${target}`);
        await page.screenshot({ path: path.join(output, `${route}-${width}.png`), fullPage: true });
      }
      if (width < 1024) {
        await page.locator('header summary').click();
        await page.getByRole('navigation', { name: 'Navigasi seluler' }).getByRole('link', { name: 'Kontak', exact: true }).click();
        await page.waitForURL('**/kontak');
      }
      await page.goto(`${base}/bantuan`);
      await page.locator('summary').filter({ hasText: 'Bagaimana cara membuat akun Dolenae?' }).click();
      assert(await page.locator('details[open]').filter({ hasText: 'Pendaftaran akun belum tersedia' }).count());
      await page.getByRole('button', { name: /^Data/ }).click();
      assert.equal(await page.locator('main details').count(), 1);
      await page.getByRole('button', { name: 'Semua kategori' }).click();
      await page.getByRole('searchbox', { name: 'Cari bantuan' }).fill('tidak-ada-hasil');
      assert(await page.getByRole('status').isVisible());
      await page.getByRole('searchbox', { name: 'Cari bantuan' }).fill('fasilitas');
      assert.equal(await page.locator('main details').count(), 1);
      await page.goto(`${base}/kontak`);
      await page.getByRole('button', { name: 'Siapkan pesan' }).click();
      assert.equal(await page.getByRole('status').count(), 0);
      await page.getByLabel('Nama', { exact: true }).fill('Wisatawan & Tim');
      await page.getByLabel('Email', { exact: true }).fill('user@example.com');
      await page.getByLabel('Pesan', { exact: true }).fill('Pertanyaan fasilitas & akses');
      await page.getByRole('button', { name: 'Siapkan pesan' }).click();
      const href = await page.getByRole('link', { name: 'Buka aplikasi email' }).getAttribute('href');
      assert(href.startsWith('mailto:halo@dolenae.id?'));
      assert(decodeURIComponent(href).includes('Pertanyaan fasilitas & akses'));
      assert(await page.getByRole('status').getByText('Draf siap. Pesan belum dikirim.').isVisible());
      await page.goto(`${base}/privasi-keamanan`);
      await page.getByRole('navigation', { name: 'Daftar isi privasi' }).getByRole('link', { name: 'Retensi data' }).click();
      await page.waitForURL('**/privasi-keamanan#retensi');
      await page.locator('footer').getByRole('link', { name: 'Tentang Kami' }).click();
      await page.waitForURL('**/tentang-kami');
      await page.getByRole('link', { name: 'Mulai jelajah' }).click();
      await page.waitForURL('**/#destinations');
      assert(await page.locator('#destinations').count());
      await page.close();
      console.log(`PASS ${width}px: all five routes, assets, overflow, footer, FAQ/category/search, contact validation/draft, TOC, navigation`);
    }
    assert.deepEqual(errors, [], 'browser errors');
    console.log(`PASS no runtime/console errors; screenshots: ${output}`);
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
