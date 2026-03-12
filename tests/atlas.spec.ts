import { test, expect } from '@playwright/test';

test.describe('Atlas – Homepage', () => {
  test('loads and shows header, nav, and footer', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.site-header h1')).toHaveText('Naši Ptáci');
    await expect(page.locator('.site-header nav a').first()).toHaveText('Atlas');
    await expect(page.locator('.site-header nav a').nth(1)).toHaveText('Kvíz');
    await expect(page.locator('.site-footer')).toContainText('nasiptaci.info');
  });

  test('renders bird grid with 184 cards', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('.bird-card');
    await expect(cards).toHaveCount(184);
  });

  test('each card has a name, latin name, and links to detail', async ({ page }) => {
    await page.goto('/');
    const firstCard = page.locator('.bird-card').first();
    await expect(firstCard.locator('.text .name')).not.toBeEmpty();
    await expect(firstCard.locator('.text .latin')).not.toBeEmpty();
    const href = await firstCard.getAttribute('href');
    expect(href).toMatch(/^\/atlas\/[\w-]+\/$/);
  });

  test('most cards have images', async ({ page }) => {
    await page.goto('/');
    const cardsWithImg = page.locator('.bird-card img');
    const count = await cardsWithImg.count();
    // 126 out of 184 birds have images
    expect(count).toBeGreaterThanOrEqual(126);
  });

  test('cards are sorted alphabetically by Czech name', async ({ page }) => {
    await page.goto('/');
    const names = await page.locator('.bird-card .name').allTextContents();
    const sorted = [...names].sort((a, b) => a.localeCompare(b, 'cs'));
    expect(names).toEqual(sorted);
  });

  test('search filters cards by Czech name', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.locator('#bird-search');
    await searchInput.fill('sýkora');
    await page.waitForTimeout(100);

    const visibleCards = page.locator('.bird-card:visible');
    const count = await visibleCards.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(184);

    const visibleNames = await visibleCards.locator('.name').allTextContents();
    for (const name of visibleNames) {
      expect(name.toLowerCase()).toContain('sýkora');
    }
  });

  test('search ignores diacritics', async ({ page }) => {
    await page.goto('/');
    await page.locator('#bird-search').fill('sykora');
    await page.waitForTimeout(100);

    const visibleCards = page.locator('.bird-card:visible');
    const count = await visibleCards.count();
    expect(count).toBeGreaterThan(0);

    const visibleNames = await visibleCards.locator('.name').allTextContents();
    for (const name of visibleNames) {
      expect(name.toLowerCase()).toContain('sýkora');
    }
  });

  test('search ignores casing', async ({ page }) => {
    await page.goto('/');
    await page.locator('#bird-search').fill('KOS');
    await page.waitForTimeout(100);

    const visibleCards = page.locator('.bird-card:visible');
    const count = await visibleCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('search filters cards by Latin name', async ({ page }) => {
    await page.goto('/');
    await page.locator('#bird-search').fill('turdus');
    await page.waitForTimeout(100);

    const visibleCards = page.locator('.bird-card:visible');
    const count = await visibleCards.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(184);
  });

  test('clearing search shows all cards again', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.locator('#bird-search');
    await searchInput.fill('sýkora');
    await page.waitForTimeout(100);
    await searchInput.fill('');
    await page.waitForTimeout(100);

    const visibleCards = page.locator('.bird-card:visible');
    await expect(visibleCards).toHaveCount(184);
  });

  test('search with no matches shows no-results message', async ({ page }) => {
    await page.goto('/');
    await page.locator('#bird-search').fill('xyznonexistent');
    await page.waitForTimeout(100);

    const visibleCards = page.locator('.bird-card:visible');
    await expect(visibleCards).toHaveCount(0);
    await expect(page.locator('#no-results')).toBeVisible();
    await expect(page.locator('#no-results')).toContainText('Žádný pták nenalezen');
  });

  test('no-results message hides when search matches again', async ({ page }) => {
    await page.goto('/');
    await page.locator('#bird-search').fill('xyznonexistent');
    await page.waitForTimeout(100);
    await expect(page.locator('#no-results')).toBeVisible();

    await page.locator('#bird-search').fill('kos');
    await page.waitForTimeout(100);
    await expect(page.locator('#no-results')).not.toBeVisible();
  });
});
