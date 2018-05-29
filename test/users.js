const { Builder, By, Key, until } = require('selenium-webdriver');

(async function example() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        await driver.manage().window().maximize();
        await driver.get('http://127.0.0.1:3000/auth?redirect=/admin/users');
        await driver.wait(until.titleIs('Log in | Example Website powered by Zoia Web Framework'), 5000);
        await driver.wait(until.elementLocated(By.id('zoiaAuth_username')), 5000);
        await driver.findElement(By.id('zoiaAuth_username')).sendKeys('admin');
        await driver.findElement(By.id('zoiaAuth_password')).sendKeys('admin', Key.RETURN);
        await driver.wait(until.titleIs('Users | Admin Panel'), 5000);
        await driver.wait(until.elementLocated(By.className('zoiaAddD')), 5000);
        await driver.findElement(By.className('zoiaAddD')).click();
        await driver.wait(until.elementLocated(By.id('editForm_username')), 5000);
        await driver.findElement(By.id('editForm_username')).sendKeys('test');
        await driver.findElement(By.id('editForm_email')).sendKeys('test@zoia.org');
        await driver.findElement(By.id('editForm_password')).sendKeys('TestTest');
        await driver.findElement(By.id('editForm_passwordConfirm')).sendKeys('TestTest');
        await driver.findElement(By.css('.editForm-groups-cbx[data="admin"]')).click();
        await driver.executeScript('$("#editForm_btnSave").click();');
        await driver.wait(until.elementLocated(By.className('za-notification-message-success')), 5000);
        await driver.wait(until.elementLocated(By.xpath('//*[@id="users"]/tbody/tr[2]/td[2]'), 5000));
        await driver.wait(until.elementLocated(By.xpath('//*[@id="users"]/tbody/tr[2]/td[6]/button[1]'), 5000));
        const id = await driver.executeScript('return $("#users>tbody>tr:nth-child(2)>td:nth-child(6)>.zoia-users-action-edit-btn").attr("data");');
        await driver.get(`http://127.0.0.1:3000/admin/users?action=edit&id=${id}`);
        await driver.wait(until.elementLocated(By.id('editForm_username')), 5000);
        await driver.findElement(By.id('editForm_username')).clear();
        await driver.findElement(By.id('editForm_username')).sendKeys('test2');
        await driver.findElement(By.id('editForm_email')).clear();
        await driver.findElement(By.id('editForm_email')).sendKeys('test2@zoia.org');
        await driver.findElement(By.id('editForm_password')).clear();
        await driver.findElement(By.id('editForm_password')).sendKeys('Test2Test2');
        await driver.findElement(By.id('editForm_passwordConfirm')).clear();
        await driver.findElement(By.id('editForm_passwordConfirm')).sendKeys('Test2Test2');
        await driver.findElement(By.css('.editForm-groups-cbx[data="admin"]')).click();
        await driver.findElement(By.id('editForm_username')).sendKeys(Key.RETURN);
        await driver.wait(until.elementLocated(By.className('za-notification-message-success')), 5000);
        await driver.get(`http://127.0.0.1:3000/admin/users`);
        await driver.wait(until.elementLocated(By.xpath('//*[@id="users"]/tbody/tr[2]/td[6]/button[2]'), 5000));
        await driver.findElement(By.xpath('//*[@id="users"]/tbody/tr[2]/td[6]/button[2]')).sendKeys(Key.SPACE);
        await driver.wait(until.elementLocated(By.id('zoiaDeleteDialogButton')), 5000);        
        /*await driver.findElement(By.xpath('//*[@id="users"]/tbody/tr[2]/td[1]/input')).sendKeys(Key.SPACE);
        await driver.findElement(By.className('zoiaDeleteButton')).click();
        await driver.wait(until.elementLocated(By.id('zoiaDeleteDialogButton')), 5000);
        await driver.findElement(By.id('zoiaDeleteDialogButton')).click();
        await driver.wait(until.elementLocated(By.className('za-notification-message-success')), 5000);*/
    } catch (e) {
        console.log(e);
    } finally {
        //await driver.quit();
        console.log('Done.');
    }
})();