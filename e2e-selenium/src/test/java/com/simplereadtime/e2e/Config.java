package com.simplereadtime.e2e;

/**
 * Target environment for a run.
 *
 * <p>The suite is site-agnostic: the Automation Test Platform (or CI, or you)
 * chooses which registered WordPress site to hit by setting E2E_BASE_URL —
 * either as an environment variable or as a {@code -DE2E_BASE_URL=...} system
 * property. With nothing set it falls back to the local dev site, so
 * {@code mvn test} still works unchanged.
 */
public final class Config {

	public static final String BASE_URL = trimTrailingSlash(
			setting("E2E_BASE_URL", "http://simple-selenium.local"));
	public static final String ADMIN_USER = setting("E2E_ADMIN_USER", "admin");
	public static final String ADMIN_PASS = setting("E2E_ADMIN_PASS", "admin");

	public static final String SETTINGS_URL = BASE_URL + "/wp-admin/options-general.php?page=simple-read-time";
	public static final String POST_URL = BASE_URL + "/hello-world/";

	private Config() {
	}

	/** System property wins over the environment, so both invocation styles work. */
	private static String setting(String name, String fallback) {
		String value = System.getProperty(name);
		if (value == null || value.isBlank()) {
			value = System.getenv(name);
		}
		return (value == null || value.isBlank()) ? fallback : value.trim();
	}

	private static String trimTrailingSlash(String url) {
		return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
	}
}
