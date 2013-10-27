package com.rappidjs.webtest;

import com.rappidjs.webtest.module.HomeModule;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 * User: tony
 * Date: 26.10.13
 * Time: 17:10
 */
public class HomeTest extends RappidJsWebTest {

    @Test()
    public void SimpleAppTest() {
        IndexPage indexPage = getIndexPage();
        Assert.assertEquals(indexPage.getUri().getFragment(), "/home");

        HomeModule homeModule = indexPage.getHomeModule();
        HomeModule.SimpleApp simpleApp = homeModule.simpleApp();

        Assert.assertEquals(simpleApp.input().getValue(), "");
        Assert.assertEquals(simpleApp.headline(), "Simple App");
        Assert.assertEquals(simpleApp.output(), "Hello !");

        simpleApp.input().setValue("Tony");
        Assert.assertEquals(simpleApp.output(), "Hello Tony!");
    }
}
