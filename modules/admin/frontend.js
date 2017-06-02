const path = require('path'),
    cowrap = require('co-express'),
    config = require(path.join(__dirname, '..', '..', 'etc', 'config.js')),
    express = require('express');

module.exports = function(app) {
    app.use('/modules/admin', express.static(path.join(__dirname, 'public')));
    const render = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, 'views'), app.get('templateFilters')),
        i18n = new (require(path.join(__dirname, '..', '..', 'core', 'i18n.js')))(path.join(__dirname, 'lang'), app);    
    let index = async function(req, res, next) {
        i18n.detectLanguage(req);
        const html = await render.file("panel.html", {
            i18n: i18n.get(),
            config: config
        })
        res.send(html);
    };

    let router = app.get('express').Router();
    router.get('/', cowrap(index));

    return {
        routes: router,
        filters: {}
    }

}
