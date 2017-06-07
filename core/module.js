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
}
