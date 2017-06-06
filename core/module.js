const MongoClient = require('mongodb').MongoClient,
    co = require('co'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    path = require('path'),
    config = require(path.join(__dirname, '..', 'etc', 'config.js'));

module.exports = class Module {
    constructor(app) {
        this.app = app;
    }
    static getTitles(i18n) {
        let titles = {};
        for (let i in config.i18n.locales) {
            titles[config.i18n.locales[i]] = i18n.get().__(config.i18n.locales[i], 'title');
        }
        return titles;
    }
    static checkRequest(req, data) {
        let result = {};
        for (const key in data) {
            const item = data[key];
            result[key] = {};
            let field = req.body[key] || req.query[key];
            result[key].success = false;
            // Check if field exists
            if (item.mandatory && !field) {
                result[key].errorCode = 1;
                continue;
            }
            // Check field length
            if (item.length) {
                if (item.length.min && field.length < item.length.min) {
                    result[key].errorCode = 2;
                    continue;
                }
                if (item.length.max && field.length > item.length.max) {
                    result[key].errorCode = 3;
                    continue;
                }
            }
            // Check field type
            if (item.type) {
                if (typeof field != item.type) {
                    result[key].errorCode = 4;
                    continue;
                }
            }
            // Process value with function
            if (item.process) {
                field = item.process(field);
            }
            // Check regexp
            if (item.regexp) {
                if (!field.match(item.regexp)) {
                    result[key].errorCode = 5;
                    continue;
                }
            }
            // Finally, no errors
            result[key].value = field;
            result[key].success = true;
        }
        return result;
    }
    static getCheckRequestFailedFields(data) {
        let result = [];
        for (const key in data) {
            let item = data[key];
            if (!item.success) {
                result.push(key);
            }
        }
        return result;
    }
}
