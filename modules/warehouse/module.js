module.exports = function(app) {
    const path = require('path');
    const api = require(path.join(__dirname, 'api.js'))(app);
    const backend = require(path.join(__dirname, 'backend.js'))(app);
    const frontend = require(path.join(__dirname, 'frontend.js'))(app);
    app.get('log').info('[warehouse] module loaded');
    let configModule;
    try {
        configModule = require(path.join(__dirname, 'config', 'catalog.json'));
    } catch (e) {
        configModule = require(path.join(__dirname, 'config', 'catalog.dist.json'));
    }
    let plugin = {};
    if (configModule.payments && configModule.payments.enabled) {        
        try {
            plugin = require(path.join(__dirname, 'plugins', configModule.payments.plugin, 'routes'))(app, frontend.routes);
        } catch(e) {
            app.get('log').error('Could not load payments plugin: ' + e);
        }
    }
    return {
        frontend: {
            prefix: configModule.prefix,
            routes: frontend.routes
        },
        backend: {
            prefix: '/warehouse',
            routes: backend.routes,
            info: backend.info
        },
        api: {
            prefix: '/warehouse',
            routes: api.routes
        }
    };
};