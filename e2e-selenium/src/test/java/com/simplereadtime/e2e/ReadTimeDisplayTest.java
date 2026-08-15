package com.simplereadtime.e2e;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ReadTimeDisplayTest {

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
	@DisplayName("DR-07 the notice is visible above the post content")
	void noticeVisibleAboveContent() {
		driver.get(Config.POST_URL);

		WebElement notice = driver.findElement(By.cssSelector(".simple-read-time"));
		assertTrue(notice.isDisplayed());
		assertTrue(notice.getText().matches(".*\\d+ min read.*"));

		int noticeY = notice.getRect().getY();
		WebElement firstParagraph = driver.findElement(By.cssSelector(".entry-content > *:not(.simple-read-time)"));
		int paragraphY = firstParagraph.getRect().getY();

		assertTrue(noticeY < paragraphY);
	}

	@Test
	@Order(2)
	@DisplayName("DR-08 displayed minutes equal ceil(word count / wpm) at 200 wpm")
	void minutesMatchAt200Wpm() {
		int words = SettingsHelper.getGroundTruthWordCount(driver);

		SettingsHelper.setWpm(driver, 200);
		driver.get(Config.POST_URL);
		int shown = SettingsHelper.getShownMinutes(driver);

		assertEquals(Math.max(1, (int) Math.ceil(words / 200.0)), shown);
	}

	@Test
	@Order(3)
	@DisplayName("DR-09 lowering the wpm setting increases the displayed minutes")
	void loweringWpmIncreasesMinutes() {
		int words = SettingsHelper.getGroundTruthWordCount(driver);

		SettingsHelper.setWpm(driver, 50);
		driver.get(Config.POST_URL);
		int shown = SettingsHelper.getShownMinutes(driver);

		assertEquals(Math.max(1, (int) Math.ceil(words / 50.0)), shown);
	}

	@Test
	@Order(4)
	@DisplayName("DR-10 raising the wpm setting decreases the displayed minutes")
	void raisingWpmDecreasesMinutes() {
		int words = SettingsHelper.getGroundTruthWordCount(driver);

		SettingsHelper.setWpm(driver, 1000);
		driver.get(Config.POST_URL);
		int shown = SettingsHelper.getShownMinutes(driver);

		assertEquals(Math.max(1, (int) Math.ceil(words / 1000.0)), shown);
	}

	@Test
	@Order(5)
	@DisplayName("RT-11 an extremely high wpm still floors to \"1 min read\"")
	void veryHighWpmFloorsToOneMinute() {
		SettingsHelper.setWpm(driver, 1_000_000);
		driver.get(Config.POST_URL);

		assertTrue(driver.findElement(By.cssSelector(".simple-read-time")).getText().contains("1 min read"));
	}

	@Test
	@Order(6)
	@DisplayName("IS-03 the notice uses the expected muted, italic styling")
	void noticeHasExpectedStyling() {
		driver.get(Config.POST_URL);

		WebElement notice = driver.findElement(By.cssSelector(".simple-read-time"));
		assertEquals("italic", notice.getCssValue("font-style"));
		assertTrue(notice.getCssValue("color").matches("rgba?\\(102,\\s*102,\\s*102(,\\s*1)?\\)"));
	}

	@Test
	@Order(7)
	@DisplayName("DR-11 the notice does not appear on the blog home/archive listing")
	void noticeAbsentFromHomeListing() {
		driver.get(Config.BASE_URL + "/");
		assertTrue(driver.findElements(By.cssSelector(".simple-read-time")).isEmpty());
	}
}
