const path = require('path');
const config = require(path.join(__dirname, '..', '..', 'core', 'config.js'));
const Module = require(path.join(__dirname, '..', '..', 'core', 'module.js'));
const fs = require('fs');

let templateSwitcherDesktop = 'switcher_desktop.html';
if (fs.existsSync(path.join(__dirname, 'views', 'custom_' + templateSwitcherDesktop))) {
    templateSwitcherDesktop = 'custom_' + templateSwitcherDesktop;
}
let templateSwitcherMobile = 'switcher_mobile.html';
if (fs.existsSync(path.join(__dirname, 'views', 'custom_' + templateSwitcherMobile))) {
    templateSwitcherMobile = 'custom_' + templateSwitcherMobile;
}

module.exports = function(app) {
    const render = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, 'views'), app);

    const switcherAsync = async(req, type, mobile) => {
        if (!req) {
            return '';
        }
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        let html = await render.file(mobile ? templateSwitcherMobile : templateSwitcherDesktop, {
            locale: locale,
            locales: config.i18n.locales,
            names: config.i18n.localeNames,
            type: type,
            urls: config.website.url,
            originalUrl: req.originalUrl || '',
            protocol: config.website.protocol
        });;
        return html;
    };

    const switcherDesktopQuery = (data, callback) => {
        switcherAsync(data, 'query').then(function(html) {
            callback(null, html);
        });
    };

    const switcherDesktopSubdomain = (data, callback) => {
        switcherAsync(data, 'subdomain').then(function(html) {
            callback(null, html);
        });
    };

    const switcherMobileQuery = (data, callback) => {
        switcherAsync(data, 'query', true).then(function(html) {
            callback(null, html);
        });
    };

    const switcherMobileSubdomain = (data, callback) => {
        switcherAsync(data, 'subdomain', true).then(function(html) {
            callback(null, html);
        });
    };

    return {
        filters: {
            switcherDesktopQuery: switcherDesktopQuery,
            switcherDesktopSubdomain: switcherDesktopSubdomain,
            switcherMobileQuery: switcherMobileQuery,
            switcherMobileSubdomain: switcherMobileSubdomain
        }
    };
};