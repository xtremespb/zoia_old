module.exports = function(app) {
    const path = require('path');
    const api = require(path.join(__dirname, 'api.js'))(app);
    const backend = require(path.join(__dirname, 'backend.js'))(app);
    const frontend = require(path.join(__dirname, 'frontend.js'))(app);
    return {
        frontend: {
            prefix: '/',
            routes: frontend.routes,
            filters: frontend.filters
        },
        backend: {
            prefix: '/pages',
            routes: backend.routes,
            info: backend.info
        },
        api: {
            prefix: '/pages',
            routes: api.routes
        }
    };
};