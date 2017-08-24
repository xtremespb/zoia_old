const webdriver = require('selenium-webdriver');
const by = webdriver.By;
const until = webdriver.until;
const driver = new webdriver.Builder().forBrowser('chrome').build();
const assert = require('assert');
const timeout = 3000;
const path = require('path');
const helpers = require(path.join(__dirname, '..', 'helpers.js'));

driver.manage().window().setSize(1280, 720);

const test = async() => {
    try {
        await driver.get('http://127.0.0.1:3000/admin');
        let title = await driver.getTitle();
        assert.ok(~title.indexOf('Log in'), 'Wrong title!');
        let fieldAuthUsername = await driver.findElement(by.id('zoiaAuth_username'));
        await fieldAuthUsername.sendKeys('admin');
        let fieldAuthPassword = await driver.findElement(by.id('zoiaAuth_password'));
        await fieldAuthPassword.sendKeys('admin');
        let fieldAuthCaptcha = await driver.findElement(by.id('zoiaAuth_captcha'));
        await fieldAuthCaptcha.sendKeys('1111');
        let btnAuthSave = await driver.findElement(by.id('zoiaAuth_btnSave'));
        await helpers.click(btnAuthSave, driver);
        await driver.wait(until.elementLocated(by.id('zoiaDashboardHeader')), timeout);
        let header = await driver.findElement(by.id('zoiaDashboardHeader'));
        let headerText = await header.getText();
        assert.equal(headerText, 'Dashboard', 'Header not found');
        driver.close();
        console.log('OK');
    } catch (e) {
        driver.close();
        console.log('Error: ' + e);
    }
};

test();