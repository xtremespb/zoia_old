module.exports = function(app) {
    const path = require('path');
    const api = require(path.join(__dirname, 'api.js'))(app);
    const backend = require(path.join(__dirname, 'backend.js'))(app);
    app.get('log').info('[updates] module loaded');
    return {
        backend: {
            prefix: '/updates',
            routes: backend.routes,
            info: backend.info
        },
        api: {
            prefix: '/updates',
            routes: api.routes
        }
    };
};