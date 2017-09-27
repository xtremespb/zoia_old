Used to render Administration panel HTML template (using Nunjucks template engine).

## Constructor

`constructor(app)`
* dir: directory where template files are located at (normally it's `path.join(__dirname, 'views')`)

## Methods

`async html(req, id, title, data, extraCSS, extraJS)`

Render Zoia frontend template.

* req: Express.js Request object
* id: current module ID string
* title: Page title 
* data: Template variables hash
* extraCSS: an array of extra CSS files to include
* extraJS: an array of extra JS files to include