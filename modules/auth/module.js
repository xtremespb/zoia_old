module.exports = function(app) {
    const path = require('path');
    let configModule;
    try {
        configModule = require(path.join(__dirname, 'config', 'auth.json'));
    } catch (e) {
        configModule = require(path.join(__dirname, 'config', 'auth.dist.json'));
    }
    const api = require(path.join(__dirname, 'api.js'))(app);
    const frontend = require(path.join(__dirname, 'frontend.js'))(app);
    return {
        frontend: {
            prefix: configModule.prefix,
            routes: frontend.routes
        },
        api: {
            prefix: '/auth',
            routes: api.routes
        }
    };
};