module.exports = function(app) {
    const config = require('../../core/config.js');
    const api = require('./api.js')(app);
    const frontend = require('./frontend.js')(app);
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