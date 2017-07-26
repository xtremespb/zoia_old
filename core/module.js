const path = require('path');
const config = require(path.join(__dirname, '..', 'etc', 'config.js'));

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
    static isAuthorized(req) {
        if (req && req.session && req.session.auth && req.session.auth._id) {
            return true;
        }
        return false;
    }
    static isAuthorizedAdmin(req) {
        if (req && req.session && req.session.auth && req.session.auth._id && req.session.auth.status && String(req.session.auth.status) === '2') {
            return true;
        }
        return false;
    }
    static logout(req) {
        if (req && req.session) {
            req.session.auth = undefined;
        }
    }
};