const moduleId = 'navigation';
const moduleURL = '/admin/navigation';

const path = require('path');
const config = require(path.join(__dirname, '..', '..', 'etc', 'config.js'));
const Module = require(path.join(__dirname, '..', '..', 'core', 'module.js'));
const Router = require('co-router');

module.exports = function(app) {
    const i18n = new(require(path.join(__dirname, '..', '..', 'core', 'i18n.js')))(path.join(__dirname, 'lang'), app);
    const panel = new(require(path.join(__dirname, '..', '..', 'core', 'panel.js')))(app);
    const render = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, 'views'), undefined, app);
    const db = app.get('db');

    const navigation = async(req, res, next) => {
        try {
            if (!Module.isAuthorizedAdmin(req)) {
                Module.logout(req);
                return res.redirect(303, '/auth?redirect=' + moduleURL + '&rnd=' + Math.random().toString().replace('.', ''));
            }
            const locale = req.session.currentLocale;
            let defaultFolders = {};
            for (let i in config.i18n.locales) {
                defaultFolders[config.i18n.locales[i]] = new Array({ id: 'j1_1', text: '/', data: null, parent: '#', type: 'root' });
            }
            let folders = await db.collection('registry').findOne({ name: 'navigation' });
            let html = await render.file('navigation.html', {
                i18n: i18n.get(),
                config: config,
                locale: locale,
                lang: JSON.stringify(i18n.get().locales[locale]),
                langs: JSON.stringify(config.i18n.localeNames),
                folders: folders ? folders.data : JSON.stringify(defaultFolders)
            });
            res.send(await panel.html(req, moduleId, i18n.get().__(locale, 'title'), html, config.production ? ['/navigation/static/css/navigation.min.css'] : ['/zoia/3rdparty/jstree/themes/default/style.min.css', '/navigation/static/css/navigation.css'],
                config.production ? ['/navigation/static/js/navigation.min.js'] : ['/zoia/core/js/jquery.zoiaFormBuilder.js', '/zoia/3rdparty/jstree/jstree.min.js', '/navigation/static/js/navigation.js']));
        } catch (e) {
            next(new Error(e.message));
        }
    };

    app.use('/navigation/static', app.get('express').static(path.join(__dirname, 'static')));

    let router = Router();
    router.get('/', navigation);
    return {
        routes: router,
        info: {
            id: moduleId,
            url: moduleURL,
            title: Module.getTitles(i18n),
            icon: 'list'
        }
    };
};