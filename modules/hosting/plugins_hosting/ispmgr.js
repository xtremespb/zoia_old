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
        if (app) {
            this.log = app.get('log');
        }
    }
    async getControlPanelURL(host) {
        return configModule.url[host];
    }
    async check(id, host, locale) {
        try {
            const url = configModule.url[host] + '?authinfo=' + configModule.username + ':' + configModule.password + '&out=text&func=user.edit&elid=' + id + '&lang=' + locale;
            const response = await rp(url, { rejectUnauthorized: false });
            if (response && response.match(/^ERROR value\(elid\)/)) {
                return true;
            } else {
                if (this.log) {
                    this.log.error('hosting/check ' + id + ' ' + host + ' ' + response);
                }
                return response;
            }
        } catch (e) {
            if (this.log) {
                this.log.error(e);
            }
            return false;
        }
    }
    async create(id, host, preset, password, locale) {
        try {
            const url = configModule.url[host] + '?authinfo=' + configModule.username + ':' + configModule.password + '&out=text&func=user.edit&sok=ok&name=' + id + '&preset=' + preset + '&passwd=' + password + '&lang=' + locale;
            const response = await rp(url, { rejectUnauthorized: false });
            if (response && response.match(/^OK/)) {
                return true;
            } else {
                if (this.log) {
                    this.log.error('hosting/create ' + id + ' ' + host + ' ' + response);
                }
                return response;
            }
        } catch (e) {
            if (this.log) {
                this.log.error(e);
            }
            return false;
        }
    }
    async start(id, host, locale) {
        try {
            const url = configModule.url[host] + '?authinfo=' + configModule.username + ':' + configModule.password + '&out=text&func=user.resume&elid=' + id + '&lang=' + locale;
            const response = await rp(url, { rejectUnauthorized: false });
            if (response && !response.match(/^ERROR/)) {
                return true;
            } else {
                if (this.log) {
                    this.log.error('hosting/start ' + id + ' ' + host + ' ' + response);
                }
                return response;
            }
        } catch (e) {
            if (this.log) {
                this.log.error(e);
            }
            return false;
        }
    }
    async stop(id, host, locale) {
        try {
            const url = configModule.url[host] + '?authinfo=' + configModule.username + ':' + configModule.password + '&out=text&func=user.suspend&elid=' + id + '&lang=' + locale;
            const response = await rp(url, { rejectUnauthorized: false });
            if (response && !response.match(/^ERROR/)) {
                return true;
            } else {
                if (this.log) {
                    this.log.error('hosting/stop ' + id + ' ' + host + ' ' + response);
                }
                return response;
            }
        } catch (e) {
            if (this.log) {
                this.log.error(e);
            }
            return false;
        }
    }
};