module.exports = function(app) {
    const path = require('path');
    const api = require(path.join(__dirname, 'api.js'))(app);
    const backend = require(path.join(__dirname, 'backend.js'))(app);
    const frontend = require(path.join(__dirname, 'frontend.js'))(app);
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