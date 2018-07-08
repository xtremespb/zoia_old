module.exports = function(app) {
    const api = require('./api.js')(app);
    const backend = require('./backend.js')(app);
    const frontend = require('./frontend.js')(app);
    const config = require('../../core/config.js');
    app.get('log').info('[brb] module loaded');
    return {
        frontend: {
            prefix: config.core.prefix.account || '/account',
            routes: frontend.routes,
            filters: frontend.filters
        },
        backend: {
            prefix: '/brb',
            routes: backend.routes,
            info: backend.info
        },
        api: {
            prefix: '/brb',
            routes: api.routes
        }
    };
};