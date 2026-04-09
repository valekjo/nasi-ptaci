import { test, expect } from '@playwright/test';

test.describe('Collection Picker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/nasi-ptaci/kviz/');
    // Clear localStorage to start fresh
    await page.evaluate(() => {
      localStorage.removeItem('nasiptaci-bird-set');
      localStorage.removeItem('nasiptaci-active-collection');
      localStorage.removeItem('nasiptaci-custom-collections');
    });
    await page.reload();
  });

  test('renders collection picker with heading and cards', async ({ page }) => {
    await expect(page.locator('.collection-picker h3', { hasText: 'Sada ptáků' })).toBeVisible();
    await expect(page.locator('.collection-card')).toHaveCount(5); // "all" + 4 predefined
  });

  test('"Všichni ptáci" is selected by default', async ({ page }) => {
    const allCard = page.locator('.collection-card', { hasText: 'Všichni ptáci' });
    await expect(allCard).toHaveClass(/selected/);
  });

  test('shows all 4 predefined collections', async ({ page }) => {
    await expect(page.locator('.collection-card', { hasText: 'Běžní ptáci' })).toBeVisible();
    await expect(page.locator('.collection-card', { hasText: 'Dravci a sokoli' })).toBeVisible();
    await expect(page.locator('.collection-card', { hasText: 'Sovy' })).toBeVisible();
    await expect(page.locator('.collection-card', { hasText: 'Vodní ptáci' })).toBeVisible();
  });

  test('selecting a predefined collection highlights it and deselects "all"', async ({ page }) => {
    const sovyCard = page.locator('.collection-card', { hasText: 'Sovy' });
    await sovyCard.click();

    await expect(sovyCard).toHaveClass(/selected/);
    await expect(page.locator('.collection-card', { hasText: 'Všichni ptáci' })).not.toHaveClass(/selected/);
  });

  test('selecting a predefined collection writes slugs to localStorage', async ({ page }) => {
    await page.locator('.collection-card', { hasText: 'Sovy' }).click();

    const stored = await page.evaluate(() => localStorage.getItem('nasiptaci-bird-set'));
    expect(stored).not.toBeNull();
    const slugs = JSON.parse(stored!);
    expect(slugs).toContain('vyr-velky');
    expect(slugs).toContain('pustik-obecny');
    expect(slugs).toHaveLength(8);
  });

  test('selecting a predefined collection writes active-collection to localStorage', async ({ page }) => {
    await page.locator('.collection-card', { hasText: 'Sovy' }).click();

    const stored = await page.evaluate(() => localStorage.getItem('nasiptaci-active-collection'));
    expect(stored).not.toBeNull();
    const active = JSON.parse(stored!);
    expect(active).toEqual({ type: 'predefined', id: 'sovy' });
  });

  test('selecting "Všichni ptáci" clears bird-set from localStorage', async ({ page }) => {
    // First select a collection
    await page.locator('.collection-card', { hasText: 'Sovy' }).click();
    let stored = await page.evaluate(() => localStorage.getItem('nasiptaci-bird-set'));
    expect(stored).not.toBeNull();

    // Then select "all"
    await page.locator('.collection-card', { hasText: 'Všichni ptáci' }).click();
    stored = await page.evaluate(() => localStorage.getItem('nasiptaci-bird-set'));
    expect(stored).toBeNull();
  });

  test('active collection selection persists across page reload', async ({ page }) => {
    await page.locator('.collection-card', { hasText: 'Dravci a sokoli' }).click();
    await expect(page.locator('.collection-card', { hasText: 'Dravci a sokoli' })).toHaveClass(/selected/);

    await page.reload();

    await expect(page.locator('.collection-card', { hasText: 'Dravci a sokoli' })).toHaveClass(/selected/);
    await expect(page.locator('.collection-card', { hasText: 'Všichni ptáci' })).not.toHaveClass(/selected/);
  });

  test('predefined collection quiz only uses collection birds', async ({ page }) => {
    // Select "Sovy" (8 birds)
    await page.locator('.collection-card', { hasText: 'Sovy' }).click();

    // Start quiz
    await page.locator('.start-btn').click();
    await expect(page.locator('.quiz-progress')).toBeVisible({ timeout: 5000 });

    // Answer all questions and verify bird names are owls
    const owlNames = [
      'Kalous pustovka', 'Kalous ušatý', 'Kulíšek nejmenší',
      'Puštík obecný', 'Sova pálená', 'Sýc rousný',
      'Sýček obecný', 'Výr velký',
    ];

    // Check that all 4 options in the first question are owls
    const options = page.locator('.quiz-option');
    const optionCount = await options.count();
    for (let i = 0; i < optionCount; i++) {
      const text = await options.nth(i).textContent();
      const isOwl = owlNames.some(name => text!.includes(name));
      expect(isOwl).toBe(true);
    }
  });

  test('"Vlastní výběr" button opens BirdSetManager', async ({ page }) => {
    await expect(page.locator('.bird-set-manager')).not.toBeVisible();
    await page.locator('.count-btn', { hasText: 'Vlastní výběr' }).click();
    await expect(page.locator('.bird-set-manager')).toBeVisible();
  });
});

test.describe('Custom Collections', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/nasi-ptaci/kviz/');
    await page.evaluate(() => {
      localStorage.removeItem('nasiptaci-bird-set');
      localStorage.removeItem('nasiptaci-active-collection');
      localStorage.removeItem('nasiptaci-custom-collections');
    });
    await page.reload();
  });

  test('"Uložit jako kolekci" button appears when birds are manually selected', async ({ page }) => {
    await page.locator('.count-btn', { hasText: 'Vlastní výběr' }).click();

    // Initially no save button (useAll is true)
    await expect(page.locator('.save-collection button')).not.toBeVisible();

    // Deselect all, then select some birds
    await page.locator('.bird-set-manager .controls button', { hasText: 'Zrušit vše' }).click();
    await page.locator('.bird-set-list label').first().click();

    await expect(page.locator('.save-collection button', { hasText: 'Uložit jako kolekci' })).toBeVisible();
  });

  test('saving a custom collection adds it to "Moje kolekce"', async ({ page }) => {
    // No "Moje kolekce" section initially
    await expect(page.locator('.custom-collections')).not.toBeVisible();

    // Seed a custom collection via localStorage
    await page.evaluate(() => {
      const collections = [{ id: 'test1', name: 'Testovací kolekce', slugs: ['kos-cerny', 'vrabec-domaci', 'sykora-konadra', 'penkava-obecna'] }];
      localStorage.setItem('nasiptaci-custom-collections', JSON.stringify(collections));
    });
    await page.reload();

    // "Moje kolekce" section should now be visible
    await expect(page.locator('.custom-collections')).toBeVisible();
    await expect(page.locator('.custom-collections .collection-card', { hasText: 'Testovací kolekce' })).toBeVisible();
    await expect(page.locator('.custom-collections .collection-card')).toContainText('4 ptáků');
  });

  test('clicking a custom collection selects it and writes to localStorage', async ({ page }) => {
    const slugs = ['kos-cerny', 'vrabec-domaci', 'sykora-konadra', 'penkava-obecna'];
    await page.evaluate((slugs) => {
      const collections = [{ id: 'test1', name: 'Moje ptáci', slugs }];
      localStorage.setItem('nasiptaci-custom-collections', JSON.stringify(collections));
    }, slugs);
    await page.reload();

    await page.locator('.custom-collections .collection-card', { hasText: 'Moje ptáci' }).click();

    const stored = await page.evaluate(() => localStorage.getItem('nasiptaci-bird-set'));
    const parsed = JSON.parse(stored!);
    expect(parsed).toEqual(slugs);

    const active = JSON.parse((await page.evaluate(() => localStorage.getItem('nasiptaci-active-collection')))!);
    expect(active).toEqual({ type: 'custom', id: 'test1' });
  });

  test('deleting a custom collection removes it from the list', async ({ page }) => {
    await page.evaluate(() => {
      const collections = [{ id: 'del1', name: 'K smazání', slugs: ['kos-cerny', 'vrabec-domaci', 'sykora-konadra', 'penkava-obecna'] }];
      localStorage.setItem('nasiptaci-custom-collections', JSON.stringify(collections));
    });
    await page.reload();

    await expect(page.locator('.custom-collections .collection-card', { hasText: 'K smazání' })).toBeVisible();

    // Click delete button
    await page.locator('.delete-collection').click();

    // Collection should be gone
    await expect(page.locator('.custom-collections')).not.toBeVisible();

    // localStorage should be updated
    const stored = await page.evaluate(() => localStorage.getItem('nasiptaci-custom-collections'));
    expect(JSON.parse(stored!)).toEqual([]);
  });

  test('deleting the active custom collection resets to "all"', async ({ page }) => {
    await page.evaluate(() => {
      const collections = [{ id: 'active1', name: 'Aktivní', slugs: ['kos-cerny', 'vrabec-domaci', 'sykora-konadra', 'penkava-obecna'] }];
      localStorage.setItem('nasiptaci-custom-collections', JSON.stringify(collections));
      localStorage.setItem('nasiptaci-active-collection', JSON.stringify({ type: 'custom', id: 'active1' }));
      localStorage.setItem('nasiptaci-bird-set', JSON.stringify(['kos-cerny', 'vrabec-domaci', 'sykora-konadra', 'penkava-obecna']));
    });
    await page.reload();

    // The custom collection should be selected
    await expect(page.locator('.custom-collections .collection-card', { hasText: 'Aktivní' })).toHaveClass(/selected/);

    // Delete it
    await page.locator('.delete-collection').click();

    // "Všichni ptáci" should now be selected
    await expect(page.locator('.collection-card', { hasText: 'Všichni ptáci' })).toHaveClass(/selected/);

    // bird-set should be cleared
    const stored = await page.evaluate(() => localStorage.getItem('nasiptaci-bird-set'));
    expect(stored).toBeNull();
  });

  test('custom collection persists across reload', async ({ page }) => {
    await page.evaluate(() => {
      const collections = [{ id: 'persist1', name: 'Trvalá', slugs: ['kos-cerny', 'vrabec-domaci', 'sykora-konadra', 'penkava-obecna'] }];
      localStorage.setItem('nasiptaci-custom-collections', JSON.stringify(collections));
      localStorage.setItem('nasiptaci-active-collection', JSON.stringify({ type: 'custom', id: 'persist1' }));
    });
    await page.reload();

    await expect(page.locator('.custom-collections .collection-card', { hasText: 'Trvalá' })).toHaveClass(/selected/);
  });
});
