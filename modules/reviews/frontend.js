const path = require('path');
const config = require(path.join(__dirname, '..', '..', 'core', 'config.js'));
const Router = require('co-router');
const fs = require('fs');
const Module = require(path.join(__dirname, '..', '..', 'core', 'module.js'));

const moduleURL = '/reviews';
let templateList = 'frontend.html';
if (fs.existsSync(path.join(__dirname, 'views', 'custom_' + templateList))) {
    templateList = 'custom_' + templateList;
}

let configModule;
try {
    configModule = require(path.join(__dirname, 'config', 'reviews.json'));
} catch (e) {
    configModule = require(path.join(__dirname, 'config', 'reviews.dist.json'));
}

module.exports = function(app) {
    const i18n = new(require(path.join(__dirname, '..', '..', 'core', 'i18n.js')))(path.join(__dirname, 'lang'), app);
    const db = app.get('db');
    const renderReviews = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, 'views'), app);
    const renderRoot = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, '..', '..', 'views'), app);

    const list = async(req, res, next) => {
        if (!Module.isAuthorized(req)) {
            return res.redirect(303, (config.website.authPrefix || '/auth') + '?redirect=' + moduleURL + '&_=' + Math.random().toString().replace('.', ''));
        }
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        let filters = app.get('templateFilters');
        renderRoot.setFilters(filters);
        let page = req.query.page;
        if (!page || typeof page !== 'string' || !parseInt(page, 10) || parseInt(page, 10) < 1) {
            page = 1;
        } else {
            page = parseInt(page);
        }
        const skip = (page - 1) * configModule.itemsPerPage;
        try {
            const total = await db.collection('reviews').find({ status: '1' }).count();
            const items = await db.collection('reviews').find({ status: '1' }, { skip: skip, limit: configModule.itemsPerPage, sort: { timestamp: -1 } }).toArray();
            let nextpage = null;
            if (total - skip > configModule.itemsPerPage) {
                nextpage = page + 1;
            }
            let listHTML = await renderReviews.file(templateList, {
                i18n: i18n.get(),
                locale: locale,
                lang: JSON.stringify(i18n.get().locales[locale]),
                config: config,
                total: total,
                nextpage: nextpage,
                items: items
            });
            let html = await renderRoot.template(req, i18n, locale, i18n.get().__(locale, 'Reviews'), {
                content: listHTML,
                extraCSS: config.production ? ['/reviews/static/css/frontend.min.css'] : ['/reviews/static/css/frontend.css'],
                extraJS: config.production ? ['/reviews/static/js/frontend.min.js'] : ['/reviews/static/js/frontend.js']
            });
            res.send(html);
        } catch (e) {
            log.error(e);
            return next();
        }
    };

    let router = Router();
    router.get('/', list);

    return {
        routes: router
    };
};