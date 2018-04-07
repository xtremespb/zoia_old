const path = require('path');
const Module = require(path.join(__dirname, '..', '..', 'core', 'module.js'));
const Router = require('co-router');
const ObjectID = require('mongodb').ObjectID;
const crypto = require('crypto');
const config = require(path.join(__dirname, '..', '..', 'core', 'config.js'));
const fs = require('fs-extra');

let configModule;
try {
    configModule = require(path.join(__dirname, 'config', 'support.json'));
} catch (e) {
    configModule = require(path.join(__dirname, 'config', 'support.dist.json'));
}

module.exports = function(app) {
    const log = app.get('log');
    const db = app.get('db');
    const i18n = new(require(path.join(__dirname, '..', '..', 'core', 'i18n.js')))(path.join(__dirname, 'lang'), app);

    const sortFields = ['_id', 'status', 'timestamp', 'username', 'title', 'priority'];

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
            const items = await db.collection('support').find(fquery, { skip: skip, limit: limit, sort: sort, projection: { _id: 1, timestamp: 1, title: 1, username: 1, status: 1, priority: 1 } }).toArray();
            for (let i in items) {
                items[i].title = items[i].title.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/'/g, '&quot;')
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

    const loadRequest = async(req, res) => {
        res.contentType('application/json');
        if (!Module.isAuthorizedAdmin(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        const id = req.query.id;
        if (!id || typeof id !== 'string' || !id.match(/^[0-9]+$/)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        try {
            const data = await db.collection('support').findOne({ _id: parseInt(id) });
            if (!data) {
                return res.send(JSON.stringify({
                    status: 0
                }));
            }
            data.title = data.title.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/'/g, '&quot;');
            if (data.messages) {
                for (let i in data.messages) {
                    data.messages[i].message = data.messages[i].message.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/'/g, '&quot;');
                }
            }
            res.send(JSON.stringify({
                status: 1,
                data: data
            }));
        } catch (e) {
            log.error(e);
            res.send(JSON.stringify({
                status: 0,
                error: e.message
            }));
        }
    };

    const saveMessage = async(req, res) => {
        res.contentType('application/json');
        if (!Module.isAuthorizedAdmin(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        const id = req.body.id;
        const msgId = req.body.msgId;
        const msg = req.body.msg;
        if (!id || typeof id !== 'string' || !id.match(/^[0-9]+$/) ||
            (msgId && (typeof msgId !== 'string' || !msgId.match(/^[0-9]+$/))) ||
            !msg || typeof id !== 'string' || msg.lentgh > 4096) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        try {
            const data = await db.collection('support').findOne({ _id: parseInt(id) });
            if (!data) {
                return res.send(JSON.stringify({
                    status: 0
                }));
            }
            let messages = data.messages || [];
            let message;
            if (msgId) {
                for (let i in messages) {
                    if (parseInt(messages[i].id) === parseInt(msgId)) {
                        messages[i].message = msg;
                        message = messages[i];
                        break;
                    }
                }
                if (!message) {
                    return res.send(JSON.stringify({
                        status: 0
                    }));
                }
            } else {
                message = {
                    username: req.session.auth.username,
                    id: parseInt(Date.now(), 10),
                    timestamp: parseInt(Date.now() / 1000, 10),
                    message: msg
                };
                messages.push(message);
            }
            let updResult = await db.collection('support').update({ _id: parseInt(id) }, { $set: { messages: messages } }, { upsert: true });
            if (!updResult || !updResult.result || !updResult.result.ok) {
                return res.send(JSON.stringify({
                    status: 0
                }));
            }
            res.send(JSON.stringify({
                status: 1,
                message: message
            }));
        } catch (e) {
            log.error(e);
            res.send(JSON.stringify({
                status: 0,
                error: e.message
            }));
        }
    };

    const saveRequestCommon = async(req, res) => {
        res.contentType('application/json');
        if (!Module.isAuthorizedAdmin(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        const id = req.body.id;
        const title = req.body.title;
        const status = req.body.status;
        const priority = req.body.priority;
        if (!id || typeof id !== 'string' || !id.match(/^[0-9]+$/) ||
            !status || (status !== '0' && status !== '1' && status !== '2') ||
            !priority || (priority !== '0' && priority !== '1' && priority !== '2' && priority !== '3') ||
            !title || typeof title !== 'string' || title.lentgh > 512) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        try {
            let updResult = await db.collection('support').update({ _id: parseInt(id, 10) }, { $set: { title: title, status: parseInt(status, 10), priority: parseInt(priority, 10) } }, { upsert: false });
            if (!updResult || !updResult.result || !updResult.result.ok) {
                return res.send(JSON.stringify({
                    status: 0
                }));
            }
            res.send(JSON.stringify({
                status: 1
            }));
        } catch (e) {
            log.error(e);
            res.send(JSON.stringify({
                status: 0,
                error: e.message
            }));
        }
    };

    const deleteMessage = async(req, res) => {
        res.contentType('application/json');
        if (!Module.isAuthorizedAdmin(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        const id = req.body.id;
        const msgId = req.body.msgId;
        if (!id || typeof id !== 'string' || !id.match(/^[0-9]+$/) ||
            !msgId || typeof msgId !== 'string' || !msgId.match(/^[0-9]+$/)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        try {
            const data = await db.collection('support').findOne({ _id: parseInt(id) });
            if (!data) {
                return res.send(JSON.stringify({
                    status: 0
                }));
            }
            let messages = data.messages || [];
            let num;
            for (let i in messages) {
                if (parseInt(messages[i].id) === parseInt(msgId)) {
                    num = i;
                    break;
                }
            }
            if (!num) {
                return res.send(JSON.stringify({
                    status: 0
                }));
            }
            messages.splice(num, 1);
            let updResult = await db.collection('support').update({ _id: parseInt(id) }, { $set: { messages: messages } }, { upsert: true });
            if (!updResult || !updResult.result || !updResult.result.ok) {
                return res.send(JSON.stringify({
                    status: 0
                }));
            }
            res.send(JSON.stringify({
                status: 1
            }));
        } catch (e) {
            log.error(e);
            res.send(JSON.stringify({
                status: 0,
                error: e.message
            }));
        }
    };

    const attachmentUpload = async(req, res) => {
        res.contentType('application/json');
        if (!Module.isAuthorizedAdmin(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        const locale = req.session.currentLocale;
        const id = req.body.id;
        if (!id || typeof id !== 'string' || !id.match(/^[0-9]+$/) ||
            !req.files || typeof req.files !== 'object' || !req.files['files[]'] || !req.files['files[]'].name || !req.files['files[]'].data ||
            !req.files['files[]'].data.length || req.files['files[]'].data.length > configModule.maxAttachmentSizeMB * 1048576) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        const file = req.files['files[]'];
        const filename = Module.sanitizeFilename(file.name);
        const dir = path.join(__dirname, 'storage', id);
        try {
            const data = await db.collection('support').findOne({ _id: parseInt(id) });
            if (!data) {
                return res.send(JSON.stringify({
                    status: 0
                }));
            }
            if (data.files) {
                let found;
                for (let i in data.files) {
                    if (data.files[i].filename === filename) {
                        found = true;
                        break;
                    }
                }
                if (found) {
                    return res.send(JSON.stringify({
                        status: 0,
                        error: i18n.get().__(locale, 'File with such name already exists.')
                    }));
                }
            }
            const filenameHash = crypto.createHash('md5').update(String(Date.now()) + filename).digest('hex');
            await fs.ensureDir(dir);
            await fs.writeFile(path.join(dir, filenameHash), req.files['files[]'].data);
            if (!data.files) {
                data.files = [];
            }
            const fid = crypto.createHash('md5').update(config.salt + String(Date.now())).digest('hex');
            data.files.push({
                id: fid,
                filename: filename,
                source: filenameHash,
                mime: req.files['files[]'].mimetype,
                encoding: req.files['files[]'].encoding,
                ext: path.extname(filename)
            });
            let updResult = await db.collection('support').update({ _id: parseInt(id) }, { $set: { files: data.files } }, { upsert: true });
            if (!updResult || !updResult.result || !updResult.result.ok) {
                return res.send(JSON.stringify({
                    status: 0
                }));
            }
            res.send(JSON.stringify({
                files: data.files,
                status: 1
            }));
        } catch (e) {
            log.error(e);
            res.send(JSON.stringify({
                status: 0,
                error: e.message
            }));
        }
    };

    const attachmentDownload = async(req, res, next) => {
        if (!Module.isAuthorized(req)) {
            return next();
        }
        const id = req.query.id;
        const fid = req.query.fid;
        if (!id || typeof id !== 'string' || !id.match(/^[0-9]+$/) ||
            !fid || typeof fid !== 'string' || !fid.match(/^[a-f0-9]{32}$/)) {
            return next();
        }
        try {
            const data = await db.collection('support').findOne({ _id: parseInt(id) });
            if (!data) {
                return next();
            }
            let file;
            if (data.files) {
                for (let i in data.files) {
                    if (data.files[i].id === fid) {
                        file = data.files[i];
                    }
                }
            }
            if (!file) {
                return next();
            }
            res.download(path.join(__dirname, 'storage', String(id), file.source), file.filename);
        } catch (e) {
            log.error(e);
            return next();
        }
    };

    const deleteAttachment = async(req, res) => {
        res.contentType('application/json');
        if (!Module.isAuthorizedAdmin(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        const id = req.body.id;
        const fid = req.body.fid;
        if (!id || typeof id !== 'string' || !id.match(/^[0-9]+$/) ||
            !fid || typeof fid !== 'string' || !fid.match(/^[a-f0-9]{32}$/)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        try {
            const data = await db.collection('support').findOne({ _id: parseInt(id) });
            if (!data) {
                return res.send(JSON.stringify({
                    status: 0
                }));
            }
            let files = data.files || [];
            let num;
            let source;
            for (let i in files) {
                if (files[i].id === fid) {
                    num = i;
                    source = files[i].source; 
                    break;
                }
            }
            if (!num) {
                return res.send(JSON.stringify({
                    status: 0
                }));
            }
            await fs.unlink(path.join(__dirname, 'storage', String(data._id), source));
            files.splice(num, 1);            
            let updResult = await db.collection('support').update({ _id: parseInt(id) }, { $set: { files: files } }, { upsert: false });
            if (!updResult || !updResult.result || !updResult.result.ok) {
                return res.send(JSON.stringify({
                    status: 0
                }));
            }
            res.send(JSON.stringify({
                status: 1
            }));
        } catch (e) {
            log.error(e);
            res.send(JSON.stringify({
                status: 0,
                error: e.message
            }));
        }
    };

    let router = Router();
    router.get('/list', list);
    router.get('/request/load', loadRequest);
    router.post('/request/message/edit', saveMessage);
    router.post('/request/common/save', saveRequestCommon);
    router.post('/request/message/delete', deleteMessage);
    router.post('/request/attachment/delete', deleteAttachment);
    router.post('/request/upload', attachmentUpload);
    router.get('/download', attachmentDownload);

    return {
        routes: router
    };
};