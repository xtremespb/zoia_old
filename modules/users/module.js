module.exports = function(app) {
    const path = require('path');
    const api = require(path.join(__dirname, 'api.js'))(app);
    const backend = require(path.join(__dirname, 'backend.js'))(app);
    const frontend = require(path.join(__dirname, 'frontend.js'))(app);
    const config = require(path.join(__dirname, '..', '..', 'core', 'config.js'));
    app.get('log').info('[users] module loaded');
    return {
        frontend: {
            prefix: config.core.prefix.account || '/account',
            routes: frontend.routes,
            filters: frontend.filters
        },
        backend: {
            prefix: '/users',
            routes: backend.routes,
            info: backend.info
        },
        api: {
            prefix: '/users',
            routes: api.routes
        }
    };
};