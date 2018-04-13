const path = require('path');
const config = require(path.join(__dirname, '..', '..', 'core', 'config.js'));
const Module = require(path.join(__dirname, '..', '..', 'core', 'module.js'));
const fs = require('fs');

let templateSwitcher = 'switcher.html';
if (fs.existsSync(path.join(__dirname, 'views', 'custom_' + templateSwitcher))) {
    templateSwitcher = 'custom_' + templateSwitcher;
}

module.exports = function(app) {
    const render = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, 'views'), app);

    const switcherAsync = async(req, type) => {
        if (!req) {
            return '';
        }
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        let html = await render.file(templateSwitcher, {
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

    const switcherQuery = (data, callback) => {
        switcherAsync(data, 'query').then(function(html) {
            callback(null, html);
        });
    };

    const switcherSubdomain = (data, callback) => {
        switcherAsync(data, 'subdomain').then(function(html) {
            callback(null, html);
        });
    };

    return {
        filters: {
            switcherQuery: switcherQuery,
            switcherSubdomain: switcherSubdomain
        }
    };
};