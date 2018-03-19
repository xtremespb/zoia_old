module.exports = function(app) {
    const path = require('path');
    const api = require(path.join(__dirname, 'api.js'))(app);
    const backend = require(path.join(__dirname, 'backend.js'))(app);
    app.get('log').info('[hosting] module loaded');
    return {
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