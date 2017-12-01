const path = require('path');
const config = require(path.join(__dirname, '..', '..', 'core', 'config.js'));
let configModule;
try {
    configModule = require(path.join(__dirname, 'config', 'catalog.json'));
} catch (e) {
    configModule = require(path.join(__dirname, 'config', 'catalog.dist.json'));
}
const Module = require(path.join(__dirname, '..', '..', 'core', 'module.js'));
const Router = require('co-router');

module.exports = function(app) {
    const i18n = new(require(path.join(__dirname, '..', '..', 'core', 'i18n.js')))(path.join(__dirname, 'lang'), app);
    const renderAuth = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, 'views'), app);
    const renderRoot = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, '..', '..', 'views'), app);

    const list = async(req, res) => {
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        let filters = app.get('templateFilters');
        renderRoot.setFilters(filters);
        let registerHTML = await renderAuth.file('catalog.html', {
            i18n: i18n.get(),
            locale: locale,
            lang: JSON.stringify(i18n.get().locales[locale]),
            prefix: configModule.prefix,
            config: config
        });
        let html = await renderRoot.template(req, i18n, locale, i18n.get().__(locale, 'Catalog'), {
            content: registerHTML,
            extraCSS: config.production ? ['/warehouse/static/css/catalog.min.css'] : ['/warehouse/static/css/catalog.css'],
            extraJS: config.production ? ['/warehouse/static/js/catalog.min.js'] : ['/warehouse/static/js/catalog.js']
        });
        res.send(html);
    };

    app.use(configModule.prefix + '/static', app.get('express').static(path.join(__dirname, 'static')));
    let router = Router();
    router.get('/', list);
    return {
        routes: router
    };
};