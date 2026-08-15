import { chromium } from '@playwright/test';
import fs from 'fs';
import { BASE_URL, ORIGINAL_WPM_PATH, STORAGE_STATE_PATH } from './env';

/**
 * Restores the srt_wpm setting to whatever it was before the suite ran,
 * so running these tests doesn't leave the site's configuration changed.
 */
export default async function globalTeardown(): Promise<void> {
	if (!fs.existsSync(ORIGINAL_WPM_PATH)) {
		return;
	}

	const { originalWpm } = JSON.parse(fs.readFileSync(ORIGINAL_WPM_PATH, 'utf-8'));

	const browser = await chromium.launch();
	const page = await browser.newPage({ storageState: STORAGE_STATE_PATH });

	await page.goto(`${BASE_URL}/wp-admin/options-general.php?page=simple-read-time`);
	await page.fill('#srt_wpm', String(originalWpm));
	await page.click('text=Save Settings');
	await page.waitForSelector('#setting-error-settings_updated');

	await browser.close();

	fs.unlinkSync(ORIGINAL_WPM_PATH);
	fs.unlinkSync(STORAGE_STATE_PATH);
}
