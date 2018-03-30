module.exports = class HostingPlugin {
    constructor(app) {
    }
    async getControlPanelURL(host) {
        return '';
    }
    async check(id, host, locale) {
        return;
    }
    async create(id, host, preset, password, locale) {
        return;
    }
    async start(id, host, locale) {
        return;
    }
    async stop(id, host, locale) {
        return;
    }
};