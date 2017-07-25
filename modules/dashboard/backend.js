const moduleId = 'dashboard',
    moduleURL = '/admin';

const path = require('path'),
    config = require(path.join(__dirname, '..', '..', 'etc', 'config.js')),
    Module = require(path.join(__dirname, '..', '..', 'core', 'module.js')),
    Router = require('co-router'),
    os = require('os');

module.exports = function(app) {
    const i18n = new(require(path.join(__dirname, '..', '..', 'core', 'i18n.js')))(path.join(__dirname, 'lang'), app),
        panel = new(require(path.join(__dirname, '..', '..', 'core', 'panel.js')))(app),
        render = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, 'views'), undefined, app);

    let dashboard = async(req, res, next) => {
        try {
            if (!Module.isAuthorizedAdmin(req)) {
                Module.logout(req);
                return res.redirect(303, '/auth?redirect=' + moduleURL + '&rnd=' + Math.random().toString().replace('.', ''));
            }            
            const locale = req.session.currentLocale;
            let html = await render.file('dashboard.html', {
                i18n: i18n.get(),
                config: config,
                locale: locale,
                os: os
            });
            res.send(await panel.html(req, moduleId, i18n.get().__(locale, 'title'), html));
        } catch (e) {
            next(new Error(e.message));
        }
    };

    let router = Router();
    router.get('/', dashboard);
    return {
        routes: router,
        info: {
            id: moduleId,
            url: moduleURL,
            title: Module.getTitles(i18n),
            icon: 'cog'
        }
    }
}
