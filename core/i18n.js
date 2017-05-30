const path = require('path'),
    config = require(path.join(__dirname, '..', 'etc', 'config.js'));

module.exports = class I18N {
    constructor(dir, app) {
        if (app) { this.app = app; }
        this.i18n = new(require('i18n-2'))({
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
        if (config.i18n.detect.subdomain) { this.i18n.setLocaleFromSubdomain(request); }
        if (config.i18n.detect.query) { this.i18n.setLocaleFromQuery(request); }
        if (config.i18n.detect.cookie) { this.i18n.setLocaleFromCookie(request) }
    }
    get() {
        return this.i18n;
    }
}
