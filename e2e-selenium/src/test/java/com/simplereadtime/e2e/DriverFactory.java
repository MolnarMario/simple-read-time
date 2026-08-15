package com.simplereadtime.e2e;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

/**
 * A single Chrome session shared across every test class in the run (via
 * Selenium Manager auto-resolving a matching chromedriver), so the admin
 * login only has to happen once per class rather than once per test.
 */
public final class DriverFactory {

	private static WebDriver driver;

	private DriverFactory() {
	}

	public static synchronized WebDriver getDriver() {
		if (driver == null) {
			ChromeOptions options = new ChromeOptions();
			options.addArguments("--headless=new", "--window-size=1280,900");
			driver = new ChromeDriver(options);
			Runtime.getRuntime().addShutdownHook(new Thread(DriverFactory::quitDriver));
		}
		return driver;
	}

	public static synchronized void quitDriver() {
		if (driver != null) {
			driver.quit();
			driver = null;
		}
	}
}
