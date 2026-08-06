# Simple Read Time

A lightweight WordPress plugin that estimates and displays the reading time of a post, based on its word count.

## Features

- **Automatic read-time display** — prepends a "⏱ X min read" line above the content of every published post.
- **Configurable reading speed** — a Settings page (**Settings → Read Time**) lets you set the average words-per-minute (WPM) used for the estimate. Default is 200 WPM.
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

## Scope / limitations

- Only applies to the `post` post type on singular views (not pages, archives, or custom post types).
- Read time is calculated from the rendered post content each page load (no caching) — fine for typical post lengths, but note if you have extremely high-traffic pages with very large content.
- No shortcode or block is provided; the read time is auto-inserted via the `the_content` filter.

## Requirements

- WordPress 5.0+
- PHP 7.0+

## Changelog

### 1.1.0
- Added **Settings → Read Time** admin page to configure words-per-minute.

### 1.0.0
- Initial release: automatic read-time estimate on post content, fixed at 200 WPM.

## License

GPL v2 or later.
