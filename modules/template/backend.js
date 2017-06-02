const moduleId = "template",
	path = require('path'),
    config = require(path.join(__dirname, '..', '..', 'etc', 'config.js')),
    cowrap = require('co-express');

module.exports = function(app) {
    const i18n = new(require(path.join(__dirname, '..', '..', 'core', 'i18n.js')))(path.join(__dirname, 'lang'), app),
        panel = new(require(path.join(__dirname, '..', '..', 'core', 'panel.js')))(app);
    let test = async function(req, res, next) {
        const locale = req.session.currentLocale;
        res.send(await panel.html(req, moduleId, i18n.get().__(locale, "title")));
    };
    let router = app.get('express').Router();
    router.get('/', cowrap(test));
    let titles = {};
    for (let i in config.i18n.locales) {
        titles[config.i18n.locales[i]] = i18n.get().__(config.i18n.locales[i], "title");
    }
    return {
        routes: router,
        info: {
            id: moduleId,
            url: "/admin/template",
            title: titles
        }
    }
}
