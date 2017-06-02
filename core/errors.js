const path = require('path'),
    config = require(path.join(__dirname, '..', 'etc', 'config.js'));

module.exports = function(app) {
    const render = new(require(path.join(__dirname, 'render.js')))(path.join(__dirname, 'views'), app.get('templateFilters'));
    const I18N = require(path.join(__dirname, 'i18n.js'));
    let errors = {
            notFound: (req, res, next) => {
                let i18n = new I18N(path.join(__dirname, 'lang'), app);
                i18n.detectLanguage(req);
                let err = new Error();
                err.status = 404;
                next(err);
            },
            errorHandler: async (err, req, res, next) => {
            	let i18n = new I18N(path.join(__dirname, 'lang'), app);
                i18n.detectLanguage(req);
                err.status = !err.status ? 500 : err.status;
                if (err.status == 404) { err.message = i18n.get().__('Not found'); }
                const html = await render.file("error.html", {
                	i18n: i18n.get(),
                	err: err,
                	config: config
                });
                res.status(err.status).send(html);
            }
        };
    return errors;
};
