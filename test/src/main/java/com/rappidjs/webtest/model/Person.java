package com.rappidjs.webtest.model;

/**
 * User: tony
 * Date: 27.10.13
 * Time: 13:08
 */
public class Person {

    private String firstName = "";
    private String lastName = "";
    private String phone = "";

    public Person(String firstName, String lastName, String phone) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getPhone() {
        return phone;
    }

    public String getFullname() {
        return String.format("%s %s", firstName, lastName);
    }

}
