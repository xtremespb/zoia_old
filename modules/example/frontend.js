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
    // Async function to be used as a filter for pages
    const filter1Async = async(par1, par2) => {
        // We will need database here.
        // But you can simply paste the string below
        // somewhere outside of your filter1Async function
        const db = app.get('db');
        try {
            // Let's make a dummy query to demonstrate how to use
            // the async functions here
            let testData = await db.collection('registry').findOne({ name: 'pagesFolders' });
            // You can use as many parameters as you wish
            return 'par1: ' + par1 + ', par2: ' + par2;

        } catch (e) {
            return 'Error';
        }
    };
    // Callback-style function to be used as Nunjucks filter.
    // You may simple make a wrap for an async function here.
    // const navigationDesktop = (data, callback) => {
    const filter2 = (par1, par2, callback) => {
        callback(null, '');
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