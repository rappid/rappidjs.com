package com.rappidjs.webtest.module;

import io.rappid.webtest.common.WebElementPanel;
import io.rappid.webtest.rappidjs.js.html.Input;
import io.rappid.webtest.rappidjs.js.ui.Content;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

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

    public TodoApp getTodoApp() {
        return new TodoApp(getChildren(By.cssSelector(".app")).get(1));
    }

    public class SimpleApp extends WebElementPanel {
        private SimpleApp(WebElement element) {
            super(element);
        }

        public String headline() {
            return getChild("h2").getText();
        }

        public Input input() {
            return getChildPanel("input", Input.class);
        }

        public String output() {
            return getChild("h3").getText().trim();
        }
    }

    public class TodoApp extends WebElementPanel {
        public TodoApp(WebElement webElement) {
            super(webElement);
        }

        public String headline() {
            return getChild("h2").getText();
        }

        public WebElement archive() {
            return getChild("span a");
        }

        public int openItems() {
            Matcher matcher = Pattern.compile("(\\d+)\\s").matcher(getChild("span").getText());
            if (matcher.find()) {
                return Integer.parseInt(matcher.group(1));
            }

            return -1;
        }

        public int totalItems() {
            Matcher matcher = Pattern.compile("of\\s(\\d+)").matcher(getChild("span").getText());
            if (matcher.find()) {
                return Integer.parseInt(matcher.group(1));
            }

            return -1;
        }

        public Input input() {
            return getChildPanel("input[type='text']", Input.class);
        }
    }
}
