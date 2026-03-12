import { test, expect } from '@playwright/test';

test.describe('Bird Detail Page', () => {
  test('renders Kos černý detail page with all sections', async ({ page }) => {
    await page.goto('/atlas/kos-cerny/');

    // Hero section
    await expect(page.locator('.bird-hero h1')).toHaveText('Kos černý');
    await expect(page.locator('.bird-hero .latin')).toHaveText('Turdus merula');
    await expect(page.locator('.bird-hero img')).toBeVisible();
  });

  test('shows taxonomy and size info box', async ({ page }) => {
    await page.goto('/atlas/kos-cerny/');

    const infoBox = page.locator('.bird-info-box');
    await expect(infoBox).toBeVisible();
    await expect(infoBox.locator('dt', { hasText: 'Řád' })).toBeVisible();
    await expect(infoBox.locator('dt', { hasText: 'Čeleď' })).toBeVisible();
    await expect(infoBox.locator('dt', { hasText: 'Délka' })).toBeVisible();
    await expect(infoBox.locator('dt', { hasText: 'Hmotnost' })).toBeVisible();
  });

  test('shows sound player for birds with sound', async ({ page }) => {
    await page.goto('/atlas/kos-cerny/');

    const player = page.locator('.sound-player');
    await expect(player).toBeVisible();
    await expect(player.locator('.play-btn')).toBeVisible();
    const src = await player.getAttribute('data-sound');
    expect(src).toMatch(/\.mp3$/);
  });

  test('has markdown body content', async ({ page }) => {
    await page.goto('/atlas/kos-cerny/');

    const content = page.locator('.bird-content');
    await expect(content).toBeVisible();
    const text = await content.textContent();
    expect(text!.length).toBeGreaterThan(200);
  });

  test('has source link to nasiptaci.info', async ({ page }) => {
    await page.goto('/atlas/kos-cerny/');

    const sourceLink = page.locator('a', { hasText: 'Zdroj: nasiptaci.info' });
    await expect(sourceLink).toBeVisible();
    const href = await sourceLink.getAttribute('href');
    expect(href).toContain('nasiptaci.info');
  });

  test('has prev/next navigation', async ({ page }) => {
    await page.goto('/atlas/kos-cerny/');

    const nav = page.locator('.bird-nav');
    await expect(nav).toBeVisible();
    const links = nav.locator('a');
    const count = await links.count();
    // Kos černý is in the middle so should have both prev and next
    expect(count).toBe(2);
  });

  test('prev/next links navigate to other bird pages', async ({ page }) => {
    await page.goto('/atlas/kos-cerny/');

    const nextLink = page.locator('.bird-nav a').last();
    const nextHref = await nextLink.getAttribute('href');
    expect(nextHref).toMatch(/^\/atlas\/[\w-]+\/$/);

    await nextLink.click();
    await expect(page.locator('.bird-hero h1')).toBeVisible();
    expect(page.url()).toContain('/atlas/');
    expect(page.url()).not.toContain('kos-cerny');
  });

  test('clicking a card from homepage navigates to detail', async ({ page }) => {
    await page.goto('/');

    // Find the Kos černý card and click it
    const card = page.locator('.bird-card', { hasText: 'Kos černý' });
    await card.click();

    await expect(page.locator('.bird-hero h1')).toHaveText('Kos černý');
    expect(page.url()).toContain('/atlas/kos-cerny/');
  });

  test('bird without image shows no hero image', async ({ page }) => {
    // Find a bird without image from JSON
    await page.goto('/');
    const noImgCard = page.locator('.bird-card .no-image');
    const count = await noImgCard.count();
    if (count > 0) {
      // Get the parent card link
      const card = noImgCard.first().locator('..');
      await card.click();
      // Detail page should not have hero img
      const heroImg = page.locator('.bird-hero img');
      await expect(heroImg).toHaveCount(0);
    }
  });

  test('first bird in alphabet has no previous link', async ({ page }) => {
    await page.goto('/');
    // Click the first card
    await page.locator('.bird-card').first().click();

    const nav = page.locator('.bird-nav');
    // First element should be a span (placeholder), not a link
    const prevLink = nav.locator('a').first();
    const prevText = await prevLink.textContent();
    // The first link should be a "next" link (pointing right)
    expect(prevText).toContain('→');
  });
});
