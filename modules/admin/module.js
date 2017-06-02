module.exports = function(app) {
    const path = require("path"),
        frontend = require(path.join(__dirname, "frontend.js"))(app);

    return {
        frontend: {
            prefix: "/admin",
            routes: frontend.routes,
            filters: frontend.filters
        }
    };
}; 