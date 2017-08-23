const webdriver = require('selenium-webdriver');
const by = webdriver.By;
const until = webdriver.until;
const driver = new webdriver.Builder().forBrowser('chrome').build();
const assert = require('assert');
const timeout = 3000;

driver.manage().window().setSize(1280, 720);

const _click = (el) => {
    driver.actions().mouseDown(el).mouseMove(el).mouseUp(el).perform();
};

const _delay = (i) => {
    return new Promise(function(resolve) {
        setTimeout(resolve, i);
    });
}

const test = async() => {
    try {
        await driver.get('http://127.0.0.1:3000/admin/users');
        let title = await driver.getTitle();
        assert.ok(~title.indexOf('Log in'), 'Wrong title!');
        let fieldAuthUsername = await driver.findElement(by.id('zoiaAuth_username'));
        await fieldAuthUsername.sendKeys('admin');
        let fieldAuthPassword = await driver.findElement(by.id('zoiaAuth_password'));
        await fieldAuthPassword.sendKeys('admin');
        let fieldAuthCaptcha = await driver.findElement(by.id('zoiaAuth_captcha'));
        await fieldAuthCaptcha.sendKeys('1111');
        let btnAuthSave = await driver.findElement(by.id('zoiaAuth_btnSave'));
        _click(btnAuthSave);
        driver.wait(until.elementLocated(by.id('wrapTable')), timeout);
        let btnZoiaAdd = await driver.findElement(by.className('zoiaAddD'));
        _click(btnZoiaAdd);
        driver.wait(until.elementLocated(by.id('editDialogHeader')), timeout);
        driver.wait(until.elementLocated(by.id('editForm_username')), timeout);
        let fieldEditUsername = await driver.findElement(by.id('editForm_username'));
        await fieldEditUsername.sendKeys('test1');
        let fieldEditEmail = await driver.findElement(by.id('editForm_email'));
        await fieldEditEmail.sendKeys('test1@domain.org');
        let fieldEditPassword = await driver.findElement(by.id('editForm_password'));
        await fieldEditPassword.sendKeys('12345');
        let fieldEditPasswordConfirm = await driver.findElement(by.id('editForm_passwordConfirm'));
        await fieldEditPasswordConfirm.sendKeys('12345');
        let fieldEditStatus = await driver.findElement(by.id('editForm_status'));
        await fieldEditStatus.sendKeys('Disabled');
        let btnEditSave = await driver.findElement(by.id('editForm_btnSave'));
        _click(btnEditSave);
        driver.wait(until.elementLocated(by.xpath('//*[@id="users"]/tbody/tr[2]/td[2]')), timeout);
        let usersTableCell22 = await driver.findElement(by.xpath('//*[@id="users"]/tbody/tr[2]/td[2]'));
        let addedUsername = await usersTableCell22.getText();
        assert.equal(addedUsername, 'test1', 'User not added');
        let usersTableCell23 = await driver.findElement(by.xpath('//*[@id="users"]/tbody/tr[2]/td[3]'));
        let addedEmail = await usersTableCell23.getText();
        assert.equal(addedEmail, 'test1@domain.org', 'E-mail not added');
        let usersTableCell24 = await driver.findElement(by.xpath('//*[@id="users"]/tbody/tr[2]/td[4]'));
        let addedStatus = await usersTableCell24.getText();
        assert.equal(addedStatus, 'Disabled', 'Status not added');
        let btnZoiaDelete = await driver.findElement(by.xpath('//*[@id="users"]/tbody/tr[2]/td[5]/button[2]'));
        _click(btnZoiaDelete);
        driver.wait(until.elementLocated(by.id('zoiaDeleteDialogButton'), timeout));
        let zoiaDeleteDialogButton = await driver.findElement(by.id('zoiaDeleteDialogButton'));
        _click(zoiaDeleteDialogButton);

    } catch (e) {
        console.log('Error: ' + e);
    }
};

test();