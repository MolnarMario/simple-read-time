package com.simplereadtime.e2e;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class SettingsPageTest {

	private static WebDriver driver;
	private static String originalWpm;

	@BeforeAll
	static void loginAndCaptureOriginalWpm() {
		driver = DriverFactory.getDriver();
		LoginHelper.loginAsAdmin(driver);
		driver.get(Config.SETTINGS_URL);
		originalWpm = driver.findElement(By.id("srt_wpm")).getAttribute("value");
	}

	@AfterAll
	static void restoreOriginalWpm() {
		LoginHelper.loginAsAdmin(driver);
		SettingsHelper.setWpm(driver, Integer.parseInt(originalWpm));
	}

	@Test
	@Order(1)
	@DisplayName("ST-05 redirects to the login screen when not logged in")
	void redirectsWhenNotLoggedIn() {
		// WebDriver's cookie store is scoped to cookies visible from the
		// current page's path, and WordPress sets its admin auth cookie
		// with Path=/wp-admin (separate from the site-wide logged_in
		// cookie). Navigate to a wp-admin page first so that cookie is
		// actually visible and gets cleared too, not just the wide one.
		driver.get(Config.SETTINGS_URL);
		driver.manage().deleteAllCookies();
		driver.get(Config.SETTINGS_URL);

		new WebDriverWait(driver, Duration.ofSeconds(10))
				.until(ExpectedConditions.urlContains("wp-login.php"));
		assertTrue(driver.getCurrentUrl().contains("wp-login.php"));

		LoginHelper.loginAsAdmin(driver);
	}

	@Test
	@Order(2)
	@DisplayName("ST-06 loads with the current WPM value pre-filled")
	void loadsWithCurrentValuePrefilled() {
		driver.get(Config.SETTINGS_URL);

		assertEquals("Read Time Settings", driver.findElement(By.cssSelector("h1")).getText());

		String value = driver.findElement(By.id("srt_wpm")).getAttribute("value");
		assertTrue(Integer.parseInt(value) > 0);
	}

	@Test
	@Order(3)
	@DisplayName("ST-07 saving a new WPM value shows confirmation and persists after reload")
	void savingPersistsAfterReload() {
		driver.get(Config.SETTINGS_URL);

		WebElement input = driver.findElement(By.id("srt_wpm"));
		input.clear();
		input.sendKeys("180");
		driver.findElement(By.cssSelector("form[action=\"options.php\"] input[type=\"submit\"]")).click();

		WebElement notice = new WebDriverWait(driver, Duration.ofSeconds(10))
				.until(ExpectedConditions.presenceOfElementLocated(By.id("setting-error-settings_updated")));
		assertTrue(notice.getText().contains("Settings saved"));

		driver.navigate().refresh();
		assertEquals("180", driver.findElement(By.id("srt_wpm")).getAttribute("value"));
	}

	@Test
	@Order(4)
	@DisplayName("ST-08 rejects a zero value via the input's min=\"1\" constraint")
	void rejectsZero() {
		driver.get(Config.SETTINGS_URL);

		WebElement input = driver.findElement(By.id("srt_wpm"));
		input.clear();
		input.sendKeys("0");

		Object isValid = ((JavascriptExecutor) driver).executeScript("return arguments[0].checkValidity();", input);
		assertFalse((Boolean) isValid);
	}

	@Test
	@Order(5)
	@DisplayName("ST-09 rejects a negative value via the input's min=\"1\" constraint")
	void rejectsNegative() {
		driver.get(Config.SETTINGS_URL);

		WebElement input = driver.findElement(By.id("srt_wpm"));
		input.clear();
		input.sendKeys("-50");

		Object isValid = ((JavascriptExecutor) driver).executeScript("return arguments[0].checkValidity();", input);
		assertFalse((Boolean) isValid);
	}

	@Test
	@Order(6)
	@DisplayName("ST-10 the field rejects non-numeric keyboard input")
	void rejectsNonNumericInput() {
		driver.get(Config.SETTINGS_URL);

		WebElement input = driver.findElement(By.id("srt_wpm"));
		input.clear();
		input.sendKeys("abc");

		assertEquals("", input.getAttribute("value"));
	}
}
