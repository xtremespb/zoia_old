module.exports = function(app) {
    const path = require('path'),
        api = require(path.join(__dirname, 'api.js'))(app),
        backend = require(path.join(__dirname, 'backend.js'))(app);

    return {
        backend: {
            prefix: '/users',
            routes: backend.routes,
            info: backend.info
        },
        api: {
            prefix: '/users',
            routes: api.routes
        }
    };
};
