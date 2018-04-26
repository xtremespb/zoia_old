module.exports = function(app) {
    const path = require('path');
    const api = require(path.join(__dirname, 'api.js'))(app);
    const frontend = require(path.join(__dirname, 'frontend.js'))(app);
    app.get('log').info('[lang] module loaded');
    return {
        frontend: {
            prefix: '/',
            filters: frontend.filters
        },
        api: {
            prefix: '/lang',
            routes: api.routes
        }
    };
};