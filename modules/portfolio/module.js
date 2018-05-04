module.exports = function(app) {
    const path = require('path');
    const frontend = require(path.join(__dirname, 'frontend.js'))(app);
    let configModule;
    try {
        configModule = require(path.join(__dirname, 'config', 'portfolio.json'));
    } catch (e) {
        configModule = require(path.join(__dirname, 'config', 'portfolio.dist.json'));
    }
    app.get('log').info('[portfolio] module loaded');
    return {
        frontend: {
            prefix: configModule.prefix,
            routes: frontend.routes,
            filters: frontend.filters
        }
    };
};