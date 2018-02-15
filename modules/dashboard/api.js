const path = require('path');
const Module = require(path.join(__dirname, '..', '..', 'core', 'module.js'));
const Router = require('co-router');
const config = require(path.join(__dirname, '..', '..', 'core', 'config.js'));
const fs = require('fs-extra');

module.exports = function(app) {
    const log = app.get('log');
    const db = app.get('db');

    const restart = async(req, res) => {
        const locale = req.session.currentLocale;
        res.contentType('application/json');
        if (!Module.isAuthorizedAdmin(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        setTimeout(() => {
            process.exit(0);
        }, 3000);
        return res.send(JSON.stringify({
            status: 1
        }));
    };

    const settingsSave = async(req, res) => {
        const locale = req.session.currentLocale;
        res.contentType('application/json');
        if (!Module.isAuthorizedAdmin(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        const data = req.body.config;
        if (!data || typeof data !== 'object') {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        try {
            const settingsMerge = Object.assign(config.website, data);
            await fs.writeJson(path.join(__dirname, '..', '..', 'etc', 'website.json'), settingsMerge, { spaces: '\t' });
            return res.send(JSON.stringify({
                status: 1
            }));
        } catch (e) {
            log.error(e);
            return res.send(JSON.stringify({
                status: 0
            }));
        }
    };

    let router = Router();
    router.get('/restart', restart);
    router.post('/settings/save', settingsSave);
    return {
        routes: router
    };
};