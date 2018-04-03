const path = require('path');
const Module = require(path.join(__dirname, '..', '..', 'core', 'module.js'));
const Router = require('co-router');
const ObjectID = require('mongodb').ObjectID;
const crypto = require('crypto');
const config = require(path.join(__dirname, '..', '..', 'core', 'config.js'));

module.exports = function(app) {
    const log = app.get('log');
    const db = app.get('db');

    const sortFields = ['_id', 'status', 'timestamp', 'username', 'title'];

    const list = async(req, res) => {
        res.contentType('application/json');
        if (!Module.isAuthorizedAdmin(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        const sortField = req.query.sortField || 'timestamp';
        const sortDirection = (req.query.sortDirection === 'asc') ? 1 : -1;
        const sort = {};
        sort[sortField] = sortDirection;
        let skip = req.query.skip || 0;
        let limit = req.query.limit || 10;
        let search = req.query.search || '';
        if (typeof sortField !== 'string' || typeof skip !== 'string' || typeof limit !== 'string' || typeof search !== 'string') {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        skip = parseInt(skip, 10) || 0;
        limit = parseInt(limit, 10) || 0;
        search = search.trim();
        if (search.length < 3) {
            search = null;
        }
        let result = {
            status: 0
        };
        if (sortFields.indexOf(sortField) === -1) {
            result.failedField = 'sortField';
            return res.send(result);
        }
        let fquery = {};
        try {
            if (search) {
                fquery = {
                    $or: [
                        { name: { $regex: search, $options: 'i' } }
                    ]
                };
            }
            const total = await db.collection('support').find(fquery).count();
            const items = await db.collection('support').find(fquery, { skip: skip, limit: limit, sort: sort }).toArray();
            let data = {
                status: 1,
                count: items.length,
                total: total,
                items: items
            };
            res.send(JSON.stringify(data));
        } catch (e) {
            res.send(JSON.stringify({
                status: 0,
                error: e.message
            }));
        }
    };

    let router = Router();
    router.get('/list', list);

    return {
        routes: router
    };
};