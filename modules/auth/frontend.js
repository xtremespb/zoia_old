const path = require('path'),
    config = require(path.join(__dirname, '..', '..', 'etc', 'config.js')),
    Module = require(path.join(__dirname, '..', '..', 'core', 'module.js')),
    Router = require('co-router');

module.exports = function(app) {

    const i18n = new(require(path.join(__dirname, '..', '..', 'core', 'i18n.js')))(path.join(__dirname, 'lang'), app),
        renderAuth = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, 'views'), undefined, app),
        renderRoot = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, '..', '..', 'views'), undefined, app);

    let login = async function(req, res, next) {
        if (Module.isAuthorized(req)) {
            let url = req.query.redirect;
            if (!url || !url.match(/^[A-Za-z0-9-_.~\:\/\?#\[\]\@\!\$\&\'\(\)\*\+,;=]*$/) || url.length > 100) {
                url = '/';
            }
            return res.redirect(303, url);
        }
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        let url = req.query.redirect;
        if (!url || !url.match(/^[A-Za-z0-9-_.~\:\/\?#\[\]\@\!\$\&\'\(\)\*\+,;=]*$/) || url.length > 100) {
            url = '/';
        }
        let html = await renderAuth.file('login.html', {
            i18n: i18n.get(),
            locale: locale,
            lang: JSON.stringify(i18n.get().locales[locale]),
            config: config,
            redirect: url
        })
        res.send(html);
    }

    let logout = async function(req, res, next) {
        if (!Module.isAuthorized(req)) {
            return res.redirect(303, '/auth?rnd=' + Math.random().toString().replace(".", ""));
        }
        let url = req.query.redirect;
        if (!url || !url.match(/^[A-Za-z0-9-_.~\:\/\?#\[\]\@\!\$\&\'\(\)\*\+,;=]*$/) || url.length > 100) {
            url = '/';
        }
        Module.logout(req);
        res.redirect(303, url);
    }

    let register = async function(req, res, next) {
        if (Module.isAuthorized(req)) {
            let url = req.query.redirect;
            if (!url || !url.match(/^[A-Za-z0-9-_.~\:\/\?#\[\]\@\!\$\&\'\(\)\*\+,;=]*$/) || url.length > 100) {
                url = '/';
            }
            return res.redirect(303, url);
        }
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        let registerHTML = await renderAuth.file('register.html', {
            i18n: i18n.get(),
            locale: locale,
            lang: JSON.stringify(i18n.get().locales[locale]),
            config: config
        });
        let template = config.website.templates[0] + '_' + locale + '.html';
        if (config.i18n.fallback && locale != config.i18n.locales[0] && !await fs.exists(path.join(__dirname, '..', '..', 'views', template))) {
            template = config.website.templates[0] + '_' + config.i18n.locales[0] + '.html';
        }
        let html = await renderRoot.template(req, i18n, locale, i18n.get().__(locale, 'Register'), {
            content: registerHTML,
            extraCSS: ['/auth/static/css/register.css'],
            extraJS: ['/auth/static/js/registerFields.js', '/auth/static/js/register.js']
        });
        res.send(html);
    }

    app.use('/auth/static', app.get('express').static(path.join(__dirname, 'static')));
    let router = Router();
    router.get('/', login);
    router.get('/logout', logout);
    router.get('/register', register);

    return {
        routes: router
    }

}
