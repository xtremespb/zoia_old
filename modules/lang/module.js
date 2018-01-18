module.exports = function(app) {
    const path = require('path');
    const api = require(path.join(__dirname, 'api.js'))(app);
    app.get('log').info('[lang] module loaded');
    return {
        api: {
            prefix: '/lang',
            routes: api.routes
        }
    };
};