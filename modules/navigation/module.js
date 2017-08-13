module.exports = function(app) {
    const path = require('path');
    const api = require(path.join(__dirname, 'api.js'))(app);
    const frontend = require(path.join(__dirname, 'frontend.js'))(app);
    const backend = require(path.join(__dirname, 'backend.js'))(app);
    return {
        frontend: {
            prefix: '/',
            filters: frontend.filters
        },
        backend: {
            prefix: '/navigation',
            routes: backend.routes,
            info: backend.info
        },
        api: {
            prefix: '/navigation',
            routes: api.routes
        }
    };
};