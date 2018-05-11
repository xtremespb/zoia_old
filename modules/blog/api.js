const pathM = require('path');
const Module = require(pathM.join(__dirname, '..', '..', 'core', 'module.js'));
const validation = new(require(pathM.join(__dirname, '..', '..', 'core', 'validation.js')))();
const Router = require('co-router');
const blogFields = require(pathM.join(__dirname, 'schemas', 'blogFields.js'));
const config = require(pathM.join(__dirname, '..', '..', 'core', 'config.js'));

module.exports = function(app) {
    const log = app.get('log');
    const db = app.get('db');
    const sortFields = ['timestamp', 'title', 'status', '_id'];

    const list = async(req, res) => {
        const locale = req.session.currentLocale;
        res.contentType('application/json');
        if (!Module.isAuthorizedAdmin(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        const sortField = req.query.sortField || 'date';
        const sortDirection = (req.query.sortDirection === 'asc') ? 1 : -1;
        const sort = {};
        sort[sortField] = sortDirection;
        if (sortField === 'title') {
            sort[locale + '.title'] = sortDirection;
        }
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
                let tfq = {};
                tfq[locale + '.title'] = { $regex: search, $options: 'i' };
                fquery.$or.push(tfq);
            }
            let ffields = { _id: 1, status: 1, timestamp: 1 };
            ffields[locale + '.title'] = 1;
            const total = await db.collection('blog').find(fquery).count();
            const items = await db.collection('blog').find(fquery, { skip: skip, limit: limit, sort: sort, projection: ffields }).toArray();
            for (let i in items) {
                if (items[i][locale]) {
                    items[i].title = items[i][locale].title;
                    delete items[i][locale].title;
                    delete items[i][locale];
                }
            }
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

    const load = async(req, res) => {
        res.contentType('application/json');
        if (!Module.isAuthorizedAdmin(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        const id = req.query.id;
        if (!id || typeof id !== 'string' || !id.match(/^[0-9]{1,10}$/)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        try {
            const item = await db.collection('blog').findOne({ _id: parseInt(id, 10) });
            if (!item) {
                return res.send(JSON.stringify({
                    status: 0
                }));
            }
            for (let i in config.i18n.locales) {
                let lng = config.i18n.locales[i];
                item[lng].content = item[lng].content_p1 + (item[lng].content_p2.length ? '{{cut}}' + item[lng].content_p2 : '');
                delete item[lng].content_p1;
                delete item[lng].content_p2;
                item[lng].keywords = Array.isArray(item[lng].keywords) ? item[lng].keywords.join(',') : '';
            }
            return res.send(JSON.stringify({
                status: 1,
                item: item
            }));
        } catch (e) {
            res.send(JSON.stringify({
                status: 0,
                error: e.message
            }));
        }
    };

    const save = async(req, res) => {
        res.contentType('application/json');
        if (!Module.isAuthorizedAdmin(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        const postId = req.body.id;
        if (postId && (typeof postId !== 'string' || !postId.match(/^[0-9]{1,10}$/))) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        const fieldList = blogFields.getBlogFields();
        let output = {};
        let data = {};
        try {
            for (let i in config.i18n.locales) {
                let lng = config.i18n.locales[i];
                data[lng] = {};
                if (req.body[lng]) {
                    let fields = validation.checkRequest(req.body[lng], fieldList);
                    let fieldsFailed = validation.getCheckRequestFailedFields(fields);
                    if (fieldsFailed.length > 0) {
                        output.status = 0;
                        output.fields = fieldsFailed;
                        return res.send(JSON.stringify(output));
                    }
                    let content_p1 = fields.content.value;
                    let content_p2 = '';
                    let cut = false;
                    if (fields.content.value.match(/{{cut}}/)) {
                        [content_p1, content_p2] = fields.content.value.split(/{{cut}}/);
                        cut = true;
                    }
                    const keywords = fields.keywords.value.split(/,/);
                    data[lng] = {
                        title: fields.title.value,
                        keywords: keywords,
                        content_p1: content_p1,
                        content_p2: content_p2,
                        cut: cut
                    };
                    data.status = fields.status.value;
                    data.template = fields.template.value;
                }
            }
            if (postId) {
                let page = await db.collection('blog').findOne({ _id: parseInt(postId) });
                if (!page) {
                    output.status = -1;
                    return res.send(JSON.stringify(output));
                }
            } else {
                data.timestamp = parseInt(Date.now() / 1000);
                data.authorId = String(req.session.auth._id);
            }
            const incr = await db.collection('blog_counters').findAndModify({ _id: 'posts' }, [], { $inc: { seq: 1 } }, { new: true, upsert: true });
            if (!incr || !incr.value || !incr.value.seq) {
                return res.send(JSON.stringify({
                    status: 0
                }));
            }
            let what = postId ? { _id: parseInt(postId, 10) } : { _id: parseInt(incr.value.seq, 10) };
            let updResult = await db.collection('blog').update(what, { $set: data }, { upsert: true });
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

    const del = async(req, res) => {
        res.contentType('application/json');
        if (!Module.isAuthorizedAdmin(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        let output = {};
        let ids = req.body['id'];
        if (!ids || (typeof ids !== 'object' && typeof ids !== 'string') || !ids.length) {
            output.status = -1;
            return res.send(JSON.stringify(output));
        }
        if (typeof ids === 'string') {
            const id = ids;
            ids = [];
            ids.push(id);
        }
        let did = [];
        for (let i in ids) {
            const id = ids[i];
            if (!id.match(/^[0-9]{1,10}$/)) {
                output.status = -2;
                return res.send(JSON.stringify(output));
            }
            did.push({ _id: parseInt(id, 10) });
        }
        try {
            const delResult = await db.collection('blog').deleteMany({
                $or: did
            });
            if (!delResult || !delResult.result || !delResult.result.ok || delResult.result.n !== ids.length) {
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

    const commentAdd = async(req, res) => {
        res.contentType('application/json');
        if (!Module.isAuthorized(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        let comment = req.body.comment;
        let parentId = req.body.parentId || null;
        let postId = req.body.postId;
        if (!comment || typeof comment !== 'string' || comment.length > 512 ||
            !postId || typeof postId !== 'string' || !postId.match(/^[0-9]{1,10}$/) ||
            parentId && (typeof parentId !== 'string' || !parentId.match(/^[a-f0-9]{24}$/))) {
            return res.send(JSON.stringify({
                status: -1
            }));
        }
        try {
            // TODO: check if parent comment exists!
            const timestamp = parseInt(Date.now() / 1000, 10);
            const insResult = await db.collection('blog_comments').insertOne({
                userId: String(req.session.auth._id),
                postId: parseInt(postId, 10),
                parentId: parentId,
                comment: comment,
                timestamp: timestamp
            });
            if (!insResult || !insResult.result || !insResult.result.ok || !insResult.insertedId) {
                return res.send(JSON.stringify({
                    status: -2
                }));
            }
            let url = '/users/static/pictures/large_default.png';
            try {
                await fs.access(path.join(__dirname, '..', 'users', 'static', 'pictures', 'small_' + req.session.auth._id + '.jpg'), fs.constants.F_OK);
                userData[item.authorId].url = '/users/static/pictures/small_' + req.session.auth._id + '.jpg';
            } catch (e) {
                // Ignore
            }
            return res.send(JSON.stringify({
                status: 1,
                parendId: insResult.insertedId,
                url: url,
                comment: comment,
                timestamp: timestamp,
                username: req.session.auth.realname || req.session.auth.username
            }));
        } catch (e) {
            log.error(e);
            return res.send(JSON.stringify({
                status: 0
            }));
        }
    };

    const loadComments = async(req, res) => {
        res.contentType('application/json');
        if (!Module.isAuthorized(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        let postId = req.body.postId || req.query.postId;
        if (!postId || typeof postId !== 'string' || !postId.match(/^[0-9]{1,10}$/)) {
            return res.send(JSON.stringify({
                status: -1
            }));
        }
        try {
            const comments = await db.collection('blog_comments').find({ postId: parseInt(postId, 10) }).toArray();
            if (!comments) {
                return res.send(JSON.stringify({
                    status: -1
                }));
            }
            return res.send(JSON.stringify({
                status: 1,
                comments: comments
            }));
        } catch (e) {
            log.error(e);
            return res.send(JSON.stringify({
                status: 0
            }));
        }
    };

    let router = Router();
    router.get('/list', list);
    router.get('/load', load);
    router.post('/save', save);
    router.post('/delete', del);
    router.post('/comments/add', commentAdd);
    router.post('/comments/load', loadComments);

    return {
        routes: router
    };
};