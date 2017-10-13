const moduleId = 'updates';
const moduleURL = '/admin/updates';

const path = require('path');
const config = require(path.join(__dirname, '..', '..', 'core', 'config.js'));
const Module = require(path.join(__dirname, '..', '..', 'core', 'module.js'));
const Router = require('co-router');

module.exports = function(app) {
    const i18n = new(require(path.join(__dirname, '..', '..', 'core', 'i18n.js')))(path.join(__dirname, 'lang'), app);
    const panel = new(require(path.join(__dirname, '..', '..', 'core', 'panel.js')))(app);
    const render = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, 'views'), app);
    const updates = async(req, res, next) => {
        try {
            if (!Module.isAuthorizedAdmin(req)) {
                Module.logout(req);
                return res.redirect(303, (config.website.authPrefix || '/auth')  + '?redirect=' + moduleURL + '&rnd=' + Math.random().toString().replace('.', ''));
            }
            const locale = req.session.currentLocale;
            let html = await render.file('updates.html', {
                i18n: i18n.get(),
                config: config,
                dirname: path.join(__dirname, '..', '..'),
                locale: locale,
                lang: JSON.stringify(i18n.get().locales[locale])
            });
            res.send(await panel.html(req, moduleId, i18n.get().__(locale, 'title'), html, config.production ? ['/updates/static/css/updates.min.css'] : ['/updates/static/css/updates.css'],
                config.production ? ['/updates/static/js/updates.min.js'] : ['/updates/static/js/updates.js']));
        } catch (e) {
            next(new Error(e.message));
        }
    };
    app.use('/updates/static', app.get('express').static(path.join(__dirname, 'static')));
    let router = Router();
    router.get('/', updates);
    return {
        routes: router,
        info: {
            id: moduleId,
            url: moduleURL,
            title: Module.getTitles(i18n),
            icon: 'refresh'
        }
    };
};