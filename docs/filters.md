**Important:** please read the following [tutorial](https://github.com/xtremespb/zoia/wiki/Create-your-own-module-(tutorial)) before you continue reading this article.

To render your templates, Zoia uses the [Nunjucks](https://mozilla.github.io/nunjucks/) template engine. It is very powerful and has a lot of features like if-else syntax, 'for' cycle etc.

One of the most useful features are filters. They do practically allow you to execute Javascript functions within your templates. This is really awesome in case you need no make a database query or any other async query within your template.
There are two kinds of filters available: callback functions (that's what Nunjucks is supporting) and async functions (which can be used to render some content directly from Pages module).

Let's suppose you've already [created an example module](https://github.com/xtremespb/zoia/wiki/Create-your-own-module-(tutorial)) and can simply modify the source code to include your filters.
* Modify the `./example/frontend.js` file and paste the following code there (somewhere before or after the routes):

```javascript
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
const filter2 = (par, callback) => {
    callback(null, 'par: ' + par);
};
```

* Modify the `./example/frontend.js` file and add your filters to `return`:

```javascript
return {
    // ...routes
    routes: router,
    // ...filters
    filters: {
        filter1Async: filter1Async,
        filter2: filter2
    }
};
```

* Modify your `./example/module.js` file and add your filters to `return`:

```javascript
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
```

* To use your Callback-style filter, just add the following code to your `./views/default_en.html` template (somewhere close to the `{{ content }}` for example):

```html
<p>{{ 'Hello world' | filter2 }}</p>
```

* Create a new page in Administration Panel / Pages (with a `test` name for example) and paste the following code to get data from your Async filter:

```html
[[Hello world!|It's just a test|filter1]]
```

* Go to the page you've just created: `http://127.0.0.1:3000/test`. You should see the output from both of your filters.