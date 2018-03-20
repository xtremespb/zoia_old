const path = require('path');
const Module = require(path.join(__dirname, '..', '..', 'core', 'module.js'));
const validation = new(require(path.join(__dirname, '..', '..', 'core', 'validation.js')))();
const Router = require('co-router');
const ObjectID = require('mongodb').ObjectID;
const hostingFields = require(path.join(__dirname, 'schemas', 'hostingFields.js'));
const config = require(path.join(__dirname, '..', '..', 'core', 'config.js'));

module.exports = function(app) {
    const log = app.get('log');
    const db = app.get('db');

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
                const accounts = await db.collection('hosting_accounts').find({ $or: ids }).toArray();
                const transactions = await db.collection('hosting_transactions').find({ $or: ids }, { projection: { _id: 0, ref_id: 1, timestamp: 1, sum: 1 } }).toArray() || [];
                let total = 0;
                for (let i in transactions) {
                    total += transactions[i].sum;
                }
                let amtAccounts = {};                
                if (accounts && accounts.length) {
                    for (let i in accounts) {
                        if (!amtAccounts[accounts[i].ref_id]) {
                            amtAccounts[accounts[i].ref_id] = 0;
                        }
                        amtAccounts[accounts[i].ref_id]++;
                    }
                }
                let amtTransactions = {};
                if (transactions && transactions.length) {
                    for (let i in transactions) {
                        if (!amtTransactions[transactions[i].ref_id]) {
                            amtTransactions[transactions[i].ref_id] = 0;
                        }
                        amtTransactions[transactions[i].ref_id] += transactions[i].sum;
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
                total: total,
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
            const accounts = await db.collection('hosting_accounts').find({ ref_id: String(user._id) }, { projection: { _id: 0, id: 1 } }).toArray() || [];
            const transactions = await db.collection('hosting_transactions').find({ ref_id: String(user._id) }, { sort: { timestamp: 1 }, limit: 50, projection: { _id: 0, timestamp: 1, sum: 1 } }).toArray() || [];
            let total = 0;
            for (let i in transactions) {
                total += transactions[i].sum;
            }
            user.balance = data.balance || 0;
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

    let router = Router();
    router.get('/list', list);
    router.get('/load', load);

    return {
        routes: router
    };
};