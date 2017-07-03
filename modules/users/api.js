const path = require('path'),
    Module = require(path.join(__dirname, '..', '..', 'core', 'module.js')),
    shared = require(path.join(__dirname, '..', '..', 'static', 'zoia', 'core', 'js', 'shared.js')),
    Router = require('co-router'),
    crypto = require('crypto'),
    config = require(path.join(__dirname, '..', '..', 'etc', 'config.js'));

module.exports = function(app) {

    const i18n = new(require(path.join(__dirname, '..', '..', 'core', 'i18n.js')))(path.join(__dirname, 'lang'), app),
        mailer = new(require(path.join(__dirname, '..', '..', 'core', 'mailer.js')))(app),
        render = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, 'views'), undefined, app),
        log = app.get('log');

    const sortFields = ['username', 'email', 'status'];

    let list = async function(req, res, next) {
        res.contentType('application/json');
        const db = app.get('db');
        const sortField = req.query.sortField || 'username';
        const sortDirection = (req.query.sortDirection == 'asc') ? 1 : -1;
        const sort = {};
        sort[sortField] = sortDirection;
        let skip = req.query.skip || 0;
        let limit = req.query.limit || 10;
        let search = req.query.search || '';
        if (typeof sortField != 'string' || typeof skip != 'string' || typeof limit != 'string' || typeof search != 'string') {
            return res.send(JSON.stringify({
                status: 0
            }))
        }
        skip = parseInt(skip) || 0;
        limit = parseInt(limit) || 0;
        search = search.trim();
        if (search.length < 3) {
            search = undefined;
        }
        let result = {
            status: 0
        };
        if (sortFields.indexOf(sortField) == -1) {
            result.failedField = 'sortField';
            return res.send(result);
        }
        let fquery = {};
        try {
            if (search) {
                fquery = {
                    $or: [
                        { username: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } }
                    ]
                };
            }
            const total = await db.collection('users').find(fquery, { skip: skip, limit: limit }).count();
            const test = await db.collection('users').find(fquery, { skip: skip, limit: limit }).sort(sort).toArray();
            let data = {
                status: 1,
                count: test.length,
                total: total,
                items: test
            }
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
    }

}
