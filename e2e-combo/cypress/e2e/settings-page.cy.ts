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

		// Covers github.com/MolnarMario/simple-read-time PR #1 ("Make Reset
		// button red"): the visual distinction from Save Settings, and the
		// reset behaviour it sits on top of. Kept inside this describe block
		// (rather than its own) so the `after()` above — which restores the
		// site's real original WPM via the Save form — still runs last and
		// undoes whatever these leave behind. The Reset form's submit button
		// shares WordPress's default id="submit" with the Save form's, so
		// these go through the unique `.srt-reset-button` class instead.
		it('RB-01 the reset button is styled red, distinct from Save Settings', () => {
			cy.visit(SETTINGS_URL);

			cy.get('.srt-reset-button')
				.should('be.visible')
				.and('have.value', 'Reset to Default (200 WPM)')
				.and('have.css', 'background-color', 'rgb(214, 54, 56)'); // #d63638

			cy.get('#submit').should('not.have.css', 'background-color', 'rgb(214, 54, 56)');
		});

		it('RB-02 clicking reset restores 200 wpm and shows a confirmation notice', () => {
			cy.visit(SETTINGS_URL);

			cy.get('#srt_wpm').clear().type('777');
			cy.get('#submit').click();
			cy.get('#setting-error-settings_updated').should('contain.text', 'Settings saved');

			cy.get('.srt-reset-button').click();

			cy.get('.notice-success').should('contain.text', 'Reading speed reset to default (200 WPM).');
			cy.get('#srt_wpm').should('have.value', '200');
		});
	});
});
