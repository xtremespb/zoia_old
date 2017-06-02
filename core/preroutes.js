const path = require('path'),
    config = require(path.join(__dirname, '..', 'etc', 'config.js'));

module.exports = function(app) {    
    return {
        setLocale: (req, res, next) => {
            const i18n = new (require(path.join(__dirname, 'i18n.js')))(path.join(__dirname, 'lang'), app);
            req.session.currentLocale = i18n.detectLanguage(req);
            next();
        }
    };
};
