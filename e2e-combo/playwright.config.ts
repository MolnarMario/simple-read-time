import { defineConfig, devices } from '@playwright/test';
import { BASE_URL, STORAGE_STATE_PATH } from './env';

export default defineConfig({
	testDir: './tests',
	fullyParallel: false,
	workers: 1,
	retries: 0,
	reporter: 'list',
	globalSetup: require.resolve('./global-setup'),
	globalTeardown: require.resolve('./global-teardown'),
	use: {
		baseURL: BASE_URL,
		storageState: STORAGE_STATE_PATH,
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
	],
});
