package com.rappidjs.webtest.module;

import io.rappid.webtest.rappidjs.js.ui.Content;
import org.openqa.selenium.By;

/**
 * User: tony
 * Date: 28.10.13
 * Time: 21:00
 */
public class UiModule extends Content{
    public UiModule() {
        super(By.cssSelector("#container > div"));
    }

    public String headline() {
        return getChild("header h1").getText();
    }
}
