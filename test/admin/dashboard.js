const webdriver = require('selenium-webdriver');
const by = webdriver.By;
const driver = new webdriver.Builder().forBrowser('chrome').build();
const assert = require('assert');

const test = async() => {
    try {
        driver.get('http://127.0.0.1:3000/admin');
        await driver.findElement(by.id('zoiaAuth_username')).sendKeys('admin');
        await driver.findElement(by.id('zoiaAuth_password')).sendKeys('admin');
        await driver.findElement(by.id('zoiaAuth_captcha')).sendKeys('1111');
        await driver.findElement(by.id('zoiaAuth_btnSave')).click();
        assert.ok(await driver.findElement(by.xpath('/html/body/div[3]/div[2]/div/h1')).getText() === 'Dashboard', 'Could not load Dashboard');
        driver.close();
        console.log('Dashboard test OK');
    } catch (e) {
        driver.close();
        console.log('Dashboard test failed: ' + e);
    }
};

test();