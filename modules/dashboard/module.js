module.exports = function(app) {
    const path = require('path');
    const backend = require(path.join(__dirname, 'backend.js'))(app);
    const api = require(path.join(__dirname, 'api.js'))(app); 
    app.get('log').info('[dashboard] module loaded');
    return {
        backend: {
            prefix: '/',
            routes: backend.routes,
            info: backend.info
        },
        api: {
            prefix: '/dashboard',
            routes: api.routes
        }
    };
};