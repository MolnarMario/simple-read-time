export {};

const SETTINGS_URL = '/wp-admin/options-general.php?page=simple-read-time';

describe('Settings -> Read Time page', () => {
	it('ST-05 redirects to the login screen when not logged in', () => {
		cy.visit(SETTINGS_URL);
		cy.location('pathname').should('include', 'wp-login.php');
	});

	describe('authenticated', () => {
		let originalWpm: string;

		before(() => {
			cy.loginAsAdmin();
			cy.visit(SETTINGS_URL);
			cy.get('#srt_wpm')
				.invoke('val')
				.then((value) => {
					originalWpm = String(value);
				});
		});

		beforeEach(() => {
			cy.loginAsAdmin();
		});

		after(() => {
			cy.loginAsAdmin();
			cy.visit(SETTINGS_URL);
			cy.get('#srt_wpm').clear().type(originalWpm);
			cy.get('#submit').click();
			cy.get('#setting-error-settings_updated').should('be.visible');
		});

		it('ST-06 loads with the current WPM value pre-filled', () => {
			cy.visit(SETTINGS_URL);

			cy.get('h1').should('have.text', 'Read Time Settings');
			cy.get('#srt_wpm')
				.invoke('val')
				.then((value) => {
					expect(Number(value)).to.be.greaterThan(0);
				});
		});

		it('ST-07 saving a new WPM value shows confirmation and persists after reload', () => {
			cy.visit(SETTINGS_URL);

			cy.get('#srt_wpm').clear().type('180');
			cy.get('#submit').click();
			cy.get('#setting-error-settings_updated').should('contain.text', 'Settings saved');

			cy.reload();
			cy.get('#srt_wpm').should('have.value', '180');
		});

		it('ST-08 rejects a zero value via the input\'s min="1" constraint', () => {
			cy.visit(SETTINGS_URL);

			cy.get('#srt_wpm')
				.clear()
				.type('0')
				.then(($el) => {
					expect(($el[0] as HTMLInputElement).checkValidity()).to.be.false;
				});
		});

		it('ST-09 rejects a negative value via the input\'s min="1" constraint', () => {
			cy.visit(SETTINGS_URL);

			cy.get('#srt_wpm')
				.clear()
				.type('-50')
				.then(($el) => {
					expect(($el[0] as HTMLInputElement).checkValidity()).to.be.false;
				});
		});

		it('ST-10 the field rejects non-numeric keyboard input', () => {
			cy.visit(SETTINGS_URL);

			cy.get('#srt_wpm').clear().type('abc');
			cy.get('#srt_wpm').should('have.value', '');
		});
	});
});
