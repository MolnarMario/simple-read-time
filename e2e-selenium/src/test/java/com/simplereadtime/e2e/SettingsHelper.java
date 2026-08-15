package com.simplereadtime.e2e;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class SettingsHelper {

	private static final Pattern MINUTES_PATTERN = Pattern.compile("(\\d+)\\s*min read");

	private SettingsHelper() {
	}

	public static void setWpm(WebDriver driver, int value) {
		driver.get(Config.SETTINGS_URL);
		WebElement input = driver.findElement(By.id("srt_wpm"));
		input.clear();
		input.sendKeys(String.valueOf(value));

		// The settings page also has a "Reset to Default" form whose button
		// shares the id="submit" default from WordPress's submit_button(),
		// so this scopes to the Save form specifically rather than relying
		// on duplicate-id resolution order.
		driver.findElement(By.cssSelector("form[action=\"options.php\"] input[type=\"submit\"]")).click();

		new WebDriverWait(driver, Duration.ofSeconds(10))
				.until(ExpectedConditions.presenceOfElementLocated(By.id("setting-error-settings_updated")));
	}

	public static int getShownMinutes(WebDriver driver) {
		WebElement notice = driver.findElement(By.cssSelector(".simple-read-time"));
		String text = notice.getText();
		Matcher matcher = MINUTES_PATTERN.matcher(text);
		if (!matcher.find()) {
			throw new IllegalStateException("Could not parse minute count from notice text: \"" + text + "\"");
		}
		return Integer.parseInt(matcher.group(1));
	}

	/**
	 * Ground truth word count, read from the app rather than re-implemented
	 * in Java: PHP's str_word_count() has its own rules (e.g. around dashes)
	 * that a naive word split won't exactly match. At wpm=1, ceil(words/1)
	 * is just `words`, so the displayed minute count *is* the word count.
	 */
	public static int getGroundTruthWordCount(WebDriver driver) {
		setWpm(driver, 1);
		driver.get(Config.POST_URL);
		return getShownMinutes(driver);
	}
}
