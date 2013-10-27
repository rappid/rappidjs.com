package com.rappidjs.webtest.module;

import io.rappid.webtest.common.WebElementPanel;
import io.rappid.webtest.rappidjs.js.html.Input;
import io.rappid.webtest.rappidjs.js.ui.Content;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

/**
 * User: tony
 * Date: 27.10.13
 * Time: 11:14
 */
public class HomeModule extends Content {
    public HomeModule() {
        super(By.cssSelector("#home"));
    }

    public SimpleApp simpleApp() {
        return new SimpleApp(getChild(".app"));
    }

    public class SimpleApp extends WebElementPanel {
        private SimpleApp(WebElement element) {
            super(element);
        }

        public String headline() {
            return getChild(By.cssSelector("h2")).getText();
        }

        public Input input() {
            return getChildPanel("input", Input.class);
        }

        public String output() {
            return getChild(By.cssSelector("h3")).getText().trim();
        }
    }
}
