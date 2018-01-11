module.exports = function(app) {
    const path = require('path');
    const backend = require(path.join(__dirname, 'backend.js'))(app);
    const api = require(path.join(__dirname, 'api.js'))(app);
    return {
        backend: {
            prefix: '/backup',
            routes: backend.routes,
            info: backend.info
        },
        api: {
            prefix: '/backup',
            routes: api.routes
        }
    };
};