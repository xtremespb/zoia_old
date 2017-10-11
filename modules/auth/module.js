module.exports = function(app) {
    const path = require('path');
    const configModule = require(path.join(__dirname, 'config.js'));
    const api = require(path.join(__dirname, 'api.js'))(app);
    const frontend = require(path.join(__dirname, 'frontend.js'))(app);
    return {
        frontend: {
            prefix: configModule.prefix,
            routes: frontend.routes
        },
        api: {
            prefix: '/auth',
            routes: api.routes
        }
    };
};