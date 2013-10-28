package com.rappidjs.webtest;

import com.rappidjs.webtest.model.Person;
import com.rappidjs.webtest.module.HomeModule;
import io.rappid.webtest.common.WebElementPanel;
import io.rappid.webtest.testng.TestDevelopment;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * User: tony
 * Date: 26.10.13
 * Time: 17:10
 */
public class HomeTest extends RappidJsWebTest {

    @Test()
    public void SimpleAppTest() {
        HomeModule homeModule = getHomeModule();
        HomeModule.SimpleApp simpleApp = homeModule.simpleApp();

        Assert.assertEquals(simpleApp.input().getValue(), "");
        Assert.assertEquals(simpleApp.headline(), "Simple App");
        Assert.assertEquals(simpleApp.output(), "Hello !");

        simpleApp.input().setValue("Tony");
        Assert.assertEquals(simpleApp.output(), "Hello Tony!");
    }

    @Test()
    public void TodoListTest() {
        HomeModule.TodoApp todoApp = getHomeModule().getTodoApp();

        Assert.assertEquals(todoApp.headline(), "Todo");
        Assert.assertEquals(todoApp.totalItems(), 0);
        Assert.assertEquals(todoApp.openItems(), 0);
        Assert.assertEquals(todoApp.input().getValue(), "");

        Random random = new Random();

        // add several items
        ArrayList<String> list = new ArrayList<String>(30);
        ArrayList<String> uncheckedList = new ArrayList<String>(30);

        int itemCount = random.nextInt(19) + 7;

        for (int i = 0; i < itemCount; i++) {
            String item = new BigInteger(100, random).toString(32);
            list.add(item);

            todoApp.input().setValue(item);
            todoApp.input().pressEnter();

            Assert.assertEquals(todoApp.totalItems(), i + 1);
        }

        uncheckedList.addAll(list);

        // check some items
        int checkedCount = 0;
        for (int i = 0; i < itemCount; i++) {
            WebElementPanel item = new WebElementPanel(todoApp.getChildren(By.cssSelector("label")).get(i));

            Assert.assertEquals(item.getWebElement().getText().trim(), list.get(i));

            if (random.nextInt(2) == 1) {
                uncheckedList.remove(i - checkedCount);
                checkedCount++;

                // click the checkbox
                item.getChild("input").click();
                Assert.assertTrue(item.hasClass("done"));
            }

            Assert.assertEquals(todoApp.openItems(), itemCount - checkedCount);
        }

        if (checkedCount > 0) {
            Assert.assertTrue(todoApp.archive().isDisplayed());
        }

        todoApp.archive().click();

        Assert.assertEquals(todoApp.openItems(), uncheckedList.size());
        Assert.assertEquals(todoApp.totalItems(), uncheckedList.size());
    }

    @Test()
    public void ContactsTest() {
        HomeModule.ContactsApp app = getHomeModule().getContactsApp();


        Random random = new Random();
        int itemCount = random.nextInt(3) + 5;

        ArrayList<Person> contacts = new ArrayList<Person>();


        for (int i = 0; i < itemCount; i++) {
            Assert.assertFalse(app.previewIsVisible());
            Person p = new Person(new BigInteger(50, random).toString(32), new BigInteger(70, random).toString(32), new BigInteger(10, random).toString());
            contacts.add(p);

            app.firstName().setValue(p.getFirstName());
            app.lastName().setValue(p.getLastName());
            app.phone().setValue(p.getPhone());

            Assert.assertTrue(app.previewIsVisible());

            Assert.assertTrue(app.preview().shows(p));
            app.phone().pressEnter();
            Assert.assertFalse(app.previewIsVisible());
        }

        // check cards
        List<HomeModule.ContactsApp.Card> cards = app.cards();
        Assert.assertEquals(contacts.size(), cards.size());

        for (int i = 0; i < cards.size(); i++) {
            Assert.assertTrue(cards.get(i).shows(contacts.get(i)));
        }

    }

    private HomeModule getHomeModule() {
        IndexPage indexPage = getIndexPage();
        Assert.assertEquals(indexPage.getUri().getFragment(), "/home");

        return indexPage.getHomeModule();
    }

}
