module.exports = function(app) {
    const path = require('path');
    const api = require(path.join(__dirname, 'api.js'))(app);
    const backend = require(path.join(__dirname, 'backend.js'))(app);
    return {
        backend: {
            prefix: '/warehouse',
            routes: backend.routes,
            info: backend.info
        },
        api: {
            prefix: '/warehouse',
            routes: api.routes
        }
    };
};