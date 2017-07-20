const path = require('path'),
    Module = require(path.join(__dirname, '..', '..', 'core', 'module.js')),
    validation = new(require(path.join(__dirname, '..', '..', 'core', 'validation.js'))),
    Router = require('co-router'),
    crypto = require('crypto'),
    config = require(path.join(__dirname, '..', '..', 'etc', 'config.js')),
    ObjectID = require('mongodb').ObjectID,
    usersFields = require(path.join(__dirname, 'schemas', 'usersFields.js'));

module.exports = function(app) {

    const i18n = new(require(path.join(__dirname, '..', '..', 'core', 'i18n.js')))(path.join(__dirname, 'lang'), app),
        mailer = new(require(path.join(__dirname, '..', '..', 'core', 'mailer.js')))(app),
        render = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, 'views'), undefined, app),
        log = app.get('log'),
        db = app.get('db');

    const sortFields = ['username', 'email', 'status'];

    let list = async function(req, res, next) {
        res.contentType('application/json');
        if (!Module.isAuthorizedAdmin(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
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
            }));
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
            const items = await db.collection('users').find(fquery, { skip: skip, limit: limit }).sort(sort).toArray();
            let data = {
                status: 1,
                count: items.length,
                total: total,
                items: items
            }
            res.send(JSON.stringify(data));
        } catch (e) {
            res.send(JSON.stringify({
                status: 0,
                error: e.message
            }));
        }
    };

    let load = async function(req, res, next) {
        res.contentType('application/json');
        if (!Module.isAuthorizedAdmin(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        const id = req.query.id;
        if (!id || typeof id != 'string' || !id.match(/^[a-f0-9]{24}$/)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        try {
            const item = await db.collection('users').findOne({ _id: new ObjectID(id) });
            if (!item) {
                return res.send(JSON.stringify({
                    status: 0
                }));
            }
            return res.send(JSON.stringify({
                status: 1,
                item: {
                    _id: item._id,
                    username: item.username,
                    email: item.email,
                    status: item.status
                }
            }));
        } catch (e) {
            res.send(JSON.stringify({
                status: 0,
                error: e.message
            }));
        }
    };

    let save = async function(req, res, next) {
        res.contentType('application/json');
        if (!Module.isAuthorizedAdmin(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        const id = req.body.id;
        if (id && (typeof id != 'string' || !id.match(/^[a-f0-9]{24}$/))) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        let output = {};
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        const fieldList = usersFields.getUsersFields(id ? false : true);
        let fields = validation.checkRequest(req, fieldList);
        let fieldsFailed = validation.getCheckRequestFailedFields(fields);
        if (fieldsFailed.length > 0) {
            output.status = 0;
            output.fields = fieldsFailed;
            return res.send(JSON.stringify(output));
        }
        try {
            if (id) {
                const user = await db.collection('users').findOne({ _id: new ObjectID(id) });
                if (user == null) {
                    output.status = -1;
                    output.fields = ['username'];
                    return res.send(JSON.stringify(output));
                }
                if (fields.username.value != user.username) {
                    const userDuplicate = await db.collection('users').findOne({ username: fields.username.value });
                    if (userDuplicate) {
                        output.status = -2;
                        output.fields = ['username'];
                        return res.send(JSON.stringify(output));
                    }
                }
            } else {
                const userDuplicate = await db.collection('users').findOne({ username: fields.username.value });
                if (userDuplicate) {
                    output.status = -2;
                    output.fields = ['username'];
                    return res.send(JSON.stringify(output));
                }
            }
            let update = {
                username: fields.username.value,
                email: fields.email.value,
                status: fields.status.value
            };
            if (fields.password.value) {
                update.password = fields.password.value;
            }
            let what = id ? { _id: new ObjectID(id) } : { username: fields.username.value };
            let updResult = await db.collection('users').update(what, { $set: update }, { upsert: true });
            if (!updResult || !updResult.result || !updResult.result.ok) {
                output.status = 0;
                return res.send(JSON.stringify(output));
            }
            output.status = 1;
            return res.send(JSON.stringify(output));
        } catch (e) {
            output.status = 0;
            log.error(e);
            res.send(JSON.stringify(output));
        }
    };

    let del = async function(req, res, next) {
        res.contentType('application/json');
        if (!Module.isAuthorizedAdmin(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        let output = {};
        let ids = req.body['id[]'];
        if (!ids || (typeof ids != 'object' && typeof ids != 'string') || !ids.length) {
            output.status = -1;
            return res.send(JSON.stringify(output));
        }
        if (typeof ids == 'string') {
            const id = ids;
            ids = [];
            ids.push(id);
        }
        let did = [];
        for (let i in ids) {
            const id = ids[i];
            if (!id.match(/^[a-f0-9]{24}$/)) {
                output.status = -2;
                return res.send(JSON.stringify(output));
            }
            did.push({ _id: new ObjectID(id) });
        }
        try {
            var delResult = await db.collection('users').deleteMany({
                $or: did
            });
            if (!delResult || !delResult.result || !delResult.result.ok || delResult.result.n != ids.length) {
                output.status = -3;
                return res.send(JSON.stringify(output));
            }
            output.status = 1;
            res.send(JSON.stringify(output));
        } catch (e) {
            output.status = 0;
            log.error(e);
            res.send(JSON.stringify(output));
        }
    };

    let router = Router();
    router.get('/list', list);
    router.get('/load', load);
    router.post('/save', save);
    router.post('/delete', del);

    return {
        routes: router
    }

}