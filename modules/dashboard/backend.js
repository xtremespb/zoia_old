const moduleId = 'dashboard';
const moduleURL = '/admin';

const path = require('path');
const config = require(path.join(__dirname, '..', '..', 'core', 'config.js'));
const Module = require(path.join(__dirname, '..', '..', 'core', 'module.js'));
const Router = require('co-router');
const os = require('os');

module.exports = function(app) {
    const i18n = new(require(path.join(__dirname, '..', '..', 'core', 'i18n.js')))(path.join(__dirname, 'lang'), app);
    const panel = new(require(path.join(__dirname, '..', '..', 'core', 'panel.js')))(app);
    const render = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, 'views'), app);
    const dashboard = async(req, res, next) => {
        try {
            const uprefix = i18n.getLanguageURLPrefix(req);
            if (!Module.isAuthorizedAdmin(req)) {
                Module.logout(req);
                return res.redirect(303, (config.website.authPrefix ? uprefix + config.website.authPrefix : uprefix + '/auth') + '?redirect=' + uprefix + moduleURL + '&rnd=' + Math.random().toString().replace('.', ''));
            }
            const locale = req.session.currentLocale;
            let html = await render.file('dashboard.html', {
                i18n: i18n.get(),
                config: config,
                locale: locale,
                langs: JSON.stringify(config.i18n.locales),
                maintenanceEnabled: config.website.maintenance,
                os: os
            });
            res.send(await panel.html(req, moduleId, i18n.get().__(locale, 'title'), html, config.production ? ['/dashboard/static/css/dashboard.min.css'] : ['/dashboard/static/css/dashboard.css'],
                config.production ? ['/dashboard/static/js/dashboard.min.js'] : ['/dashboard/static/js/dashboard.js']));
        } catch (e) {
            next(new Error(e.message));
        }
    };
    app.use('/dashboard/static', app.get('express').static(path.join(__dirname, 'static')));
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
    };
};