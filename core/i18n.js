const path = require('path');
const config = require(path.join(__dirname, 'config.js'));

module.exports = class I18N {
    constructor(dir, app) {
        if (app) {
            this.app = app;
        }
        this.i18n = new(require(path.join(__dirname, 'modules', 'i18n.js')))({
            locales: config.i18n.locales,
            cookieName: config.i18n.cookieName,
            directory: dir,
            extension: '.json',
            devMode: config.i18n.dev
        });
    }
    detectLanguage(req) {
        if (!this.i18n || !req) {
            return;
        }
        let detected = false;
        if (config.i18n.detect.subdomain) {
            this.i18n.setLocaleFromSubdomain(req);
            detected = true;
        }
        if (config.i18n.detect.query) {
            // this.i18n.setLocaleFromQuery(req);
            if (req.query && req.query.lang && typeof req.query.lang === 'string' && req.query.lang.match(/^[a-z]{2}$/)) {
                this.i18n.setLocale(req.query.lang);
                detected = true;
            }
        }
        if (config.i18n.detect.cookie) {
            this.i18n.setLocaleFromCookie(req);
            detected = true;
        }
        if (config.i18n.detect.url) {
            const [dummy, lng] = req.url.split(/\//);
            if (!req.url.match(/^\/(api)/) && !req.url.match(/\/(static)\//)) {
                if (lng && lng.match(/^[a-z]{2}$/) && config.i18n.locales.indexOf(lng) > -1) {
                    this.i18n.setLocale(lng);
                } else {
                    this.i18n.setLocale(config.i18n.locales[0]);
                }
            } else {
                if (req.session.currentLocale) {
                    this.i18n.setLocale(req.session.currentLocale);
                }
            }
            detected = true;
        }
        let newLocale = this.i18n.getLocale();
        if (!detected && req.session && req.session.currentLocale) {
            newLocale = req.session.currentLocale;
        }
        return (newLocale);
    }
    getLanguageURLPrefix(req) {
        if (!this.i18n || !req || !config.i18n.detect.url) {
            return '';
        }
        const locale = req.session.currentLocale;
        if (locale !== config.i18n.locales[0]) {
            return '/' + locale;
        }
        return '';
    }
    get() {
        return this.i18n;
    }
};