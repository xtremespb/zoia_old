const path = require('path');
const Module = require(path.join(__dirname, '..', '..', 'core', 'module.js'));
const validation = new(require(path.join(__dirname, '..', '..', 'core', 'validation.js')))();
const Router = require('co-router');
const ObjectID = require('mongodb').ObjectID;
const config = require(path.join(__dirname, '..', '..', 'core', 'config.js'));
const accountFields = require(path.join(__dirname, 'schemas', 'accountFields.js'));
const newAccountFields = require(path.join(__dirname, 'schemas', 'newAccountFields.js'));
const fs = require('fs');
const plugins = fs.readdirSync(path.join(__dirname, 'plugins'));
for (let i in plugins) { plugins[i] = plugins[i].replace(/\.js$/, ''); }
let configModule;
try {
    configModule = require(path.join(__dirname, 'config', 'hosting.json'));
} catch (e) {
    configModule = require(path.join(__dirname, 'config', 'hosting.dist.json'));
}

module.exports = function(app) {
    const log = app.get('log');
    const db = app.get('db');
    const i18n = new(require(path.join(__dirname, '..', '..', 'core', 'i18n.js')))(path.join(__dirname, 'lang'), app);

    const sortFields = ['username'];

    const list = async(req, res) => {
        res.contentType('application/json');
        if (!Module.isAuthorizedAdmin(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        const sortField = req.query.sortField || 'username';
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
                        { username: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } }
                    ]
                };
            }
            const total = await db.collection('users').find(fquery).count();
            const items = await db.collection('users').find(fquery, { skip: skip, limit: limit, sort: sort }).toArray();
            if (total > 0) {
                let ids = [];
                for (let i in items) {
                    ids.push({ ref_id: String(items[i]._id) });
                    delete items[i].password;
                }
                const agr = await db.collection('hosting_transactions').aggregate([
                    { $match: { $or: ids } },
                    {
                        $group: {
                            _id: { ref_id: '$ref_id' },
                            total: {
                                $sum: "$sum"
                            }
                        }
                    }
                ]).toArray();
                amtTransactions = {};
                for (let i in agr) {
                    amtTransactions[agr[i]._id.ref_id] = agr[i].total
                }
                const accounts = await db.collection('hosting_accounts').find({ $or: ids }).toArray();
                let amtAccounts = {};
                if (accounts && accounts.length) {
                    for (let i in accounts) {
                        if (!amtAccounts[accounts[i].ref_id]) {
                            amtAccounts[accounts[i].ref_id] = 0;
                        }
                        amtAccounts[accounts[i].ref_id]++;
                    }
                }
                for (let i in items) {
                    items[i].accounts = amtAccounts[items[i]._id] || 0;
                    items[i].balance = amtTransactions[items[i]._id] || 0;
                }
            }
            let data = {
                status: 1,
                count: items.length,
                items: items
            };
            res.send(JSON.stringify(data));
        } catch (e) {
            console.log(e);
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
        if (!id || typeof id !== 'string' || !id.match(/^[a-f0-9]{24}$/)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        try {
            const user = await db.collection('users').findOne({ _id: new ObjectID(id) });
            if (!user) {
                return res.send(JSON.stringify({
                    status: 0
                }));
            }
            delete user.password;
            const data = await db.collection('hosting').findOne({ ref_id: String(user._id) }) || {};
            const accounts = await db.collection('hosting_accounts').find({ ref_id: String(user._id) }, { projection: { id: 1, plugin: 1, preset: 1, days: 1 } }).toArray() || [];
            const transactions = await db.collection('hosting_transactions').find({ ref_id: String(user._id) }, { sort: { timestamp: -1 }, limit: 50, projection: { _id: 0, timestamp: 1, sum: 1 } }).toArray() || [];
            const ar = await db.collection('hosting_transactions').aggregate([
                { $match: { ref_id: String(user._id) } },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$sum"
                        }
                    }
                }
            ]).toArray() || [];
            const total = (ar && ar.length) ? ar[0].total : 0;
            user.balance = total || 0;
            user.accounts = accounts;
            user.transactions = transactions;
            user.total = total;
            res.send(JSON.stringify({
                status: 1,
                data: user
            }));
        } catch (e) {
            log.error(e);
            res.send(JSON.stringify({
                status: 0,
                error: e.message
            }));
        }

    };

    const correction = async(req, res) => {
        res.contentType('application/json');
        if (!Module.isAuthorizedAdmin(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        const id = req.query.id;
        const sum = req.query.sum;
        if (!id || typeof id !== 'string' || !id.match(/^[a-f0-9]{24}$/) ||
            !sum || typeof sum !== 'string' || !parseFloat(sum)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        try {
            const user = await db.collection('users').findOne({ _id: new ObjectID(id) });
            if (!user) {
                return res.send(JSON.stringify({
                    status: 0
                }));
            }
            const timestamp = parseInt(Date.now() / 1000);
            const insResult = await db.collection('hosting_transactions').insertOne({ ref_id: id, timestamp: timestamp, sum: parseFloat(sum) });
            if (!insResult || !insResult.result || !insResult.result.ok) {
                output.status = 0;
                return res.send(JSON.stringify(output));
            }
            res.send(JSON.stringify({
                status: 1,
                timestamp: timestamp
            }));
        } catch (e) {
            log.error(e);
            res.send(JSON.stringify({
                status: 0,
                error: e.message
            }));
        }
    };

    const accountLoad = async(req, res) => {
        res.contentType('application/json');
        if (!Module.isAuthorizedAdmin(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        const id = req.query.id;
        if (!id || typeof id !== 'string' || !id.match(/^[a-f0-9]{24}$/)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        try {
            const account = await db.collection('hosting_accounts').findOne({ _id: new ObjectID(id) });
            if (!account) {
                return res.send(JSON.stringify({
                    status: 0
                }));
            }
            account.account = account.id;
            res.send(JSON.stringify({
                status: 1,
                item: account
            }));
        } catch (e) {
            log.error(e);
            res.send(JSON.stringify({
                status: 0,
                error: e.message
            }));
        }
    };

    const accountSave = async(req, res) => {
        res.contentType('application/json');
        if (!Module.isAuthorizedAdmin(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        const locale = req.session.currentLocale;
        const fieldList = accountFields.getAccountFields();
        let fields = validation.checkRequest(req.body, fieldList);
        let fieldsFailed = validation.getCheckRequestFailedFields(fields);
        if (fieldsFailed.length > 0) {
            return res.send(JSON.stringify({
                status: 0,
                fields: fieldsFailed
            }));
        }
        if (plugins.indexOf(fields.plugin.value) < 0) {
            return res.send(JSON.stringify({
                status: 0,
                fields: ['plugin']
            }));
        }
        const id = req.body.id;
        const _id = req.body._id;
        if (!id || typeof id !== 'string' || !id.match(/^[a-f0-9]{24}$/) ||
            (_id && (typeof _id !== 'string' || !_id.match(/^[a-f0-9]{24}$/)))) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        let presetFound;
        for (let i in configModule.presets) {
            if (configModule.presets[i].id === fields.preset.value) {
                presetFound = true;
            }
        }
        if (!presetFound) {
            return res.send(JSON.stringify({
                status: 0,
                fields: ['preset']
            }));
        }
        try {
            const account = await db.collection('hosting_accounts').findOne({ id: fields.account.value });
            if ((!_id && account) || (_id && account && String(account._id) !== _id)) {
                return res.send(JSON.stringify({
                    status: 0,
                    fields: ['account'],
                    duplicate: true
                }));
            }

            const update = await db.collection('hosting_accounts').findAndModify(_id ? { _id: new ObjectID(_id) } : { id: fields.account.value }, [], { id: fields.account.value, ref_id: id, plugin: fields.plugin.value, preset: fields.preset.value, days: parseInt(fields.days.value) }, { new: true, upsert: true });
            if (!update || !update.value || !update.value._id) {
                return res.send(JSON.stringify({
                    status: 0
                }));
            }
            let presetTitle = fields.preset.value;
            for (let i in configModule.presets) {
                if (configModule.presets[i].id === fields.preset.value) {
                    presetTitle = configModule.presets[i].titles[locale] || fields.preset.value;
                }
            }
            res.send(JSON.stringify({
                status: 1,
                _id: _id || update.value._id,
                account: fields.account.value,
                plugin: fields.plugin.value,
                preset: presetTitle,
                days: fields.days.value
            }));
        } catch (e) {
            log.error(e);
            res.send(JSON.stringify({
                status: 0,
                error: e.message
            }));
        }
    };

    const accountDelete = async(req, res) => {
        res.contentType('application/json');
        if (!Module.isAuthorizedAdmin(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        const id = req.query.id;
        if (!id || typeof id !== 'string' || !id.match(/^[a-f0-9]{24}$/)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        try {
            const delResult = await db.collection('hosting_accounts').remove({ _id: new ObjectID(id) });
            if (!delResult || !delResult.result || !delResult.result.ok) {
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

    const accountCreate = async(req, res) => {
        res.contentType('application/json');
        if (!Module.isAuthorized(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        const locale = req.session.currentLocale;
        const fieldList = newAccountFields.getNewAccountFields();
        let fields = validation.checkRequest(req.body, fieldList);
        let fieldsFailed = validation.getCheckRequestFailedFields(fields);
        if (fieldsFailed.length > 0) {
            return res.send(JSON.stringify({
                status: 0,
                fields: fieldsFailed
            }));
        }
        let preset;
        let price;
        for (let i in configModule.presets) {
            if (configModule.presets[i].id === fields.preset.value) {
                preset = fields.preset.value;
                price = configModule.presets[i].cost;
                break;
            }
        }
        if (!preset) {
            return res.send(JSON.stringify({
                status: 0,
                fields: ['preset']
            }));
        }
        const hasUpperCase = /[A-Z]/.test(fields.password.value);
        const hasLowerCase = /[a-z]/.test(fields.password.value);
        const hasNumbers = /\d/.test(fields.password.value);
        const hasNonalphas = /\W/.test(fields.password.value);
        if (hasUpperCase + hasLowerCase + hasNumbers + hasNonalphas < 3) {
            return res.send(JSON.stringify({
                status: 0,
                fields: ['password'],
                error: i18n.get().__(locale, 'Password is too weak. Please use both lowercase and uppercase characters, numbers and special characters. Minimal length: 8')
            }));
        }
        try {
            const ag = await db.collection('hosting_transactions').aggregate([
                { $match: { ref_id: String(req.session.auth._id) } },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$sum"
                        }
                    }
                }
            ]).toArray();
            let funds = 0;
            if (ag && ag.length > 0) {
                funds = parseFloat(ag[0].total);
            }
            const cost = parseFloat(fields.months.value) * price;
            if (cost > funds) {
                return res.send(JSON.stringify({
                    status: 0,
                    fields: ['preset', 'months'],
                    error: i18n.get().__(locale, 'Insufficient funds')
                }));
            }
            const account = await db.collection('hosting_accounts').findOne({ id: fields.id.value });
            const Plugin = require(path.join(__dirname, 'plugins', configModule.defaultPlugin));
            const plugin = new Plugin(app);
            const accountAvailable = await plugin.check(fields.id.value, locale);
            if (account || !accountAvailable) {
                return res.send(JSON.stringify({
                    status: 0,
                    fields: ['id'],
                    error: i18n.get().__(locale, 'Account with such ID already exists')
                }));
            }

            /*const timestamp = parseInt(Date.now() / 1000);
            const insTransactionResult = await db.collection('hosting_transactions').insertOne({ ref_id: String(req.session.auth._id), timestamp: timestamp, sum: parseFloat(cost) * -1 });
            if (!insTransactionResult || !insTransactionResult.result || !insTransactionResult.result.ok) {
                return res.send(JSON.stringify({
                    status: 0
                }));
            }
            const days = parseInt(fields.months.value) * 30;
            const insAccountResult = await db.collection('hosting_accounts').insertOne({ ref_id: String(req.session.auth._id), plugin: configModule.defaultPlugin, preset: preset, days: days, id: fields.id.value, processing: true });
            if (!insAccountResult || !insAccountResult.result || !insAccountResult.result.ok) {
                return res.send(JSON.stringify({
                    status: 0
                }));
            }*/            
            await plugin.create(fields.id.value, preset, fields.password.value, locale);
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
    router.get('/load', load);
    router.get('/correction', correction);
    router.get('/account/load', accountLoad);
    router.post('/account/save', accountSave);
    router.get('/account/delete', accountDelete);
    router.post('/account/create', accountCreate);

    return {
        routes: router
    };
};