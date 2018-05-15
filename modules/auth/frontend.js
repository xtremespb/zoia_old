const path = require('path');
const config = require(path.join(__dirname, '..', '..', 'core', 'config.js'));
const Module = require(path.join(__dirname, '..', '..', 'core', 'module.js'));
const Router = require('co-router');
const validation = new(require(path.join(__dirname, '..', '..', 'core', 'validation.js')))();
const registerConfirmFields = require(path.join(__dirname, 'schemas', 'registerConfirmFields.js'));
const resetConfirmFields = require(path.join(__dirname, 'schemas', 'resetConfirmFields.js'));

const fs = require('fs');

let templateLogin = 'login.html';
let templateRegister = 'register.html';
let templateRegisterConfirm = 'registerConfirm.html';
let templateReset = 'reset.html';
let templateResetConfirm = 'resetConfirm.html';

if (fs.existsSync(path.join(__dirname, 'views', 'custom_' + templateLogin))) {
    templateLogin = 'custom_' + templateLogin;
}
if (fs.existsSync(path.join(__dirname, 'views', 'custom_' + templateRegister))) {
    templateRegister = 'custom_' + templateRegister;
}
if (fs.existsSync(path.join(__dirname, 'views', 'custom_' + templateRegisterConfirm))) {
    templateRegisterConfirm = 'custom_' + templateRegisterConfirm;
}
if (fs.existsSync(path.join(__dirname, 'views', 'custom_' + templateReset))) {
    templateReset = 'custom_' + templateReset;
}
if (fs.existsSync(path.join(__dirname, 'views', 'custom_' + templateResetConfirm))) {
    templateResetConfirm = 'custom_' + templateResetConfirm;
}

module.exports = function(app) {
    const i18n = new(require(path.join(__dirname, '..', '..', 'core', 'i18n.js')))(path.join(__dirname, 'lang'), app);
    const renderAuth = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, 'views'), app);
    const renderRoot = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, '..', '..', 'views'), app);

    const login = async(req, res) => {
        const uprefix = i18n.getLanguageURLPrefix(req);
        if (Module.isAuthorized(req)) {
            let url = req.query.redirect;
            if (!url || !url.match(/^[A-Za-z0-9-_.~\:\/\?#\[\]\@\!\$\&\'\(\)\*\+,;=]*$/) || url.length > 100) {
                url = uprefix + '/';
            }
            return res.redirect(303, url);
        }
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        let url = req.query.redirect || req.headers.referer;
        if (!url || !url.match(/^[A-Za-z0-9-_.~\:\/\?#\[\]\@\!\$\&\'\(\)\*\+,;=]*$/) || url.length > 100) {
            url = uprefix + '/';
        }
        let html = await renderAuth.file(templateLogin, {
            i18n: i18n.get(),
            uprefix: uprefix,
            locale: locale,
            lang: JSON.stringify(i18n.get().locales[locale]),
            config: config,
            prefix: config.core.prefix.auth,
            rxp: config.core && config.core.regexp && config.core.regexp.username ? JSON.stringify(config.core.regexp) : '{"username":"^[A-Za-z0-9_\\\\-]+$"}',
            redirect: url
        });
        res.send(html);
    };

    const logout = async(req, res) => {
        const uprefix = i18n.getLanguageURLPrefix(req);
        if (!Module.isAuthorized(req)) {
            return res.redirect(303, uprefix + config.core.prefix.auth + '/?rnd=' + Math.random().toString().replace('.', ''));
        }
        let url = req.query.redirect;
        if (!url || !url.match(/^[A-Za-z0-9-_.~\:\/\?#\[\]\@\!\$\&\'\(\)\*\+,;=]*$/) || url.length > 100) {
            url = uprefix + '/';
        }
        Module.logout(req);
        res.redirect(303, url);
    };

    const register = async(req, res) => {
        const uprefix = i18n.getLanguageURLPrefix(req);
        if (Module.isAuthorized(req)) {
            return res.redirect(303, uprefix + '/');
        }
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        let filters = app.get('templateFilters');
        renderRoot.setFilters(filters);
        let registerHTML = await renderAuth.file(templateRegister, {
            i18n: i18n.get(),
            locale: locale,
            lang: JSON.stringify(i18n.get().locales[locale]),
            prefix: config.core.prefix.auth,
            uprefix: uprefix,
            rxp: config.core && config.core.regexp && config.core.regexp.username ? JSON.stringify(config.core.regexp) : '{"username":"^[A-Za-z0-9_\\\\-]+$"}',
            config: config
        });
        let html = await renderRoot.template(req, i18n, locale, i18n.get().__(locale, 'Register'), {
            content: registerHTML,
            extraCSS: config.production ? ['/auth/static/css/register.min.css'] : ['/auth/static/css/register.css'],
            extraJS: config.production ? ['/auth/static/js/register.min.js'] : ['/zoia/core/js/jquery.zoiaFormBuilder.js', '/auth/static/js/register.js']
        });
        res.send(html);
    };

    const registerConfirm = async(req, res) => {
        const uprefix = i18n.getLanguageURLPrefix(req);
        if (Module.isAuthorized(req)) {
            return res.redirect(303, uprefix + '/');
        }
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        let filters = app.get('templateFilters');
        renderRoot.setFilters(filters);
        const fieldList = registerConfirmFields.getConfirmFields();
        let fields = validation.checkRequest(req, fieldList);
        let fieldsFailed = validation.getCheckRequestFailedFields(fields);
        if (fieldsFailed.length > 0) {
            return res.redirect(303, '/');
        }
        let confirmHTML = await renderAuth.file(templateRegisterConfirm, {
            i18n: i18n.get(),
            locale: locale,
            lang: JSON.stringify(i18n.get().locales[locale]),
            config: config,
            prefix: config.core.prefix.auth,
            uprefix: uprefix,
            rxp: config.core && config.core.regexp && config.core.regexp.username ? JSON.stringify(config.core.regexp) : '{"username":"^[A-Za-z0-9_\\\\-]+$"}',
            fields: fields
        });
        let html = await renderRoot.template(req, i18n, locale, i18n.get().__(locale, 'Confirm registration'), {
            content: confirmHTML,
            extraCSS: config.production ? ['/auth/static/css/registerConfirm.min.css'] : ['/auth/static/css/registerConfirm.css'],
            extraJS: config.production ? ['/auth/static/js/registerConfirm.min.js'] : ['/auth/static/js/registerConfirm.js']
        });
        return res.send(html);
    };

    const reset = async(req, res) => {
        const uprefix = i18n.getLanguageURLPrefix(req);
        if (Module.isAuthorized(req)) {
            return res.redirect(303, uprefix + '/');
        }
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        let filters = app.get('templateFilters');
        renderRoot.setFilters(filters);
        let resetHTML = await renderAuth.file(templateReset, {
            i18n: i18n.get(),
            locale: locale,
            lang: JSON.stringify(i18n.get().locales[locale]),
            prefix: config.core.prefix.auth,
            uprefix: uprefix,
            rxp: config.core && config.core.regexp && config.core.regexp.username ? JSON.stringify(config.core.regexp) : '{"username":"^[A-Za-z0-9_\\\\-]+$"}',
            config: config
        });
        let html = await renderRoot.template(req, i18n, locale, i18n.get().__(locale, 'Reset password'), {
            content: resetHTML,
            extraCSS: config.production ? ['/auth/static/css/reset.min.css'] : ['/auth/static/css/reset.css'],
            extraJS: config.production ? ['/auth/static/js/reset.min.js'] : ['/zoia/core/js/jquery.zoiaFormBuilder.js', '/auth/static/js/reset.js']
        });
        res.send(html);
    };

    const resetConfirm = async(req, res) => {
        const uprefix = i18n.getLanguageURLPrefix(req);
        if (Module.isAuthorized(req)) {
            return res.redirect(303, uprefix + '/');
        }
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        let filters = app.get('templateFilters');
        renderRoot.setFilters(filters);
        const fieldList = resetConfirmFields.getResetConfirmFields();
        let fields = validation.checkRequest(req, fieldList);
        let fieldsFailed = validation.getCheckRequestFailedFields(fields);
        if (fieldsFailed.length > 0) {
            return res.redirect(303, '/');
        }
        let resetConfirmHTML = await renderAuth.file(templateResetConfirm, {
            i18n: i18n.get(),
            locale: locale,
            lang: JSON.stringify(i18n.get().locales[locale]),
            config: config,
            username: fields.username.value,
            prefix: config.core.prefix.auth,
            uprefix: uprefix,
            rxp: config.core && config.core.regexp && config.core.regexp.username ? JSON.stringify(config.core.regexp) : '{"username":"^[A-Za-z0-9_\\\\-]+$"}',
            code: fields.code.value
        });
        let html = await renderRoot.template(req, i18n, locale, i18n.get().__(locale, 'Set new password'), {
            content: resetConfirmHTML,
            extraCSS: config.production ? ['/auth/static/css/resetConfirm.min.css'] : ['/auth/static/css/resetConfirm.css'],
            extraJS: config.production ? ['/auth/static/js/resetConfirm.min.js'] : ['/zoia/core/js/jquery.zoiaFormBuilder.js', '/auth/static/js/resetConfirm.js']
        });
        res.send(html);
    };

    app.use(config.core.prefix.auth + '/static', app.get('express').static(path.join(__dirname, 'static')));
    let router = Router();
    router.get('/', login);
    router.get('/logout', logout);
    router.get('/register', register);
    router.get('/register/confirm', registerConfirm);
    router.get('/reset', reset);
    router.get('/reset/confirm', resetConfirm);

    return {
        routes: router
    };
};