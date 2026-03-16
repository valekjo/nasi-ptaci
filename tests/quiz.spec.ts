import { test, expect } from '@playwright/test';

test.describe('Quiz Setup Page', () => {
  test('renders quiz setup with mode cards and count selector', async ({ page }) => {
    await page.goto('/nasi-ptaci/kviz/');

    await expect(page.locator('h2', { hasText: 'Poznáš ptáka?' })).toBeVisible();
    await expect(page.locator('.mode-card')).toHaveCount(2);
    await expect(page.locator('.mode-card', { hasText: 'Poznej podle fotky' })).toBeVisible();
    await expect(page.locator('.mode-card', { hasText: 'Poznej podle hlasu' })).toBeVisible();
    await expect(page.locator('.count-selector .count-btn')).toHaveCount(3);
    await expect(page.locator('.start-btn')).toBeVisible();
  });

  test('image mode is selected by default and start is enabled', async ({ page }) => {
    await page.goto('/nasi-ptaci/kviz/');

    await expect(page.locator('.mode-card', { hasText: 'Poznej podle fotky' })).toHaveClass(/selected/);
    await expect(page.locator('.start-btn')).toBeEnabled();
  });

  test('selecting a mode highlights the card', async ({ page }) => {
    await page.goto('/nasi-ptaci/kviz/');

    const imageCard = page.locator('.mode-card', { hasText: 'Poznej podle fotky' });
    await imageCard.click();
    await expect(imageCard).toHaveClass(/selected/);

    // Selecting the other mode deselects the first
    const soundCard = page.locator('.mode-card', { hasText: 'Poznej podle hlasu' });
    await soundCard.click();
    await expect(soundCard).toHaveClass(/selected/);
    await expect(imageCard).not.toHaveClass(/selected/);
  });

  test('selecting count highlights the button', async ({ page }) => {
    await page.goto('/nasi-ptaci/kviz/');

    // 10 is selected by default
    await expect(page.locator('.count-btn', { hasText: '10' })).toHaveClass(/selected/);

    // Select 20
    await page.locator('.count-btn', { hasText: '20' }).click();
    await expect(page.locator('.count-btn', { hasText: '20' })).toHaveClass(/selected/);
    await expect(page.locator('.count-btn', { hasText: '10' })).not.toHaveClass(/selected/);
  });

  test('start button navigates to quiz game with correct params', async ({ page }) => {
    await page.goto('/nasi-ptaci/kviz/');

    await page.locator('.mode-card', { hasText: 'Poznej podle fotky' }).click();
    await page.locator('.count-btn', { hasText: '20' }).click();
    await page.locator('.start-btn').click();

    await page.waitForURL('**/kviz/hra?mode=image&count=20');
    expect(page.url()).toContain('mode=image');
    expect(page.url()).toContain('count=20');
  });

  test('bird set manager toggles open and closed', async ({ page }) => {
    await page.goto('/nasi-ptaci/kviz/');

    // Initially hidden
    await expect(page.locator('.bird-set-manager')).not.toBeVisible();

    // Open it
    await page.locator('.count-btn', { hasText: 'Vlastní sada ptáků' }).click();
    await expect(page.locator('.bird-set-manager')).toBeVisible();

    // Close it
    await page.locator('.count-btn', { hasText: 'Skrýt výběr ptáků' }).click();
    await expect(page.locator('.bird-set-manager')).not.toBeVisible();
  });

  test('bird set manager shows all birds with checkboxes', async ({ page }) => {
    await page.goto('/nasi-ptaci/kviz/');

    await page.locator('.count-btn', { hasText: 'Vlastní sada ptáků' }).click();

    const checkboxes = page.locator('.bird-set-list label');
    const count = await checkboxes.count();
    expect(count).toBe(184);
  });

  test('bird set manager filter works', async ({ page }) => {
    await page.goto('/nasi-ptaci/kviz/');

    await page.locator('.count-btn', { hasText: 'Vlastní sada ptáků' }).click();
    await page.locator('.bird-set-manager input[placeholder="Filtrovat..."]').fill('sýkora');

    const labels = page.locator('.bird-set-list label');
    const count = await labels.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(184);
  });

  test('bird set manager filter ignores diacritics', async ({ page }) => {
    await page.goto('/nasi-ptaci/kviz/');

    await page.locator('.count-btn', { hasText: 'Vlastní sada ptáků' }).click();
    await page.locator('.bird-set-manager input[placeholder="Filtrovat..."]').fill('sykora');

    const labels = page.locator('.bird-set-list label');
    const count = await labels.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(184);
  });

  test('bird set manager select/deselect all', async ({ page }) => {
    await page.goto('/nasi-ptaci/kviz/');

    await page.locator('.count-btn', { hasText: 'Vlastní sada ptáků' }).click();

    // Click "Zrušit vše"
    await page.locator('.bird-set-manager .controls button', { hasText: 'Zrušit vše' }).click();
    await expect(page.locator('.bird-set-manager')).toContainText('Vybráno: 0');

    // Click "Vybrat vše"
    await page.locator('.bird-set-manager .controls button', { hasText: 'Vybrat vše' }).click();
    await expect(page.locator('.bird-set-manager')).toContainText('Vybráno: 184');

    // Click "Všichni ptáci" to reset
    await page.locator('.bird-set-manager .controls button', { hasText: 'Všichni ptáci' }).click();
    await expect(page.locator('.bird-set-manager')).toContainText('Používá se celý atlas');
  });
});

test.describe('Quiz Game – Image Mode', () => {
  test('shows question with image and 4 options', async ({ page }) => {
    await page.goto('/nasi-ptaci/kviz/hra?mode=image&count=10');

    // Wait for quiz to initialize
    await expect(page.locator('.quiz-progress')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.quiz-progress')).toContainText('Otázka 1 / 10');

    // Should show a bird image
    await expect(page.locator('.quiz-question-img')).toBeVisible();

    // Should have 4 options
    await expect(page.locator('.quiz-option')).toHaveCount(4);
  });

  test('answering a question shows correct/wrong and advances', async ({ page }) => {
    await page.goto('/nasi-ptaci/kviz/hra?mode=image&count=10');

    await expect(page.locator('.quiz-progress')).toBeVisible({ timeout: 5000 });

    // Click the first option
    await page.locator('.quiz-option').first().click();

    // One option should be marked correct
    await expect(page.locator('.quiz-option.correct')).toHaveCount(1);

    // After delay, should advance to question 2
    await expect(page.locator('.quiz-progress')).toContainText('Otázka 2 / 10', { timeout: 3000 });
  });

  test('completing all questions shows results', async ({ page }) => {
    await page.goto('/nasi-ptaci/kviz/hra?mode=image&count=10');
    await expect(page.locator('.quiz-progress')).toBeVisible({ timeout: 5000 });

    // Answer all 10 questions by clicking the first option each time
    for (let i = 0; i < 10; i++) {
      await page.locator('.quiz-option').first().click();
      if (i < 9) {
        await expect(page.locator('.quiz-progress')).toContainText(`Otázka ${i + 2} / 10`, { timeout: 3000 });
      }
    }

    // Results screen
    await expect(page.locator('.quiz-results')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('h2', { hasText: 'Výsledky' })).toBeVisible();
    await expect(page.locator('.quiz-score')).toBeVisible();
    const score = await page.locator('.quiz-score').textContent();
    expect(score).toMatch(/\d+ \/ 10/);
  });

  test('results show review list with marks', async ({ page }) => {
    await page.goto('/nasi-ptaci/kviz/hra?mode=image&count=10');
    await expect(page.locator('.quiz-progress')).toBeVisible({ timeout: 5000 });

    for (let i = 0; i < 10; i++) {
      await page.locator('.quiz-option').first().click();
      if (i < 9) {
        await expect(page.locator('.quiz-progress')).toContainText(`Otázka ${i + 2} / 10`, { timeout: 3000 });
      }
    }

    await expect(page.locator('.quiz-results')).toBeVisible({ timeout: 3000 });
    const reviewItems = page.locator('.quiz-review li');
    await expect(reviewItems).toHaveCount(10);

    // Each item has a check or cross mark
    for (let i = 0; i < 10; i++) {
      const mark = reviewItems.nth(i).locator('.mark');
      const text = await mark.textContent();
      expect(text === '✓' || text === '✗').toBe(true);
    }
  });

  test('results page has link back to quiz setup', async ({ page }) => {
    await page.goto('/nasi-ptaci/kviz/hra?mode=image&count=10');
    await expect(page.locator('.quiz-progress')).toBeVisible({ timeout: 5000 });

    for (let i = 0; i < 10; i++) {
      await page.locator('.quiz-option').first().click();
      if (i < 9) {
        await expect(page.locator('.quiz-progress')).toContainText(`Otázka ${i + 2} / 10`, { timeout: 3000 });
      }
    }

    await expect(page.locator('.quiz-results')).toBeVisible({ timeout: 3000 });
    const newQuizLink = page.locator('a.start-btn', { hasText: 'Nový kvíz' });
    await expect(newQuizLink).toBeVisible();
    await newQuizLink.click();
    await page.waitForURL('**/kviz/');
  });
});

test.describe('Quiz Game – Sound Mode', () => {
  test('shows play button and 4 image+name options', async ({ page }) => {
    await page.goto('/nasi-ptaci/kviz/hra?mode=sound&count=10');
    await expect(page.locator('.quiz-progress')).toBeVisible({ timeout: 5000 });

    // Should NOT show a question image
    await expect(page.locator('.quiz-question-img')).not.toBeVisible();

    // Should show a play button
    await expect(page.locator('button', { hasText: 'Přehrát hlas' })).toBeVisible();

    // Options should have images (for sound mode)
    const options = page.locator('.quiz-option');
    await expect(options).toHaveCount(4);
    const optionImgs = page.locator('.quiz-option img');
    const imgCount = await optionImgs.count();
    expect(imgCount).toBeGreaterThan(0);
  });
});

test.describe('Quiz with Custom Bird Set', () => {
  test('uses custom bird set from localStorage', async ({ page }) => {
    // Set a custom bird set — need at least 4 birds with images for distractors
    const customSet = [
      'kos-cerny',
      'sykora-konadra',
      'vrabec-domaci',
      'drozd-zpevny',
      'straka-obecna',
      'sykora-modrina',
      'rehek-zahradni',
      'rehek-domaci',
      'stehlík-obecny',
      'penkava-obecna',
    ];

    // Navigate first to set localStorage, then reload
    await page.goto('/nasi-ptaci/kviz/');
    await page.evaluate((set) => {
      localStorage.setItem('nasiptaci-bird-set', JSON.stringify(set));
    }, customSet);

    await page.goto('/nasi-ptaci/kviz/hra?mode=image&count=5');
    await expect(page.locator('.quiz-progress')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.quiz-progress')).toContainText('Otázka 1 / 5');

    // Clean up
    await page.evaluate(() => localStorage.removeItem('nasiptaci-bird-set'));
  });
});
