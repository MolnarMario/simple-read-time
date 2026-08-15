import { chromium } from '@playwright/test';
import fs from 'fs';
import {
	ADMIN_PASS,
	ADMIN_USER,
	BASE_URL,
	ORIGINAL_WPM_PATH,
	STORAGE_STATE_PATH,
} from './env';

/**
 * Logs into wp-admin once as the admin user and reuses that session across
 * every test (via storageState), and snapshots the current WPM setting so
 * global-teardown.ts can restore it after the suite mutates it.
 */
export default async function globalSetup(): Promise<void> {
	const browser = await chromium.launch();
	const page = await browser.newPage();

	await page.goto(`${BASE_URL}/wp-login.php`);
	await page.fill('#user_login', ADMIN_USER);
	await page.fill('#user_pass', ADMIN_PASS);
	await page.click('#wp-submit');
	await page.waitForURL(`${BASE_URL}/wp-admin/`);

	await page.context().storageState({ path: STORAGE_STATE_PATH });

	await page.goto(`${BASE_URL}/wp-admin/options-general.php?page=simple-read-time`);
	const originalWpm = await page.locator('#srt_wpm').inputValue();
	fs.writeFileSync(ORIGINAL_WPM_PATH, JSON.stringify({ originalWpm }));

	await browser.close();
}
