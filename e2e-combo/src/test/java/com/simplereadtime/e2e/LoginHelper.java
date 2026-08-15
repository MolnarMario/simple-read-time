package com.simplereadtime.e2e;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public final class LoginHelper {

	private LoginHelper() {
	}

	public static void loginAsAdmin(WebDriver driver) {
		driver.get(Config.BASE_URL + "/wp-login.php");

		// WordPress pre-fills #user_login with the last-submitted username
		// on repeat visits, so logging in more than once per session
		// requires clearing the fields first or "admin" + "admin" becomes
		// "adminadmin".
		WebElement usernameField = driver.findElement(By.id("user_login"));
		usernameField.clear();
		usernameField.sendKeys(Config.ADMIN_USER);

		WebElement passwordField = driver.findElement(By.id("user_pass"));
		passwordField.clear();
		passwordField.sendKeys(Config.ADMIN_PASS);

		driver.findElement(By.id("wp-submit")).click();

		new WebDriverWait(driver, Duration.ofSeconds(10))
				.until(ExpectedConditions.urlContains("/wp-admin/"));
	}
}
