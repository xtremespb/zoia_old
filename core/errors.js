const path = require('path'),
    config = require(path.join(__dirname, '..', 'etc', 'config.js'));

module.exports = function(app) {
    const render = new(require(path.join(__dirname, 'render.js')))(path.join(__dirname, 'views'), app.get('templateFilters')),
        i18n = new(require(path.join(__dirname, 'i18n.js')))(path.join(__dirname, 'lang'), app);
    let errors = {
        notFound: (req, res, next) => {
            let err = new Error();
            err.status = 404;
            next(err);
        },
        errorHandler: async(err, req, res, next) => {
            const locale = req.session.currentLocale;
            err.status = !err.status ? 500 : err.status;
            if (err.status == 404) { err.message = i18n.get().__(locale, 'Not found'); }
            const html = await render.file("error.html", {
                locale: locale,
                i18n: i18n.get(),
                err: err,
                config: config
            });
            res.status(err.status).send(html);
        }
    };
    return errors;
};
