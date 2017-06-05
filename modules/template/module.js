module.exports = function(app) {
    const path = require("path"),
        frontend = require(path.join(__dirname, "frontend.js"))(app),
        backend = require(path.join(__dirname, "backend.js"))(app),
        api = require(path.join(__dirname, "api.js"))(app);

    return {
        backend: {
            prefix: "/template",
            routes: backend.routes,
            info: backend.info
        },
        frontend: {
            prefix: "/template",
            routes: frontend.routes,
            filters: frontend.filters
        },
        api: {
            prefix: "/template",
            routes: api.routes
        }
    };
};
