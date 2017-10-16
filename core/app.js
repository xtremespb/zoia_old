'use strict';

const log = require('loglevel');
const prefix = require('loglevel-plugin-prefix');
const path = require('path');
const fileUpload = require('express-fileupload');
const express = require('express');
const app = express().set('express', express);
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fs = require('fs');

prefix.apply(log, {
    template: '%t [%l]',
    timestampFormatter: date => date.toLocaleDateString() + ' ' + date.toLocaleTimeString(),
    levelFormatter: level => level.toUpperCase()
});

((async function init() {
    try {
        const config = require(path.join(__dirname, 'config.js'));
        log.setLevel(config.logLevel);
        app.set('log', log);
        app.set('trust proxy', config.trustProxy);
        // Init database
        const db = new(require(path.join(__dirname, 'database.js')))(app, config.mongo, config.session);
        await db.connect();
        app.set('db', db.get());
        // Init parsers and other stuff
        app.use(bodyParser.json(), bodyParser.urlencoded({ extended: true }), cookieParser(), fileUpload(), express.static(path.join(__dirname, '..', 'static')));
        // Load preroutes
        const preroutes = new(require(path.join(__dirname, 'preroutes.js')))(app);
        for (let key of Object.keys(preroutes)) {
            app.use(preroutes[key]);
        }
        // Load modules
        let modules = fs.readdirSync(path.join(__dirname, '..', 'modules'));
        let templateFilters = {};
        let backendModules = [];
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
                if (moduleLoaded.backend && moduleLoaded.backend.routes) {
                    if (moduleLoaded.backend.info) {
                        backendModules.push(moduleLoaded.backend.info);
                    }
                    app.use('/admin' + moduleLoaded.backend.prefix, moduleLoaded.backend.routes);
                }
                if (moduleLoaded.api && moduleLoaded.api.routes) {
                    app.use('/api' + moduleLoaded.api.prefix, moduleLoaded.api.routes);
                }
            }
        }
        app.set('backendModules', backendModules);
        app.set('templateFilters', templateFilters);
        app.set('log', log);
        const errors = new(require(path.join(__dirname, 'errors.js')))(app);
        app.use(errors.notFound, errors.errorHandler);
        app.emit('zoiaStarted');
    } catch (e) {
        // That's error
        log.error(e.stack || e.message);
        process.exit(1);
    }
})());

module.exports = app;