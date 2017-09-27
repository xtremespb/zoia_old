To create your own module for Zoia, please follow the steps below.

Example module is available [for download](https://github.com/xtremespb/zoia/releases/download/docs/example.zip).

## Common steps

* Create your module directory within `./modules` folder, e.g. `./modules/example`
* In the following example we will create API, frontend and backend modules, and filters. Therefore, you will need to create the following file structure within your `example` folder: `module.js`, `api.js`, `backend.js`, `frontend.js`, `install.js`.
* You will also need the following folders within your `example` directory: lang (will contain language files), schemas (will contain validation schema), static (will contain static files), views (will contain template views).

## Validation schemas

* First, let's create the validation schema for our module (you may create as many as you need). Create a file called `exampleFields.js` in `schemas` directory and paste the following code here:

```javascript
((function(vars, global) {
    for (let i in vars) {
        global[i] = vars[i];
    }
})({
    // Function to return hash of fields
    getExampleFields: function() {
        return {
            // Field name, should match the one from request
            username: {
                // Is the field mandatory?
                mandatoryCreate: true,
                // Min and max field length
                length: {
                    min: 3,
                    max: 20
                },
                // Field type (will check against typeof)
                type: 'string',
                // RegExp for field
                regexp: /^[A-Za-z0-9_\-]+$/,
                // Function to process the value after the validation
                process: function(item) {
                    return item.trim().toLowerCase();
                }
            }
        };
    }
}, typeof exports === 'undefined' ? this : exports));
```

## API

* Then, let's create API for your new module. API should contain all functions available from `/api/example/` URL. Paste the following code as an example:

```javascript
const path = require('path');
// Load helper fundctions from Module.js
const Module = require(path.join(__dirname, '..', '..', 'core', 'module.js'));
// Load validation module (core)
const validation = new(require(path.join(__dirname, '..', '..', 'core', 'validation.js')))();
// Use co-router instead of router to support async functions
const Router = require('co-router');
// Load configuration file when required
// const config = require(path.join(__dirname, '..', '..', 'etc', 'config.js'));
// Load example validation scheme
const exampleFields = require(path.join(__dirname, 'schemas', 'exampleFields.js'));
module.exports = function(app) {
    // Load logging module (https://www.npmjs.com/package/loglevel)
    const log = app.get('log');
    // Load database instance
    const db = app.get('db');
    // This is /api/example/email route
    const email = async(req, res) => {
        // We will return JSON here
        res.contentType('application/json');
        // If not authorized as admin (member of admin group), reject
        if (!Module.isAuthorizedAdmin(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        // Load validation scheme
        const fieldList = exampleFields.getExampleFields();
        // Check if request match our validation scheme
        let fields = validation.checkRequest(req, fieldList);
        // Get list of non-validated (failed) fields
        let fieldsFailed = validation.getCheckRequestFailedFields(fields);
        // If there are any failed fields, return
        if (fieldsFailed.length > 0) {
            return res.send(JSON.stringify({
                status: 0,
                fields: fieldsFailed
            }));
        }
        try {
            // Get data from database (username = requested username)
            const items = await db.collection('users').find({ username: fields.username.value }).toArray();
            // If there're no items, let's return an error
            if (!items || !items.length) {
                throw new Error('No e-mail address found');
            }
            // Make data hash...
            let data = {
                status: 1,
                email: items[0].email
            };
            // ...and return it back
            res.send(JSON.stringify(data));
        } catch (e) {
            // Log the error occured
            log.error(e);
            // Send the error back to user
            res.send(JSON.stringify({
                status: 0,
                error: e.message
            }));
        }
    };
    // Create Router instance
    let router = Router();
    // Define routes (use either get or post here)
    router.get('/email', email);
    // Return routes
    return {
        routes: router
    };
};
```

* The next step is to paste the following code into the `module.js` file within your `./modules/example` folder:

```javascript
module.exports = function(app) {
    const path = require('path');
    // Load the API
    const api = require(path.join(__dirname, 'api.js'))(app);
    // Return the data
    return {
        // We've got some API
        api: {
            // Prefix to use, currently: /api/example
            prefix: '/example',
            // Export the API routes
            routes: api.routes
        }
    };
};
```

* You are ready to test! Let's start up the Zoia and check the following URL (let's assume you're not authorized yet):

`http://127.0.0.1:3000/api/example/email?username=admin`

* The response should be as follows (which means "no success"):

`{status:0}`

* Now, let's authorize as an admin and open up the same URL once again. You shall get the following JSON as response:

`{"status":1,"email":"info@example.com"}`

* You may also create other routes which won't require authorization or won't require Administrator to function. Let's assume that any authorized user may get his own status from database. Paste the following code after the `email` function in `api.js` file:

```javascript
    // This is /api/example/mystatus route
    const mystatus = async(req, res) => {
        // We will return JSON here
        res.contentType('application/json');
        // If not authorized (status<1), reject
        if (!Module.isAuthorized(req)) {
            return res.send(JSON.stringify({
                status: 0
            }));
        }
        try {
            // Get data from database (username = current username authorized)
            const items = await db.collection('users').find({ username: req.session.auth.username }).toArray();
            // If there're no items, let's return an error
            if (!items || !items.length) {
                throw new Error('No e-mail address found');
            }
            // Make data hash...
            let data = {
                status: 1,
                userStatus: items[0].status
            };
            // ...and return it back
            res.send(JSON.stringify(data));
        } catch (e) {
            // Log the error occured
            log.error(e);
            // Send the error back to user
            res.send(JSON.stringify({
                status: 0,
                error: e.message
            }));
        }
    };
```

* Create the new route for `mystatus` function:

```javascript
router.get('/mystatus', mystatus);
```

* Restart Zoia and open up the following URL:

`http://127.0.0.1:3000/api/example/mystatus`

* You should get the following response (logged in as `admin` user for example):

`{"status":1,"userStatus":1}`

## Backend

* Let's start building our backend module. First, create the language file (`en.json`) within your `./modules/example/lang` directory:

```javascript
{
	"title": "Example module",
	"Up and running.": "Up and running.",
	"Example module": "Example module",
	"It works!": "It works!"
}
```

* Next, you will need the `admin.html` file to display as your module backend content. Paste the following code to the `./modules/example/views/admin.html` file:

```html
<h1 id="zoiaDashboardHeader">{{ i18n.__(locale, 'title') }}</h1>
<p>{{ i18n.__(locale, 'Up and running.') }}</p>
```

* Note the strings like `{{ i18n.__(locale, 'title') }}`. The corresponding strings from your language files (e.g. `en.json`) will be used.
* Now, let's create a simple backend script for your Administration panel. Paste the following code to the `./example/backend.js` file:

```javascript
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
```

* Modify your `module.js` file as following: 

```javascript
module.exports = function(app) {
    const path = require('path');
    // Load the API
    const api = require(path.join(__dirname, 'api.js'))(app);
    // Load the Backend
    const backend = require(path.join(__dirname, 'backend.js'))(app);
    // Return the data
    return {
        // We've got some API
        api: {
            // Prefix to use, currently: /api/example
            prefix: '/example',
            // Export the API routes
            routes: api.routes
        },
        // We've got a Backend
        backend: {
            prefix: '/example',
            routes: backend.routes,
            info: backend.info
        }
    };
};
```

* Now, go to the following URL:

`http://127.0.0.1:3000/admin/example`

* You should now see the expected backend page for your Example module. The module will also be listed in the Navigation area.

## Frontend

* The next step is to create the frontend module. First, create a file called `frontend.js` within your `./modules/example` folder and paste the following content:

```javascript
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
```

* Modify your `module.js` file as following: 

```javascript
module.exports = function(app) {
    const path = require('path');
    // Load the API
    const api = require(path.join(__dirname, 'api.js'))(app);
    // Load the Backend
    const backend = require(path.join(__dirname, 'backend.js'))(app);
    // Load the Frontend
    const frontend = require(path.join(__dirname, 'frontend.js'))(app);
    // Return the data
    return {
        // We've got some API
        api: {
            // Prefix to use, currently: /api/example
            prefix: '/example',
            // Export the API routes
            routes: api.routes
        },
        // We've got a Backend
        backend: {
            prefix: '/example',
            routes: backend.routes,
            info: backend.info
        },
        // We've got a Frontend
        frontend: {
            prefix: '/example',
            routes: frontend.routes,
            filters: frontend.filters
        }
    };
};
```

* Restart Zoia and open up the following URL:

`http://127.0.0.1:3000/example`

* You should see 'It works! as page content (your default template will be rendered).

## Installation script

Each module **should** contain an installation script for first-time installation and/or upgrade.

The empty installation script (`install.js`) needs to export a function and should look like this:

```javascript
module.exports = function() {};
```

In the installation script, you will have an access to the configuration and database objects. You may use the following code as a template:

```javascript
module.exports = function(data) {
    return async() => {
        const db = data.db;
        const config = data.config;
        // Do something, use async-style coding here
    }
};
```

Refer to Pages module installer as an example of what you can do there.