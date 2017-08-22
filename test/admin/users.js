const webdriver = require('selenium-webdriver');
const by = webdriver.By;
const until = webdriver.until;
const driver = new webdriver.Builder().forBrowser('chrome').build();
const assert = require('assert');
const timeout = 3000;

const waitForElement = (target) => {
    driver.wait(function() {
        return driver.findElement(target).click().then(
            function(click) { return true },
            function(err) {
                if (err.name == 'StaleElementReferenceError') {
                    return false;
                } else {
                    throw err;
                }
            }
        );
    }, timeout);
};

const test = async() => {
    try {
        // Opening URL
        driver.get('http://127.0.0.1:3000/admin/users');
        waitForElement(by.id('zoiaAuth_username'));
        // Filling authorization fields
        await driver.findElement(by.id('zoiaAuth_username')).sendKeys('admin');
        await driver.findElement(by.id('zoiaAuth_password')).sendKeys('admin');
        await driver.findElement(by.id('zoiaAuth_captcha')).sendKeys('1111');
        await driver.wait(until.elementLocated(by.id('zoiaAuth_btnSave')), timeout);
        const btnAuthSave = await driver.findElement(by.id('zoiaAuth_btnSave'));
        await btnAuthSave.click();
        // Checking if Users module is open
        assert.ok(await driver.findElement(by.xpath('//*[@id="wrapTable"]/h1')).getText() === 'Users', 'Could not load Users');
        // Collecting buttons
        const zoiaAdd = await driver.findElement(by.className('zoiaAdd'));        
        // Clicking "Add" button
        await zoiaAdd.click();
        // Checking for Dialog window
        waitForElement(by.id('editDialogHeader'));
        // Trying to click Save button
        const btnEditSave = await driver.findElement(by.id('editForm_btnSave'));
        await btnEditSave.click();
        // Got error?
        assert.ok(await driver.findElement(by.id('editForm_username_error_text')).isDisplayed(), 'No error for username field displayed');
        assert.ok(await driver.findElement(by.id('editForm_email_error_text')).isDisplayed(), 'No error for e-mail field displayed');
        assert.ok(await driver.findElement(by.id('editForm_password_error_text')).isDisplayed(), 'No error for password field displayed');
        // Filling fields
        await driver.findElement(by.id('editForm_username')).sendKeys('test');
        await driver.findElement(by.id('editForm_email')).sendKeys('test@domain.com');
        await driver.findElement(by.id('editForm_password')).sendKeys('12345');
        await driver.findElement(by.id('editForm_passwordConfirm')).sendKeys('12345');
        // Clicking Save button
        await btnEditSave.click();
        // Waiting for item to appear in table
        await driver.wait(until.elementLocated(by.xpath('//*[@id="users"]/tbody/tr[2]/td[2]')), timeout);
        // Buttons
        const zoiaEdit = await driver.findElement(by.xpath('//*[@id="users"]/tbody/tr[2]/td[5]/button[1]'));
        const zoiaDelete = await driver.findElement(by.xpath('//*[@id="users"]/tbody/tr[2]/td[5]/button[2]'));
        // Checking fields
        assert.ok(await driver.findElement(by.xpath('//*[@id="users"]/tbody/tr[2]/td[2]')).getText() === 'test', 'Could not create user (bad username)');
        assert.ok(await driver.findElement(by.xpath('//*[@id="users"]/tbody/tr[2]/td[3]')).getText() === 'test@domain.com', 'Could not create user (bad e-mail)');
        assert.ok(await driver.findElement(by.xpath('//*[@id="users"]/tbody/tr[2]/td[4]')).getText() === 'Active', 'Could not create user (bad status)');
        // Clicking "Edit" button
        zoiaEdit.click();
        // Waiting for Edit Dialog
        await driver.wait(until.elementLocated(by.id('editDialogHeader')), timeout);
        // Clearing and filling fields
        await driver.findElement(by.id('editForm_username')).clear();
        await driver.findElement(by.id('editForm_username')).sendKeys('test1');
        await driver.findElement(by.id('editForm_email')).clear();
        await driver.findElement(by.id('editForm_email')).sendKeys('test@domain.com');
        // Clicking Save button
        await btnEditSave.click();
        // Waiting for item to appear in table
        waitForElement(by.xpath('//*[@id="users"]/tbody/tr[2]/td[2]'));
        // Checking fields
        assert.ok(await driver.findElement(by.xpath('//*[@id="users"]/tbody/tr[2]/td[2]')).getText() === 'test1', 'Could not create user (bad username)');
        assert.ok(await driver.findElement(by.xpath('//*[@id="users"]/tbody/tr[2]/td[3]')).getText() === 'test@domain.com', 'Could not create user (bad e-mail)');
        assert.ok(await driver.findElement(by.xpath('//*[@id="users"]/tbody/tr[2]/td[4]')).getText() === 'Active', 'Could not create user (bad status)');
        // Clicking "Delete" button
        await zoiaDelete.click();
        // Waiting for Delete Dialog
        driver.wait(until.elementLocated(by.xpath('//*[@id="zoiaDeleteDialog"]/div/div[1]/h2')), timeout);
        // Clicking Delete button
        const btnDeleteDialog = await driver.findElement(by.id('zoiaDeleteDialogButton'));
        await btnDeleteDialog.click();
        try {
            let text = await driver.findElement(by.xpath('//*[@id="users"]/tbody/tr[2]/td[2]')).getText();
            throw new Error('Could not delete user');
        } catch (e) {
            // It's OK
        }
        // Close driver
        driver.close();
        // Finally
        console.log('Users test OK');
    } catch (e) {
        // driver.close();
        console.log('Users test failed: ' + e);
    }
};

test();