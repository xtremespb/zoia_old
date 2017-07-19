const path = require('path'),
    config = require(path.join(__dirname, '..', '..', 'etc', 'config.js')),
    Module = require(path.join(__dirname, '..', '..', 'core', 'module.js')),
    Router = require('co-router'),
    shared = require(path.join(__dirname, '..', '..', 'static', 'zoia', 'core', 'js', 'shared.js')),
    registerConfirmFields = require(path.join(__dirname, 'static', 'js', 'registerConfirmFields.js')),
    resetConfirmFields = require(path.join(__dirname, 'static', 'js', 'resetConfirmFields.js'));

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
        });
        res.send(html);
    };

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
    };

    let register = async function(req, res, next) {
        if (Module.isAuthorized(req)) {            
            return res.redirect(303, '/');
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
        let html = await renderRoot.template(req, i18n, locale, i18n.get().__(locale, 'Register'), {
            content: registerHTML,
            extraCSS: ['/auth/static/css/register.css'],
            extraJS: ['/zoia/core/js/shared.js', '/zoia/core/js/jquery.zoiaFormBuilder.js', '/auth/static/js/registerFields.js', '/auth/static/js/register.js']
        });
        res.send(html);
    };

    let registerConfirm = async function(req, res, next) {        
        if (Module.isAuthorized(req)) {            
            return res.redirect(303, '/');
        }
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        const fieldList = registerConfirmFields.getConfirmFields();
        let fields = shared.checkRequest(req, fieldList);
        let fieldsFailed = shared.getCheckRequestFailedFields(fields);
        if (fieldsFailed.length > 0) {
            return res.redirect(303, '/');
        }
        let confirmHTML = await renderAuth.file('registerConfirm.html', {
            i18n: i18n.get(),
            locale: locale,
            lang: JSON.stringify(i18n.get().locales[locale]),
            config: config,
            fields: fields
        });
        let html = await renderRoot.template(req, i18n, locale, i18n.get().__(locale, 'Confirm registraton'), {
            content: confirmHTML,
            extraCSS: ['/auth/static/css/registerConfirm.css'],
            extraJS: ['/auth/static/js/registerConfirm.js']
        });
        return res.send(html);
    };

    let reset = async function(req, res, next) {
        if (Module.isAuthorized(req)) {            
            return res.redirect(303, '/');
        }
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        let resetHTML = await renderAuth.file('reset.html', {
            i18n: i18n.get(),
            locale: locale,
            lang: JSON.stringify(i18n.get().locales[locale]),
            config: config
        });
        let html = await renderRoot.template(req, i18n, locale, i18n.get().__(locale, 'Reset password'), {
            content: resetHTML,
            extraCSS: ['/auth/static/css/reset.css'],
            extraJS: ['/zoia/core/js/shared.js', '/auth/static/js/resetFields.js', '/auth/static/js/reset.js']
        });
        res.send(html);
    };

    let resetConfirm = async function(req, res, next) {
        if (Module.isAuthorized(req)) {            
            return res.redirect(303, '/');
        }
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        const fieldList = resetConfirmFields.getResetConfirmFields();
        let fields = shared.checkRequest(req, fieldList);
        let fieldsFailed = shared.getCheckRequestFailedFields(fields);
        if (fieldsFailed.length > 0) {
            return res.redirect(303, '/');
        }
        let resetConfirmHTML = await renderAuth.file('resetConfirm.html', {
            i18n: i18n.get(),
            locale: locale,
            lang: JSON.stringify(i18n.get().locales[locale]),
            config: config,
            username: fields.username.value,
            code: fields.code.value
        });
        let html = await renderRoot.template(req, i18n, locale, i18n.get().__(locale, 'Set new password'), {
            content: resetConfirmHTML,
            extraCSS: ['/auth/static/css/resetConfirm.css'],
            extraJS: ['/zoia/core/js/shared.js', '/auth/static/js/resetConfirmFields.js', '/auth/static/js/resetConfirm.js']
        });
        res.send(html);
    };

    app.use('/auth/static', app.get('express').static(path.join(__dirname, 'static')));
    let router = Router();
    router.get('/', login);
    router.get('/logout', logout);
    router.get('/register', register);
    router.get('/register/confirm', registerConfirm);
    router.get('/reset', reset);
    router.get('/reset/confirm', resetConfirm);

    return {
        routes: router
    }

}
