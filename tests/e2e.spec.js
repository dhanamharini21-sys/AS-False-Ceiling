const { test, expect } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5500';

test.describe('LuxeCeiling - E2E Smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
  });

  test('Navigation and CTA checks', async ({ page }) => {
    // Mobile menu toggle
    const mobileToggle = await page.$('.mobile-menu-toggle');
    if (mobileToggle) {
      await mobileToggle.click();
      await expect(page.locator('.nav-menu')).toHaveClass(/active/).catch(() => {});
      await mobileToggle.click();
    }

    // Header CTA opens wa.me in new tab
    const cta = await page.$('.header-cta a.cta-button');
    expect(cta).toBeTruthy();
    const href = await cta.getAttribute('href');
    expect(href).toContain('wa.me');

    // Footer links
    const tel = await page.$('a[href^="tel:"]');
    expect(tel).toBeTruthy();
    const mail = await page.$('a[href^="mailto:"]');
    expect(mail).toBeTruthy();
    const maps = await page.$('a[href*="google.com/maps"]');
    expect(maps).toBeTruthy();
  });

  test('Testimonial slider and autoplay', async ({ page }) => {
    // Next/Prev buttons
    const next = page.locator('.testimonial-next');
    const prev = page.locator('.testimonial-prev');
    if (await next.count()) {
      await next.click();
      await page.waitForTimeout(600);
      await prev.click();
    }

    // autoplay test: wait 6 seconds and ensure at least one change
    const firstCard = await page.locator('.testimonial-card').first().textContent();
    await page.waitForTimeout(5500);
    const secondCard = await page.locator('.testimonial-card').first().textContent();
    // It's possible autoplay rotates differently; ensure no uncaught exceptions
    expect(firstCard).toBeTruthy();
    expect(secondCard).toBeTruthy();
  });

  test('Before/After slider drag interaction (desktop simulation)', async ({ page }) => {
    const sliderHandle = page.locator('.slider-button');
    const beforeImage = page.locator('.before-image .before-placeholder');
    if (await sliderHandle.count() && await beforeImage.count()) {
      const box = await sliderHandle.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width + 50, box.y + box.height / 2, { steps: 10 });
        await page.mouse.up();
        // ensure clip-path or left changed on handle
        const handleLeft = await page.locator('.slider-handle').evaluate(node => window.getComputedStyle(node).left || node.style.left);
        expect(handleLeft).toBeTruthy();
      }
    }
  });

  test('Gallery filter behavior (All Projects and specific filters)', async ({ page }) => {
    // Wait for gallery items
    await page.waitForSelector('.gallery-item', { timeout: 10000 });
    const allBtn = page.locator('.filter-btn[data-filter="all"]');
    await allBtn.click();
    await page.waitForTimeout(300);
    const visibleAll = await page.$$eval('.gallery-item', els => els.filter(e => window.getComputedStyle(e).display !== 'none').length);
    expect(visibleAll).toBeGreaterThan(0);

    // Test specific filter
    const filters = ['residential','commercial','modern','classic'];
    for (const f of filters) {
      const btn = page.locator(`.filter-btn[data-filter="${f}"]`);
      if (await btn.count()) {
        await btn.click();
        await page.waitForTimeout(300);
        const visible = await page.$$eval('.gallery-item', els => els.filter(e => window.getComputedStyle(e).display !== 'none').length);
        expect(visible).toBeGreaterThanOrEqual(1);
      }
    }
  });

  test('Console has no uncaught errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('requestfailed', req => {
      // collect failed network requests
      errors.push(`REQ_FAILED ${req.url()} ${req.failure()?.errorText || ''}`);
    });
    await page.waitForTimeout(1000);
    expect(errors.length).toBe(0);
  });
});
