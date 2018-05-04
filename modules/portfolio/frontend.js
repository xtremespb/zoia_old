const path = require('path');
const config = require(path.join(__dirname, '..', '..', 'core', 'config.js'));
const Router = require('co-router');
const fs = require('fs-extra');
const Module = require(path.join(__dirname, '..', '..', 'core', 'module.js'));

let templateFrontend = 'frontend.html';
if (fs.existsSync(path.join(__dirname, 'views', 'custom_' + templateFrontend))) {
    templateFrontend = 'custom_' + templateFrontend;
}
let templateFrontendItem = 'frontend_item.html';
if (fs.existsSync(path.join(__dirname, 'views', 'custom_' + templateFrontendItem))) {
    templateFrontendItem = 'custom_' + templateFrontendItem;
}

const files = fs.readdirSync(path.join(__dirname, 'data'));
let portfolioData = [];
for (let i in files) {
    let json = require(path.join(__dirname, 'data', files[i]));
    json.id = files[i].replace(/\.json$/, '');
    portfolioData.push(json);
}
portfolioData.sort(function(a, b) {
    return (a.year > b.year) ? -1 : ((b.year > a.year) ? 1 : 0);
}); 

module.exports = function(app) {
    const i18n = new(require(path.join(__dirname, '..', '..', 'core', 'i18n.js')))(path.join(__dirname, 'lang'), app);
    const renderPF = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, 'views'), app);
    const renderRoot = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, '..', '..', 'views'), app);
    const log = app.get('log');

    const frontend = async(req, res, next) => {
        const uprefix = i18n.getLanguageURLPrefix(req);
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        let filters = app.get('templateFilters');
        renderRoot.setFilters(filters);
        try {
            let portfolioHTML = await renderPF.file(templateFrontend, {
                i18n: i18n.get(),
                locale: locale,
                lang: JSON.stringify(i18n.get().locales[locale]),
                config: config,
                uprefix: uprefix,
                portfolioData: portfolioData
            });
            let html = await renderRoot.template(req, i18n, locale, i18n.get().__(locale, 'Portfolio'), {
                content: portfolioHTML,
                extraCSS: config.production ? ['/portfolio/static/css/frontend.min.css'] : ['/portfolio/static/css/frontend.css'],
                extraJS: []
            });
            res.send(html);
        } catch (e) {
            log.error(e);
            return next();
        }
    };

    const frontendItem = async(req, res, next) => {
        const id = req.params.id;
        if (!id || typeof id !== 'string' || !id.match(/^[A-Za-z0-9_\-\.]{1,64}$/) ||
            files.indexOf(id + '.json') === -1) {
            return next();
        }
        let data = {};
        for (let i in portfolioData) {
            if (portfolioData[i].id === id) {
                data = portfolioData[i];
                break;
            }
        }
        const uprefix = i18n.getLanguageURLPrefix(req);
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        let filters = app.get('templateFilters');
        renderRoot.setFilters(filters);
        try {
            let portfolioHTML = await renderPF.file(templateFrontendItem, {
                i18n: i18n.get(),
                locale: locale,
                lang: JSON.stringify(i18n.get().locales[locale]),
                config: config,
                uprefix: uprefix,
                item: data
            });
            let html = await renderRoot.template(req, i18n, locale, data.lang[locale].title || i18n.get().__(locale, 'Portfolio'), {
                content: portfolioHTML,
                extraCSS: config.production ? ['/portfolio/static/css/frontend_item.min.css'] : ['/portfolio/static/css/frontend_item.css'],
                extraJS: []
            });
            res.send(html);
        } catch (e) {
            log.error(e);
            return next();
        }
    };

    app.use('/portfolio/static', app.get('express').static(path.join(__dirname, 'static')));
    let router = Router();
    router.get('/', frontend);
    router.get('/:id', frontendItem);

    return {
        routes: router
    };
};