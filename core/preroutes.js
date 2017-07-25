const path = require('path');
const ObjectID = require('mongodb').ObjectID;

module.exports = function(app) {
    const db = app.get('db');
    const log = app.get('log');
    return {
        setLocale: async(req, res, next) => {
            const i18n = new(require(path.join(__dirname, 'i18n.js')))(path.join(__dirname, 'lang'), app);
            if (req.session) {
                req.session.currentLocale = i18n.detectLanguage(req);
            }
            next();
        },
        logRequest: async(req, res, next) => {
            log.info(req.ip + ' ' + req.method + ' ' + req.url);
            next();
        },
        auth: async(req, res, next) => {
            try {
                if (db && req.session && req.session.auth && req.session.auth._id) {
                    let user = await db.collection('users').findOne({ _id: new ObjectID(req.session.auth._id) });
                    if (user !== null) {
                        req.session.auth = user;
                    } else {
                        req.session.auth = undefined;
                    }
                }
            } catch (e) {
                log.error(e.message);
            }
            next();
        }
    };
};