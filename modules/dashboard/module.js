module.exports = function(app) {
    const path = require('path'),
        backend = require(path.join(__dirname, 'backend.js'))(app);

    return {
        backend: {
            prefix: '/',
            routes: backend.routes,
            info: backend.info
        }
    };
};
