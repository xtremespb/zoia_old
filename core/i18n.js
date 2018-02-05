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
    detectLanguage(request) {
        if (!this.i18n || !request) {
            return;
        }
        let detected = false;
        if (config.i18n.detect.subdomain) {
            this.i18n.setLocaleFromSubdomain(request);
            detected = true;
        }
        if (config.i18n.detect.query) {
            // this.i18n.setLocaleFromQuery(request);
            if (request.query && request.query.lang && typeof request.query.lang === 'string' && request.query.lang.match(/^[a-z]{2}$/)) {
                this.i18n.setLocale(request.query.lang);
                detected = true;
            }
        }
        if (config.i18n.detect.cookie) {
            this.i18n.setLocaleFromCookie(request);
            detected = true;
        }
        let newLocale = this.i18n.getLocale();
        if (!detected && request.session && request.session.currentLocale) {
            newLocale = request.session.currentLocale;
        }
        return (newLocale);
    }
    get() {
        return this.i18n;
    }
};