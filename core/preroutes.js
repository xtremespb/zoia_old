const path = require('path'),
    config = require(path.join(__dirname, '..', 'etc', 'config.js'));

module.exports = function(app) {
    const log = app.get('log');
    db = app.get('db');
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
            next();
        }
    };
};
