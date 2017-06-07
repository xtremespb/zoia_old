const path = require('path'),
    Module = require(path.join(__dirname, '..', '..', 'core', 'module.js')),
    loginFields = require(path.join(__dirname, 'public', 'js', 'loginFields.js')),
    shared = require(path.join(__dirname, '..', '..', 'public', 'zoia', 'core', 'js', 'shared.js')),
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
        if (!req.session || !req.session.auth) {
        	output.result = 0;
        	return res.send(JSON.stringify(output));
        }
        console.log(req.session.auth);
        try {
            req.session.auth = undefined;
            return res.send(JSON.stringify(output));
        } catch (e) {
        	output.result = 0;
            output.error = e.message;
            res.send(JSON.stringify(output));
        }
    };

    let router = Router();
    router.post('/login', login);
    router.post('/logout', logout);

    return {
        routes: router
    }

}
