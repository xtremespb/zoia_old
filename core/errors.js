const path = require('path'),
    config = require(path.join(__dirname, '..', 'etc', 'config.js'));

module.exports = function(app) {
    const I18N = require(path.join(__dirname, 'i18n.js')),
        errors = {
            notFound: (req, res, next) => {
            	let i18n = new I18N(path.join(__dirname, 'lang'), app);
                i18n.detectLanguage(req);
                let err = new Error(i18n.get().__('Not found'));
                err.status = 404;
                next(err);
            },
            errorHandler: (err, req, res, next) => {
                res.status(err.status || 500).send(err.message);
            }
        };
    return errors;
};
