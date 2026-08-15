import { defineConfig } from 'cypress';

/**
 * The suite is site-agnostic: the Automation Test Platform (or CI, or you)
 * chooses which registered WordPress site to hit by setting E2E_BASE_URL.
 * With nothing set it falls back to the local dev site, so `npx cypress run`
 * still works unchanged.
 */
export default defineConfig({
	e2e: {
		baseUrl: process.env.E2E_BASE_URL || 'http://simple-cypress.local',
		specPattern: 'cypress/e2e/**/*.cy.ts',
		supportFile: 'cypress/support/e2e.ts',
	},
	env: {
		adminUser: process.env.E2E_ADMIN_USER || 'admin',
		adminPass: process.env.E2E_ADMIN_PASS || 'admin',
	},
});
