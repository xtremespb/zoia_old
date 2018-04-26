module.exports = function(app) {
    const path = require('path');
    const config = require(path.join(__dirname, '..', '..', 'core', 'config.js'));
    const api = require(path.join(__dirname, 'api.js'))(app);
    const frontend = require(path.join(__dirname, 'frontend.js'))(app);
    app.get('log').info('[auth] module loaded');
    return {
        frontend: {
            prefix: config.core.prefix.auth,
            routes: frontend.routes
        },
        api: {
            prefix: '/auth',
            routes: api.routes
        }
    };
};