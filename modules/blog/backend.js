const moduleId = 'blog';
const moduleURL = '/admin/blog';

const path = require('path');
const config = require(path.join(__dirname, '..', '..', 'core', 'config.js'));
const Module = require(path.join(__dirname, '..', '..', 'core', 'module.js'));
const Router = require('co-router');

module.exports = function(app) {
    const i18n = new(require(path.join(__dirname, '..', '..', 'core', 'i18n.js')))(path.join(__dirname, 'lang'), app);
    const panel = new(require(path.join(__dirname, '..', '..', 'core', 'panel.js')))(app);
    const render = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, 'views'), app);
    const db = app.get('db');

    const list = async(req, res, next) => {
        try {
            const uprefix = i18n.getLanguageURLPrefix(req);
            if (!Module.isAuthorizedAdmin(req)) {
                Module.logout(req);
                return res.redirect(303, (config.website.authPrefix ? uprefix + config.website.authPrefix : uprefix + '/auth') + '?redirect=' + uprefix + moduleURL + '&rnd=' + Math.random().toString().replace('.', ''));
            }
            const locale = req.session.currentLocale;
            let folders = await db.collection('blog_registry').findOne({ name: 'blogFolders' });
            let templatesHash = {};
            let templates = typeof config.website.templates === 'object' ? config.website.templates : [config.website.templates];
            for (let i in templates) {
            	templatesHash[templates[i]] = templates[i];
            }
            let html = await render.file('blog.html', {
                i18n: i18n.get(),
                config: config,
                locale: locale,
                templates: JSON.stringify(templatesHash),
                lang: JSON.stringify(i18n.get().locales[locale]),
                langs: JSON.stringify(config.i18n.localeNames),
                folders: folders ? folders.data : JSON.stringify([{ id: '1', text: '/', parent: '#', type: 'root' }])
            });
            res.send(await panel.html(req, moduleId, i18n.get().__(locale, 'title'), html, config.production ? ['/blog/static/css/blog.min.css'] : ['/zoia/3rdparty/jstree/themes/default/style.min.css', '/blog/static/css/blog.css'],
                config.production ? ['/zoia/3rdparty/ckeditor/ckeditor.js', '/zoia/3rdparty/ckeditor/adapters/jquery.js', '/blog/static/js/blog.min.js'] : ['/zoia/3rdparty/ckeditor/ckeditor.js', '/zoia/3rdparty/ckeditor/adapters/jquery.js',
                    '/zoia/core/js/jquery.zoiaFormBuilder.js', '/zoia/core/js/jquery.zoiaTable.js', '/zoia/3rdparty/jstree/jstree.min.js', '/blog/static/js/blog.js'
                ]));
        } catch (e) {
            next(new Error(e.message));
        }
    };

    app.use('/blog/static', app.get('express').static(path.join(__dirname, 'static')));

    let router = Router();
    router.get('/', list);
    return {
        routes: router,
        info: {
            id: moduleId,
            url: moduleURL,
            title: Module.getTitles(i18n),
            icon: 'pencil'
        }
    };
};