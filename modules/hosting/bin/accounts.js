const path = require('path');
const config = require(path.join(__dirname, '..', '..', '..', 'core', 'config.js'));
const ObjectID = require('mongodb').ObjectID;

let configModule;
try {
    configModule = require(path.join(__dirname, '..', 'config', 'hosting.json'));
} catch (e) {
    configModule = require(path.join(__dirname, '..', 'config', 'hosting.dist.json'));
}

const script = async() => {
    try {
        const database = new(require(path.join(__dirname, '..', '..', '..', 'core', 'database.js')))(false, config.mongo, false);
        await database.connect();
        const db = database.get();
        const mailer = new(require(path.join(__dirname, '..', '..', '..', 'core', 'mailer.js')))(null, db);
        const render = new(require(path.join(__dirname, '..', '..', '..', 'core', 'render.js')))(path.join(__dirname, '..', 'views'), null);
        const i18n = new(require(path.join(__dirname, '..', '..', '..', 'core', 'i18n.js')))(path.join(__dirname, '..', 'lang'), null);
        // Decrease days by 1
        let updResult = await db.collection('hosting_accounts').updateMany({
            days: { $gte: 1 }
        }, {
            $inc: {
                days: -1
            }
        });
        if (!updResult || !updResult.result || !updResult.result.ok) {
            throw new Error('Could not decrease days');
        }
        // Get all accounts where days < warnDays
        let accounts = {};
        const accountsData = await db.collection('hosting_accounts').find({ days: { $lte: configModule.warnDays } }).toArray();
        for (let i in accountsData) {
            if (!accounts[accountsData[i].ref_id]) {
                accounts[accountsData[i].ref_id] = {
                    accounts: []
                };
            }
            accounts[accountsData[i].ref_id].accounts.push({
                id: accountsData[i].id,
                days: accountsData[i].days
            })
        }
        // Get e-mails
        let usersQuery = [];
        for (let i in accounts) {
            usersQuery.push({ _id: new ObjectID(i) });
        }
        let usersData = [];
        if (usersQuery) {
            usersData = await db.collection('users').find({ $or: usersQuery }, { sort: {}, projection: { _id: 1, email: 1, locale: 1 } }).toArray();
        }
        for (let i in usersData) {
            accounts[String(usersData[i]._id)].email = usersData[i].email;
            accounts[String(usersData[i]._id)].locale = usersData[i].locale;
        }
        // Send mails
        for (let i in accounts) {
            const data = accounts[i];
            const mailHTML = await render.file('mail_expiration.html', {
                i18n: i18n.get(),
                locale: data.locale,
                accounts: data.accounts,
                lang: JSON.stringify(i18n.get().locales[data.locale]),
                config: config
            });
            await mailer.send({
                session: {
                    currentLocale: data.locale
                }
            }, data.email, i18n.get().__(data.locale, 'Expiring Accounts'), mailHTML);
        }
        process.exit(0);
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
};
script();