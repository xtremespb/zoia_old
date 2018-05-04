module.exports = function(app) {
    const path = require('path');
    const frontend = require(path.join(__dirname, 'frontend.js'))(app);
    app.get('log').info('[portfolio] module loaded');
    return {
        frontend: {
            prefix: '/portfolio',
            routes: frontend.routes,
            filters: frontend.filters
        }
    };
};