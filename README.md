# Simple Read Time

A lightweight WordPress plugin that estimates and displays the reading time of a post, based on its word count.

## Features

- **Automatic read-time display** — prepends a "⏱ X min read" line above the content of every published post.
- **Configurable reading speed** — a Settings page (**Settings → Read Time**) lets you set the average words-per-minute (WPM) used for the estimate. Default is 200 WPM.
- **One-click reset** — a "Reset to Default (200 WPM)" button on the settings page restores the default reading speed.
- **Zero configuration required** — works immediately on activation with sensible defaults.
- **Lightweight** — a single PHP file, no external dependencies, no database tables, one `wp_options` entry.
- **Minimum 1-minute floor** — even very short posts show "1 min read" rather than "0 min read".

## How it works

1. On `the_content` for single posts, the plugin strips HTML tags from the post content and counts the words with `str_word_count()`.
2. It divides the word count by the configured WPM (`ceil(word_count / wpm)`) to get the estimated minutes, rounding up.
3. The result is prepended to the post content as `<p class="simple-read-time">⏱ X min read</p>`, styled with a small inline stylesheet injected in `wp_head`.

## Installation

1. Download `simple-read-time.zip` (or clone this repo and zip the `simple-read-time.php` file yourself — see below).
2. In your WordPress admin, go to **Plugins → Add New → Upload Plugin**.
3. Choose the zip file and click **Install Now**, then **Activate**.
4. Visit any published post to see the read time displayed above the content.

### Building the zip yourself

```bash
zip -r simple-read-time.zip simple-read-time.php
```

(The zip must contain the plugin file, ideally inside a `simple-read-time/` folder, so WordPress installs it as its own plugin directory.)

## Configuration

Go to **Settings → Read Time** in the WordPress admin:

| Field | Description | Default |
|---|---|---|
| Average reading speed (WPM) | Words per minute used to calculate the estimate. Higher values produce shorter estimated read times. | 200 |

Changing this value updates the estimate on every post immediately — no code changes needed.

Click **Reset to Default (200 WPM)** on the same page to restore the default reading speed at any time.

## Scope / limitations

- Only applies to the `post` post type on singular views (not pages, archives, or custom post types).
- Read time is calculated from the rendered post content each page load (no caching) — fine for typical post lengths, but note if you have extremely high-traffic pages with very large content.
- No shortcode or block is provided; the read time is auto-inserted via the `the_content` filter.

## Testing

End-to-end tests run against a live WordPress install and are implemented once per framework
(Playwright, Cypress, Selenium), covering the same scenarios, plus a combined suite that runs
all three together:

**Playwright** (`e2e-playwright/`):

```bash
cd e2e-playwright
npm install
npx playwright test
```

**Cypress** (`e2e-cypress/`):

```bash
cd e2e-cypress
npm install
npx cypress run
```

**Selenium** (`e2e-selenium/`, Java + JUnit 5 + Maven):

```bash
cd e2e-selenium
mvn test
```

**Combined** (`e2e-combo/`): all three frameworks in one directory — Playwright and Cypress in
TypeScript, Selenium in Java — covering the same scenarios as the three suites above, plus the
Reset-to-Default button's behaviour and red styling. The Automation Test Platform dashboard
auto-detects a directory holding more than one framework and runs it as a single composite
suite, one process per framework, all against the same site:

```bash
cd e2e-combo
npm install               # installs both @playwright/test and cypress
npx playwright test
npx cypress run
mvn test
```

All four suites log in as an admin user and are **site-agnostic**: each reads its target from
the environment, falling back to a local default when nothing is set.

| Variable | Meaning | Default |
| --- | --- | --- |
| `E2E_BASE_URL` | Site to test | `http://simple.local` (Playwright), `http://simple-cypress.local` (Cypress), `http://simple-selenium.local` (Selenium) |
| `E2E_ADMIN_USER` | wp-admin username | `admin` |
| `E2E_ADMIN_PASS` | wp-admin password | `admin` |

So any suite can be pointed at any site:

```bash
E2E_BASE_URL=http://simple-cypress.local npx playwright test
```

(The Selenium suite also accepts them as system properties, e.g.
`mvn test -DE2E_BASE_URL=http://simple.local`.)

That is what lets the Automation Test Platform dashboard run any of the three suites against
any registered site from a dropdown — see `../thrive-test-dashboard/README.md`.

## Requirements

- WordPress 5.0+
- PHP 7.0+

## Changelog

### 1.2.0
- Added a "Reset to Default (200 WPM)" button to the Read Time settings page.

### 1.1.0
- Added **Settings → Read Time** admin page to configure words-per-minute.

### 1.0.0
- Initial release: automatic read-time estimate on post content, fixed at 200 WPM.

## License

GPL v2 or later.
