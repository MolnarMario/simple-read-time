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

// Covers github.com/MolnarMario/simple-read-time PR #1 ("Make Reset button
// red"): the button visually distinguishing the destructive reset action
// from Save Settings, and the reset behaviour it sits on top of. The Reset
// form's submit button shares WordPress's default id="submit" with the Save
// form's, so every locator here goes through the unique `.srt-reset-button`
// class rather than `#submit`, which resolves to the Save button first.
test.describe('Settings -> Read Time page (Reset to Default)', () => {
	test('RB-01 the reset button is styled red, distinct from Save Settings', async ({ page }) => {
		await page.goto(SETTINGS_URL);

		const resetButton = page.locator('.srt-reset-button');
		await expect(resetButton).toBeVisible();
		await expect(resetButton).toHaveValue('Reset to Default (200 WPM)');
		await expect(resetButton).toHaveCSS('background-color', 'rgb(214, 54, 56)'); // #d63638

		const saveButton = page.getByRole('button', { name: 'Save Settings' });
		await expect(saveButton).not.toHaveCSS('background-color', 'rgb(214, 54, 56)');
	});

	test('RB-02 clicking reset restores 200 wpm and shows a confirmation notice', async ({ page }) => {
		await page.goto(SETTINGS_URL);

		await page.locator('#srt_wpm').fill('777');
		await page.getByRole('button', { name: 'Save Settings' }).click();
		await expect(page.locator('#setting-error-settings_updated')).toContainText('Settings saved');

		await page.locator('.srt-reset-button').click();

		await expect(page.locator('.notice-success')).toContainText('Reading speed reset to default (200 WPM).');
		await expect(page.locator('#srt_wpm')).toHaveValue('200');
	});
});
