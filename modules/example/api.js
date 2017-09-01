const path = require('path');
// Load helper fundctions from Module.js
const Module = require(path.join(__dirname, '..', '..', 'core', 'module.js'));
// Load validation module (core)
const validation = new(require(path.join(__dirname, '..', '..', 'core', 'validation.js')))();
// Use co-router instead of router to support async functions
const Router = require('co-router');
// Load configuration file when required
// const config = require(path.join(__dirname, '..', '..', 'etc', 'config.js'));
// Load example validation scheme
const exampleFields = require(path.join(__dirname, 'schemas', 'exampleFields.js'));

module.exports = function(app) {
    // Load logging module (https://www.npmjs.com/package/loglevel)
    const log = app.get('log');
    // Load database instance
    const db = app.get('db');
    // This is /api/example/email route
    const email = async(req, res) => {
        // We will return JSON here
        res.contentType('application/json');
        // If not authorized as admin (status=2), reject
        if (!Module.isAuthorizedAdmin(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        // Load validation scheme
        const fieldList = exampleFields.getExampleFields();
        // Check if request match our validation scheme
        let fields = validation.checkRequest(req, fieldList);
        // Get list of non-validated (failed) fields
        let fieldsFailed = validation.getCheckRequestFailedFields(fields);
        // If there are any failed fields, return
        if (fieldsFailed.length > 0) {
            return res.send(JSON.stringify({
                status: 0,
                fields: fieldsFailed
            }));
        }
        try {
            // Get data from database (username = requested username)
            const items = await db.collection('users').find({ username: fields.username.value }).toArray();
            // If there're no items, let's return an error
            if (!items || !items.length) {
                throw new Error('No e-mail address found');
            }
            // Make data hash...
            let data = {
                status: 1,
                email: items[0].email
            };
            // ...and return it back
            res.send(JSON.stringify(data));
        } catch (e) {
            // Log the error occured
            log.error(e);
            // Send the error back to user
            res.send(JSON.stringify({
                status: 0,
                error: e.message
            }));
        }
    };
    // This is /api/example/mystatus route
    const mystatus = async(req, res) => {
        // We will return JSON here
        res.contentType('application/json');
        // If not authorized (status<1), reject
        if (!Module.isAuthorized(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        try {
            // Get data from database (username = current username authorized)
            const items = await db.collection('users').find({ username: req.session.auth.username }).toArray();
            // If there're no items, let's return an error
            if (!items || !items.length) {
                throw new Error('No e-mail address found');
            }
            // Make data hash...
            let data = {
                status: 1,
                userStatus: items[0].status
            };
            // ...and return it back
            res.send(JSON.stringify(data));
        } catch (e) {
            // Log the error occured
            log.error(e);
            // Send the error back to user
            res.send(JSON.stringify({
                status: 0,
                error: e.message
            }));
        }
    };
    // Create Router instance
    let router = Router();
    // Define routes (use either get or post here)
    router.get('/email', email);
    router.get('/mystatus', mystatus);
    // Return routes
    return {
        routes: router
    };
};