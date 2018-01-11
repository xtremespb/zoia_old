const path = require('path');
const Module = require(path.join(__dirname, '..', '..', 'core', 'module.js'));
const Router = require('co-router');
const ObjectID = require('mongodb').ObjectID;
const config = require(path.join(__dirname, '..', '..', 'core', 'config.js'));
const fs = require('fs-extra');
const tar = require('tar');
const dookie = require('dookie');

module.exports = function(app) {
    const log = app.get('log');
    const db = app.get('db');

    const create = async(req, res) => {
        const locale = req.session.currentLocale;
        res.contentType('application/json');
        if (!Module.isAuthorizedAdmin(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        try {
            const insResult = await db.collection('backup_tasks').insertOne({
                state: 1
            });
            if (!insResult || !insResult.result || !insResult.result.ok || !insResult.insertedId) {
                return res.send(JSON.stringify({
                    status: -1
                }));
            }
            const taskId = insResult.insertedId;
            setTimeout(function() {
                
            }, 0);
            res.send(JSON.stringify({
                status: 1,
                taskId: taskId
            }));
        } catch (e) {
            res.send(JSON.stringify({
                status: 0,
                error: e.message
            }));
        }
    };

    let router = Router();
    router.get('/create', create);
    return {
        routes: router
    };
};