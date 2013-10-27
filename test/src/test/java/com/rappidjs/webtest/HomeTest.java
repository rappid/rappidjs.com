package com.rappidjs.webtest;

import com.rappidjs.webtest.module.HomeModule;
import io.rappid.webtest.common.WebElementPanel;
import io.rappid.webtest.testng.TestDevelopment;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.math.BigInteger;
import java.util.ArrayList;
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
    @TestDevelopment()
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

    private HomeModule getHomeModule() {
        IndexPage indexPage = getIndexPage();
        Assert.assertEquals(indexPage.getUri().getFragment(), "/home");

        return indexPage.getHomeModule();
    }

}
