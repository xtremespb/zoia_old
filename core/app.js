'use strict';

const path = require('path'),
    config = require(path.join(__dirname, '..', 'etc', 'config.js')),
    express = require('express'),
    app = express().set('express', express),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    cowrap = require('co-express'),
    fs = require('fs');

(async function init() {
    // Init database
    const db = new(require(path.join(__dirname, 'database.js')))(app, config.mongo, config.session);
    await db.connect();
    // Init parsers and other stuff
    app.use(bodyParser.json(), bodyParser.urlencoded({ extended: false }), cookieParser(), express.static(path.join(__dirname, '..', 'public')));
    // Load modules
    let modules = fs.readdirSync(path.join(__dirname, '..', 'modules')),
        templateFilters = {};
    for (let m in modules) {
        let moduleLoaded = require(path.join(__dirname, '..', 'modules', modules[m], 'module'))(app);
        if (moduleLoaded) {
            if (moduleLoaded.frontend) {
                if (moduleLoaded.frontend.routes) {
                    app.use(moduleLoaded.frontend.prefix, moduleLoaded.frontend.routes);
                }
                if (moduleLoaded.frontend.filters) {
                    for (let f in moduleLoaded.frontend.filters) {
                        templateFilters[f] = moduleLoaded.frontend.filters[f];
                    }
                }
            }
        }
    }
    app.set('templateFilters', templateFilters);
    const errors = new(require(path.join(__dirname, 'errors.js')))(app);
    app.use(errors.notFound, cowrap(errors.errorHandler));
})();

module.exports = app;