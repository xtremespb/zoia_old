const path = require('path');
const config = require(path.join(__dirname, '..', '..', 'core', 'config.js'));
let configModule;
try {
    configModule = require(path.join(__dirname, 'config', 'catalog.json'));
} catch (e) {
    configModule = require(path.join(__dirname, 'config', 'catalog.dist.json'));
}
const Module = require(path.join(__dirname, '..', '..', 'core', 'module.js'));
const Router = require('co-router');

module.exports = function(app) {
    const db = app.get('db');
    const i18n = new(require(path.join(__dirname, '..', '..', 'core', 'i18n.js')))(path.join(__dirname, 'lang'), app);
    const renderAuth = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, 'views'), app);
    const renderRoot = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, '..', '..', 'views'), app);

    const _findTreeItemById = (tree, id) => {
        for (let i in tree) {
            const item = tree[i];
            if (item.id === id) {
                return item;
            }
        }
    };

    const _findChildren = (tree, id) => {
        for (let i in tree) {
            const item = tree[i];
            if (item.parent === id) {
                return true;
            }
        }
    };

    const _getTreePath = (tree, id) => {
        let path = [];
        let nextId = id;
        while (true) {
            let item = _findTreeItemById(tree, nextId);
            if (!item) {
                break;
            }
            if (item.parent !== '#') {
                path.push(item.text);
            }
            nextId = item.parent;
        }
        path.push(configModule.prefix);
        return path.reverse();
    };

    const _findFolderId = (tree, sText, urlPartsCopy) => {
        for (let i in tree) {
            const item = tree[i];
            if (item.text === sText) {
                let treePath = _getTreePath(tree, item.id);
                treePath.pop();
                treePath.shift();
                if (JSON.stringify(treePath) === JSON.stringify(urlPartsCopy)) {
                    return item.id;
                }
            }
        }
    };

    const list = async(req, res, next) => {
        let locale = config.i18n.locales[0];
        if (req.session && req.session.currentLocale) {
            locale = req.session.currentLocale;
        }
        // Get and parse URL parts
        const param = req.params[0];
        if (!param.match(/^[a-zA-Z_0-9\-\/]+$/)) {
            return next();
        }
        const urlParts = param.split('/');
        urlParts.forEach(function(fn) {
            if (fn.match(/ /) || fn.match(/^[\^<>\/\:\"\\\|\?\*\x00-\x1f]+$/)) {
                return next();
            }
        });
        urlParts.shift();
        // Load filters
        let filters = app.get('templateFilters');
        renderRoot.setFilters(filters);
        // Load data tree
        const dataTree = await db.collection('registry').findOne({ name: 'warehouseFolders' });
        let folders = [];
        let folder = '1';
        let parent = null;
        if (dataTree && dataTree.data) {
            try {
                let items = [];
                try {
                    items = JSON.parse(dataTree.data);
                } catch (e) {
                    // Ignore
                }
                if (urlParts.length > 0) {
                    let urlPartsCopy = urlParts.slice(0);
                    const sText = urlPartsCopy.pop();
                    let folderFound = _findFolderId(items, sText, urlPartsCopy);
                    folder = folderFound ? folderFound : '1';
                }
                for (let i in items) {
                    const item = items[i];
                    if (item.parent === folder) {
                        const path = _getTreePath(items, folder);
                        path.push(item.text);
                        folders.push({
                            id: item.id,
                            fid: item.text,
                            title: item.data.lang[locale] || '',
                            path: path.join('/')
                        });
                    }
                }
                const parentDataItem = _findTreeItemById(items, folder);
                if (parentDataItem) {
                    const parentData = _findTreeItemById(items, parentDataItem.parent);
                    if (parentData) {
                        const parentPath = _getTreePath(items, parentData.id);
                        parent = {
                            id: parentData.id,
                            fid: parentData.text,
                            title: (parentData.data && parentData.data.lang && parentData.data.lang[locale]) ? parentData.data.lang[locale] : i18n.get().__(locale, 'Catalog'),
                            path: parentPath.join('/')
                        };
                    }
                }
            } catch (e) {
                // OK, there will be no folders
                console.log(e);
            }
        }
        let registerHTML = await renderAuth.file('catalog.html', {
            i18n: i18n.get(),
            locale: locale,
            lang: JSON.stringify(i18n.get().locales[locale]),
            prefix: configModule.prefix,
            config: config,
            folders: folders,
            parent: parent
        });
        let html = await renderRoot.template(req, i18n, locale, i18n.get().__(locale, 'Catalog'), {
            content: registerHTML,
            extraCSS: config.production ? ['/warehouse/static/css/catalog.min.css'] : ['/warehouse/static/css/catalog.css'],
            extraJS: config.production ? ['/warehouse/static/js/catalog.min.js'] : ['/warehouse/static/js/catalog.js']
        });
        res.send(html);
    };

    app.use(configModule.prefix + '/static', app.get('express').static(path.join(__dirname, 'static')));
    let router = Router();
    router.get(/^(.*)?$/, list);
    return {
        routes: router
    };
};