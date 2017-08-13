const path = require('path');
const config = require(path.join(__dirname, '..', '..', 'etc', 'config.js'));
const Module = require(path.join(__dirname, '..', '..', 'core', 'module.js'));
const Router = require('co-router');

module.exports = function(app) {
    const i18n = new(require(path.join(__dirname, '..', '..', 'core', 'i18n.js')))(path.join(__dirname, 'lang'), app);    
    const db = app.get('db');
    const render = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, '..', '..', 'views'), undefined, app);

    const content = async(req, res, next) => {        
        render.setFilters(app.get('templateFilters'));
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        const urlParts = req.params[0].split('/');
        urlParts.shift();
        for (let i in urlParts) {
            let item = urlParts[i];
            if (item.match(/ /) || item.match(/^[\^<>\/\:\"\\\|\?\*\x00-\x1f]+$/)) {
                return res.status(404);
            }
        }
        let url = urlParts.join('/');
        let filter = {
            status : 1,
            url: 1
        };
        filter[locale] = 1;
        let pageData = await db.collection('pages').findOne({ url: url }, filter);
        if (pageData && pageData[locale] && pageData[locale].title && pageData.status) {
            let html = await render.template(req, i18n, locale, pageData[locale].title || '', {
                content: pageData[locale].content || '',
                keywords: pageData[locale].keywords || '',
                description: pageData[locale].description || ''
            });
            return res.send(html);
        }
        return next();
    };

    let router = Router();
    router.get(/(.*)/, content);

    return {
        routes: router
    };
};