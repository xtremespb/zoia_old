const path = require('path'),
    Module = require(path.join(__dirname, '..', '..', 'core', 'module.js')),
    loginFields = require(path.join(__dirname, 'static', 'js', 'loginFields.js')),
    registerFields = require(path.join(__dirname, 'static', 'js', 'registerFields.js')),
    registerConfirmFields = require(path.join(__dirname, 'static', 'js', 'registerConfirmFields.js')),
    resetFields = require(path.join(__dirname, 'static', 'js', 'resetFields.js')),
    resetConfirmFields = require(path.join(__dirname, 'static', 'js', 'resetConfirmFields.js')),
    shared = require(path.join(__dirname, '..', '..', 'static', 'zoia', 'core', 'js', 'shared.js')),
    Router = require('co-router'),
    crypto = require('crypto'),
    config = require(path.join(__dirname, '..', '..', 'etc', 'config.js'));

module.exports = function(app) {

    const i18n = new(require(path.join(__dirname, '..', '..', 'core', 'i18n.js')))(path.join(__dirname, 'lang'), app),
        mailer = new(require(path.join(__dirname, '..', '..', 'core', 'mailer.js')))(app),
        render = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, 'views'), undefined, app),
        log = app.get('log');

    /*

    Log in an user

    */

    let login = async function(req, res, next) {
        const db = app.get('db');
        res.contentType('application/json');
        let output = {
            status: 1
        };
        const fieldList = loginFields.getLoginFields();
        let fields = shared.checkRequest(req, fieldList);
        let fieldsFailed = shared.getCheckRequestFailedFields(fields);
        if (fieldsFailed.length > 0) {
            output.status = 0;
            output.fields = fieldsFailed;
            return res.send(JSON.stringify(output));
        }
        if (!req.session || fields.captcha.value != req.session.captcha) {
            output.status = 0;
            output.fields = ['captcha'];
            return res.send(JSON.stringify(output));
        }
        req.session.captcha = Math.random().toString().substr(2, 4);
        try {
            const passwordHash = crypto.createHash('md5').update(config.salt + fields.password.value).digest("hex");
            console.log(passwordHash);
            const user = await db.collection('users').findOne({ username: fields.username.value, password: passwordHash });
            if (user == null || !user.status) {
                output.status = -1;
            } else {
                req.session.auth = user;
            }
            return res.send(JSON.stringify(output));
        } catch (e) {
            output.status = 0;
            output.error = e.message;
            res.send(JSON.stringify(output));
        }
    };

    /*

    Log out an user
    
    */

    let logout = async function(req, res, next) {
        const db = app.get('db');
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

    let register = async function(req, res, next) {
        const db = app.get('db');
        res.contentType('application/json');
        let output = {
            status: 1
        };
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        const fieldList = registerFields.getRegisterFields();
        let fields = shared.checkRequest(req, fieldList);
        let fieldsFailed = shared.getCheckRequestFailedFields(fields);
        if (fieldsFailed.length > 0) {
            output.status = 0;
            output.fields = fieldsFailed;
            return res.send(JSON.stringify(output));
        }
        if (!req.session || fields.captcha.value != req.session.captcha) {
            output.status = 0;
            output.fields = ['captcha'];
            return res.send(JSON.stringify(output));
        }
        req.session.captcha = Math.random().toString().substr(2, 4);
        try {
            const user = await db.collection('users').findOne({ username: fields.username.value });
            if (user != null) {
                output.status = -1;
                output.fields = ['username'];
                return res.send(JSON.stringify(output));
            }
            const email = await db.collection('users').findOne({ email: fields.email.value });
            if (email != null) {
                output.status = -2;
                output.fields = ['email'];
                return res.send(JSON.stringify(output));
            }
            const passwordHash = crypto.createHash('md5').update(config.salt + fields.password.value).digest("hex");
            const activationCode = crypto.createHash('md5').update(config.salt + Math.random()).digest("hex");
            const insResult = await db.collection('users').insertOne({
                username: fields.username.value,
                email: fields.email.value,
                password: passwordHash,
                status: 0,
                activationCode: activationCode
            });
            if (!insResult || !insResult.status || !insResult.status.ok) {
                output.status = 0;
                return res.send(JSON.stringify(output));
            }
            let mailHTML = await render.file('mail_register.html', {
                i18n: i18n.get(),
                locale: locale,
                lang: JSON.stringify(i18n.get().locales[locale]),
                config: config,
                url: config.website.protocol + '://' + config.website.url[locale] + '/auth/register/confirm?username=' + fields.username.value + '&code=' + activationCode
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

    let registerConfirm = async function(req, res, next) {
        const db = app.get('db');
        res.contentType('application/json');
        let output = {
            status: 1
        };
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        const fieldList = registerConfirmFields.getConfirmFields();
        let fields = shared.checkRequest(req, fieldList);
        let fieldsFailed = shared.getCheckRequestFailedFields(fields);
        if (fieldsFailed.length > 0) {
            output.status = 0;
            output.fields = fieldsFailed;
            return res.send(JSON.stringify(output));
        }
        try {
            const user = await db.collection('users').findOne({ username: fields.username.value });
            if (user == null || user.status > 0 || user.activationCode != fields.code.value) {
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
            if (!updResult || !updResult.status || !updResult.status.ok) {
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

    let reset = async function(req, res, next) {
        const db = app.get('db');
        res.contentType('application/json');
        let output = {
            status: 1
        };
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        const fieldList = resetFields.getRegisterFields();
        let fields = shared.checkRequest(req, fieldList);
        let fieldsFailed = shared.getCheckRequestFailedFields(fields);
        if (fieldsFailed.length > 0) {
            output.status = 0;
            output.fields = fieldsFailed;
            return res.send(JSON.stringify(output));
        }
        if (!req.session || fields.captcha.value != req.session.captcha) {
            output.status = 0;
            output.fields = ['captcha'];
            return res.send(JSON.stringify(output));
        }
        req.session.captcha = Math.random().toString().substr(2, 4);
        try {
            const user = await db.collection('users').findOne({ email: fields.email.value });
            if (user == null) {
                output.status = -1;
                output.fields = ['email'];
                return res.send(JSON.stringify(output));
            }
            const activationCode = crypto.createHash('md5').update(config.salt + Math.random()).digest("hex");
            let updResult = await db.collection('users').update({
                email: fields.email.value
            }, {
                $set: {
                    activationCode: activationCode
                }
            });
            if (!updResult || !updResult.status || !updResult.status.ok) {
                output.status = 0;
                return res.send(JSON.stringify(output));
            }
            let mailHTML = await render.file('mail_reset.html', {
                i18n: i18n.get(),
                locale: locale,
                lang: JSON.stringify(i18n.get().locales[locale]),
                config: config,
                url: config.website.protocol + '://' + config.website.url[locale] + '/auth/reset/confirm?username=' + user.username + '&code=' + activationCode + '&password=password'
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

    let resetConfirm = async function(req, res, next) {
        const db = app.get('db');
        res.contentType('application/json');
        let output = {
            status: 1
        };
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        const fieldList = resetConfirmFields.getResetConfirmFields();
        let fields = shared.checkRequest(req, fieldList);
        let fieldsFailed = shared.getCheckRequestFailedFields(fields);
        if (fieldsFailed.length > 0) {
            output.status = 0;
            console.log('P1');
            output.fields = fieldsFailed;
            return res.send(JSON.stringify(output));
        }
        try {
            const user = await db.collection('users').findOne({ username: fields.username.value });
            if (user == null || user.status == 0 || fields.code.value != user.activationCode) {
                output.status = -1;
                return res.send(JSON.stringify(output));
            }
            const passwordHash = crypto.createHash('md5').update(config.salt + fields.password.value).digest("hex");
            let updResult = await db.collection('users').update({
                username: fields.username.value
            }, {
                $set: {
                    activationCode: undefined,
                    password: passwordHash
                }
            });
            if (!updResult || !updResult.status || !updResult.status.ok) {
                console.log('P2');
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
    router.post('/login', login);
    router.all('/logout', logout);
    router.all('/register', register);
    router.all('/register/confirm', registerConfirm);
    router.all('/reset', reset);
    router.all('/reset/confirm', resetConfirm);

    router.all('/test', async function(req, res) {
        res.contentType('application/json');
        const db = app.get('db');
        const sortField = req.query.sortField || 'firstname';
        const sortDirection = (req.query.sortDirection == 'asc') ? 1 : -1;
        const sort = {};
        sort[sortField] = sortDirection;
        const skip = parseInt(req.query.skip || 0);
        const limit = parseInt(req.query.limit || 10);
        const search = req.query.search || '';
        console.log(search);
        let fquery = {};
        //db.collection('test').ensureIndex({ '$**': 'text' });
        try {
            if (search) {
                fquery = { $text: { $search: search } };
            }
            const total = await db.collection('test').find(fquery, { skip: skip, limit: limit }).count();
            const test = await db.collection('test').find(fquery, { skip: skip, limit: limit }).sort(sort).toArray();
            let data = {
                count: test.length,
                total: total,
                items: test
            }
            console.log(data);
            res.send(JSON.stringify(data));
            /*setTimeout(function() {
                res.send(JSON.stringify(data));
            }, 1000);*/
            //res.send('[]');
        } catch (e) {
            console.log(e);
        }
    })

    return {
        routes: router
    }

}
