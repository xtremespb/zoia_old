const path = require('path');
const config = require(path.join(__dirname, '..', '..', 'etc', 'config.js'));
const Module = require(path.join(__dirname, '..', '..', 'core', 'module.js'));

module.exports = function(app) {
    const i18n = new(require(path.join(__dirname, '..', '..', 'core', 'i18n.js')))(path.join(__dirname, 'lang'), app);
    const render = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, '..', '..', 'views'), undefined, app);
    const db = app.get('db');

    const navigationAsync = async(req) => {
        if (!req) {
            return '';
        }
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        let html = await db.collection('registry').findOne({ name: 'navigation_html_' + locale });
        return html ? html.data : '';
    };

    const navigation = (data, callback) => {
        navigationAsync(data).then(function(html) {
            callback(null, html);
        });
    };

    const breadcrumbsAsync = async(lng) => {
        if (!lng) {
            return '';
        }
        let html = await db.collection('registry').findOne({ name: 'navigation_html_' + lng });
        return html ? html.data : '';
    };

    const breadcrumbs = (data, callback) => {
        navigationAsync(data).then(function(html) {
            callback(null, html);
        });
    };

    return {
        filters: {
            navigation: navigation,
            breadcrumbs: breadcrumbs
        }
    };
};