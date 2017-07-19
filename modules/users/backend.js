const moduleId = 'users',
    moduleURL = '/admin/users';

const path = require('path'),
    config = require(path.join(__dirname, '..', '..', 'etc', 'config.js')),
    Module = require(path.join(__dirname, '..', '..', 'core', 'module.js')),
    Router = require('co-router');

module.exports = function(app) {
    const i18n = new(require(path.join(__dirname, '..', '..', 'core', 'i18n.js')))(path.join(__dirname, 'lang'), app),
        panel = new(require(path.join(__dirname, '..', '..', 'core', 'panel.js')))(app),
        render = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, 'views'), undefined, app);

    let list = async(req, res, next) => {
        try {
            if (!Module.isAuthorizedAdmin(req)) {
                return res.redirect(303, '/auth?redirect=' + moduleURL + '&rnd=' + Math.random().toString().replace(".", ""));
            }
            const locale = req.session.currentLocale;
            let html = await render.file('users.html', {
                i18n: i18n.get(),
                config: config,
                locale: locale,
                lang: JSON.stringify(i18n.get().locales[locale])
            });
            res.send(await panel.html(req, moduleId, i18n.get().__(locale, 'title'), html, ['/users/static/css/users.css'], ['/zoia/core/js/jquery.zoiaFormBuilder.js', '/zoia/core/js/jquery.zoiaTable.js', '/zoia/core/js/shared.js', '/users/static/js/users.js']));
        } catch (e) {
            next(new Error(e.message));
        }
    };

    app.use('/users/static', app.get('express').static(path.join(__dirname, 'static')));

    let router = Router();
    router.get('/', list);
    return {
        routes: router,
        info: {
            id: moduleId,
            url: moduleURL,
            title: Module.getTitles(i18n),
            icon: 'user'
        }
    }
}
