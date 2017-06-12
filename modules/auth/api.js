const path = require('path'),
    Module = require(path.join(__dirname, '..', '..', 'core', 'module.js')),
    loginFields = require(path.join(__dirname, 'static', 'js', 'loginFields.js')),
    shared = require(path.join(__dirname, '..', '..', 'static', 'zoia', 'core', 'js', 'shared.js')),
    Router = require('co-router'),
    crypto = require('crypto'),
    config = require(path.join(__dirname, '..', '..', 'etc', 'config.js'));

module.exports = function(app) {

    /*

    Log in an user
    Parameters: username, passwords
    Sets "auth" session parameter when successful (1)
    Returns error (0) otherwise

    */

    let login = async function(req, res, next) {
        const db = app.get('db');
        res.contentType('application/json');
        let output = {
            result: 1
        };
        const fieldList = loginFields.getLoginFields();
        let fields = shared.checkRequest(req, fieldList);
        let fieldsFailed = shared.getCheckRequestFailedFields(fields);
        if (fieldsFailed.length > 0) {
            output.result = 0;
            output.fields = fieldsFailed;
            return res.send(JSON.stringify(output));
        }
        if (!req.session || fields.captcha.value != req.session.captcha) {
            output.result = 0;
            output.fields = ['captcha'];
            return res.send(JSON.stringify(output));
        }
        req.session.captcha = Math.random().toString().substr(2,4);
        try {
            const passwordHash = crypto.createHash('md5').update(config.salt + fields.password.value).digest("hex");
            const user = await db.collection('users').findOne({ username: fields.username.value, password: passwordHash });
            if (user == null) {
                output.result = -1;
            } else {
                req.session.auth = user;
            }
            return res.send(JSON.stringify(output));
        } catch (e) {
        	output.result = 0;
            output.error = e.message;
            res.send(JSON.stringify(output));
        }
    };

    /*

    Log out an user
    Parameters: none
    Unsets "auth" session parameter when successful (1)
    Returns error (0) otherwise
    
    */

    let logout = async function(req, res, next) {
        const db = app.get('db');
        res.contentType('application/json');
        let output = {
            result: 1
        };
        if (!Module.isAuthorized(req)) {
        	output.result = 0;
        	return res.send(JSON.stringify(output));
        }
        try {
            Module.logout(req);
            return res.send(JSON.stringify(output));
        } catch (e) {
        	output.result = 0;
            output.error = e.message;
            res.send(JSON.stringify(output));
        }
    };

    let router = Router();
    router.post('/login', login);
    router.all('/logout', logout);

    return {
        routes: router
    }

}
