import { test, expect, type Page } from '@playwright/test';

const POST_URL = '/hello-world/';
const SETTINGS_URL = '/wp-admin/options-general.php?page=simple-read-time';

async function setWpm(page: Page, value: number): Promise<void> {
	await page.goto(SETTINGS_URL);
	await page.locator('#srt_wpm').fill(String(value));
	await page.getByRole('button', { name: 'Save Settings' }).click();
	await expect(page.locator('#setting-error-settings_updated')).toContainText('Settings saved');
}

async function getShownMinutes(page: Page): Promise<number> {
	const text = await page.locator('.simple-read-time').innerText();
	const match = text.match(/(\d+)\s*min read/);
	if (!match) {
		throw new Error(`Could not parse minute count from notice text: "${text}"`);
	}
	return Number(match[1]);
}

// Ground truth word count, read from the app rather than re-implemented in
// JS: PHP's str_word_count() has its own rules (e.g. around dashes) that a
// naive `\S+` split in JS won't exactly match. At wpm=1, ceil(words/1) is
// just `words`, so the displayed minute count *is* the word count.
async function getGroundTruthWordCount(page: Page): Promise<number> {
	await setWpm(page, 1);
	await page.goto(POST_URL);
	return getShownMinutes(page);
}

test.describe('Read-time notice on a single post', () => {
	test('DR-07 the notice is visible above the post content', async ({ page }) => {
		await page.goto(POST_URL);

		const notice = page.locator('.simple-read-time');
		await expect(notice).toBeVisible();
		await expect(notice).toContainText(/\d+ min read/);

		const noticeBox = await notice.boundingBox();
		const firstParagraphBox = await page
			.locator('.entry-content > *:not(.simple-read-time)')
			.first()
			.boundingBox();

		expect(noticeBox).not.toBeNull();
		expect(firstParagraphBox).not.toBeNull();
		expect(noticeBox!.y).toBeLessThan(firstParagraphBox!.y);
	});

	test('DR-08 displayed minutes equal ceil(word count / wpm) at 200 wpm', async ({ page }) => {
		const words = await getGroundTruthWordCount(page);

		await setWpm(page, 200);
		await page.goto(POST_URL);
		const shown = await getShownMinutes(page);

		expect(shown).toBe(Math.max(1, Math.ceil(words / 200)));
	});

	test('DR-09 lowering the wpm setting increases the displayed minutes', async ({ page }) => {
		const words = await getGroundTruthWordCount(page);

		await setWpm(page, 50);
		await page.goto(POST_URL);
		const shown = await getShownMinutes(page);

		expect(shown).toBe(Math.max(1, Math.ceil(words / 50)));
	});

	test('DR-10 raising the wpm setting decreases the displayed minutes', async ({ page }) => {
		const words = await getGroundTruthWordCount(page);

		await setWpm(page, 1000);
		await page.goto(POST_URL);
		const shown = await getShownMinutes(page);

		expect(shown).toBe(Math.max(1, Math.ceil(words / 1000)));
	});

	test('RT-11 an extremely high wpm still floors to "1 min read"', async ({ page }) => {
		await setWpm(page, 1000000);
		await page.goto(POST_URL);

		await expect(page.locator('.simple-read-time')).toContainText('1 min read');
	});

	test('IS-03 the notice uses the expected muted, italic styling', async ({ page }) => {
		await page.goto(POST_URL);

		const notice = page.locator('.simple-read-time');
		await expect(notice).toHaveCSS('font-style', 'italic');
		await expect(notice).toHaveCSS('color', 'rgb(102, 102, 102)'); // #666
	});

	test('DR-11 the notice does not appear on the blog home/archive listing', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('.simple-read-time')).toHaveCount(0);
	});
});
