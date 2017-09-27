Used to render HTML templates using Nunjucks template engine.

## Constructor

`constructor(dir, app)`
* dir: directory where template files are located at (normally it's `path.join(__dirname, 'views')`)
* app: express.js instance

## Methods

`setFilters(filters)`

Set Nunjucks async filters to use in HTML rendering.

* filters: a hash of filters, example: `{ filter1: function(){}, filter2: function(){} }`

`async file(file, data)`

Render Nunjucks template file.

* file: a path to the file to render
* data: a hash of parameters to render

`async template(req, i18n, locale, pagetitle, data, tpl)`

Render Zoia frontend template.

* req: Express.js Request object
* i18n: Internationalization (i18n) object instance
* locale: current locale ('en', 'ru' etc.)
* pagetitle: Page title to display in browser window 
* data: Template variables hash
* tpl (optional): specify a template to render (to use non-default template)