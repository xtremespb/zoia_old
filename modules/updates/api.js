const path = require('path');
const Module = require(path.join(__dirname, '..', '..', 'core', 'module.js'));
const Router = require('co-router');
const ObjectID = require('mongodb').ObjectID;
const config = require(path.join(__dirname, '..', '..', 'etc', 'config.js'));
const rp = require('request-promise');

module.exports = function(app) {
    const log = app.get('log');
    const db = app.get('db');

    const check = async(req, res) => {
        res.contentType('application/json');
        if (!Module.isAuthorizedAdmin(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        try {
            const response = await rp('https://xtremespb.github.io/zoia/version.json');
            const data = JSON.parse(response);
            let update;
            if (config.version.code !== data.code) {
                update = {
                    version: data.code,
                    changelog: data.changelog
                };
            }
            res.send(JSON.stringify({
                status: 1,
                update: update
            }));
        } catch (e) {
            return res.send(JSON.stringify({
                status: 0,
                error: e.message
            }));
        }
    };

    let router = Router();
    router.get('/check', check);

    return {
        routes: router
    };
};