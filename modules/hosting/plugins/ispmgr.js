const rp = require('request-promise');
const path = require('path');

let configModule;
try {
    configModule = require(path.join(__dirname, '..', 'config', 'ispmgr.json'));
} catch (e) {
    configModule = require(path.join(__dirname, '..', 'config', 'ispmgr.dist.json'));
}

module.exports = class HostingPlugin {
    constructor(app) {
        this.app = app;
        this.db = app.get('db');
        this.log = app.get('log');
    }
    async check(id, locale) {
        const url = configModule.url + '?authinfo=' + configModule.username + ':' + configModule.password + '&out=text&func=user.edit&elid=' + id + '&lang=' + locale;
        const response = await rp(url, { rejectUnauthorized: false });
        if (response && response.match(/^ERROR value\(elid\)/)) {
            return true;
        } else {
            return false;
        }
    }
    async create(id, preset, password, locale) {
        const url = configModule.url + '?authinfo=' + configModule.username + ':' + configModule.password + '&out=text&func=user.edit&sok=ok&name=' + id + '&preset=' + preset + '&passwd=' + password + '&lang=' + locale;
        const response = await rp(url, { rejectUnauthorized: false });
        if (response && response.match(/^OK/)) {
            return true;
        } else {
            return false;
        }
        return;
    }
    async start(id, locale) {
        return;
    }
    async stop(id, locale) {
        return;
    }
};