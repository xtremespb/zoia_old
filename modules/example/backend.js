// Define module ID (should be unique)
const moduleId = 'example';
// Define module URL
const moduleURL = '/admin/example';
const path = require('path');
const Module = require(path.join(__dirname, '..', '..', 'core', 'module.js'));
const Router = require('co-router');
const config = require(path.join(__dirname, '..', '..', 'etc', 'config.js'));

module.exports = function(app) {
    // We will need internationalization module here
    const i18n = new(require(path.join(__dirname, '..', '..', 'core', 'i18n.js')))(path.join(__dirname, 'lang'), app);
    // Panel core module for HTML rendering
    const panel = new(require(path.join(__dirname, '..', '..', 'core', 'panel.js')))(app);
    // Main rendering module
    const render = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, 'views'), app);
    const example = async(req, res, next) => {
        try {
            // If not authorized, let's redirect to the login page
            if (!Module.isAuthorizedAdmin(req)) {
                // Logout (to avoid redirection loops)
                Module.logout(req);
                return res.redirect(303, '/auth?redirect=' + moduleURL + '&rnd=' + Math.random().toString().replace('.', ''));
            }
            // Get current locale
            const locale = req.session.currentLocale;
            // Let's render admin.html from views folder
            let html = await render.file('admin.html', {
                i18n: i18n.get(),
                config: config,
                locale: locale
            });
            res.send(await panel.html(req, moduleId, i18n.get().__(locale, 'title'), html));
        } catch (e) {
            next(new Error(e.message));
        }
    };
    let router = Router();
    // Export the backend function as a route
    router.get('/', example);
    // Return
    return {
        // ... our routes
        routes: router,
        // ... module information:
        info: {
            // 1. Unique module ID
            id: moduleId,
            // 2. Module backend URL
            url: moduleURL,
            // 3. Module title
            title: Module.getTitles(i18n),
            // 4. Module icon (optional): https://getuikit.com/docs/icon
            icon: 'cog'
        }
    };
};