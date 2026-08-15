export {};

const POST_URL = '/hello-world/';
const SETTINGS_URL = '/wp-admin/options-general.php?page=simple-read-time';

function setWpm(value: number): void {
	cy.visit(SETTINGS_URL);
	cy.get('#srt_wpm').clear().type(String(value));
	cy.get('#submit').click();
	cy.get('#setting-error-settings_updated').should('contain.text', 'Settings saved');
}

function getShownMinutes(): Cypress.Chainable<number> {
	return cy.get('.simple-read-time').invoke('text').then((text) => {
		const match = text.match(/(\d+)\s*min read/);
		if (!match) {
			throw new Error(`Could not parse minute count from notice text: "${text}"`);
		}
		return Number(match[1]);
	});
}

// Ground truth word count, read from the app rather than re-implemented in
// JS: PHP's str_word_count() has its own rules (e.g. around dashes) that a
// naive JS word split won't exactly match. At wpm=1, ceil(words/1) is just
// `words`, so the displayed minute count *is* the word count.
function getGroundTruthWordCount(): Cypress.Chainable<number> {
	setWpm(1);
	cy.visit(POST_URL);
	return getShownMinutes();
}

describe('Read-time notice on a single post', () => {
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
		setWpm(Number(originalWpm));
	});

	it('DR-07 the notice is visible above the post content', () => {
		cy.visit(POST_URL);

		cy.get('.simple-read-time').should('be.visible').and('contain.text', 'min read');

		cy.get('.simple-read-time').then(($notice) => {
			const noticeTop = $notice[0].getBoundingClientRect().top;

			cy.get('.entry-content > *:not(.simple-read-time)')
				.first()
				.then(($paragraph) => {
					const paragraphTop = $paragraph[0].getBoundingClientRect().top;
					expect(noticeTop).to.be.lessThan(paragraphTop);
				});
		});
	});

	it('DR-08 displayed minutes equal ceil(word count / wpm) at 200 wpm', () => {
		getGroundTruthWordCount().then((words) => {
			setWpm(200);
			cy.visit(POST_URL);
			getShownMinutes().then((shown) => {
				expect(shown).to.eq(Math.max(1, Math.ceil(words / 200)));
			});
		});
	});

	it('DR-09 lowering the wpm setting increases the displayed minutes', () => {
		getGroundTruthWordCount().then((words) => {
			setWpm(50);
			cy.visit(POST_URL);
			getShownMinutes().then((shown) => {
				expect(shown).to.eq(Math.max(1, Math.ceil(words / 50)));
			});
		});
	});

	it('DR-10 raising the wpm setting decreases the displayed minutes', () => {
		getGroundTruthWordCount().then((words) => {
			setWpm(1000);
			cy.visit(POST_URL);
			getShownMinutes().then((shown) => {
				expect(shown).to.eq(Math.max(1, Math.ceil(words / 1000)));
			});
		});
	});

	it('RT-11 an extremely high wpm still floors to "1 min read"', () => {
		setWpm(1000000);
		cy.visit(POST_URL);
		cy.get('.simple-read-time').should('contain.text', '1 min read');
	});

	it('IS-03 the notice uses the expected muted, italic styling', () => {
		cy.visit(POST_URL);

		cy.get('.simple-read-time')
			.should('have.css', 'font-style', 'italic')
			.and('have.css', 'color', 'rgb(102, 102, 102)');
	});

	it('DR-11 the notice does not appear on the blog home/archive listing', () => {
		cy.visit('/');
		cy.get('.simple-read-time').should('not.exist');
	});
});
