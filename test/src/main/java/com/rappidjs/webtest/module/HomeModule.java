package com.rappidjs.webtest.module;

import com.rappidjs.webtest.model.Person;
import io.rappid.webtest.common.WebElementPanel;
import io.rappid.webtest.rappidjs.js.html.Input;
import io.rappid.webtest.rappidjs.js.ui.Content;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.util.ArrayList;
import java.util.List;
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

    public ContactsApp getContactsApp() {
        return new ContactsApp(getChild(".contact-app"));
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

    public class ContactsApp extends WebElementPanel{
        public ContactsApp(WebElement element) {
            super(element);
        }

        public String headline() {
            return getChild("h2").getText();
        }

        public Input firstName() {
            return getChildPanel(getChildren("input").get(0), Input.class);
        }

        public Input lastName() {
            return getChildPanel(getChildren("input").get(1), Input.class);
        }

        public Input phone() {
            return getChildPanel(getChildren("input").get(2), Input.class);
        }

        public boolean previewIsVisible() {
            return hasChild(".preview");
        }

        public Card preview() {
            return new Card(getChild(".preview"));
        }

        public List<Card> cards() {
            ArrayList<Card> cards = new ArrayList<Card>();

            for (WebElement card: getChildren("ul .card")) {
                cards.add(new Card(card));
            }

            return cards;
        }

        public class Card extends WebElementPanel{
            public Card(WebElement element) {
                super(element);
            }

            public String name() {
                return getChildren("p").get(0).getText().trim().replace("Name: ", "");
            }

            public String phone() {
                return getChildren("p").get(1).getText().trim().replace("Phone: ", "");
            }

            public boolean shows(Person person) {
                return person.getFullname().equals(name()) &&
                        person.getPhone().equals(phone());
            }
        }
    }
}
