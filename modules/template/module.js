module.exports = function(app) {
    const path = require("path"),
        frontend = require(path.join(__dirname, "frontend.js"))(app),
        backend = require(path.join(__dirname, "backend.js"))(app);

    return {
        backend: {
            prefix: "/template",
            routes: backend.routes
        },
        frontend: {
            prefix: "/template",
            routes: frontend.routes,
            filters: frontend.filters
        }
    };
};
