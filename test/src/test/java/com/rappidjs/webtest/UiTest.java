package com.rappidjs.webtest;

import com.rappidjs.webtest.module.UiModule;
import io.rappid.webtest.rappidjs.js.ui.MenuButton;
import io.rappid.webtest.testng.TestDevelopment;
import org.openqa.selenium.Point;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.interactions.HasInputDevices;
import org.openqa.selenium.interactions.internal.Coordinates;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 * User: tony
 * Date: 26.10.13
 * Time: 17:10
 */
public class UiTest extends RappidJsWebTest {

    @Test()
    public void TestHeadline() {
        UiModule uiModule = getUiModule();

        Assert.assertEquals(uiModule.headline(), "UI Components");
    }

    @Test()
    public void TestMenuButtons() {
        UiModule uiModule = getUiModule();

        MenuButton menuButton = new MenuButton(uiModule.getChildren(".menu-button").get(0));
        Assert.assertTrue(menuButton.menuIsClosed());
        Assert.assertFalse(menuButton.menu().isDisplayed());

        // perform a click
        menuButton.click();

        Assert.assertTrue(menuButton.menuIsOpened());
        Assert.assertTrue(menuButton.menu().isDisplayed());

        // click beside menu button
        menuButton.clickAt(0, -40);

        Assert.assertTrue(menuButton.menuIsClosed());
        Assert.assertFalse(menuButton.menu().isDisplayed());

    }


    private UiModule getUiModule() {
        IndexPage indexPage = getIndexPage();
        return indexPage.getUiModule();
    }

}
