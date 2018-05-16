const path = require('path');
const Module = require(path.join(__dirname, '..', '..', 'core', 'module.js'));
const loginFields = require(path.join(__dirname, 'schemas', 'loginFields.js'));
const registerFields = require(path.join(__dirname, 'schemas', 'registerFields.js'));
const registerConfirmFields = require(path.join(__dirname, 'schemas', 'registerConfirmFields.js'));
const resetFields = require(path.join(__dirname, 'schemas', 'resetFields.js'));
const resetConfirmFields = require(path.join(__dirname, 'schemas', 'resetConfirmFields.js'));
const validation = new(require(path.join(__dirname, '..', '..', 'core', 'validation.js')))();
const Router = require('co-router');
const crypto = require('crypto');
const config = require(path.join(__dirname, '..', '..', 'core', 'config.js'));
const ExpressBrute = require('express-brute');

module.exports = function(app) {
    const i18n = new(require(path.join(__dirname, '..', '..', 'core', 'i18n.js')))(path.join(__dirname, 'lang'), app);
    const mailer = new(require(path.join(__dirname, '..', '..', 'core', 'mailer.js')))(app);
    const render = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, 'views'), app);
    const log = app.get('log');
    const db = app.get('db');

    const failCallback = function(req, res, next, nextValidRequestDate) {
        const locale = req.session.currentLocale;
        return res.send(JSON.stringify({
            status: 0,
            error: i18n.get().__(locale, 'Too many requests')
        }));
    };

    const authBruteforce = new ExpressBrute(app.get('bruteforceStore'), {
        freeRetries: 5,
        minWait: 500,
        maxWait: 60 * 1000, // 1 hour,
        failCallback: failCallback
    });

    /*
        Log in an user
    */

    const login = async(req, res) => {
        res.contentType('application/json');
        const fieldList = loginFields.getLoginFields(config.core && config.core.regexp && config.core.regexp.username ? JSON.stringify(config.core.regexp) : '{"username":"^[A-Za-z0-9_\\\\-]+$"}');
        let fields = validation.checkRequest(req, fieldList);
        let fieldsFailed = validation.getCheckRequestFailedFields(fields);
        if (fieldsFailed.length > 0) {
            return res.send(JSON.stringify({
                status: 0,
                fields: fieldsFailed
            }));
        }
        try {
            const passwordHash = crypto.createHash('md5').update(config.salt + fields.password.value).digest('hex');
            const user = await db.collection('users').findOne({ username: fields.username.value, password: passwordHash });
            if (!user || !user.status) {
                return res.send(JSON.stringify({
                    status: -1,
                    fields: fieldsFailed
                }));
            }
            req.session.auth = user;
            req.brute.reset(function() {
                return res.send(JSON.stringify({ status: 1 }));
            });
        } catch (e) {
            log.error(e);
            return JSON.stringify({
                status: 0,
                error: e.message
            });
        }
    };

    /*
        Log out an user
    */

    const logout = async(req, res) => {
        res.contentType('application/json');
        let output = {
            status: 1
        };
        if (!Module.isAuthorized(req)) {
            output.status = 0;
            return res.send(JSON.stringify(output));
        }
        try {
            Module.logout(req);
            return res.send(JSON.stringify(output));
        } catch (e) {
            output.status = 0;
            output.error = e.message;
            res.send(JSON.stringify(output));
        }
    };

    /*
        Register    
    */

    const register = async(req, res) => {
        res.contentType('application/json');
        let output = {
            status: 1
        };
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        const uprefix = i18n.getLanguageURLPrefix(req);
        const fieldList = registerFields.getRegisterFields(config.core && config.core.regexp && config.core.regexp.username ? JSON.stringify(config.core.regexp) : '{"username":"^[A-Za-z0-9_\\\\-]+$"}');
        let fields = validation.checkRequest(req, fieldList);
        let fieldsFailed = validation.getCheckRequestFailedFields(fields);
        if (fieldsFailed.length > 0) {
            output.status = 0;
            output.fields = fieldsFailed;
            return res.send(JSON.stringify(output));
        }
        if (!req.session || fields.captcha.value !== req.session.captcha) {
            output.status = -3;
            output.fields = ['captcha'];
            req.session.captcha = null;
            return res.send(JSON.stringify(output));
        }
        req.session.captcha = Math.random().toString().substr(2, 4);
        try {
            const user = await db.collection('users').findOne({ username: fields.username.value });
            if (user !== null) {
                output.status = -1;
                output.fields = ['username'];
                return res.send(JSON.stringify(output));
            }
            const email = await db.collection('users').findOne({ email: fields.email.value });
            if (email !== null) {
                output.status = -2;
                output.fields = ['email'];
                return res.send(JSON.stringify(output));
            }
            const passwordHash = crypto.createHash('md5').update(config.salt + fields.password.value).digest('hex');
            const activationCode = crypto.createHash('md5').update(config.salt + Math.random()).digest('hex');
            const insResult = await db.collection('users').insertOne({
                username: fields.username.value,
                email: fields.email.value,
                password: passwordHash,
                timestamp: parseInt(Date.now() / 1000, 10),
                status: 0,
                activationCode: activationCode
            });
            if (!insResult || !insResult.result || !insResult.result.ok) {
                output.status = 0;
                return res.send(JSON.stringify(output));
            }
            let mailHTML = await render.file('mail_register.html', {
                i18n: i18n.get(),
                locale: locale,
                lang: JSON.stringify(i18n.get().locales[locale]),
                config: config,
                url: config.website.protocol + '://' + config.website.url[locale] + uprefix + config.core.prefix.auth + config.core.prefix.authRegisterConfirm + '?username=' + fields.username.value + '&code=' + activationCode
            });
            await mailer.send(req, fields.email.value, i18n.get().__(locale, 'Confirm your registration'), mailHTML);
            return res.send(JSON.stringify(output));
        } catch (e) {
            output.status = 0;
            log.error(e);
            res.send(JSON.stringify(output));
        }
    };

    /*
        Register сonfirmation    
    */

    const registerConfirm = async(req, res) => {
        res.contentType('application/json');
        let output = {
            status: 1
        };        
        const fieldList = registerConfirmFields.getConfirmFields(config.core && config.core.regexp && config.core.regexp.username ? JSON.stringify(config.core.regexp) : '{"username":"^[A-Za-z0-9_\\\\-]+$"}');
        let fields = validation.checkRequest(req, fieldList);
        let fieldsFailed = validation.getCheckRequestFailedFields(fields);
        if (fieldsFailed.length > 0) {
            output.status = 0;
            output.fields = fieldsFailed;
            return res.send(JSON.stringify(output));
        }
        try {
            const user = await db.collection('users').findOne({ username: fields.username.value });
            if (user === null || user.status > 0 || user.activationCode !== fields.code.value) {
                output.status = -1;
                return res.send(JSON.stringify(output));
            }
            let updResult = await db.collection('users').update({
                username: fields.username.value
            }, {
                $set: {
                    status: 1
                }
            });
            if (!updResult || !updResult.result || !updResult.result.ok) {
                output.status = 0;
                return res.send(JSON.stringify(output));
            }
            return res.send(JSON.stringify(output));
        } catch (e) {
            output.status = 0;
            log.error(e);
            res.send(JSON.stringify(output));
        }
    };

    /*
        Password reset    
    */

    const reset = async(req, res) => {
        res.contentType('application/json');
        let output = {
            status: 1
        };
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        const uprefix = i18n.getLanguageURLPrefix(req);
        const fieldList = resetFields.getResetFields();
        let fields = validation.checkRequest(req, fieldList);
        let fieldsFailed = validation.getCheckRequestFailedFields(fields);
        if (fieldsFailed.length > 0) {
            output.status = 0;
            output.fields = fieldsFailed;
            return res.send(JSON.stringify(output));
        }
        if (!req.session || fields.captcha.value !== req.session.captcha) {
            output.status = 0;
            output.fields = ['captcha'];
            req.session.captcha = null;
            return res.send(JSON.stringify(output));
        }
        req.session.captcha = Math.random().toString().substr(2, 4);
        try {
            const user = await db.collection('users').findOne({ email: fields.email.value });
            if (user === null) {
                output.status = -1;
                output.fields = ['email'];
                return res.send(JSON.stringify(output));
            }
            const activationCode = crypto.createHash('md5').update(config.salt + Math.random()).digest('hex');
            let updResult = await db.collection('users').update({
                email: fields.email.value
            }, {
                $set: {
                    activationCode: activationCode
                }
            });
            if (!updResult || !updResult.result || !updResult.result.ok) {
                output.status = 0;
                return res.send(JSON.stringify(output));
            }
            let mailHTML = await render.file('mail_reset.html', {
                i18n: i18n.get(),
                locale: locale,
                lang: JSON.stringify(i18n.get().locales[locale]),
                config: config,
                url: config.website.protocol + '://' + config.website.url[locale] + uprefix + config.core.prefix.auth + config.core.prefix.authResetConfirm + '?username=' + user.username + '&code=' + activationCode + '&password=password'
            });
            await mailer.send(req, fields.email.value, i18n.get().__(locale, 'Confirm password reset'), mailHTML);
            return res.send(JSON.stringify(output));
        } catch (e) {
            output.status = 0;
            log.error(e);
            res.send(JSON.stringify(output));
        }
    };

    /*
        Confirm password reset    
    */

    const resetConfirm = async(req, res) => {
        res.contentType('application/json');
        let output = {
            status: 1
        };
        const fieldList = resetConfirmFields.getResetConfirmFields(config.core && config.core.regexp && config.core.regexp.username ? JSON.stringify(config.core.regexp) : '{"username":"^[A-Za-z0-9_\\\\-]+$"}');
        let fields = validation.checkRequest(req, fieldList);
        let fieldsFailed = validation.getCheckRequestFailedFields(fields);
        if (fieldsFailed.length > 0) {
            output.status = 0;
            output.fields = fieldsFailed;
            return res.send(JSON.stringify(output));
        }
        try {
            const user = await db.collection('users').findOne({ username: fields.username.value });
            if (user === null || user.status === 0 || fields.code.value !== user.activationCode) {
                output.status = -1;
                return res.send(JSON.stringify(output));
            }
            const passwordHash = crypto.createHash('md5').update(config.salt + fields.password.value).digest('hex');
            let updResult = await db.collection('users').update({
                username: fields.username.value
            }, {
                $set: {
                    activationCode: undefined,
                    password: passwordHash
                }
            });
            if (!updResult || !updResult.result || !updResult.result.ok) {
                output.status = 0;
                return res.send(JSON.stringify(output));
            }
            return res.send(JSON.stringify(output));
        } catch (e) {
            output.status = 0;
            log.error(e);
            res.send(JSON.stringify(output));
        }
    };

    let router = Router();
    router.post('/login',
        authBruteforce.getMiddleware({
            key: function(req, res, next) {
                next(req.body.username);
            }
        }), login
    );
    router.all('/logout', logout);
    router.all('/register', register);
    router.all('/register/confirm', registerConfirm);
    router.all('/reset', reset);
    router.all('/reset/confirm', resetConfirm);

    return {
        routes: router
    };
};