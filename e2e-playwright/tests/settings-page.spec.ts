import { test, expect } from '@playwright/test';

const SETTINGS_URL = '/wp-admin/options-general.php?page=simple-read-time';

test.describe('Settings -> Read Time page (unauthenticated)', () => {
	// Override the logged-in storageState from playwright.config.ts for this
	// describe block only, so we can assert the page is actually gated.
	test.use({ storageState: { cookies: [], origins: [] } });

	test('ST-05 redirects to the login screen when not logged in', async ({ page }) => {
		await page.goto(SETTINGS_URL);
		await expect(page).toHaveURL(/wp-login\.php/);
	});
});

test.describe('Settings -> Read Time page (authenticated)', () => {
	test('ST-06 loads with the current WPM value pre-filled', async ({ page }) => {
		await page.goto(SETTINGS_URL);

		await expect(page.locator('h1')).toHaveText('Read Time Settings');
		const input = page.locator('#srt_wpm');
		await expect(input).toBeVisible();

		const value = Number(await input.inputValue());
		expect(value).toBeGreaterThan(0);
	});

	test('ST-07 saving a new WPM value shows confirmation and persists after reload', async ({ page }) => {
		await page.goto(SETTINGS_URL);

		await page.locator('#srt_wpm').fill('180');
		await page.getByRole('button', { name: 'Save Settings' }).click();

		await expect(page.locator('#setting-error-settings_updated')).toContainText('Settings saved');

		await page.reload();
		await expect(page.locator('#srt_wpm')).toHaveValue('180');
	});

	test('ST-08 rejects a zero value via the input\'s min="1" constraint', async ({ page }) => {
		await page.goto(SETTINGS_URL);

		const input = page.locator('#srt_wpm');
		await input.fill('0');

		const isValid = await input.evaluate((el: HTMLInputElement) => el.checkValidity());
		expect(isValid).toBe(false);
	});

	test('ST-09 rejects a negative value via the input\'s min="1" constraint', async ({ page }) => {
		await page.goto(SETTINGS_URL);

		const input = page.locator('#srt_wpm');
		await input.fill('-50');

		const isValid = await input.evaluate((el: HTMLInputElement) => el.checkValidity());
		expect(isValid).toBe(false);
	});

	test('ST-10 the field rejects non-numeric keyboard input', async ({ page }) => {
		await page.goto(SETTINGS_URL);

		const input = page.locator('#srt_wpm');
		await input.fill('');
		await input.pressSequentially('abc', { delay: 20 });

		// type="number" inputs discard characters that don't parse as a number.
		await expect(input).toHaveValue('');
	});
});
