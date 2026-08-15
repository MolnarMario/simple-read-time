import path from 'path';

/**
 * Target environment for a run.
 *
 * The suite is site-agnostic: the Automation Test Platform (or CI, or you)
 * chooses which registered WordPress site to hit by setting E2E_BASE_URL.
 * With nothing set it falls back to the local dev site, so `npx playwright
 * test` still works unchanged.
 */
export const BASE_URL = process.env.E2E_BASE_URL || 'http://simple.local';
export const ADMIN_USER = process.env.E2E_ADMIN_USER || 'admin';
export const ADMIN_PASS = process.env.E2E_ADMIN_PASS || 'admin';

/**
 * Slug of the target host, used to namespace the files the suite writes.
 * Without this, two runs against different sites would trample each other's
 * saved session and WPM snapshot.
 */
export const SITE_SLUG = BASE_URL
	.replace(/^https?:\/\//, '')
	.replace(/[^a-z0-9]+/gi, '-')
	.toLowerCase();

export const STORAGE_STATE_PATH = path.join(__dirname, `.state-${SITE_SLUG}.json`);
export const ORIGINAL_WPM_PATH = path.join(__dirname, `.original-wpm-${SITE_SLUG}.json`);
