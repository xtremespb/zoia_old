module.exports = function(app) {
    const path = require('path');
    const api = require(path.join(__dirname, 'api.js'))(app);
    const backend = require(path.join(__dirname, 'backend.js'))(app);
    const frontend = require(path.join(__dirname, 'frontend.js'))(app);
    app.get('log').info('[reviews] module loaded');
    return {
        frontend: {
            prefix: '/reviews',
            routes: frontend.routes,
            filters: frontend.filters
        },
        backend: {
            prefix: '/reviews',
            routes: backend.routes,
            info: backend.info
        },
        api: {
            prefix: '/reviews',
            routes: api.routes
        }
    };
};