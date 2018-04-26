module.exports = function(app) {
    const path = require('path');
    const api = require(path.join(__dirname, 'api.js'))(app);
    const backend = require(path.join(__dirname, 'backend.js'))(app);
    const frontend = require(path.join(__dirname, 'frontend.js'))(app);
    let configModule;
    try {
        configModule = require(path.join(__dirname, 'config', 'hosting.json'));
    } catch (e) {
        configModule = require(path.join(__dirname, 'config', 'hosting.dist.json'));
    }
    if (configModule.paymentPlugin) {
        try {
            require(path.join(__dirname, 'plugins_payment', configModule.paymentPlugin + '.js'))(app, frontend.routes);
        } catch (e) {
            app.get('log').error('Could not load payments plugin: ' + e);
        }
    }
    app.get('log').info('[hosting] module loaded');
    return {
        frontend: {
            prefix: '/hosting',
            routes: frontend.routes,
            filters: frontend.filters
        },
        backend: {
            prefix: '/hosting',
            routes: backend.routes,
            info: backend.info
        },
        api: {
            prefix: '/hosting',
            routes: api.routes
        }
    };
};