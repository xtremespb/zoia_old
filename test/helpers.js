const _delay = (i) => {
    return new Promise(function(resolve) {
        setTimeout(resolve, i);
    });
};

module.exports = {
    click: async(el, driver) => {
        await _delay(300);
        await driver.actions().mouseDown(el).mouseMove(el).mouseUp(el).perform();
    },
    waitForItem: async(element, driver) => {
        await _delay(300);
        let counter = 0;
        while (true) {
            try {
                let item = await driver.findElement(element);
                break;
            } catch (e) {
                counter++;
                await _delay(200);
                if (counter > 10) {
                    throw new Error('Timeout');
                }
            }
        }
    },
    waitForValue: async(element, value, driver) => {
        await _delay(300);
        let counter = 0;
        while (true) {
            try {
                let item = await driver.findElement(element);
                let val = await item.getText();
                if (val === value) {
                    break;
                }
            } catch (e) {
                counter++;
                await _delay(200);
                if (counter > 10) {
                    throw new Error('Timeout');
                }
            }
        }
    },
    waitForDisappear: async(element, driver) => {
        await _delay(300);
        let counter = 0;
        while (true) {
            try {
                let item = await driver.findElement(element);                
                counter++;
                await _delay(200);
                if (counter > 10) {
                    throw new Error('Timeout');
                }
            } catch (e) {
                break;
            }
        }
    }
};