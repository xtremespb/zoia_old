const path = require('path');
const config = require(path.join(__dirname, '..', '..', 'etc', 'config.js'));
const Router = require('co-router');
module.exports = function(app) {
    const i18n = new(require(path.join(__dirname, '..', '..', 'core', 'i18n.js')))(path.join(__dirname, 'lang'), app);
    const render = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, '..', '..', 'views'), app);
    const content = async(req, res) => {
        // Get default locale
        let locale = config.i18n.locales[0];
        // Override default locale?
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        // Set filters
        const filters = app.get('templateFilters');
        render.setFilters(filters);
        // Render example HTML
        let html = await render.template(req, i18n, locale, i18n.get().__(locale, 'Example module'), {
            content: i18n.get().__(locale, 'It works!'),
            keywords: '',
            description: ''
        });
        // Send to browser
        return res.send(html);
    };
    let router = Router();
    // Let's use example route
    router.get('/', content);
    // Return data...
    return {
        // ...routes
        routes: router,
        // ...no filters yet
        filters: {}
    };
};