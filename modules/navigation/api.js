const path = require('path');
const Module = require(path.join(__dirname, '..', '..', 'core', 'module.js'));
const Router = require('co-router');
const config = require(path.join(__dirname, '..', '..', 'etc', 'config.js'));

module.exports = function(app) {
    const db = app.get('db');    
    const save = function(req, res) {
        res.contentType('application/json');
        if (!Module.isAuthorizedAdmin(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        console.log('Save called');
        setTimeout(function() {
        return res.send(JSON.stringify({
            status: 1
        }));
        }, 1000);
    };
    let router = Router();
    router.post('/save', save);
    return {
        routes: router
    };
};