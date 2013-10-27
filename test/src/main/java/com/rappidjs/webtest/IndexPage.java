package com.rappidjs.webtest;

import com.rappidjs.webtest.module.HomeModule;
import io.rappid.webtest.common.PageObject;
import org.openqa.selenium.By;

/**
 * User: tony
 * Date: 27.10.13
 * Time: 10:34
 */
public class IndexPage extends PageObject {
    @Override
    protected void validate() {
    }

    public HomeModule getHomeModule() {
        return new HomeModule();
    }
}
