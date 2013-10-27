package com.rappidjs.webtest;

import io.rappid.webtest.common.WebTest;

/**
 * User: tony
 * Date: 26.10.13
 * Time: 17:03
 */
public class RappidJsWebTest extends WebTest {

    protected IndexPage getIndexPage() {
        driver().get(getStartUrl());
        return new IndexPage();
    }

    @Override
    public String getStartUrl() {
        return getParameter("startUrl");
    }
}
