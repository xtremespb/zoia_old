module.exports = function(app) {
    const path = require('path');
    // Load the API
    const api = require(path.join(__dirname, 'api.js'))(app);
    // Load the Backend
    const backend = require(path.join(__dirname, 'backend.js'))(app);
    // Return the data
    return {
        // We've got some API
        api: {
            // Prefix to use, currently: /api/example
            prefix: '/example',
            // Export the API routes
            routes: api.routes
        },
        // We've got a Backend
        backend: {
            prefix: '/example',
            routes: backend.routes,
            info: backend.info
        }
    };
};