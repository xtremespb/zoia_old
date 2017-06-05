const path = require('path'),
    cowrap = require('co-express')
    helpers = require(path.join(__dirname, '..', '..', 'core', 'helpers.js'));

module.exports = function(app) {

    let login = async function(req, res, next) {
        res.contentType('application/json');
        let output = {
            result: 0
        };
        let fieldList = {
            username: {
                mandatory: true,
                length: {
                    min: 1,
                    max: 20
                },
                type: "string"
            },
            password: {
                mandatory: true
            }
        }
        let fields = helpers.checkRequest(req, fieldList);
        res.send(JSON.stringify(fields));
    };

    let router = app.get('express').Router();
    router.get('/login', cowrap(login));

    return {
        routes: router
    }

}
