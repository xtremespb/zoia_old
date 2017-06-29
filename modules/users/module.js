module.exports = function(app) {
    const path = require('path'),
        api = require(path.join(__dirname, 'api.js'))(app),
        backend = require(path.join(__dirname, 'backend.js'))(app);

    return {
        frontend: {
            prefix: '/auth',
            routes: frontend.routes
        },
        api: {
            prefix: '/auth',
            routes: api.routes
        }
    };
};
