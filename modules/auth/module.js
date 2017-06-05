module.exports = function(app) {
    const path = require("path"),
        api = require(path.join(__dirname, "api.js"))(app);

    return {
        api: {
            prefix: "/auth",
            routes: api.routes
        }
    };
};
