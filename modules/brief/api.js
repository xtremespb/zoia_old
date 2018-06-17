const Module = require('../../core/module.js');
const validation = new(require('../../core/validation.js'))();
const Router = require('co-router');
const briefFields = require('./schemas/briefFields.js');
const config = require('../../core/config.js');
const ObjectID = require('mongodb').ObjectID;

module.exports = function(app) {
    const log = app.get('log');
    const db = app.get('db');
    const security = new(require('../../core/security.js'))(app);
    const i18n = new(require('../../core/i18n.js'))(`${__dirname}/lang`, app);

    let router = Router();

    return {
        routes: router
    };
};