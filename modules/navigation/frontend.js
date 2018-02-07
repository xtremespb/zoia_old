const path = require('path');
const config = require(path.join(__dirname, '..', '..', 'core', 'config.js'));
const Module = require(path.join(__dirname, '..', '..', 'core', 'module.js'));

module.exports = function(app) {
    const i18n = new(require(path.join(__dirname, '..', '..', 'core', 'i18n.js')))(path.join(__dirname, 'lang'), app);
    const render = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, '..', '..', 'views'), app);
    const db = app.get('db');

    const navigationAsync = async(req, prefix) => {
        if (!req) {
            return '';
        }
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        let html = await db.collection('navigation').findOne({ name: 'navigation_html_' + prefix + '_' + locale });
        return html ? html.data : '';
    };

    const navigationDesktop = (data, callback) => {
        navigationAsync(data, 'd').then(function(html) {
            callback(null, html);
        });
    };

    const navigationMobile = (data, callback) => {
        navigationAsync(data, 'm').then(function(html) {
            callback(null, html);
        });
    };

    return {
        filters: {
            navigationDesktop: navigationDesktop,
            navigationMobile: navigationMobile,
        }
    };
};