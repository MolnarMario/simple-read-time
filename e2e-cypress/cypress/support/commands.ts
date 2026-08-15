declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Cypress {
		interface Chainable {
			/** Logs in as the admin user, caching the session across tests/specs. */
			loginAsAdmin(): Chainable<void>;
		}
	}
}

Cypress.Commands.add('loginAsAdmin', () => {
	const user = String(Cypress.env('adminUser') || 'admin');
	const pass = String(Cypress.env('adminPass') || 'admin');

	// The session key includes the base URL so switching the run to another
	// registered site never reuses the previous site's cached session.
	cy.session(['admin', user, Cypress.config('baseUrl')], () => {
		cy.visit('/wp-login.php');
		cy.get('#user_login').type(user);
		cy.get('#user_pass').type(pass, { log: false });
		cy.get('#wp-submit').click();
		cy.url().should('include', '/wp-admin/');
	});
});

export {};
