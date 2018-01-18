const path = require('path');
module.exports = function(app) {
    const api = require(path.join(__dirname, 'api.js'))(app);
    app.get('log').info('[captcha] module loaded');
    return {
        api: {
            prefix: '/captcha',
            routes: api.routes
        }
    };
};
